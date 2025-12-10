"use client";

import Modal from "react-modal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

Modal.setAppElement("body");

export default function Modalprog({ isOpen, onClose, order, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setErrorMsg("");
            setLoading(false);
        }
    }, [isOpen]);

    if (!order) return null;
    const SelesaiPesanan = async () => {
        try {
            setLoading(true);
            setErrorMsg("");

            // 1️⃣ Update status pesanan
            const { error: updateError } = await supabase
                .from("t_pemesanan")
                .update({ status_pengerjaan: "Menunggu Pembayaran" })
                .eq("pesanan_id", order.t_pemesanan?.pesanan_id);

            if (updateError) throw updateError;

            // 2️⃣ Hapus semua progress berdasarkan pesanan_id

            alert(`Pesanan #${order.t_pemesanan?.pesanan_id} berhasil diubah!`);
            onClose();
            if (onUpdated) onUpdated();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const ProgresLanjut = async () => {
        try {
            setLoading(true);
            setErrorMsg("");

            const current = order.presentase_progress ?? 0;
            let next = 0;
            let ket = "";

            if (current === 0) {
                next = 20;
                ket = "Order confirmed";
            } else if (current === 20) {
                next = 40;
                ket = "Material preparation";
            } else if (current === 40) {
                next = 60;
                ket = "Installation in progress";
            } else if (current === 60) {
                next = 80;
                ket = "Quality check";
            } else if (current === 80) {
                next = 100;
                ket = "Ready for pick up";
            } else {
                alert("Progress sudah mencapai 100%");
                return;
            }

            // jika progress belum ada → buat baru
            if (!order.d_progres) {
                const { error } = await supabase
                    .from("d_progres")
                    .insert({
                        pesanan_id: order.t_pemesanan?.pesanan_id,
                        presentase_progress: next,
                        keterangan_status: ket
                    });

                if (error) throw error;
            } else {
                // jika sudah ada → update
                const { error } = await supabase
                    .from("d_progres")
                    .update({
                        presentase_progress: next,
                        keterangan_status: ket
                    })
                    .eq("pesanan_id", order.t_pemesanan?.pesanan_id);

                if (error) throw error;
            }

            alert(`Progress berhasil ditingkatkan menjadi ${next}%`);
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
                <i className="bi bi-gear-fill text-blue-500 mr-2"></i>
                Order Progress #{order.t_pemesanan?.pesanan_id}
            </h2>

            <div className="space-y-4">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
                    <p><b className="text-gray-600">Customer:</b> <span className="text-gray-800">{order.t_pemesanan?.m_customers?.nama || "-"}</span></p>
                    <p><b className="text-gray-600">Technician:</b> <span className="text-gray-800">{order.t_pemesanan?.m_teknisi?.nama || "-"}</span></p>
                    <p><b className="text-gray-600">Service:</b> <span className="text-gray-800">{order.t_pemesanan?.m_product_layanan?.nama_layanan || "-"}</span></p>
                </div>

                {errorMsg && (
                    <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">⚠️ {errorMsg}</p>
                )}

                {/* Progress bar */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Progress</label>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${order.presentase_progress || 0}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                        Progress: <span className="text-blue-600">{order.presentase_progress || 0}%</span>
                    </p>
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
                    onClick={ProgresLanjut}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Continue Progress"}
                </button>

                <button
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition"
                    onClick={SelesaiPesanan}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Complete Order"}
                </button>
            </div>
        </Modal>
    );
}
