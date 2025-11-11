"use client";
import React, { useState } from "react";
import { BellFill, ChevronDown } from "react-bootstrap-icons";
import LinkMenu from "./link";

export default function Header({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-gray-100 text-black m-4 py-4 shadow-lg rounded-xl">
      {/* ========================== BAGIAN ATAS HEADER ========================== */}
      <div className="flex items-center justify-between px-6">
        {/* Kiri: Tombol + Judul */}
        <div className="flex items-center space-x-4">
          {/* Tombol Toggle Sidebar → hanya tampil di DESKTOP */}
          <button
            onClick={onToggleSidebar}
            className="bg-[#001f3f] hover:bg-blue-800 p-2 rounded-md focus:outline-none hidden lg:block"
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

          {/* Judul Halaman */}
          <h1 className="text-xl font-semibold  hidden lg:block">Dashboard</h1>
        </div>

        {/* Link Header → hanya tampil di HP / tablet */}
        <div className="flex lg:hidden">
          <LinkMenu />
        </div>

        {/* Kanan: Menu User */}
        <div className="relative flex items-center bg-[#001f3f] text-white rounded-xl px-4 py-2 mr-2">
          <button className="text-white mr-3 pr-3 border-r border-white">
            <BellFill size={18} />
          </button>

          <button
            onClick={toggleDropdown}
            className="flex items-center text-white focus:outline-none"
          >
            <span className="text-md font-semibold mr-2">USER</span>
            <img
              src="/asset/R.png"
              className="w-8 h-8 rounded-full mr-1"
              alt="User"
            />
            <ChevronDown size={16} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-40 bg-white border rounded-md shadow-lg z-10">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Setting
              </a>
              <a
                href="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
