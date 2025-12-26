import React, { useEffect, useState } from 'react'
import { useUserContext } from '../../contexts/UserContext'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { no_image } from '../../consts/images'
import { FaSave, FaTrash, FaUserEdit } from 'react-icons/fa'
import useUpdateUser from '../../hooks/useUpdateUser'
import { RiFolderUploadLine } from 'react-icons/ri'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { toast } from 'react-toastify'

function MyProfile () {
  const { updateUserFunction, isLoading } = useUpdateUser()
  const { userData, updateUser } = useUserContext()

  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const user = userData?.data || {}

  const handleChange = e => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  // Handle file selection
  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      setPreviewImage(URL.createObjectURL(file))
      // Update form state
      setEditForm(prev => ({ ...prev, image: file }))
    }
  }

  const handleUpdateUser = async e => {
    e.preventDefault()

    console.log(editForm)

    const result = await updateUserFunction(user._id, editForm)

    if (result.success) {
      toast.success(result.data.message)

      setEditForm(result.data.user)
      updateUser(result.data.user)

      setIsEditMode(false)
    } else {
      console.log(result.error)
      toast.error(result.error)
    }
  }

  const handleCloseModal = () => {
    // setEditForm(user)
    onClose()
  }

  const handleCancelEditMode = () => {
    setIsEditMode(false)
    setEditForm(user)
    setSelectedFile(null)
    setPreviewImage(null)
  }

  useEffect(() => {
    if (user) {
      setEditForm(user)
      setIsEditMode(false)
      setSelectedFile(null)
      setPreviewImage(null)
    }
  }, [user])

  return (
    <div>
      <h1 className='font-semibold text-2xl mr-auto'>My Profile</h1>

      <form onSubmit={handleUpdateUser} className='flex gap-6 items-start mt-6'>
        <div className='w-[20rem] flex flex-col items-center justify-center relative'>
          <div
            className={clsx(
              'w-full aspect-square bg-white border-3 border-dashed rounded-xl overflow-hidden p-3 relative group mt-11',
              {
                'border-gray-200': isEditMode,
                'border-white': !isEditMode
              }
            )}
          >
            <img
              src={previewImage || user?.imageUrl || no_image}
              alt={user?.firstname}
              className={clsx(
                'w-full h-full object-center object-cover rounded-xl',
                {
                  'opacity-20': !previewImage && !user?.imageUrl
                }
              )}
            />

            {isEditMode && (
              <>
                {/* Hover overlay */}
                <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer text-whit font-medium text-white'>
                  <RiFolderUploadLine className='text-4xl ' />
                  Upload Image
                </div>

                {/* Hidden file input */}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
              </>
            )}
          </div>

          {isEditMode && selectedFile && (
            <p className='mt-4 text-sm line-clamp-2 text-center w-full text-gray-600'>
              {selectedFile.name}
            </p>
          )}
        </div>

        <div className='grid grid-cols-2 gap-x-6 gap-y-4 mt-6 w-full max-w-2xl'>
          <InputField
            label='Firstname'
            type='text'
            name='firstname'
            placeholder='Firstname'
            value={editForm?.firstname}
            disabled={!isEditMode || isLoading}
            onChange={handleChange}
          />
          <InputField
            label='Lastname'
            type='text'
            name='lastname'
            placeholder='Lastname'
            value={editForm?.lastname}
            disabled={!isEditMode || isLoading}
            onChange={handleChange}
          />
          <InputField
            label='Email'
            type='email'
            name='email'
            placeholder='Email'
            value={editForm?.email}
            disabled={!isEditMode || isLoading}
            onChange={handleChange}
            isCapitalize={false}
          />
          <InputField
            label='Phone No.'
            type='tel'
            name='phoneNo'
            placeholder='Phone No.'
            value={editForm?.phoneNo}
            disabled={!isEditMode || isLoading}
            onChange={handleChange}
          />
          <InputField
            label='Role'
            type='text'
            name='role'
            placeholder='Role'
            value={editForm?.role?.replace('_', ' ')}
            disabled={true}
            onChange={handleChange}
          />
          <InputField
            label='Logout Count'
            type='number'
            name='logoutCount'
            value={user.loginCount}
            disabled={true}
            onChange={handleChange}
          />

          <div className='border-t-2 border-dashed border-gray-100 mt-6 pt-6 col-span-2 grid grid-cols-2 gap-6'>
            <label className='flex flex-col gap-1'>
              <span className='uppercase text-xs text-gray-500 font-semibold'>
                {user.role === 'admin' || user.role === 'head_admin'
                  ? 'Created At'
                  : 'Access Request At'}
              </span>
              <p className='outline outline-gray-200 px-3 py-2 rounded'>
                {DateTime.fromISO(user.createdAt).toLocaleString(
                  DateTime.DATETIME_MED
                )}
              </p>
            </label>

            <label className='flex flex-col gap-1'>
              <span className='uppercase text-xs text-gray-500 font-semibold'>
                Updated At
              </span>
              <p className='outline outline-gray-200 px-3 py-2 rounded'>
                {DateTime.fromISO(user.updatedAt).toLocaleString(
                  DateTime.DATETIME_MED
                )}
              </p>
            </label>
          </div>
          <div className='flex gap-4 col-span-full mt-4'>
            {isEditMode ? (
              <>
                <button
                  type='button'
                  onClick={handleCancelEditMode}
                  disabled={isLoading}
                  className='bg-linear-to-b from-gray-100 to-gray-200 text-gray-600  px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='bg-linear-to-b from-emerald-500 to-emerald-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex justify-center items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                >
                  {isLoading ? (
                    <>
                      <span className='loading loading-spinner loading-xs'></span>
                      Saving
                    </>
                  ) : (
                    <>
                      <FaSave className='text-base -mt-0.5' />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type='button'
                  onClick={() => setIsEditMode(true)}
                  disabled={isLoading}
                  className='bg-linear-to-b from-blue-500 to-blue-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                >
                  <FaUserEdit className='text-base -mt-0.5' />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

const InputField = ({
  colSpan = 1,
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  disabled,
  isRequired = true,
  isCapitalize = true
}) => {
  return (
    <label className={`col-span-${colSpan} flex flex-col gap-1`}>
      <span className='uppercase text-xs text-gray-500 font-semibold'>
        {label}
      </span>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        minLength={2}
        maxLength={30}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className={clsx(
          'outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400 w-full ',
          {
            capitalize: isCapitalize
          }
        )}
      />
    </label>
  )
}

export default MyProfile
