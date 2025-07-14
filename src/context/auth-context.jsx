"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authApi } from "../helpers/api/auth"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  })

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        // Verify token and get user info
        const user = await authApi.verifyToken()
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
        }))
      } else {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const login = async (credentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await authApi.login(credentials)
      const { user, accessToken, refreshToken } = response
      const access_token = accessToken
      const refresh_token = refreshToken

      // Store tokens securely
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      }))

      return { success: true }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Login failed",
      }))
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear tokens and state regardless of API call success
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      })
    }
  }

  const forgotPassword = async (email) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      await authApi.forgotPassword(email)
      setState((prev) => ({ ...prev, isLoading: false }))
      return { success: true }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to send reset email",
      }))
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      await authApi.resetPassword(token, newPassword)
      setState((prev) => ({ ...prev, isLoading: false }))
      return { success: true }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to reset password",
      }))
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      await authApi.changePassword(currentPassword, newPassword)
      setState((prev) => ({ ...prev, isLoading: false }))
      return { success: true }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to change password",
      }))
      return { success: false, error: error.message }
    }
  }

  const refreshToken = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token")
      if (!refresh_token) throw new Error("No refresh token")

      const response = await authApi.refreshToken(refresh_token)
      localStorage.setItem("access_token", response.access_token)

      return response.access_token
    } catch (error) {
      // Refresh failed, logout user
      logout()
      throw error
    }
  }

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  const value = {
    ...state,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
