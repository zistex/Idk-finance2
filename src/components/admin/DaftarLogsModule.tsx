import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTanggalWaktu } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, History, Search, Shield, Wallet, Cpu } from 'lucide-react';

export const DaftarLogsModule: React.FC = () => {
  const { logs } = useApp();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const filteredLogs = logs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetail = log.detail.toLowerCase().includes(q);
      const matchUser = log.user.toLowerCase().includes(q);
      return matchAction || matchDetail || matchUser;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daftar Audit Logs Sistem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail semua aktivitas operasional dan tindakan yang dilakukan pengguna maupun sistem internal PT. Inovasi Digital Kreasi.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari logs / user / action..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Waktu (Timestamp)</th>
                <th className="py-3 px-4">Pengguna & Peran</th>
                <th className="py-3 px-4">Aksi (Action Code)</th>
                <th className="py-3 px-4">Rincian Perubahan & Detail</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada catatan log sistem yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatTanggalWaktu(log.timestamp)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.user}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        {log.role === 'admin' ? (
                          <span className="text-blue-600 flex items-center gap-0.5">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : log.role === 'finance_manager' ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <Wallet className="w-3 h-3" /> Finance
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <Cpu className="w-3 h-3" /> System
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 max-w-md">{log.detail}</td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan baris{' '}
            <strong className="font-mono text-slate-800">
              {filteredLogs.length > 0 ? startIndex + 1 : 0}
            </strong>{' '}
            sampai{' '}
            <strong className="font-mono text-slate-800">
              {Math.min(startIndex + pageSize, filteredLogs.length)}
            </strong>{' '}
            dari <strong className="font-mono text-slate-800">{filteredLogs.length}</strong> log
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
