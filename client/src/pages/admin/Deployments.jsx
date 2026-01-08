import React, { useEffect, useState } from 'react'
import DeploymentDetailsModal from '../../components/modals/DeploymentDetailsModal'
import CreateDeploymentModal from '../../components/modals/CreateDeploymentModal'
import useGetAllTruck from '../../hooks/useGetAllTruck'
import useGetAllDriver from '../../hooks/useGetAllDriver'
import { FaFilter, FaPlus, FaSearch, FaFileExport } from 'react-icons/fa'
import { DEPLOYMENT_STATUS } from '../../utils/generalOptions'
import { IoClose } from 'react-icons/io5'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md'
import clsx from 'clsx'
import useGetAllDeployment from '../../hooks/useGetAllDeployment'
import { empty_illustration, error_illustration } from '../../consts/images'
import { DateTime } from 'luxon'
import ReplacementModal from '../../components/modals/ReplacementModal'
import ReplacementHistoryModal from '../../components/modals/ReplacementHistoryModal'
import { useUserContext } from '../../contexts/UserContext'
import DeleteDeploymentModal from '../../components/modals/DeleteDeploymentModal'
import { CLIENT_COMPANY } from '../../utils/deploymentOptions'

// Add defaultFilters constant
const defaultFilters = {
  status: '',
  sort: 'latest',
  requestFrom: '',
  assignedAt: '',
  departedAt: '',
  search: '',
  perPage: 100,
  page: 1
}

