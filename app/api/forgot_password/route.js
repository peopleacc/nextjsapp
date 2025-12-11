import nodemailer from 'nodemailer'
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from 'next/server';

// Generate 6 digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email transporter - sesuaikan dengan SMTP Anda
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Helper function untuk response JSON
function jsonResponse(data, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}

// Handle OPTIONS request untuk CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}

// Handle POST request
export async function POST(request) {
    try {
        const body = await request.json()
        const { action, email, otp, token, new_password } = body

        console.log('=== FORGOT PASSWORD REQUEST ===')
        console.log('Action:', action)
        console.log('Email:', email)
        console.log('Waktu:', new Date().toISOString())

        // ========== ACTION 1: SEND OTP ==========
        if (action === 'send_otp') {
            const { data: user, error } = await supabase
                .from('m_customers')
                .select('user_id, email, nama')
                .eq('email', email)
                .single()

            if (error || !user) {
                console.log('Email tidak ditemukan:', email)
                return jsonResponse({
                    status: 'error',
                    message: 'Email tidak terdaftar',
                    token: null
                }, 404)
            }

            // Generate OTP
            const otpCode = generateOTP()
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

            // ✅ CONSOLE LOG OTP YANG DIKIRIM
            console.log('=== OTP GENERATED ===')
            console.log('Email:', email)
            console.log('OTP Code:', otpCode)
            console.log('OTP Type:', typeof otpCode)
            console.log('OTP Length:', otpCode.length)
            console.log('Expires At:', expiresAt.toISOString())

            // Save/Update OTP in database
            const { data: upsertData, error: upsertError } = await supabase
                .from('password_resets')
                .upsert({
                    email: email,
                    otp: otpCode,
                    token: null,
                    expires_at: expiresAt.toISOString(),
                    used: false,
                    created_at: new Date().toISOString()
                }, { onConflict: 'email' })
                .select()

            // ✅ CONSOLE LOG HASIL SIMPAN KE DATABASE
            console.log('=== DATABASE SAVE RESULT ===')
            console.log('Upsert Data:', upsertData)
            console.log('Upsert Error:', upsertError)

            if (upsertError) {
                console.error('Upsert error:', upsertError)
                return jsonResponse({
                    status: 'error',
                    message: 'Gagal menyimpan OTP',
                    token: null
                }, 500)
            }

            // ✅ VERIFIKASI OTP TERSIMPAN DENGAN BENAR
            const { data: verifyData } = await supabase
                .from('password_resets')
                .select('*')
                .eq('email', email)
                .single()

            console.log('=== VERIFY SAVED OTP ===')
            console.log('Saved in DB:', verifyData)
            console.log('OTP in DB:', verifyData?.otp)
            console.log('OTP Match:', verifyData?.otp === otpCode)

            // Send email
            try {
                const emailResult = await transporter.sendMail({
                    from: `"ULTIMO" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Kode OTP Reset Password - ULTIMO',
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #0D1282, #7886C7); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0;">ULTIMO</h1>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <h2 style="color: #333;">Reset Password</h2>
                            <p style="color: #666;">Halo ${user.nama || 'User'},</p>
                            <p style="color: #666;">Kode OTP Anda adalah:</p>
                            <div style="background: #0D1282; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                                <h1 style="color: white; font-size: 36px; letter-spacing: 10px; margin: 0;">${otpCode}</h1>
                            </div>
                            <p style="color: #666;">Kode ini berlaku selama <strong>10 menit</strong>.</p>
                        </div>
                    </div>
                    `
                })

                console.log('=== EMAIL SENT SUCCESS ===')
                console.log('Email berhasil dikirim ke:', email)
                console.log('OTP yang dikirim:', otpCode)

                return jsonResponse({
                    status: 'success',
                    message: 'OTP telah dikirim ke email Anda',
                    token: null
                })
            } catch (emailError) {
                console.error('=== GAGAL MENGIRIM EMAIL ===')
                console.error('Error:', emailError.message)
                return jsonResponse({
                    status: 'error',
                    message: 'Gagal mengirim email OTP.',
                    token: null
                }, 500)
            }
        }

      // ========== ACTION 2: VERIFY OTP ==========
if (action === 'verify_otp') {
    console.log('=== VERIFY OTP REQUEST ===')
    console.log('Email received:', email)
    console.log('OTP received:', otp)

    const { data: resetData, error } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('used', false)
        .single()

    console.log('Reset Data:', resetData)
    console.log('Query Error:', error)

    if (error || !resetData) {
        return jsonResponse({
            status: 'error',
            message: 'OTP tidak valid',
            token: null
        }, 400)
    }

    // ✅ FIX: Pastikan expires_at diparsing sebagai UTC
    const expiresAt = new Date(resetData.expires_at + 'Z') // Tambahkan 'Z' untuk UTC
    const now = new Date()
    
    console.log('=== TIMEZONE DEBUG ===')
    console.log('expires_at raw:', resetData.expires_at)
    console.log('expires_at parsed (UTC):', expiresAt.toISOString())
    console.log('Current time (UTC):', now.toISOString())
    console.log('Is expired:', expiresAt < now)

    if (expiresAt < now) {
        console.log('❌ OTP expired untuk email:', email)
        return jsonResponse({
            status: 'error',
            message: 'OTP sudah expired. Silakan kirim ulang.',
            token: null
        }, 400)
    }

    // Generate reset token
    const resetToken = crypto.randomUUID()

    await supabase
        .from('password_resets')
        .update({ token: resetToken })
        .eq('email', email)

    console.log('✅ OTP verified untuk email:', email)
    return jsonResponse({
        status: 'success',
        message: 'OTP valid',
        token: resetToken
    })
}
        // ========== ACTION 3: RESET PASSWORD ==========
        if (action === 'reset_password') {
            const { data: resetData, error } = await supabase
                .from('password_resets')
                .select('*')
                .eq('email', email)
                .eq('token', token)
                .eq('used', false)
                .single()

            if (error || !resetData) {
                return jsonResponse({
                    status: 'error',
                    message: 'Token tidak valid atau sudah digunakan',
                    token: null
                }, 400)
            }

            const { error: updateError } = await supabase
                .from('m_customers')
                .update({ password: new_password })
                .eq('email', email)

            if (updateError) {
                return jsonResponse({
                    status: 'error',
                    message: 'Gagal mengupdate password',
                    token: null
                }, 500)
            }

            await supabase
                .from('password_resets')
                .update({ used: true })
                .eq('email', email)

            console.log('✅ Password berhasil direset untuk email:', email)
            return jsonResponse({
                status: 'success',
                message: 'Password berhasil direset',
                token: null
            })
        }

        return jsonResponse({
            status: 'error',
            message: 'Action tidak valid',
            token: null
        }, 400)

    } catch (error) {
        console.error('=== SERVER ERROR ===')
        console.error('Error:', error)
        return jsonResponse({
            status: 'error',
            message: 'Terjadi kesalahan server',
            token: null
        }, 500)
    }
}