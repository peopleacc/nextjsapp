"use client";

import Modal from "react-modal";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

Modal.setAppElement("body");

export default function ModalDeleteDesign({ isOpen, onClose, design, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleDelete = async () => {
        try {
            setLoading(true);
            setErrorMsg("");

            const { error } = await supabase
                .from("m_bahan")
                .delete()
                .eq("bahan_id", design.bahan_id);

            if (error) throw error;

            alert(`Material "${design.nama_bahan}" deleted successfully!`);
            onClose();
            if (onDeleted) onDeleted();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!design) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-auto mt-20 outline-none"
            overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
        >
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <i className="bi bi-trash3 text-red-500 text-3xl"></i>
                </div>

                <h2 className="text-xl font-semibold mb-2">Delete Material</h2>

                <p className="text-gray-600 mb-4">
                    Are you sure you want to delete the material <strong>"{design.nama_bahan}"</strong>?
                </p>

                <p className="text-sm text-gray-500 mb-4">
                    This action cannot be undone.
                </p>

                {errorMsg && (
                    <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg mb-4">⚠️ {errorMsg}</p>
                )}

                <div className="flex justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
