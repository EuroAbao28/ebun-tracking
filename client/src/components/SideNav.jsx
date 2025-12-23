import React from 'react'
import { Link, useLocation } from 'react-router'
import { ebun_logo_light, logo } from '../consts/images'
import clsx from 'clsx'
import APP_CONFIG from '../config/version'
import { getNavItemsByRole, SIDEBAR_ITEMS } from '../consts/sidebarItems'
import { useUserContext } from '../contexts/UserContext'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect } from 'react'

function SideNav () {
  const location = useLocation()
  const { userData } = useUserContext()
  const filteredSidebar = getNavItemsByRole(userData.data.role)

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  return (
    <div
      data-aos='fade-right'
      className='min-w-68 min-h-screen bg-linear-to-b from-primaryColor to-slate-950 shadow-card3 flex flex-col'
    >
      <div className='flex items-center justify-center gap-3 p-6 border-b border-white/10'>
        <img src={ebun_logo_light} alt='' className='w-14 ' />
        <div>
          <h1 className='font-semibold text-4xl tracking-widest text-white uppercase'>
            Ebun
          </h1>
          <p className='text-white -mt-1.5 uppercase tracking-wider'>
            Freight Inc.
          </p>
        </div>
      </div>

      <div className='flex flex-col mt-4 px-4'>
        {filteredSidebar.map((content, index) => {
          if (content.type === 'header') {
            return (
              <p
                key={index}
                className='uppercase text-xs font-semibold px-6 py-3 text-white/30 not-first:mt-4'
              >
                {content.name}
              </p>
            )
          }

          return (
            <Link
              key={index}
              to={content.path}
              className={clsx(
                'flex items-center gap-4 px-6 py-3 active:scale-95 transition-transform rounded-sm',
                {
                  'bg-white/90 text-primaryColor font-medium':
                    location.pathname === content.path ||
                    location.pathname.includes(content.path),
                  'hover:bg-white/5 text-white/80':
                    !location.pathname === content.path ||
                    !location.pathname.includes(content.path)
                }
              )}
            >
              <p className='text-xl'>{content.icon}</p>
              <p className='text-sm'>{content.name}</p>
            </Link>
          )
        })}
      </div>

      {/* footer */}
      <div className='p-4 border-t border-white/10  mt-auto'>
        <p className='text-xs text-white/60 text-center leading-relaxed'>
          © {APP_CONFIG.year} {APP_CONFIG.name}
          <br />
          All rights reserved
        </p>
        <p className='text-xs text-white/40 text-center mt-1'>
          Version {APP_CONFIG.version}
        </p>
      </div>
    </div>
  )
}

export default SideNav
