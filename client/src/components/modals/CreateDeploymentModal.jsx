import React from 'react'
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
import { useState } from 'react'
import { MdKeyboardArrowDown, MdCheck } from 'react-icons/md'
import { toast } from 'react-toastify'
import { TRUCK_TYPES } from '../../utils/generalOptions'
import clsx from 'clsx'
import { PiMapPinAreaFill } from 'react-icons/pi'
import useCreateDeployment from '../../hooks/useCreateDeployment'
import { PICKUP_LOCATION } from '../../utils/deploymentOptions'
import { NumericFormat } from 'react-number-format'

function CreateDeploymentModal ({ isOpen, onClose, onCreate, trucks, drivers }) {
  const [formData, setFormData] = useState({
    truckId: '',
    driverId: '',
    truckType: '',
    helperCount: 0,
    pickupSite: '',
    destination: '',
    sacksCount: 0,
    departed: '',
    pickupIn: '',
    pickupOut: '',
    destArrival: '',
    destDeparture: ''
  })

  const { createDeploymentFunction, isLoading } = useCreateDeployment()

  // Search states
  const [truckQuery, setTruckQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')

  // Prepare options
  const truckOptions =
    trucks
      ?.filter(truck => truck.status === 'available')
      .map(truck => ({
        value: truck._id,
        label: `${truck.plateNo.toUpperCase()} (${truck.truckType})`
      })) || []

  const driverOptions =
    drivers
      ?.filter(driver => driver.status === 'available')
      .map(driver => ({
        value: driver._id,
        label: `${driver.firstname} ${driver.lastname}`
      })) || []

  // Filter options based on search
  const filteredTrucks =
    truckQuery === ''
      ? truckOptions
      : truckOptions.filter(truck =>
          truck.label.toLowerCase().includes(truckQuery.toLowerCase())
        )

  const filteredDrivers =
    driverQuery === ''
      ? driverOptions
      : driverOptions.filter(driver =>
          driver.label.toLowerCase().includes(driverQuery.toLowerCase())
        )

  const selectedTruck = truckOptions.find(
    truck => truck.value === formData.truckId
  )
  const selectedDriver = driverOptions.find(
    driver => driver.value === formData.driverId
  )

  const handleClose = () => {
    onClose()

    setFormData({
      truckId: '',
      driverId: '',
      truckType: '',
      helperCount: 0,
      pickupSite: '',
      destination: '',
      sacksCount: 0,
      departed: '',
      pickupIn: '',
      pickupOut: '',
      destArrival: '',
      destDeparture: ''
    })
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

    const result = await createDeploymentFunction(formData)

    if (result.deployment) {
      toast.success(result.message)
      console.log(result.truck)
      onCreate(result.deployment)
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
          <DialogPanel className='font-poppins text-gray-900 w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden relative '>
            {/* close button */}
            <button
              onClick={handleClose}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </button>

            <form onSubmit={handleSubmit} className='px-6 py-8 '>
              <h2 className='text-lg font-semibold'>Deploy Truck</h2>
              <div className='grid grid-cols-2 gap-x-6 gap-y-4 mt-4'>
                {/* Searchable Truck Select */}
                <div className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Select Truck
                  </span>
                  <Combobox
                    value={formData.truckId}
                    onChange={value =>
                      setFormData(prev => ({ ...prev, truckId: value }))
                    }
                  >
                    <div className='relative'>
                      <ComboboxInput
                        className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 capitalize'
                        displayValue={truck =>
                          selectedTruck ? selectedTruck.label : ''
                        }
                        onChange={event => setTruckQuery(event.target.value)}
                        placeholder='Search plate no.'
                        required
                        autoComplete='off'
                      />
                      <ComboboxButton className='absolute inset-y-0 right-0 flex items-center px-2 hover:bg-gray-100 rounded-sm'>
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
                              key={truck.value}
                              value={truck.value}
                              className={({ focus }) =>
                                `relative cursor-default select-none py-2 px-4 text-base ${
                                  focus ? 'bg-gray-50' : 'text-gray-900'
                                } ${
                                  formData.truckId === truck.value
                                    ? 'bg-gray-100'
                                    : ''
                                }`
                              }
                            >
                              {({ selected }) => (
                                <span className='block truncate capitalize'>
                                  {truck.label}
                                </span>
                              )}
                            </ComboboxOption>
                          ))
                        )}
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                </div>

                {/* Searchable Driver Select */}
                <div className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Select Driver
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
                        displayValue={driver =>
                          selectedDriver ? selectedDriver.label : ''
                        }
                        onChange={event => setDriverQuery(event.target.value)}
                        placeholder='Search driver name'
                        required
                        autoComplete='off'
                      />
                      <ComboboxButton className='absolute inset-y-0 right-0 flex items-center px-2 hover:bg-gray-100 rounded-sm'>
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
                              key={driver.value}
                              value={driver.value}
                              className={({ focus }) =>
                                `relative cursor-default select-none py-2 px-4 text-base ${
                                  focus ? 'bg-gray-50' : 'text-gray-900'
                                } ${
                                  formData.driverId === driver.value
                                    ? 'bg-gray-100'
                                    : ''
                                }`
                              }
                            >
                              {({ selected }) => (
                                <span className='block truncate capitalize'>
                                  {driver.label}
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
                      className='outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 appearance-none w-full'
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

                <InputField
                  label='Helper Count'
                  type='number'
                  name='helperCount'
                  placeholder='Helper Count'
                  value={formData.helperCount}
                  onChange={handleChange}
                  formatNumber={true}
                />

                <InputField
                  label='Pick-up Location'
                  type='text'
                  name='pickupSite'
                  placeholder='Pick-up Location'
                  value={formData.pickupSite}
                  onChange={handleChange}
                />

                {/* destination */}
                <label className='flex flex-col gap-1'>
                  <span className='uppercase text-xs text-gray-500 font-semibold'>
                    Destination
                  </span>
                  <div className='relative'>
                    <select
                      name='destination'
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      className='outline outline-gray-300 px-3 py-2 rounded focus:outline-2 focus:outline-gray-400 appearance-none w-full'
                    >
                      <option value='' disabled>
                        Select
                      </option>
                      {PICKUP_LOCATION.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                  </div>
                </label>

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
  placeholder = '',
  type,
  name,
  value,
  pattern,
  onChange,
  disabled,
  plateNoMaxLength,
  isRequired = true,
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
        value={value}
        minLength={2}
        maxLength={plateNoMaxLength || 50}
        pattern={pattern}
        onChange={onChange}
        disabled={disabled}
        required={isRequired}
        className={clsx(
          'outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400',
          {
            capitalize: type !== 'datetime-local'
          }
        )}
      />
    </label>
  )
}

export default CreateDeploymentModal
