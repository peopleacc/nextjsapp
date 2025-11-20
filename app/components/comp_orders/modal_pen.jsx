"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase (ganti URL & KEY dengan milikmu)


export default function Modal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fungsi untuk update status di Supabase
  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { error } = await supabase
        .from("pemesanan")
        .update({ status_pengerjaan: "proses" })
        .eq("pesanan_id", order.pesanan_id);

      if (error) throw error;

      alert(`Pesanan #${order.pesanan_id} berhasil diperbarui ke "proses"!`);
      onClose(); // Tutup modal
    } catch (err) {
      console.error("Gagal update:", err.message);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">
          Detail Pesanan #{order.pesanan_id}
        </h2>

        <p>
          <span className="font-semibold">Nama:</span>{" "}
          {order.users?.nama || "-"}
        </p>

        {errorMsg && (
          <p className="text-red-600 mt-2 text-sm">Error: {errorMsg}</p>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Tutup
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className={`${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-4 py-2 rounded-md`}
          >
            {loading ? "Memproses..." : "Ubah ke Proses"}
          </button>
        </div>
      </div>
    </div>
  );
}
