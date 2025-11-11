"use client";
import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { TotalOrder,Pending,BookingComplete,Revenue } from "../components/card";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-200  ">
      {/* Sidebar */}
      {isSidebarOpen && <Sidebar />}

      {/* Konten utama */}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="p-6">
        

          {/* ========================== BAGIAN BAWAH (CARD) ========================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-4">
            <TotalOrder />
            <Pending />
            <BookingComplete />
            <Revenue />
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}


function TableHeader() {
  return (<>
    <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
      <tr>
        <th className="p-2 whitespace-nowrap">
          <div className="font-semibold text-left">Name</div>
        </th>
        <th className="p-2 whitespace-nowrap">
          <div className="font-semibold text-left">Email</div>
        </th>

        <th className="p-2 whitespace-nowrap">
          <div className="font-semibold text-center">created_at</div>
        </th>
      </tr>
    </thead>
  </>
  )
}
