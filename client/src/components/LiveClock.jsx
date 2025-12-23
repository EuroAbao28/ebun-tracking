import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'

function LiveClock () {
  const [currentTime, setCurrentTime] = useState(dayjs())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='ml-auto flex flex-col items-center justify-center'>
      <p className='font-semibold text-sm'>
        {currentTime.format('dddd, MMMM D, YYYY')}
      </p>
      <p className='text-sm '>{currentTime.format('h:mm A')}</p>
    </div>
  )
}

export default React.memo(LiveClock)
