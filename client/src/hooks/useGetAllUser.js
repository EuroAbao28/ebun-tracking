import axios from 'axios'
import { useState } from 'react'
import { API_USER } from '../utils/APIRoutes'

const useGetAllUser = () => {
  const [isLoading, setIsLoading] = useState(true)

  const getAllUserFunction = async filters => {
    setIsLoading(true)

    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(API_USER, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      })

      console.log('HOOK - ALL USERS', response.data)

      return {
        users: response.data.users,
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

  return { getAllUserFunction, isLoading }
}

export default useGetAllUser
