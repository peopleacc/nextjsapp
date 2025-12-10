"use client";

import { useState } from "react";
import Card_serv from "../../components/comp_service/card_serv";
import Modal_tambah from "../../components/comp_service/modal_tambah";

export default function ServicesPage() {
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 14rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Service List</h2>
          <p className="text-sm text-gray-600">Manage available services</p>
        </div>
        <button
          onClick={() => setIsTambahOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
        >
          <i className="bi bi-plus-lg"></i>
          Add Service
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 80px)' }}>
        <Card_serv key={refreshKey} />
      </div>

      {/* Modal Tambah */}
      <Modal_tambah
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onUpdated={handleRefresh}
      />
    </div>
  );
}
