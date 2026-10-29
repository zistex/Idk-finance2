export type UserRole = 'admin' | 'finance_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  nama: string;
  noRek: string;
  bank: string;
  atasNama: string;
  lampiranKtpUrl?: string;
  createdAt: string;
}

export interface IncomeCategory {
  id: string;
  keterangan: string;
}

export interface Project {
  id: string;
  nama: string; // e.g. KawanEdu, Terniva, Scrava
  kode: string;
  noRekBank: string;
  bankName: string;
  atasNama: string;
  deskripsi?: string;
}

export type RequestCategory = 'operasional' | 'payroll' | 'reimburse' | 'pajak' | 'pengadaan' | 'invoice';

export type RequestSource = 'finance' | 'pic';

export type RequestStatus = 
  | 'draft'
  | 'pending_pic_review'     // Dari PIC, menunggu review Finance
  | 'pending_admin_approval' // Menunggu approval Admin
  | 'approved'               // Disetujui Admin, siap ditransfer
  | 'rejected'               // Ditolak (oleh Finance atau Admin) dengan catatan revisi
  | 'done';                  // Bukti transfer sudah diupload

export interface InvoiceDetailItem {
  id: string;
  deskripsi: string;
  qty: number;
  hargaSatuan: number;
  total: number;
}

export interface PayrollEmployeeItem {
  id: string;
  employeeId?: string;
  no: number;
  nama: string;
  noRekening: string;
  bank: string;
  jumlah: number;
}

export interface FundRequest {
  id: string;
  nomorPengajuan: string;
  kategori: RequestCategory;
  sumber: RequestSource;
  picName?: string;
  
  // Specific fields
  namaProyek?: string; // Operasional, Reimburse
  namaPemohon?: string; // Operasional, Reimburse, Pengadaan
  jumlah: number;
  noRekTujuan?: string; // Operasional, Reimburse, Pajak, Pengadaan
  bankTujuan?: string;
  atasNamaTujuan?: string; // Operasional, Reimburse, Pajak, Pengadaan
  keterangan: string;
  lampiranUrl?: string; // pdf / jpg placeholder or uploaded data url
  lampiranNama?: string;
  
  // Payroll specific
  periodePayroll?: string; // Payroll, Pajak
  listingEmployee?: PayrollEmployeeItem[]; // Payroll listing
  
  // Invoice specific
  tanggalInvoice?: string;
  nomorInvoice?: string;
  judulInvoice?: string;
  nominal?: number;
  tujuanInvoice?: string;
  detailTagihan?: InvoiceDetailItem[];
  
  // Approval & Transfer Flow
  status: RequestStatus;
  catatanPenolakan?: string;
  alasanRevisi?: string;
  riwayatRevisi?: {
    tanggal: string;
    catatan: string;
    oleh: string;
  }[];
  
  // Bukti Transfer
  buktiTransferUrl?: string;
  buktiTransferNama?: string;
  tanggalTransfer?: string;
  disbursedBy?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface GroupDisbursementDetail {
  id: string;
  employeeId: string;
  nama: string;
  noRek: string;
  bank: string;
  nominal: number;
}

export interface GroupDisbursement {
  id: string;
  judul: string;
  keterangan?: string;
  details: GroupDisbursementDetail[];
  totalNominal: number;
  createdAt: string;
}

export interface DisbursementExecution {
  id: string;
  tanggal: string;
  judul: string;
  groupDisbursementId: string;
  groupJudul: string;
  totalNominal: number;
  itemCount: number;
  createdAt: string;
  createdBy: string;
}

export interface IncomeRecord {
  id: string;
  namaProyek: string; // KawanEdu, Terniva, Scrava
  hariTanggal: string;
  kategoriId: string;
  kategoriKeterangan: string; // e.g. Pembayaran SPP, Pembayaran Pendaftaran
  metodePembayaran: 'TF' | 'Cash';
  noRekTujuan?: string; // otomatis ketika dipilih nama proyek jika TF
  namaPengirim: string; // nama pengirim jika TF atau Cash
  jumlah: number;
  keterangan: string;
  createdAt: string;
  createdBy: string;
}

export interface Transaction {
  id: string;
  tanggal: string;
  namaProyek: string;
  judul: string;
  status: 'done' | 'pending' | 'canceled';
  kategoriTransaksi: 'uang_masuk' | 'uang_keluar';
  jenis: string; // e.g. Pembayaran SPP, Operasional, Payroll, Reimburse, etc.
  nominal: number;
  referensiId?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole | 'system';
  action: string;
  detail: string;
  ipAddress?: string;
}

export interface ApiSettings {
  apiKey: string;
  secretKey: string;
  lastGeneratedAt: string;
  generatedBy: string;
}
