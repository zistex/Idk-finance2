import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';
import { Plus, Edit2, Trash2, Briefcase, Landmark } from 'lucide-react';

export const CrudProyekModule: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formKode, setFormKode] = useState('');
  const [formBankName, setFormBankName] = useState('BCA');
  const [formNoRekBank, setFormNoRekBank] = useState('');
  const [formAtasNama, setFormAtasNama] = useState('PT Inovasi Digital Kreasi');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormNama('');
    setFormKode('');
    setFormBankName('BCA');
    setFormNoRekBank('');
    setFormAtasNama('PT Inovasi Digital Kreasi');
    setFormDeskripsi('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormNama(p.nama);
    setFormKode(p.kode);
    setFormBankName(p.bankName || 'BCA');
    setFormNoRekBank(p.noRekBank);
    setFormAtasNama(p.atasNama);
    setFormDeskripsi(p.deskripsi || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedNoRek = formNoRekBank.includes(formBankName)
      ? formNoRekBank
      : `${formBankName} - ${formNoRekBank} (a.n ${formAtasNama})`;

    if (editingProject) {
      updateProject(editingProject.id, {
        nama: formNama,
        kode: formKode.toUpperCase(),
        bankName: formBankName,
        noRekBank: formattedNoRek,
        atasNama: formAtasNama,
        deskripsi: formDeskripsi,
      });
    } else {
      addProject({
        nama: formNama,
        kode: formKode.toUpperCase(),
        bankName: formBankName,
        noRekBank: formattedNoRek,
        atasNama: formAtasNama,
        deskripsi: formDeskripsi,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (p: Project) => {
    if (confirm(`Hapus proyek "${p.nama}"?`)) {
      deleteProject(p.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Proyek Bisnis</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen data proyek (KawanEdu, Terniva, Scrava). Rekening bank yang dikonfigurasi di sini akan otomatis terpilih pada modul Pencatatan Uang Masuk TF.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((prj) => (
          <div
            key={prj.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {prj.kode}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{prj.nama}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(prj)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(prj)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 min-h-8">{prj.deskripsi || '-'}</p>

            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Landmark className="w-3.5 h-3.5" />
                <span>Rekening Penampungan Uang Masuk:</span>
              </div>
              <div className="font-mono text-slate-800 font-semibold text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                {prj.noRekBank}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProject ? 'Edit Data Proyek' : 'Tambah Proyek Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Proyek *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: KawanEdu"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Singkatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    placeholder="KWE / TRN"
                    className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Bank *
                </label>
                <input
                  type="text"
                  required
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  placeholder="BCA / Mandiri / BNI"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Rekening Bank Proyek *
                </label>
                <input
                  type="text"
                  required
                  value={formNoRekBank}
                  onChange={(e) => setFormNoRekBank(e.target.value)}
                  placeholder="Contoh: 8830192831"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Atas Nama Rekening *
                </label>
                <input
                  type="text"
                  required
                  value={formAtasNama}
                  onChange={(e) => setFormAtasNama(e.target.value)}
                  placeholder="PT Inovasi Digital Kreasi"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Proyek
                </label>
                <textarea
                  rows={2}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Penjelasan produk atau platform..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
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
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
