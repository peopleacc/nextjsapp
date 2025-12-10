"use client";

import Modal from "react-modal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Modal_tambah({ isOpen, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [nama, setNama] = useState("");
    const [harga, setHarga] = useState("");
    const [deskripsi, setDeskripsi] = useState("");


    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setErrorMsg("");
            setLoading(false);
            setPreview(null);
            setFile(null);
        }
    }, [isOpen]);

    // ========================
    // DRAG & DROP HANDLING
    // ========================
    const handleDrop = (e) => {
        e.preventDefault();
        const img = e.dataTransfer.files[0];
        setFile(img);
        setPreview(URL.createObjectURL(img));
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleFilePick = (e) => {
        const img = e.target.files[0];
        setFile(img);
        setPreview(URL.createObjectURL(img));
    };

    // ========================
    // SUBMIT FORM
    // ========================
    const handleInsert = async () => {
        try {
            setLoading(true);

            if (!file) return alert("Silakan pilih gambar dulu!");

            const bucket = "gambar"; // pastikan bucket ini ADA di Supabase

            const fileName = `layanan_${Date.now()}_${file.name}`;

            // UPLOAD
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) return alert("Gagal upload gambar");

            // GET PUBLIC URL
            const { data: publicUrl } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            const imageUrl = publicUrl.publicUrl;
            // Insert ke tabel
            const { error: insertError } = await supabase
                .from("m_product_layanan")
                .insert([
                    {
                        nama_layanan: nama,
                        deskripsi: deskripsi,
                        harga: harga,
                        gambar_url: imageUrl,
                    },
                ]);

            if (insertError) return alert(`Gagal insert: ${insertError.message}`);

            alert("Data berhasil ditambahkan!");
            if (onUpdated) onUpdated();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="bg-white p-6 rounded-xl max-w-md mx-auto mt-20 shadow-xl"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40"
        >
            <h2 className="text-xl font-bold mb-4">Tambah Layanan</h2>

            {/* DRAG & DROP AREA */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto h-40 object-contain rounded-lg"
                    />
                ) : (
                    <p className="text-gray-600">
                        Tarik gambar ke sini atau klik untuk memilih
                    </p>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFilePick}
                    className="hidden"
                    id="hiddenFileInput"
                />
                <label
                    htmlFor="hiddenFileInput"
                    className="block mt-2 text-sm text-blue-600 cursor-pointer"
                >
                    Pilih file
                </label>
            </div>

            {/* INPUT FORM */}
            <div className="mt-5 space-y-3">
                <input
                    type="text"
                    placeholder="Nama Layanan"
                    className="border w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                />

                <textarea
                    placeholder="Deskripsi"
                    className="border w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                />


                <input
                    type="number"
                    placeholder="Harga"
                    className="border w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                />
            </div>

            {/* SUBMIT BUTTON */}
            <button
                onClick={handleInsert}
                disabled={loading}
                className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
                {loading ? "Menyimpan..." : "Simpan"}
            </button>
        </Modal>
    );
}
