"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RevenueSummary() {
    const [revenue, setRevenue] = useState({
        total: 0,
        pendingCount: 0,
        completedCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRevenue();
    }, []);

    const fetchRevenue = async () => {
        try {
            const { data, error } = await supabase
                .from('t_pemesanan')
                .select('total_estimasi_harga, status_pengerjaan, status_pembayaran');

            if (error) throw error;

            let total = 0;
            let pendingCount = 0;
            let completedCount = 0;

            data?.forEach(order => {
                const amount = order.total_estimasi_harga || 0;
                const statusPengerjaan = order.status_pengerjaan?.toLowerCase();

                total += amount;

                if (statusPengerjaan === 'selesai' || statusPengerjaan === 'completed') {
                    completedCount++;
                } else if (statusPengerjaan === 'pending' || statusPengerjaan === 'waiting' || statusPengerjaan === 'proses') {
                    pendingCount++;
                }
            });

            setRevenue({ total, pendingCount, completedCount });
        } catch (error) {
            console.error('Error fetching revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                <i className="bi bi-cash-stack text-gray-700 mr-2"></i>
                Revenue Summary
            </h2>

            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">
                        Rp {revenue.total.toLocaleString('id-ID')}
                    </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Completed Orders</p>
                    <p className="text-xl font-bold text-green-800">
                        {revenue.completedCount} orders
                    </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Pending Orders</p>
                    <p className="text-xl font-bold text-yellow-800">
                        {revenue.pendingCount} orders
                    </p>
                </div>
            </div>
        </div>
    );
}
