import axios from 'axios'
import { useState } from 'react'
import { API_DEPLOYMENT } from '../utils/APIRoutes'

const useCreateDeployment = () => {
  const [isLoading, setIsLoading] = useState(false)

  const createDeploymentFunction = async data => {
    setIsLoading(true)

    console.log('FROM DEPLOYMENT MODAL', data)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.post(API_DEPLOYMENT, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('HOOK - CREATED DEPLOYMENT', response.data)

      return response.data
    } catch (error) {
      console.log(error.response?.data?.message)
      return error.response?.data?.message || 'Something went wrong!'
    } finally {
      setIsLoading(false)
    }
  }

  return { createDeploymentFunction, isLoading }
}

export default useCreateDeployment
