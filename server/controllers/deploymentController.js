const createError = require('http-errors')
const { validateFields } = require('../utils/validationFields')
const Deployment = require('../models/deploymentModel')
const Truck = require('../models/truckModel')
const Driver = require('../models/driverModel')
const ActivityLog = require('../models/activityLogsModel')
const TimelineLog = require('../models/timelineLogsModel')
const { DateTime } = require('luxon')

// Create deployment
const createDeployment = async (req, res, next) => {
  try {
    const {
      truckId,
      driverId,
      truckType,
      helperCount,
      pickupSite,
      destination,
      sacksCount,
      loadWeightKg,
      departed,
      pickupIn,
      pickupOut,
      destArrival,
      destDeparture
    } = req.body

    // Check permissions
    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Validate fields
    validateFields({
      truckId,
      driverId,
      truckType,
      helperCount,
      pickupSite,
      destination
    })

    // Check if truck exists and available
    const truck = await Truck.findById(truckId)
    if (!truck) {
      return next(createError(404, 'Truck not found'))
    }
    if (truck.status === 'deployed') {
      return next(createError(400, 'Truck is already deployed'))
    }

    // Create deployment
    const newDeployment = await Deployment.create({
      truckId,
      driverId,
      truckType,
      helperCount,
      pickupSite,
      destination,
      sacksCount: sacksCount || 0,
      loadWeightKg: loadWeightKg || 0,
      departed: departed || '',
      pickupIn: pickupIn || '',
      pickupOut: pickupOut || '',
      destArrival: destArrival || '',
      destDeparture: destDeparture || '',
      isSoftDeleted: false
    })

    // Update truck and driver status
    await Promise.all([
      Truck.findByIdAndUpdate(truckId, { status: 'deployed' }),
      Driver.findByIdAndUpdate(driverId, { status: 'deployed' })
    ])

    // Determine initial status
    const initialStatus = departed ? 'ongoing' : 'preparing'
    const now = DateTime.now().setZone('Asia/Manila').toISO()

    // Create timeline logs
    const timelinePromises = [
      TimelineLog.create({
        performedBy: req.user._id,
        action: 'Truck assigned for deployment',
        status: initialStatus,
        timestamp: now,
        targetDeployment: newDeployment._id
      })
    ]

    await Promise.all(timelinePromises)

    // Create activity log
    await ActivityLog.create({
      type: 'deployment',
      performedBy: req.user._id,
      action: `${
        newDeployment.deploymentCode
      }: Assigned ${truck.plateNo.toUpperCase()} to deployment`,
      targetDeployment: newDeployment._id
    })

    // Populate and return
    const populatedDeployment = await Deployment.findById(newDeployment._id)
      .populate('truckId')
      .populate('driverId')

    res.status(201).json({
      message: 'Deployment created successfully',
      deployment: populatedDeployment
    })
  } catch (error) {
    next(error)
  }
}

