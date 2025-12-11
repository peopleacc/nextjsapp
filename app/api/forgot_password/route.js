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
        user: process.env.EMAIL_USER,     // email pengirim
        pass: process.env.EMAIL_PASS      // app password gmail
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
            // Check if email exists in m_customers table
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
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 menit

            // Save/Update OTP in database
            const { error: upsertError } = await supabase
                .from('password_resets')
                .upsert({
                    email: email,
                    otp: otpCode,
                    token: null,
                    expires_at: expiresAt.toISOString(),
                    used: false,
                    created_at: new Date().toISOString()
                }, { onConflict: 'email' })

            if (upsertError) {
                console.error('Upsert error:', upsertError)
                return jsonResponse({
                    status: 'error',
                    message: 'Gagal menyimpan OTP',
                    token: null
                }, 500)
            }

            // Send email dengan logging jika gagal
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
              <p style="color: #666;">Kami menerima permintaan reset password untuk akun Anda.</p>
              <p style="color: #666;">Kode OTP Anda adalah:</p>
              <div style="background: #0D1282; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <h1 style="color: white; font-size: 36px; letter-spacing: 10px; margin: 0;">${otpCode}</h1>
              </div>
              <p style="color: #666;">Kode ini berlaku selama <strong>10 menit</strong>.</p>
              <p style="color: #999; font-size: 12px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
            </div>
          </div>
        `
                })

                console.log('Email berhasil dikirim ke:', email)
                console.log('Message ID:', emailResult.messageId)

                return jsonResponse({
                    status: 'success',
                    message: 'OTP telah dikirim ke email Anda',
                    token: null
                })
            } catch (emailError) {
                console.error('=== GAGAL MENGIRIM EMAIL ===')
                console.error('Email tujuan:', email)
                console.error('Waktu:', new Date().toISOString())
                console.error('Error message:', emailError.message)
                console.error('Error code:', emailError.code)
                console.error('Full error:', emailError)

                return jsonResponse({
                    status: 'error',
                    message: 'Gagal mengirim email OTP. Silakan coba lagi nanti.',
                    token: null
                }, 500)
            }
        }

        // ========== ACTION 2: VERIFY OTP ==========
        if (action === 'verify_otp') {
            const { data: resetData, error } = await supabase
                .from('password_resets')
                .select('*')
                .eq('email', email)
                .eq('otp', otp)
                .eq('used', false)
                .single()

            if (error || !resetData) {
                console.log('OTP tidak valid untuk email:', email)
                return jsonResponse({
                    status: 'error',
                    message: 'OTP tidak valid',
                    token: null
                }, 400)
            }

            // Check if expired
            if (new Date(resetData.expires_at) < new Date()) {
                console.log('OTP expired untuk email:', email)
                return jsonResponse({
                    status: 'error',
                    message: 'OTP sudah expired. Silakan kirim ulang.',
                    token: null
                }, 400)
            }

            // Generate reset token
            const resetToken = crypto.randomUUID()

            // Update with token
            await supabase
                .from('password_resets')
                .update({ token: resetToken })
                .eq('email', email)

            console.log('OTP verified untuk email:', email)
            return jsonResponse({
                status: 'success',
                message: 'OTP valid',
                token: resetToken
            })
        }

        // ========== ACTION 3: RESET PASSWORD ==========
        if (action === 'reset_password') {
            // Verify token
            const { data: resetData, error } = await supabase
                .from('password_resets')
                .select('*')
                .eq('email', email)
                .eq('token', token)
                .eq('used', false)
                .single()

            if (error || !resetData) {
                console.log('Token tidak valid untuk email:', email)
                return jsonResponse({
                    status: 'error',
                    message: 'Token tidak valid atau sudah digunakan',
                    token: null
                }, 400)
            }

            // Update password di m_customers
            const { error: updateError } = await supabase
                .from('m_customers')
                .update({ password: new_password })
                .eq('email', email)

            if (updateError) {
                console.error('Gagal update password:', updateError)
                return jsonResponse({
                    status: 'error',
                    message: 'Gagal mengupdate password',
                    token: null
                }, 500)
            }

            // Mark token as used
            await supabase
                .from('password_resets')
                .update({ used: true })
                .eq('email', email)

            console.log('Password berhasil direset untuk email:', email)
            return jsonResponse({
                status: 'success',
                message: 'Password berhasil direset',
                token: null
            })
        }

        console.log('Action tidak valid:', action)
        return jsonResponse({
            status: 'error',
            message: 'Action tidak valid',
            token: null
        }, 400)

    } catch (error) {
        console.error('=== SERVER ERROR ===')
        console.error('Waktu:', new Date().toISOString())
        console.error('Error:', error)
        return jsonResponse({
            status: 'error',
            message: 'Terjadi kesalahan server',
            token: null
        }, 500)
    }
}