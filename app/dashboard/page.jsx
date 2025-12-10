"use client";

import RecentOrders from "../components/comp_dashboard/recent_orders";
import RevenueSummary from "../components/comp_dashboard/revenue_summary";
import OrderStatusBreakdown from "../components/comp_dashboard/order_status_breakdown";
import CustomerStats from "../components/comp_dashboard/customer_stats";
import PopularServices from "../components/comp_dashboard/popular_services";
import TechnicianOverview from "../components/comp_dashboard/technician_overview";
import MaterialSummary from "../components/comp_dashboard/material_summary";

export default function DashboardPage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 14rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">Monitor your business performance</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 80px)' }}>
        <div className="space-y-6">
          {/* Revenue & Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueSummary />
            <OrderStatusBreakdown />
          </div>

          {/* Customer & Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerStats />
            <PopularServices />
          </div>

          {/* Technician & Material */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TechnicianOverview />
            <MaterialSummary />
          </div>

          {/* Recent Orders */}
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
