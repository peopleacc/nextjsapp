'use client';

import Modal from 'react-modal';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

Modal.setAppElement('body');

export default function Modal_confr({ isOpen, onClose, order, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setLoading(false);
      setMetodePembayaran('');
    }
  }, [isOpen]);

  if (!order) return null;

  const confirmPayment = async () => {
    // Validasi metode pembayaran
    if (!metodePembayaran) {
      setErrorMsg('Harap pilih metode pembayaran terlebih dahulu!');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Prefer updating an explicit payment status field if present on the object,
      // otherwise fall back to marking the order's pengerjaan status as finished.
      const updates = {
        metode_pembayaran: metodePembayaran,
        tanggal_pembayaran: new Date().toISOString(),
        nominal_pembayaran: order.total_estimasi_harga ?? order.total_harga ?? 0
      };

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
      if (!updates.status_pembayaran && !updates.status_pengerjaan) {
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

      alert(`Pembayaran pesanan #${order.pesanan_id} berhasil dikonfirmasi via ${metodePembayaran.toUpperCase()}.`);
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
      className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full mx-auto outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <h2 className="text-xl font-semibold mb-4">
        <i className="bi bi-credit-card-fill text-blue-500 mr-2"></i>
        Payment Confirmation #{order.pesanan_id}
      </h2>

      <div className="space-y-4">
        {/* Order Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
          <p><b className="text-gray-600">Customer:</b> <span className="text-gray-800">{order.m_customers?.nama || order.nama || '-'}</span></p>
          <p><b className="text-gray-600">Total Amount:</b> <span className="text-blue-600 font-bold text-lg">Rp {formattedPrice()}</span></p>
          {order.keterangan && (
            <p><b className="text-gray-600">Notes:</b> <span className="text-gray-800">{order.keterangan}</span></p>
          )}
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Method <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* QRIS Option */}
            <button
              type="button"
              onClick={() => setMetodePembayaran('qris')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                ${metodePembayaran === 'qris'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                ${metodePembayaran === 'qris' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <i className={`bi bi-qr-code-scan text-xl ${metodePembayaran === 'qris' ? 'text-white' : 'text-gray-600'}`}></i>
              </div>
              <span className={`font-semibold ${metodePembayaran === 'qris' ? 'text-blue-700' : 'text-gray-700'}`}>
                QRIS
              </span>
              <span className="text-xs text-gray-500">Scan QR Code</span>
            </button>

            {/* Cash Option */}
            <button
              type="button"
              onClick={() => setMetodePembayaran('cash')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                ${metodePembayaran === 'cash'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                ${metodePembayaran === 'cash' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <i className={`bi bi-cash-stack text-xl ${metodePembayaran === 'cash' ? 'text-white' : 'text-gray-600'}`}></i>
              </div>
              <span className={`font-semibold ${metodePembayaran === 'cash' ? 'text-blue-700' : 'text-gray-700'}`}>
                Cash
              </span>
              <span className="text-xs text-gray-500">Pay with Cash</span>
            </button>
          </div>

          {/* QRIS QR Code Display */}
          {metodePembayaran === 'qris' && (
            <div className="mt-4 p-4 bg-white border-2 border-blue-200 rounded-xl">
              <div className="flex flex-col items-center">
                <img
                  src="/image/qris.jpg"
                  alt="QRIS QR Code"
                  className="w-48 h-48 object-contain rounded-lg border border-gray-200"
                />
                <p className="mt-3 text-sm text-gray-600 text-center">
                  Scan QR code above using your mobile banking or e-wallet app
                </p>
              </div>
            </div>
          )}
        </div>

        {errorMsg && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">⚠️ {errorMsg}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          className={`px-4 py-2 text-white rounded-lg transition flex items-center gap-2
            ${metodePembayaran
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              : 'bg-gray-400 cursor-not-allowed'
            }`}
          onClick={confirmPayment}
          disabled={loading || !metodePembayaran}
        >
          {loading ? (
            <>
              <i className="bi bi-arrow-repeat animate-spin"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle"></i>
              Confirm Payment
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}