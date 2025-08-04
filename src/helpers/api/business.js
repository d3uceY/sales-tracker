import { authAxios } from './auth'

export const getBusinessInfo = async () => {
  return await authAxios.get('/business')
}

export const updateBusinessInfo = async (data) => {
  return await authAxios.put('/business', data)
}