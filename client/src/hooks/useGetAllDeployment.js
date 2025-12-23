import axios from 'axios'
import { useState } from 'react'
import { API_DEPLOYMENT } from '../utils/APIRoutes'

const useGetAllDeployment = () => {
  const [isLoading, setIsLoading] = useState(true)

  const getAllDeploymentFunction = async filters => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(API_DEPLOYMENT, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      })

      console.log('HOOK - ALL DEPLOYMENTS', response.data)

      return {
        deployments: response.data.deployments,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
        error: null
      }
    } catch (error) {
      console.log(error.response?.data)

      return {
        error: error.response?.data?.message || 'Something went wrong!',
        deployments: [],
        total: 0,
        page: 1,
        totalPages: 1
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllDeploymentFunction, isLoading }
}

export default useGetAllDeployment
