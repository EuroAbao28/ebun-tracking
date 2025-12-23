import { useState } from 'react'
import axios from 'axios'
import { API_DEPLOYMENT } from '../utils/APIRoutes'
import { toast } from 'react-toastify'

const useUpdateDeployment = () => {
  const [isLoading, setIsLoading] = useState(false)

  const updateDeploymentFunction = async (id, data) => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.patch(`${API_DEPLOYMENT}/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('UPDATE DEPLOYMENT', response.data)

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

  return { updateDeploymentFunction, isLoading }
}

export default useUpdateDeployment
