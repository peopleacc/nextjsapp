"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OrderStatusBreakdown() {
    const [statusData, setStatusData] = useState({
        pending: 0,
        waiting: 0,
        proses: 0,
        selesai: 0,
        cancel: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatusBreakdown();
    }, []);

    const fetchStatusBreakdown = async () => {
        try {
            const { data, error } = await supabase
                .from('t_pemesanan')
                .select('status_pengerjaan');

            if (error) throw error;

            const breakdown = {
                pending: 0,
                waiting: 0,
                proses: 0,
                selesai: 0,
                cancel: 0
            };

            data?.forEach(order => {
                const status = order.status_pengerjaan?.toLowerCase();
                if (status === 'pending') breakdown.pending++;
                else if (status === 'waiting') breakdown.waiting++;
                else if (status === 'proses' || status === 'progress') breakdown.proses++;
                else if (status === 'selesai' || status === 'completed') breakdown.selesai++;
                else if (status === 'cancel' || status === 'cancelled') breakdown.cancel++;
            });

            setStatusData(breakdown);
        } catch (error) {
            console.error('Error fetching status breakdown:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusItems = [
        { label: 'Pending', value: statusData.pending, color: 'bg-yellow-500' },
        { label: 'Waiting', value: statusData.waiting, color: 'bg-orange-500' },
        { label: 'Progress', value: statusData.proses, color: 'bg-blue-500' },
        { label: 'Completed', value: statusData.selesai, color: 'bg-green-500' },
        { label: 'Cancelled', value: statusData.cancel, color: 'bg-red-500' }
    ];

    const total = Object.values(statusData).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                <i className="bi bi-pie-chart-fill text-gray-700 mr-2"></i>
                Order Status Breakdown
            </h2>

            <div className="space-y-4">
                {statusItems.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total * 100).toFixed(1) : 0;
                    return (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                <span className="text-sm font-bold text-gray-800">{item.value} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Orders</span>
                    <span className="text-lg font-bold text-gray-800">{total}</span>
                </div>
            </div>
        </div>
    );
}
