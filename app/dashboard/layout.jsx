"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import ChatWidget from "../components/chat";
import StatsCards from "../components/comp_dashboard/stats_cards";

export default function DashboardLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
  const handleToggleDesktopSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        background:
          "linear-gradient(135deg, #FFF2F2 0%, #f7dfe0 40%, #e4e0ff 100%)",
      }}
    >
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-0 overflow-hidden' : ''}`}>
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
        <Header
          onToggleSidebar={handleToggleSidebar}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto px-6 pt-0 pb-6 lg:px-10 space-y-4">
          {/* Stats Cards - displayed on all pages */}
          <StatsCards />

          {/* Page Content */}
          {children}
        </main>
      </div>

      {/* Chat Widget - Absolute Position */}
      <ChatWidget />
    </div>
  );
}
