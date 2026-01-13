const Truck = require('../models/truckModel')
const Driver = require('../models/driverModel')
const Deployment = require('../models/deploymentModel')

const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Determine if we need to filter by company
    const user = req.user
    let companyFilter = {}

    if (user?.role === 'visitor' && user?.company) {
      // For visitors, only show data from their company
      companyFilter = { requestFrom: user.company }
    }
    // For head_admin and admin, no company filter (show all data)

    // Common filter to exclude soft-deleted records and apply company filter
    const baseFilter = {
      isSoftDeleted: { $ne: true },
      ...companyFilter
    }

    // For Truck and Driver models, we need to handle differently since they don't have requestFrom field
    // Assuming trucks and drivers are shared across companies, we'll use company-specific filters
    // If trucks/drivers are company-specific, you'll need to add company field to those schemas
    const truckAndDriverFilter = { isSoftDeleted: { $ne: true } }

    const [
      // Basic counts
      totalTrucks,
      totalDrivers,
      activeDeployments,
      availableTrucks,
      availableDrivers,

      // Status counts
      trucksInMaintenance,
      trucksUnderMaintenance,
      inactiveDrivers,
      completedDeployments,
      cancelledDeployments,

      // Recent deployments
      recentDeployments,
      deploymentsLast7Days,
      deploymentsLast30Days,

      // Truck analytics
      truckStatusAnalytics,
      truckTypeAnalytics,
      truckConditionAnalytics,

      // Driver analytics
      driverStatusAnalytics,
      topDriversByTrips,

      // Deployment analytics
      deploymentStatusAnalytics,
      monthlyDeploymentAnalytics,
      monthlySacksAnalytics,
      monthlyWeightAnalytics,
      topDestinations,

      // Additional deployment status counts
      pendingDeployments,
      preparingDeployments
    ] = await Promise.all([
      // Basic counts - exclude soft-deleted
      Truck.countDocuments(truckAndDriverFilter),
      Driver.countDocuments(truckAndDriverFilter),
      Deployment.countDocuments({
        ...baseFilter,
        status: { $in: ['ongoing', 'in-progress'] }
      }),
      Truck.countDocuments({ ...truckAndDriverFilter, status: 'available' }),
      Driver.countDocuments({ ...truckAndDriverFilter, status: 'available' }),

      // Status counts - exclude soft-deleted
      Truck.countDocuments({ ...truckAndDriverFilter, status: 'unavailable' }),
      Truck.countDocuments({ ...truckAndDriverFilter, status: 'unavailable' }),
      Driver.countDocuments({ ...truckAndDriverFilter, status: 'unavailable' }),
      Deployment.countDocuments({ ...baseFilter, status: 'completed' }),
      Deployment.countDocuments({ ...baseFilter, status: 'canceled' }),

      // Recent deployments - exclude soft-deleted
      Deployment.countDocuments({
        ...baseFilter,
        createdAt: { $gte: last7Days }
      }),
      Deployment.countDocuments({
        ...baseFilter,
        createdAt: { $gte: last7Days }
      }),
      Deployment.countDocuments({
        ...baseFilter,
        createdAt: { $gte: last30Days }
      }),

      // Truck Status Distribution - exclude soft-deleted
      Truck.aggregate([
        { $match: truckAndDriverFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Truck Type Distribution - exclude soft-deleted
      Truck.aggregate([
        { $match: truckAndDriverFilter },
        { $group: { _id: '$truckType', count: { $sum: 1 } } }
      ]),

      // Truck Condition Analysis - exclude soft-deleted
      Truck.aggregate([
        { $match: truckAndDriverFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Driver Status Distribution - exclude soft-deleted
      Driver.aggregate([
        { $match: truckAndDriverFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Top Drivers by Trip Count - exclude soft-deleted
      Driver.aggregate([
        { $match: truckAndDriverFilter },
        { $sort: { tripCount: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: { $concat: ['$firstname', ' ', '$lastname'] },
            tripCount: 1,
            status: 1,
            imageUrl: 1,
            phoneNo: 1
          }
        }
      ]),

      // Deployment Status Analysis - exclude soft-deleted
      Deployment.aggregate([
        {
          $match: {
            ...baseFilter,
            status: {
              $in: [
                'completed',
                'ongoing',
                'in-progress',
                'pending',
                'canceled',
                'preparing'
              ]
            }
          }
        },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Monthly Deployment Trends - exclude soft-deleted
      Deployment.aggregate([
        {
          $match: {
            ...baseFilter,
            status: { $in: ['completed', 'canceled'] }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Monthly Sacks Analytics - exclude soft-deleted and canceled
      Deployment.aggregate([
        {
          $match: {
            ...baseFilter,
            status: { $ne: 'canceled' }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalSacks: { $sum: '$sacksCount' },
            deploymentCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Monthly Weight Analytics - exclude soft-deleted and canceled
      Deployment.aggregate([
        {
          $match: {
            ...baseFilter,
            status: { $ne: 'canceled' }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalWeight: { $sum: '$loadWeightKg' },
            deploymentCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Top Destinations - exclude soft-deleted
      Deployment.aggregate([
        {
          $match: {
            ...baseFilter,
            destination: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$destination',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Additional deployment status counts - exclude soft-deleted
      Deployment.countDocuments({ ...baseFilter, status: 'pending' }),
      Deployment.countDocuments({ ...baseFilter, status: 'preparing' })
    ])

    // Calculate additional metrics - exclude soft-deleted
    const totalDeployments = await Deployment.countDocuments(baseFilter)
    const completionRate =
      totalDeployments > 0
        ? ((completedDeployments / totalDeployments) * 100).toFixed(1)
        : 0

    const cancellationRate =
      totalDeployments > 0
        ? ((cancelledDeployments / totalDeployments) * 100).toFixed(1)
        : 0

    // Calculate active trucks (available + deployed) - exclude soft-deleted
    const activeTrucks = await Truck.countDocuments({
      ...truckAndDriverFilter,
      status: { $in: ['available', 'deployed'] }
    })

    // Calculate success rate (only count finalized deployments)
    const finalizedDeployments = completedDeployments + cancelledDeployments
    const successRate =
      finalizedDeployments > 0
        ? ((completedDeployments / finalizedDeployments) * 100).toFixed(1)
        : 0

    // Calculate total sacks and weight - exclude soft-deleted and canceled
    const totalSacksResult = await Deployment.aggregate([
      {
        $match: {
          ...baseFilter,
          status: { $ne: 'canceled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSacks: { $sum: '$sacksCount' },
          totalWeight: { $sum: '$loadWeightKg' }
        }
      }
    ])

    const totalSacks = totalSacksResult[0]?.totalSacks || 0
    const totalWeight = totalSacksResult[0]?.totalWeight || 0

    // Safe data formatting with fallbacks
    const formatArrayData = (array, fallback = []) => {
      return Array.isArray(array) && array.length > 0 ? array : fallback
    }

    // Monthly trends - Process completed vs canceled data
    const monthlyTrendsData = formatArrayData(monthlyDeploymentAnalytics)
    const monthlySacksData = formatArrayData(monthlySacksAnalytics)
    const monthlyWeightData = formatArrayData(monthlyWeightAnalytics)

    // Format deployment status with proper labels and ordering
    const deploymentStatusData = formatArrayData(deploymentStatusAnalytics)
    const deploymentStatusMap = {
      completed: 'Completed',
      ongoing: 'Ongoing',
      'in-progress': 'In Progress',
      pending: 'Pending',
      canceled: 'Cancelled',
      preparing: 'Preparing'
    }

    // Calculate ongoing deployments (includes ongoing, in-progress, and preparing)
    const totalOngoingDeployments = activeDeployments + preparingDeployments

    // Process monthly deployment data for completed vs canceled comparison
    const processMonthlyDeploymentData = data => {
      const monthlyData = {}

      data.forEach(item => {
        const monthKey = `${item._id.year}-${item._id.month}`
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            year: item._id.year,
            month: item._id.month,
            completed: 0,
            canceled: 0
          }
        }

        if (item._id.status === 'completed') {
          monthlyData[monthKey].completed = item.count || 0
        } else if (item._id.status === 'canceled') {
          monthlyData[monthKey].canceled = item.count || 0
        }
      })

      return Object.values(monthlyData).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
    }

    const processedMonthlyDeployments =
      processMonthlyDeploymentData(monthlyTrendsData)

    // Format the analytics data for frontend
    const analyticsData = {
      overview: {
        totalTrucks: totalTrucks || 0,
        totalDrivers: totalDrivers || 0,
        activeDeployments: totalOngoingDeployments || 0,
        availableTrucks: availableTrucks || 0,
        availableDrivers: availableDrivers || 0,
        trucksInMaintenance: trucksInMaintenance || 0,
        trucksUnderMaintenance: trucksUnderMaintenance || 0,
        inactiveDrivers: inactiveDrivers || 0,
        completedDeployments: completedDeployments || 0,
        cancelledDeployments: cancelledDeployments || 0,
        pendingDeployments: pendingDeployments || 0,
        preparingDeployments: preparingDeployments || 0,
        recentDeployments: recentDeployments || 0,
        deploymentsLast7Days: deploymentsLast7Days || 0,
        deploymentsLast30Days: deploymentsLast30Days || 0,
        totalSacks: totalSacks || 0,
        totalWeight: totalWeight || 0,
        utilizationRate:
          availableTrucks > 0
            ? ((totalOngoingDeployments / availableTrucks) * 100).toFixed(1)
            : 0,
        completionRate,
        cancellationRate,
        successRate: parseFloat(successRate)
      },

      charts: {
        // Line chart - Monthly deployments (completed vs canceled)
        monthlyDeployments: {
          labels: processedMonthlyDeployments.map(
            item =>
              `${new Date(item.year, item.month - 1).toLocaleString('default', {
                month: 'short'
              })} ${item.year}`
          ),
          completedData: processedMonthlyDeployments.map(
            item => item.completed || 0
          ),
          canceledData: processedMonthlyDeployments.map(
            item => item.canceled || 0
          )
        },

        // Line chart - Monthly sacks (excluding canceled)
        monthlySacks: {
          labels: monthlySacksData.map(
            item =>
              `${new Date(item._id.year, item._id.month - 1).toLocaleString(
                'default',
                { month: 'short' }
              )} ${item._id.year}`
          ),
          data: monthlySacksData.map(item => item.totalSacks || 0),
          deploymentCounts: monthlySacksData.map(
            item => item.deploymentCount || 0
          )
        },

        // Line chart - Monthly weight (excluding canceled)
        monthlyWeight: {
          labels: monthlyWeightData.map(
            item =>
              `${new Date(item._id.year, item._id.month - 1).toLocaleString(
                'default',
                { month: 'short' }
              )} ${item._id.year}`
          ),
          data: monthlyWeightData.map(item => item.totalWeight || 0),
          deploymentCounts: monthlyWeightData.map(
            item => item.deploymentCount || 0
          )
        },

        // Bar chart - Deployment status
        deploymentStatus: {
          labels: deploymentStatusData.map(
            item => deploymentStatusMap[item._id] || item._id || 'Unknown'
          ),
          data: deploymentStatusData.map(item => item.count || 0)
        },

        // Bar chart - Destinations
        destinations: {
          labels: formatArrayData(topDestinations).map(
            item => item._id || 'Unknown'
          ),
          data: formatArrayData(topDestinations).map(item => item.count || 0)
        },

        // Bar chart - Truck types
        truckTypes: {
          labels: formatArrayData(truckTypeAnalytics).map(
            item => item._id || 'Unknown'
          ),
          data: formatArrayData(truckTypeAnalytics).map(item => item.count || 0)
        },

        // Pie chart - Truck status
        truckStatus: {
          labels: formatArrayData(truckStatusAnalytics).map(
            item => item._id || 'Unknown'
          ),
          data: formatArrayData(truckStatusAnalytics).map(
            item => item.count || 0
          )
        },

        // Pie chart - Driver status
        driverStatus: {
          labels: formatArrayData(driverStatusAnalytics).map(
            item => item._id || 'Unknown'
          ),
          data: formatArrayData(driverStatusAnalytics).map(
            item => item.count || 0
          )
        }
      },

      // Top performers
      topDrivers: formatArrayData(topDriversByTrips),

      performanceMetrics: {
        totalDeployments,
        completedDeployments,
        ongoingDeployments: totalOngoingDeployments,
        cancelledDeployments: cancelledDeployments || 0,
        pendingDeployments: pendingDeployments || 0,
        preparingDeployments: preparingDeployments || 0,
        totalTrucks,
        activeTrucks,
        availableTrucks,
        totalDrivers,
        availableDrivers,
        totalSacks: totalSacks || 0,
        totalWeight: totalWeight || 0,
        completionRate: parseFloat(completionRate),
        cancellationRate: parseFloat(cancellationRate),
        successRate: parseFloat(successRate),
        utilizationRate:
          availableTrucks > 0
            ? parseFloat(
                ((totalOngoingDeployments / availableTrucks) * 100).toFixed(1)
              )
            : 0
      }
    }

    res.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    })
  }
}

module.exports = {
  getDashboardAnalytics
}
