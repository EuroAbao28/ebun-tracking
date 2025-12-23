import React, { useEffect, useState } from 'react'
import { FaLock, FaEnvelope, FaUserShield, FaUser } from 'react-icons/fa'
import logo from '../../assets/yza_logo.png'
import useLogin from '../../hooks/useLogin'
import { Link } from 'react-router'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { ebun_logo_dark } from '../../consts/images'

function LoginPage () {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const { loginFunction, isLoading } = useLogin()

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    await loginFunction(formData)
  }

  useEffect(() => {
    sessionStorage.removeItem('userToken')

    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  return (
    <div className='min-h-screen p-6 bg-gray-50 text-gray-800 flex flex-col justify-center items-center'>
      {/* header */}
      <div data-aos='fade-down' className='flex flex-col items-center'>
        <div className='flex items-center justify-center gap-3 '>
          <img src={ebun_logo_dark} alt='' className='w-18' />
          <div>
            <h1 className='font-semibold text-5xl tracking-widest text-primaryColor uppercase'>
              Ebun
            </h1>
            <p className='text-primaryColor -mt-1.5 uppercase tracking-wider text-xl'>
              Freight Inc.
            </p>
          </div>
        </div>

        <p className='mt-6 text-gray-500 text-sm'>
          Welcome to your professional dashboard
        </p>
      </div>

      {/* form */}
      <form
        onSubmit={handleSubmit}
        data-aos='fade-down'
        className='mt-6 rounded-xl shadow-lg bg-white p-8 max-w-md w-full'
      >
        <label className='flex flex-col gap-1'>
          <span className='text-gray-600 text-sm font-medium'>Email</span>
          <div className='group flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 focus-within:border-white focus-within:ring-primaryColor/50 focus-within:ring-2 transition-all shadow-sm'>
            <FaUser className='text-gray-400 group-focus-within:text-primaryColor transition-all' />
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='focus:outline-none w-full'
            />
          </div>
        </label>

        <label className='flex flex-col gap-1 mt-4'>
          <span className='text-gray-600 text-sm font-medium'>Password</span>
          <div className='group flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 focus-within:border-white focus-within:ring-primaryColor/50 focus-within:ring-2 transition-all shadow-sm'>
            <FaLock className='text-gray-400 group-focus-within:text-primaryColor transition-all' />
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className='focus:outline-none w-full'
            />
          </div>
        </label>

        <button
          type='submit'
          className='bg-linear-to-b from-slate-700 to-primaryColor text-white w-full mt-9 rounded-lg py-3 font-medium shadow-sm flex items-center gap-2 justify-center hover:brightness-95 transition-all cursor-pointer'
        >
          {isLoading ? (
            <>
              <span className='loading loading-spinner loading-sm'></span>
              <span>Authenticating...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <p className='text-gray-500 mt-4 text-sm text-center'>
          Doesn't have an account yet?{' '}
          <Link
            to={'/signup'}
            className='text-primaryColor font-semibold hover:underline'
          >
            Sign up
          </Link>
        </p>

        <p className='text-center text-xs text-gray-500 mt-6'>
          © 2025 Yza's Agricultural Services
        </p>
      </form>
    </div>
  )
}

export default LoginPage
