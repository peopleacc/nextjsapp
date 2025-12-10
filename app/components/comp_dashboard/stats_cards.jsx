"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StatsCards() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pending: 0,
        completed: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Get all orders with status and revenue
            const { data: orders, error } = await supabase
                .from('t_pemesanan')
                .select('status_pengerjaan, status_pembayaran, total_estimasi_harga');

            if (error) throw error;

            let totalOrders = orders?.length || 0;
            let pending = 0;
            let proses = 0;
            let selesai = 0;
            let revenue = 0;

            orders?.forEach(order => {
                const statusPengerjaan = order.status_pengerjaan?.toLowerCase();
                const amount = order.total_estimasi_harga || 0;

                // Count based on status_pengerjaan
                if (statusPengerjaan === 'pending' || statusPengerjaan === 'waiting') {
                    pending++;
                } else if (statusPengerjaan === 'proses' || statusPengerjaan === 'progress') {
                    proses++;
                } else if (statusPengerjaan === 'selesai' || statusPengerjaan === 'completed') {
                    selesai++;
                    revenue += amount; // Revenue from completed orders
                }
            });

            setStats({
                totalOrders,
                pending,
                completed: selesai,
                revenue
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        {
            title: "Total Order",
            value: stats.totalOrders,
            icon: "bi-box-seam-fill",
            iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
            cardBg: "bg-white",
            borderColor: "border-blue-200",
            textColor: "text-blue-900",
            subtextColor: "text-blue-600"
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: "bi-clock-fill",
            iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
            cardBg: "bg-white",
            borderColor: "border-amber-200",
            textColor: "text-amber-900",
            subtextColor: "text-amber-600"
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: "bi-check-circle-fill",
            iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600",
            cardBg: "bg-white",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-900",
            subtextColor: "text-emerald-600"
        },
        {
            title: "Revenue",
            value: `Rp ${stats.revenue.toLocaleString('id-ID')}`,
            icon: "bi-wallet2",
            iconBg: "bg-gradient-to-br from-purple-500 to-violet-700",
            cardBg: "bg-white",
            borderColor: "border-purple-200",
            textColor: "text-purple-900",
            subtextColor: "text-purple-600",
            isRevenue: true
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-md border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-12"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.cardBg} rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border ${card.borderColor} hover:-translate-y-0.5`}
                >
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`${card.iconBg} w-12 h-12 rounded-lg shadow-md flex items-center justify-center flex-shrink-0`}>
                            <i className={`${card.icon} text-white text-xl`}></i>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p className={`${card.subtextColor} text-xs font-semibold uppercase tracking-wide`}>
                                {card.title}
                            </p>
                            <p className={`${card.textColor} font-bold ${card.isRevenue ? 'text-lg' : 'text-2xl'}`}>
                                {card.value}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
