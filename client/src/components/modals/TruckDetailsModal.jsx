import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild
} from '@headlessui/react'
import { FaSave, FaTrash, FaUserEdit } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { IoWarning } from 'react-icons/io5'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { toast } from 'react-toastify'
import { RiFolderUploadLine } from 'react-icons/ri'
import { DateTime } from 'luxon'
import { no_image, truck_placeholder } from '../../consts/images'
import {
  TRUCK_CONDITIONS,
  TRUCK_STATUSES,
  TRUCK_TOOLS,
  TRUCK_TYPES
} from '../../utils/generalOptions'
import useUpdateTruck from '../../hooks/useUpdateTruck'
import { NumericFormat } from 'react-number-format'

function TruckDetailsModal ({
  isOpen,
  onClose,
  truck,
  onUpdate,
  openDeleteModal
}) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const { updateTruckFunction, isLoading } = useUpdateTruck()

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

  // Tool handling functions
  const handleToolChange = e => {
    const { value, checked } = e.target

    setEditForm(prev => {
      if (checked) {
        // Add tool with default quantity of 1
        return {
          ...prev,
          tools: [...prev.tools, { tool: value, quantity: 1 }]
        }
      } else {
        // Remove tool
        return {
          ...prev,
          tools: prev.tools.filter(item => item.tool !== value)
        }
      }
    })
  }

  const handleUpdateTruck = async e => {
    e.preventDefault()

    console.log(editForm)

    const result = await updateTruckFunction(truck._id, editForm)

    if (result.success) {
      onUpdate(result.data.truck)
      toast.success(result.data.message)
      setIsEditMode(false)
      onClose()
    } else {
      console.log(result.error)
      toast.error(result.error)
    }
  }

  const handleCloseModal = () => {
    // setEditForm(truck)
    onClose()
  }

  const handleCancelEditMode = () => {
    setIsEditMode(false)
    setEditForm(truck)
    setSelectedFile(null)
    setPreviewImage(null)
  }

  useEffect(() => {
    if (isOpen && truck) {
      setEditForm(truck)
      setIsEditMode(false)
      setSelectedFile(null)
      setPreviewImage(null)
    }
  }, [isOpen, truck])

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
          <DialogPanel className='font-poppins text-gray-900 w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden relative '>
            {/* edit mode warning */}
            <p
              className={clsx(
                'bg-orange-500 text-white px-4 right-20 font-medium py-3 text-sm flex items-center gap-2  transition-all absolute rounded-b-md shadow-warning tracking-wider',
                {
                  '-translate-y-12': !isEditMode,
                  'translate-y-0': isEditMode
                }
              )}
            >
              <IoWarning className='text-xl' />
              EDIT MODE
            </p>

            {/* close button */}
            <button
              onClick={handleCloseModal}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </button>

            <form onSubmit={handleUpdateTruck} className='flex'>
              {/* image left side */}
              <div className='w-[20rem] bg-gray-50 p-6 flex flex-col items-center justify-center relative'>
                <div
                  className={clsx(
                    'w-full aspect-square bg-white border-3 border-dashed rounded-xl overflow-hidden p-3 relative group',
                    {
                      'border-gray-200': isEditMode,
                      'border-white': !isEditMode
                    }
                  )}
                >
                  <img
                    src={previewImage || truck?.imageUrl || no_image}
                    alt={truck?.plateNo}
                    className={clsx(
                      'w-full h-full object-center object-cover rounded-xl',
                      {
                        'opacity-20': !previewImage && !truck?.imageUrl
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

              {/* right side */}
              <div className='px-6 py-8 flex-1'>
                <h2 className='text-lg font-semibold'>Truck Details</h2>

                {/* fields */}
                <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-4'>
                  <InputField
                    label='Plate No.'
                    type='text'
                    name='plateNo'
                    placeholder='Plate No.'
                    value={editForm?.plateNo}
                    disabled={!isEditMode}
                    isUppercase={true}
                    onChange={handleChange}
                  />

                  {/* type */}
                  <label className='flex flex-col gap-1'>
                    <span className='uppercase text-xs text-gray-500 font-semibold'>
                      Type
                    </span>

                    {isEditMode ? (
                      <div className='relative'>
                        <select
                          name='truckType'
                          value={editForm?.truckType}
                          onChange={handleChange}
                          className='outline outline-gray-200 px-3 py-2 rounded focus:outline-gray-400 appearance-none w-full capitalize'
                        >
                          {TRUCK_TYPES.map((item, index) => (
                            <option key={index} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                      </div>
                    ) : (
                      <p className='outline outline-gray-200 px-3 py-2 rounded break-all capitalize'>
                        {editForm?.truckType}
                      </p>
                    )}
                  </label>

                  {/* status */}
                  <label className='flex flex-col gap-1'>
                    <span className='uppercase text-xs text-gray-500 font-semibold'>
                      Status
                    </span>

                    {isEditMode ? (
                      <div className='relative'>
                        <select
                          name='status'
                          value={editForm?.status}
                          onChange={handleChange}
                          className='outline outline-gray-200 px-3 py-2 rounded focus:outline-gray-400 appearance-none w-full capitalize'
                        >
                          {TRUCK_STATUSES.map((item, index) => (
                            <option key={index} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                      </div>
                    ) : (
                      <div className='outline outline-gray-200 px-3 py-2 rounded'>
                        <p
                          className={clsx(
                            'capitalize w-fit px-2 py-0.5 rounded-full text-sm font-medium',
                            {
                              'bg-emerald-500/10 text-emerald-500':
                                editForm?.status === 'available',
                              'bg-red-500/10 text-red-500':
                                editForm?.status === 'unavailable'
                            }
                          )}
                        >
                          {editForm?.status}
                        </p>
                      </div>
                    )}
                  </label>

                  <InputField
                    label='Max Load'
                    type='number'
                    name='maxLoad'
                    placeholder='Max Load'
                    value={editForm?.maxLoad}
                    disabled={!isEditMode}
                    formatNumber={true}
                    onChange={handleChange}
                  />

                  <div className='col-span-full flex gap-6 border-t-2 border-dashed border-gray-100 mt-6 pt-6 transition-all'>
                    <label className='flex flex-col gap-1 flex-1'>
                      <span className='uppercase text-xs text-gray-500 font-semibold'>
                        Created At
                      </span>
                      <p className='outline outline-gray-200 px-3 py-2 rounded'>
                        {DateTime.fromISO(truck.createdAt).toLocaleString(
                          DateTime.DATETIME_MED
                        )}
                      </p>
                    </label>

                    <label className='flex flex-col gap-1 flex-1'>
                      <span className='uppercase text-xs text-gray-500 font-semibold'>
                        Last Update
                      </span>
                      <p className='outline outline-gray-200 px-3 py-2 rounded'>
                        {DateTime.fromISO(truck.updatedAt).toLocaleString(
                          DateTime.DATETIME_MED
                        )}
                      </p>
                    </label>
                  </div>

                  <div className='flex gap-4 col-span-full'>
                    {isEditMode ? (
                      <>
                        <button
                          type='button'
                          onClick={handleCancelEditMode}
                          disabled={isLoading}
                          className='mt-12 bg-linear-to-b from-gray-100 to-gray-200 text-gray-600  px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                        >
                          Cancel
                        </button>
                        <button
                          type='submit'
                          disabled={isLoading}
                          className='mt-12 bg-linear-to-b from-emerald-500 to-emerald-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex justify-center items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
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
                          className='mt-12 bg-linear-to-b from-blue-500 to-blue-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                        >
                          <FaUserEdit className='text-base -mt-0.5' />
                          Edit
                        </button>

                        <button
                          type='button'
                          onClick={openDeleteModal}
                          disabled={isLoading}
                          className='mt-12 bg-linear-to-b from-red-500 to-red-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                        >
                          <FaTrash className='text-base -mt-0.5' />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
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
  placeholder,
  value,
  onChange,
  disabled,
  isRequired = true,
  isCapitalize = true,
  isUppercase = false,
  // New props for number formatting
  formatNumber = false,
  thousandSeparator = true,
  decimalScale = 0,
  allowNegative = false
}) => {
  if (formatNumber && type === 'number') {
    return (
      <label className={`col-span-${colSpan} flex flex-col gap-1`}>
        <span className='uppercase text-xs text-gray-500 font-semibold text-nowrap'>
          {label}
        </span>
        <NumericFormat
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          allowNegative={allowNegative}
          value={value}
          onValueChange={values => {
            const syntheticEvent = {
              target: {
                name: name,
                value: values.floatValue || ''
              }
            }
            onChange(syntheticEvent)
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={isRequired}
          className='outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400'
        />
      </label>
    )
  }

  return (
    <label className={`col-span-${colSpan} flex flex-col gap-1`}>
      <span className='uppercase text-xs text-gray-500 font-semibold'>
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        minLength={2}
        maxLength={30}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className={clsx(
          'outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400 w-full',
          {
            uppercase: isUppercase
          }
        )}
      />
    </label>
  )
}

export default TruckDetailsModal
