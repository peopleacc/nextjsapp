import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// 🔹 GET - Ambil data personal information berdasarkan EMAIL
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("📩 GET Personal Info - Email:", email);

    // 🔹 Validasi input
    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email wajib diisi", user: null },
        { status: 400 }
      );
    }

    // 🔹 Ambil data user dari Supabase berdasarkan email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, address")
      .eq("email", email)
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { status: "error", message: "User tidak ditemukan", user: null },
        { status: 404 }
      );
    }

    console.log("✅ User ditemukan:", user);

    // ✅ Kirim response sukses
    return NextResponse.json({
      status: "success",
      message: "Data user berhasil diambil",
      user: {
        id: user.id,
        nama: user.name,
        email: user.email,
        phone: user.phone,
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

// 🔹 POST - Update personal information berdasarkan EMAIL
export async function POST(req) {
  try {
    // 🔹 Baca body JSON dari Android
    const body = await req.json();
    console.log("📩 Raw body dari Android:", body);

    const { nama, email, phone, address } = body;

    console.log("📨 Data diterima dari Android:");
    console.log("   Nama:", nama);
    console.log("   Email:", email);
    console.log("   Phone:", phone);
    console.log("   Address:", address);

    // 🔹 Validasi input (email dan nama wajib)
    if (!email || !nama || !phone) {
      return NextResponse.json(
        { status: "error", message: "Nama, email, dan phone wajib diisi", user: null },
        { status: 400 }
      );
    }

    // 🔹 Update data user ke Supabase berdasarkan email
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        name: nama,
        phone: phone,
        address: address || null
      })
      .eq("email", email)
      .select("id, name, email, phone, address")
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { status: "error", message: "Gagal update data user", user: null },
        { status: 500 }
      );
    }

    console.log("✅ Update berhasil:", updatedUser);

    // ✅ Kirim response sukses
    return NextResponse.json({
      status: "success",
      message: "Data user berhasil diupdate",
      user: {
        id: updatedUser.id,
        nama: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
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
