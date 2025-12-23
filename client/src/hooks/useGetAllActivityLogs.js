import axios from 'axios'
import { useState } from 'react'
import { API_ACTIVITY_LOGS } from '../utils/APIRoutes'

const useGetAllActivityLogs = () => {
  const [isLoading, setIsLoading] = useState(true)

  const getAllActivityLogs = async filters => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(API_ACTIVITY_LOGS, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      })

      console.log('HOOK - ALL ACTIVITY LOGS', response.data)

      return {
        activityLogs: response.data.activityLogs,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
        error: null
      }
    } catch (error) {
      console.log(error.response.data)

      return {
        data: null,
        error: error.response?.data?.message || 'Something went wrong!'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllActivityLogs, isLoading }
}

export default useGetAllActivityLogs
