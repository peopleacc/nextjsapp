"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ModalPen from "./modal_pen";
import ModalDelete from "./modal_delete";

export default function OrdPen() {
  const [orders, setOrders] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCancel, setSelectedCancel] = useState(null);

  // 🔥 FETCH DATA PEMESANAN
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("t_pemesanan")
      .select(`
        *,
        m_customers(*),
        d_progres(*),
        m_product_layanan(*),
        m_bahan(*)
      `)
      .or("status_pengerjaan.eq.pending,status_pengerjaan.eq.waiting")
      .order("pesanan_id", { ascending: false });

    if (error) {
      console.error("Error:", error);
      setErrorMsg(error.message);
    } else {
      setOrders(data || []);
    }
  };

  // 🔥 LOAD DATA SAAT AWAL
  useEffect(() => {
    fetchOrders();
  }, []);

  if (errorMsg) {
    return <div className="p-4 text-red-600">Error: {errorMsg}</div>;
  }

  if (!orders.length) {
    return <div className="p-4 text-gray-500">Tidak ada data pemesanan.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Orders
        </h2>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
        >
          <i className="bi bi-arrow-clockwise text-lg"></i>
          Refresh
        </button>
      </div>


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
              <h3 className="font-semibold">{order.m_customers?.nama || "Tanpa Nama"}</h3> |
              <p className="text-xs mt-1"> + {order.m_customers?.no_hp || "Tanpa No HP"} </p>
            </div>

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

          {/* Kanan */}
          <div className="text-right">
            <button
              className="m-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setSelectedOrder(order)}
            >
              <i className="bi bi-pencil-square"></i>
            </button>

            <button
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={() => setSelectedCancel(order)}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      ))}

      {/* Modal Proses */}
      <ModalPen
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdated={fetchOrders}   // 🔥 Refresh otomatis setelah update
      />

      {/* Modal Cancel */}
      <ModalDelete
        isOpen={!!selectedCancel}
        onClose={() => setSelectedCancel(null)}
        order={selectedCancel}
        onDeleted={() => fetchOrders()}   // refresh after deletion
      />
    </div>
  );
}
