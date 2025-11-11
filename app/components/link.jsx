"use client";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css"; // untuk ikon

// Data menu navigasi
const data = [
    {
        id: 1,
        link: "/dashboard",
        icon: "bi bi-house",
    },
    {
        id: 2,
        link: "/customer",
        icon: "bi bi-person-arms-up",
    },
    {
        id: 3,
        link: "/laporan",
        icon: "bi bi-file-earmark-text",
    },
    {
        id: 4,
        link: "/report",
        icon: "bi bi-graph-down"
    }
];

// Komponen menu link
const LinkMenu = () => {
    return (
        <div className="flex items-center gap-2 ">
            {data.map((u) => (
                <Link
                    key={u.id}
                    href={u.link}
                    className="flex items-center gap-2 p-2 bg-[#001f3f] hover:bg-blue-700 text-white rounded-md"
                >
                    <i className={`${u.icon} text-xl`}></i>
                </Link>
            ))}
        </div>
    );
};

export default LinkMenu;
