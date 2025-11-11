import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req) {
  try {
    // 🔹 Baca isi body dari Android
    const body = await req.text()
    console.log("📩 Raw body dari Android:", body) // <--- log mentah dari Android

    const params = new URLSearchParams(body)
    const email = params.get("email")
    const password = params.get("password")

    console.log("📨 Data diterima dari Android:")
    console.log("   Email:", email)
    console.log("   Password:", password)

    if (!email || !password) {
      console.warn("⚠️ Email atau password kosong!")
      return NextResponse.json(
        { status: "error", message: "Email dan password wajib diisi" },
        { status: 400 }
      )
    }

    // 🔹 Ambil user dari tabel Supabase
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ status: "error", message: "Gagal ambil data user" })
    }

    console.log("📦 Data user ditemukan:", users)

    if (!users || users.length === 0) {
      console.warn("⚠️ Email tidak ditemukan di database.")
      return NextResponse.json({ status: "error", message: "Email tidak ditemukan" })
    }

    const user = users[0]

    // 🔹 Bandingkan password (plaintext)
    if (user.password !== password) {
      console.warn("❌ Password salah untuk user:", email)
      return NextResponse.json({ status: "error", message: "Password salah" })
    }

    console.log("✅ Login berhasil untuk user:", email)

    // ✅ Kirim respon sukses
    return NextResponse.json({
      status: "success",
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
      },
    })
  } catch (err) {
    console.error("💥 API Error:", err)
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log("📡 Endpoint /api/login diakses melalui GET")
  return NextResponse.json({ message: "Login API aktif ✅" })
}
