"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ModalHapus from "./modal_hapus";
import ModalEdit from "./modal_edit";

export default function Card_serv() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCancel, setSelectedCancel] = useState(null);

  // 🔥 FETCH DATA
  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("m_product_layanan")
      .select("*");

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="p-4 text-gray-500 animate-pulse">
        Loading service data...
      </div>
    );
  }

  // ❌ ERROR
  if (errorMsg) {
    return <div className="p-4 text-red-600">Error: {errorMsg}</div>;
  }

  // 📭 NO DATA
  if (!orders.length) {
    return <div className="p-4 text-gray-500">No service data.</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
        {orders.map((order) => (
          <div
            key={order.product_id}
            className="shadow-lg rounded-xl bg-white overflow-hidden hover:shadow-xl transition-all duration-200"
          >
            {/* Gambar */}
            <img
              src={order.gambar_url || "/image/Logo.jpg"}
              alt={order.nama_bahan}
              className="w-full h-40 object-cover"
            />

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {order.nama_layanan || order.nama_bahan}
              </h3>

              <p className="text-gray-600 mt-1 text-sm">
                {order.deskripsi || "No description"}
              </p>

              <p className="text-indigo-600 font-bold mt-2">
                Rp {order.harga?.toLocaleString("id-ID")}
              </p>
            </div>

            {/* {kelola } */}

            <div>
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
      </div>

      {/* Modals */}
      {selectedOrder && (
        <ModalEdit
          key={selectedOrder.product_id}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onUpdated={fetchOrders}
        />
      )}
      {selectedCancel && (
        <ModalHapus
          key={selectedCancel.product_id}
          isOpen={!!selectedCancel}
          onClose={() => setSelectedCancel(null)}
          order={selectedCancel}
          onUpdated={fetchOrders}
        />
      )}
    </>
  );
}
