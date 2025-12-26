import React, { useState } from 'react'
import LiveClock from './LiveClock'
import { Link } from 'react-router'
import { TbLogout, TbUserSquareRounded } from 'react-icons/tb'
import { useUserContext } from '../contexts/UserContext'
import LogoutModal from './modals/LogoutModal'
import { no_image, placeholder_user, user_placeholder } from '../consts/images'
import clsx from 'clsx'

function TopBar () {
  const { userData } = useUserContext()

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  return (
    <>
      <header className='bg-white py-2 px-8 flex items-center shadow-card3'>
        <LiveClock />

        <div className='ml-auto dropdown'>
          <div
            tabIndex={0}
            role='button'
            className='flex items-center gap-4 cursor-pointer'
          >
            <div className='flex flex-col items-end'>
              <p className='text-sm font-semibold text-nowrap capitalize'>
                {userData.data._id
                  ? `${userData.data.firstname} ${userData.data.lastname}`
                  : ''}
              </p>
              <span className='text-xs capitalize'>
                {userData?.data?.role?.replace('_', ' ')}
              </span>
            </div>
            <img
              src={userData.data.imageUrl || no_image}
              className={clsx(
                'w-10 aspect-square mask mask-squircle object-cover object-center',
                {
                  'opacity-10': !userData?.userData?.imageUrl
                }
              )}
            />
          </div>

          <ul
            tabIndex={0}
            className='dropdown-content menu right-0 mt-2 bg-white shadow-sm rounded w-60 outline outline-gray-300'
          >
            <li>
              <Link
                to='/secure/my-profile'
                className='flex gap-3 items-center px-6 py-3 hover:bg-gray-50 rounded-sm'
              >
                <TbUserSquareRounded className='text-xl' />
                <p className='text-sm'>My Profile</p>
              </Link>
            </li>

            <li>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className='flex gap-3 items-center px-6 py-3 hover:bg-gray-50 cursor-pointer rounded-sm'
              >
                <TbLogout className='text-xl' />
                <p className='text-sm'>Logout</p>
              </button>
            </li>
          </ul>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  )
}

export default TopBar
