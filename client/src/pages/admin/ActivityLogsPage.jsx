import React, { useEffect, useState } from 'react'
import { FaFilter, FaPlus, FaSearch } from 'react-icons/fa'
import {
  empty_illustration,
  error_illustration,
  no_image,
  truck_placeholder
} from '../../consts/images'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import clsx from 'clsx'
import { TRUCK_TYPES } from '../../utils/generalOptions'
import useGetAllActivityLogs from '../../hooks/useGetAllActivityLogs'
import { DateTime } from 'luxon'

const defaultFilters = {
  type: '',
  sort: 'latest',
  date: '',
  perPage: 40,
  page: 1
}

function ActivityLogsPage () {
  const [isTruckDetailsModalOpen, setIsTruckDetailsModalOpen] = useState(false)

  const { getAllActivityLogs, isLoading } = useGetAllActivityLogs()
  const [allActivityLogs, setAllActivityLogs] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)
  const [totalPages, setTotalPages] = useState(null)
  const [error, setError] = useState(null)
  const [selectedActivityLogs, setSelectedActivityLogs] = useState({})

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
    // check if filters are already in default state
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

  const handleShowTruckDetailsModal = data => {
    setSelectedTruck(data)
    setIsTruckDetailsModalOpen(true)
    console.log(data)
  }

  useEffect(() => {
    const handleGetAllActivityLogs = async () => {
      const { activityLogs, total, page, totalPages, error } =
        await getAllActivityLogs(filters)

      if (error) {
        setError(error)
      }

      setAllActivityLogs(activityLogs)
      setTotal(total)
      setPage(page)
      setTotalPages(totalPages)
    }

    handleGetAllActivityLogs()
  }, [filters])

  return (
    <div className='flex-1 flex flex-col gap-10'>
      {/* header */}
      <div className='flex items-center flex-wrap gap-x-12 gap-y-4'>
        <h1 className='font-semibold text-2xl mr-auto'>Activity Logs</h1>

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
                  <p className='font-semibold'>Type</p>
                  <select
                    name='type'
                    value={tempFilters.type}
                    onChange={handleChangeFilter}
                    className='w-full focus:outline-none'
                  >
                    <option value=''>All</option>
                    <option value='admin'>Admins</option>
                    <option value='deployment'>Deployments</option>
                    <option value='driver'>Drivers</option>
                    <option value='truck'>Trucks</option>
                    <option value='visitor'>Visitors</option>
                  </select>
                </label>

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
                    <option value='a-z'>A to Z</option>
                    <option value='z-a'>Z to A</option>
                  </select>
                </label>

                <label className='col-span-2 flex items-center justify-between text-sm outline outline-gray-200 rounded py-2 px-3 gap-2'>
                  <p className='font-semibold'>Date</p>
                  <input
                    name='date'
                    type='date'
                    value={tempFilters.date}
                    onChange={handleChangeFilter}
                    className='focus:border-none focus:outline-none'
                  />
                </label>

                <button
                  onClick={handleResetFilters}
                  disabled={isLoading}
                  className='bg-linear-to-b from-gray-100 to-gray-200 text-gray-600  rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm cursor-pointer hover:brightness-95'
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
                allActivityLogs &&
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
      ) : allActivityLogs.length === 0 ? (
        <div className='flex-1 flex justify-center items-center'>
          <div className='flex flex-col justify-center items-center gap-4 px-4 text-center'>
            <img src={empty_illustration} alt='empty list' className='w-56' />
            <div className='space-y-2'>
              <h1 className='text-xl font-semibold text-gray-700'>
                Nothing to show here
              </h1>
              <p className='text-gray-500 max-w-md leading-relaxed'>
                {filters.search || filters.status
                  ? 'Try adjusting your search terms or filters to see more results'
                  : 'Get started by adding your first deployment to the system'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative flex-1 overflow-y-auto scrollbar-thin'>
          <div className='absolute inset-0'>
            <table className='table table-md table-pin-rows table-pin-cols'>
              <thead>
                <tr className='bg-white border-b border-gray-200  text-gray-800'>
                  <td>{total}</td>
                  <td>Role</td>
                  <td>Performed by</td>
                  <td>Action</td>
                  <td>Performed at</td>
                </tr>
              </thead>
              <tbody>
                {allActivityLogs.map((activityLog, index) => (
                  <tr
                    key={index}
                    onClick={() => handleShowTruckDetailsModal(truck)}
                    className='border-b border-gray-200 last:border-none hover:bg-gray-50 cursor-pointer'
                  >
                    <td className='text-xs font-bold text-gray-600'>
                      {(page - 1) * filters.perPage + index + 1}
                    </td>
                    <td className='capitalize'>
                      {activityLog.performedBy.role.replace(/_/g, ' ')}
                    </td>
                    <td className='capitalize'>
                      {`${activityLog.performedBy.firstname} ${activityLog.performedBy.lastname}`}
                    </td>
                    <td>{activityLog.action}</td>
                    <td>
                      {DateTime.fromISO(activityLog.createdAt)
                        .setZone('Asia/Manila')
                        .toFormat('MMM d, yyyy hh:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityLogsPage
