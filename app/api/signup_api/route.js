import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    // 🔹 Baca body JSON dari Android
    const body = await req.json();
    console.log("📩 Raw body dari Android:", body);

    const { email, password, name, phone } = body;

    console.log("📨 Data diterima dari Android:");
    console.log("   Email:", email);
    console.log("   Password:", password);
    console.log("   Name:", name);
    console.log("   Phone:", phone);

    // 🔹 Validasi input
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { status: "error", message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // 🔹 Ambil ID terakhir dari tabel User
    const { data: angka, error: errorSelect } = await supabase
      .from("users")
      .select("user_id")
      .order("user_id", { ascending: false })
      .limit(1);

    if (errorSelect) {
      console.error("❌ Error ambil id terakhir:", errorSelect);
      return NextResponse.json({ status: "error", message: "Gagal ambil data ID terakhir" });
    }

    const lastId = angka && angka.length > 0 ? angka[0].id : 0;
    const p_id = parseInt(lastId) + 1;

    // 🔹 Simpan data ke Supabase
    const { data: users, error } = await supabase
      .from("users")
      .insert([{  email: email, password_hash: password, nama: name, no_hp: phone }]);

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ status: "error", message: "Gagal menyimpan user" });
    }

    console.log("✅ SignUp berhasil:", email);

    // ✅ Kirim response sukses
    return NextResponse.json({
      status: "success",
      message: "User berhasil disimpan",
      data: users,
    });
  } catch (err) {
    console.error("💥 API Error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
