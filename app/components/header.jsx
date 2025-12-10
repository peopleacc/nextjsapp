"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { BellFill, ChevronDown } from "react-bootstrap-icons";
import LinkMenu from "./link";

export default function Header({ onToggleSidebar, onToggleDesktopSidebar, isSidebarCollapsed }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Dynamic page title based on route
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/dashboard/orders': 'Orders',
    '/dashboard/services': 'Services',
    '/dashboard/design': 'Material',
    '/dashboard/report': 'Report',
  };

  const getPageTitle = () => {
    return pageTitles[pathname] || 'Dashboard';
  };

  return (
    <header className="m-4 rounded-3xl shadow-xl bg-gradient-to-r from-[#2D336B] to-[#4f5aa6] text-white px-6 py-5 border border-white/10">
      {/* Header Top Section */}
      <div className="flex items-center justify-between px-6">
        {/* Left: Toggle Button + Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Toggle Sidebar Button */}
          <button
            onClick={onToggleSidebar}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-xl focus:outline-none lg:hidden transition"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Desktop Toggle Sidebar Button (Hamburger) */}
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex bg-white/20 hover:bg-white/30 p-2 rounded-xl focus:outline-none transition"
            aria-label="Toggle desktop sidebar"
          >
            <svg
              className={`w-6 h-6 text-white transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              {isSidebarCollapsed ? (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              ) : (
                <>
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </>
              )}
            </svg>
          </button>

          {/* Page Title - Dynamic */}
          <h1 className="text-2xl font-semibold tracking-wide hidden lg:block">
            {getPageTitle()}
          </h1>
        </div>

        {/* Link Header - Mobile/Tablet only */}
        <div className="flex lg:hidden">
          <LinkMenu />
        </div>

        {/* Right: User Menu */}
        <div className="relative flex items-center bg-white/15 backdrop-blur-lg rounded-2xl px-4 py-2 mr-2 border border-white/20">
          <button className="text-white mr-3 pr-3 border-r border-white/30">
            <BellFill size={18} />
          </button>

          <button
            onClick={toggleDropdown}
            className="flex items-center text-white focus:outline-none"
          >
            <span className="text-md font-semibold mr-2">USER</span>
            <img
              src="/image/logo.jpg"
              className="w-8 h-8 rounded-full mr-1"
              alt="User"
            />
            <ChevronDown size={16} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <a
                href="/login"
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
