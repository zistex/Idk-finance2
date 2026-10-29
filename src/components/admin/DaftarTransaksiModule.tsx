import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

export const DaftarTransaksiModule: React.FC = () => {
  const { transactions, projects } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter
  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.kategoriTransaksi !== filterType) return false;
    if (filterProject !== 'all' && t.namaProyek !== filterProject) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchJudul = t.judul.toLowerCase().includes(q);
      const matchProyek = t.namaProyek.toLowerCase().includes(q);
      const matchNomor = t.id.toLowerCase().includes(q);
      return matchJudul || matchProyek || matchNomor;
    }
    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

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
          <h2 className="text-lg font-bold text-slate-900">Daftar Transaksi Perusahaan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua transaksi masuk dan keluar yang tercatat dalam sistem internal PT. Inovasi Digital Kreasi.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Terdata: <strong className="font-mono text-slate-900">{filtered.length}</strong> Transaksi
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Arus:</span>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">Semua Kategori</option>
              <option value="uang_masuk">Uang Masuk</option>
              <option value="uang_keluar">Uang Keluar</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Proyek:</span>
            <select
              value={filterProject}
              onChange={(e) => {
                setFilterProject(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">Semua Proyek</option>
              {projects.map((p) => (
                <option key={p.id} value={p.nama}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari transaksi / proyek..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transaksi Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Proyek</th>
                <th className="py-3 px-4">Judul Transaksi</th>
                <th className="py-3 px-4">Kategori Transaksi</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedData.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {formatTanggal(trx.tanggal)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">{trx.namaProyek}</td>

                    <td className="py-3 px-4 text-slate-700 max-w-sm truncate">{trx.judul}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trx.kategoriTransaksi === 'uang_masuk'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {trx.kategoriTransaksi === 'uang_masuk' ? 'Uang Masuk' : 'Uang Keluar'}
                      </span>
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        trx.kategoriTransaksi === 'uang_masuk' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {trx.kategoriTransaksi === 'uang_masuk' ? '+' : '-'} {formatRupiah(trx.nominal)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          trx.status === 'done'
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {trx.status === 'done' ? 'Selesai (Done)' : 'Pending Transfer'}
                      </span>
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
              {filtered.length > 0 ? startIndex + 1 : 0}
            </strong>{' '}
            sampai{' '}
            <strong className="font-mono text-slate-800">
              {Math.min(startIndex + pageSize, filtered.length)}
            </strong>{' '}
            dari <strong className="font-mono text-slate-800">{filtered.length}</strong> transaksi
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
