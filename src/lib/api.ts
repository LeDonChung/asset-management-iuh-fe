import axios from 'axios'
import toast from 'react-hot-toast'
import { env } from './env'

export const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Map để lưu các request đang pending, tránh gọi API trùng lặp
const pendingRequests = new Map<string, Promise<any>>()

// Tạo key duy nhất cho mỗi request dựa trên method, URL, params
function generateRequestKey(config: any): string {
  // Nếu config là string, đó là URL
  if (typeof config === 'string') {
    return `GET_${config}__`
  }
  
  // Nếu config là object
  const { method, url, params, data } = config
  const paramsStr = params ? JSON.stringify(params) : ''
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method?.toUpperCase() || 'GET'}_${url || config}_${paramsStr}_${dataStr}`
}

// Wrapper function để xử lý request deduplication
const originalRequest = axiosInstance.request.bind(axiosInstance)

axiosInstance.request = function (config: any) {
  const requestKey = generateRequestKey(config)
  
  // Kiểm tra xem có request trùng đang pending không
  if (pendingRequests.has(requestKey)) {
    // Trả về promise của request đang pending thay vì tạo request mới
    return pendingRequests.get(requestKey)!
  }
  
  // Tạo request mới
  const requestPromise = originalRequest(config).finally(() => {
    // Xóa request khỏi Map sau khi hoàn thành (thành công hoặc lỗi)
    pendingRequests.delete(requestKey)
  })
  
  // Lưu request vào Map
  pendingRequests.set(requestKey, requestPromise)
  
  return requestPromise
}

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
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

export default axiosInstance