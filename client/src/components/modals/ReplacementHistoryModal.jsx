import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild
} from '@headlessui/react'
import { IoClose } from 'react-icons/io5'
import { DateTime } from 'luxon'
import clsx from 'clsx'

function ReplacementHistoryModal ({ isOpen, onClose, deployment }) {
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
            {/* close button */}
            <button
              onClick={onClose}
              className='absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full text-2xl text-gray-600 cursor-pointer transition-all'
            >
              <IoClose />
            </button>

            <div className='px-6 py-8'>
              <h2 className='text-lg font-semibold'>Replacement History</h2>

              {deployment?.replacement &&
              deployment.replacement.replacementTruckId._id ? (
                <div className='mt-6'>
                  <div className='grid grid-cols-2 gap-6'>
                    {/* Original Truck & Driver */}
                    <div className='space-y-2'>
                      <h3 className='text-xs uppercase font-semibold text-gray-500'>
                        Original Assignment
                      </h3>
                      <div className='grid grid-cols-2 gap-x-6 gap-y-4 bg-orange-50 rounded-md p-4 border border-orange-200'>
                        <StaticField
                          label='Original Truck'
                          value={deployment.truckId?.plateNo}
                          color='orange'
                          isUppercase={true}
                        />

                        <StaticField
                          label='Original Driver'
                          value={`${deployment.driverId.firstname} ${deployment.driverId.lastname}`}
                          color='orange'
                          isCapitalize={true}
                        />

                        <StaticField
                          label='Original Truck Type'
                          value={deployment.truckType}
                          color='orange'
                          isCapitalize={true}
                        />

                        <StaticField
                          label='Original Helper Count'
                          value={deployment.helperCount}
                          color='orange'
                        />
                      </div>
                    </div>

                    {/* Replacement Truck & Driver */}
                    <div className='space-y-2'>
                      <h3 className='text-xs uppercase font-semibold text-gray-500'>
                        Replacement Assignment
                      </h3>

                      <div className='grid grid-cols-2 gap-x-6 gap-y-4 bg-emerald-50 rounded-md p-4 border border-emerald-200'>
                        <StaticField
                          label='Replacement Truck'
                          value={
                            deployment.replacement.replacementTruckId?.plateNo
                          }
                          color='emerald'
                          isUppercase={true}
                        />

                        <StaticField
                          label='Replacement Driver'
                          value={`${deployment.replacement.replacementDriverId.firstname} ${deployment.replacement.replacementDriverId.lastname}`}
                          color='emerald'
                          isCapitalize={true}
                        />

                        <StaticField
                          label='Replacement Truck Type'
                          value={deployment.replacement.replacementTruckType}
                          color='emerald'
                          isCapitalize={true}
                        />

                        <StaticField
                          label='Replacement Helper Count'
                          value={deployment.replacement.replacementHelperCount}
                          color='emerald'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Replacement Details */}
                  <div className='border border-gray-200 p-4 bg-gray-50 rounded-md mt-6 pt-4 grid grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-y-4'>
                      <StaticField
                        label='Reason for replacement'
                        value={deployment.replacement?.reason?.replace(
                          /_/g,
                          ' '
                        )}
                        color='gray'
                        isCapitalize={true}
                      />

                      <StaticField
                        label='Replaced At'
                        value={DateTime.fromISO(
                          deployment.replacement.replacedAt
                        )
                          .setZone('Asia/Manila')
                          .toFormat('MMM d, yyyy - hh:mm a')}
                        color='gray'
                      />
                    </div>

                    <div className='flex flex-col gap-1'>
                      <span className='uppercase text-xs text-gray-500 font-semibold'>
                        Remarks
                      </span>
                      <div className='flex-1 overflow-auto outline outline-gray-200 px-3 py-2 rounded bg-white mt-1 relative'>
                        <p className='absolute top-3 left-2 right-2'>
                          {deployment.replacement.remarks || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='mt-6 text-center py-8'>
                  <p className='text-gray-500 italic'>No replacement history</p>
                </div>
              )}
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  )
}

const StaticField = ({
  label,
  value,
  isInputLarge = false,
  isCapitalize = false,
  isUppercase = false,
  color
}) => {
  return (
    <div className='flex flex-col gap-1'>
      <span
        className={clsx('uppercase text-xs text-gray-500 font-semibold', {
          'text-orange-800': color === 'orange',
          'text-emerald-800': color === 'emerald'
        })}
      >
        {label}
      </span>
      <p
        className={clsx('outline  px-3 py-2 rounded bg-white mt-1', {
          'flex-1': isInputLarge,
          capitalize: isCapitalize,
          uppercase: isUppercase,
          'text-orange-600 outline-orange-200': color === 'orange',
          'text-emerald-600 outline-emerald-200': color === 'emerald',
          'outline-gray-200': color === 'gray'
        })}
      >
        {value || 'N/A'}
      </p>
    </div>
  )
}

export default ReplacementHistoryModal
