"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { data: admins, error } = await supabase
                .from('admin')
                .select('*')
                .eq('email', email)
                .limit(1)

            if (error) {
                setError(error.message || 'Gagal memeriksa admin')
                setLoading(false)
                return
            }

            if (!admins || admins.length === 0) {
                setError('Admin tidak ditemukan')
                setLoading(false)
                return
            }

            const admin = admins[0]

            if (admin.password !== password) {
                setError('Password salah')
                setLoading(false)
                return
            }

            // Generate session token and save to localStorage only
            // No need to save to database for admin panel
            const sessionToken = Math.random().toString(36).slice(2) + Date.now().toString(36)
            localStorage.setItem('session', sessionToken)
            localStorage.setItem('admin', JSON.stringify({
                id: admin.id || admin.admin_id,
                email: admin.email,
                nama: admin.nama || 'Admin'
            }))

            router.push('/dashboard')
        } catch (err) {
            setError(String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Card Container */}
            <form
                id="loginForm"
                onSubmit={handleSubmit}
                className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20"
            >
                {/* Header with Logo */}
                <div className="relative bg-gradient-to-br from-[#2D336B] via-[#3d4280] to-[#4f5aa6] pt-10 pb-16 flex flex-col items-center justify-center text-white overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>



                    {/* Logo - Bigger */}
                    <div className="bg-white p-3 rounded-2xl shadow-xl z-10 transform hover:scale-105 transition-transform duration-300">
                        <img
                            src="/image/logo.jpg"
                            alt="Ultimo Logo"
                            className="w-24 h-24 object-contain rounded-xl"
                        />
                    </div>

                    {/* Welcome Back Text */}
                    <h1 className="mt-4 text-2xl font-bold tracking-wide z-10">
                        Welcome Back!
                    </h1>

                    {/* Wave Shape */}
                    <svg
                        className="absolute bottom-0 w-full z-0"
                        viewBox="0 0 500 60"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,30 C150,60 350,0 500,30 L500,60 L0,60 Z"
                            className="fill-white/95"
                        />
                    </svg>
                </div>

                {/* Form Content */}
                <div className="px-8 pb-8 pt-4 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-xl flex items-center justify-center gap-2">
                            <i className="bi bi-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <i className="bi bi-envelope text-[#2D336B]"></i>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@ultimo.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D336B] focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <i className="bi bi-lock text-[#2D336B]"></i>
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D336B] focus:border-transparent transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D336B] transition-colors"
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#2D336B] rounded"
                            />
                            Remember me
                        </label>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#2D336B] to-[#4f5aa6] text-white font-bold py-3.5 rounded-xl hover:from-[#3d4280] hover:to-[#5f6ab6] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i>
                                Login
                            </>
                        )}
                    </button>

                    {/* Footer */}
                    <p className="text-xs text-center text-gray-400 pt-2">
                        © 2025 Ultimo. All rights reserved.
                    </p>
                </div>
            </form>
        </div>
    );
}
