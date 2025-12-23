import { useState } from 'react'
import { useNavigate } from 'react-router'
import { API_USER } from '../utils/APIRoutes'
import { toast } from 'react-toastify'
import axios from 'axios'

const useLogin = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const loginFunction = async credentials => {
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_USER}/login`, credentials)

      sessionStorage.setItem('userToken', response.data.token)
      toast.success(response.data.message)

      console.log(response.data)

      navigate('/secure/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong!')
    } finally {
      setIsLoading(false)
    }
  }
  return { loginFunction, isLoading }
}

export default useLogin
