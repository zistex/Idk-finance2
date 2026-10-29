import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FundRequest } from '../../types';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '../../utils/formatters';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  FileText,
  RotateCcw,
  Paperclip,
  Check,
  ChevronRight,
} from 'lucide-react';

export const ApprovalPengajuanModule: React.FC = () => {
  const { fundRequests, adminApproveRequest, adminRejectRequest } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals
  const [selectedReq, setSelectedReq] = useState<FundRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  // Pending requests for Admin approval
  const pendingRequests = fundRequests.filter(
    (r) => r.status === 'pending_admin_approval'
  );

  // History requests
  const historyRequests = fundRequests.filter(
    (r) => r.status === 'approved' || r.status === 'rejected' || r.status === 'done'
  );

  const displayedRequests = (activeTab === 'pending' ? pendingRequests : historyRequests).filter(
    (r) => filterCategory === 'all' || r.kategori === filterCategory
  );

  const handleApprove = (req: FundRequest) => {
    if (confirm(`Setujui pengajuan dana ${req.nomorPengajuan} (${formatRupiah(req.jumlah)})?`)) {
      adminApproveRequest(req.id);
    }
  };

  const handleOpenReject = (req: FundRequest) => {
    setSelectedReq(req);
    setRejectNotes('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !rejectNotes.trim()) return;

    adminRejectRequest(selectedReq.id, rejectNotes);
    setIsRejectModalOpen(false);
    setSelectedReq(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Approval Pengajuan Dana</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Persetujuan pengajuan operasional, payroll, reimburse, pajak, pengadaan, dan invoice. Jika ditolak, sertakan catatan revisi agar Finance Manager dapat mengajukan ulang.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Perlu Approval ({pendingRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Riwayat Keputusan</span>
          </button>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-500 px-1">Kategori:</span>
        {['all', 'operasional', 'payroll', 'reimburse', 'pajak', 'pengadaan', 'invoice'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-md font-medium whitespace-nowrap capitalize transition-colors ${
              filterCategory === cat
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Pengajuan</th>
                <th className="py-3 px-4">Modul & Sumber</th>
                <th className="py-3 px-4">Pemohon / Proyek</th>
                <th className="py-3 px-4 text-right">Jumlah (Nominal)</th>
                <th className="py-3 px-4">Rekening Tujuan</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    {activeTab === 'pending'
                      ? 'Tidak ada pengajuan dana yang sedang menunggu approval Admin.'
                      : 'Belum ada riwayat pengajuan.'}
                  </td>
                </tr>
              ) : (
                displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{req.nomorPengajuan}</div>
                      <div className="text-[10px] text-slate-400">
                        {formatTanggalWaktu(req.createdAt)}
                      </div>
                      {req.alasanRevisi && (
                        <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-medium">
                          Pengajuan Ulang (Revisi)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 capitalize">
                        {req.kategori}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {req.sumber === 'pic' ? `Dari PIC (${req.picName})` : 'Internal Finance'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {req.namaPemohon || req.createdBy}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {req.namaProyek || req.periodePayroll || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(req.jumlah)}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {req.noRekTujuan ? (
                        <div>
                          <div>
                            {req.bankTujuan} - {req.noRekTujuan}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            a.n {req.atasNamaTujuan}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans text-xs">
                          {req.tujuanInvoice || 'Disbursement Multi'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {req.keterangan}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setIsDetailModalOpen(true);
                          }}
                          title="Lihat Detail & Lampiran"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {req.status === 'pending_admin_approval' ? (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              title="Setujui Pengajuan"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenReject(req)}
                              title="Tolak Pengajuan (Beri Catatan)"
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : req.status === 'done'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {req.status === 'approved'
                              ? 'Disetujui'
                              : req.status === 'done'
                              ? 'Selesai (Done)'
                              : 'Ditolak'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECT MODAL WITH MANDATORY NOTES */}
      {isRejectModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-red-950 text-sm">
                  Tolak Pengajuan: {selectedReq.nomorPengajuan}
                </h3>
                <p className="text-[11px] text-red-700">
                  Wajib menyertakan catatan penolakan agar Finance Manager tahu apa yang harus direvisi.
                </p>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500">Kebutuhan Pengajuan:</div>
                <div className="font-medium text-slate-800">{selectedReq.keterangan}</div>
                <div className="font-mono font-bold text-slate-900 mt-1">
                  {formatRupiah(selectedReq.jumlah)}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Penolakan / Alasan Revisi *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Contoh: Mohon lampirkan perbandingan minimal 2 vendor toko lain sebelum diajukan kembali..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Kirim Penolakan ke Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">
                  {selectedReq.kategori} · {selectedReq.nomorPengajuan}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Rincian Pengajuan Dana</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-[11px] text-slate-500">Nominal Diajukan</div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {formatRupiah(selectedReq.jumlah)}
                  </div>
                </div>
                <div className="font-semibold text-xs text-blue-700 capitalize">
                  {selectedReq.status.replace(/_/g, ' ')}
                </div>
              </div>

              {selectedReq.catatanPenolakan && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <div className="font-semibold mb-1">Catatan Penolakan Sebelumnya:</div>
                  <p className="italic">"{selectedReq.catatanPenolakan}"</p>
                </div>
              )}

              {selectedReq.riwayatRevisi && selectedReq.riwayatRevisi.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-semibold text-blue-900 mb-1">Riwayat Catatan Revisi:</div>
                  {selectedReq.riwayatRevisi.map((r, i) => (
                    <div key={i} className="text-[11px] text-blue-800 border-t border-blue-100 pt-1 mt-1">
                      <span className="font-mono text-[10px] text-blue-600">
                        {formatTanggalWaktu(r.tanggal)} ({r.oleh}):
                      </span>{' '}
                      {r.catatan}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400">Pemohon / PIC:</span>
                  <div className="font-medium">
                    {selectedReq.namaPemohon || selectedReq.picName || selectedReq.createdBy}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Proyek / Periode:</span>
                  <div className="font-medium">
                    {selectedReq.namaProyek || selectedReq.periodePayroll || '-'}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Keterangan:</span>
                <p className="mt-0.5 text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedReq.keterangan}
                </p>
              </div>

              {/* Lampiran */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">
                    {selectedReq.lampiranNama || 'Dokumen_Lampiran.pdf'}
                  </span>
                </div>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Unduh / Lihat Dokumen
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
