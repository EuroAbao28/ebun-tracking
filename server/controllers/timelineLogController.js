const createError = require('http-errors')
const TimelineLog = require('../models/timelineLogsModel')

const getAllTimelineLogs = async (req, res, next) => {
  try {
    const { status, search, sort, perPage, page = 1, date } = req.query

    const query = {}

    // Status filter
    if (status && status !== '') {
      query.status = status
    }

    // Date filter for specific day - FIXED
    if (date) {
      const targetDate = new Date(date)

      if (isNaN(targetDate.getTime())) {
        return next(createError(400, 'Invalid date format. Use YYYY-MM-DD'))
      }

      // Create separate dates to avoid modification bug
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      // Use 'timestamp' (plural) to match your schema field name
      query.timestamp = {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }

    // Pagination
    const limit = parseInt(perPage) || 40
    const skip = (parseInt(page) - 1) * limit

    // Sorting - FIXED: use 'timestamp' field for Date type sorting
    const sortOptions = {
      oldest: { timestamp: 1 },
      latest: { timestamp: -1 }
    }
    const sortQuery = sortOptions[sort] || sortOptions.latest

    console.log('Sort param:', sort) // Debug
    console.log('Sort query:', sortQuery) // Debug

    // Query database
    const [total, timelineLogs] = await Promise.all([
      TimelineLog.countDocuments(query),
      TimelineLog.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortQuery) // Now sorts by Date field chronologically
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
    ])

    // Search filter (client-side for populated fields)
    let filteredLogs = timelineLogs
    if (search && search !== '') {
      const searchLower = search.toLowerCase()
      filteredLogs = timelineLogs.filter(log => {
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

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      timelineLogs: filteredLogs
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllTimelineLogs
}
