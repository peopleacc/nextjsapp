import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
// 🔹 POST - Update personal information berdasarkan TOKEN
export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const body = await req.json();
    console.log("📩 Raw body dari Android:", body);

    const { nama, email, phone, address, foto_profile } = body;

    console.log("📨 Data diterima dari Android:");
    console.log("   Token (query):", token);
    console.log("   Token (body):", body.token);
    console.log("   Nama:", nama);
    console.log("   Email:", email);
    console.log("   Phone:", phone);
    console.log("   Address:", address);
    console.log("   foto_profile:", foto_profile);

    if (!token && !body.token) {
      return NextResponse.json(
        { status: "error", message: "Token tidak ditemukan", user: null },
        { status: 401 }
      );
    }

    const authToken = token || body.token;

    if (!email || !nama || !phone) {
      return NextResponse.json(
        { status: "error", message: "Nama, email, dan phone wajib diisi", user: null },
        { status: 400 }
      );
    }

    const { data: existingUser, error: verifyError } = await supabase
      .from("m_customers")
      .select("user_id, email")
      .eq("email", email)
      .single();

    if (verifyError || !existingUser) {
      console.error("❌ Token invalid:", verifyError);
      return NextResponse.json(
        { status: "error", message: "Token tidak valid", user: null },
        { status: 401 }
      );
    }

    // ✅ FIX: Build update object, hanya include foto_profile jika ada
    const updateData = {
      nama: nama,
      no_hp: phone,
      address: address || null,
    };

    // ✅ Hanya update foto_profile jika dikirim dari Android
    if (foto_profile !== undefined && foto_profile !== null) {
      updateData.foto_profile = foto_profile;
    }

    console.log("📝 Update data:", updateData);

    const { data: updatedUser, error } = await supabase
      .from("m_customers")
      .update(updateData)
      .eq("email", email)
      .select("user_id, nama, email, no_hp, address, foto_profile")
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { status: "error", message: "Gagal update data user", user: null },
        { status: 500 }
      );
    }

    console.log("✅ Update berhasil:", updatedUser);

    // ✅ Return foto_profile juga di response
    return NextResponse.json({
      status: "success",
      message: "Data user berhasil diupdate",
      user: {
        id: updatedUser.user_id,
        nama: updatedUser.nama,
        email: updatedUser.email,
        phone: updatedUser.no_hp,
        address: updatedUser.address || null,
        foto_profile: updatedUser.foto_profile || null,
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