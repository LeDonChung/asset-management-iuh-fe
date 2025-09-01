'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, User, ArrowLeft, CheckCircle, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState("")
    const [identifierType, setIdentifierType] = useState<"email" | "studentId">("studentId")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateStudentId = (studentId: string) => {
        // Vietnamese student ID format: 8 digits starting with year
        const studentIdRegex = /^\d{8}$/
        return studentIdRegex.test(studentId)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!identifier.trim()) {
            setError(identifierType === "email" ? "Email không được để trống" : "Mã cán bộ không được để trống")
            return
        }

        if (identifierType === "email" && !validateEmail(identifier)) {
            setError("Email không hợp lệ")
            return
        }

        if (identifierType === "studentId" && !validateStudentId(identifier)) {
            setError("Mã cán bộ không hợp lệ (8 chữ số)")
            return
        }

        setIsLoading(true)
        try {
            // TODO: Implement API call to send reset password
            console.log('Sending reset password for:', identifierType, identifier)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            setIsSubmitted(true)
            toast.success('Yêu cầu đặt lại mật khẩu đã được gửi!')
        } catch (error) {
            console.error('Forgot password error:', error)
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        router.push('/login')
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
                                <h2 className="text-xl font-bold text-gray-900">Quên mật khẩu</h2>
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
                                    Nhập email hoặc Mã cán bộ của bạn để đặt lại mật khẩu.
                                </p>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-blue-600">2</span>
                                </div>
                                <p>
                                    Hệ thống sẽ gửi link đặt lại mật khẩu vào email của bạn.
                                </p>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-blue-600">3</span>
                                </div>
                                <p>
                                    Kiểm tra email và làm theo hướng dẫn để tạo mật khẩu mới.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleBackToLogin}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline transition-colors"
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Forgot Password Form */}
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
                                        <h3 className="text-lg font-bold text-gray-900">Quên mật khẩu</h3>
                                        <p className="text-sm text-orange-600">Hệ thống Quản lý Tài sản IUH</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700">
                                    Nhập email hoặc Mã cán bộ để đặt lại mật khẩu.
                                </p>
                            </div>
                        </div>

                        {/* Forgot Password Card */}
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
                                        QUÊN MẬT KHẨU
                                    </h2>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="px-4 sm:px-8 py-6 sm:py-8">
                                {!isSubmitted ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Nhập vào {identifierType === "email" ? "email" : "Mã cán bộ"} của bạn
                                            </p>

                                            {/* Identifier Type Toggle */}
                                            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIdentifierType("studentId")
                                                        setIdentifier("")
                                                        setError("")
                                                    }}
                                                    className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${identifierType === "studentId"
                                                        ? "bg-white text-blue-600 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900"
                                                        }`}
                                                >
                                                    <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                                                    <span className="hidden sm:inline">Mã cán bộ</span>
                                                    <span className="sm:hidden">Mã CB</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIdentifierType("email")
                                                        setIdentifier("")
                                                        setError("")
                                                    }}
                                                    className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${identifierType === "email"
                                                        ? "bg-white text-blue-600 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900"
                                                        }`}
                                                >
                                                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                                                    Email
                                                </button>
                                            </div>

                                            {/* Input Field */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {identifierType === "email" ? "Email" : "Mã cán bộ"} <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    {identifierType === "email" ? (
                                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    )}
                                                    <Input
                                                        type={identifierType === "email" ? "email" : "text"}
                                                        value={identifier}
                                                        onChange={(e) => {
                                                            setIdentifier(e.target.value)
                                                            if (error) setError("")
                                                        }}
                                                        placeholder={identifierType === "email" ? "example@email.com" : "01xxxxx"}
                                                        className={`pl-10 py-6 ${error ? "border-red-500 focus:ring-red-500" : ""}`}
                                                    />
                                                </div>
                                                {error && (
                                                    <p className="mt-2 text-sm text-red-600">{error}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <Button
                                                variant="default"
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        <span>Đang xử lý...</span>
                                                    </div>
                                                ) : (
                                                    "Quên mật khẩu"
                                                )}
                                            </Button>

                                            <div className="text-center">
                                                <span className="text-sm text-gray-500">Hoặc</span>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleBackToLogin}
                                                className="w-full"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Quay lại Đăng Nhập</span>
                                                <span className="sm:hidden">Quay lại</span>
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Yêu cầu đã được gửi!
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến {identifierType === "email" ? "email" : "Mã cán bộ"} <strong>{identifier}</strong>.
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Vui lòng kiểm tra và làm theo hướng dẫn để đặt lại mật khẩu.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleBackToLogin}
                                            className="w-full"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Quay lại đăng nhập</span>
                                            <span className="sm:hidden">Quay lại</span>
                                        </Button>
                                    </div>
                                )}
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
