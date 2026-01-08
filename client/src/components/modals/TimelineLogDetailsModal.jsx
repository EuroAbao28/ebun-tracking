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

function TimelineLogDetailsModal ({
  isOpen,
  onClose,
  trucks,
  drivers,
  deployment,
  onUpdate,
  openDeleteModal,
  openReplacementModal,
  openReplacementHistory,
  updatable,
  timelineLog
}) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [timelineDetails, setTimelineDetails] = useState({})
  const [isReplacementShow, setIsReplacementShow] = useState(false)

  console.log('TIMELINE DETAILS', timelineLog)

  useEffect(() => {
    if (isOpen && timelineLog) {
      setIsEditMode(false)
      setTimelineDetails(timelineLog)
    }
  }, [isOpen, timelineLog])

  useEffect(() => {
    if (timelineLog?.targetDeployment?.replacement?.replacementTruckId?._id) {
      console.log('HAS REPLACEMENT')
      setIsReplacementShow(true)
    } else {
      console.log('NO REPLACEMENT')
      setIsReplacementShow(false)
    }
  }, [timelineLog, isOpen])

  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
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
                onClick={onClose}
                className='hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
              >
                <IoClose />
              </button>
            </div>

            <div className='flex'>
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
                            'bg-emerald-500 shadow-warning':
                              timelineDetails?.targetDeployment?.departed?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              !timelineDetails?.targetDeployment?.departed?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500':
                              timelineDetails?.targetDeployment?.departed?.trim(),
                            'bg-gray-300':
                              !timelineDetails?.targetDeployment?.departed?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Departed
                        </p>
                        {timelineDetails?.targetDeployment?.departed ? (
                          <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                            {DateTime.fromISO(
                              timelineDetails?.targetDeployment?.departed
                            )
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy - hh:mm a')}
                          </p>
                        ) : (
                          <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                            Pending
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* pickup in */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning':
                              timelineDetails?.targetDeployment?.pickupIn?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              !timelineDetails?.targetDeployment?.pickupIn?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500':
                              timelineDetails?.targetDeployment?.pickupIn?.trim(),
                            'bg-gray-300':
                              !timelineDetails?.targetDeployment?.pickupIn?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Pickup-in
                        </p>
                        {timelineDetails?.targetDeployment?.pickupIn ? (
                          <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                            {DateTime.fromISO(
                              timelineDetails?.targetDeployment?.pickupIn
                            )
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy - hh:mm a')}
                          </p>
                        ) : (
                          <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                            Pending
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* pickup out */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning':
                              timelineDetails?.targetDeployment?.pickupOut?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              !timelineDetails?.targetDeployment?.pickupOut?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500':
                              timelineDetails?.targetDeployment?.pickupOut?.trim(),
                            'bg-gray-300':
                              !timelineDetails?.targetDeployment?.pickupOut?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Pickup-out
                        </p>
                        {timelineDetails?.targetDeployment?.pickupOut ? (
                          <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                            {DateTime.fromISO(
                              timelineDetails?.targetDeployment?.pickupOut
                            )
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy - hh:mm a')}
                          </p>
                        ) : (
                          <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                            Pending
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* dest arrival */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning':
                              timelineDetails?.targetDeployment?.destArrival?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              !timelineDetails?.targetDeployment?.destArrival?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500':
                              timelineDetails?.targetDeployment?.destArrival?.trim(),
                            'bg-gray-300':
                              !timelineDetails?.targetDeployment?.destArrival?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Dest Arrival
                        </p>
                        {timelineDetails?.targetDeployment?.destArrival ? (
                          <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                            {DateTime.fromISO(
                              timelineDetails?.targetDeployment?.destArrival
                            )
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy - hh:mm a')}
                          </p>
                        ) : (
                          <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                            Pending
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* dest departure */}
                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning':
                              timelineDetails?.targetDeployment?.destDeparture?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              !timelineDetails?.targetDeployment?.destDeparture?.trim()
                          }
                        )}
                      ></div>
                      <div
                        className={clsx(
                          'w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning':
                              timelineDetails?.targetDeployment?.destDeparture?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              !timelineDetails?.targetDeployment?.destDeparture?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='pb-6 flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Dest Departure
                        </p>
                        {timelineDetails?.targetDeployment?.destDeparture ? (
                          <p className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400'>
                            {DateTime.fromISO(
                              timelineDetails?.targetDeployment?.destDeparture
                            )
                              .setZone('Asia/Manila')
                              .toFormat('MMM d, yyyy - hh:mm a')}
                          </p>
                        ) : (
                          <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                            Pending
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className='flex gap-5'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-4 aspect-square rounded-full absolute z-10 left-1/2 -translate-x-1/2',
                          {
                            'bg-emerald-500 shadow-warning': isEditMode
                              ? timelineDetails?.targetDeployment?.destDeparture?.trim()
                              : timelineDetails?.targetDeployment?.destDeparture?.trim(),
                            'bg-gray-200 shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.2)]':
                              isEditMode
                                ? !timelineDetails?.targetDeployment?.destDeparture?.trim()
                                : !timelineDetails?.targetDeployment?.destDeparture?.trim()
                          }
                        )}
                      ></div>
                    </div>
                    <div className='flex-1 w-56'>
                      <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold uppercase text-gray-500'>
                          Unloading Time
                        </p>
                        {isEditMode ? (
                          timelineDetails?.targetDeployment?.destArrival ? (
                            <div className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400 flex items-center gap-2'>
                              <LuClock />
                              {(() => {
                                const { hours, minutes } = DateTime.fromISO(
                                  timelineDetails?.targetDeployment
                                    ?.destDeparture
                                ).diff(
                                  DateTime.fromISO(
                                    timelineDetails?.targetDeployment
                                      ?.destArrival
                                  ),
                                  ['hours', 'minutes']
                                )
                                return hours
                                  ? `${hours}h ${Math.floor(minutes)}m`
                                  : `${Math.floor(minutes)}m`
                              })()}
                            </div>
                          ) : (
                            <p className='italic text-gray-400 text-sm font-light outline outline-gray-300 px-3 py-2.5 rounded break-all focus:outline-gray-400'>
                              Pending
                            </p>
                          )
                        ) : timelineDetails?.targetDeployment?.destDeparture &&
                          timelineDetails?.targetDeployment?.destArrival ? (
                          <div className='outline outline-gray-300 px-3 py-2 rounded break-all focus:outline-gray-400 flex items-center gap-2'>
                            <LuClock />
                            {(() => {
                              const { hours, minutes } = DateTime.fromISO(
                                timelineDetails?.targetDeployment?.destDeparture
                              ).diff(
                                DateTime.fromISO(
                                  timelineDetails?.targetDeployment?.destArrival
                                ),
                                ['hours', 'minutes']
                              )
                              return hours
                                ? `${hours}h ${Math.floor(minutes)}m`
                                : `${Math.floor(minutes)}m`
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
                      navigator.clipboard.writeText(
                        timelineDetails?.targetDeployment?.deploymentCode
                      )

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
                    #{timelineDetails?.targetDeployment?.deploymentCode}
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
                      <StatisField
                        label='Plate No.'
                        value={
                          timelineDetails?.targetDeployment?.truckId?.plateNo
                        }
                      />

                      {/* type */}
                      <StatisField
                        label='Truck Type'
                        value={timelineDetails?.targetDeployment?.truckType}
                      />

                      <StatisField
                        label='Driver'
                        value={`${timelineDetails?.targetDeployment?.driverId?.firstname} ${timelineDetails?.targetDeployment?.driverId?.lastname}`}
                      />

                      <div className='grid grid-cols-2 gap-6'>
                        <StatisField
                          label='Helper Count'
                          value={timelineDetails?.targetDeployment?.helperCount}
                        />

                        {/* status */}
                        <StatisField
                          label='Status'
                          value={timelineDetails?.targetDeployment?.status}
                        />
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
                      <StatisField
                        label='Plate No.'
                        value={
                          timelineDetails?.targetDeployment?.replacement
                            ?.replacementTruckId?.plateNo
                        }
                        isUpperCase={true}
                      />

                      {/* type */}
                      <StatisField
                        label='Truck Type'
                        value={
                          timelineDetails?.targetDeployment?.replacement
                            ?.replacementTruckType
                        }
                      />

                      <StatisField
                        label='Driver'
                        value={`${timelineDetails?.targetDeployment?.replacement?.replacementDriverId?.firstname} ${timelineDetails?.targetDeployment?.replacement?.replacementDriverId?.lastname}`}
                      />

                      <div className='grid grid-cols-2 gap-6'>
                        <StatisField
                          label='Helper Count'
                          value={
                            timelineDetails?.targetDeployment?.replacement
                              ?.replacementHelperCount
                          }
                          type='number'
                          formatNumber={true}
                        />

                        {/* status */}
                        <StatisField
                          label='Status'
                          value={timelineDetails?.targetDeployment?.status}
                        />
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
                    <StatisField
                      label='Assigned at'
                      value={DateTime.fromISO(
                        timelineDetails?.targetDeployment?.createdAt
                      )
                        .setZone('Asia/Manila')
                        .toFormat('MMM d, yyyy - hh:mm a')}
                    />

                    <div className='grid grid-cols-2 gap-6'>
                      <StatisField
                        label='Sacks Count'
                        value={timelineDetails?.targetDeployment?.sacksCount}
                        type='number'
                        formatNumber={true}
                      />
                      <StatisField
                        label='Load Weight (kg)'
                        value={timelineDetails?.targetDeployment?.loadWeightKg}
                        type='number'
                        formatNumber={true}
                      />
                    </div>

                    <StatisField
                      label='Pick-up Location'
                      value={timelineDetails?.targetDeployment?.pickupSite}
                    />

                    <StatisField
                      label='Destination'
                      value={timelineDetails?.targetDeployment?.destination}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  )
}

const StatisField = ({
  colSpan = 1,
  label,
  type,
  name,
  value,
  isCapitalize = true,
  isUpperCase = false,
  isFullWidth = true,
  isDarkerOutline = false,
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

  if (label === 'Status') {
    return (
      <label className={`col-span-${colSpan} flex flex-col gap-1`}>
        <span className='uppercase text-xs text-gray-500 font-semibold'>
          {label}
        </span>
        <div
          className={clsx(
            'outline outline-gray-200 px-3 py-2 rounded break-all focus:outline-gray-400',
            {
              capitalize: isCapitalize,
              uppercase: isUpperCase,
              'w-56': !isFullWidth,
              'w-full': isFullWidth,
              'outline-gray-200': !isDarkerOutline,
              'outline-gray-300': isDarkerOutline
            }
          )}
        >
          <p
            className={clsx(
              'capitalize w-fit px-2 py-0.5 rounded-full text-sm',
              {
                'bg-orange-500/10 text-orange-500': value === 'preparing',
                'bg-emerald-500/10 text-emerald-500': value === 'ongoing',
                'bg-blue-500/10 text-blue-500': value === 'completed',
                'bg-red-500/10 text-red-500': value === 'canceled'
              }
            )}
          >
            {value}
          </p>
        </div>
      </label>
    )
  }

  // Regular input field
  return (
    <label className={`col-span-${colSpan} flex flex-col gap-1`}>
      <span className='uppercase text-xs text-gray-500 font-semibold '>
        {label}
      </span>
      <p
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
      >
        {value}
      </p>
    </label>
  )
}

export default TimelineLogDetailsModal
