import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalWaktu } from '../../utils/formatters';
import {
  ArrowDownCircle,
  Plus,
  Filter,
  Trash2,
  Building,
  CreditCard,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';

export const PencatatanUangMasukModule: React.FC = () => {
  const {
    incomeRecords,
    createIncomeRecord,
    deleteIncomeRecord,
    projects,
    categories,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form states
  const [formProject, setFormProject] = useState(projects[0]?.nama || 'KawanEdu');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formMethod, setFormMethod] = useState<'TF' | 'Cash'>('TF');
  const [formSender, setFormSender] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  // Auto-filled bank account when project changes
  const activeProjectObj = projects.find((p) => p.nama === formProject);
  const autoBankAccount = activeProjectObj?.noRekBank || 'BCA - 8830192831 (PT Inovasi Digital Kreasi)';

  // Helper to format day name
  const getDayName = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[d.getDay()] || 'Hari';
    } catch {
      return 'Hari';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const catObj = categories.find((c) => c.id === formCategory) || categories[0];
    const fullHariTanggal = `${getDayName(formDate)}, ${formDate}`;

    createIncomeRecord({
      namaProyek: formProject,
      hariTanggal: fullHariTanggal,
      kategoriId: catObj?.id || 'cat-1',
      kategoriKeterangan: catObj?.keterangan || 'Pembayaran SPP',
      metodePembayaran: formMethod,
      noRekTujuan: formMethod === 'TF' ? autoBankAccount : undefined,
      namaPengirim: formSender,
      jumlah: Number(formAmount) || 0,
      keterangan: formNotes,
    });

    setIsModalOpen(false);
    // Reset form
    setFormSender('');
    setFormAmount(0);
    setFormNotes('');
  };

  // Filtered income list
  const filteredRecords = incomeRecords.filter((rec) => {
    if (filterProject !== 'all' && rec.namaProyek !== filterProject) return false;
    if (filterCategory !== 'all' && rec.kategoriId !== filterCategory) return false;
    return true;
  });

  const totalFilteredIncome = filteredRecords.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pencatatan Uang Masuk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan penerimaan dana kas dan transfer masuk berdasarkan proyek (KawanEdu, Terniva, Scrava) dan kategori.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Uang Masuk Baru</span>
        </button>
      </div>

      {/* Filter and Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Uang Masuk Tercatat</div>
            <div className="text-xl font-mono font-bold text-emerald-700 mt-0.5">
              {formatRupiah(totalFilteredIncome)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3 md:col-span-2">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter Proyek
            </label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
            >
              <option value="all">Semua Proyek (KawanEdu, Terniva, Scrava)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.nama}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter Kategori (Admin)
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.keterangan}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Hari / Tanggal</th>
                <th className="py-3 px-4">Proyek & Kategori</th>
                <th className="py-3 px-4">Metode & Rekening Tujuan</th>
                <th className="py-3 px-4">Nama Pengirim</th>
                <th className="py-3 px-4 text-right">Jumlah (Rp)</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data uang masuk untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {rec.hariTanggal}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rec.namaProyek}</div>
                      <div className="text-[11px] text-slate-500">{rec.kategoriKeterangan}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.metodePembayaran === 'TF'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.metodePembayaran}
                        </span>
                        <span className="font-mono text-[11px] text-slate-600 truncate max-w-xs">
                          {rec.metodePembayaran === 'TF' ? rec.noRekTujuan : 'Kas Tunai Kantor'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">{rec.namaPengirim}</td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {formatRupiah(rec.jumlah)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {rec.keterangan || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteIncomeRecord(rec.id)}
                        title="Hapus Catatan"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-emerald-50 z-10">
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  Formulir Pencatatan Uang Masuk
                </h3>
                <p className="text-[11px] text-emerald-700">
                  Rekening tujuan otomatis terisi sesuai proyek yang dipilih
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
              {/* Project Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Proyek *
                </label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama} ({p.kode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari / Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Hari: {getDayName(formDate)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori (dari CRUD Admin) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.keterangan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method TF / Cash */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Metode Pembayaran *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer font-medium text-xs transition-colors ${
                      formMethod === 'TF'
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode"
                      value="TF"
                      checked={formMethod === 'TF'}
                      onChange={() => setFormMethod('TF')}
                      className="hidden"
                    />
                    <CreditCard className="w-4 h-4" />
                    <span>Transfer Bank (TF)</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer font-medium text-xs transition-colors ${
                      formMethod === 'Cash'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode"
                      value="Cash"
                      checked={formMethod === 'Cash'}
                      onChange={() => setFormMethod('Cash')}
                      className="hidden"
                    />
                    <DollarSign className="w-4 h-4" />
                    <span>Tunai (Cash)</span>
                  </label>
                </div>
              </div>

              {/* No. Rekening Bank (Otomatis ketika TF) */}
              {formMethod === 'TF' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                    No. Rekening Tujuan (Otomatis berdasarkan Proyek {formProject})
                  </span>
                  <div className="font-mono font-semibold text-xs text-blue-950 mt-1">
                    {autoBankAccount}
                  </div>
                </div>
              )}

              {/* Nama Pengirim & Jumlah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Pengirim ({formMethod === 'TF' ? 'Pemilik Rekening Asal' : 'Penyetor Tunai'}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSender}
                    onChange={(e) => setFormSender(e.target.value)}
                    placeholder="Contoh: SMA Global Mandiri"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Transaksi *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Pembayaran SPP Paket 450 Siswa Periode Oktober..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Uang Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
