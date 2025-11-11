"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * Komponen umum untuk menampilkan total statistik
 */
function StatCard({ icon, title, table = "users", bgColor = "bg-blue-400" }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTotal = async () => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error(`❌ Error mengambil data ${title}:`, error.message);
        return;
      }

      setTotal(count ?? 0);
    };

    fetchTotal();
  }, [table]);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md 
                    transition-transform transform hover:scale-[1.02]
                    sm:p-5 md:p-6 w-full max-w-[250px] sm:max-w-[300px] mx-auto">
      <div className={`text-white ${bgColor} p-3 sm:p-4 rounded-full flex items-center justify-center`}>
        <i className={`bi ${icon} text-xl sm:text-2xl md:text-3xl`}></i>
      </div>
      <div className="text-right ml-3">
        <h2 className="text-sm sm:text-base font-semibold text-gray-700">{title}</h2>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{total}</p>
      </div>
    </div>
  );
}

/**
 * Komponen spesifik untuk tiap kategori
 */
export function TotalOrder() {
  return <StatCard icon="bi-box-seam" title="Total Order" table="orders" />;
}

export function Pending() {
  return <StatCard icon="bi-clock" title="Pending" bgColor="bg-yellow-400" />;
}

export function BookingComplete() {
  return <StatCard icon="bi-check" title="Completed" bgColor="bg-green-400" />;
}

export function Revenue() {
  return <StatCard icon="bi-currency-dollar" title="Revenue" bgColor="bg-purple-400" />;
}
