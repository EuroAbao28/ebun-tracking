import axios from 'axios'
import { useState } from 'react'
import { API_DRIVER } from '../utils/APIRoutes'

const useCreateDriver = () => {
  const [isLoading, setIsLoading] = useState(false)

  const createDriverFunction = async data => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    const formData = new FormData()

    // append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    try {
      console.log(data)
      const response = await axios.post(API_DRIVER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      console.log('HOOK - CREATED DRIVER', response.data)

      return response.data
    } catch (error) {
      console.log(error.response.data.message)
      return error.response?.data?.message || 'Something went wrong!'
    } finally {
      setIsLoading(false)
    }
  }

  return { createDriverFunction, isLoading }
}

export default useCreateDriver
