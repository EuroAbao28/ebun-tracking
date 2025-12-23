import React from 'react'
import { Outlet, useLocation } from 'react-router'
import Topbar from '../components/Topbar'
import SideNav from '../components/SideNav'
import clsx from 'clsx'
import { useUserContext } from '../contexts/UserContext'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

function UserLayout () {
  const location = useLocation()
  const { userData } = useUserContext()

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  return (
    <div className='h-screen w-screen flex text-gray-800 bg-gray-50'>
      {/* sidenav */}
      <SideNav user={userData.data} />

      {/* main content div */}
      <div data-aos='fade-down' className='flex-1 flex flex-col'>
        {/* topbar */}
        <Topbar />

        {/* main content */}
        <div
          className={clsx('m-8 flex-1 flex flex-col', {
            'rounded bg-white shadow-card3 p-6':
              location.pathname !== '/secure/calendar'
          })}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default UserLayout
