"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MaterialSummary() {
    const [materialData, setMaterialData] = useState({
        total: 0,
        materials: [],
        priceRange: { min: 0, max: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterialData();
    }, []);

    const fetchMaterialData = async () => {
        try {
            // Get all materials
            const { data: materials, error: materialError } = await supabase
                .from('m_bahan')
                .select('bahan_id, nama_bahan, harga_per_unit, deskripsi');

            if (materialError) throw materialError;

            // Get usage count from orders
            const { data: orders, error: orderError } = await supabase
                .from('t_pemesanan')
                .select('bahan_id');

            if (orderError) throw orderError;

            // Count usage per material
            const usageCounts = {};
            orders?.forEach(order => {
                if (order.bahan_id) {
                    usageCounts[order.bahan_id] = (usageCounts[order.bahan_id] || 0) + 1;
                }
            });

            // Combine and sort by usage
            const materialsWithUsage = materials?.map(mat => ({
                ...mat,
                usageCount: usageCounts[mat.bahan_id] || 0
            })).sort((a, b) => b.usageCount - a.usageCount) || [];

            // Calculate price range
            const prices = materials?.map(m => m.harga_per_unit || 0).filter(p => p > 0) || [];
            const priceRange = {
                min: prices.length > 0 ? Math.min(...prices) : 0,
                max: prices.length > 0 ? Math.max(...prices) : 0
            };

            setMaterialData({
                total: materials?.length || 0,
                materials: materialsWithUsage.slice(0, 5),
                priceRange
            });
        } catch (error) {
            console.error('Error fetching material data:', error);
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
                <i className="bi bi-palette-fill text-pink-600 mr-2"></i>
                Material Summary
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 text-center">
                    <p className="text-2xl font-bold text-pink-800">{materialData.total}</p>
                    <p className="text-xs text-pink-600">Total Materials</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 text-center">
                    <p className="text-sm font-bold text-teal-800">
                        Rp {materialData.priceRange.min.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-teal-600">- Rp {materialData.priceRange.max.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Most Used Materials */}
            {materialData.materials.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Most Used</h3>
                    <div className="space-y-2">
                        {materialData.materials.map((mat, index) => (
                            <div
                                key={mat.bahan_id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm
                                        ${index === 0 ? 'bg-pink-500' : 'bg-gray-400'}`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{mat.nama_bahan}</p>
                                        <p className="text-xs text-gray-500">
                                            Rp {mat.harga_per_unit?.toLocaleString('id-ID')}/unit
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                                    {mat.usageCount}x used
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {materialData.materials.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                    <i className="bi bi-inbox text-3xl mb-2"></i>
                    <p className="text-sm">No materials data yet</p>
                </div>
            )}
        </div>
    );
}
