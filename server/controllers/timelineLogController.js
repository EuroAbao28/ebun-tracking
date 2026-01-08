const createError = require('http-errors')
const TimelineLog = require('../models/timelineLogsModel')

const getAllTimelineLogs = async (req, res, next) => {
  try {
    const {
      status,
      search,
      sort,
      perPage,
      page = 1,
      date,
      requestFrom
    } = req.query

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

    // Apply requestFrom filter after population
    if (requestFrom && requestFrom !== '') {
      const isAdminOrHeadAdmin =
        req.user?.role === 'head_admin' || req.user?.role === 'admin'
      if (!(isAdminOrHeadAdmin && requestFrom === 'all')) {
        timelineLogs = timelineLogs.filter(
          log => log.targetDeployment?.requestFrom === requestFrom
        )
      }
    } else if (req.user?.role !== 'head_admin' && req.user?.role !== 'admin') {
      const userCompany = req.user?.company
      if (userCompany) {
        timelineLogs = timelineLogs.filter(
          log => log.targetDeployment?.requestFrom === userCompany
        )
      }
    }

    // Apply search filter
    if (search && search !== '') {
      const searchLower = search.toLowerCase()
      timelineLogs = timelineLogs.filter(log => {
        const action = (log.action || '').toLowerCase()
        const deploymentCode = (
          log.targetDeployment?.deploymentCode || ''
        ).toLowerCase()
        const truckPlate = (
          log.targetDeployment?.truckId?.plateNo ||
          log.targetDeployment?.replacement?.replacementTruckId?.plateNo ||
          ''
        ).toLowerCase()
        const driverFirstname = (
          log.targetDeployment?.driverId?.firstname ||
          log.targetDeployment?.replacement?.replacementDriverId?.firstname ||
          ''
        ).toLowerCase()
        const driverLastname = (
          log.targetDeployment?.driverId?.lastname ||
          log.targetDeployment?.replacement?.replacementDriverId?.lastname ||
          ''
        ).toLowerCase()
        const performedByFirstname = (
          log.performedBy?.firstname || ''
        ).toLowerCase()
        const performedByLastname = (
          log.performedBy?.lastname || ''
        ).toLowerCase()
        const requestFrom = (
          log.targetDeployment?.requestFrom || ''
        ).toLowerCase()

        return (
          action.includes(searchLower) ||
          deploymentCode.includes(searchLower) ||
          truckPlate.includes(searchLower) ||
          driverFirstname.includes(searchLower) ||
          driverLastname.includes(searchLower) ||
          performedByFirstname.includes(searchLower) ||
          performedByLastname.includes(searchLower) ||
          requestFrom.includes(searchLower)
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

    // We'll populate and then filter for requestFrom in memory for count too
    let allLogsForCount = await countQuery.populate({
      path: 'targetDeployment',
      select: 'requestFrom'
    })

    // Apply requestFrom filter to count
    if (requestFrom && requestFrom !== '') {
      const isAdminOrHeadAdmin =
        req.user?.role === 'head_admin' || req.user?.role === 'admin'
      if (!(isAdminOrHeadAdmin && requestFrom === 'all')) {
        allLogsForCount = allLogsForCount.filter(
          log => log.targetDeployment?.requestFrom === requestFrom
        )
      }
    } else if (req.user?.role !== 'head_admin' && req.user?.role !== 'admin') {
      const userCompany = req.user?.company
      if (userCompany) {
        allLogsForCount = allLogsForCount.filter(
          log => log.targetDeployment?.requestFrom === userCompany
        )
      }
    }

    const total = allLogsForCount.length

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
