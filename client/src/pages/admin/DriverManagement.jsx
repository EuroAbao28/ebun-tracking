import React, { useEffect, useState } from 'react'
import { FaFilter, FaPlus, FaSearch } from 'react-icons/fa'
import {
  empty_illustration,
  error_illustration,
  no_image,
  user_placeholder
} from '../../consts/images'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import clsx from 'clsx'
import CreateDriverModal from '../../components/modals/CreateDriverModal'
import DriverDetailsModal from '../../components/modals/DriverDetailsModal'
import useGetAllDriver from '../../hooks/useGetAllDriver'
import DeleteDriverModal from '../../components/modals/DeleteDriverModal'

const defaultFilters = {
  status: '',
  sort: 'latest',
  search: '',
  perPage: 40,
  page: 1
}

function DriverManagement () {
  const [isDriverDetailsModalOpen, setIsDriverDetailsModalOpen] =
    useState(false)
  const [isCreateDriverModalOpen, setIsCreateDriverModalOpen] = useState(false)
  const [isDeleteDriverModalOpen, setIsDeleteDriverModalOpen] = useState(false)

  const { getAllDriverFunction, isLoading } = useGetAllDriver()
  const [allDrivers, setAllDrivers] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)
  const [totalPages, setTotalPages] = useState(null)
  const [error, setError] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState({})

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

  const handleShowDriverDetailsModal = data => {
    setSelectedDriver(data)
    setIsDriverDetailsModalOpen(true)
  }

  // for updating the all admins with the updated driver
  const handleUpdateAllAdmins = updatedDriver => {
    setAllDrivers(prevAllDrivers =>
      prevAllDrivers.map(driver =>
        driver._id === updatedDriver._id ? updatedDriver : driver
      )
    )
  }

  // for removing the deleted driver
  const handleRemoveDeletedDriver = deletedDriver => {
    setAllDrivers(prev => prev.filter(driver => driver._id !== deletedDriver))
    setIsDeleteDriverModalOpen(false)
    setIsDriverDetailsModalOpen(false)
  }

  const handleAddNewDriver = newDriver => {
    console.log('NEW DRIVER', newDriver)
    setAllDrivers(prev => [newDriver, ...prev])
  }

  useEffect(() => {
    const handleGetAllDrivers = async () => {
      const { drivers, total, page, totalPages, error } =
        await getAllDriverFunction(filters)

      if (error) {
        setError(error)
      }

      setAllDrivers(drivers)
      setTotal(total)
      setPage(page)
      setTotalPages(totalPages)
    }

    handleGetAllDrivers()
  }, [filters])

  return (
    <>
      <div className='flex-1 flex flex-col gap-10'>
        {/* header */}
        <div className='flex items-center flex-wrap gap-x-12 gap-y-4'>
          <h1 className='font-semibold text-2xl mr-auto'>Manage Drivers</h1>

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
                      <option value='a-z'>A to Z</option>
                      <option value='z-a'>Z to A</option>
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
                      <option value='active'>Active</option>
                      <option value='inactive'>Inactive</option>
                    </select>
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
                disabled={isLoading}
                className='p-1 text-2xl hover:bg-gray-50 cursor-pointer border-r border-gray-200'
              >
                <MdOutlineKeyboardArrowLeft />
              </button>

              <p className='text-sm min-w-22 text-center'>
                {!isLoading &&
                  allDrivers &&
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

            {/* create button */}
            <button
              onClick={() => setIsCreateDriverModalOpen(true)}
              disabled={isLoading}
              className='flex items-center gap-4 bg-linear-to-b from-emerald-500 to-emerald-600 text-white text-nowrap rounded px-3 py-1 cursor-pointer active:scale-95 transition-all hover:brightness-95'
            >
              <FaPlus className='text-sm' />
              <p>Create New</p>
            </button>
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
        ) : allDrivers.length === 0 ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='flex flex-col justify-center items-center gap-4 px-4 text-center'>
              <img src={empty_illustration} alt='empty list' className='w-56' />
              <div className='space-y-2'>
                <h1 className='text-xl font-semibold text-gray-700'>
                  Nothing to show here
                </h1>
                <p className='text-gray-500 max-w-md leading-relaxed'>
                  {tempFilters.search || tempFilters.status
                    ? 'Try adjusting your search terms or filters to see more results'
                    : 'Get started by adding your first driver to the system'}
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
                    <td>Image</td>
                    <td>Fullname</td>
                    <td>Phone No.</td>
                    <td>License No.</td>
                    <td>Trip Count</td>
                    <td>Status</td>
                  </tr>
                </thead>
                <tbody>
                  {allDrivers.map((driver, index) => (
                    <tr
                      key={index}
                      onClick={() => handleShowDriverDetailsModal(driver)}
                      className='border-b border-gray-200 last:border-none hover:bg-gray-50 capitalize cursor-pointer'
                    >
                      <td className='text-xs font-bold text-gray-600'>
                        {(page - 1) * filters.perPage + index + 1}
                      </td>
                      <td className='py-0'>
                        <img
                          src={driver.imageUrl || no_image}
                          alt='img'
                          className={clsx(
                            'w-9 aspect-square object-cover object-center mask mask-squircle',
                            {
                              'opacity-10': !driver.imageUrl
                            }
                          )}
                        />
                      </td>
                      <td>
                        <p className='text-nowrap capitalize'>{`${driver.firstname} ${driver.lastname}`}</p>
                      </td>
                      <td>{driver.phoneNo}</td>
                      <td>
                        {driver.licenseNo ? (
                          <p className='text-nowrap uppercase'>
                            {driver.licenseNo}
                          </p>
                        ) : (
                          <p className='text-gray-500'>N/A</p>
                        )}
                      </td>
                      <td>{driver.tripCount}</td>
                      <td>
                        <div
                          className={clsx(
                            'rounded-full px-2 w-fit capitalize text-xs py-0.5',
                            {
                              'bg-emerald-500/10 text-emerald-500':
                                driver.status === 'available',
                              'bg-blue-500/10 text-blue-500':
                                driver.status === 'deployed',
                              'bg-red-500/10 text-red-500':
                                driver.status === 'unavailable'
                            }
                          )}
                        >
                          {driver.status}
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

      {/* driver details modal */}
      <DriverDetailsModal
        isOpen={isDriverDetailsModalOpen}
        onClose={() => setIsDriverDetailsModalOpen(false)}
        driver={selectedDriver}
        onUpdate={handleUpdateAllAdmins}
        openDeleteModal={() => setIsDeleteDriverModalOpen(true)}
      />

      {/* create driver modal */}
      <CreateDriverModal
        isOpen={isCreateDriverModalOpen}
        onClose={() => setIsCreateDriverModalOpen(false)}
        onCreate={handleAddNewDriver}
      />

      {/* delete driver modal */}
      <DeleteDriverModal
        isOpen={isDeleteDriverModalOpen}
        onClose={() => setIsDeleteDriverModalOpen(false)}
        driver={selectedDriver}
        onDelete={handleRemoveDeletedDriver}
      />
    </>
  )
}

export default DriverManagement
