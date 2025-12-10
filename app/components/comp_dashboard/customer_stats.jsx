"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerStats() {
    const [stats, setStats] = useState({
        total: 0,
        newThisMonth: 0,
        topPreference: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerStats();
    }, []);

    const fetchCustomerStats = async () => {
        try {
            // Get all customers
            const { data: customers, error } = await supabase
                .from('m_customers')
                .select('user_id, preferensi_layanan, create_at');

            if (error) throw error;

            const total = customers?.length || 0;

            // Count new customers this month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const newThisMonth = customers?.filter(c => {
                const createDate = new Date(c.create_at);
                return createDate >= startOfMonth;
            }).length || 0;

            // Find top preference
            const preferences = {};
            customers?.forEach(c => {
                if (c.preferensi_layanan) {
                    preferences[c.preferensi_layanan] = (preferences[c.preferensi_layanan] || 0) + 1;
                }
            });

            let topPreference = null;
            let maxCount = 0;
            Object.entries(preferences).forEach(([pref, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    topPreference = pref;
                }
            });

            setStats({ total, newThisMonth, topPreference });
        } catch (error) {
            console.error('Error fetching customer stats:', error);
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
                <i className="bi bi-people-fill text-blue-600 mr-2"></i>
                Customer Statistics
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <i className="bi bi-people text-white text-lg"></i>
                        </div>
                        <span className="text-sm font-medium text-blue-700">Total Customers</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-800">{stats.total}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                            <i className="bi bi-person-plus text-white text-lg"></i>
                        </div>
                        <span className="text-sm font-medium text-green-700">New This Month</span>
                    </div>
                    <span className="text-2xl font-bold text-green-800">{stats.newThisMonth}</span>
                </div>

                {stats.topPreference && (
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                <i className="bi bi-star text-white text-lg"></i>
                            </div>
                            <span className="text-sm font-medium text-purple-700">Top Preference</span>
                        </div>
                        <span className="text-sm font-bold text-purple-800 max-w-[120px] truncate">
                            {stats.topPreference}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
