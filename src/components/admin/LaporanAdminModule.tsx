import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import {
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  Scale,
  Printer,
  Calendar,
} from 'lucide-react';

export const LaporanAdminModule: React.FC = () => {
  const { transactions, incomeRecords } = useApp();

  const [activeTab, setActiveTab] = useState<'uang_masuk' | 'uang_keluar' | 'laba_rugi'>('uang_masuk');
  const [filterProject, setFilterProject] = useState('all');

  // Transactions categorized
  const masukList = transactions.filter(
    (t) => t.kategoriTransaksi === 'uang_masuk' && (filterProject === 'all' || t.namaProyek === filterProject)
  );
  const keluarList = transactions.filter(
    (t) => t.kategoriTransaksi === 'uang_keluar' && (filterProject === 'all' || t.namaProyek === filterProject)
  );

  const totalMasuk = masukList.reduce((s, t) => s + (Number(t.nominal) || 0), 0);
  const totalKeluar = keluarList.reduce((s, t) => s + (Number(t.nominal) || 0), 0);
  const netLabaRugi = totalMasuk - totalKeluar;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Laporan Keuangan Eksekutif (Admin)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring penerimaan uang masuk, pengeluaran uang keluar, dan kalkulasi laba rugi standar PT. Inovasi Digital Kreasi.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('uang_masuk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'uang_masuk'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Uang Masuk
          </button>
          <button
            onClick={() => setActiveTab('uang_keluar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'uang_keluar'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Uang Keluar
          </button>
          <button
            onClick={() => setActiveTab('laba_rugi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'laba_rugi'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laba Rugi
          </button>

          <button
            onClick={handlePrint}
            title="Cetak Laporan"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200 ml-1"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Akumulasi Uang Masuk</div>
          <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
            {formatRupiah(totalMasuk)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Akumulasi Uang Keluar</div>
          <div className="text-xl font-mono font-bold text-red-700 mt-1">
            {formatRupiah(totalKeluar)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Laba / (Rugi) Bersih</div>
          <div
            className={`text-xl font-mono font-bold mt-1 ${
              netLabaRugi >= 0 ? 'text-blue-700' : 'text-red-700'
            }`}
          >
            {formatRupiah(netLabaRugi)}
          </div>
        </div>
      </div>

      {/* 1. LAPORAN UANG MASUK (tanggal, nama proyek, Judul, nominal) */}
      {activeTab === 'uang_masuk' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-950">
              Daftar Uang Masuk Tercatat ({masukList.length} Transaksi)
            </span>
            <span className="font-mono font-bold text-emerald-800">
              Total: {formatRupiah(totalMasuk)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Proyek</th>
                  <th className="py-3 px-4">Judul Transaksi</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masukList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Tidak ada data uang masuk.
                    </td>
                  </tr>
                ) : (
                  masukList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {formatTanggal(t.tanggal)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{t.namaProyek}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">{t.judul}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        +{formatRupiah(t.nominal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. LAPORAN UANG KELUAR (tanggal, nama proyek, Judul, nominal) */}
      {activeTab === 'uang_keluar' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 bg-red-50/50 border-b border-red-100 flex justify-between items-center text-xs">
            <span className="font-bold text-red-950">
              Daftar Uang Keluar Tercatat ({keluarList.length} Transaksi)
            </span>
            <span className="font-mono font-bold text-red-800">
              Total: {formatRupiah(totalKeluar)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Proyek</th>
                  <th className="py-3 px-4">Judul Transaksi</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keluarList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Tidak ada data uang keluar.
                    </td>
                  </tr>
                ) : (
                  keluarList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {formatTanggal(t.tanggal)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{t.namaProyek}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">{t.judul}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-700">
                        -{formatRupiah(t.nominal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.status === 'done'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status === 'done' ? 'Selesai Transfer' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LABA RUGI STANDAR */}
      {activeTab === 'laba_rugi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 uppercase">
              PT. INOVASI DIGITAL KREASI
            </h3>
            <p className="text-sm font-semibold text-slate-700">LAPORAN LABA RUGI (STANDAR)</p>
            <p className="text-xs text-slate-500">Tahun Buku 2026</p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                <span>1. TOTAL PENDAPATAN (UANG MASUK)</span>
                <span className="font-mono text-emerald-700 font-bold">{formatRupiah(totalMasuk)}</span>
              </div>
              <div className="divide-y divide-slate-100 py-1 pl-4 text-slate-600">
                {masukList.map((m) => (
                  <div key={m.id} className="py-1 flex justify-between">
                    <span>
                      {m.namaProyek} · {m.judul}
                    </span>
                    <span className="font-mono text-slate-800">{formatRupiah(m.nominal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                <span>2. TOTAL PENGELUARAN (UANG KELUAR)</span>
                <span className="font-mono text-red-700 font-bold">{formatRupiah(totalKeluar)}</span>
              </div>
              <div className="divide-y divide-slate-100 py-1 pl-4 text-slate-600">
                {keluarList.map((k) => (
                  <div key={k.id} className="py-1 flex justify-between">
                    <span>
                      {k.namaProyek} · {k.judul}
                    </span>
                    <span className="font-mono text-slate-800">{formatRupiah(k.nominal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-lg flex justify-between items-center text-sm font-bold">
              <span>HASIL BERSIH LABA / (RUGI):</span>
              <span className={`font-mono text-lg ${netLabaRugi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatRupiah(netLabaRugi)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
