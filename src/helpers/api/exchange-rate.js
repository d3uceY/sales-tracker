import { authAxios } from './auth'

export const getExchangeRate = async () => {
  return await authAxios.get('/exchange-rate')
}

export const updateExchangeRate = async (data) => {
  return await authAxios.put('/exchange-rate', data)
}