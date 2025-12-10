import nodemailer from 'nodemailer'
import { supabase } from "@/lib/supabaseClient";




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

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }

    const { action, email, otp, token, new_password } = req.body

    try {
        // ========== ACTION 1: SEND OTP ==========
        if (action === 'send_otp') {
            // Check if email exists in m_customers table
            const { data: user, error } = await supabase
                .from('m_customers')
                .select('user_id, email, nama')
                .eq('email', email)
                .single()

            if (error || !user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Email tidak terdaftar'
                })
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
                return res.status(500).json({
                    status: 'error',
                    message: 'Gagal menyimpan OTP'
                })
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

                return res.status(200).json({
                    status: 'success',
                    message: 'OTP telah dikirim ke email Anda'
                })
            } catch (emailError) {
                console.error('=== GAGAL MENGIRIM EMAIL ===')
                console.error('Email tujuan:', email)
                console.error('Waktu:', new Date().toISOString())
                console.error('Error message:', emailError.message)
                console.error('Error code:', emailError.code)
                console.error('Full error:', emailError)

                return res.status(500).json({
                    status: 'error',
                    message: 'Gagal mengirim email OTP. Silakan coba lagi nanti.'
                })
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
                return res.status(400).json({
                    status: 'error',
                    message: 'OTP tidak valid'
                })
            }

            // Check if expired
            if (new Date(resetData.expires_at) < new Date()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'OTP sudah expired. Silakan kirim ulang.'
                })
            }

            // Generate reset token
            const resetToken = crypto.randomUUID()

            // Update with token
            await supabase
                .from('password_resets')
                .update({ token: resetToken })
                .eq('email', email)

            return res.status(200).json({
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
                return res.status(400).json({
                    status: 'error',
                    message: 'Token tidak valid atau sudah digunakan'
                })
            }

            // Update password di m_customers
            // CATATAN: Sesuaikan dengan cara hash password di sistem Anda
            const { error: updateError } = await supabase
                .from('m_customers')
                .update({ password: new_password })
                .eq('email', email)

            if (updateError) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Gagal mengupdate password'
                })
            }

            // Mark token as used
            await supabase
                .from('password_resets')
                .update({ used: true })
                .eq('email', email)

            return res.status(200).json({
                status: 'success',
                message: 'Password berhasil direset'
            })
        }

        return res.status(400).json({
            status: 'error',
            message: 'Action tidak valid'
        })

    } catch (error) {
        console.error('Error:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan server'
        })
    }
}