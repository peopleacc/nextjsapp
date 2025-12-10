"use client";

import OrdPen from "@/app/components/comp_orders/ord_pen";
import OrdProg from "@/app/components/comp_orders/ord_prog";

export default function OrdersPage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 14rem)' }}>
      {/* Content Area */}
      <div className="flex flex-row h-full overflow-hidden">
        {/* Left Column - Incoming Orders */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Header Sticky */}
          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
              <i className="bi bi-inbox-fill text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Incoming Orders</h2>
              <p className="text-xs text-gray-500">Orders waiting to be processed</p>
            </div>
          </div>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <OrdPen />
          </div>
        </div>

        {/* Right Column - Orders in Progress */}
        <div className="w-1/2 flex flex-col">
          {/* Header Sticky */}
          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <i className="bi bi-gear-fill text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Orders in Progress</h2>
              <p className="text-xs text-gray-500">Orders currently being processed</p>
            </div>
          </div>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <OrdProg />
          </div>
        </div>
      </div>
    </div>
  );
}