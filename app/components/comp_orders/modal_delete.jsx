"use client";

import Modal from "react-modal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

Modal.setAppElement("body");

export default function ModalDelete({ isOpen, onClose, order, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");
    setLoading(false);

    // auto-select order owner if present so deletion is straightforward when opened
    const ownerId =
      order?.user_id ||
      order?.t_pemesanan?.user_id ||
      order?.t_pemesanan?.m_customers?.user_id ||
      order?.m_customers?.user_id ||
      null;

    setSelectedUserId(ownerId ? String(ownerId) : "");
  }, [isOpen]);

  // No customer list is needed — we automatically use the order owner

  if (!order) return null;

  // helper to extract pesanan_id and customer id from different order shapes
  const getPesananId = () => {
    return order.pesanan_id || order.t_pemesanan?.pesanan_id || order.id_pesanan || null;
  };

  const getOrderUserId = () => {
    // try several possible fields
    return (
      order.user_id ||
      order.t_pemesanan?.user_id ||
      order.t_pemesanan?.m_customers?.user_id ||
      order.m_customers?.user_id ||
      order.m_customers?.user_id ||
      null
    );
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const pid = getPesananId();
      if (!pid) throw new Error("Tidak ada pesanan_id yang ditemukan pada object order");

      // require selected user to match the order owner to prevent accidental deletion
      const orderOwnerId = getOrderUserId();
      if (orderOwnerId && String(orderOwnerId) !== String(selectedUserId)) {
        setErrorMsg("Selected user tidak cocok dengan pemilik pesanan — tidak diizinkan menghapus");
        setLoading(false);
        return;
      }

      // 1) delete related progress rows in d_progres (match pesanan_id or id_pesanan)
      try {
        await supabase.from("d_progres").delete().or(`pesanan_id.eq.${pid},id_pesanan.eq.${pid}`);
      } catch (e) {
        console.warn("Failed to delete d_progres rows:", e);
      }

      // 2) delete the pemesanan row
      const { error } = await supabase.from("t_pemesanan").delete().eq("pesanan_id", pid);
      if (error) throw error;

      alert(`Pesanan #${pid} berhasil dihapus.`);
      onClose();
      if (onDeleted) onDeleted(pid);
    } catch (err) {
      console.error("delete error:", err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
    >
      <h2 className="text-xl font-semibold mb-3">Hapus Pesanan #{getPesananId()}</h2>

      <div className="space-y-3 text-sm">
        <p>
          <b>Nama Pelanggan:</b> {order.m_customers?.nama || order.t_pemesanan?.m_customers?.nama || "-"}
        </p>

        <p>
          <b>Catatan:</b> {order.keterangan || order.t_pemesanan?.keterangan || "-"}
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User (pemilik pesanan)</label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700">
            {order.m_customers?.nama || order.t_pemesanan?.m_customers?.nama || "(Tidak ada user terkait)"}
            {" "}
            <span className="text-xs text-gray-400">{order.m_customers?.email || order.t_pemesanan?.m_customers?.email || ""}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Untuk safety, penghapusan hanya akan dijalankan untuk pesanan yang cocok dengan pemilik yang ditampilkan.</p>
        </div>

        {errorMsg && <p className="text-red-600">Error: {errorMsg}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md"
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md"
          onClick={handleDelete}
          disabled={loading || (!!getOrderUserId() && String(getOrderUserId()) !== String(selectedUserId))}
        >
          {loading ? "Menghapus..." : "Hapus Pesanan"}
        </button>
      </div>
    </Modal>
  );
}
