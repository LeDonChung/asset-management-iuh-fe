'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/api'

const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
})

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const router = useRouter()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<ForgotPasswordForm>({
        resolver: yupResolver(schema),
    })

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true)
        try {
            await axiosInstance.post('/api/v1/auth/forgot-password', {
                email: data.email,
            })

            setIsSubmitted(true)
            toast.success('Yêu cầu đặt lại mật khẩu đã được gửi!')
        } catch (error: any) {
            console.error('Forgot password error:', error)
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        router.push('/login')
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
            {/* Background overlay */}
            <div className="absolute inset-0 bg-black/30"></div>
            
            {/* Forgot Password Card - Centered */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Card Header */}
                    <div className="px-8 py-6">
                        <div className="text-center mb-6">
                            <img
                                src="/logo_iuh_full.png"
                                alt="IUH Logo"
                                className="h-16 w-auto mx-auto mb-4"
                            />
                            <h2 className="text-lg font-bold text-gray-800 border-b border-blue-600 pb-3">
                                QUÊN MẬT KHẨU
                            </h2>
                        </div>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                                    </p>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            {...register('email')}
                                            type="email"
                                            autoComplete="email"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Send Reset Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Đang gửi...
                                        </div>
                                    ) : (
                                        'Gửi yêu cầu đặt lại'
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
                                        Yêu cầu đã được gửi!
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong>{getValues('email')}</strong>.
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để đặt lại mật khẩu.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleBackToLogin}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại đăng nhập
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-white/80">
                        
                    </p>
                </div>
            </div>
        </div>
    )
}
