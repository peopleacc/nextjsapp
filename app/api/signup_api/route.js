import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    // 🔹 Baca isi body dari Android
    const body = await req.text();
    console.log("📩 Raw body dari Android:", body);

    const params = new URLSearchParams(body);
    const email = params.get("email");
    const password = params.get("password");
    const Name = params.get("Name")

    console.log("📨 Data diterima dari Android:");
    console.log("   Email:", email);
    console.log("   Password:", password);
    console.log("   Name:", Name);

    // 🔹 Validasi input
    if (!email || !password || !Name) {
      return NextResponse.json(
        { status: "error", message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 🔹 Ambil ID terakhir dari tabel User (jika perlu manual)
    const { data: angka, error: errorSelect } = await supabase
      .from("users")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (errorSelect) {
      console.error("❌ Error ambil id terakhir:", errorSelect);
      return NextResponse.json({ status: "error", message: "Gagal ambil data ID terakhir" });
    }

    const lastId = angka && angka.length > 0 ? angka[0].id : 0;
    const p_id = parseInt(lastId) + 1;

    // 🔹 Simpan data baru ke tabel Supabase
    const { data: users, error } = await supabase
      .from("User")
      .insert([{ id: p_id, email: email, password: password, name: Name }]); // jika id auto increment, hapus id

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

export async function GET() {
  console.log("📡 Endpoint /api/login diakses melalui GET");
  return NextResponse.json({ message: "Login API aktif ✅" });
}
