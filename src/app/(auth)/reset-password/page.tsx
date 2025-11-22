'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/api'

const schema = yup.object({
  newPassword: yup
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
    )
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Xác nhận mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
})

interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      toast.error('Token không hợp lệ')
      return
    }
    setTokenValid(true)
  }, [token])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Token không hợp lệ')
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.post('/api/v1/auth/reset-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      
      setIsSuccess(true)
      toast.success('Mật khẩu đã được đặt lại thành công!')
    } catch (error: any) {
      console.error('Reset password error:', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  if (tokenValid === false) {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="px-8 py-6">
              <div className="text-center mb-6">
                <img
                  src="/logo_iuh_full.png"
                  alt="IUH Logo"
                  className="h-16 w-auto mx-auto mb-4"
                />
                <h2 className="text-lg font-bold text-gray-800 border-b border-red-600 pb-3">
                  TOKEN KHÔNG HỢP LỆ
                </h2>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Liên kết không hợp lệ
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/forgot-password')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
                >
                  Yêu cầu đặt lại mật khẩu mới
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6">
            <div className="text-center mb-6">
              <img
                src="/logo_iuh_full.png"
                alt="IUH Logo"
                className="h-16 w-auto mx-auto mb-4"
              />
              <h2 className="text-lg font-bold text-gray-800 border-b border-blue-600 pb-3">
                ĐẶT LẠI MẬT KHẨU
              </h2>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Nhập mật khẩu mới cho tài khoản của bạn
                  </p>
                </div>

                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium mb-2">Yêu cầu mật khẩu:</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Ít nhất 8 ký tự</li>
                    <li>• Có ít nhất 1 chữ hoa (A-Z)</li>
                    <li>• Có ít nhất 1 chữ thường (a-z)</li>
                    <li>• Có ít nhất 1 số (0-9)</li>
                    <li>• Có ít nhất 1 ký tự đặc biệt (@$!%*?&)</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Đặt lại mật khẩu thành công!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập với mật khẩu mới.
                  </p>
                </div>
                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Đăng nhập ngay
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen relative flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="px-8 py-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
