"use client";

import { supabase } from "@/lib/supabaseClient"
 const { data: users, error } = await supabase.from("pemesanan").select("*,users(*)")

  console.log("Data dari Supabase:", users)
  console.log("Error:", error)

  if (error) return <div>Error: {error.message}</div>
  if (!users?.length) return <div>Tidak ada data user.</div>



export default function OrderRecent() {
    return(
        <>
        <div className="p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>

        <div className="flex justify-between items-center border border-gray-200 rounded-lg p-4 hover:shadow transition-shadow">
          {/* Bagian kiri */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                Order
              </span>
              <span className="text-gray-500 text-sm">#INsss-2025</span>
            </div>

            <h3 className="text-gray-800 font-semibold">Join Premium</h3>
            <p className="text-gray-500 text-sm">Membership upgrade</p>
          </div>

          {/* Bagian kanan */}
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-800">Rp 3.000</h2>
            <p className="text-gray-500 text-sm">Nov 8, 2025</p>
          </div>
        </div>
      </div>
        </>
    )
}

