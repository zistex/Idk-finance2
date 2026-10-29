import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { formatTanggal } from '../../utils/formatters';
import { Plus, Edit2, Trash2, Users, Upload, ExternalLink, CreditCard } from 'lucide-react';

export const CrudEmployeeModule: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formBank, setFormBank] = useState('BCA');
  const [formNoRek, setFormNoRek] = useState('');
  const [formAtasNama, setFormAtasNama] = useState('');
  const [formKtpName, setFormKtpName] = useState('');

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormNama('');
    setFormBank('BCA');
    setFormNoRek('');
    setFormAtasNama('');
    setFormKtpName('KTP_Employee.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormNama(emp.nama);
    setFormBank(emp.bank);
    setFormNoRek(emp.noRek);
    setFormAtasNama(emp.atasNama);
    setFormKtpName(emp.lampiranKtpUrl ? 'KTP_Employee_Tersimpan.jpg' : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        nama: formNama,
        bank: formBank,
        noRek: formNoRek,
        atasNama: formAtasNama || formNama,
        lampiranKtpUrl: formKtpName ? '#' : undefined,
      });
    } else {
      addEmployee({
        nama: formNama,
        bank: formBank,
        noRek: formNoRek,
        atasNama: formAtasNama || formNama,
        lampiranKtpUrl: formKtpName ? '#' : undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (emp: Employee) => {
    if (confirm(`Hapus karyawan "${emp.nama}"?`)) {
      deleteEmployee(emp.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Employee (Karyawan)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen master data karyawan: ID, nama, no rekening, bank, atas nama, dan lampiran KTP. Data ini terintegrasi langsung dengan modul Payroll & Group Disbursement.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ID & Nama Lengkap</th>
                <th className="py-3 px-4">Bank & Nomor Rekening</th>
                <th className="py-3 px-4">Atas Nama Rekening</th>
                <th className="py-3 px-4">Lampiran (KTP)</th>
                <th className="py-3 px-4">Tanggal Bergabung</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data karyawan.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.nama}</div>
                      <div className="font-mono text-[10px] text-slate-400">{emp.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-slate-800">
                        {emp.bank} - {emp.noRek}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">{emp.atasNama}</td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline cursor-pointer">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>KTP_Verified.jpg</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {formatTanggal(emp.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Karyawan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADD / EDIT EMPLOYEE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Data rekening akan digunakan pada listing payroll otomatis
                </p>
              </div>
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Bank *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    placeholder="BCA / Mandiri / BNI"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNoRek}
                    onChange={(e) => setFormNoRek(e.target.value)}
                    placeholder="Contoh: 5270198271"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Atas Nama Rekening (Beneficiary Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formAtasNama}
                  onChange={(e) => setFormAtasNama(e.target.value)}
                  placeholder="Sesuai buku tabungan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lampiran (Foto / Scan KTP)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formKtpName}
                    onChange={(e) => setFormKtpName(e.target.value)}
                    placeholder="Scan_KTP_Andi.jpg"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer text-xs font-medium flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFormKtpName(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
