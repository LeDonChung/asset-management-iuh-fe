'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Lock, Building, Info, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = yup.object({
  username: yup.string().required('Tài khoản là bắt buộc'),
  password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Mật khẩu là bắt buộc'),
})

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const success = await login(data.username, data.password)
      if (success) {
        toast.success('Đăng nhập thành công!')
        router.push('/admin')
      } else {
        toast.error('Tài khoản hoặc mật khẩu không chính xác!')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Đã xảy ra lỗi khi đăng nhập!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Panel - Instructions */}
        <div className="hidden lg:block">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hướng dẫn sử dụng</h2>
                <p className="text-sm text-orange-600 font-medium">
                  Hệ thống Quản lý Tài sản IUH
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p>
                  Người dùng đăng nhập vào hệ thống quản lý tài sản chỉ sử dụng tài khoản được cấp bởi phòng quản trị,
                  không sử dụng tài khoản LMS hoặc tài khoản sinh viên.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p>
                  Việc thay đổi mật khẩu, cập nhật email và thông tin cá nhân nên được thực hiện ngay khi truy cập lần đầu.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <p>
                  Nếu gặp vấn đề trong quá trình sử dụng, vui lòng liên hệ bộ phận kỹ thuật hoặc giảng viên phụ trách để được hỗ trợ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex justify-center">
          <div className="w-full">
            {/* Mobile Instructions */}
            <div className="lg:hidden mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Hướng dẫn sử dụng</h3>
                    <p className="text-sm text-orange-600">Hệ thống Quản lý Tài sản IUH</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Sử dụng tài khoản được cấp bởi phòng quản trị. Thay đổi mật khẩu ngay khi truy cập lần đầu.
                </p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="px-4 sm:px-8">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <img
                      src="/logo_iuh_full.png"
                      alt="IUH Logo"
                      className="h-20 sm:h-32 w-auto mb-4"
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold border-b border-blue-600 pb-4">
                    ĐĂNG NHẬP HỆ THỐNG
                  </h2>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 sm:px-8 py-6 sm:py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...register('username')}
                        type="text"
                        autoComplete="username"
                        className="w-full pl-10 pr-4 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Nhập tên đăng nhập"
                        defaultValue="superadmin"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className="w-full pl-10 pr-12 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Nhập mật khẩu"
                        defaultValue="superadmin123"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Quên mật khẩu ?
                    </button>
                  </div>
                </form>

                {/* Demo Accounts */}
                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2 sm:mb-3">
                    Tài khoản demo:
                  </h4>
                  <div className="space-y-1 sm:space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-blue-700 font-medium">Super Admin:</span>
                      <span className="text-blue-600">superadmin / superadmin123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-blue-700 font-medium">Admin:</span>
                      <span className="text-blue-600">admin / admin123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-blue-700 font-medium">Phòng Quản Trị:</span>
                      <span className="text-blue-600">quantri / quantri123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-blue-700 font-medium">Phòng Kế Hoạch:</span>
                      <span className="text-blue-600">kehoach / kehoach123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-blue-700 font-medium">Đơn Vị Sử Dụng:</span>
                      <span className="text-blue-600">donvi / donvi123</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                © 2024 Đại học Công nghiệp TP.HCM. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
