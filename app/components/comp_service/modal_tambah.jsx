"use client";

import Modal from "react-modal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

Modal.setAppElement("body");

export default function Modal_tambah({ isOpen, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        nama_layanan: "",
        deskripsi: "",
        harga: ""
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setErrorMsg("");
            setLoading(false);
            setPreview(null);
            setFile(null);
            setFormData({
                nama_layanan: "",
                deskripsi: "",
                harga: ""
            });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Drag & Drop handlers
    const handleDrop = (e) => {
        e.preventDefault();
        const img = e.dataTransfer.files[0];
        if (img) {
            setFile(img);
            setPreview(URL.createObjectURL(img));
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleFilePick = (e) => {
        const img = e.target.files[0];
        if (img) {
            setFile(img);
            setPreview(URL.createObjectURL(img));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nama_layanan) {
            setErrorMsg("Service name is required!");
            return;
        }

        if (!formData.harga) {
            setErrorMsg("Price is required!");
            return;
        }

        try {
            setLoading(true);
            setErrorMsg("");

            let imageUrl = null;

            if (file) {
                const bucket = "gambar";
                const fileName = `layanan_${Date.now()}_${file.name}`;

                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file);

                if (uploadError) {
                    setErrorMsg("Failed to upload image: " + uploadError.message);
                    setLoading(false);
                    return;
                }

                const { data: publicUrl } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(fileName);

                imageUrl = publicUrl.publicUrl;
            }

            const { error: insertError } = await supabase
                .from("m_product_layanan")
                .insert([
                    {
                        nama_layanan: formData.nama_layanan,
                        deskripsi: formData.deskripsi || null,
                        harga: parseFloat(formData.harga),
                        gambar_url: imageUrl,
                    },
                ]);

            if (insertError) {
                setErrorMsg(`Failed to insert: ${insertError.message}`);
                setLoading(false);
                return;
            }

            alert("Data successfully added!");
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full mx-auto outline-none"
            overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <h2 className="text-xl font-semibold mb-4">
                <i className="bi bi-plus-circle text-blue-500 mr-2"></i>
                Add New Service
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Drag & Drop Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mx-auto h-32 object-contain rounded-lg"
                            />
                        ) : (
                            <div className="text-gray-500">
                                <i className="bi bi-cloud-arrow-up text-4xl mb-2"></i>
                                <p>Drag image here or click to select</p>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFilePick}
                            className="hidden"
                            id="addServiceFileInput"
                        />
                        <label
                            htmlFor="addServiceFileInput"
                            className="block mt-2 text-sm text-blue-600 cursor-pointer hover:underline"
                        >
                            Choose file
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nama_layanan"
                        value={formData.nama_layanan}
                        onChange={handleChange}
                        placeholder="e.g. Banner Printing"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleChange}
                        placeholder="Service description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="harga"
                        value={formData.harga}
                        onChange={handleChange}
                        placeholder="50000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {errorMsg && (
                    <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">⚠️ {errorMsg}</p>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
