"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TechnicianOverview() {
    const [techData, setTechData] = useState({
        total: 0,
        activeOrders: 0,
        technicians: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTechnicianData();
    }, []);

    const fetchTechnicianData = async () => {
        try {
            // Get all technicians
            const { data: technicians, error: techError } = await supabase
                .from('m_teknisi')
                .select('teknisi_id, nama, role');

            if (techError) throw techError;

            // Get active orders per technician (proses, waiting, pending)
            const { data: orders, error: orderError } = await supabase
                .from('t_pemesanan')
                .select('teknisi_id, status_pengerjaan')
                .in('status_pengerjaan', ['pending', 'waiting', 'proses', 'progress']);

            if (orderError) throw orderError;

            // Count orders per technician
            const techOrders = {};
            orders?.forEach(order => {
                if (order.teknisi_id) {
                    techOrders[order.teknisi_id] = (techOrders[order.teknisi_id] || 0) + 1;
                }
            });

            // Combine data
            const techWithWorkload = technicians?.map(tech => ({
                ...tech,
                activeOrders: techOrders[tech.teknisi_id] || 0
            })).sort((a, b) => b.activeOrders - a.activeOrders) || [];

            setTechData({
                total: technicians?.length || 0,
                activeOrders: orders?.length || 0,
                technicians: techWithWorkload.slice(0, 4)
            });
        } catch (error) {
            console.error('Error fetching technician data:', error);
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
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                <i className="bi bi-person-workspace text-indigo-600 mr-2"></i>
                Technician Overview
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                    <p className="text-2xl font-bold text-indigo-800">{techData.total}</p>
                    <p className="text-xs text-indigo-600">Total Technicians</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                    <p className="text-2xl font-bold text-orange-800">{techData.activeOrders}</p>
                    <p className="text-xs text-orange-600">Active Orders</p>
                </div>
            </div>

            {/* Top Technicians */}
            {techData.technicians.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Workload</h3>
                    <div className="space-y-2">
                        {techData.technicians.map((tech) => (
                            <div
                                key={tech.teknisi_id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <i className="bi bi-person-fill text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{tech.nama}</p>
                                        <p className="text-xs text-gray-500">{tech.role || 'Technician'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                                        ${tech.activeOrders > 3 ? 'bg-red-100 text-red-800' :
                                            tech.activeOrders > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'}`}
                                    >
                                        {tech.activeOrders} orders
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
