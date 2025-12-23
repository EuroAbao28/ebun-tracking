import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { API_ANALYTICS } from '../../utils/APIRoutes'
import axios from 'axios'
import {
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineCube,
  HiOutlineScale
} from 'react-icons/hi'
import { TbRocket, TbChecklist, TbRefresh, TbX } from 'react-icons/tb'
import { error_illustration } from '../../consts/images'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Simplified color palette
  const colors = {
    primary: '#10b981', // Green
    secondary: '#3b82f6', // Blue 500
    accent: '#f59e0b', // Orange 500
    error: '#ef4444', // Red
    purple: '#8b5cf6', // Purple
    pink: '#ec4899' // Pink
  }

  const colorPalette = [
    colors.primary, // Green
    colors.secondary, // Blue 500
    colors.accent, // Orange 500
    colors.error, // Red
    colors.purple, // Purple
    colors.pink // Pink
  ]

  // Specific colors for deployment status
  const deploymentStatusColors = {
    completed: '#3b82f6', // blue-500
    ongoing: '#10b981', // primaryColor
    preparing: '#f59e0b', // orange-500
    cancelled: '#ef4444' // red-500
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      const token = sessionStorage.getItem('userToken')

      const response = await axios.get(API_ANALYTICS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        console.log(response.data.data)
        setAnalytics(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError('Failed to fetch analytics data')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Disable legend for all charts by default
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#6b7280',
        bodyColor: '#6b7280',
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  }

  // Line chart options with bottom legend and colored Y-axis
  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        position: 'left',
        ticks: {
          color: colors.primary, // Green color for Completed (left axis)
          font: {
            size: 11
          }
        }
      },
      y1: {
        ...chartOptions.scales.y,
        position: 'right',
        grid: {
          drawOnChartArea: false // Don't draw grid lines for right axis
        },
        ticks: {
          color: colors.error, // Red color for Canceled (right axis)
          font: {
            size: 11
          }
        }
      },
      x: {
        ...chartOptions.scales.x,
        ticks: {
          color: '#6b7280' // Gray text color for X-axis
        }
      }
    }
  }

  // Dual axis line chart options with bottom legend and colored text
  const dualAxisLineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: colors.secondary, // Blue 500 for Sacks (left axis)
          font: {
            size: 11
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: colors.accent, // Orange 500 for Weight (right axis)
          font: {
            size: 11
          }
        },
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        ...chartOptions.scales.x,
        ticks: {
          color: '#6b7280' // Gray text color for X-axis
        }
      }
    }
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          },
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#6b7280',
        bodyColor: '#6b7280',
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true
      }
    }
  }

  // Horizontal bar chart options for all drivers
  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'x', // This makes it horizontal
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        beginAtZero: true
      },
      y: {
        ...chartOptions.scales.y,
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      }
    }
  }

  // Chart data functions
  const getLineChartData = () => {
    if (!analytics?.charts?.monthlyDeployments)
      return { labels: [], datasets: [] }

    return {
      labels: analytics.charts.monthlyDeployments.labels,
      datasets: [
        {
          label: 'Completed',
          data: analytics.charts.monthlyDeployments.completedData,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}30`,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: colors.primary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Canceled',
          data: analytics.charts.monthlyDeployments.canceledData,
          borderColor: colors.error,
          backgroundColor: `${colors.error}30`,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: colors.error,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    }
  }

  // Combined sacks and weight line chart
  const getCargoVolumeData = () => {
    if (!analytics?.charts?.monthlySacks || !analytics?.charts?.monthlyWeight)
      return { labels: [], datasets: [] }

    const labels = analytics.charts.monthlySacks.labels

    return {
      labels,
      datasets: [
        {
          label: 'Total Sacks',
          data: analytics.charts.monthlySacks.data,
          borderColor: colors.secondary, // Blue 500
          backgroundColor: `${colors.secondary}30`, // Blue 500 with transparency
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: colors.secondary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y'
        },
        {
          label: 'Total Weight (kg)',
          data: analytics.charts.monthlyWeight.data,
          borderColor: colors.accent, // Orange 500
          backgroundColor: `${colors.accent}30`, // Orange 500 with transparency
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: colors.accent,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1'
        }
      ]
    }
  }

  const getBarChartData = (chartData, label, colorIndex) => {
    if (!chartData?.labels || !chartData?.data)
      return { labels: [], datasets: [] }

    return {
      labels: chartData.labels,
      datasets: [
        {
          label: label,
          data: chartData.data,
          backgroundColor: colorPalette[colorIndex], // Solid color instead of outline
          borderColor: colorPalette[colorIndex],
          borderWidth: 0, // Remove border
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    }
  }

  // All Drivers Horizontal Bar Chart
  const getAllDriversBarData = () => {
    if (!analytics?.topDrivers || analytics.topDrivers.length === 0)
      return { labels: [], datasets: [] }

    // Sort drivers by trip count (highest first)
    const sortedDrivers = [...analytics.topDrivers].sort(
      (a, b) => (b.tripCount || 0) - (a.tripCount || 0)
    )

    return {
      labels: sortedDrivers.map(driver =>
        driver.name
          ? driver.name.replace(/\b\w/g, char => char.toUpperCase())
          : 'Unknown Driver'
      ),
      datasets: [
        {
          label: 'Completed Trips',
          data: sortedDrivers.map(driver => driver.tripCount || 0),
          backgroundColor: colors.primary, // Solid color
          borderColor: colors.primary,
          borderWidth: 0, // Remove border
          borderRadius: 4
        }
      ]
    }
  }

  // Deployment status with specific colors - solid colors
  const getDeploymentStatusData = chartData => {
    if (!chartData?.labels || !chartData?.data)
      return { labels: [], datasets: [] }

    const backgroundColors = chartData.labels.map(label => {
      const lowerLabel = label.toLowerCase()
      if (lowerLabel.includes('complete'))
        return deploymentStatusColors.completed
      if (lowerLabel.includes('ongoing') || lowerLabel.includes('progress'))
        return deploymentStatusColors.ongoing
      if (lowerLabel.includes('preparing'))
        return deploymentStatusColors.preparing
      if (lowerLabel.includes('cancel')) return deploymentStatusColors.cancelled
      return colorPalette[0]
    })

    return {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Deployments',
          data: chartData.data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 0, // Remove border
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    }
  }

  const getPieChartData = chartData => {
    if (!chartData?.labels || !chartData?.data)
      return { labels: [], datasets: [] }

    const backgroundColors = colorPalette.slice(0, chartData.data.length)

    return {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: backgroundColors, // Solid colors
          borderColor: '#ffffff', // White border for contrast
          borderWidth: 2,
          hoverOffset: 8
        }
      ]
    }
  }

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center gap-4 text-center'>
          <div className='relative'>
            <span className='loading loading-spinner loading-lg text-primaryColor'></span>
          </div>
          <p className='text-gray-600 font-medium'>Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex-1 flex justify-center items-center'>
        <div className='flex flex-col justify-center items-center gap-4 px-4 text-center'>
          <img src={error_illustration} alt='empty list' className='w-56' />
          <div className='space-y-2'>
            <h1 className='text-xl font-semibold text-gray-700'>
              Something went wrong
            </h1>
            <p className='text-gray-500 max-w-md leading-relaxed'>
              We encountered an unexpected error. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 relative overflow-y-auto'>
      <div className='absolute inset-0 space-y-6'>
        {/* Header */}
        <div>
          <h1 className='font-semibold text-2xl'>Analytics Dashboard</h1>
          <p className='text-gray-600 mt-2 font-medium'>
            Operational insights and performance metrics
          </p>
        </div>

        {/* Combined Metrics Group */}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6'>
          {/* Total Deployments */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-blue-50 rounded-lg'>
                <TbRocket className='text-3xl text-blue-600' />
              </div>
              <div className='space-y-0'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.totalDeployments}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Total Deployments
                </div>
              </div>
            </div>
          </div>

          {/* Completed Deployments */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-green-50 rounded-lg'>
                <TbChecklist className='text-3xl text-green-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.completedDeployments}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Completed
                </div>
              </div>
            </div>
          </div>

          {/* In Progress Deployments */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-amber-50 rounded-lg'>
                <TbRefresh className='text-3xl text-amber-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.ongoingDeployments}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  In Progress
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled Deployments */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-red-50 rounded-lg'>
                <TbX className='text-3xl text-red-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.cancelledDeployments || 0}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Cancelled
                </div>
              </div>
            </div>
          </div>

          {/* Total Trucks */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-indigo-50 rounded-lg'>
                <HiOutlineTruck className='text-3xl text-indigo-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.totalTrucks || '0'}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Total Trucks
                </div>
              </div>
            </div>
          </div>

          {/* Total Drivers */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-cyan-50 rounded-lg'>
                <HiOutlineUser className='text-3xl text-cyan-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.totalDrivers || '0'}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Total Drivers
                </div>
              </div>
            </div>
          </div>

          {/* Total Sacks */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-emerald-50 rounded-lg'>
                <HiOutlineCube className='text-3xl text-emerald-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.totalSacks?.toLocaleString() ||
                    '0'}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Total Sacks
                </div>
              </div>
            </div>
          </div>

          {/* Total Weight */}
          <div className='bg-white p-3 rounded shadow-card3 border border-gray-100 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-violet-50 rounded-lg'>
                <HiOutlineScale className='text-3xl text-violet-600' />
              </div>
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-gray-900'>
                  {analytics.performanceMetrics.totalWeight?.toLocaleString() ||
                    '0'}
                </div>
                <div className='text-sm font-medium text-gray-600'>
                  Total Weight (kg)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className='grid lg:grid-cols-1 xl:grid-cols-2 gap-6'>
          {/* Line Chart - Monthly Deployments */}
          <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
            <div className='flex justify-between items-start'>
              <div>
                <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                  Monthly Deployment Trends
                </h2>
                <p className='text-gray-500 text-sm mb-4'>
                  Completed vs canceled deployments over time
                </p>
              </div>

              <p className='text-lg font-semibold text-gray-700'>
                {analytics?.performanceMetrics?.successRate !== undefined
                  ? `${analytics.performanceMetrics.successRate}% success rate`
                  : 'Calculating...'}
              </p>
            </div>
            <div className='h-80'>
              <Line data={getLineChartData()} options={lineChartOptions} />
            </div>
          </div>

          {/* Combined Line Chart - Sacks & Weight */}
          <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>
              Cargo Volume & Weight Trends
            </h2>
            <p className='text-gray-500 text-sm mb-4'>
              Sacks count and weight transported
            </p>
            <div className='h-80'>
              <Line
                data={getCargoVolumeData()}
                options={dualAxisLineChartOptions}
              />
            </div>
          </div>

          {/* Bar Chart - Deployment Status */}
          <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>
              Deployment Status Distribution
            </h2>
            <p className='text-gray-500 text-sm mb-4'>
              Current status of all deployments
            </p>
            <div className='h-80'>
              <Bar
                data={getDeploymentStatusData(
                  analytics.charts.deploymentStatus
                )}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Bar Chart - Destinations */}
          <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-700 mb-4'>
              Top Destinations
            </h2>
            <p className='text-gray-500 text-sm mb-4'>
              Most frequent deployment locations
            </p>
            <div className='h-80'>
              <Bar
                data={getBarChartData(
                  analytics.charts.destinations,
                  'Trips',
                  1
                )}
                options={chartOptions}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 col-span-full'>
            {/* Bar Chart - Truck Types */}
            <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                Truck Types
              </h2>
              <p className='text-gray-500 text-sm mb-4'>
                Fleet composition by type
              </p>
              <div className='h-80'>
                <Bar
                  data={getBarChartData(
                    analytics.charts.truckTypes,
                    'Trucks',
                    2
                  )}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Pie Chart - Truck Status */}
            <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                Truck Status
              </h2>
              <p className='text-gray-500 text-sm mb-4'>
                Operational status distribution
              </p>
              <div className='h-80'>
                <Pie
                  data={getPieChartData(analytics.charts.truckStatus)}
                  options={pieChartOptions}
                />
              </div>
            </div>

            {/* Pie Chart - Driver Status */}
            <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                Driver Status
              </h2>
              <p className='text-gray-500 text-sm mb-4'>
                Current driver availability
              </p>
              <div className='h-80'>
                <Doughnut
                  data={getPieChartData(analytics.charts.driverStatus)}
                  options={pieChartOptions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* All Drivers - Horizontal Bar Chart */}
        <div className='bg-white p-6 rounded shadow-card3 border border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-700 mb-4'>
            All Drivers Performance
          </h2>
          <p className='text-gray-500 text-sm mb-4'>
            Ranked by completed trips
          </p>
          <div className='h-96'>
            {' '}
            {/* Increased height to show more drivers */}
            <Bar data={getAllDriversBarData()} options={horizontalBarOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
