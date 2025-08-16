import axios from 'axios'
import toast from 'react-hot-toast'
import { env } from './env'

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage first, then from cookie
    let token = null
    
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token')
      
      if (!token) {
        // Fallback to cookie if localStorage is empty
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
        
        if (cookieToken) {
          token = cookieToken
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      return Promise.reject(new Error('Network error'))
    }

    // Handle different error status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear auth data and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
          
          // Only redirect if not already on auth pages
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
            window.location.href = '/login'
          }
        }
        break
        
      case 403:
        toast.error('Bạn không có quyền truy cập tính năng này.')
        break
        
      case 404:
        toast.error('Không tìm thấy dữ liệu yêu cầu.')
        break
        
      case 422:
        // Validation errors - don't show toast, let component handle
        break
        
      case 500:
        toast.error('Lỗi server nội bộ. Vui lòng thử lại sau.')
        break
        
      default:
        if (error.response.status >= 500) {
          toast.error('Có lỗi xảy ra từ phía server. Vui lòng thử lại sau.')
        }
    }

    return Promise.reject(error)
  }
)

export default api
