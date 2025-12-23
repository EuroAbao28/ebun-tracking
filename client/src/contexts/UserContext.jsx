import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { API_USER } from '../utils/APIRoutes'
import { toast } from 'react-toastify'
import axios from 'axios'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const navigate = useNavigate()

  const [userData, setUserData] = useState({
    data: {},
    isLoading: true,
    error: null
  })

  const getCurrentUser = async () => {
    const token = sessionStorage.getItem('userToken')

    try {
      const response = await axios.get(`${API_USER}/current-user`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('CURRENT USER', response.data.user)
      setUserData({
        data: response.data.user,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message || 'Authentication Failed')
      navigate('/')
    }
  }

  const updateUser = updatedUser => {
    console.log('Updating user with:', updatedUser)
    setUserData(prev => ({
      ...prev,
      data: { ...prev.data, ...updatedUser }
    }))
  }

  useEffect(() => {
    getCurrentUser()
  }, [])

  return (
    <UserContext.Provider value={{ userData, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)
