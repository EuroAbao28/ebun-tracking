import { useState } from 'react'
import axios from 'axios'
import { API_DRIVER } from '../utils/APIRoutes'

const useUpdateDriver = () => {
  const [isLoading, setIsLoading] = useState(false)

  const updateDriverFunction = async (id, data) => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    const formData = new FormData()

    // append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })

    try {
      const response = await axios.patch(`${API_DRIVER}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      console.log('UPDATE DRIVER', response.data)

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

  return { updateDriverFunction, isLoading }
}

export default useUpdateDriver
