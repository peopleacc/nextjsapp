"use client";

import Modal from "react-modal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateWorkOrderPDF } from "@/lib/generateWorkOrder";

Modal.setAppElement("body");

export default function Modalcancel({ isOpen, onClose, order, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [Teknisi, setTeknisi] = useState("");
  const [listTeknisi, setListTeknisi] = useState([]);

  // use helper generateWorkOrderPDF from lib

  useEffect(() => {
    if (isOpen) {
      fetchTeknisi();
    } else {
      setErrorMsg("");
      setLoading(false);
    }
  }, [isOpen]);

  // ⬇️ Ambil teknisi yang belum punya pesanan
  const fetchTeknisi = async () => {
    // Use a left join to bring any related t_pemesanan rows, then filter out
    // teknisi who already have an active assignment on the client side.
    const { data, error } = await supabase
      .from("m_teknisi")
      .select(`
        *,
        t_pemesanan!left(pesanan_id,teknisi_id,status_pengerjaan)
      `);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setListTeknisi([]);
      return;
    }

    // data may contain t_pemesanan as array (left join). Filter out technicians
    // that already have any pesanan with a non-null teknisi_id (i.e. assigned).
    const available = (data || []).filter((t) => {
      const tp = t.t_pemesanan;
      if (!tp) return true;
      // if tp is array and empty => available
      if (Array.isArray(tp) && tp.length === 0) return true;
      // if any joined pemesanan has teknisi_id set and status not canceled/completed,
      // treat teknisi as busy. We'll consider any non-null teknisi_id as busy here.
      if (Array.isArray(tp)) {
        return !tp.some((p) => p.teknisi_id !== null && p.teknisi_id !== undefined);
      }
      // if tp is object (single), check field
      return !(tp && (tp.teknisi_id !== null && tp.teknisi_id !== undefined));
    });

    setListTeknisi(available || []);
  };


  if (!order) return null;

  // ⬇️ Tombol PROSES
  const ProsesPesanan = async () => {
    // Validasi: Pastikan teknisi sudah dipilih
    if (!Teknisi || Teknisi === "") {
      setErrorMsg("Harap pilih teknisi terlebih dahulu!");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(""); // Clear previous error

      const { error } = await supabase
        .from("t_pemesanan")
        .update({
          status_pengerjaan: "proses",
          teknisi_id: parseInt(Teknisi), // Convert to integer
        })
        .eq("pesanan_id", order.pesanan_id);

      if (error) throw error;

      // insert initial progress (presentase_progress = 0)
      try {
        const { error: insErr } = await supabase.from("d_progres").insert({
          pesanan_id: order.pesanan_id,
          presentase_progress: 0,
          keterangan_status: "Order started",
        });
        if (insErr) {
          // fallback to alternative column names used elsewhere in the codebase
          const { error: insErr2 } = await supabase.from("d_progres").insert({
            id_pesanan: order.pesanan_id,
            progres: 0,
          });
          if (insErr2) console.warn("Insert d_progres fallback failed:", insErr2);
        }
      } catch (e) {
        console.warn("Error inserting initial progress:", e);
      }

      // generate work order PDF and try to upload / download
      try {
        await generateWorkOrderPDF(order);
      } catch (e) {
        console.warn('generateWorkOrderPDF error:', e);
      }

      alert(`Pesanan #${order.pesanan_id} berhasil diproses.`);
      onClose();
      if (onUpdated) onUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Tombol WAITING
  const TungguPesanan = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("t_pemesanan")
        .update({ status_pengerjaan: "waiting" })
        .eq("pesanan_id", order.pesanan_id);

      if (error) throw error;

      // insert progress pertama
      await supabase.from("d_progres").insert({
        id_pesanan: order.pesanan_id,
        progres: 0,
      });

      alert(`Pesanan #${order.pesanan_id} diubah ke waiting.`);
      onClose();
      if (onUpdated) onUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full mx-auto outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <h2 className="text-xl font-semibold mb-4">
        <i className="bi bi-inbox-fill text-blue-500 mr-2"></i>
        Order Details #{order.pesanan_id}
      </h2>

      <div className="space-y-4">
        {/* Order Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
          <p><b className="text-gray-600">Customer:</b> <span className="text-gray-800">{order.m_customers?.nama || "-"}</span></p>
          <p><b className="text-gray-600">Service:</b> <span className="text-gray-800">{order.m_product_layanan?.nama_layanan || "-"}</span></p>
          <p><b className="text-gray-600">Description:</b> <span className="text-gray-800">{order.m_product_layanan?.deskripsi || "-"}</span></p>
          <p><b className="text-gray-600">Material:</b> <span className="text-gray-800">{order.m_bahan?.nama_bahan || "-"}</span></p>
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">⚠️ {errorMsg}</p>
        )}

        {/* Technician Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Technician <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
            value={Teknisi}
            onChange={(e) => setTeknisi(e.target.value)}
          >
            <option value="" disabled className="text-gray-400">
              -- Select Technician --
            </option>
            {listTeknisi.map((t) => (
              <option key={t.teknisi_id} value={t.teknisi_id}>
                {t.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          onClick={TungguPesanan}
          disabled={loading}
        >
          {loading ? "Processing..." : "Set to Waiting"}
        </button>

        <button
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition"
          onClick={ProsesPesanan}
          disabled={loading}
        >
          {loading ? "Processing..." : "Start Processing"}
        </button>
      </div>
    </Modal>
  );
}
