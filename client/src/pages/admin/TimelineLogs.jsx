import React, { useEffect, useState } from 'react'
import { FaFilter, FaSearch } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md'
import {
  empty_illustration,
  error_illustration,
  user_placeholder
} from '../../consts/images'
import useGetAllTimelineLogs from '../../hooks/useGetAllTimelineLogs'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import TimelineLogDetailsModal from '../../components/modals/TimelineLogDetailsModal'
import ReplacementHistoryModal from '../../components/modals/ReplacementHistoryModal'

const defaultFilters = {
  sort: 'latest',
  status: '',
  date: '',
  search: '',
  perPage: 40,
  page: 1
}

function TimelineLogs () {
  const [isTimelineLogDetailsModalOpen, setIsTimelineLogDetailsModalOpen] =
    useState(false)
  const [selectedTimelineLog, setSelectedTimelineLog] = useState({})
  const [isDeploymentDetailsModalOpen, setIsDeploymentDetailsModalOpen] =
    useState(false)
  const [showReplacementHistory, setShowReplacementHistory] = useState(false)

  const { getAllTimelineLogsFunction, isLoading } = useGetAllTimelineLogs()
  const [allTimelineLogs, setAllTimelineLogs] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)
  const [totalPages, setTotalPages] = useState(null)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState(defaultFilters)
  const [tempFilters, setTempFilters] = useState(defaultFilters)

  const handleChangeFilter = e => {
    const { name, value } = e.target
    setTempFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = e => {
    e.preventDefault()
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const isDefault = Object.keys(defaultFilters).every(
      key => tempFilters[key] === defaultFilters[key]
    )

    if (!isDefault) {
      setTempFilters(defaultFilters)
      setFilters(defaultFilters)
    }
  }

  const handleClearSearch = () => {
    setTempFilters(prev => ({ ...prev, search: '' }))
    setFilters(prev => ({ ...prev, search: '' }))
  }

  const handleChangePage = direction => {
    if (direction === 'prev' && filters.page > 1) {
      setFilters(prev => ({ ...prev, page: prev.page - 1 }))
    } else if (direction === 'next' && filters.page < totalPages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const handleShowTimelineLogDetailsModal = data => {
    setSelectedTimelineLog(data)
    setIsTimelineLogDetailsModalOpen(true)
  }

  // Format date for display using Luxon
  const formatDate = dateString => {
    try {
      const dt = DateTime.fromISO(dateString)
      return dt.isValid ? dt.toFormat('MMM dd, yyyy hh:mm a') : 'Invalid date'
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Get the action timestamp directly from the log's timestamps field
  const getActionTimestamp = log => {
    // Use the timestamps field from the schema
    if (log.timestamp) {
      return formatDate(log.timestamp)
    }
    // Fallback to createdAt if timestamps is not available
    return formatDate(log.createdAt)
  }

  // Get deployment code from timeline log
  const getDeploymentCode = log => {
    return log.targetDeployment?.deploymentCode || 'N/A'
  }

  // Get user's full name
  const getUserFullName = log => {
    if (log.performedBy) {
      return `${log.performedBy.firstname || ''} ${
        log.performedBy.lastname || ''
      }`.trim()
    }
    return 'Unknown User'
  }

  // Get truck plate from deployment
  const getTruckPlate = log => {
    if (log.targetDeployment?.replacement?.replacementTruckId?.plateNo) {
      return log.targetDeployment.replacement.replacementTruckId.plateNo
    }
    if (log.targetDeployment?.truckId?.plateNo) {
      return log.targetDeployment.truckId.plateNo
    }
    return 'N/A'
  }

  // Get driver name from deployment
  const getDriverName = log => {
    if (log.targetDeployment?.replacement?.replacementDriverId) {
      const driver = log.targetDeployment.replacement.replacementDriverId
      return `${driver.firstname || ''} ${driver.lastname || ''}`.trim()
    }
    if (log.targetDeployment?.driverId) {
      return `${log.targetDeployment.driverId.firstname || ''} ${
        log.targetDeployment.driverId.lastname || ''
      }`.trim()
    }
    return 'Unknown Driver'
  }

  // Get status badge color
  const getStatusBadgeColor = status => {
    const statusColors = {
      preparing: 'bg-orange-500/10 text-orange-500',
      ongoing: 'bg-emerald-500/10 text-emerald-500',
      completed: 'bg-blue-500/10 text-blue-500',
      canceled: 'bg-red-500/10 text-red-500'
    }
    return statusColors[status] || 'bg-gray-500/10 text-gray-500'
  }

  useEffect(() => {
    const handleGetAllTimelineLogs = async () => {
      const { timelineLogs, total, page, totalPages, error } =
        await getAllTimelineLogsFunction(filters)

      if (error) {
        setError(error)
      }

      setAllTimelineLogs(timelineLogs || [])
      setTotal(total)
      setPage(page)
      setTotalPages(totalPages)
    }

    handleGetAllTimelineLogs()
  }, [filters])

  return (
    <>
      <div className='flex-1 flex flex-col gap-10'>
        {/* header */}
        <div className='flex items-center flex-wrap gap-x-12 gap-y-4'>
          <h1 className='font-semibold text-2xl mr-auto'>Deployment Logs</h1>

          {/* right side */}
          <div className='flex flex-wrap gap-4'>
            {/* filters */}
            <div className='dropdown dropdown-center'>
              {/* button */}
              <div
                tabIndex={0}
                role='button'
                className='flex items-center gap-4 ring-1 ring-gray-200 hover:bg-gray-50 rounded px-3 py-1 cursor-pointer active:scale-95 transition-all'
              >
                <FaFilter className='text-sm' />
                <p>Filter</p>
              </div>

              {/* menu */}
              <div
                tabIndex='0'
                className='dropdown-content menu mt-3 bg-white shadow-sm rounded w-sm ring-1 ring-gray-300'
              >
                <div className='grid grid-cols-2 gap-4 p-4'>
                  <label className='flex items-center text-sm outline outline-gray-200 rounded py-2 px-3 gap-2'>
                    <p className='font-semibold'>Sort</p>
                    <select
                      name='sort'
                      value={tempFilters.sort}
                      onChange={handleChangeFilter}
                      className='w-full focus:outline-none'
                    >
                      <option value='latest'>Latest</option>
                      <option value='oldest'>Oldest</option>
                    </select>
                  </label>

                  <label className='flex items-center text-sm outline outline-gray-200 rounded py-2 px-3 gap-2'>
                    <p className='font-semibold'>Status</p>
                    <select
                      name='status'
                      value={tempFilters.status}
                      onChange={handleChangeFilter}
                      className='w-full focus:outline-none'
                    >
                      <option value=''>All</option>
                      <option value='preparing'>Preparing</option>
                      <option value='ongoing'>Ongoing</option>
                      <option value='completed'>Completed</option>
                      <option value='canceled'>Canceled</option>
                    </select>
                  </label>

                  <label className='col-span-2 flex items-center justify-between text-sm outline outline-gray-200 rounded py-2 px-3 gap-2'>
                    <p className='font-semibold whitespace-nowrap'>Date</p>
                    <input
                      type='date'
                      name='date'
                      value={tempFilters.date}
                      onChange={handleChangeFilter}
                      className='focus:outline-none'
                    />
                  </label>

                  <button
                    onClick={handleResetFilters}
                    disabled={isLoading}
                    className='bg-linear-to-b from-gray-100 to-gray-200  text-gray-600  rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm cursor-pointer hover:brightness-95'
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    className='bg-linear-to-b from-emerald-500 to-emerald-600 text-white  rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm cursor-pointer hover:brightness-95'
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* search */}
            <form
              onSubmit={handleApplyFilters}
              className='flex items-center outline outline-gray-200 rounded pl-3 pr-1 focus-within:outline-gray-300 transition-all max-xl:mr-auto'
            >
              <FaSearch className='text-sm' />
              <input
                type='text'
                name='search'
                placeholder='Search logs...'
                value={tempFilters.search}
                onChange={handleChangeFilter}
                autoComplete='off'
                className='w-60 focus:outline-none ml-3 mr-1'
              />
              <button
                type='button'
                onClick={handleClearSearch}
                className={clsx(
                  'rounded-full p-1 hover:bg-gray-50 cursor-pointer transition-all duration-300',
                  {
                    'opacity-100': tempFilters.search,
                    'opacity-0 -z-10': !tempFilters.search
                  }
                )}
              >
                <IoClose className='text-xl' />
              </button>
            </form>

            {/* pagination */}
            <div className='flex gap-4 items-center outline outline-gray-200 rounded'>
              <button
                onClick={() => handleChangePage('prev')}
                disabled={isLoading}
                className='p-1 text-2xl hover:bg-gray-50 cursor-pointer border-r border-gray-200'
              >
                <MdOutlineKeyboardArrowLeft />
              </button>

              <p className='text-sm min-w-22 text-center'>
                {!isLoading &&
                  allTimelineLogs &&
                  `Page ${total > 0 ? page : total} of ${totalPages}`}
              </p>

              <button
                onClick={() => handleChangePage('next')}
                disabled={isLoading}
                className='p-1 text-2xl hover:bg-gray-50 cursor-pointer border-l border-gray-200'
              >
                <MdOutlineKeyboardArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* table */}
        {isLoading ? (
          <div className='flex-1 flex items-center justify-center'>
            <div className='flex flex-col items-center justify-center gap-4 text-center'>
              <div className='relative'>
                <span className='loading loading-spinner loading-lg text-primaryColor'></span>
              </div>
              <p className='text-gray-600 font-medium'>Loading content...</p>
            </div>
          </div>
        ) : error ? (
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
        ) : !allTimelineLogs || allTimelineLogs.length === 0 ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='flex flex-col justify-center items-center gap-4 px-4 text-center'>
              <img src={empty_illustration} alt='empty list' className='w-56' />
              <div className='space-y-2'>
                <h1 className='text-xl font-semibold text-gray-700'>
                  Nothing to show here
                </h1>
                <p className='text-gray-500 max-w-md leading-relaxed'>
                  {tempFilters.search
                    ? 'Try adjusting your search terms to see more results'
                    : 'No timeline activity has been recorded yet'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='relative flex-1 overflow-y-auto scrollbar-thin'>
            <div className='absolute inset-0'>
              <table className='table table-md table-pin-rows table-pin-cols'>
                <thead>
                  <tr className='bg-white border-b border-gray-200 text-gray-800'>
                    <td>{total}</td>
                    <td>Code</td>
                    <td>Action Details</td>
                    <td>Status</td>
                    <td>Truck Plate</td>
                    <td>Driver</td>
                    <td>Timestamp</td>
                  </tr>
                </thead>
                <tbody>
                  {allTimelineLogs.map((log, index) => (
                    <tr
                      key={log._id || index}
                      onClick={() => handleShowTimelineLogDetailsModal(log)}
                      className='border-b border-gray-200 last:border-none hover:bg-gray-50 cursor-pointer'
                    >
                      <td className='text-xs font-bold text-gray-600'>
                        {(page - 1) * filters.perPage + index + 1}
                      </td>

                      <td className='p-0 relative'>
                        <div
                          className='cursor-copy h-full w-fit p-2 hover:bg-gray-100 transition-colors rounded relative group'
                          onClick={e => {
                            e.stopPropagation()
                            const code = getDeploymentCode(log)
                            navigator.clipboard.writeText(code)

                            // Show feedback tooltip
                            const div = e.currentTarget
                            const tooltip = document.createElement('div')
                            tooltip.className =
                              'absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50'
                            tooltip.textContent = 'Copied'

                            div.appendChild(tooltip)

                            // Remove after 1 second
                            setTimeout(() => {
                              if (div.contains(tooltip)) {
                                div.removeChild(tooltip)
                              }
                            }, 1000)
                          }}
                          title='Click to copy'
                        >
                          {getDeploymentCode(log)}
                        </div>
                      </td>

                      <td>
                        <p className='text-sm max-w-xs' title={log.action}>
                          {log.action}
                        </p>
                      </td>

                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusBadgeColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td>
                        <div className='text-sm uppercase'>
                          {getTruckPlate(log)}
                        </div>
                      </td>

                      <td>
                        <p className='text-nowrap capitalize'>
                          {getDriverName(log)}
                        </p>
                      </td>

                      <td>
                        <div className='text-sm text-gray-600'>
                          {getActionTimestamp(log)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TimelineLogDetailsModal
        isOpen={isTimelineLogDetailsModalOpen}
        onClose={() => setIsTimelineLogDetailsModalOpen(false)}
        timelineLog={selectedTimelineLog}
        openReplacementHistory={() => setShowReplacementHistory(true)}
      />

      <ReplacementHistoryModal
        isOpen={showReplacementHistory}
        onClose={() => setShowReplacementHistory(false)}
        deployment={selectedTimelineLog.targetDeployment}
      />
    </>
  )
}

export default TimelineLogs
