const createError = require('http-errors')
const ActivityLog = require('../models/activityLogsModel')

const getAllActivityLogs = async (req, res, next) => {
  try {
    const { type, sort, perPage, page = 1, date } = req.query

    const query = {}

    // filters
    if (type) query.type = type

    // Date filter for specific day (alternative using $expr)
    if (date) {
      const targetDate = new Date(date)

      if (isNaN(targetDate.getTime())) {
        return next(createError(400, 'Invalid date format. Use YYYY-MM-DD'))
      }

      query.$expr = {
        $and: [
          { $eq: [{ $year: '$createdAt' }, targetDate.getFullYear()] },
          { $eq: [{ $month: '$createdAt' }, targetDate.getMonth() + 1] },
          { $eq: [{ $dayOfMonth: '$createdAt' }, targetDate.getDate()] }
        ]
      }
    }

    // pagination
    const limit = parseInt(perPage)
    const skip = (parseInt(page) - 1) * limit

    // sorting
    const sortOptions = {
      oldest: { createdAt: 1 },
      latest: { createdAt: -1 }
    }
    const sortQuery = sortOptions[sort] || sortOptions.latest

    // query database
    const [total, activityLogs] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortQuery)
        .populate({
          path: 'performedBy',
          select: '-password'
        })
        .populate('targetDeployment')
        .populate('targetDriver')
        .populate('targetTruck')
        .populate('targetUser')
    ])

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      activityLogs
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllActivityLogs
}
