'use client';

import Modal from 'react-modal';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

Modal.setAppElement('body');

export default function Modal_confr({ isOpen, onClose, order, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!order) return null;

  const confirmPayment = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Prefer updating an explicit payment status field if present on the object,
      // otherwise fall back to marking the order's pengerjaan status as finished.
      const updates = {};
      if (Object.prototype.hasOwnProperty.call(order, 'status_pembayaran')) {
        updates.status_pembayaran = 'selesai';
      }

      // Also mark pengerjaan as selesai if available/desired
      if (Object.prototype.hasOwnProperty.call(order, 'status_pengerjaan')) {
        updates.status_pengerjaan = 'selesai';
      }

      // remove assigned technician (clear both possible column names)
      // so after payment the order is no longer assigned
      updates.teknisi_id = null;

      // If no known fields found, still attempt to set status_pengerjaan
      if (!Object.keys(updates).length) {
        updates.status_pengerjaan = 'selesai';
      }

      const { error } = await supabase
        .from('t_pemesanan')
        .update(updates)
        .eq('pesanan_id', order.pesanan_id);

      if (error) throw error;

      // Hapus progress terkait di tabel d_progres untuk pesanan ini.
      // Coba hapus berdasarkan pesanan_id terlebih dahulu
      try {
        const id = order.pesanan_id;
        
        // Attempt 1: delete by pesanan_id
        const { data: delData, error: delErr1 } = await supabase
          .from('d_progres')
          .delete()
          .eq('pesanan_id', id)
          .select();

        if (delErr1) {
          console.warn('Delete by pesanan_id failed:', delErr1);
        }

        // Attempt 2: if first attempt had no effect or failed, try id_pesanan
        if (delErr1 || !delData?.length) {
          const { error: delErr2 } = await supabase
            .from('d_progres')
            .delete()
            .eq('id_pesanan', id);

          if (delErr2) {
            console.warn('Delete by id_pesanan failed:', delErr2);
          }
        }
      } catch (e) {
        console.warn('Error saat menghapus d_progres:', e);
      }

      alert(`Pembayaran pesanan #${order.pesanan_id} ditandai selesai.`);
      onClose();
      if (onUpdated) onUpdated();
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = () => {
    const v = order.total_estimasi_harga ?? order.total_harga ?? 0;
    try {
      return Number(v).toLocaleString('id-ID');
    } catch (_) {
      return String(v);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
    >
      <h2 className="text-xl font-semibold mb-3">Konfirmasi Pembayaran #{order.pesanan_id}</h2>

      <div className="space-y-3 text-sm">
        <p>
          <b>Nama:</b> {order.m_customers?.nama || order.nama || '-'}
        </p>

        <p>
          <b>Total Harga:</b> Rp {formattedPrice()}
        </p>

        {order.keterangan && (
          <p>
            <b>Catatan:</b> {order.keterangan}
          </p>
        )}

        {errorMsg && <p className="text-red-600">Error: {errorMsg}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md"
          onClick={onClose}
          disabled={loading}
        >
          Tutup
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md"
          onClick={confirmPayment}
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>
      </div>
    </Modal>
  );
}