import axiosInstance from "@/lib/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';

export interface UserLoginResponse {
  id: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface UserLogin {
  user: UserLoginResponse;
  token: string;
}

interface AuthState {
  userLogin: UserLogin | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginSuccess: boolean;
}

// Constants cho token storage
const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const TOKEN_EXPIRY_DAYS = 7

// Helper functions
const saveTokenToCookie = (token: string) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: TOKEN_EXPIRY_DAYS,
    secure: true,
    sameSite: 'strict',
    path: '/'
  })
}

const saveUserToLocalStorage = (user: UserLoginResponse) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // Trigger custom event để AuthContext update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-storage-change'))
  }
}

const getTokenFromCookie = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null
}

const getUserFromLocalStorage = (): UserLoginResponse | null => {
  try {
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

const clearAuthStorage = () => {
  Cookies.remove(TOKEN_KEY, { path: '/' })
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Trigger custom event để AuthContext update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-storage-change'))
  }
}

// Khởi tạo state từ storage
const getInitialState = (): AuthState => {
  const token = getTokenFromCookie()
  const user = getUserFromLocalStorage()
  
  return {
    userLogin: (token && user) ? { user, token } : null,
    token,
    loading: false,
    error: null,
    isAuthenticated: !!(token && user),
    loginSuccess: false,
  }
}

const initialState: AuthState = getInitialState()
interface UserLoginPayload {
  username: string;
  password: string;
}

export const login = createAsyncThunk(
  'auth/login', 
  async (loginData: UserLoginPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/login', loginData)
      return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response.data)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearLoginSuccess: (state) => {
      state.loginSuccess = false
    },
    logout: (state) => {
      state.userLogin = null
      state.token = null
      state.isAuthenticated = false
      state.loginSuccess = false
      state.error = null
      // Xóa khỏi storage
      clearAuthStorage()
    },
    setCredentials: (state, action: PayloadAction<UserLogin>) => {
      state.userLogin = action.payload
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loginSuccess = true
      // Lưu vào storage
      saveTokenToCookie(action.payload.token)
      saveUserToLocalStorage(action.payload.user)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true
      state.error = null
      state.loginSuccess = false
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false
      state.userLogin = action.payload
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loginSuccess = true
      state.error = null
      // Lưu vào cookie và localStorage
      saveTokenToCookie(action.payload.token)
      saveUserToLocalStorage(action.payload.user)
    })
    builder.addCase(login.rejected, (state, action) => {
      console.log(action.payload)
      state.loading = false
      state.error = (action.payload as any).message
      state.isAuthenticated = false
      state.loginSuccess = false
      // Xóa storage khi login thất bại
      clearAuthStorage()
    })
  }
})

export const { clearError, clearLoginSuccess, logout, setCredentials } = authSlice.actions
export default authSlice.reducer
