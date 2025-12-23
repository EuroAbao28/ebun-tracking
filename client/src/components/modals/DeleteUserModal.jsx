import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild
} from '@headlessui/react'
import axios from 'axios'
import React, { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { toast } from 'react-toastify'
import { API_USER } from '../../utils/APIRoutes'

function DeleteUserModal ({ user, isOpen, onClose, onDelete }) {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const handleDeleteDriver = async () => {
    setIsDeleteLoading(true)

    try {
      const token = sessionStorage.getItem('userToken')

      const response = await axios.delete(
        `${API_USER}/soft-delete/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log(response.data)

      toast.success(response.data.message)

      onDelete(user._id)

      onClose()
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong!')
      console.log(error)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const handleCloseModal = () => {
    if (isDeleteLoading) return

    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleCloseModal} className='relative z-50'>
      {/* Backdrop */}
      <TransitionChild
        enter='ease-out duration-300'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-in duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <DialogBackdrop className='fixed inset-0 bg-black/30 backdrop-blur-sm' />
      </TransitionChild>

      {/* Modal container */}
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <TransitionChild
          enter='ease-out duration-300'
          enterFrom='opacity-0 -translate-y-8'
          enterTo='opacity-100 translate-y-0'
          leave='ease-in duration-200'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 -translate-y-8'
        >
          <DialogPanel className='bg-white font-poppins rounded-2xl max-w-lg w-full text-gray-900 p-6 shadow relative'>
            {/* close button */}
            <button
              onClick={handleCloseModal}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </button>

            <header className='border-b border-gray-300 pb-3 font-semibold text-xl'>
              Delete Admin
            </header>

            <p className='mt-3'>
              Are you sure you want to delete
              <span className='underline capitalize'>{` ${user?.firstname} ${user?.lastname}`}</span>
              ?
            </p>

            <div className='flex mt-12 justify-end gap-2'>
              <button
                onClick={onClose}
                disabled={isDeleteLoading}
                className='bg-gray-200 text-gray-600 rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm max-sm:flex-1 cursor-pointer hover:brightness-95'
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteDriver}
                className='bg-red-500 text-white rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm cursor-pointer flex items-center justify-center gap-2 hover:brightness-95'
              >
                {isDeleteLoading ? (
                  <>
                    <span className='loading loading-spinner loading-xs'></span>
                    Deleting
                  </>
                ) : (
                  <>
                    <FaTrash className='text-base -mt-0.5' />
                    Delete
                  </>
                )}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  )
}

export default DeleteUserModal
