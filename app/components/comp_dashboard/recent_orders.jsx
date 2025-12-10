"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RecentOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentOrders();
    }, []);

    const fetchRecentOrders = async () => {
        try {
            // Try with relations first
            let { data, error } = await supabase
                .from('t_pemesanan')
                .select(`
                    *,
                    m_customers(nama),
                    m_product_layanan(nama_layanan)
                `)
                .order('create_at', { ascending: false })
                .limit(5);

            // If relation fails, fetch without relations
            if (error) {
                console.warn('Fetching without relations:', error.message);
                const fallback = await supabase
                    .from('t_pemesanan')
                    .select('*')
                    .order('create_at', { ascending: false })
                    .limit(5);

                data = fallback.data;
                if (fallback.error) throw fallback.error;
            }

            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching recent orders:', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            'progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Progress' },
            'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        return (
            <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    <i className="bi bi-clock-history text-gray-700 mr-2"></i>
                    Recent Orders
                </h2>
                <Link
                    href="/dashboard/orders"
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
                >
                    View All
                    <i className="bi bi-arrow-right"></i>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <i className="bi bi-inbox text-4xl mb-2"></i>
                    <p>No orders yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Service</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.pesanan_id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <i className="bi bi-person-fill text-gray-600"></i>
                                            </div>
                                            <span className="font-medium text-gray-800">
                                                {order.m_customers?.nama || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">
                                        {order.m_product_layanan?.nama_layanan || 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 text-sm">
                                        {order.create_at ? new Date(order.create_at).toLocaleDateString('id-ID') : 'N/A'}
                                    </td>
                                    <td className="py-4 px-4">
                                        {getStatusBadge(order.status_pembayaran)}
                                    </td>
                                    <td className="py-4 px-4 text-right font-semibold text-gray-800">
                                        Rp {order.total_estimasi_harga?.toLocaleString('id-ID') || '0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
