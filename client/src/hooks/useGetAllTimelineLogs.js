import axios from 'axios'
import { useState } from 'react'
import { API_TIMELINE_LOGS } from '../utils/APIRoutes'

const useGetAllTimelineLogs = () => {
  const [isLoading, setIsLoading] = useState(true)

  const getAllTimelineLogsFunction = async filters => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(API_TIMELINE_LOGS, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      })

      console.log('HOOK - ALL TIMELINE LOGS', response.data)

      return {
        timelineLogs: response.data.timelineLogs,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
        error: null
      }
    } catch (error) {
      console.log(error.response?.data)

      return {
        error: error.response?.data?.message || 'Something went wrong!',
        timelineLogs: [],
        total: 0,
        page: 1,
        totalPages: 1
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllTimelineLogsFunction, isLoading }
}

export default useGetAllTimelineLogs
