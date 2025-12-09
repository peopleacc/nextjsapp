import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// 🔹 GET - Ambil data personal information berdasarkan TOKEN
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    console.log("📩 GET Personal Info - Token:", token);

    // 🔹 Validasi input
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Token wajib diisi", user: null },
        { status: 400 }
      );
    }

    // 🔹 Ambil data user dari Supabase berdasarkan token/session
    const { data: user, error } = await supabase
      .from("m_customers")
      .select("user_id, nama, email, no_hp, address")
      .eq("email", email)  // Sesuaikan dengan nama kolom token di database
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { status: "error", message: "User tidak ditemukan", user: null },
        { status: 404 }
      );
    }

    console.log("✅ User ditemukan:", user);

    // ✅ Kirim response sukses (sesuai dengan UserData model Android)
    return NextResponse.json({
      status: "success",
      message: "Data user berhasil diambil",
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        phone: user.no_hp,  // 🔹 Ubah ke 'phone' untuk Android
        address: user.address || null,
      },
    });
  } catch (err) {
    console.error("💥 API Error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error", user: null },
      { status: 500 }
    );
  }
}

// 🔹 POST - Update personal information berdasarkan TOKEN
export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");  // 🔹 Token dari query parameter

    // 🔹 Baca body JSON dari Android
    const body = await req.json();
    console.log("📩 Raw body dari Android:", body);

    const { nama, email, phone, address } = body;

    console.log("📨 Data diterima dari Android:");
    console.log("   Token (query):", token);
    console.log("   Token (body):", body.token);
    console.log("   Nama:", nama);
    console.log("   Email:", email);
    console.log("   Phone:", phone);
    console.log("   Address:", address);

    // 🔹 Validasi token
    if (!token && !body.token) {
      return NextResponse.json(
        { status: "error", message: "Token tidak ditemukan", user: null },
        { status: 401 }
      );
    }

    const authToken = token || body.token;

    // 🔹 Validasi input (nama, email, phone wajib)
    if (!email || !nama || !phone) {
      return NextResponse.json(
        { status: "error", message: "Nama, email, dan phone wajib diisi", user: null },
        { status: 400 }
      );
    }

    // 🔹 Verifikasi token dan ambil user
    const { data: existingUser, error: verifyError } = await supabase
      .from("m_customers")
      .select("user_id, email")
      .eq("email", email)  // Sesuaikan dengan nama kolom token
      .single();

    if (verifyError || !existingUser) {
      console.error("❌ Token invalid:", verifyError);
      return NextResponse.json(
        { status: "error", message: "Token tidak valid", user: null },
        { status: 401 }
      );
    }

    // 🔹 Update data user ke Supabase berdasarkan email
    const { data: updatedUser, error } = await supabase
      .from("m_customers")
      .update({
        nama: nama,
        no_hp: phone,  // 🔹 Kolom database adalah no_hp
        address: address || null
      })
      .eq("email", email)
      .select("user_id, nama, email, no_hp, address")  // 🔹 Select no_hp dari database
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { status: "error", message: "Gagal update data user", user: null },
        { status: 500 }
      );
    }

    console.log("✅ Update berhasil:", updatedUser);

    // ✅ Kirim response sukses (sesuai dengan UpdatePersonalInfoResponse Android)
    return NextResponse.json({
      status: "success",
      message: "Data user berhasil diupdate",
      user: {
        id: updatedUser.id,
        nama: updatedUser.nama,
        email: updatedUser.email,
        phone: updatedUser.no_hp,  // 🔹 Ubah ke 'phone' untuk Android
        address: updatedUser.address || null,
      },
    });
  } catch (err) {
    console.error("💥 API Error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error", user: null },
      { status: 500 }
    );
  }
}
