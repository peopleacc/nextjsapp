"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ModalEditDesign from "./modal_edit";
import ModalDeleteDesign from "./modal_delete";

export default function CardDesign() {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedEdit, setSelectedEdit] = useState(null);
    const [selectedDelete, setSelectedDelete] = useState(null);

    const fetchDesigns = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("m_bahan")
            .select("*")
            .order("create_at", { ascending: false });

        if (error) {
            console.error(error);
            setErrorMsg(error.message);
            setLoading(false);
            return;
        }

        setDesigns(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchDesigns();
    }, []);

    // 🔄 LOADING
    if (loading) {
        return (
            <div className="p-4 text-gray-500 animate-pulse">
                Loading material data...
            </div>
        );
    }

    // ❌ ERROR
    if (errorMsg) {
        return <div className="p-4 text-red-600">Error: {errorMsg}</div>;
    }

    // 📭 NO DATA
    if (!designs.length) {
        return <div className="p-4 text-gray-500">No material data.</div>;
    }

    return (
        <>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                {designs.map((design) => (
                    <div
                        key={design.bahan_id}
                        className="shadow-lg rounded-xl bg-white overflow-hidden hover:shadow-xl transition-all duration-200"
                    >
                        {/* Gambar */}
                        <img
                            src={design.image_url || "/image/Logo.jpg"}
                            alt={design.nama_bahan}
                            className="w-full h-40 object-cover"
                        />

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {design.nama_bahan}
                            </h3>

                            <p className="text-gray-600 mt-1 text-sm">
                                {design.deskripsi || "No description"}
                            </p>

                            <p className="text-pink-600 font-bold mt-2">
                                Rp {design.harga_per_unit?.toLocaleString("id-ID")}
                            </p>
                        </div>

                        {/* Kelola */}
                        <div>
                            <button
                                className="m-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={() => setSelectedEdit(design)}
                            >
                                <i className="bi bi-pencil-square"></i>
                            </button>

                            <button
                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={() => setSelectedDelete(design)}
                            >
                                <i className="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {selectedEdit && (
                <ModalEditDesign
                    key={selectedEdit.bahan_id}
                    isOpen={!!selectedEdit}
                    onClose={() => setSelectedEdit(null)}
                    design={selectedEdit}
                    onUpdated={fetchDesigns}
                />
            )}
            {selectedDelete && (
                <ModalDeleteDesign
                    key={selectedDelete.bahan_id}
                    isOpen={!!selectedDelete}
                    onClose={() => setSelectedDelete(null)}
                    design={selectedDelete}
                    onDeleted={fetchDesigns}
                />
            )}
        </>
    );
}
