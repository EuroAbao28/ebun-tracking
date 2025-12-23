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
import useCreateTruck from '../../hooks/useCreateTruck'
import { TRUCK_STATUSES, TRUCK_TYPES } from '../../utils/generalOptions'

function CreateTruckModal ({ isOpen, onClose, onCreate, allTools }) {
  const [formData, setFormData] = useState({
    plateNo: '',
    truckType: '',
    status: '',
    image: {}
  })

  const [previewImage, setPreviewImage] = useState(null)
  const { createTruckFunction, isLoading } = useCreateTruck()

  const handleClose = () => {
    // Clean up preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage)
    }

    onClose()

    setPreviewImage(null)
    setFormData({
      plateNo: '',
      truckType: '',
      status: '',
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

  const handleToolChange = e => {
    const { value, checked } = e.target
    const tool = allTools.find(t => t._id === value)

    setFormData(prev => {
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

  const handleQuantityChange = (toolId, quantity) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map(item =>
        item.tool === toolId
          ? { ...item, quantity: parseInt(quantity) || 1 }
          : item
      )
    }))
  }

  // Check if a tool is selected
  const isToolSelected = toolId => {
    return formData.tools.some(item => item.tool === toolId)
  }

  // Get quantity for a selected tool
  const getToolQuantity = toolId => {
    const toolItem = formData.tools.find(item => item.tool === toolId)
    return toolItem ? toolItem.quantity : 1
  }

  // create truck
  const handleSubmit = async e => {
    e.preventDefault()

    console.log('FROM MODAL', formData)

    const result = await createTruckFunction(formData)

    if (result.truck) {
      toast.success(result.message)

      console.log(result.truck)

      onCreate(result.truck)
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

              {formData.image && (
                <p className='mt-4 text-sm line-clamp-2 text-center w-full text-gray-600'>
                  {formData.image.name}
                </p>
              )}
            </div>

            {/* input field */}
            <div className='flex-1 bg-white px-6 py-8'>
              <h2 className='text-lg font-semibold'>Create New Truck</h2>

              <form
                onSubmit={handleSubmit}
                className='mt-4 grid grid-cols-2 gap-x-6 gap-y-4'
              >
                <InputField
                  label='Plate No.'
                  type='text'
                  name='plateNo'
                  placeholder='Plate No.'
                  plateNoMaxLength={7}
                  value={formData.plateNo}
                  onChange={handleChange}
                />

                {/* type */}
                <label className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Type
                  </span>
                  <div className='relative'>
                    <select
                      name='truckType'
                      value={formData.truckType}
                      onChange={handleChange}
                      required
                      className='outline outline-gray-300 px-3 py-2 rounded focus:outline-2 focus:outline-gray-400 appearance-none w-full'
                    >
                      <option value='' disabled>
                        Select
                      </option>
                      {TRUCK_TYPES.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                  </div>
                </label>

                {/* status */}
                <label className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Status
                  </span>
                  <div className='relative'>
                    <select
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className='outline outline-gray-300 px-3 py-2 rounded focus:outline-2 focus:outline-gray-400 appearance-none w-full'
                    >
                      <option value='' disabled>
                        Select
                      </option>
                      {TRUCK_STATUSES.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                  </div>
                </label>

                <div className='mt-12 col-span-full'>
                  <button
                    type='submit'
                    className='bg-linear-to-b from-emerald-500 to-emerald-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
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
  plateNoMaxLength,
  isRequired = true
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
        maxLength={plateNoMaxLength || 30}
        pattern={pattern}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400 uppercase'
      />
    </label>
  )
}

export default CreateTruckModal