// Get all deployments
const getAllDeployments = async (req, res, next) => {
  try {
    const {
      status,
      search,
      sort = 'latest',
      assignedAt,
      departedAt,
      perPage = 100,
      page = 1,
      includeDeleted = false
    } = req.query

    console.log(req.query)

    // Build base query
    let baseQuery = Deployment.find()

    if (includeDeleted !== 'true') {
      baseQuery = baseQuery.where('isSoftDeleted').ne(true)
    }

    // Status filter
    if (status && status !== '') {
      baseQuery = baseQuery.where('status').equals(status)
    }

    // assignedAt filter (filters by createdAt date)
    if (assignedAt) {
      const targetDate = new Date(assignedAt)

      if (isNaN(targetDate.getTime())) {
        return next(
          createError(400, 'Invalid assignedAt date format. Use YYYY-MM-DD')
        )
      }

      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      baseQuery = baseQuery.where('createdAt').gte(startOfDay).lt(endOfDay)
    }

    // departedAt filter (filters by departed timestamp)
    if (departedAt) {
      const targetDate = new Date(departedAt)

      if (isNaN(targetDate.getTime())) {
        return next(
          createError(400, 'Invalid departedAt date format. Use YYYY-MM-DD')
        )
      }

      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      baseQuery = baseQuery
        .where('departed')
        .gte(startOfDay.toISOString())
        .lt(endOfDay.toISOString())
    }

    // Sorting
    const sortOptions = {
      oldest: { createdAt: 1 },
      latest: { createdAt: -1 }
    }
    baseQuery = baseQuery.sort(sortOptions[sort] || sortOptions.latest)

    // Pagination
    const limit = parseInt(perPage)
    const skip = (parseInt(page) - 1) * limit
    baseQuery = baseQuery.skip(skip).limit(limit)

    // Populate
    baseQuery = baseQuery.populate([
      {
        path: 'truckId',
        select: 'plateNo truckType condition status imageUrl'
      },
      { path: 'driverId', select: 'firstname lastname licenseNo contact' },
      {
        path: 'replacement.replacementTruckId',
        select: 'plateNo truckType condition status imageUrl'
      },
      {
        path: 'replacement.replacementDriverId',
        select: 'firstname lastname licenseNo contact'
      }
    ])

    // Execute query
    let deployments = await baseQuery

    // Client-side search filter
    if (search && search !== '') {
      const searchLower = search.toLowerCase()
      deployments = deployments.filter(deployment => {
        const activeTruckPlate = (
          deployment.replacement?.replacementTruckId?.plateNo ||
          deployment.truckId?.plateNo ||
          ''
        ).toLowerCase()
        const activeDriverFirstname = (
          deployment.replacement?.replacementDriverId?.firstname ||
          deployment.driverId?.firstname ||
          ''
        ).toLowerCase()
        const activeDriverLastname = (
          deployment.replacement?.replacementDriverId?.lastname ||
          deployment.driverId?.lastname ||
          ''
        ).toLowerCase()
        const destination = (deployment.destination || '').toLowerCase()
        const pickupSite = (deployment.pickupSite || '').toLowerCase()
        const truckType = (deployment.truckType || '').toLowerCase()
        const deploymentCode = (deployment.deploymentCode || '').toLowerCase()

        return (
          activeTruckPlate.includes(searchLower) ||
          activeDriverFirstname.includes(searchLower) ||
          activeDriverLastname.includes(searchLower) ||
          destination.includes(searchLower) ||
          pickupSite.includes(searchLower) ||
          truckType.includes(searchLower) ||
          deploymentCode.includes(searchLower)
        )
      })
    }

    // Get total count (should match the filters)
    let totalQuery = Deployment.find()

    if (includeDeleted !== 'true') {
      totalQuery = totalQuery.where('isSoftDeleted').ne(true)
    }

    if (status && status !== '') {
      totalQuery = totalQuery.where('status').equals(status)
    }

    if (assignedAt) {
      const targetDate = new Date(assignedAt)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)
      totalQuery = totalQuery.where('createdAt').gte(startOfDay).lt(endOfDay)
    }
    if (departedAt) {
      const targetDate = new Date(departedAt)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)
      totalQuery = totalQuery
        .where('departed')
        .gte(startOfDay.toISOString())
        .lt(endOfDay.toISOString())
    }
    const total = await totalQuery.countDocuments()

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      deployments
    })
  } catch (error) {
    next(error)
  }
}

