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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            // Directly query Supabase `admin` table (client-side)
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

            const   admin = admins[0]

            // Plaintext password check (as-per current DB). Replace with hashing in production.
            if (admin.password !== password) {
                setError('Password salah')
                setLoading(false)
                return
            }

            // Create a session record in `sessions` table
            const { data: sessionData, error: sessionError } = await supabase
                .from('session')
                .insert({
                    user_id: admin.id || admin.admin_id || null,
                    email: admin.email,
                    token: Math.random().toString(36).slice(2),
                })
                .select()
                .single()

            if (sessionError) {
                setError(sessionError.message || 'Gagal membuat session')
                setLoading(false)
                return
            }

            const sessionToken = sessionData?.token
            if (sessionToken) localStorage.setItem('session', sessionToken)

            router.push('/dashboard')
        } catch (err) {
            setError(String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            id="loginForm"
            onSubmit={handleSubmit}
            className="bg-[#FCEEEE] shadow-2xl rounded-[40px] w-full max-w-md overflow-hidden"
        >
            {/* Wave Header */}
            <div className="relative bg-[#2D2E71] h-48 flex flex-col items-center justify-center text-white">
                {/* Logo */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <span className="text-[#2D2E71] font-bold text-xl">U</span>
                </div>

                {/* Title */}
                <h1 className="mt-2 text-lg font-semibold tracking-wide">ULTIMO</h1>

                {/* Wave Shape */}
                <svg className="absolute bottom-0 w-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <path d="M0.00,49.98 C234.35,166.56 357.57,-54.29 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                        className="fill-[#FCEEEE]" />
                </svg>
            </div>

            <div className="px-10 pb-10 space-y-5 mt-3">
                <h2 className="text-center font-semibold text-gray-800 text-xl">Welcome back!</h2>

                {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                {/* Email */}
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Username"
                    className="w-full border border-gray-300 rounded-full px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D2E71]"
                />

                {/* Password */}
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full border border-gray-300 rounded-full px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D2E71]"
                />

                {/* Remember + Forgot */}
                <div className="flex justify-between items-center text-gray-600 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-[#2D2E71]" />
                        Remember me
                    </label>
                    <a href="#" className="hover:underline">Forgot password?</a>
                </div>

                {/* Button Login */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full border-2 border-[#2D2E71] text-[#2D2E71] font-bold py-2 hover:bg-[#2D2E71] hover:text-white transition duration-200"
                >
                    {loading ? "Processing..." : "Login"}
                </button>

                

                {/* Divider OR */}
                <div className="flex items-center gap-4">
                    <span className="w-full h-px bg-gray-300"></span>
                    <span className="text-gray-600 text-sm">OR</span>
                    <span className="w-full h-px bg-gray-300"></span>
                </div>

               
                <p className="text-xs text-center text-gray-600">Sign in with another account</p>
            </div>
        </form>

)

}
