import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FundRequest,
  GroupDisbursement,
  GroupDisbursementDetail,
} from '../../types';
import {
  formatRupiah,
  formatTanggal,
  formatTanggalWaktu,
  downloadTextFile,
} from '../../utils/formatters';
import {
  Upload,
  CheckCircle2,
  Users,
  FileDown,
  Printer,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';

export const TransferBankModule: React.FC = () => {
  const {
    fundRequests,
    uploadTransferProof,
    groupDisbursements,
    createGroupDisbursement,
    updateGroupDisbursement,
    deleteGroupDisbursement,
    employees,
    addLog,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'upload_bukti' | 'group_disbursement' | 'eksekusi_disbursement'>('upload_bukti');

  // Sub-feature 1: Upload Bukti
  const [selectedRequestForUpload, setSelectedRequestForUpload] = useState<FundRequest | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Sub-feature 2: Group Disbursement CRUD
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupJudul, setGroupJudul] = useState('');
  const [groupKeterangan, setGroupKeterangan] = useState('');
  const [groupDetails, setGroupDetails] = useState<GroupDisbursementDetail[]>([]);
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState<string>('');
  const [defaultNominalToAdd, setDefaultNominalToAdd] = useState<number>(5000000);

  // Sub-feature 3: Disbursement Execution
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split('T')[0]);
  const [disbursementJudul, setDisbursementJudul] = useState('Disbursement Payroll KawanEdu');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groupDisbursements[0]?.id || '');
  const [previewVoucherOpen, setPreviewVoucherOpen] = useState(false);

  // Filter requests for Upload Bukti
  const approvedRequests = fundRequests.filter((r) => r.status === 'approved');
  const completedRequests = fundRequests.filter((r) => r.status === 'done');

  // Handle open Upload Bukti Modal
  const handleOpenUploadProof = (req: FundRequest) => {
    setSelectedRequestForUpload(req);
    setProofFileName(`Bukti_Transfer_${req.nomorPengajuan}.pdf`);
    setTransferDate(new Date().toISOString().split('T')[0]);
    setIsUploadModalOpen(true);
  };

  const handleConfirmUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForUpload) return;

    uploadTransferProof(
      selectedRequestForUpload.id,
      proofFileName || 'Bukti_Transfer.pdf',
      '#',
      transferDate
    );

    setIsUploadModalOpen(false);
    setSelectedRequestForUpload(null);
  };

  // Group Disbursement Handlers
  const handleOpenCreateGroup = () => {
    setEditingGroupId(null);
    setGroupJudul('');
    setGroupKeterangan('');
    setGroupDetails([]);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (grp: GroupDisbursement) => {
    setEditingGroupId(grp.id);
    setGroupJudul(grp.judul);
    setGroupKeterangan(grp.keterangan || '');
    setGroupDetails([...grp.details]);
    setIsGroupModalOpen(true);
  };

  const handleAddEmployeeToGroup = () => {
    if (!selectedEmployeeToAdd) return;
    const emp = employees.find((e) => e.id === selectedEmployeeToAdd);
    if (!emp) return;

    // Check if already in group
    const exists = groupDetails.some((d) => d.employeeId === emp.id);
    if (exists) {
      alert('Karyawan sudah ada dalam daftar group ini.');
      return;
    }

    const newDetail: GroupDisbursementDetail = {
      id: `gd-${Date.now()}-${groupDetails.length}`,
      employeeId: emp.id,
      nama: emp.nama,
      noRek: emp.noRek,
      bank: emp.bank,
      nominal: Number(defaultNominalToAdd) || 0,
    };

    setGroupDetails([...groupDetails, newDetail]);
    setSelectedEmployeeToAdd('');
  };

  const handleUpdateGroupDetailNominal = (idx: number, nominal: number) => {
    const updated = [...groupDetails];
    updated[idx].nominal = nominal;
    setGroupDetails(updated);
  };

  const handleRemoveGroupDetail = (idx: number) => {
    setGroupDetails(groupDetails.filter((_, i) => i !== idx));
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupJudul.trim()) return;

    const totalNominal = groupDetails.reduce((sum, d) => sum + (Number(d.nominal) || 0), 0);

    if (editingGroupId) {
      updateGroupDisbursement(editingGroupId, {
        judul: groupJudul,
        keterangan: groupKeterangan,
        details: groupDetails,
        totalNominal,
      });
    } else {
      createGroupDisbursement({
        judul: groupJudul,
        keterangan: groupKeterangan,
        details: groupDetails,
        totalNominal,
      });
    }

    setIsGroupModalOpen(false);
  };

  // Sub-feature 3: Disbursement Execution (TXT & PDF)
  const currentSelectedGroup = groupDisbursements.find((g) => g.id === selectedGroupId) || groupDisbursements[0];

  const handleDownloadTXT = () => {
    if (!currentSelectedGroup) return;

    let content = `PT. INOVASI DIGITAL KREASI - BULK BANK DISBURSEMENT FILE\n`;
    content += `Judul Batch: ${disbursementJudul}\n`;
    content += `Tanggal Eksekusi: ${disbursementDate}\n`;
    content += `Group Disbursement: ${currentSelectedGroup.judul}\n`;
    content += `Total Penerima: ${currentSelectedGroup.details.length}\n`;
    content += `Total Nominal: Rp ${currentSelectedGroup.totalNominal.toLocaleString('id-ID')}\n`;
    content += `========================================================================================\n`;
    content += `NO\tNAMA LENGKAP\tBANK\tNOMOR REKENING\tNOMINAL (IDR)\tBERITA TRANSFER\n`;
    content += `----------------------------------------------------------------------------------------\n`;

    currentSelectedGroup.details.forEach((item, index) => {
      content += `${index + 1}\t${item.nama}\t${item.bank}\t${item.noRek}\t${item.nominal}\t${disbursementJudul}\n`;
    });

    content += `========================================================================================\n`;
    content += `Checksum Total: ${currentSelectedGroup.totalNominal}\n`;
    content += `Generated at: ${new Date().toISOString()}\n`;

    const filename = `Disbursement_${currentSelectedGroup.judul.replace(/\s+/g, '_')}_${disbursementDate}.txt`;
    downloadTextFile(filename, content);

    addLog('DOWNLOAD_DISBURSEMENT_TXT', `Mengunduh file TXT batch disbursement "${disbursementJudul}"`);
  };

  const handlePrintPDF = () => {
    addLog('PRINT_DISBURSEMENT_PDF', `Mencetak voucher PDF batch disbursement "${disbursementJudul}"`);
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Transfer Bank & Disbursement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modul pengunggahan bukti transfer pengajuan yang telah disetujui, konfigurasi Group Disbursement, dan eksekusi download file TXT/PDF.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('upload_bukti')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'upload_bukti'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Bukti Transfer
          </button>
          <button
            onClick={() => setActiveSubTab('group_disbursement')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'group_disbursement'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group Disbursement (CRUD)
          </button>
          <button
            onClick={() => setActiveSubTab('eksekusi_disbursement')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'eksekusi_disbursement'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disbursement TXT & PDF
          </button>
        </div>
      </div>

      {/* 1. TAB UPLOAD BUKTI PENGAJUAN DANA */}
      {activeSubTab === 'upload_bukti' && (
        <div className="space-y-6">
          {/* Waiting for Upload (Approved) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Pengajuan Disetujui Admin (Siap Ditransfer)
                </h3>
                <p className="text-[11px] text-blue-700">
                  Upload bukti transfer bank di bawah ini untuk mengubah status menjadi "Done" dan mencatat transaksi keluar.
                </p>
              </div>
              <span className="font-mono font-bold text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {approvedRequests.length} Siap
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">No. Pengajuan</th>
                    <th className="py-3 px-4">Modul & Proyek</th>
                    <th className="py-3 px-4">Tujuan Rekening Bank</th>
                    <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-center">Aksi Transfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Tidak ada pengajuan yang siap ditransfer saat ini.
                      </td>
                    </tr>
                  ) : (
                    approvedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {req.nomorPengajuan}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold capitalize text-slate-800">
                            {req.kategori}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {req.namaProyek || req.periodePayroll || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>
                            {req.bankTujuan} - {req.noRekTujuan || 'Disbursement Listing'}
                          </div>
                          <div className="text-[10px] font-sans text-slate-500">
                            a.n {req.atasNamaTujuan || req.tujuanInvoice || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                          {formatRupiah(req.jumlah)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {req.keterangan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenUploadProof(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Bukti (Done)</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Already Done History */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Riwayat Pengajuan Selesai Ditransfer (Status Done)
              </h3>
              <p className="text-[11px] text-slate-500">
                Pengajuan yang telah dilampirkan bukti transfer bank.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">No. Pengajuan</th>
                    <th className="py-2.5 px-4">Tgl Transfer</th>
                    <th className="py-2.5 px-4">Modul / Proyek</th>
                    <th className="py-2.5 px-4 text-right">Nominal Ditransfer</th>
                    <th className="py-2.5 px-4">Bukti Transfer</th>
                    <th className="py-2.5 px-4">Eksekutor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                        {req.nomorPengajuan}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {formatTanggal(req.tanggalTransfer || '')}
                      </td>
                      <td className="py-2.5 px-4 capitalize">
                        {req.kategori} · {req.namaProyek || req.periodePayroll || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatRupiah(req.jumlah)}
                      </td>
                      <td className="py-2.5 px-4 text-blue-600 font-mono text-[11px]">
                        <span className="flex items-center gap-1 cursor-pointer hover:underline">
                          <FileText className="w-3.5 h-3.5" />
                          {req.buktiTransferNama || 'Bukti_Transfer.pdf'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {req.disbursedBy || 'Finance Manager'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB GROUP DISBURSEMENT CRUD */}
      {activeSubTab === 'group_disbursement' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Kelola Group Disbursement</h3>
              <p className="text-xs text-slate-500">
                Buat kelompok transfer berulang (misal: Karyawan KawanEdu, Tutor Terniva) dengan multi-pilih karyawan dari database Admin.
              </p>
            </div>
            <button
              onClick={handleOpenCreateGroup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Group Disbursement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupDisbursements.map((grp) => (
              <div
                key={grp.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{grp.judul}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{grp.keterangan || '-'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditGroup(grp)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                      title="Edit Group"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGroupDisbursement(grp.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Hapus Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Detail list table */}
                <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-50 p-2 font-semibold text-[11px] text-slate-600 flex justify-between">
                    <span>Daftar Penerima ({grp.details.length} Orang)</span>
                    <span className="font-mono font-bold text-slate-900">
                      Total: {formatRupiah(grp.totalNominal)}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {grp.details.map((d) => (
                      <div key={d.id} className="p-2 flex items-center justify-between text-[11px]">
                        <div>
                          <div className="font-medium text-slate-800">{d.nama}</div>
                          <div className="font-mono text-slate-400 text-[10px]">
                            {d.bank} · {d.noRek}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-900">
                          {formatRupiah(d.nominal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Dibuat: {formatTanggal(grp.createdAt)}</span>
                  <button
                    onClick={() => {
                      setSelectedGroupId(grp.id);
                      setDisbursementJudul(`Disbursement - ${grp.judul}`);
                      setActiveSubTab('eksekusi_disbursement');
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold"
                  >
                    Gunakan untuk Eksekusi →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB DISBURSEMENT EXECUTION (TXT & PDF) */}
      {activeSubTab === 'eksekusi_disbursement' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Formulir Eksekusi Disbursement</h3>
            <p className="text-xs text-slate-500">
              Pilih tanggal, judul, dan group disbursement untuk mengunduh format TXT perbankan dan voucher PDF resmi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Eksekusi *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Batch Disbursement *
                </label>
                <input
                  type="text"
                  value={disbursementJudul}
                  onChange={(e) => setDisbursementJudul(e.target.value)}
                  placeholder="Contoh: Gaji KawanEdu Periode Oktober"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Group Disbursement *
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  {groupDisbursements.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.judul} ({g.details.length} orang - {formatRupiah(g.totalNominal)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions: Download TXT and Download PDF */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Group Terpilih: <strong className="text-slate-900">{currentSelectedGroup?.judul}</strong> (
                {currentSelectedGroup?.details.length} Penerima · Total:{' '}
                <strong className="font-mono text-emerald-700">
                  {formatRupiah(currentSelectedGroup?.totalNominal || 0)}
                </strong>
                )
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTXT}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Format TXT Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewVoucherOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Pratinjau / Cetak PDF Voucher</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Preview of Selected Group */}
          {currentSelectedGroup && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                Rincian Listing Batch: {currentSelectedGroup.judul}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="p-3">No</th>
                      <th className="p-3">Nama Penerima</th>
                      <th className="p-3">Bank</th>
                      <th className="p-3">No. Rekening</th>
                      <th className="p-3 text-right">Nominal Transfer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {currentSelectedGroup.details.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-sans font-medium text-slate-800">{item.nama}</td>
                        <td className="p-3 text-slate-600">{item.bank}</td>
                        <td className="p-3 text-slate-700">{item.noRek}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatRupiah(item.nominal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold border-t border-slate-200 text-xs">
                    <tr>
                      <td colSpan={4} className="p-3 text-right text-slate-700">
                        Total Akumulasi Nominal Transfer:
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {formatRupiah(currentSelectedGroup.totalNominal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL UPLOAD BUKTI */}
      {isUploadModalOpen && selectedRequestForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-emerald-50 z-10">
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">
                  Upload Bukti Transfer Bank
                </h3>
                <p className="text-[11px] text-emerald-700">
                  {selectedRequestForUpload.nomorPengajuan} · {formatRupiah(selectedRequestForUpload.jumlah)}
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmUploadProof} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-slate-500">Penerima & Rekening:</div>
                <div className="font-medium text-slate-800">
                  {selectedRequestForUpload.atasNamaTujuan || selectedRequestForUpload.tujuanInvoice}
                </div>
                <div className="font-mono text-slate-600">
                  {selectedRequestForUpload.bankTujuan} - {selectedRequestForUpload.noRekTujuan}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Transfer Nyata *
                </label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  File Bukti Transfer (PDF / JPG / Struk Bank) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={proofFileName}
                    onChange={(e) => setProofFileName(e.target.value)}
                    placeholder="Bukti_Transfer.pdf"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer text-xs font-medium flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProofFileName(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                💡 Setelah konfirmasi, status pengajuan dana otomatis berubah menjadi <strong>Done</strong> dan tercatat ke laporan transaksi uang keluar.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Konfirmasi Status Selesai (Done)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GROUP DISBURSEMENT CRUD */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-2xl my-auto max-h-[85vh] overflow-y-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingGroupId ? 'Edit Group Disbursement' : 'Tambah Group Disbursement'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kelola nama kelompok dan multi-pilih karyawan dari database Admin
                </p>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Group Disbursement *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupJudul}
                    onChange={(e) => setGroupJudul(e.target.value)}
                    placeholder="Contoh: Karyawan KawanEdu"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan Singkat
                  </label>
                  <input
                    type="text"
                    value={groupKeterangan}
                    onChange={(e) => setGroupKeterangan(e.target.value)}
                    placeholder="Contoh: Payroll bulanan tim operasional"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Add Employee Picker from Admin CRUD */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-semibold text-slate-700">
                  Pilih Karyawan dari Database Admin:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedEmployeeToAdd}
                    onChange={(e) => setSelectedEmployeeToAdd(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nama} ({emp.bank} - {emp.noRek})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={defaultNominalToAdd}
                    onChange={(e) => setDefaultNominalToAdd(Number(e.target.value))}
                    placeholder="Nominal (Rp)"
                    className="w-36 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={handleAddEmployeeToGroup}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0"
                  >
                    + Tambahkan
                  </button>
                </div>
              </div>

              {/* Table of selected members in group */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Rincian Karyawan dalam Group ({groupDetails.length})
                  </label>
                  <span className="font-mono font-bold text-slate-800">
                    Total: {formatRupiah(groupDetails.reduce((a, b) => a + (Number(b.nominal) || 0), 0))}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Rekening</th>
                        <th className="p-2 text-right">Nominal (Rp)</th>
                        <th className="p-2 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupDetails.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400">
                            Belum ada karyawan yang ditambahkan ke group ini.
                          </td>
                        </tr>
                      ) : (
                        groupDetails.map((d, idx) => (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="p-2 font-medium text-slate-800">{d.nama}</td>
                            <td className="p-2 font-mono text-slate-600">
                              {d.bank} {d.noRek}
                            </td>
                            <td className="p-2 text-right">
                              <input
                                type="number"
                                value={d.nominal}
                                onChange={(e) => handleUpdateGroupDetailNominal(idx, Number(e.target.value))}
                                className="w-28 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveGroupDetail(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINT / PRATINJAU PDF DISBURSEMENT VOUCHER */}
      {previewVoucherOpen && currentSelectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="font-bold text-slate-800 text-sm">Pratinjau Voucher Disbursement</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPDF}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setPreviewVoucherOpen(false)}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Letterhead Document */}
            <div className="p-8 text-slate-800 font-sans space-y-6">
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    PT. INOVASI DIGITAL KREASI
                  </h1>
                  <p className="text-xs text-slate-600">
                    Gedung Cyber 2 Lantai 18, Jl. HR Rasuna Said, Jakarta Selatan 12950
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Email: finance@inovasidigital.id · Telp: (021) 5290-8800
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 uppercase">
                    Voucher Transfer Bank
                  </div>
                  <div className="font-mono text-xs text-slate-600 mt-1">
                    No: DSB-{disbursementDate.replace(/-/g, '')}-{(currentSelectedGroup.id || '').slice(-3)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Tanggal: {formatTanggal(disbursementDate)}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Judul Batch:</span>
                  <div className="font-semibold text-slate-900">{disbursementJudul}</div>
                </div>
                <div>
                  <span className="text-slate-500">Group Terpilih:</span>
                  <div className="font-semibold text-slate-900">{currentSelectedGroup.judul}</div>
                </div>
                <div>
                  <span className="text-slate-500">Jumlah Penerima:</span>
                  <div className="font-semibold text-slate-900">
                    {currentSelectedGroup.details.length} Karyawan
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Total Nilai Transfer:</span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    {formatRupiah(currentSelectedGroup.totalNominal)}
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2 border-r border-slate-300">No</th>
                    <th className="p-2 border-r border-slate-300">Nama Penerima</th>
                    <th className="p-2 border-r border-slate-300">Bank</th>
                    <th className="p-2 border-r border-slate-300">No. Rekening</th>
                    <th className="p-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {currentSelectedGroup.details.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 border-r border-slate-300 text-center font-sans">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-sans font-medium text-slate-900">
                        {item.nama}
                      </td>
                      <td className="p-2 border-r border-slate-300">{item.bank}</td>
                      <td className="p-2 border-r border-slate-300">{item.noRek}</td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        {formatRupiah(item.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-2 text-right font-sans">
                      TOTAL DANA DITRANSFER:
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-800">
                      {formatRupiah(currentSelectedGroup.totalNominal)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="text-slate-500 mb-12">Disiapkan Oleh (Finance),</div>
                  <div className="font-semibold underline">Siti Rahmawati</div>
                  <div className="text-[10px] text-slate-400">Finance Manager</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-12">Disetujui Oleh (Admin),</div>
                  <div className="font-semibold underline">Budi Santoso</div>
                  <div className="text-[10px] text-slate-400">Direktur / Admin Utama</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-12">Tanda Tangan Bank / Cap,</div>
                  <div className="font-semibold underline">(...............................)</div>
                  <div className="text-[10px] text-slate-400">Verifikasi Bank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
