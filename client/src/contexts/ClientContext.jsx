import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { API_CLIENT } from '../utils/APIRoutes'
import { toast } from 'react-toastify'
import axios from 'axios'

const ClientContext = createContext()

export const ClientProvider = ({ children }) => {
  const navigate = useNavigate()

  const [clientData, setClientData] = useState({
    data: {},
    isLoading: true,
    error: null
  })

  const getCurrectClient = async () => {
    const token = sessionStorage.getItem('clientToken')

    try {
      const response = await axios.get(`${API_CLIENT}/current-client`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('CURRENT CLIENT', response.data.client)
      setClientData({
        data: response.data.client,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message || 'Authentication Failed')
      navigate('/')
    }
  }

  useEffect(() => {
    getCurrectClient()
  }, [])

  return (
    <ClientContext.Provider value={{ clientData }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useClientContext = () => useContext(ClientContext)
