"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PopularServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularServices();
    }, []);

    const fetchPopularServices = async () => {
        try {
            // Get all orders with their services
            const { data: orders, error: orderError } = await supabase
                .from('t_pemesanan')
                .select('product_id');

            if (orderError) throw orderError;

            // Count orders per service
            const serviceCounts = {};
            orders?.forEach(order => {
                if (order.product_id) {
                    serviceCounts[order.product_id] = (serviceCounts[order.product_id] || 0) + 1;
                }
            });

            // Get service details
            const { data: allServices, error: serviceError } = await supabase
                .from('m_product_layanan')
                .select('product_id, nama_layanan, harga, estimasi_waktu_dasar');

            if (serviceError) throw serviceError;

            // Combine and sort
            const servicesWithCount = allServices?.map(service => ({
                ...service,
                orderCount: serviceCounts[service.product_id] || 0
            })).sort((a, b) => b.orderCount - a.orderCount).slice(0, 5) || [];

            setServices(servicesWithCount);
        } catch (error) {
            console.error('Error fetching popular services:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
                <i className="bi bi-star-fill text-yellow-500 mr-2"></i>
                Popular Services
            </h2>

            {services.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <i className="bi bi-inbox text-4xl mb-2"></i>
                    <p>No services data yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {services.map((service, index) => (
                        <div
                            key={service.product_id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}
                                >
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{service.nama_layanan}</p>
                                    <p className="text-xs text-gray-500">
                                        Rp {service.harga?.toLocaleString('id-ID')} • {service.estimasi_waktu_dasar} days
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-gray-800">{service.orderCount}</span>
                                <span className="text-xs text-gray-500 block">orders</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