function Deployments () {
  const { userData } = useUserContext()

  const [isDeploymentDetailsModalOpen, setIsDeploymentDetailsModalOpen] =
    useState(false)
  const [isCreateDeploymentModalOpen, setIsCreateDeploymentModalOpen] =
    useState(false)
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false)
  const [showReplacementHistory, setShowReplacementHistory] = useState(false)
  const [isDeleteDeploymentModalOpen, setIsDeleteDeploymentModalOpen] =
    useState(false)

  const { getAllDeploymentFunction, isLoading: isDeploymentLoading } =
    useGetAllDeployment()
  const { getAllTruckFunction, isLoading: isTruckLoading } = useGetAllTruck()
  const { getAllDriverFunction, isLoading: isDriverLoading } = useGetAllDriver()
  const [allDeployments, setAllDeployments] = useState([])
  const [allTrucks, setAllTrucks] = useState([])
  const [allDrivers, setAllDrivers] = useState([])
  const [deploymentError, setDeploymentError] = useState(null)
  const [truckError, setTruckError] = useState(null)
  const [driverError, setDriverError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)
  const [totalPages, setTotalPages] = useState(null)
  const [selectedDeployment, setSelectedDeployment] = useState({})

  // Initialize with defaultFilters
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

  const handleExportToCSV = () => {
    if (!allDeployments || allDeployments.length === 0) {
      alert('No data to export')
      return
    }

    // Helper function to capitalize words
    const capitalizeWords = str => {
      if (!str) return ''
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Helper function to format truck type
    const formatTruckType = type => {
      if (!type) return ''

      // Handle common truck type formats
      const typeMappings = {
        elf: 'ELF',
        'single-tire': 'Single-Tire',
        forward: 'Forward',
        'wing-van': 'Wing Van',
        'closed-van': 'Closed Van',
        '10-wheeler': '10 Wheeler',
        '6-wheeler': '6 Wheeler'
      }

      const lowerType = type.toLowerCase().trim()
      return typeMappings[lowerType] || capitalizeWords(type.replace(/-/g, ' '))
    }

    // Custom 12-hour time formatter
    const formatDateTime = dateStr => {
      if (!dateStr || dateStr === 'Pending') return 'Pending'

      try {
        const date = DateTime.fromISO(dateStr).setZone('Asia/Manila')

        // Extract components for manual formatting
        const month = date.toFormat('MMM') // Dec, Jan, etc.
        const day = date.day
        const year = date.year
        const hour = date.hour
        const minute = date.minute.toString().padStart(2, '0')

        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM'
        const hour12 = hour % 12 || 12 // Convert 0 to 12 for 12 AM

        // Format: "Dec 27, 2025 2:21 PM"
        return `${month} ${day}, ${year} ${hour12}:${minute} ${period}`
      } catch (error) {
        console.error('Error formatting date:', dateStr, error)
        return 'Invalid Date'
      }
    }

    // Calculate unloading time
    const calculateUnloadingTime = (destArrival, destDeparture) => {
      if (!destArrival || !destDeparture) return 'Pending'

      try {
        const arrival = DateTime.fromISO(destArrival)
        const departure = DateTime.fromISO(destDeparture)
        const { hours, minutes } = departure.diff(arrival, ['hours', 'minutes'])

        if (hours === 0) {
          return `${Math.floor(minutes)}m`
        } else if (minutes < 1) {
          return `${hours}h`
        } else {
          return `${hours}h ${Math.floor(minutes)}m`
        }
      } catch (error) {
        console.error('Error calculating unloading time:', error)
        return 'Error'
      }
    }

    // Define CSV headers
    const headers = [
      'No.',
      'Code',
      'Plate No',
      'Truck Type',
      'Driver Name',
      'Destination',
      'Status',
      'Departed',
      'Pick-up In',
      'Pick-up Out',
      'Dest. Arrival',
      'Dest. Departure',
      'Unloading Time'
    ]

    // Convert deployments to CSV rows
    const rows = allDeployments.map((deployment, index) => {
      // Determine if replacement data should be used
      const isReplacement = deployment?.replacement?.replacementTruckId?._id
      const replacement = deployment?.replacement

      // Get plate number
      const plateNo = isReplacement
        ? replacement.replacementTruckId?.plateNo || ''
        : deployment.truckId?.plateNo || ''

      // Get truck type
      const truckType = isReplacement
        ? replacement.replacementTruckType
        : deployment.truckType

      // Get driver name
      const driverObj = isReplacement
        ? replacement.replacementDriverId
        : deployment.driverId

      const driverName = driverObj
        ? `${capitalizeWords(driverObj.firstname)} ${capitalizeWords(
            driverObj.lastname
          )}`
        : ''

      // Format status
      const status = deployment.status
        ? deployment.status === 'ongoing'
          ? 'Ongoing'
          : capitalizeWords(deployment.status)
        : ''

      // Format destination - preserve existing case for company names
      const destination = deployment.destination || ''

      // Handle canceled status - all fields show "Canceled"
      if (deployment.status === 'canceled') {
        return [
          (filters.page - 1) * filters.perPage + index + 1,
          deployment.deploymentCode || '',
          plateNo.toUpperCase(),
          formatTruckType(truckType),
          driverName,
          destination,
          'Canceled',
          'Canceled',
          'Canceled',
          'Canceled',
          'Canceled',
          'Canceled',
          'Canceled'
        ]
      }

      // For non-canceled deployments
      return [
        (filters.page - 1) * filters.perPage + index + 1,
        deployment.deploymentCode || '',
        plateNo.toUpperCase(),
        formatTruckType(truckType),
        driverName,
        destination,
        status,
        formatDateTime(deployment.departed),
        formatDateTime(deployment.pickupIn),
        formatDateTime(deployment.pickupOut),
        formatDateTime(deployment.destArrival),
        formatDateTime(deployment.destDeparture),
        calculateUnloadingTime(deployment.destArrival, deployment.destDeparture)
      ]
    })

    // Create CSV content with proper escaping
    const escapeCSV = cell => {
      if (cell == null || cell === undefined) return '""'
      const stringCell = String(cell)
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (
        stringCell.includes(',') ||
        stringCell.includes('"') ||
        stringCell.includes('\n')
      ) {
        return `"${stringCell.replace(/"/g, '""')}"`
      }
      return stringCell
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    const timestamp = DateTime.now().toFormat('yyyy-MM-dd_HHmmss')
    link.setAttribute('href', url)
    link.setAttribute('download', `deployments_export_${timestamp}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleAddNewDeployment = newDeployment => {
    console.log('NEW DEPLOYMENT', newDeployment)
    setAllDeployments(prev => [newDeployment, ...prev])
  }

  const handleShowTruckDetailsModal = async data => {
    setSelectedDeployment(data)
    setIsDeploymentDetailsModalOpen(true)
    console.log(data)
  }

  // for updating the all deployment with the updated deployment
  const handleUpdateAllDeployments = updatedDeployment => {
    console.log(updatedDeployment)
    setAllDeployments(prevAllDeployments =>
      prevAllDeployments.map(deployment =>
        deployment._id === updatedDeployment._id
          ? updatedDeployment
          : deployment
      )
    )
  }

  // for removing the deleted deployment
  const handleRemoveDeletedDeployment = deletedDeployment => {
    setAllDeployments(prev =>
      prev.filter(deployment => deployment._id !== deletedDeployment)
    )
    setIsDeleteDeploymentModalOpen(false)
    setIsDeploymentDetailsModalOpen(false)
  }

  useEffect(() => {
    const handleGetAllDeployment = async () => {
      // Pass filters to the function
      const { deployments, total, page, totalPages, error } =
        await getAllDeploymentFunction(filters)

      if (error) {
        setDeploymentError(error)
      }
      setAllDeployments(deployments)
      setTotal(total)
      setPage(page)
      setTotalPages(totalPages)
    }

    const handleGetAllTrucks = async () => {
      const { trucks, error } = await getAllTruckFunction({})

      if (error) {
        setTruckError(error)
      }
      setAllTrucks(trucks || [])
    }

    const handleGetAllDrivers = async () => {
      const { drivers, error } = await getAllDriverFunction({})

      if (error) {
        setDriverError(error)
      }
      setAllDrivers(drivers || [])
    }

    handleGetAllDeployment()
    handleGetAllTrucks()
    handleGetAllDrivers()
  }, [filters])

  return (
    <>
      <div className='flex-1 flex flex-col gap-10'>
        {/* header */}
        <div className='flex items-center flex-wrap gap-x-12 gap-y-4'>
          <h1 className='font-semibold text-2xl mr-auto'>Deployments</h1>

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
                    <p className='font-semibold'>Status</p>
                    <select
                      name='status'
                      value={tempFilters.status}
                      onChange={handleChangeFilter}
                      className='w-full focus:outline-none'
                    >
                      <option value=''>All</option>
                      {DEPLOYMENT_STATUS.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
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
                    </select>
                  </label>

                  <label className='col-span-2 flex items-center text-sm outline outline-gray-200 rounded py-2 px-3 gap-6'>
                    <p className='font-semibold text-nowrap'>Request From</p>
                    <select
                      name='requestFrom'
                      value={tempFilters.requestFrom}
                      onChange={handleChangeFilter}
                      className='w-full focus:outline-none'
                    >
                      <option value=''>All</option>
                      {CLIENT_COMPANY.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='col-span-2 flex items-center justify-between text-sm outline outline-gray-200 rounded py-2 px-3 gap-2'>
                    <p className='font-semibold text-nowrap'>Assigned At</p>
                    <input
                      type='date'
                      name='assignedAt'
                      value={tempFilters.assignedAt}
                      onChange={handleChangeFilter}
                      className='focus:outline-none'
                    />
                  </label>

                  <label className='col-span-2 flex items-center justify-between text-sm outline outline-gray-200 rounded py-2 px-3 gap-2'>
                    <p className='font-semibold text-nowrap'>Departed At</p>
                    <input
                      type='date'
                      name='departedAt'
                      value={tempFilters.departedAt}
                      onChange={handleChangeFilter}
                      className='focus:outline-none'
                    />
                  </label>

                  <button
                    onClick={handleResetFilters}
                    disabled={isDeploymentLoading}
                    className='bg-linear-to-b from-gray-100 to-gray-200 text-gray-600  rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm cursor-pointer hover:brightness-95'
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleApplyFilters}
                    disabled={isDeploymentLoading}
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
                placeholder='Search'
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
                disabled={isDeploymentLoading || filters.page === 1}
                className='p-1 text-2xl hover:bg-gray-50 cursor-pointer border-r border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <MdOutlineKeyboardArrowLeft />
              </button>

              <p className='text-sm min-w-22 text-center'>
                {!isDeploymentLoading &&
                  allDeployments &&
                  `Page ${total > 0 ? page : 0} of ${totalPages}`}
              </p>

              <button
                onClick={() => handleChangePage('next')}
                disabled={isDeploymentLoading || filters.page === totalPages}
                className='p-1 text-2xl hover:bg-gray-50 cursor-pointer border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <MdOutlineKeyboardArrowRight />
              </button>
            </div>

            {/* export button */}
            <button
              onClick={handleExportToCSV}
              disabled={isDeploymentLoading || allDeployments.length === 0}
              className='flex items-center gap-4 bg-linear-to-b from-blue-500 to-blue-600 text-white rounded px-3 py-1 cursor-pointer active:scale-95 transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <FaFileExport className='text-sm' />
              <p>Export</p>
            </button>

            {/* create button */}
            {['head_admin', 'admin'].includes(userData.data.role) && (
              <button
                onClick={() => setIsCreateDeploymentModalOpen(true)}
                disabled={isDeploymentLoading}
                className='flex items-center gap-4 bg-linear-to-b from-emerald-500 to-emerald-600 text-white rounded px-3 py-1 cursor-pointer active:scale-95 transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FaPlus className='text-sm' />
                <p>Deploy Truck</p>
              </button>
            )}
          </div>
        </div>

        {/* table */}
        {isDeploymentLoading ? (
          <div className='flex-1 flex items-center justify-center'>
            <div className='flex flex-col items-center justify-center gap-4 text-center'>
              <div className='relative'>
                <span className='loading loading-spinner loading-lg text-primaryColor'></span>
              </div>
              <p className='text-gray-600 font-medium'>Loading content...</p>
            </div>
          </div>
        ) : deploymentError ? (
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
        ) : allDeployments.length === 0 ? (
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
              <table className='table table-sm table-pin-rows table-pin-cols'>
                <thead>
                  <tr className='bg-white border-b border-gray-200  text-gray-800'>
                    <td>{total}</td>
                    <td>Code</td>
                    <td>Truck Details</td>
                    <td>Destination</td>
                    <td>Status</td>
                    <td>Departed</td>
                    <td>Pick-up In</td>
                    <td>Pick-up Out</td>
                    <td>Dest. Arrival</td>
                    <td>Dest. Departure</td>
                    <td>Unloading</td>
                  </tr>
                </thead>
                <tbody>
                  {allDeployments?.map((deployment, index) => (
                    <tr
                      key={index}
                      onClick={() => handleShowTruckDetailsModal(deployment)}
                      className='border-b border-gray-200 last:border-none hover:bg-gray-50 cursor-pointer capitalize'
                    >
                      <td className='text-xs font-bold text-gray-600'>
                        {(filters.page - 1) * filters.perPage + index + 1}
                      </td>

                      <td className='p-0 relative'>
                        <div
                          className='cursor-copy h-full w-fit p-2 hover:bg-gray-100 transition-colors rounded relative group'
                          onClick={e => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(
                              deployment.deploymentCode
                            )

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
                          {deployment.deploymentCode}
                        </div>
                      </td>

                      <td>
                        <div className='space-y-1'>
                          {deployment?.replacement?.replacementTruckId?._id ? (
                            <>
                              <p className='text-nowrap font-semibold'>
                                <span className='uppercase'>
                                  {
                                    deployment.replacement.replacementTruckId
                                      .plateNo
                                  }{' '}
                                </span>
                                ({deployment.replacement.replacementTruckType})
                              </p>
                              <p className='text-nowrap font-light'>{`${deployment.replacement.replacementDriverId.firstname} ${deployment.replacement.replacementDriverId.lastname}`}</p>
                            </>
                          ) : (
                            <>
                              <p className='text-nowrap font-semibold'>
                                <span className='uppercase'>
                                  {deployment.truckId.plateNo}{' '}
                                </span>
                                ({deployment.truckType})
                              </p>
                              <p className='text-nowrap font-light'>{`${deployment.driverId.firstname} ${deployment.driverId.lastname}`}</p>
                            </>
                          )}{' '}
                        </div>
                      </td>

                      <td className='max-w-28'>{deployment.destination}</td>

                      <td>
                        <div
                          className={clsx('px-2 py-1 rounded-full w-fit', {
                            'bg-orange-500/10 text-orange-500':
                              deployment.status === 'preparing',
                            'bg-emerald-500/10 text-emerald-500':
                              deployment.status === 'ongoing',
                            'bg-blue-500/10 text-blue-500':
                              deployment.status === 'completed',
                            'bg-red-500/10 text-red-500':
                              deployment.status === 'canceled'
                          })}
                        >
                          {deployment.status}
                        </div>
                      </td>

                      <td>
                        {deployment.departed ? (
                          <div className='text-nowrap w-fit px-2 py-1 rounded-full'>
                            {DateTime.fromISO(deployment.departed)
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy hh:mm a')}
                          </div>
                        ) : deployment.status === 'canceled' ? (
                          <p className='italic text-gray-400 font-light'>
                            Canceled
                          </p>
                        ) : (
                          <p className='italic text-gray-400 font-light'>
                            Pending
                          </p>
                        )}
                      </td>

                      <td>
                        {deployment.pickupIn ? (
                          <div className='text-nowrap w-fit px-2 py-1 rounded-full'>
                            {DateTime.fromISO(deployment.pickupIn)
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy hh:mm a')}
                          </div>
                        ) : deployment.status === 'canceled' ? (
                          <p className='italic text-gray-400 font-light'>
                            Canceled
                          </p>
                        ) : (
                          <p className='italic text-gray-400 font-light'>
                            Pending
                          </p>
                        )}
                      </td>

                      <td>
                        {deployment.pickupOut ? (
                          <div className='text-nowrap w-fit px-2 py-1 rounded-full'>
                            {DateTime.fromISO(deployment.pickupOut)
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy hh:mm a')}
                          </div>
                        ) : deployment.status === 'canceled' ? (
                          <p className='italic text-gray-400 font-light'>
                            Canceled
                          </p>
                        ) : (
                          <p className='italic text-gray-400 font-light'>
                            Pending
                          </p>
                        )}
                      </td>

                      <td>
                        {deployment.destArrival ? (
                          <div className='text-nowrap w-fit px-2 py-1 rounded-full'>
                            {DateTime.fromISO(deployment.destArrival)
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy hh:mm a')}
                          </div>
                        ) : deployment.status === 'canceled' ? (
                          <p className='italic text-gray-400 font-light'>
                            Canceled
                          </p>
                        ) : (
                          <p className='italic text-gray-400 font-light'>
                            Pending
                          </p>
                        )}
                      </td>

                      <td>
                        {deployment.destDeparture ? (
                          <div className='text-nowrap w-fit px-2 py-1 rounded-full'>
                            {DateTime.fromISO(deployment.destDeparture)
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy hh:mm a')}
                          </div>
                        ) : deployment.status === 'canceled' ? (
                          <p className='italic text-gray-400 font-light'>
                            Canceled
                          </p>
                        ) : (
                          <p className='italic text-gray-400 font-light'>
                            Pending
                          </p>
                        )}
                      </td>

                      <td>
                        {deployment.destArrival && deployment.destDeparture ? (
                          <div className='text-nowrap w-fit px-3 py-1 rounded-full bg-emerald-500 text-white'>
                            {(() => {
                              const { hours, minutes } = DateTime.fromISO(
                                deployment.destDeparture
                              ).diff(DateTime.fromISO(deployment.destArrival), [
                                'hours',
                                'minutes'
                              ])
                              return hours
                                ? `${hours}h ${Math.floor(minutes)}m`
                                : `${Math.floor(minutes)}m`
                            })()}
                          </div>
                        ) : deployment.status === 'canceled' ? (
                          <p className='italic text-gray-400 font-light'>
                            Canceled
                          </p>
                        ) : (
                          <p className='italic text-gray-400 font-light'>
                            Pending
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DeploymentDetailsModal
        isOpen={isDeploymentDetailsModalOpen}
        onClose={() => setIsDeploymentDetailsModalOpen(false)}
        deployment={selectedDeployment}
        drivers={allDrivers}
        trucks={allTrucks}
        onUpdate={handleUpdateAllDeployments}
        openDeleteModal={() => setIsDeleteDeploymentModalOpen(true)}
        openReplacementModal={() => setIsReplacementModalOpen(true)}
        openReplacementHistory={() => setShowReplacementHistory(true)}
        updatable={['head_admin', 'admin'].includes(userData.data.role)}
      />

      <CreateDeploymentModal
        isOpen={isCreateDeploymentModalOpen}
        onClose={() => setIsCreateDeploymentModalOpen(false)}
        trucks={allTrucks}
        drivers={allDrivers}
        onCreate={handleAddNewDeployment}
      />

      <ReplacementModal
        isOpen={isReplacementModalOpen}
        onClose={() => setIsReplacementModalOpen(false)}
        deployment={selectedDeployment}
        drivers={allDrivers}
        trucks={allTrucks}
        onUpdate={data => {
          setSelectedDeployment(data)
          handleUpdateAllDeployments(data)
        }}
      />

      <ReplacementHistoryModal
        isOpen={showReplacementHistory}
        onClose={() => setShowReplacementHistory(false)}
        deployment={selectedDeployment}
      />

      <DeleteDeploymentModal
        isOpen={isDeleteDeploymentModalOpen}
        onClose={() => setIsDeleteDeploymentModalOpen(false)}
        deployment={selectedDeployment}
        onDelete={handleRemoveDeletedDeployment}
      />
    </>
  )
}

export default Deployments
