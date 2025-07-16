import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// Create axios instance with interceptors
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle token refresh
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          localStorage.setItem("access_token", access_token)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return authAxios(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export { authAxios }

export const authApi = {
  // Login user
  login: async (credentials) => {
    const response = await authAxios.post("/auth/login", credentials)
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await authAxios.post("/auth/logout")
    return response.data
  },

  // Verify current token and get user info
  verifyToken: async () => {
    const response = await authAxios.get("/auth/me")
    return response.data
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email,
    })
    return response.data
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token,
      new_password: newPassword,
    })
    return response.data
  },

  // Change password (authenticated)
  changePassword: async (currentPassword, newPassword) => {
    const response = await authAxios.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },
}
