import { authAxios } from './auth'

export const getItemCategories = async () => {
  return await authAxios.get('/item-categories')
}

export const createItemCategory = async (data) => {
  return await authAxios.post('/item-categories', data)
}

export const updateItemCategory = async (id, data) => {
  return await authAxios.put(`/item-categories/${id}`, data)
}

export const deleteItemCategory = async (id) => {
  return await authAxios.delete(`/item-categories/${id}`)
} 