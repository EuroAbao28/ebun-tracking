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
import clsx from 'clsx'
import { IoClose, IoWarning } from 'react-icons/io5'
import {
  DEPLOYMENT_STATUS,
  TRUCK_CONDITIONS,
  TRUCK_TYPES
} from '../../utils/generalOptions'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { useEffect, useState } from 'react'
import { FaPen, FaSave, FaTrash, FaUserEdit } from 'react-icons/fa'
import { DateTime } from 'luxon'
import useUpdateDeployment from '../../hooks/useUpdateDeployment'
import { toast } from 'react-toastify'
import { HiDotsHorizontal } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import { LuClock } from 'react-icons/lu'
import { PICKUP_LOCATION } from '../../utils/deploymentOptions'

function DeploymentDetailsModal ({
  isOpen,
  onClose,
  trucks,
  drivers,
  deployment,
  onUpdate,
  openDeleteModal,
  openReplacementModal,
  openReplacementHistory,
  updatable
}) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [isReplacementShow, setIsReplacementShow] = useState(false)

  // Search states
  const [truckQuery, setTruckQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')
  const [replacementTruckQuery, setReplacementTruckQuery] = useState('')
  const [replacementDriverQuery, setReplacementDriverQuery] = useState('')

  const { updateDeploymentFunction, isLoading } = useUpdateDeployment()

  const handleChange = e => {
    const { name, value } = e.target

    // check if the name contains dots (nested property)
    if (name.includes('.')) {
      const [parent, child] = name.split('.')

      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      // handle regular flat properties
      setEditForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handle combobox changes
  const handleComboboxChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleUpdateDeployment = async e => {
    e.preventDefault()

    console.log(editForm)

    const result = await updateDeploymentFunction(deployment._id, editForm)

    if (result.success) {
      onUpdate(result.data.deployment)
      toast.success(result.data.message)
      onClose()
    } else {
      console.log(result.error)
      toast.error(result.error)
    }
  }

  const handleCloseModal = () => {
    setEditForm(deployment)
    setIsReplacementShow(false)
    setTruckQuery('')
    setDriverQuery('')
    setReplacementTruckQuery('')
    setReplacementDriverQuery('')
    onClose()
  }

  const handleCancelEditMode = () => {
    setIsEditMode(false)
    setEditForm(deployment)
    setTruckQuery('')
    setDriverQuery('')
    setReplacementTruckQuery('')
    setReplacementDriverQuery('')
  }

  useEffect(() => {
    console.log(deployment)
    if (isOpen && deployment) {
      setIsEditMode(false)
      setEditForm(deployment)
    }
  }, [isOpen, deployment])

  useEffect(() => {
    console.log(deployment)

    if (deployment?.replacement?.replacementTruckId?._id) {
      console.log('HAS REPLACEMENT')
      setIsReplacementShow(true)
    } else {
      console.log('NO REPLACEMENT')
      setIsReplacementShow(false)
    }
  }, [deployment, isOpen])

  // Filter trucks and drivers based on search
  const filteredTrucks =
    trucks?.filter(
      truck =>
        truck.status === 'available' && // Only show available trucks
        (truck.plateNo.toLowerCase().includes(truckQuery.toLowerCase()) ||
          truck.truckType.toLowerCase().includes(truckQuery.toLowerCase()))
    ) || []

  const filteredDrivers =
    drivers?.filter(
      driver =>
        driver.status === 'available' && // Only show available drivers
        (driver.firstname.toLowerCase().includes(driverQuery.toLowerCase()) ||
          driver.lastname.toLowerCase().includes(driverQuery.toLowerCase()))
    ) || []

  const filteredReplacementTrucks =
    trucks?.filter(
      truck =>
        truck.plateNo
          .toLowerCase()
          .includes(replacementTruckQuery.toLowerCase()) ||
        truck.truckType
          .toLowerCase()
          .includes(replacementTruckQuery.toLowerCase())
    ) || []

  const filteredReplacementDrivers =
    drivers?.filter(
      driver =>
        driver.firstname
          .toLowerCase()
          .includes(replacementDriverQuery.toLowerCase()) ||
        driver.lastname
          .toLowerCase()
          .includes(replacementDriverQuery.toLowerCase())
    ) || []

  // Get current values for display
  const currentTruckId = isReplacementShow
    ? editForm?.replacement?.replacementTruckId?._id
    : editForm?.truckId?._id

  const currentDriverId = isReplacementShow
    ? editForm?.replacement?.replacementDriverId?._id
    : editForm?.driverId?._id

  const currentTruck = trucks?.find(truck => truck._id === currentTruckId)
  const currentDriver = drivers?.find(driver => driver._id === currentDriverId)

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
          <DialogPanel className='font-poppins text-gray-900 w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden relative'>
            {/* edit mode warning */}
            <p
              className={clsx(
                'bg-orange-500 text-white px-4 right-26 font-medium py-3 text-sm flex items-center gap-2  transition-all absolute rounded-b-md shadow-warning tracking-wider',
                {
                  '-translate-y-12': !isEditMode,
                  'translate-y-0': isEditMode
                }
              )}
            >
              <IoWarning className='text-xl' />
              EDIT MODE
            </p>

            {/* top right buttons */}
            <div className='absolute top-4 right-4 flex items-center gap-2'>
              {/* replacement history button */}
              <div className='dropdown dropdown-bottom dropdown-end'>
                <div
                  tabIndex={0}
                  role='button'
                  className='hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-500 cursor-pointer transition-all'
                >
                  <HiDotsHorizontal />
                </div>
                <ul
                  tabIndex={0}
                  className='dropdown-content menu shadow-sm rounded-box p-0 bg-white'
                >
                  <li>
                    <div
                      onClick={openReplacementHistory}
                      className='px-6 py-2 text-nowrap cursor-pointer hover:bg-gray-50 bg-white border border-gray-200'
                    >
                      Replacement History
                    </div>
                  </li>
                </ul>
              </div>

              {/* close button */}
              <button
                onClick={handleCloseModal}
                className='hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
              >
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleUpdateDeployment} className='flex'>
              {/* timeline */}
              <div className='bg-gray-100 min-w-60 px-6 py-8 border-r border-gray-200'>
                <h2 className='text-lg font-semibold mb-4 -ml-2'>
                  Transport Log
                </h2>
                <div className='flex flex-col'>
                  {/* departed */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? editForm.departed?.trim()
                              : deployment.departed?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !editForm.departed?.trim()
                                : !deployment.departed?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500': isEditMode
                              ? editForm.departed?.trim()
                              : deployment.departed?.trim(),
                            'bg-gray-300': isEditMode
                              ? !editForm.departed?.trim()
                              : !deployment.departed?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      {isEditMode ? (
                        <InputField
                          label='Departed'
                          type='datetime-local'
                          name='departed'
                          placeholder='Departed'
                          isCapitalize={false}
                          isRequired={false}
                          isFullWidth={false}
                          value={editForm?.departed}
                          disabled={!isEditMode}
                          onChange={handleChange}
                          isDarkerOutline={true}
                        />
                      ) : (
                        <label className='flex flex-col gap-1'>
                          <p className='text-xs font-semibold uppercase text-gray-500'>
                            Departed
                          </p>
                          {deployment.departed ? (
                            <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                              {DateTime.fromISO(deployment.departed)
                                .setZone('Asia/Manila')
                                .toFormat('MMM d, yyyy - hh:mm a')}
                            </p>
                          ) : (
                            <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                              Pending
                            </p>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* pickup in */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? editForm.pickupIn?.trim()
                              : deployment.pickupIn?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !editForm.pickupIn?.trim()
                                : !deployment.pickupIn?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500': isEditMode
                              ? editForm.pickupIn?.trim()
                              : deployment.pickupIn?.trim(),
                            'bg-gray-300': isEditMode
                              ? !editForm.pickupIn?.trim()
                              : !deployment.pickupIn?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      {isEditMode ? (
                        <InputField
                          label='Pick-up In'
                          type='datetime-local'
                          name='pickupIn'
                          placeholder='Pick-up In'
                          isCapitalize={false}
                          isRequired={false}
                          isFullWidth={false}
                          value={editForm?.pickupIn}
                          disabled={!isEditMode || !editForm?.departed}
                          onChange={handleChange}
                          isDarkerOutline={true}
                        />
                      ) : (
                        <label className='flex flex-col gap-1'>
                          <p className='text-xs font-semibold uppercase text-gray-500'>
                            Pick-up In
                          </p>
                          {deployment.pickupIn ? (
                            <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                              {DateTime.fromISO(deployment.pickupIn)
                                .setZone('Asia/Manila')
                                .toFormat('MMM d, yyyy - hh:mm a')}
                            </p>
                          ) : (
                            <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                              Pending
                            </p>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* pickup out */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? editForm.pickupOut?.trim()
                              : deployment.pickupOut?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !editForm.pickupOut?.trim()
                                : !deployment.pickupOut?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500': isEditMode
                              ? editForm.pickupOut?.trim()
                              : deployment.pickupOut?.trim(),
                            'bg-gray-300': isEditMode
                              ? !editForm.pickupOut?.trim()
                              : !deployment.pickupOut?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      {isEditMode ? (
                        <InputField
                          label='Pick-up Out'
                          type='datetime-local'
                          name='pickupOut'
                          placeholder='Pick-up Out'
                          isCapitalize={false}
                          isRequired={false}
                          isFullWidth={false}
                          value={editForm?.pickupOut}
                          disabled={!isEditMode || !editForm?.pickupIn}
                          onChange={handleChange}
                          isDarkerOutline={true}
                        />
                      ) : (
                        <label className='flex flex-col gap-1'>
                          <p className='text-xs font-semibold uppercase text-gray-500'>
                            Pick-up Out
                          </p>
                          {deployment.pickupOut ? (
                            <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                              {DateTime.fromISO(deployment.pickupOut)
                                .setZone('Asia/Manila')
                                .toFormat('MMM d, yyyy - hh:mm a')}
                            </p>
                          ) : (
                            <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                              Pending
                            </p>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* dest arrival */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? editForm.destArrival?.trim()
                              : deployment.destArrival?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !editForm.destArrival?.trim()
                                : !deployment.destArrival?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500': isEditMode
                              ? editForm.destArrival?.trim()
                              : deployment.destArrival?.trim(),
                            'bg-gray-300 shadow-inner': isEditMode
                              ? !editForm.destArrival?.trim()
                              : !deployment.destArrival?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      {isEditMode ? (
                        <InputField
                          label='Dest Arrival'
                          type='datetime-local'
                          name='destArrival'
                          placeholder='Dest Arrival'
                          isCapitalize={false}
                          isRequired={false}
                          isFullWidth={false}
                          value={editForm?.destArrival}
                          disabled={!isEditMode || !editForm?.pickupOut}
                          onChange={handleChange}
                          isDarkerOutline={true}
                        />
                      ) : (
                        <label className='flex flex-col gap-1'>
                          <p className='text-xs font-semibold uppercase text-gray-500'>
                            Dest Arrival
                          </p>
                          {deployment.destArrival ? (
                            <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                              {DateTime.fromISO(deployment.destArrival)
                                .setZone('Asia/Manila')
                                .toFormat('MMM d, yyyy - hh:mm a')}
                            </p>
                          ) : (
                            <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                              Pending
                            </p>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* dest departure */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? editForm.destDeparture?.trim()
                              : deployment.destDeparture?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !editForm.destDeparture?.trim()
                                : !deployment.destDeparture?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500': isEditMode
                              ? editForm.destDeparture?.trim()
                              : deployment.destDeparture?.trim(),
                            'bg-gray-300 shadow-inner': isEditMode
                              ? !editForm.destDeparture?.trim()
                              : !deployment.destDeparture?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      {isEditMode ? (
                        <InputField
                          label='Dest Departure'
                          type='datetime-local'
                          name='destDeparture'
                          placeholder='Dest Departure'
                          isCapitalize={false}
                          isRequired={false}
                          isFullWidth={false}
                          value={editForm?.destDeparture}
                          disabled={!isEditMode || !editForm?.destArrival}
                          onChange={handleChange}
                          isDarkerOutline={true}
                        />
                      ) : (
                        <label className='flex flex-col gap-1'>
                          <p className='text-xs font-semibold uppercase text-gray-500'>
                            Dest Departure
                          </p>
                          {deployment.destDeparture ? (
                            <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                              {DateTime.fromISO(deployment.destDeparture)
                                .setZone('Asia/Manila')
                                .toFormat('MMM d, yyyy - hh:mm a')}
                            </p>
                          ) : (
                            <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                              Pending
                            </p>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* unloading time */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? editForm.destDeparture?.trim()
                              : deployment.destDeparture?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !editForm.destDeparture?.trim()
                                : !deployment.destDeparture?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Unloading Time
                        </p>
                        {deployment?.destDeparture ||
                        deployment?.destArrival ? (
                          <div className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400 flex items-center gap-2'>
                            {/* <LuClock /> */}
                            {(() => {
                              const { days, hours, minutes } = DateTime.fromISO(
                                editForm.destDeparture
                              ).diff(DateTime.fromISO(editForm.destArrival), [
                                'days',
                                'hours',
                                'minutes'
                              ])

                              const totalHours = days * 24 + hours

                              const formatDays = () => {
                                const parts = []
                                if (days > 0) parts.push(`${days}d`)
                                if (hours > 0) parts.push(`${hours}h`)
                                if (minutes > 0)
                                  parts.push(`${Math.floor(minutes)}m`)
                                return (
                                  parts.join(' ') || `${Math.floor(minutes)}m`
                                )
                              }

                              const formatTotalHours = () => {
                                if (totalHours > 0) {
                                  return `${totalHours}h${
                                    minutes > 0
                                      ? ` ${Math.floor(minutes)}m`
                                      : ''
                                  }`
                                }
                                return `${Math.floor(minutes)}m`
                              }

                              if (totalHours >= 24) {
                                return `${formatDays()} (${formatTotalHours()})`
                              } else if (hours > 0) {
                                return `${hours}h ${Math.floor(minutes)}m`
                              } else {
                                return `${Math.floor(minutes)}m`
                              }
                            })()}
                          </div>
                        ) : (
                          <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                            Pending
                          </p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* deployment details */}
              <div className='px-6 py-8 flex-1 flex flex-col'>
                <div className='flex items-center gap-3'>
                  <h2 className='text-lg font-semibold'>Deployment Details</h2>
                  <div
                    className='bg-gray-100 px-2 py-1 rounded-md shadow-card3 text-sm font-medium relative cursor-copy'
                    onClick={e => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(deployment.deploymentCode)

                      // Show feedback tooltip
                      const div = e.currentTarget
                      const tooltip = document.createElement('div')
                      tooltip.className =
                        'absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50'
                      tooltip.textContent = 'Copied'

                      div.appendChild(tooltip)

                      // Remove after 1 second
                      setTimeout(() => {
                        if (div.contains(tooltip)) {
                          div.removeChild(tooltip)
                        }
                      }, 1000)
                    }}
                    title='Click to copy'
                  >
                    #{editForm?.deploymentCode}
                  </div>
                </div>

                {!isReplacementShow ? (
                  // Original truck details
                  <div className='mt-3 space-y-2'>
                    <h3 className='text-xs uppercase font-semibold text-gray-500'>
                      Truck Details
                    </h3>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-4 border border-gray-200 rounded-md p-6'>
                      {/* plate no. */}
                      <label className='flex flex-col gap-1'>
                        <span className='uppercase text-xs text-gray-500 font-semibold'>
                          Plate No.
                        </span>
                        {isEditMode ? (
                          <Combobox
                            value={
                              // Handle both object and string formats
                              typeof editForm?.truckId === 'object'
                                ? editForm?.truckId?._id
                                : editForm?.truckId
                            }
                            onChange={value =>
                              handleComboboxChange('truckId', value)
                            }
                          >
                            <div className='relative'>
                              <ComboboxInput
                                className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 uppercase'
                                displayValue={truckId => {
                                  // Handle both object and string ID formats
                                  const actualId =
                                    typeof truckId === 'object'
                                      ? truckId?._id
                                      : truckId
                                  const truck = trucks?.find(
                                    t => t._id === actualId
                                  )
                                  return truck ? truck.plateNo : ''
                                }}
                                onChange={event =>
                                  setTruckQuery(event.target.value)
                                }
                                required
                              />
                              <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                <MdKeyboardArrowDown className='h-5 w-5 text-gray-400' />
                              </ComboboxButton>
                              <ComboboxOptions className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white outline-1 outline-gray-300 py-1 text-base shadow-sm focus:outline-none sm:text-sm'>
                                {filteredTrucks.length === 0 &&
                                truckQuery !== '' ? (
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
                                          // Handle both object and string formats for comparison
                                          (typeof editForm?.truckId === 'object'
                                            ? editForm?.truckId?._id
                                            : editForm?.truckId) === truck._id
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
                        ) : (
                          <p className='outline outline-gray-200 px-3 py-2 rounded break-all uppercase'>
                            {currentTruck?.plateNo}
                          </p>
                        )}
                      </label>

                      {/* type */}
                      <label className='flex flex-col gap-1'>
                        <span className='uppercase text-xs text-gray-500 font-semibold'>
                          Truck Type
                        </span>
                        {isEditMode ? (
                          <div className='relative'>
                            <select
                              name='truckType'
                              value={editForm?.truckType}
                              onChange={handleChange}
                              className='outline outline-gray-300 px-3 py-2 rounded focus:outline-gray-400 appearance-none w-full capitalize'
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

                      {/* driver */}
                      <label className='flex flex-col gap-1'>
                        <span className='uppercase text-xs text-gray-500 font-semibold'>
                          Driver
                        </span>
                        {isEditMode ? (
                          <Combobox
                            value={
                              // Handle both object and string formats
                              typeof editForm?.driverId === 'object'
                                ? editForm?.driverId?._id
                                : editForm?.driverId
                            }
                            onChange={value =>
                              handleComboboxChange('driverId', value)
                            }
                          >
                            <div className='relative'>
                              <ComboboxInput
                                className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 capitalize'
                                displayValue={driverId => {
                                  // Handle both object and string ID formats
                                  const actualId =
                                    typeof driverId === 'object'
                                      ? driverId?._id
                                      : driverId
                                  const driver = drivers?.find(
                                    d => d._id === actualId
                                  )
                                  return driver
                                    ? `${driver.firstname} ${driver.lastname}`
                                    : ''
                                }}
                                onChange={event =>
                                  setDriverQuery(event.target.value)
                                }
                                required
                              />
                              <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                <MdKeyboardArrowDown className='h-5 w-5 text-gray-400' />
                              </ComboboxButton>
                              <ComboboxOptions className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white outline-1 outline-gray-300 py-1 text-base shadow-sm focus:outline-none sm:text-sm'>
                                {filteredDrivers.length === 0 &&
                                driverQuery !== '' ? (
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
                                          // Handle both object and string formats for comparison
                                          (typeof editForm?.driverId ===
                                          'object'
                                            ? editForm?.driverId?._id
                                            : editForm?.driverId) === driver._id
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
                        ) : (
                          <p className='outline outline-gray-200 px-3 py-2 rounded break-all capitalize'>
                            {currentDriver
                              ? `${currentDriver.firstname} ${currentDriver.lastname}`
                              : ''}
                          </p>
                        )}
                      </label>

                      <div className='grid grid-cols-2 gap-6'>
                        <InputField
                          label='Helper Count'
                          type='number'
                          name='helperCount'
                          placeholder='Helper Count'
                          value={editForm?.helperCount}
                          disabled={!isEditMode}
                          onChange={handleChange}
                          formatNumber={true}
                        />

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
                                {DEPLOYMENT_STATUS.map((item, index) => (
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
                                  'capitalize w-fit px-2 py-0.5 rounded-full text-sm',
                                  {
                                    'bg-orange-500/10 text-orange-500':
                                      editForm?.status === 'preparing',
                                    'bg-emerald-500/10 text-emerald-500':
                                      editForm?.status === 'ongoing',
                                    'bg-blue-500/10 text-blue-500':
                                      editForm?.status === 'completed',
                                    'bg-red-500/10 text-red-500':
                                      editForm?.status === 'canceled'
                                  }
                                )}
                              >
                                {editForm?.status}
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Replacement truck details
                  <div className='mt-3 space-y-2'>
                    <div className='flex justify-between'>
                      <h3 className='text-xs uppercase font-semibold text-gray-500'>
                        Truck Details
                      </h3>
                      <p className='text-xs text-red-500'>
                        *This is a replacement truck
                      </p>
                    </div>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-4 border border-gray-200 rounded-md p-6'>
                      {/* plate no. */}
                      <label className='flex flex-col gap-1'>
                        <span className='uppercase text-xs text-gray-500 font-semibold'>
                          Plate No.
                        </span>
                        {isEditMode ? (
                          <Combobox
                            value={
                              // Handle both object and string formats
                              typeof editForm?.replacement
                                ?.replacementTruckId === 'object'
                                ? editForm?.replacement?.replacementTruckId?._id
                                : editForm?.replacement?.replacementTruckId
                            }
                            onChange={value =>
                              handleComboboxChange(
                                'replacement.replacementTruckId',
                                value
                              )
                            }
                          >
                            <div className='relative'>
                              <ComboboxInput
                                className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 uppercase'
                                displayValue={truckId => {
                                  // Handle both object and string ID formats
                                  const actualId =
                                    typeof truckId === 'object'
                                      ? truckId?._id
                                      : truckId
                                  const truck = trucks?.find(
                                    t => t._id === actualId
                                  )
                                  return truck ? truck.plateNo : ''
                                }}
                                onChange={event =>
                                  setReplacementTruckQuery(event.target.value)
                                }
                                placeholder='Search plate no.'
                                required
                              />
                              <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                <MdKeyboardArrowDown className='h-5 w-5 text-gray-400' />
                              </ComboboxButton>
                              <ComboboxOptions className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white outline-1 outline-gray-300 py-1 text-base shadow-sm focus:outline-none sm:text-sm'>
                                {filteredReplacementTrucks.length === 0 &&
                                replacementTruckQuery !== '' ? (
                                  <div className='relative cursor-default select-none px-4 py-2 text-gray-700'>
                                    Nothing found.
                                  </div>
                                ) : (
                                  filteredReplacementTrucks.map(truck => (
                                    <ComboboxOption
                                      key={truck._id}
                                      value={truck._id}
                                      className={({ focus }) =>
                                        `relative cursor-default select-none py-2 px-4 text-base ${
                                          focus ? 'bg-gray-50' : 'text-gray-900'
                                        } ${
                                          // Handle both object and string formats for comparison
                                          (typeof editForm?.replacement
                                            ?.replacementTruckId === 'object'
                                            ? editForm?.replacement
                                                ?.replacementTruckId?._id
                                            : editForm?.replacement
                                                ?.replacementTruckId) ===
                                          truck._id
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
                        ) : (
                          <p className='outline outline-gray-200 px-3 py-2 rounded break-all uppercase'>
                            {editForm?.replacement?.replacementTruckId?.plateNo}
                          </p>
                        )}
                      </label>

                      {/* type */}
                      <label className='flex flex-col gap-1'>
                        <span className='uppercase text-xs text-gray-500 font-semibold'>
                          Truck Type
                        </span>
                        {isEditMode ? (
                          <div className='relative'>
                            <select
                              name='replacement.replacementTruckType'
                              value={
                                editForm?.replacement?.replacementTruckType
                              }
                              onChange={handleChange}
                              className='outline outline-gray-300 px-3 py-2 rounded focus:outline-gray-400 appearance-none w-full capitalize'
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
                            {editForm?.replacement?.replacementTruckType}
                          </p>
                        )}
                      </label>

                      {/* driver */}
                      <label className='flex flex-col gap-1'>
                        <span className='uppercase text-xs text-gray-500 font-semibold'>
                          Driver
                        </span>
                        {isEditMode ? (
                          <Combobox
                            value={
                              // Handle both object and string formats
                              typeof editForm?.replacement
                                ?.replacementDriverId === 'object'
                                ? editForm?.replacement?.replacementDriverId
                                    ?._id
                                : editForm?.replacement?.replacementDriverId
                            }
                            onChange={value =>
                              handleComboboxChange(
                                'replacement.replacementDriverId',
                                value
                              )
                            }
                          >
                            <div className='relative'>
                              <ComboboxInput
                                className='w-full outline outline-gray-300 px-3 py-2 rounded focus:outline-1 focus:outline-gray-400 capitalize'
                                displayValue={driverId => {
                                  // Handle both object and string ID formats
                                  const actualId =
                                    typeof driverId === 'object'
                                      ? driverId?._id
                                      : driverId
                                  const driver = drivers?.find(
                                    d => d._id === actualId
                                  )
                                  return driver
                                    ? `${driver.firstname} ${driver.lastname}`
                                    : ''
                                }}
                                onChange={event =>
                                  setReplacementDriverQuery(event.target.value)
                                }
                                placeholder='Search driver name'
                                required
                              />
                              <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                <MdKeyboardArrowDown className='h-5 w-5 text-gray-400' />
                              </ComboboxButton>
                              <ComboboxOptions className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white outline-1 outline-gray-300 py-1 text-base shadow-sm focus:outline-none sm:text-sm'>
                                {filteredReplacementDrivers.length === 0 &&
                                replacementDriverQuery !== '' ? (
                                  <div className='relative cursor-default select-none px-4 py-2 text-gray-700'>
                                    Nothing found.
                                  </div>
                                ) : (
                                  filteredReplacementDrivers.map(driver => (
                                    <ComboboxOption
                                      key={driver._id}
                                      value={driver._id}
                                      className={({ focus }) =>
                                        `relative cursor-default select-none py-2 px-4 text-base ${
                                          focus ? 'bg-gray-50' : 'text-gray-900'
                                        } ${
                                          // Handle both object and string formats for comparison
                                          (typeof editForm?.replacement
                                            ?.replacementDriverId === 'object'
                                            ? editForm?.replacement
                                                ?.replacementDriverId?._id
                                            : editForm?.replacement
                                                ?.replacementDriverId) ===
                                          driver._id
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
                        ) : (
                          <p className='outline outline-gray-200 px-3 py-2 rounded break-all capitalize'>
                            {editForm?.replacement?.replacementDriverId
                              ? `${editForm.replacement.replacementDriverId.firstname} ${editForm.replacement.replacementDriverId.lastname}`
                              : ''}
                          </p>
                        )}
                      </label>

                      <div className='grid grid-cols-2 gap-6'>
                        <InputField
                          label='Helper Count'
                          type='number'
                          name='helperCount'
                          placeholder='Helper Count'
                          value={editForm?.helperCount}
                          disabled={!isEditMode}
                          onChange={handleChange}
                          formatNumber={true}
                        />

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
                                {DEPLOYMENT_STATUS.map((item, index) => (
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
                                  'capitalize w-fit px-2 py-0.5 rounded-full text-sm',
                                  {
                                    'bg-orange-500/10 text-orange-500':
                                      editForm?.status === 'preparing',
                                    'bg-emerald-500/10 text-emerald-500':
                                      editForm?.status === 'ongoing',
                                    'bg-blue-500/10 text-blue-500':
                                      editForm?.status === 'completed',
                                    'bg-red-500/10 text-red-500':
                                      editForm?.status === 'canceled'
                                  }
                                )}
                              >
                                {editForm?.status}
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* other details */}
                <div className='mt-3 space-y-2'>
                  <h3 className='col-span-full text-xs uppercase font-semibold text-gray-500'>
                    Other Details
                  </h3>
                  <div className='grid grid-cols-2 gap-x-6 gap-y-4 border border-gray-200 rounded-md p-6'>
                    <label className='flex flex-col gap-1'>
                      <span className='uppercase text-xs text-gray-500 font-semibold'>
                        Assigned At
                      </span>
                      <p className='outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400'>
                        {DateTime.fromISO(editForm?.createdAt)
                          .setZone('Asia/Manila')
                          .toFormat('MMM d, yyyy - hh:mm a')}
                      </p>
                    </label>

                    <div className='grid grid-cols-2 gap-6'>
                      <InputField
                        label='Sacks Count'
                        type='number'
                        name='sacksCount'
                        value={editForm?.sacksCount}
                        disabled={!isEditMode}
                        onChange={handleChange}
                        formatNumber={true}
                        thousandSeparator={true}
                        decimalScale={0}
                      />

                      <InputField
                        label='Load Weight (kg)'
                        type='number'
                        name='loadWeightKg'
                        value={editForm?.loadWeightKg}
                        disabled={!isEditMode}
                        onChange={handleChange}
                        formatNumber={true}
                        thousandSeparator={true}
                        decimalScale={2}
                      />
                    </div>

                    <InputField
                      label='Pick-up Location'
                      type='text'
                      name='pickupSite'
                      placeholder='Pick-up Location'
                      maxLength={50}
                      value={editForm?.pickupSite}
                      disabled={!isEditMode}
                      onChange={handleChange}
                    />

                    <label className='flex flex-col gap-1'>
                      <span className='uppercase text-xs text-gray-500 font-semibold'>
                        Destination
                      </span>
                      {isEditMode ? (
                        <div className='relative'>
                          <select
                            name='destination'
                            value={editForm?.destination}
                            onChange={handleChange}
                            className='outline outline-gray-200 px-3 py-2 rounded focus:outline-gray-400 appearance-none w-full capitalize'
                          >
                            {PICKUP_LOCATION.map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                          <MdKeyboardArrowDown className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg' />
                        </div>
                      ) : (
                        <div className='outline outline-gray-200 px-3 py-2 rounded'>
                          {editForm?.destination}
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {updatable && (
                  <div className='flex gap-4 col-span-full mt-full mt-6'>
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
                          <FaPen className='text-base -mt-0.5' />
                          Update
                        </button>

                        <button
                          type='button'
                          onClick={openDeleteModal}
                          disabled={isLoading}
                          className='bg-linear-to-b from-red-500 to-red-600 text-white px-8 py-2 uppercase text-sm font-semibold rounded flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-95'
                        >
                          <FaTrash className='text-base -mt-0.5' />
                          Delete
                        </button>

                        {!isReplacementShow && (
                          <button
                            type='button'
                            onClick={openReplacementModal}
                            disabled={isLoading}
                            className='bg-linear-to-b from-gray-400 to-gray-500 text-white px-8 py-2 uppercase text-sm font-semibold rounded cursor-pointer active:scale-95 transition-all hover:brightness-95 ml-auto'
                          >
                            Replace Truck
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
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
  isFullWidth = true,
  isDarkerOutline = false,
  // New props for number formatting
  formatNumber = false,
  thousandSeparator = true,
  decimalScale = 0,
  allowNegative = false
}) => {
  // If it's a number field with formatting, use NumericFormat
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
          className={clsx(
            'outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400 ',
            {
              capitalize: isCapitalize,
              uppercase: isUpperCase,
              'w-56': !isFullWidth,
              'w-full': isFullWidth,
              'outline-gray-200': !isDarkerOutline,
              'outline-gray-300': isDarkerOutline
            }
          )}
        />
      </label>
    )
  }

  // Regular input field
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
            'w-full': isFullWidth,
            'outline-gray-200': !isDarkerOutline,
            'outline-gray-300': isDarkerOutline
          }
        )}
      />
    </label>
  )
}

export default DeploymentDetailsModal
