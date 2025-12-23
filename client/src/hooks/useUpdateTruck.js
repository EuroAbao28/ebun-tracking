import { useState } from 'react'
import axios from 'axios'
import { API_TRUCK } from '../utils/APIRoutes'

const useUpdateTruck = () => {
  const [isLoading, setIsLoading] = useState(false)

  const updateTruckFunction = async (id, data) => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    const formData = new FormData()

    // append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tools') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    })

    try {
      const response = await axios.patch(`${API_TRUCK}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      console.log('UPDATE TRUCK', response.data)

      return { success: true, data: response.data, error: null }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Something went wrong!'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { updateTruckFunction, isLoading }
}

export default useUpdateTruck
