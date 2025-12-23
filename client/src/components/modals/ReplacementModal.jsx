import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton
} from '@headlessui/react'
import { IoClose } from 'react-icons/io5'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { toast } from 'react-toastify'
import {
  TRUCK_REPLACEMENT_REASONS,
  TRUCK_TYPES
} from '../../utils/generalOptions'
import clsx from 'clsx'
import { PiMapPinAreaFill } from 'react-icons/pi'
import useUpdateDeployment from '../../hooks/useUpdateDeployment'

function ReplacementModal ({
  isOpen,
  onClose,
  deployment,
  drivers,
  trucks,
  updateSelectedDeployment,
  onUpdate
}) {
  const [formData, setFormData] = useState({
    truckId: '',
    driverId: '',
    truckType: '',
    helperCount: 0,
    replacedAt: '',
    reason: '',
    remarks: ''
  })

  // Search states
  const [truckQuery, setTruckQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')

  const { updateDeploymentFunction, isLoading } = useUpdateDeployment()

  // Filter trucks and drivers based on search
  const filteredTrucks =
    trucks?.filter(
      truck =>
        truck.plateNo.toLowerCase().includes(truckQuery.toLowerCase()) &&
        truck.status === 'available' &&
        truck._id !== deployment?.truckId?._id
    ) || []

  const filteredDrivers =
    drivers?.filter(
      driver =>
        (driver.firstname.toLowerCase().includes(driverQuery.toLowerCase()) ||
          driver.lastname.toLowerCase().includes(driverQuery.toLowerCase())) &&
        driver.status === 'available' &&
        driver._id !== deployment?.driverId?._id
    ) || []

  // Get selected option labels
  const selectedTruck = trucks?.find(truck => truck._id === formData.truckId)
  const selectedDriver = drivers?.find(
    driver => driver._id === formData.driverId
  )

  const handleClose = () => {
    onClose()
    setTruckQuery('')
    setDriverQuery('')
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // create deployment
  const handleSubmit = async e => {
    e.preventDefault()

    console.log('FROM MODAL', formData)

    const replacement = {
      replacementTruckId: formData.truckId,
      replacementDriverId: formData.driverId,
      replacementTruckType: formData.truckType,
      replacementHelperCount: formData.helperCount,
      replacedAt: formData.replacedAt,
      reason: formData.reason,
      remarks: formData.remarks
    }

    const result = await updateDeploymentFunction(deployment._id, {
      replacement
    })

    if (result.success) {
      console.log(result.data.deployment)
      toast.success(result.data.message)

      onUpdate(result.data.deployment)
      handleClose()
    } else {
      console.log(result.error)
      toast.error(result.error)
    }
  }

  useEffect(() => {
    if (isOpen && deployment) {
      setFormData({
        truckId: '',
        driverId: '',
        truckType: '',
        helperCount: 0,
        replacedAt: '',
        reason: '',
        remarks: ''
      })
      setTruckQuery('')
      setDriverQuery('')
    }
  }, [isOpen, deployment])

  return (
    <Dialog open={isOpen} onClose={() => onClose()} className='relative z-50'>
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
          <DialogPanel className='font-poppins text-gray-900 w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden relative '>
            {/* close button */}
            <button
              onClick={() => handleClose()}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </button>

            <form onSubmit={handleSubmit} className='px-6 py-8 '>
              <h2 className='text-lg font-semibold'>Replacement Truck</h2>
              <div className='grid grid-cols-2 gap-x-6 gap-y-4 mt-4'>
                {/* select truck */}
                <div className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Replacement Truck
                  </span>
                  <Combobox
                    value={formData.truckId}
                    onChange={value =>
                      setFormData(prev => ({ ...prev, truckId: value }))
                    }
                  >
                    <div className='relative'>
                      <ComboboxInput
                        className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 uppercase'
                        displayValue={truckId =>
                          selectedTruck ? selectedTruck.plateNo : ''
                        }
                        onChange={event => setTruckQuery(event.target.value)}
                        required
                      />
                      <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                        <MdKeyboardArrowDown className='h-5 w-5 text-gray-400' />
                      </ComboboxButton>
                      <ComboboxOptions className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white outline-1 outline-gray-300 py-1 text-base shadow-sm focus:outline-none sm:text-sm'>
                        {filteredTrucks.length === 0 ? (
                          <div className='relative cursor-default select-none px-4 py-2 text-gray-700'>
                            Nothing found.
                          </div>
                        ) : (
                          filteredTrucks.map(truck => (
                            <ComboboxOption
                              key={truck._id}
                              value={truck._id}
                              className={({ focus }) =>
                                `relative cursor-default select-none py-2 px-4 text-base ${
                                  focus ? 'bg-gray-50' : 'text-gray-900'
                                } ${
                                  formData.truckId === truck._id
                                    ? 'bg-gray-100'
                                    : ''
                                }`
                              }
                            >
                              {({ selected }) => (
                                <span className='block truncate uppercase'>
                                  {truck.plateNo}
                                </span>
                              )}
                            </ComboboxOption>
                          ))
                        )}
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                </div>

                {/* select driver */}
                <div className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Replacement Driver
                  </span>
                  <Combobox
                    value={formData.driverId}
                    onChange={value =>
                      setFormData(prev => ({ ...prev, driverId: value }))
                    }
                  >
                    <div className='relative'>
                      <ComboboxInput
                        className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 capitalize'
                        displayValue={driverId =>
                          selectedDriver
                            ? `${selectedDriver.firstname} ${selectedDriver.lastname}`
                            : ''
                        }
                        onChange={event => setDriverQuery(event.target.value)}
                        required
                      />
                      <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                        <MdKeyboardArrowDown className='h-5 w-5 text-gray-400' />
                      </ComboboxButton>
                      <ComboboxOptions className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white outline-1 outline-gray-300 py-1 text-base shadow-sm focus:outline-none sm:text-sm'>
                        {filteredDrivers.length === 0 ? (
                          <div className='relative cursor-default select-none px-4 py-2 text-gray-700'>
                            Nothing found.
                          </div>
                        ) : (
                          filteredDrivers.map(driver => (
                            <ComboboxOption
                              key={driver._id}
                              value={driver._id}
                              className={({ focus }) =>
                                `relative cursor-default select-none py-2 px-4 text-base ${
                                  focus ? 'bg-gray-50' : 'text-gray-900'
                                } ${
                                  formData.driverId === driver._id
                                    ? 'bg-gray-100'
                                    : ''
                                }`
                              }
                            >
                              {({ selected }) => (
                                <span className='block truncate capitalize'>
                                  {`${driver.firstname} ${driver.lastname}`}
                                </span>
                              )}
                            </ComboboxOption>
                          ))
                        )}
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                </div>

                {/* type */}
                <label className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Truck Type
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

                {/* helper count */}
                <InputField
                  label='Helper Count'
                  type='number'
                  name='helperCount'
                  placeholder='Helper Count'
                  value={formData.helperCount}
                  onChange={handleChange}
                />

                {/* replace at */}
                <InputField
                  label='Replaced At'
                  type='datetime-local'
                  name='replacedAt'
                  placeholder='Replaced At'
                  isCapitalize={false}
                  value={formData.replacedAt}
                  onChange={handleChange}
                />

                {/* reason */}
                <label className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Reason
                  </span>
                  <div className='relative'>
                    <select
                      name='reason'
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className='outline outline-gray-300 px-3 py-2 rounded focus:outline-2 focus:outline-gray-400 appearance-none w-full'
                    >
                      <option value='' disabled>
                        Select
                      </option>
                      {TRUCK_REPLACEMENT_REASONS.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                  </div>
                </label>

                {/* remarks */}
                <label className='col-span-full flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Remarks
                  </span>
                  <textarea
                    name='remarks'
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={3}
                    placeholder='Write a message here...'
                    className='outline outline-gray-300 px-3 py-2 rounded focus:outline-2 focus:outline-gray-400 appearance-none w-full resize-none'
                  />
                </label>

                {/* submit button */}
                <div className='col-span-full mt-6'>
                  <button
                    type='submit'
                    className='bg-linear-to-b from-emerald-500 to-emerald-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                  >
                    {isLoading ? (
                      <>
                        <span className='loading loading-spinner loading-xs'></span>
                        Deploying
                      </>
                    ) : (
                      <>
                        <PiMapPinAreaFill className='text-xl' />
                        Deploy Truck
                      </>
                    )}
                  </button>
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
  maxLength,
  isRequired = true,
  isCapitalize = true,
  isUpperCase = false,
  isFullWidth = true
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
        value={value}
        minLength={2}
        maxLength={maxLength || 30}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className={clsx(
          'outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400 ',
          {
            capitalize: isCapitalize,
            uppercase: isUpperCase,
            'w-56': !isFullWidth,
            'w-full': isFullWidth
          }
        )}
      />
    </label>
  )
}

export default ReplacementModal
