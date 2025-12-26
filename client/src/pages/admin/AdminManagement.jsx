import React, { useEffect, useState } from 'react'
import { FaFilter, FaPlus, FaSearch } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md'
import {
  empty_illustration,
  error_illustration,
  no_image,
  user_placeholder
} from '../../consts/images'
import useGetAllUser from '../../hooks/useGetAllUser'
import clsx from 'clsx'
import UserDetailsModal from '../../components/modals/UserDetailsModal'
import { USER_STATUS_TYPES } from '../../utils/userOptions'
import CreateAdminModal from '../../components/modals/CreateAdminModal'
import DeleteUserModal from '../../components/modals/DeleteUserModal'

const defaultFilters = {
  role: 'admin',
  status: '',
  sort: 'latest',
  search: '',
  perPage: 40,
  page: 1
}

function AdminManagement () {
  const [isAdminDetailsModalOpen, setIsAdminDetailsModalOpen] = useState(false)
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false)
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false)

  const { getAllUserFunction, isLoading } = useGetAllUser()
  const [allAdmins, setAllAdmins] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(null)
  const [totalPages, setTotalPages] = useState(null)
  const [error, setError] = useState(null)
  const [selectedAdmin, setSelectedAdmin] = useState({})

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

  const handleShowDVisitorDetailsModal = data => {
    setSelectedAdmin(data)
    setIsAdminDetailsModalOpen(true)
  }

  const handleUpdateAllUsers = updatedUser => {
    setAllAdmins(prev =>
      prev.map(visitor =>
        visitor._id === updatedUser._id ? updatedUser : visitor
      )
    )
  }

  const handleRemoveDeletedUser = deletedUser => {
    setAllAdmins(prev => prev.filter(driver => driver._id !== deletedUser))
    setIsDeleteAdminModalOpen(false)
    setIsAdminDetailsModalOpen(false)
  }

  const handleAddNewAdmin = newAdmin => {
    console.log('NEW ADMIN', newAdmin)
    setAllAdmins(prev => [newAdmin, ...prev])
  }

  useEffect(() => {
    const handleGetAllUsers = async () => {
      const { users, total, page, totalPages, error } =
        await getAllUserFunction(filters)

      if (error) {
        setError(error)
      }

      setAllAdmins(users)
      setTotal(total)
      setPage(page)
      setTotalPages(totalPages)
    }

    handleGetAllUsers()
  }, [filters])

  return (
    <>
      <div className='flex-1 flex flex-col gap-10'>
        {/* header */}
        <div className='flex items-center flex-wrap gap-x-12 gap-y-4'>
          <h1 className='font-semibold text-2xl mr-auto'>Manage Admins</h1>

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
                      {USER_STATUS_TYPES.map((status, index) => (
                        <option key={index} value={status.value}>
                          {status.label}
                        </option>
                      ))}
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
                  allAdmins &&
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
              onClick={() => setIsCreateAdminModalOpen(true)}
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
        ) : allAdmins.length === 0 ? (
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
                    : 'Get started by adding your first visitor to the system'}
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
                    <td>Email</td>
                    <td>Phone No.</td>
                    <td>Role</td>
                    <td>Status</td>
                  </tr>
                </thead>
                <tbody>
                  {allAdmins.map((visitor, index) => (
                    <tr
                      key={index}
                      onClick={() => handleShowDVisitorDetailsModal(visitor)}
                      className='border-b border-gray-200 last:border-none hover:bg-gray-50 cursor-pointer'
                    >
                      <td className='text-xs font-bold text-gray-600'>
                        {(page - 1) * filters.perPage + index + 1}
                      </td>
                      <td className='py-0'>
                        <img
                          src={visitor.imageUrl || no_image}
                          alt='img'
                          className={clsx(
                            'w-9 aspect-square object-cover object-center mask mask-squircle',
                            {
                              'opacity-10': !visitor.imageUrl
                            }
                          )}
                        />
                      </td>
                      <td>
                        <p className='text-nowrap capitalize'>{`${visitor.firstname} ${visitor.lastname}`}</p>
                      </td>
                      <td>{visitor.email}</td>
                      <td>{visitor.phoneNo}</td>
                      <td className='capitalize'>{visitor.role}</td>
                      <td>
                        <div
                          className={clsx(
                            'rounded-full px-2 w-fit capitalize text-xs py-0.5',
                            {
                              'bg-orange-500/10 text-orange-500':
                                visitor.status === 'pending',
                              'bg-gray-500/10 text-gray-500':
                                visitor.status === 'rejected' ||
                                visitor.status === 'revoked',
                              'bg-emerald-500/10 text-emerald-500':
                                visitor.status === 'active',
                              'bg-red-500/10 text-red-500':
                                visitor.status === 'inactive'
                            }
                          )}
                        >
                          {visitor.status}
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

      <UserDetailsModal
        isOpen={isAdminDetailsModalOpen}
        onClose={() => setIsAdminDetailsModalOpen(false)}
        user={selectedAdmin}
        onUpdate={handleUpdateAllUsers}
        openDeleteModal={() => setIsDeleteAdminModalOpen(true)}
      />

      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onCreate={handleAddNewAdmin}
      />

      <DeleteUserModal
        isOpen={isDeleteAdminModalOpen}
        onClose={() => setIsDeleteAdminModalOpen(false)}
        user={selectedAdmin}
        onDelete={handleRemoveDeletedUser}
      />
    </>
  )
}

export default AdminManagement
