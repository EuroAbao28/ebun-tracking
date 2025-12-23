import axios from 'axios'
import { useState } from 'react'
import { API_TRUCK } from '../utils/APIRoutes'

const useGetAllTruck = () => {
  const [isLoading, setIsLoading] = useState(true)

  const getAllTruckFunction = async filters => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(API_TRUCK, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      })

      console.log('HOOK - ALL TRUCKS', response.data)

      return {
        trucks: response.data.trucks,
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

  return { getAllTruckFunction, isLoading }
}

export default useGetAllTruck
