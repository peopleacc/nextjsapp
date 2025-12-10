"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";

const dataside = [
  {
    id: 1,
    href: "/dashboard/orders",
    icon: "bi bi-box-seam",
    name: "Orders",
  },
  {
    id: 2,
    href: "/dashboard/services",
    icon: "bi bi-journals",
    name: "Service",
  },
  {
    id: 3,
    href: "/dashboard/design",
    icon: "bi bi-palette",
    name: "Material",
  },
  {
    id: 4,
    href: "/dashboard/report",
    icon: "bi bi-graph-down",
    name: "Report",
  },
];

const Sidebar = ({ className = "", onNavigate }) => {
  const pathname = usePathname();

  return (
    <aside className={`w-72 min-h-screen bg-[#2D336B] text-white flex flex-col transition-all duration-300 overflow-hidden shadow-2xl ${className}`}>
      <div className="relative bg-image-css px-6 py-6 border-b border-white/20 bg-gradient-to-b from-[#2D336B] to-[#1e234d] h-44">

        {onNavigate && (
          <button
            className="lg:hidden absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={onNavigate}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        )}
      </div>

      <nav className="flex flex-col space-y-3 border-t border-white/10 pt-6">
        <h2 className="px-6 text-white/60 uppercase text-xs tracking-[0.2em]">
          Main
        </h2>

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`px-6 py-3 flex items-center gap-3 transition rounded-r-full mr-6
            ${pathname === "/dashboard"
              ? "bg-[#FFF2F2] text-[#2D336B] font-semibold shadow-md"
              : "hover:bg-white/10 hover:translate-x-1"
            }
          `}
          onClick={onNavigate}
        >
          <i className="bi bi-house-door-fill text-lg"></i>
          Dashboard
        </Link>

        {/* Master Menu */}
        <h2 className="px-6 text-white/60 uppercase text-xs tracking-[0.2em]">
          Table
        </h2>

        {dataside.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-6 py-3 flex items-center gap-3 transition rounded-r-full mr-6 text-base
                ${isActive
                  ? "bg-[#FFF2F2] text-[#2D336B] font-semibold shadow-md"
                  : "hover:bg-white/10 hover:translate-x-1"
                }
              `}
              onClick={onNavigate}
            >
              <i className={`${item.icon} text-lg`}></i>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
