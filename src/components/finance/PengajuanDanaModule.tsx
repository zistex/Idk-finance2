import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FundRequest,
  RequestCategory,
  RequestSource,
  InvoiceDetailItem,
  PayrollEmployeeItem,
} from '../../types';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '../../utils/formatters';
import {
  Plus,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Send,
  Upload,
  ArrowRight,
  RotateCcw,
  Paperclip,
  Check,
} from 'lucide-react';

export const PengajuanDanaModule: React.FC = () => {
  const {
    fundRequests,
    createFundRequest,
    updateFundRequest,
    deleteFundRequest,
    reviewPicRequest,
    reviseFundRequest,
    projects,
    employees,
  } = useApp();

  const [activeTabCategory, setActiveTabCategory] = useState<string>('all');
  const [activeFilterSource, setActiveFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [picReviewModalOpen, setPicReviewModalOpen] = useState(false);
  const [picActionType, setPicActionType] = useState<'approve' | 'reject'>('approve');
  const [picRejectNotes, setPicRejectNotes] = useState('');

  // Form State for Create / Edit
  const [formCategory, setFormCategory] = useState<RequestCategory>('operasional');
  const [formSource, setFormSource] = useState<RequestSource>('finance');
  const [formPicName, setFormPicName] = useState('');
  const [formProject, setFormProject] = useState(projects[0]?.nama || 'KawanEdu');
  const [formApplicant, setFormApplicant] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formBank, setFormBank] = useState('BCA');
  const [formAccountName, setFormAccountName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  // Payroll fields
  const [formPeriod, setFormPeriod] = useState('');
  const [formPayrollItems, setFormPayrollItems] = useState<PayrollEmployeeItem[]>([]);
  // Invoice fields
  const [formInvoiceDate, setFormInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formInvoiceTitle, setFormInvoiceTitle] = useState('');
  const [formInvoiceTarget, setFormInvoiceTarget] = useState('');
  const [formInvoiceDetails, setFormInvoiceDetails] = useState<InvoiceDetailItem[]>([]);

  // Revision Form State
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisedAmount, setRevisedAmount] = useState<number>(0);
  const [revisedDescription, setRevisedDescription] = useState('');
  const [revisedAttachment, setRevisedAttachment] = useState('');

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormCategory('operasional');
    setFormSource('finance');
    setFormPicName('');
    setFormProject(projects[0]?.nama || 'KawanEdu');
    setFormApplicant('');
    setFormAmount(0);
    setFormAccountNo('');
    setFormBank('BCA');
    setFormAccountName('');
    setFormDescription('');
    setFormAttachmentName('');
    setFormPeriod('Oktober 2026');
    // Pre-populate payroll from employees
    setFormPayrollItems(
      employees.map((emp, idx) => ({
        id: `pl-${Date.now()}-${idx}`,
        employeeId: emp.id,
        no: idx + 1,
        nama: emp.nama,
        noRekening: emp.noRek,
        bank: emp.bank,
        jumlah: 5000000,
      }))
    );
    setFormInvoiceDate(new Date().toISOString().split('T')[0]);
    setFormInvoiceNumber(`INV-${Date.now().toString().slice(-4)}`);
    setFormInvoiceTitle('');
    setFormInvoiceTarget('');
    setFormInvoiceDetails([
      { id: `invd-${Date.now()}-1`, deskripsi: 'Jasa Implementasi Modul', qty: 1, hargaSatuan: 5000000, total: 5000000 },
    ]);
    setIsCreateModalOpen(true);
  };

  // Submit Create Fund Request
  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();

    let finalAmount = Number(formAmount) || 0;
    if (formCategory === 'payroll') {
      finalAmount = formPayrollItems.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
    } else if (formCategory === 'invoice') {
      finalAmount = formInvoiceDetails.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    }

    // Determine initial status based on source:
    // If PIC submission, status starts at 'pending_pic_review' for Finance Manager to check.
    // If Finance direct submission, submitted to 'pending_admin_approval'.
    const initialStatus =
      formSource === 'pic' ? 'pending_pic_review' : 'pending_admin_approval';

    createFundRequest({
      kategori: formCategory,
      sumber: formSource,
      picName: formSource === 'pic' ? formPicName || 'PIC Lapangan' : undefined,
      namaProyek:
        formCategory === 'operasional' || formCategory === 'reimburse'
          ? formProject
          : undefined,
      namaPemohon:
        formCategory === 'operasional' ||
        formCategory === 'reimburse' ||
        formCategory === 'pengadaan'
          ? formApplicant
          : undefined,
      jumlah: finalAmount,
      noRekTujuan:
        formCategory !== 'invoice' ? formAccountNo : undefined,
      bankTujuan:
        formCategory !== 'invoice' ? formBank : undefined,
      atasNamaTujuan:
        formCategory !== 'invoice' ? formAccountName : undefined,
      keterangan: formDescription,
      lampiranNama: formAttachmentName || `${formCategory}_lampiran_dokumen.pdf`,
      lampiranUrl: '#',
      // Payroll
      periodePayroll:
        formCategory === 'payroll' || formCategory === 'pajak'
          ? formPeriod
          : undefined,
      listingEmployee: formCategory === 'payroll' ? formPayrollItems : undefined,
      // Invoice
      tanggalInvoice: formCategory === 'invoice' ? formInvoiceDate : undefined,
      nomorInvoice: formCategory === 'invoice' ? formInvoiceNumber : undefined,
      judulInvoice: formCategory === 'invoice' ? formInvoiceTitle : undefined,
      tujuanInvoice: formCategory === 'invoice' ? formInvoiceTarget : undefined,
      detailTagihan: formCategory === 'invoice' ? formInvoiceDetails : undefined,
      status: initialStatus,
    });

    setIsCreateModalOpen(false);
  };

  // Payroll line item updater
  const handleUpdatePayrollItem = (idx: number, amount: number) => {
    const updated = [...formPayrollItems];
    updated[idx].jumlah = amount;
    setFormPayrollItems(updated);
  };

  // Invoice detail item updater
  const handleAddInvoiceItem = () => {
    const newItem: InvoiceDetailItem = {
      id: `invd-${Date.now()}`,
      deskripsi: '',
      qty: 1,
      hargaSatuan: 0,
      total: 0,
    };
    setFormInvoiceDetails([...formInvoiceDetails, newItem]);
  };

  const handleUpdateInvoiceItem = (idx: number, field: keyof InvoiceDetailItem, value: any) => {
    const updated = [...formInvoiceDetails];
    const item = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'hargaSatuan') {
      const q = field === 'qty' ? Number(value) : item.qty;
      const h = field === 'hargaSatuan' ? Number(value) : item.hargaSatuan;
      item.total = q * h;
    }
    updated[idx] = item;
    setFormInvoiceDetails(updated);
  };

  const handleRemoveInvoiceItem = (idx: number) => {
    setFormInvoiceDetails(formInvoiceDetails.filter((_, i) => i !== idx));
  };

  // Open Revision Modal
  const handleOpenRevision = (req: FundRequest) => {
    setSelectedRequest(req);
    setRevisedAmount(req.jumlah);
    setRevisedDescription(req.keterangan);
    setRevisedAttachment(req.lampiranNama || '');
    setRevisionNotes('');
    setRevisionModalOpen(true);
  };

  // Submit Revision
  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    reviseFundRequest(
      selectedRequest.id,
      {
        jumlah: Number(revisedAmount),
        keterangan: revisedDescription,
        lampiranNama: revisedAttachment || selectedRequest.lampiranNama,
      },
      revisionNotes || 'Telah disesuaikan sesuai instruksi catatan Admin.'
    );

    setRevisionModalOpen(false);
    setSelectedRequest(null);
  };

  // PIC Review handler
  const handleOpenPicReview = (req: FundRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setPicActionType(action);
    setPicRejectNotes('');
    setPicReviewModalOpen(true);
  };

  const handleConfirmPicReview = () => {
    if (!selectedRequest) return;
    reviewPicRequest(selectedRequest.id, picActionType, picRejectNotes);
    setPicReviewModalOpen(false);
    setSelectedRequest(null);
  };

  // Filter requests
  const filteredRequests = fundRequests.filter((req) => {
    // Filter Category
    if (activeTabCategory !== 'all' && req.kategori !== activeTabCategory) {
      return false;
    }
    // Filter Source
    if (activeFilterSource !== 'all' && req.sumber !== activeFilterSource) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = req.nomorPengajuan.toLowerCase().includes(q);
      const matchDesc = req.keterangan.toLowerCase().includes(q);
      const matchApplicant = req.namaPemohon?.toLowerCase().includes(q);
      const matchProject = req.namaProyek?.toLowerCase().includes(q);
      const matchPic = req.picName?.toLowerCase().includes(q);
      return matchNo || matchDesc || matchApplicant || matchProject || matchPic;
    }
    return true;
  });

  const getStatusBadge = (status: FundRequest['status']) => {
    switch (status) {
      case 'pending_pic_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Review PIC
          </span>
        );
      case 'pending_admin_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Menunggu Admin
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Disetujui (Siap Transfer)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Ditolak (Perlu Revisi)
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Check className="w-3 h-3" /> Selesai (Done)
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Primary CTA */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengajuan Dana</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pengajuan operasional, payroll, reimburse, pajak, pengadaan, dan invoice. Tersedia jalur input langsung Finance atau penerimaan dari PIC.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Baru</span>
        </button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        {/* Sub-Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: 'all', label: 'Semua Modul' },
            { id: 'operasional', label: 'Operasional' },
            { id: 'payroll', label: 'Payroll' },
            { id: 'reimburse', label: 'Reimburse' },
            { id: 'pajak', label: 'Pajak' },
            { id: 'pengadaan', label: 'Pengadaan' },
            { id: 'invoice', label: 'Invoice' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabCategory(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeTabCategory === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Source & Search Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sumber:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveFilterSource('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeFilterSource === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Sumber
              </button>
              <button
                onClick={() => setActiveFilterSource('finance')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeFilterSource === 'finance'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Internal Finance
              </button>
              <button
                onClick={() => setActiveFilterSource('pic')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeFilterSource === 'pic'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dari PIC
              </button>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nomor, proyek, pemohon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Pengajuan & Modul</th>
                <th className="py-3 px-4">Sumber & Pemohon</th>
                <th className="py-3 px-4">Proyek / Periode</th>
                <th className="py-3 px-4 text-right">Jumlah (Nominal)</th>
                <th className="py-3 px-4">Tujuan Rekening</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada pengajuan dana yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800">
                        {req.nomorPengajuan}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 capitalize">
                        {req.kategori}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {req.namaPemohon || req.picName || req.createdBy}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {req.sumber === 'pic' ? 'Pengajuan oleh PIC' : 'Internal Finance'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{req.namaProyek || req.periodePayroll || '-'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {req.keterangan}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(req.jumlah)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
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

                    <td className="py-3 px-4">
                      {getStatusBadge(req.status)}
                      {req.catatanPenolakan && (
                        <div className="text-[10px] text-red-600 mt-1 max-w-xs line-clamp-1 italic">
                          Catatan: {req.catatanPenolakan}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setDetailModalOpen(true);
                          }}
                          title="Lihat Detail & Lampiran"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* If Rejected by Admin -> Show Revision button */}
                        {req.status === 'rejected' && (
                          <button
                            onClick={() => handleOpenRevision(req)}
                            title="Revisi & Ajukan Ulang"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Revisi</span>
                          </button>
                        )}

                        {/* If from PIC pending review -> Finance Manager can Approve or Reject */}
                        {req.status === 'pending_pic_review' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenPicReview(req, 'approve')}
                              title="Setujui & Ajukan ke Admin"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold"
                            >
                              Ajukan ke Admin
                            </button>
                            <button
                              onClick={() => handleOpenPicReview(req, 'reject')}
                              title="Tolak PIC"
                              className="px-1.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-medium"
                            >
                              Tolak
                            </button>
                          </div>
                        )}

                        {/* Delete if pending or rejected */}
                        {(req.status === 'draft' || req.status === 'rejected') && (
                          <button
                            onClick={() => deleteFundRequest(req.id)}
                            title="Hapus"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* CREATE FUND REQUEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-2xl my-8 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Buat Pengajuan Dana Baru</h3>
                <p className="text-[11px] text-slate-500">
                  Lengkapi parameter formulir sesuai modul yang dipilih
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Category & Source Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modul Pengajuan Dana *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RequestCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="operasional">1. Operasional</option>
                    <option value="payroll">2. Payroll</option>
                    <option value="reimburse">3. Reimburse</option>
                    <option value="pajak">4. Pajak</option>
                    <option value="pengadaan">5. Pengadaan</option>
                    <option value="invoice">6. Invoice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sumber Pengajuan *
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as RequestSource)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="finance">Internal Finance Manager (Diajukan Langsung ke Admin)</option>
                    <option value="pic">Menerima dari PIC Lapangan (Menunggu Review Finance)</option>
                  </select>
                </div>
              </div>

              {/* If Source is PIC */}
              {formSource === 'pic' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Nama PIC Pembuat Pengajuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPicName}
                    onChange={(e) => setFormPicName(e.target.value)}
                    placeholder="Contoh: Hendra Wijaya (Project Manager Terniva)"
                    className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* CONDITIONAL FIELDS BASED ON MODULE */}

              {/* 1. OPERASIONAL & 3. REIMBURSE: [nama proyek (KawanEdu, Terniva, Scrava), Nama Pemohon, Jumlah, No. Rek Tujuan & Atas Nama, Keterangan, Lampiran] */}
              {(formCategory === 'operasional' || formCategory === 'reimburse') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Pemohon *
                      </label>
                      <input
                        type="text"
                        required
                        value={formApplicant}
                        onChange={(e) => setFormApplicant(e.target.value)}
                        placeholder="Contoh: Rizki Firmansyah"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jumlah (Rp) *
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bank Tujuan *
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        No. Rek Tujuan *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAccountNo}
                        onChange={(e) => setFormAccountNo(e.target.value)}
                        placeholder="1234567890"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Atas Nama Rekening Tujuan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAccountName}
                      onChange={(e) => setFormAccountName(e.target.value)}
                      placeholder="Contoh: PT Cloud Indo Perkasa / Nama Karyawan"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {/* 2. PAYROLL: [Periode, Jumlah Topup, Keterangan, Lampiran (Listing Employee [no, nama, no rekening, jumlah])] */}
              {formCategory === 'payroll' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Periode Payroll *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(e.target.value)}
                      placeholder="Contoh: Oktober 2026"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Listing Employee (Karyawan dari Database Admin)
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        Total Topup: {formatRupiah(formPayrollItems.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0))}
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-48 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                          <tr>
                            <th className="py-2 px-3">No</th>
                            <th className="py-2 px-3">Nama Karyawan</th>
                            <th className="py-2 px-3">Rekening & Bank</th>
                            <th className="py-2 px-3 text-right">Jumlah Gaji (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {formPayrollItems.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{item.nama}</td>
                              <td className="py-2 px-3 font-mono text-slate-600">
                                {item.bank} - {item.noRekening}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  value={item.jumlah}
                                  onChange={(e) => handleUpdatePayrollItem(idx, Number(e.target.value))}
                                  className="w-28 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-200 rounded"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PAJAK: [periode, jumlah, No. Rek Tujuan & Atas Nama, Keterangan, Lampiran] */}
              {formCategory === 'pajak' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Masa / Periode Pajak *
                      </label>
                      <input
                        type="text"
                        required
                        value={formPeriod}
                        onChange={(e) => setFormPeriod(e.target.value)}
                        placeholder="Contoh: Masa Pajak September 2026"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jumlah Pajak (Rp) *
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bank Persepsi *
                      </label>
                      <input
                        type="text"
                        required
                        value={formBank}
                        onChange={(e) => setFormBank(e.target.value)}
                        placeholder="Mandiri / BCA / BNI"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kode Billing / No. Rek *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAccountNo}
                        onChange={(e) => setFormAccountNo(e.target.value)}
                        placeholder="Kode Billing 15 Digit"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Atas Nama Tujuan *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAccountName}
                        onChange={(e) => setFormAccountName(e.target.value)}
                        placeholder="Kas Negara / KPP Pratama"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 5. PENGADAAN: [Pemohon, jumlah, No. Rek Tujuan & Atas Nama, Keterangan, Lampiran] */}
              {formCategory === 'pengadaan' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Pemohon Pengadaan *
                      </label>
                      <input
                        type="text"
                        required
                        value={formApplicant}
                        onChange={(e) => setFormApplicant(e.target.value)}
                        placeholder="Contoh: Bagas Aditya (Tim Teknis)"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jumlah (Rp) *
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bank Vendor *
                      </label>
                      <input
                        type="text"
                        required
                        value={formBank}
                        onChange={(e) => setFormBank(e.target.value)}
                        placeholder="BCA / Mandiri"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        No. Rek Vendor *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAccountNo}
                        onChange={(e) => setFormAccountNo(e.target.value)}
                        placeholder="No Rekening Vendor"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Atas Nama Vendor *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAccountName}
                        onChange={(e) => setFormAccountName(e.target.value)}
                        placeholder="CV / PT Vendor Toko"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 6. INVOICE: [Tanggal, Nomor, Judul, nominal, Tujuan, detail tagihan (CRUD)] */}
              {formCategory === 'invoice' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Invoice *
                      </label>
                      <input
                        type="date"
                        required
                        value={formInvoiceDate}
                        onChange={(e) => setFormInvoiceDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor Invoice *
                      </label>
                      <input
                        type="text"
                        required
                        value={formInvoiceNumber}
                        onChange={(e) => setFormInvoiceNumber(e.target.value)}
                        placeholder="INV-2026-XXX"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Judul Tagihan / Invoice *
                      </label>
                      <input
                        type="text"
                        required
                        value={formInvoiceTitle}
                        onChange={(e) => setFormInvoiceTitle(e.target.value)}
                        placeholder="Contoh: Pengadaan Lisensi Modul SD Cahaya"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tujuan Tagihan (Klien / Vendor) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formInvoiceTarget}
                        onChange={(e) => setFormInvoiceTarget(e.target.value)}
                        placeholder="Contoh: Yayasan Bina Insan Mandiri"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Detail Tagihan (CRUD) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Detail Item Tagihan (CRUD)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddInvoiceItem}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formInvoiceDetails.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <input
                            type="text"
                            placeholder="Deskripsi item..."
                            value={item.deskripsi}
                            onChange={(e) => handleUpdateInvoiceItem(idx, 'deskripsi', e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(e) => handleUpdateInvoiceItem(idx, 'qty', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-300 rounded"
                          />
                          <input
                            type="number"
                            placeholder="Harga"
                            value={item.hargaSatuan}
                            onChange={(e) => handleUpdateInvoiceItem(idx, 'hargaSatuan', Number(e.target.value))}
                            className="w-24 px-2 py-1 text-xs font-mono text-right border border-slate-300 rounded"
                          />
                          <div className="w-24 font-mono font-bold text-right text-slate-800">
                            {formatRupiah(item.total)}
                          </div>
                          {formInvoiceDetails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInvoiceItem(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 text-right text-xs font-mono font-bold text-slate-900">
                      Total Nominal Invoice: {formatRupiah(formInvoiceDetails.reduce((a, b) => a + b.total, 0))}
                    </div>
                  </div>
                </div>
              )}

              {/* General Keterangan & Lampiran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Lengkap *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan kebutuhan pengajuan dana secara rinci..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Dokumen Pendukung (PDF/JPG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    placeholder="Contoh: Invoice_AWS_KawanEdu.pdf atau kuitansi.jpg"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer text-xs font-medium flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFormAttachmentName(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Simpan & Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  {selectedRequest.kategori} · {selectedRequest.sumber.toUpperCase()}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedRequest.nomorPengajuan}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500">Total Nominal</div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {formatRupiah(selectedRequest.jumlah)}
                  </div>
                </div>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {/* Rejection / Note banner if rejected */}
              {selectedRequest.catatanPenolakan && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Catatan Penolakan dari Admin:
                  </div>
                  <p className="text-xs italic pl-5">"{selectedRequest.catatanPenolakan}"</p>
                </div>
              )}

              {/* Revision history */}
              {selectedRequest.riwayatRevisi && selectedRequest.riwayatRevisi.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-semibold text-blue-900 mb-1">Riwayat Catatan Revisi:</div>
                  {selectedRequest.riwayatRevisi.map((r, i) => (
                    <div key={i} className="text-[11px] text-blue-800 border-t border-blue-100 pt-1 mt-1">
                      <span className="font-mono text-[10px] text-blue-600">
                        {formatTanggalWaktu(r.tanggal)} ({r.oleh}):
                      </span>{' '}
                      {r.catatan}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400">Pemohon / PIC:</span>
                  <div className="font-medium text-slate-800">
                    {selectedRequest.namaPemohon || selectedRequest.picName || selectedRequest.createdBy}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Proyek / Periode:</span>
                  <div className="font-medium text-slate-800">
                    {selectedRequest.namaProyek || selectedRequest.periodePayroll || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Tanggal Pengajuan:</span>
                  <div className="font-medium text-slate-800">
                    {formatTanggalWaktu(selectedRequest.createdAt)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Tujuan Transfer:</span>
                  <div className="font-medium text-slate-800 font-mono">
                    {selectedRequest.noRekTujuan
                      ? `${selectedRequest.bankTujuan} - ${selectedRequest.noRekTujuan} (${selectedRequest.atasNamaTujuan})`
                      : selectedRequest.tujuanInvoice || '-'}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Keterangan:</span>
                <p className="mt-0.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedRequest.keterangan}
                </p>
              </div>

              {/* If Payroll Listing */}
              {selectedRequest.listingEmployee && (
                <div>
                  <div className="font-semibold text-slate-700 mb-1">
                    Daftar Karyawan ({selectedRequest.listingEmployee.length} orang):
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-2">No</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Rekening</th>
                          <th className="p-2 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {selectedRequest.listingEmployee.map((e, idx) => (
                          <tr key={idx}>
                            <td className="p-2">{idx + 1}</td>
                            <td className="p-2 font-sans font-medium">{e.nama}</td>
                            <td className="p-2">
                              {e.bank} {e.noRekening}
                            </td>
                            <td className="p-2 text-right font-bold">{formatRupiah(e.jumlah)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* If Invoice Details */}
              {selectedRequest.detailTagihan && (
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Detail Tagihan Invoice:</div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-2">Deskripsi</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Harga</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRequest.detailTagihan.map((d, idx) => (
                          <tr key={idx}>
                            <td className="p-2">{d.deskripsi}</td>
                            <td className="p-2 text-center">{d.qty}</td>
                            <td className="p-2 text-right font-mono">{formatRupiah(d.hargaSatuan)}</td>
                            <td className="p-2 text-right font-mono font-bold">{formatRupiah(d.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Lampiran preview */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">
                    {selectedRequest.lampiranNama || 'Dokumen_Lampiran.pdf'}
                  </span>
                </div>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Unduh / Lihat Dokumen
                </span>
              </div>

              {/* Bukti transfer if done */}
              {selectedRequest.status === 'done' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                  <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Status Selesai: Bukti Transfer Terlampir
                  </div>
                  <div className="text-[11px]">
                    Nama File Bukti: <span className="font-mono">{selectedRequest.buktiTransferNama}</span>
                  </div>
                  <div className="text-[11px]">
                    Tanggal Transfer: {formatTanggal(selectedRequest.tanggalTransfer || '')}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION MODAL */}
      {revisionModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-red-900 text-sm">
                  Revisi Pengajuan: {selectedRequest.nomorPengajuan}
                </h3>
                <p className="text-[11px] text-red-700">
                  Perbaiki data sesuai instruksi penolakan Admin lalu ajukan ulang
                </p>
              </div>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-800">
                <span className="font-semibold">Alasan Penolakan Admin:</span>
                <p className="italic mt-0.5">"{selectedRequest.catatanPenolakan}"</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sesuaikan Jumlah (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={revisedAmount}
                  onChange={(e) => setRevisedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Tambahan / Penyesuaian *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisedDescription}
                  onChange={(e) => setRevisedDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perbarui Lampiran (Kuitansi / Perbandingan Vendor Baru)
                </label>
                <input
                  type="text"
                  value={revisedAttachment}
                  onChange={(e) => setRevisedAttachment(e.target.value)}
                  placeholder="Nama dokumen perbaikan baru..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Revisi untuk Admin *
                </label>
                <input
                  type="text"
                  required
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Contoh: Sudah dilampirkan perbandingan 2 vendor dan harga disesuaikan."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Kirim Revisi ke Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIC REVIEW MODAL */}
      {picReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {picActionType === 'approve'
                  ? 'Verifikasi & Teruskan ke Admin'
                  : 'Tolak Pengajuan PIC'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Pengajuan dari PIC: {selectedRequest.picName} ({selectedRequest.nomorPengajuan})
              </p>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500">Kebutuhan:</div>
                <div className="font-medium text-slate-800">{selectedRequest.keterangan}</div>
                <div className="mt-1 font-mono font-bold text-slate-900">
                  {formatRupiah(selectedRequest.jumlah)}
                </div>
              </div>

              {picActionType === 'reject' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Penolakan ke PIC *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={picRejectNotes}
                    onChange={(e) => setPicRejectNotes(e.target.value)}
                    placeholder="Tuliskan catatan kenapa pengajuan ini ditolak..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                {picActionType === 'approve'
                  ? 'Setelah disetujui oleh Finance Manager, pengajuan ini akan diteruskan ke antrean Approval Role Admin.'
                  : 'Pengajuan akan dikembalikan ke status ditolak.'}
              </p>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setPicReviewModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmPicReview}
                  className={`px-4 py-1.5 font-semibold text-white rounded-lg shadow-xs ${
                    picActionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {picActionType === 'approve' ? 'Teruskan ke Admin' : 'Konfirmasi Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
