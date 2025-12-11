// app/api/change_password/route.js (Next.js 13+ App Router)
// atau pages/api/change_password.js (Next.js Pages Router)

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';


export async function POST(request) {
  try {
    const { token, current_password, new_password } = await request.json();

    // Validasi input
    if (!token || !current_password || !new_password) {
      return Response.json({
        status: 'error',
        message: 'Token, current password, dan new password diperlukan'
      }, { status: 400 });
    }

    if (new_password.length < 6) {
      return Response.json({
        status: 'error',
        message: 'Password baru minimal 6 karakter'
      }, { status: 400 });
    }

    // Ambil user berdasarkan token
    const { data: user, error: userError } = await supabase
      .from('m_customers')
      .select('user_id, password, session(*)')
      .eq('session.token', token)
      .single();

    if (userError || !user) {
      return Response.json({
        status: 'error',
        message: 'Token tidak valid atau user tidak ditemukan'
      }, { status: 401 });
    }

    // Verifikasi password saat ini
    const isPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isPasswordValid) {
      return Response.json({
        status: 'error',
        message: 'Password saat ini tidak valid'
      }, { status: 401 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password di database
    const { error: updateError } = await supabase
      .from('m_customers')
      .update({ password: hashedPassword })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return Response.json({
        status: 'error',
        message: 'Gagal mengubah password'
      }, { status: 500 });
    }

    return Response.json({
      status: 'success',
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return Response.json({
      status: 'error',
      message: 'Terjadi kesalahan server'
    }, { status: 500 });
  }
}