import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncomeCategory } from '../../types';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';

export const CrudKategoriModule: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncomeCategory | null>(null);
  const [keterangan, setKeterangan] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setKeterangan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: IncomeCategory) => {
    setEditingCategory(cat);
    setKeterangan(cat.keterangan);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, { keterangan });
    } else {
      addCategory({ keterangan });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: IncomeCategory) => {
    if (confirm(`Hapus kategori "${cat.keterangan}"?`)) {
      deleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Kategori Uang Masuk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen master data kategori penerimaan kas/bank (contoh: Pembayaran SPP, Pembayaran Pendaftaran, dll). Opsi ini otomatis muncul pada modul Pencatatan Uang Masuk.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden max-w-3xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-24">ID</th>
              <th className="py-3 px-4">Keterangan Kategori</th>
              <th className="py-3 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-2">
                  <Tags className="w-3.5 h-3.5 text-blue-500" />
                  <span>{cat.keterangan}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Uang Masuk'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Pembayaran SPP / Pembayaran Pendaftaran"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
