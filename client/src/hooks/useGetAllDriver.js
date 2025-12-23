import axios from 'axios'
import { useState } from 'react'
import { API_DRIVER } from '../utils/APIRoutes'

const useGetAllDriver = () => {
  const [isLoading, setIsLoading] = useState(true)

  const getAllDriverFunction = async filters => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(API_DRIVER, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      })

      console.log('HOOK - ALL DRIVERS', response.data)

      return {
        drivers: response.data.drivers,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
        error: null
      }
    } catch (error) {
      console.log(error.response.data)

      return {
        error: error.response?.data?.message || 'Something went wrong!'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllDriverFunction, isLoading }
}

export default useGetAllDriver
