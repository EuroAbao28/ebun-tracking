import React from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild
} from '@headlessui/react'
import { IoClose } from 'react-icons/io5'
import { useState } from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { LuUpload } from 'react-icons/lu'
import { FaSave } from 'react-icons/fa'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import { USER_STATUS_TYPES } from '../../utils/userOptions'
import useCreateUser from '../../hooks/userCreateUser'

function CreateAdminModal ({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNo: '',
    role: 'admin',
    status: 'active',
    password: '',
    confirmPassword: '',
    image: {}
  })

  const [previewImage, setPreviewImage] = useState(null)
  const { createUserFunction, isLoading } = useCreateUser()

  const handleClose = () => {
    // Clean up preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage)
    }

    onClose()

    setPreviewImage(null)
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      phoneNo: '',
      role: 'admin',
      status: 'active',
      password: '',
      confirmPassword: '',
      image: {}
    })
  }

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

  // create driver
  const handleSubmit = async e => {
    e.preventDefault()

    console.log('FROM MODAL', formData)

    const result = await createUserFunction(formData)

    if (result.user) {
      toast.success(result.message)

      console.log(result.user)

      onCreate(result.user)
      handleClose()
    } else {
      toast.error(result)
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className='relative z-50'>
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
          <DialogPanel className='font-poppins text-gray-900 w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden flex relative'>
            {/* close button */}
            <button
              onClick={handleClose}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </button>

            {/* image */}
            <div className='w-[20rem] bg-gray-50 p-6 flex flex-col items-center justify-center'>
              <div className='w-full aspect-square bg-white border-3 border-gray-200 border-dashed rounded-xl overflow-hidden p-3 relative'>
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
                    className='w-full h-full object-center object-cover rounded-xl'
                  />
                ) : (
                  <div className='h-full flex flex-col gap-2 items-center justify-center text-gray-600'>
                    <LuUpload className='text-4xl ' />
                    Upload Image
                  </div>
                )}
              </div>

              {formData.image && formData.image.name ? (
                <p className='mt-4 text-sm line-clamp-2 text-center w-full text-gray-600'>
                  {formData.image.name}
                </p>
              ) : (
                <p className='mt-4 text-sm line-clamp-2 text-center w-full text-gray-600 opacity-0'>
                  None
                </p>
              )}
            </div>

            {/* desc */}
            <div className='flex-1 bg-white px-6 py-8'>
              <h2 className='text-lg font-semibold'>Create New Admin</h2>

              <form
                onSubmit={handleSubmit}
                className='mt-4 grid grid-cols-2 gap-x-6 gap-y-4'
              >
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
                  placeholder='Password'
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

                <div className='mt-12 col-span-full'>
                  <button
                    type='submit'
                    className='bg-linear-to-b from-emerald-500 to-emerald-600
                     text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                  >
                    {isLoading ? (
                      <>
                        <span className='loading loading-spinner loading-xs'></span>
                        Creating
                      </>
                    ) : (
                      <>
                        <FaSave className='text-base -mt-0.5' />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  )
}

const InputField = ({
  colSpan = 1,
  label,
  type,
  name,
  value,
  pattern,
  onChange,
  disabled,
  phoneMaxLength,
  isRequired = true,
  isCapitalize = true,
  isUppercase = false
}) => {
  return (
    <label className={`col-span-${colSpan} flex flex-col gap-1`}>
      <span className='uppercase text-xs text-gray-500 font-semibold'>
        {label}
      </span>
      <input
        type={type}
        name={name}
        // placeholder={placeholder}
        value={value}
        minLength={2}
        maxLength={phoneMaxLength || 30}
        pattern={pattern}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className={clsx(
          'outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400',
          {
            capitalize: isCapitalize,
            uppercase: isUppercase
          }
        )}
      />
    </label>
  )
}

export default CreateAdminModal