// Update deployment
const updateDeployment = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      truckId,
      driverId,
      truckType,
      helperCount,
      pickupSite,
      destination,
      sacksCount,
      loadWeightKg,
      status,
      departed,
      pickupIn,
      pickupOut,
      destArrival,
      destDeparture,
      replacement
    } = req.body

    // Check permissions
    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Find deployment
    const existingDeployment = await Deployment.findOne({
      _id: id,
      isSoftDeleted: { $ne: true }
    })

    if (!existingDeployment) {
      return next(createError(404, 'Deployment not found'))
    }

    // Get deployment code for logging
    const deploymentCode = existingDeployment.deploymentCode

    // Extract IDs
    const extractedTruckId = truckId?._id || truckId
    const extractedDriverId = driverId?._id || driverId

    // Store original values
    const originalValues = {
      truckId: existingDeployment.truckId?.toString(),
      driverId: existingDeployment.driverId?.toString(),
      truckType: existingDeployment.truckType,
      helperCount: existingDeployment.helperCount,
      pickupSite: existingDeployment.pickupSite,
      destination: existingDeployment.destination,
      sacksCount: existingDeployment.sacksCount,
      loadWeightKg: existingDeployment.loadWeightKg,
      status: existingDeployment.status,
      departed: existingDeployment.departed,
      pickupIn: existingDeployment.pickupIn,
      pickupOut: existingDeployment.pickupOut,
      destArrival: existingDeployment.destArrival,
      destDeparture: existingDeployment.destDeparture
    }

    const originalStatus = existingDeployment.status
    const hasExistingReplacement =
      existingDeployment.replacement?.replacementTruckId
    const hasExistingDriverReplacement =
      existingDeployment.replacement?.replacementDriverId

    // Determine active resources
    const activeTruckId = hasExistingReplacement || existingDeployment.truckId
    const activeDriverId =
      hasExistingDriverReplacement || existingDeployment.driverId

    // Track replacements
    let performedReplacement = false
    let performedDriverReplacement = false
    let replacementTruckDetails = null
    let replacementDriverDetails = null

    // Handle truck replacement
    if (replacement?.replacementTruckId) {
      const replacementTruckId =
        replacement.replacementTruckId._id || replacement.replacementTruckId
      const isNewReplacement =
        !hasExistingReplacement ||
        hasExistingReplacement.toString() !== replacementTruckId.toString()

      if (isNewReplacement) {
        performedReplacement = true

        // Get truck details for logging
        const [newTruck, oldTruck] = await Promise.all([
          Truck.findById(replacementTruckId),
          Truck.findById(existingDeployment.truckId)
        ])

        replacementTruckDetails = {
          oldPlateNo: oldTruck?.plateNo || 'Unknown',
          newPlateNo: newTruck?.plateNo || 'Unknown'
        }

        await Promise.all([
          Truck.findByIdAndUpdate(replacementTruckId, { status: 'deployed' }),
          Truck.findByIdAndUpdate(existingDeployment.truckId, {
            status: 'available'
          })
        ])
      }

      existingDeployment.replacement = {
        replacementTruckId,
        replacementDriverId:
          replacement.replacementDriverId?._id ||
          replacement.replacementDriverId,
        replacementTruckType: replacement.replacementTruckType,
        replacementHelperCount: replacement.replacementHelperCount,
        replacedAt: replacement.replacedAt,
        reason: replacement.reason,
        remarks: replacement.remarks
      }
    }

    // Handle driver replacement
    if (replacement?.replacementDriverId) {
      const replacementDriverId =
        replacement.replacementDriverId._id || replacement.replacementDriverId
      const isNewDriverReplacement =
        !hasExistingDriverReplacement ||
        hasExistingDriverReplacement.toString() !==
          replacementDriverId.toString()

      if (isNewDriverReplacement) {
        performedDriverReplacement = true

        // Get driver details for logging
        const [newDriver, oldDriver] = await Promise.all([
          Driver.findById(replacementDriverId),
          existingDeployment.driverId
            ? Driver.findById(existingDeployment.driverId)
            : null
        ])

        replacementDriverDetails = {
          oldDriverName: oldDriver
            ? `${oldDriver.firstname} ${oldDriver.lastname}`
            : 'Unknown',
          newDriverName: newDriver
            ? `${newDriver.firstname} ${newDriver.lastname}`
            : 'Unknown'
        }

        const updates = [
          Driver.findByIdAndUpdate(replacementDriverId, { status: 'deployed' })
        ]
        if (existingDeployment.driverId) {
          updates.push(
            Driver.findByIdAndUpdate(existingDeployment.driverId, {
              status: 'available'
            })
          )
        }
        await Promise.all(updates)
      }
    }

    // Determine final status
    const isDepartedSet =
      departed !== undefined && departed !== '' && departed !== null
    const isDestDepartureSet =
      destDeparture !== undefined &&
      destDeparture !== '' &&
      destDeparture !== null

    let finalStatus = status || existingDeployment.status
    if (isDepartedSet && !isDestDepartureSet && finalStatus !== 'canceled') {
      finalStatus = 'ongoing'
    } else if (isDestDepartureSet && finalStatus !== 'canceled') {
      finalStatus = 'completed'
    }

    // Handle status-based resource updates
    const statusUpdates = []
    if (
      finalStatus === 'canceled' ||
      (isDestDepartureSet && finalStatus === 'completed')
    ) {
      if (activeTruckId)
        statusUpdates.push(
          Truck.findByIdAndUpdate(activeTruckId, { status: 'available' })
        )
      if (activeDriverId)
        statusUpdates.push(
          Driver.findByIdAndUpdate(activeDriverId, { status: 'available' })
        )
    } else if (finalStatus === 'ongoing' || finalStatus === 'preparing') {
      if (
        activeTruckId &&
        (!hasExistingReplacement ||
          activeTruckId.toString() !== originalValues.truckId)
      ) {
        statusUpdates.push(
          Truck.findByIdAndUpdate(activeTruckId, { status: 'deployed' })
        )
      }
      if (
        activeDriverId &&
        (!hasExistingDriverReplacement ||
          activeDriverId.toString() !== originalValues.driverId)
      ) {
        statusUpdates.push(
          Driver.findByIdAndUpdate(activeDriverId, { status: 'deployed' })
        )
      }
    }
    await Promise.all(statusUpdates)

    // Handle truck change
    if (
      extractedTruckId &&
      extractedTruckId.toString() !== originalValues.truckId &&
      !hasExistingReplacement
    ) {
      const updates = []
      if (originalValues.truckId) {
        updates.push(
          Truck.findByIdAndUpdate(originalValues.truckId, {
            status: 'available'
          })
        )
      }
      if (finalStatus !== 'canceled' && finalStatus !== 'completed') {
        updates.push(
          Truck.findByIdAndUpdate(extractedTruckId, { status: 'deployed' })
        )
      }
      await Promise.all(updates)
    }

    // Handle driver change
    if (
      extractedDriverId &&
      extractedDriverId.toString() !== originalValues.driverId &&
      !hasExistingDriverReplacement
    ) {
      const updates = []
      if (originalValues.driverId) {
        updates.push(
          Driver.findByIdAndUpdate(originalValues.driverId, {
            status: 'available'
          })
        )
      }
      if (finalStatus !== 'canceled' && finalStatus !== 'completed') {
        updates.push(
          Driver.findByIdAndUpdate(extractedDriverId, { status: 'deployed' })
        )
      }
      await Promise.all(updates)
    }

    // Increment driver tripCount on completion
    if (
      finalStatus === 'completed' &&
      originalStatus !== 'completed' &&
      activeDriverId
    ) {
      try {
        await Driver.findByIdAndUpdate(activeDriverId, {
          $inc: { tripCount: 1 }
        })
      } catch (error) {
        console.error('Error incrementing driver tripCount:', error)
      }
    }

    // Update deployment fields
    const updateObj = {
      truckId: extractedTruckId || existingDeployment.truckId,
      driverId: extractedDriverId || existingDeployment.driverId,
      truckType: truckType || existingDeployment.truckType,
      helperCount:
        helperCount !== undefined
          ? helperCount
          : existingDeployment.helperCount,
      pickupSite: pickupSite || existingDeployment.pickupSite,
      destination: destination || existingDeployment.destination,
      sacksCount:
        sacksCount !== undefined ? sacksCount : existingDeployment.sacksCount,
      loadWeightKg:
        loadWeightKg !== undefined
          ? loadWeightKg
          : existingDeployment.loadWeightKg,
      status:
        finalStatus !== undefined ? finalStatus : existingDeployment.status,
      departed: departed !== undefined ? departed : existingDeployment.departed,
      pickupIn: pickupIn !== undefined ? pickupIn : existingDeployment.pickupIn,
      pickupOut:
        pickupOut !== undefined ? pickupOut : existingDeployment.pickupOut,
      destArrival:
        destArrival !== undefined
          ? destArrival
          : existingDeployment.destArrival,
      destDeparture:
        destDeparture !== undefined
          ? destDeparture
          : existingDeployment.destDeparture
    }

    Object.assign(existingDeployment, updateObj)
    await existingDeployment.save()

    // Create logs
    const timelineLogs = []
    const activityLogs = []

    // Helper to create or update timeline log
    const createOrUpdateTimelineLog = async (
      actionType,
      newTimestamp,
      logStatus
    ) => {
      // Action types mapping
      const actionMap = {
        departed: 'Departed from station',
        pickupIn: 'Arrived at pickup location',
        pickupOut: 'Departed from pickup location',
        destArrival: 'Arrived at destination',
        destDeparture: 'Departed from destination',
        canceled: 'Deployment has been canceled'
      }

      const action = actionMap[actionType]

      // Validate action exists
      if (!action) {
        console.error(`Invalid action type: ${actionType}`)
        return
      }

      // Try to find existing timeline log for this action type
      const existingLog = await TimelineLog.findOne({
        targetDeployment: existingDeployment._id,
        action: { $regex: `^${action}` } // Match action starting with the text
      }).sort({ timestamp: -1 }) // Get the most recent one

      if (existingLog) {
        // Update existing log with new timestamp
        existingLog.timestamp = newTimestamp
        existingLog.status = logStatus
        await existingLog.save()
        timelineLogs.push(`${action} (updated)`)
      } else {
        // Create new log if none exists
        await TimelineLog.create({
          performedBy: req.user._id,
          action,
          status: logStatus,
          timestamp: newTimestamp,
          targetDeployment: existingDeployment._id
        })
        timelineLogs.push(action)
      }
    }

    // Helper to create activity log (with deploymentCode)
    const createActivityLog = async action => {
      await ActivityLog.create({
        type: 'deployment',
        performedBy: req.user._id,
        action: `${deploymentCode}: ${action}`,
        targetDeployment: existingDeployment._id
      })
      activityLogs.push(action)
    }

    // Status change logs
    const now = DateTime.now().setZone('Asia/Manila').toISO()

    if (finalStatus === 'canceled' && originalStatus !== 'canceled') {
      await createOrUpdateTimelineLog('canceled', now, 'canceled')
      // await createActivityLog('Deployment has been canceled')
    }

    if (originalStatus === 'canceled' && finalStatus !== 'canceled') {
      const statusMap = {
        preparing: 'preparing',
        ongoing: 'ongoing',
        completed: 'completed'
      }
      // Create a new log for resume (not updating)
      await TimelineLog.create({
        performedBy: req.user._id,
        action: `Deployment resumed as ${
          statusMap[finalStatus] || finalStatus
        }`,
        status: finalStatus,
        timestamp: now,
        targetDeployment: existingDeployment._id
      })
      timelineLogs.push('Deployment resumed')
    }

    // ✅ FIXED: Only create/update timeline logs if the field didn't have a value before
    // This prevents creating logs when updating existing timestamps
    if (
      departed !== undefined &&
      departed !== originalValues.departed &&
      departed &&
      !originalValues.departed && // ✅ Only if it was empty before
      finalStatus !== 'canceled'
    ) {
      await createOrUpdateTimelineLog(
        'departed',
        departed,
        finalStatus || 'ongoing'
      )
      await createActivityLog('Departed from station')
    }

    if (
      pickupIn !== undefined &&
      pickupIn !== originalValues.pickupIn &&
      pickupIn &&
      !originalValues.pickupIn && // ✅ Only if it was empty before
      finalStatus !== 'canceled'
    ) {
      await createOrUpdateTimelineLog(
        'pickupIn',
        pickupIn,
        finalStatus || 'ongoing'
      )
      await createActivityLog('Arrived at pickup location')
    }

    if (
      pickupOut !== undefined &&
      pickupOut !== originalValues.pickupOut &&
      pickupOut &&
      !originalValues.pickupOut && // ✅ Only if it was empty before
      finalStatus !== 'canceled'
    ) {
      await createOrUpdateTimelineLog(
        'pickupOut',
        pickupOut,
        finalStatus || 'ongoing'
      )
      await createActivityLog('Departed from pickup location')
    }

    if (
      destArrival !== undefined &&
      destArrival !== originalValues.destArrival &&
      destArrival &&
      !originalValues.destArrival && // ✅ Only if it was empty before
      finalStatus !== 'canceled'
    ) {
      await createOrUpdateTimelineLog(
        'destArrival',
        destArrival,
        finalStatus || 'ongoing'
      )
      await createActivityLog('Arrived at destination')
    }

    if (
      destDeparture !== undefined &&
      destDeparture !== originalValues.destDeparture &&
      destDeparture &&
      !originalValues.destDeparture && // ✅ Only if it was empty before
      finalStatus !== 'canceled'
    ) {
      await createOrUpdateTimelineLog(
        'destDeparture',
        destDeparture,
        'completed'
      )
      await createActivityLog('Departed from destination')
    }

    // Activity logs for truck replacement
    if (performedReplacement && replacementTruckDetails) {
      await createActivityLog(
        `Truck replaced from ${replacementTruckDetails.oldPlateNo} to ${replacementTruckDetails.newPlateNo}`
      )
    }

    // Activity logs for driver replacement
    if (performedDriverReplacement && replacementDriverDetails) {
      await createActivityLog(
        `Driver replaced from ${replacementDriverDetails.oldDriverName} to ${replacementDriverDetails.newDriverName}`
      )
    }

    // Activity logs for field changes (non-replacement truck/driver changes)
    if (
      extractedTruckId !== undefined &&
      extractedTruckId.toString() !== originalValues.truckId &&
      !performedReplacement
    ) {
      const newTruck = await Truck.findById(extractedTruckId)
      await createActivityLog(
        `Truck changed to ${newTruck?.plateNo || 'Unknown'}`
      )
    }

    if (
      extractedDriverId !== undefined &&
      extractedDriverId.toString() !== originalValues.driverId &&
      !performedDriverReplacement
    ) {
      const newDriver = await Driver.findById(extractedDriverId)
      const name = newDriver
        ? `${newDriver.firstname} ${newDriver.lastname}`
        : 'Unknown'
      await createActivityLog(`Driver changed to ${name}`)
    }

    // Activity logs for other field changes
    if (truckType !== undefined && truckType !== originalValues.truckType) {
      await createActivityLog(`Truck type changed to ${truckType}`)
    }

    if (
      helperCount !== undefined &&
      helperCount !== originalValues.helperCount
    ) {
      await createActivityLog(`Helper count changed to ${helperCount}`)
    }

    if (pickupSite !== undefined && pickupSite !== originalValues.pickupSite) {
      await createActivityLog(`Pickup site changed to ${pickupSite}`)
    }

    if (
      destination !== undefined &&
      destination !== originalValues.destination
    ) {
      await createActivityLog(`Destination changed to ${destination}`)
    }

    if (sacksCount !== undefined && sacksCount !== originalValues.sacksCount) {
      await createActivityLog(`Sacks count changed to ${sacksCount}`)
    }

    if (
      loadWeightKg !== undefined &&
      loadWeightKg !== originalValues.loadWeightKg
    ) {
      await createActivityLog(`Load weight changed to ${loadWeightKg} kg`)
    }

    if (finalStatus !== undefined && finalStatus !== originalStatus) {
      await createActivityLog(`Status changed to ${finalStatus}`)
    }

    // Populate and return
    const populatedDeployment = await Deployment.findById(id)
      .populate('truckId')
      .populate('driverId')
      .populate('replacement.replacementTruckId')
      .populate('replacement.replacementDriverId')

    res.status(200).json({
      message: 'Deployment updated successfully',
      deployment: populatedDeployment,
      timelineUpdates: timelineLogs.length > 0 ? timelineLogs : undefined
    })
  } catch (error) {
    next(error)
  }
}

