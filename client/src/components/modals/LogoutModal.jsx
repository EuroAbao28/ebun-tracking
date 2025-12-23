import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { API_USER } from '../../utils/APIRoutes'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild
} from '@headlessui/react'
import { IoClose } from 'react-icons/io5'
import { TbLogout } from 'react-icons/tb'

function LogoutModal ({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [isLogoutLoading, setIsLogoutLoading] = useState(false)

  const handleLogout = async () => {
    setIsLogoutLoading(true)
    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.post(
        `${API_USER}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      toast.success(response.data.message || 'Logged out successfully')
      sessionStorage.removeItem('userToken')
      navigate('/')
      setIsLogoutLoading(false)
    } catch (error) {
      console.log(error)
      toast.success('Logged out successfully')
      setIsLogoutLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
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
            <div
              onClick={onClose}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </div>

            <header className='border-b border-gray-300 pb-3 font-semibold  text-xl'>
              Confirm Logout
            </header>

            <p className='mt-3'>Are you sure you want to logout?</p>

            <div className='flex mt-12 justify-end gap-2'>
              <button
                onClick={onClose}
                className='bg-gray-200 text-gray-600 rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm max-sm:flex-1 cursor-pointer hover:brightness-95'
              >
                Close
              </button>

              <button
                onClick={handleLogout}
                className='bg-red-500 text-white rounded py-2 px-8 font-semibold uppercase active:scale-95 transition-all text-sm cursor-pointer hover:brightness-95 flex gap-2'
              >
                {isLogoutLoading ? (
                  <>
                    <span className='loading loading-spinner loading-xs'></span>
                    Logging out
                  </>
                ) : (
                  <>
                    <TbLogout className='text-xl' />
                    Logout
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

export default LogoutModal
