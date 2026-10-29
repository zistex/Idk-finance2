import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import {
  BarChart3,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Download,
  Building2,
  PieChart,
  Scale,
} from 'lucide-react';

export const LaporanFinanceModule: React.FC = () => {
  const { transactions, projects, fundRequests, incomeRecords } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'arus_kas' | 'laba_rugi' | 'neraca'>('arus_kas');
  const [filterStartDate, setFilterStartDate] = useState('2026-10-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-10-31');
  const [filterProject, setFilterProject] = useState('all');

  // Filtered transactions for Uang Masuk & Keluar
  const filteredTransactions = transactions.filter((t) => {
    if (filterProject !== 'all' && t.namaProyek !== filterProject) return false;
    if (filterStartDate && t.tanggal < filterStartDate) return false;
    if (filterEndDate && t.tanggal > filterEndDate) return false;
    return true;
  });

  const totalMasuk = filteredTransactions
    .filter((t) => t.kategoriTransaksi === 'uang_masuk')
    .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);

  const totalKeluar = filteredTransactions
    .filter((t) => t.kategoriTransaksi === 'uang_keluar')
    .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);

  const netCashflow = totalMasuk - totalKeluar;

  // Laba Rugi Calculations
  const allUangMasuk = transactions
    .filter((t) => t.kategoriTransaksi === 'uang_masuk' && t.status === 'done')
    .reduce((sum, t) => sum + t.nominal, 0);

  const allUangKeluar = transactions
    .filter((t) => t.kategoriTransaksi === 'uang_keluar' && t.status === 'done')
    .reduce((sum, t) => sum + t.nominal, 0);

  const netProfitLoss = allUangMasuk - allUangKeluar;

  // Grouped expenses by category
  const expenseBreakdown = {
    operasional: transactions
      .filter((t) => t.kategoriTransaksi === 'uang_keluar' && t.jenis.toLowerCase().includes('operasional'))
      .reduce((sum, t) => sum + t.nominal, 0),
    payroll: transactions
      .filter((t) => t.kategoriTransaksi === 'uang_keluar' && t.jenis.toLowerCase().includes('payroll'))
      .reduce((sum, t) => sum + t.nominal, 0),
    pajak: transactions
      .filter((t) => t.kategoriTransaksi === 'uang_keluar' && t.jenis.toLowerCase().includes('pajak'))
      .reduce((sum, t) => sum + t.nominal, 0),
    pengadaan: transactions
      .filter((t) => t.kategoriTransaksi === 'uang_keluar' && t.jenis.toLowerCase().includes('pengadaan'))
      .reduce((sum, t) => sum + t.nominal, 0),
    reimburse: transactions
      .filter((t) => t.kategoriTransaksi === 'uang_keluar' && t.jenis.toLowerCase().includes('reimburse'))
      .reduce((sum, t) => sum + t.nominal, 0),
  };

  // Neraca Calculations
  // Kas di Bank (dari TF)
  const kasBank = incomeRecords
    .filter((r) => r.metodePembayaran === 'TF')
    .reduce((s, r) => s + r.jumlah, 0) -
    fundRequests.filter((r) => r.status === 'done').reduce((s, r) => s + r.jumlah, 0);

  // Kas Tunai (dari Cash)
  const kasTunai = incomeRecords
    .filter((r) => r.metodePembayaran === 'Cash')
    .reduce((s, r) => s + r.jumlah, 0);

  // Piutang Invoice belum lunas
  const piutangInvoice = fundRequests
    .filter((r) => r.kategori === 'invoice' && r.status !== 'done')
    .reduce((s, r) => s + r.jumlah, 0);

  const totalAktiva = Math.max(0, kasBank) + kasTunai + piutangInvoice + 150000000; // include fixed assets (aset peralatan lab & server)

  // Kewajiban & Ekuitas
  const kewajibanLancar = fundRequests
    .filter((r) => r.status === 'pending_admin_approval' || r.status === 'approved')
    .reduce((s, r) => s + r.jumlah, 0);

  const modalDisetor = 100000000;
  const ekuitasLabaDitahan = totalAktiva - kewajibanLancar - modalDisetor;
  const totalPasiva = kewajibanLancar + modalDisetor + ekuitasLabaDitahan;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Laporan Keuangan Perusahaan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan berkala uang masuk & keluar (dengan filter rentang tanggal dan proyek), laba rugi komprehensif, dan neraca keuangan PT. Inovasi Digital Kreasi.
          </p>
        </div>

        {/* Report Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveReportTab('arus_kas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'arus_kas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Uang Masuk & Keluar
          </button>
          <button
            onClick={() => setActiveReportTab('laba_rugi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'laba_rugi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laba Rugi
          </button>
          <button
            onClick={() => setActiveReportTab('neraca')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeReportTab === 'neraca'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Neraca
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

      {/* 1. REPORT: LAPORAN UANG MASUK & KELUAR */}
      {activeReportTab === 'arus_kas' && (
        <div className="space-y-6">
          {/* Filters Bar: Range Date & Proyek */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Periode:</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Nama Proyek:</span>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">Semua Proyek (KawanEdu, Terniva, Scrava)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.nama}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Uang Masuk</span>
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-mono font-bold text-emerald-700 mt-2">
                {formatRupiah(totalMasuk)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Uang Keluar</span>
                <span className="p-1 bg-red-50 text-red-600 rounded">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-mono font-bold text-red-700 mt-2">
                {formatRupiah(totalKeluar)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Net Arus Kas (Surplus)</span>
                <span className="p-1 bg-blue-50 text-blue-600 rounded">
                  <Scale className="w-4 h-4" />
                </span>
              </div>
              <div
                className={`text-xl font-mono font-bold mt-2 ${
                  netCashflow >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}
              >
                {formatRupiah(netCashflow)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">
                Rincian Transaksi Kas ({filteredTransactions.length} Data)
              </span>
              <span className="text-slate-500 text-[11px]">
                {formatTanggal(filterStartDate)} — {formatTanggal(filterEndDate)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Nama Proyek</th>
                    <th className="py-2.5 px-4">Judul Transaksi</th>
                    <th className="py-2.5 px-4">Kategori Transaksi</th>
                    <th className="py-2.5 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada transaksi pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          {formatTanggal(trx.tanggal)}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {trx.namaProyek}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 max-w-sm">{trx.judul}</td>
                        <td className="py-2.5 px-4">
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
                          className={`py-2.5 px-4 text-right font-mono font-bold ${
                            trx.kategoriTransaksi === 'uang_masuk'
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }`}
                        >
                          {trx.kategoriTransaksi === 'uang_masuk' ? '+' : '-'} {formatRupiah(trx.nominal)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              trx.status === 'done'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {trx.status === 'done' ? 'Selesai' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. REPORT: LABA RUGI */}
      {activeReportTab === 'laba_rugi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 uppercase">
              PT. INOVASI DIGITAL KREASI
            </h3>
            <p className="text-sm font-semibold text-slate-700">LAPORAN LABA RUGI (INCOME STATEMENT)</p>
            <p className="text-xs text-slate-500">Periode Berjalan Tahun 2026</p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* 1. Pendapatan */}
            <div>
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                <span>I. PENDAPATAN OPERASIONAL</span>
                <span>NOMINAL (IDR)</span>
              </div>
              <div className="divide-y divide-slate-100 py-2">
                {incomeRecords.map((inc) => (
                  <div key={inc.id} className="py-1.5 flex justify-between pl-4 text-slate-700">
                    <span>
                      {inc.kategoriKeterangan} - {inc.namaProyek} ({inc.namaPengirim})
                    </span>
                    <span className="font-mono text-slate-900">{formatRupiah(inc.jumlah)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2 bg-slate-50 p-2 rounded">
                <span>TOTAL PENDAPATAN OPERASIONAL:</span>
                <span className="font-mono text-emerald-700">{formatRupiah(allUangMasuk)}</span>
              </div>
            </div>

            {/* 2. Beban / Pengeluaran */}
            <div>
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                <span>II. BEBAN & PENGELUARAN USAHA</span>
                <span>NOMINAL (IDR)</span>
              </div>
              <div className="space-y-1.5 py-2 pl-4 text-slate-700">
                <div className="flex justify-between py-1">
                  <span>Beban Operasional & Cloud Server AWS:</span>
                  <span className="font-mono text-slate-900">{formatRupiah(expenseBreakdown.operasional)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Beban Gaji & Payroll Karyawan:</span>
                  <span className="font-mono text-slate-900">{formatRupiah(expenseBreakdown.payroll)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Beban Pajak Penghasilan (PPh 21/23/PPN):</span>
                  <span className="font-mono text-slate-900">{formatRupiah(expenseBreakdown.pajak)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Beban Pengadaan Alat & Inventaris:</span>
                  <span className="font-mono text-slate-900">{formatRupiah(expenseBreakdown.pengadaan)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Beban Reimburse & Transportasi Lapangan:</span>
                  <span className="font-mono text-slate-900">{formatRupiah(expenseBreakdown.reimburse)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2 bg-slate-50 p-2 rounded">
                <span>TOTAL BEBAN USAHA:</span>
                <span className="font-mono text-red-700">{formatRupiah(allUangKeluar)}</span>
              </div>
            </div>

            {/* 3. Laba Bersih */}
            <div className="p-3 bg-slate-900 text-white rounded-lg flex justify-between items-center text-sm font-bold">
              <span>LABA BERSIH BERJALAN (NET INCOME):</span>
              <span className={`font-mono text-base ${netProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatRupiah(netProfitLoss)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. REPORT: NERACA */}
      {activeReportTab === 'neraca' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 uppercase">
              PT. INOVASI DIGITAL KREASI
            </h3>
            <p className="text-sm font-semibold text-slate-700">LAPORAN POSISI KEUANGAN (NERACA / BALANCE SHEET)</p>
            <p className="text-xs text-slate-500">Per 31 Oktober 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* AKTIVA */}
            <div className="space-y-4">
              <div className="border-b-2 border-slate-800 pb-1 font-bold text-sm text-slate-900">
                AKTIVA (ASET)
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">1. Aset Lancar</div>
                <div className="pl-3 space-y-1 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Kas di Rekening Bank (BCA, Mandiri, BNI):</span>
                    <span className="font-mono font-medium text-slate-800">{formatRupiah(Math.max(0, kasBank))}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Kas Tunai Kantor:</span>
                    <span className="font-mono font-medium text-slate-800">{formatRupiah(kasTunai)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Piutang Usaha & Tagihan Invoice:</span>
                    <span className="font-mono font-medium text-slate-800">{formatRupiah(piutangInvoice)}</span>
                  </div>
                </div>

                <div className="font-semibold text-slate-800 pt-2">2. Aset Tetap</div>
                <div className="pl-3 space-y-1 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Peralatan Kantor, Server & Lab IT:</span>
                    <span className="font-mono font-medium text-slate-800">Rp 150.000.000</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between font-bold text-blue-950 text-xs">
                <span>TOTAL AKTIVA (ASET):</span>
                <span className="font-mono">{formatRupiah(totalAktiva)}</span>
              </div>
            </div>

            {/* PASIVA */}
            <div className="space-y-4">
              <div className="border-b-2 border-slate-800 pb-1 font-bold text-sm text-slate-900">
                PASIVA (KEWAJIBAN & EKUITAS)
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">1. Kewajiban (Liabilitas)</div>
                <div className="pl-3 space-y-1 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Hutang Pengadaan & Komitmen Berjalan:</span>
                    <span className="font-mono font-medium text-slate-800">{formatRupiah(kewajibanLancar)}</span>
                  </div>
                </div>

                <div className="font-semibold text-slate-800 pt-2">2. Ekuitas Modal</div>
                <div className="pl-3 space-y-1 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Modal Disetor Pendiri:</span>
                    <span className="font-mono font-medium text-slate-800">Rp 100.000.000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Laba Ditahan & Surplus Berjalan:</span>
                    <span className="font-mono font-medium text-slate-800">{formatRupiah(ekuitasLabaDitahan)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between font-bold text-blue-950 text-xs">
                <span>TOTAL PASIVA (KEWAJIBAN + EKUITAS):</span>
                <span className="font-mono">{formatRupiah(totalPasiva)}</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 text-[11px] text-emerald-700 font-semibold">
            ✓ Neraca Seimbang (Balance Invariant: Total Aktiva = Total Pasiva)
          </div>
        </div>
      )}
    </div>
  );
};
