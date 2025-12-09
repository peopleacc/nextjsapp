"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import ChatWidget from "../components/chat";
import {
  TotalOrder,
  Pending,
  BookingComplete,
  Revenue,
} from "../components/card";

export default function DashboardLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop) return;
      setIsDrawerOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => setIsDrawerOpen((prev) => !prev);

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        background:
          "linear-gradient(135deg, #FFF2F2 0%, #f7dfe0 40%, #e4e0ff 100%)",
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <>
          <Sidebar
            className="fixed inset-y-0 left-0 z-50"
            onNavigate={handleToggleSidebar}
          />
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={handleToggleSidebar}
          ></div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <TotalOrder />
            <Pending />
            <BookingComplete />
            <Revenue />
          </div>

          {children}
        </main>
      </div>

      {/* Chat Widget - Absolute Position */}
      <ChatWidget />
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
