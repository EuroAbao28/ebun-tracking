const createError = require('http-errors')
const TimelineLog = require('../models/timelineLogsModel')

const getAllTimelineLogs = async (req, res, next) => {
  try {
    const { status, search, sort, perPage, page = 1, date } = req.query

    // Build base query with population
    let baseQuery = TimelineLog.find()

    // Status filter
    if (status && status !== '') {
      baseQuery = baseQuery.where('status').equals(status)
    }

    // Date filter
    if (date) {
      const targetDate = new Date(date)
      if (isNaN(targetDate.getTime())) {
        return next(createError(400, 'Invalid date format. Use YYYY-MM-DD'))
      }
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)
      baseQuery = baseQuery.where('timestamp').gte(startOfDay).lt(endOfDay)
    }

    // Sorting
    const sortOptions = {
      oldest: { timestamp: 1 },
      latest: { timestamp: -1 }
    }
    baseQuery = baseQuery.sort(sortOptions[sort] || sortOptions.latest)

    // Pagination
    const limit = parseInt(perPage) || 40
    const skip = (parseInt(page) - 1) * limit
    baseQuery = baseQuery.skip(skip).limit(limit)

    // Populate with deployment details
    baseQuery = baseQuery
      .populate({
        path: 'performedBy',
        select: '-password'
      })
      .populate({
        path: 'targetDeployment',
        populate: [
          { path: 'truckId' },
          { path: 'driverId' },
          { path: 'replacement.replacementTruckId' },
          { path: 'replacement.replacementDriverId' }
        ]
      })

    // Execute query
    let timelineLogs = await baseQuery

    // Apply search filter
    if (search && search !== '') {
      const searchLower = search.toLowerCase()
      timelineLogs = timelineLogs.filter(log => {
        const deployment = log.targetDeployment

        // Check if replacement exists
        const hasReplacement =
          deployment?.replacement?.replacementTruckId ||
          deployment?.replacement?.replacementDriverId

        // Search truck plate - only replacement if it exists, otherwise original
        const truckPlate =
          hasReplacement && deployment?.replacement?.replacementTruckId?.plateNo
            ? deployment.replacement.replacementTruckId.plateNo.toLowerCase()
            : (deployment?.truckId?.plateNo || '').toLowerCase()

        // Search driver name - only replacement if it exists, otherwise original
        const driverFirstname =
          hasReplacement &&
          deployment?.replacement?.replacementDriverId?.firstname
            ? deployment.replacement.replacementDriverId.firstname.toLowerCase()
            : (deployment?.driverId?.firstname || '').toLowerCase()

        const driverLastname =
          hasReplacement &&
          deployment?.replacement?.replacementDriverId?.lastname
            ? deployment.replacement.replacementDriverId.lastname.toLowerCase()
            : (deployment?.driverId?.lastname || '').toLowerCase()

        const action = (log.action || '').toLowerCase()
        const deploymentCode = (deployment?.deploymentCode || '').toLowerCase()
        const performedByFirstname = (
          log.performedBy?.firstname || ''
        ).toLowerCase()
        const performedByLastname = (
          log.performedBy?.lastname || ''
        ).toLowerCase()

        return (
          action.includes(searchLower) ||
          deploymentCode.includes(searchLower) ||
          truckPlate.includes(searchLower) ||
          driverFirstname.includes(searchLower) ||
          driverLastname.includes(searchLower) ||
          performedByFirstname.includes(searchLower) ||
          performedByLastname.includes(searchLower)
        )
      })
    }

    // Get total count (we need to query again for accurate count with filters)
    let countQuery = TimelineLog.find()

    // Apply same filters as above to count query
    if (status && status !== '') {
      countQuery = countQuery.where('status').equals(status)
    }

    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)
      countQuery = countQuery.where('timestamp').gte(startOfDay).lt(endOfDay)
    }

    const total = await countQuery.countDocuments()

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      timelineLogs
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllTimelineLogs
}
