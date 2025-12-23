import React from 'react'
import {
  FaLock,
  FaEnvelope,
  FaUserShield,
  FaUser,
  FaSave,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaShieldAlt,
  FaInfoCircle
} from 'react-icons/fa'
import logo from '../../assets/yza_logo.png'
import { Link, useNavigate } from 'react-router'
import {
  LuAtSign,
  LuBriefcase,
  LuBriefcaseBusiness,
  LuBuilding,
  LuBuilding2,
  LuUpload
} from 'react-icons/lu'
import { useState } from 'react'
import axios from 'axios'
import { API_USER } from '../../utils/APIRoutes'
import { toast } from 'react-toastify'
import { ebun_logo_dark, signup_bg } from '../../consts/images'
import clsx from 'clsx'
import useCreateUser from '../../hooks/userCreateUser'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect } from 'react'

function SignupPage () {
  const navigate = useNavigate()
  const [previewImage, setPreviewImage] = useState(null)
  const { createUserFunction, isLoading } = useCreateUser()

  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    phoneNo: '',
    role: 'visitor',
    status: 'pending',
    password: '',
    confirmPassword: '',
    image: {}
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = e => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result)
        setFormData(prev => ({
          ...prev,
          image: file
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewImage(null)
      setFormData(prev => ({
        ...prev,
        image: null
      }))
    }
  }

  const handleRequestAccess = async e => {
    e.preventDefault()

    console.log('FROM MODAL', formData)

    const result = await createUserFunction(formData)

    if (result.user) {
      toast.success(result.message)

      console.log(result.user)
      navigate('/')
    } else {
      toast.error(result)
    }
  }

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-center items-center'>
      <div
        data-aos='fade-down'
        className='bg-white shadow-lg overflow-hidden rounded-xl flex max-w-5xl'
      >
        {/* left */}
        <div
          style={{ backgroundImage: `url(${signup_bg})` }}
          className='w-full lg:w-[40%] bg-center bg-cover overflow-hidden relative'
        >
          <div className='p-6 lg:p-8 bg-linear-to-br from-slate-700/90 to-primaryColor/90 h-full text-white flex flex-col justify-between'>
            {/* Overlay content */}
            <div className='flex-1 flex flex-col'>
              {/* Logo and Title */}
              <div className='mb-8'>
                <h2 className='text-2xl font-bold mb-2'>Create Your Account</h2>
              </div>

              {/* Instructions */}
              <div className='space-y-6'>
                <div className='flex items-start gap-4'>
                  <div className='bg-white/20 p-2 rounded-full mt-1'>
                    <FaUser className='text-lg' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-lg mb-1'>
                      Fill Registration Form
                    </h3>
                    <p className='text-white/80 text-sm'>
                      Provide your personal information in the registration form
                      including name, email, and contact details.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='bg-white/20 p-2 rounded-full mt-1'>
                    <FaClock className='text-lg' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-lg mb-1'>
                      Wait for Approval
                    </h3>
                    <p className='text-white/80 text-sm'>
                      Your account will be in{' '}
                      <span className='font-semibold'>pending status</span>{' '}
                      while our admin team reviews your registration.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='bg-white/20 p-2 rounded-full mt-1'>
                    <FaUserCheck className='text-lg' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-lg mb-1'>
                      Admin Verification
                    </h3>
                    <p className='text-white/80 text-sm'>
                      Our administrators will verify your information and
                      approve your account access within 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='bg-white/20 p-2 rounded-full mt-1'>
                    <FaCheckCircle className='text-lg' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-lg mb-1'>Get Started</h3>
                    <p className='text-white/80 text-sm'>
                      Once approved, you'll receive an email notification and
                      can immediately start using our platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className='mt-8 pt-6 border-t border-white/20'>
              <p className='text-sm text-center text-white/90'>
                <span className='font-semibold'>Secure & Confidential:</span>{' '}
                Your information is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>

        {/* right */}
        <div className=' flex-1 py-6  px-8 flex flex-col gap-12'>
          {/* header */}
          <div className='flex flex-col gap-2 justify-center items-center'>
            <div className='flex items-center justify-center gap-3 mt-2'>
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

            <p className='text-gray-600 text-sm text-center'>
              Complete the form below to create your account
            </p>
          </div>

          <form
            onSubmit={handleRequestAccess}
            className='grid grid-cols-2 gap-x-6 gap-y-4'
          >
            <div className='col-span-2 flex gap-x-6'>
              <div className='row-span-2 flex flex-col gap-1'>
                <span className='uppercase text-xs text-gray-500 font-semibold'>
                  Image
                </span>

                <div className='w-31.5 aspect-square relative border border-gray-300 rounded-md overflow-hidden'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                  />

                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt=''
                      className='w-full h-full object-center object-cover rounded-md'
                    />
                  ) : (
                    <div className='flex flex-col items-center gap-1 justify-center h-full'>
                      <LuUpload className='text-4xl text-gray-500' />
                      <p className='text-xs text-gray-500'>Upload image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex-1 space-y-6'>
                <InputField
                  label='Firstname'
                  type='text'
                  name='firstname'
                  placeholder='Firstname'
                  value={formData.firstname}
                  onChange={handleChange}
                />

                <InputField
                  label='Lastname'
                  type='text'
                  name='lastname'
                  placeholder='Lastname'
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
            </div>

            <InputField
              label='Email'
              type='email'
              name='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              isCapitalize={false}
            />

            <InputField
              label='Phone No.'
              type='tel'
              name='phoneNo'
              placeholder='Phone No.'
              pattern='^(09|\+639)\d{9}$'
              value={formData.phoneNo}
              onChange={handleChange}
              phoneMaxLength={11}
            />

            <InputField
              label='Password'
              type='password'
              name='password'
              placeholder='Password (min. 8 characters)'
              value={formData.password}
              onChange={handleChange}
            />

            <InputField
              label='Confirm Password'
              type='password'
              name='confirmPassword'
              placeholder='Confirm Password'
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <div className='mt-8 col-span-full'>
              <button
                type='submit'
                className='bg-linear-to-b from-slate-700 to-primaryColor text-white px-8 py-3 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95 w-full justify-center'
              >
                {isLoading ? (
                  <>
                    <span className='loading loading-spinner loading-xs'></span>
                    Submitting Registration
                  </>
                ) : (
                  <>Create Account</>
                )}
              </button>

              <div className='mt-4 text-center'>
                <p className='text-gray-500 text-sm'>
                  Already have an account?{' '}
                  <Link
                    to='/'
                    className='text-primaryColor font-semibold hover:underline'
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const InputField = ({
  colSpan = 1,
  label,
  type,
  name,
  value,
  placeholder,
  pattern,
  onChange,
  disabled,
  phoneMaxLength,
  isRequired = true,
  isCapitalize = true,
  isUppercase = false
}) => {
  return (
    <label
      className={clsx('flex flex-col gap-1', {
        'col-span-2': colSpan === 2
      })}
    >
      <span className='uppercase text-xs text-gray-500 font-semibold'>
        {label} {isRequired && '*'}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        minLength={type === 'password' ? 8 : 2}
        maxLength={phoneMaxLength || 30}
        pattern={pattern}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className={clsx(
          'outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-2 focus:outline-primaryColor transition-all',
          {
            capitalize: isCapitalize,
            uppercase: isUppercase
          }
        )}
      />
    </label>
  )
}

export default SignupPage
