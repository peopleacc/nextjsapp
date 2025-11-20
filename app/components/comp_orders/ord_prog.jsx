"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Orders_Prog() {
    const [orders, setOrders] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from("pemesanan")
                .select("*, users(*), pelacakan_progres(*)")
                .eq("status_pengerjaan", "proses") // filter status
                .order("pesanan_id", { ascending: false });
            if (error) {
                console.error("Error:", error);
                setErrorMsg(error.message);
            } else {
                console.log("Data dari Supabase:", data);
                setOrders(data || []);
            }
        };

        fetchOrders();
    }, []);

    if (errorMsg) return <div className="p-4 text-red-600">Error: {errorMsg}</div>;
    if (!orders.length) return <div className="p-4 text-gray-500">Tidak ada data pemesanan.</div>;

    return (
        <div className="p-4 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Proses Orders</h2>

            {orders.map((order) => (
                <div
                    key={order.pesanan_id}
                    className="flex justify-between items-center border border-gray-200 rounded-lg p-4 mb-3 hover:shadow transition-shadow"
                >
                    {/* Kiri */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                                {order.status_pengerjaan}
                            </span>
                            <span className="text-gray-500 text-sm">#{order.pesanan_id}</span>
                        </div>

                        <div className="text-gray-800 flex">
                            <h3 className="font-semibold">{order.users?.nama || "Tanpa Nama"} </h3> |
                             <p className="text-sm mt-1">{order.users?.no_hp || "Tanpa No HP"} </p> 
                        </div>
                        <p className="text-gray-500 text-sm">
                            {order.users?.no_hp || "Email tidak tersedia"}
                        </p>
                    </div>

                    {/* Kanan */}
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-gray-800">
                            Rp {order.total_estimasi_harga?.toLocaleString() || "0"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {new Date(order.create_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
