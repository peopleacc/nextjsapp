"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Modalprog from "./modal_prog";
import ModalPen from "./modal_pen";
import ModalCancel from "./modal_cancel";
import Modal_confr from "./modal_confr";

export default function OrdProg() {
    const [orders, setOrders] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [modalOpen, setModalOpen] = useState(null);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from("d_progres")
            .select(`
                *,
                t_pemesanan(
                    *,
                    m_customers(*),
                    m_product_layanan(*),
                    m_teknisi(*)
                )
            `)
            .in("t_pemesanan.status_pengerjaan", ["proses", "Menunggu Pembayaran"])
            .order("presentase_progress", { ascending: false });

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        // Ambil progress tertinggi per pesanan
        const highest = Object.values(
            data.reduce((acc, row) => {
                const id = row.pesanan_id;
                if (!acc[id] || acc[id].presentase_progress < row.presentase_progress) {
                    acc[id] = row;
                }
                return acc;
            }, {})
        );

        setOrders(highest);
    };

    useEffect(() => {
        fetchOrders();

        // Auto-refresh setiap 3 detik untuk menampilkan pesanan dari modal_pen
        const interval = setInterval(() => {
            fetchOrders();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    if (errorMsg)
        return <div className="p-4 text-red-600">Error: {errorMsg}</div>;

    if (!orders.length)
        return <div className="p-4 text-gray-500">No order data.</div>;

    return (
        <div className="p-4 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Processing Orders</h2>

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
                    {/* KIRI */}
                    <div className="w-3/4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-sm font-medium rounded-full">
                                {order.t_pemesanan?.status_pengerjaan}
                            </span>

                            <span className="text-gray-500 text-sm">
                                #{order.t_pemesanan?.pesanan_id}
                            </span>
                        </div>

                        <div className="text-gray-800 flex gap-2">
                            <h3 className="font-semibold">
                                {order.t_pemesanan?.m_customers?.nama || "No Name"}
                            </h3>
                            |
                            <p className="text-sm mt-1">
                                {order.t_pemesanan?.m_customers?.no_hp || "-"}
                            </p>
                        </div>

                        <h2 className="text-lg font-bold text-gray-800">
                            Rp {order.t_pemesanan?.total_estimasi_harga?.toLocaleString() || "0"}
                        </h2>

                        <p className="text-gray-500 text-sm">
                            {new Date(order.t_pemesanan?.create_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>

                        {/* PROGRESS BAR */}
                        <div className="w-full bg-gray-200 rounded-full h-2 my-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${order.presentase_progress || 0}%` }}
                            ></div>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                            Progress: {order.presentase_progress || 0}%
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                            Status: {order.keterangan_status || "No progress yet"}
                        </p>
                    </div>

                    {/* KANAN — tombol disesuaikan status */}
                    <div className="text-right">
                        <button
                            className="m-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => setModalOpen(order)}
                        >
                            <i className="bi bi-pencil-square"></i>
                        </button>
                    </div>
                </div>
            ))}

            {/* MODAL */}
            {modalOpen && modalOpen.t_pemesanan?.status_pengerjaan === "proses" && (
                <Modalprog
                    isOpen={true}
                    onClose={() => setModalOpen(null)}
                    order={modalOpen}
                    onUpdated={fetchOrders}
                />
            )}

            {modalOpen && modalOpen.t_pemesanan?.status_pengerjaan === "Menunggu Pembayaran" && (
                <Modal_confr
                    isOpen={true}
                    onClose={() => setModalOpen(null)}
                    order={modalOpen.t_pemesanan}
                    onUpdated={fetchOrders}
                />
            )}

            {modalOpen && !["proses", "Menunggu Pembayaran"].includes(
                modalOpen.t_pemesanan?.status_pengerjaan
            ) && (
                    <ModalCancel
                        isOpen={true}
                        onClose={() => setModalOpen(null)}
                        order={modalOpen.t_pemesanan}
                    />
                )}

        </div>
    );
}
