import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { randomUUID } from "crypto";

// =======================
// 🔹 LOGIN (POST)
// =======================
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email & password wajib diisi" },
        { status: 400 }
      );
    }

    // 🔹 Cari user di Supabase
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error || !users || users.length === 0)
      return NextResponse.json({ status: "error", message: "User tidak ditemukan" });

    const user = users[0];

    // 🔹 Cek password (plaintext; ganti bcrypt di produksi)
    if (user.password_hash !== password)
      return NextResponse.json({ status: "error", message: "Password salah" });

    // 🔹 Buat session token
    const sessionToken = randomUUID();

    // 🔹 Simpan session
    await supabase.from("sessions").insert({
      user_id: user.id,
      email: user.email,
      token: sessionToken,
      created_at: new Date().toISOString(),
    });

    // 🔹 Response sukses
    return NextResponse.json({
      status: "success",
      message: "Login berhasil",
      session: sessionToken,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("💥 API Error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// =======================
// 🔹 GET SESSION (GET)
// =======================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Token tidak diberikan" },
        { status: 400 }
      );
    }

    // 🔹 Cek session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({
        status: "error",
        message: "Session tidak valid",
      });
    }

    // 🔹 Ambil data user
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("user_id, nama, email, no_hp, password_hash")
      .eq("email", session.email)
      .limit(1);

    if (userError || !users || users.length === 0) {
      return NextResponse.json({
        status: "error",
        message: "User tidak ditemukan",
      });
    }

    const user = users[0];

    return NextResponse.json({
      status: "success",
      message: "Session valid",
      user,
    });
  } catch (err) {
    console.error("💥 Session GET Error:", err);
    return NextResponse.json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}
