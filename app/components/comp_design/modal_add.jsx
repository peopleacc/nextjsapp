"use client";

import Modal from "react-modal";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

Modal.setAppElement("body");

export default function ModalAddDesign({ isOpen, onClose, onAdded }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [formData, setFormData] = useState({
        nama_bahan: "",
        deskripsi: "",
        harga_per_unit: ""
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

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

        if (!formData.nama_bahan) {
            setErrorMsg("Material name is required!");
            return;
        }

        if (!formData.harga_per_unit) {
            setErrorMsg("Price is required!");
            return;
        }

        try {
            setLoading(true);
            setErrorMsg("");

            let imageUrl = null;

            // Upload image if selected
            if (file) {
                const bucket = "gambar";
                const fileName = `bahan_${Date.now()}_${file.name}`;

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

            const { error } = await supabase
                .from("m_bahan")
                .insert({
                    nama_bahan: formData.nama_bahan,
                    deskripsi: formData.deskripsi,
                    harga_per_unit: parseFloat(formData.harga_per_unit),
                    image_url: imageUrl
                });

            if (error) throw error;

            alert("Material added successfully!");
            setFormData({ nama_bahan: "", deskripsi: "", harga_per_unit: "" });
            setFile(null);
            setPreview(null);
            onClose();
            if (onAdded) onAdded();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full mx-auto outline-none"
            overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <h2 className="text-xl font-semibold mb-4">
                <i className="bi bi-plus-circle text-blue-500 mr-2"></i>
                Add New Material
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
                            id="addDesignFileInput"
                        />
                        <label
                            htmlFor="addDesignFileInput"
                            className="block mt-2 text-sm text-blue-600 cursor-pointer hover:underline"
                        >
                            Choose file
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nama_bahan"
                        value={formData.nama_bahan}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Art Paper"
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
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Material description..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Unit <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="harga_per_unit"
                        value={formData.harga_per_unit}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="50000"
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
