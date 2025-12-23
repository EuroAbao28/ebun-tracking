import axios from 'axios'
import { useState } from 'react'
import { API_TRUCK } from '../utils/APIRoutes'

const useCreateTruck = () => {
  const [isLoading, setIsLoading] = useState(false)

  const createTruckFunction = async data => {
    setIsLoading(true)

    console.log('FROM MODAL', data)

    const token = sessionStorage.getItem('userToken')

    const formData = new FormData()

    // append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'tools') {
          // convert tools array to JSON string for FormData
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
    })

    try {
      console.log(data)
      const response = await axios.post(API_TRUCK, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      console.log('HOOK - CREATED TRUCK', response.data)

      return response.data
    } catch (error) {
      console.log(error.response.data.message)
      return error.response?.data?.message || 'Something went wrong!'
    } finally {
      setIsLoading(false)
    }
  }

  return { createTruckFunction, isLoading }
}

export default useCreateTruck
