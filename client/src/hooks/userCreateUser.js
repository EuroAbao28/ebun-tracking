import axios from 'axios'
import { useState } from 'react'
import { API_USER } from '../utils/APIRoutes'

const useCreateUser = () => {
  const [isLoading, setIsLoading] = useState(false)

  const createUserFunction = async data => {
    setIsLoading(true)

    const formData = new FormData()

    // append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    try {
      if (data.role === 'admin') {
        const token = sessionStorage.getItem('userToken')
        const response = await axios.post(
          `${API_USER}/create-admin`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        )

        console.log('HOOK - CREATED ADMIN', response.data)

        return response.data
      } else {
        const response = await axios.post(API_USER, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('HOOK - CREATED ADMIN', response.data)

        return response.data
      }
    } catch (error) {
      console.log(error.response.data.message)
      return error.response?.data?.message || 'Something went wrong!'
    } finally {
      setIsLoading(false)
    }
  }

  return { createUserFunction, isLoading }
}

export default useCreateUser
