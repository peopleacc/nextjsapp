"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";


const dataside = [
  {
    id: 1, 
    href: "/dashboard/orders",
    icon : "bi bi-box-seam",
    name : "Orders"
  },
  {
    id:2,
    href: "/dashboard/services",
    icon: "bi bi-journals",
    name: "service"
  },
  {
    id:3,
    href:"/dashboard/report",
    icon:"bi bi-graph-down",
    name: "Report"
  }
]

const Sidebar = () => {
  const pathname = usePathname();

  return (
    // ⬇️ "hidden lg:flex" artinya sembunyikan di layar kecil, tampilkan di layar besar
    <aside className="hidden lg:flex w-64 h-screen bg-[#001f3f] text-white flex-col transition-all duration-300 overflow-hidden">
      <div className="bg-image-css px-6 py-6 border-b h-44 border-gray-700">
        <h2 className="text-lg text-black font-semibold text-center mb-2"></h2>
      </div>

      <nav className="flex flex-col space-y-3 border-t border-gray-600 pt-4">
        <h2 className="px-2 py-2 text-gray-400 uppercase text-sm">Utama</h2>
        <Link
          href="/dashboard"
          className={`px-4 py-2 transition flex items-center gap-2 ${
            pathname === "/dashboard"
              ? "rounded-l-md ml-2 bg-white text-black font-semibold"
              : ""
          }`}
        >
          <i className="bi bi-house-door-fill"></i> Dashboard
        </Link>

        <h2 className="px-2 py-2 text-gray-400 uppercase text-sm">Tabel Master</h2>
        {dataside.map((u) => ( 
        <Link
          key={u.id}
          href={u.href}
          className={`px-4 py-2 transition flex items-center gap-2 ${
            pathname === "/dashboard/pegawai"
              ? "bg-gray-100 text-black font-semibold"
              : ""
          }`}
        >
          <i className={u.icon}></i> {u.name}
        </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
