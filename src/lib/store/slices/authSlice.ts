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
  accessScopeTypes: string[];
  unitId: string;
  unitName?: string;
}

export interface UserLogin {
  user: UserLoginResponse;
  token: string;
}

// Request interfaces
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
}

interface AuthState {
  userLogin: UserLogin | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginSuccess: boolean;
  // Change password states
  changePasswordLoading: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
  // Update profile states
  updateProfileLoading: boolean;
  updateProfileError: string | null;
  updateProfileSuccess: boolean;
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
const saveTokenToLocalStorage = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
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
    // Change password states
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
    // Update profile states
    updateProfileLoading: false,
    updateProfileError: null,
    updateProfileSuccess: false,
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

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (changePasswordData: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/api/v1/auth/change-password', changePasswordData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi đổi mật khẩu' });
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateProfileData: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/api/v1/auth/update-profile', updateProfileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra khi cập nhật thông tin' });
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
    clearChangePasswordError: (state) => {
      state.changePasswordError = null
    },
    clearChangePasswordSuccess: (state) => {
      state.changePasswordSuccess = false
    },
    clearUpdateProfileError: (state) => {
      state.updateProfileError = null
    },
    clearUpdateProfileSuccess: (state) => {
      state.updateProfileSuccess = false
    },
    logout: (state) => {
      state.userLogin = null
      state.token = null
      state.isAuthenticated = false
      state.loginSuccess = false
      state.error = null
      // Reset change password states
      state.changePasswordLoading = false
      state.changePasswordError = null
      state.changePasswordSuccess = false
      // Reset update profile states
      state.updateProfileLoading = false
      state.updateProfileError = null
      state.updateProfileSuccess = false
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
    // Login reducers
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
      saveTokenToLocalStorage(action.payload.token)
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
    
    // Change password reducers
    builder.addCase(changePassword.pending, (state) => {
      state.changePasswordLoading = true
      state.changePasswordError = null
      state.changePasswordSuccess = false
    })
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.changePasswordLoading = false
      state.changePasswordSuccess = true
      state.changePasswordError = null
    })
    builder.addCase(changePassword.rejected, (state, action) => {
      state.changePasswordLoading = false
      state.changePasswordError = (action.payload as any)?.message || 'Có lỗi xảy ra khi đổi mật khẩu'
      state.changePasswordSuccess = false
    })
    
    // Update profile reducers
    builder.addCase(updateProfile.pending, (state) => {
      state.updateProfileLoading = true
      state.updateProfileError = null
      state.updateProfileSuccess = false
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.updateProfileLoading = false
      state.updateProfileSuccess = true
      state.updateProfileError = null
      // Cập nhật user data trong state nếu có
      if (state.userLogin && action.payload) {
        state.userLogin.user = { ...state.userLogin.user, ...action.payload }
        // Cập nhật localStorage
        saveUserToLocalStorage(state.userLogin.user)
      }
    })
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.updateProfileLoading = false
      state.updateProfileError = (action.payload as any)?.message || 'Có lỗi xảy ra khi cập nhật thông tin'
      state.updateProfileSuccess = false
    })
  }
})

export const { 
  clearError, 
  clearLoginSuccess, 
  clearChangePasswordError, 
  clearChangePasswordSuccess,
  clearUpdateProfileError,
  clearUpdateProfileSuccess,
  logout, 
  setCredentials 
} = authSlice.actions

export default authSlice.reducer