// delete deployment
const softDeleteDeployment = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check permissions
    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Find deployment - exclude already soft deleted
    const deployment = await Deployment.findOne({
      _id: id,
      isSoftDeleted: { $ne: true }
    })

    if (!deployment) {
      return next(createError(404, 'Deployment not found'))
    }

    // Determine active resources
    const activeTruckId =
      deployment.replacement?.replacementTruckId || deployment.truckId
    const activeDriverId =
      deployment.replacement?.replacementDriverId || deployment.driverId

    const updates = []
    if (activeTruckId) {
      updates.push(
        Truck.findByIdAndUpdate(activeTruckId, { status: 'available' })
      )
    }
    if (activeDriverId) {
      updates.push(
        Driver.findByIdAndUpdate(activeDriverId, { status: 'available' })
      )
    }
    await Promise.all(updates)

    // Soft delete the deployment
    deployment.isSoftDeleted = true
    await deployment.save()

    // Create activity log
    await ActivityLog.create({
      type: 'deployment',
      performedBy: req.user._id,
      action: `${deployment.deploymentCode}: Deployment deleted`,
      targetDeployment: deployment._id
    })

    res.status(200).json({
      message: 'Deployment deleted successfully',
      deploymentCode: deployment.deploymentCode
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createDeployment,
  getAllDeployments,
  updateDeployment,
  softDeleteDeployment
}
