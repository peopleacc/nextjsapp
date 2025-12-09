import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase.from("api_fasum").select("*");

    if (error) {
      console.error("Supabase error (api_fasum):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize / shape data if you want, otherwise return raw rows
    // Map the DB row to the shape you provided in your example
    const payload = (data || []).map((row) => ({
      id: row.id ?? row.pesanan_id ?? null,
      name: row.name ?? row.nama ?? null,
      phone: row.phone ?? row.no_hp ?? row.telepon ?? null,
      address: {
        street: row.address ?? row.alamat ?? row.street ?? null,
        city: row.city ?? row.kota ?? null,
        geo: {
          lat: row.lat ?? row.latitude ?? null,
          lng: row.lng ?? row.longitude ?? null,
        },
      },
    }));

    // Return a plain array (no wrapper key) as requested
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Unexpected error in /api/fasum:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

