import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure data folder exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'database.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// -----------------------------------------------------------------------------
// Database Initialization & Schema
// -----------------------------------------------------------------------------
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'finance_manager')),
      phone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      bank TEXT NOT NULL,
      no_rek TEXT NOT NULL,
      atas_nama TEXT NOT NULL,
      lampiran_ktp_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      nama TEXT UNIQUE NOT NULL,
      kode TEXT UNIQUE NOT NULL,
      bank_name TEXT NOT NULL,
      no_rek_bank TEXT NOT NULL,
      atas_nama TEXT NOT NULL,
      deskripsi TEXT
    );

    CREATE TABLE IF NOT EXISTS income_categories (
      id TEXT PRIMARY KEY,
      keterangan TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fund_requests (
      id TEXT PRIMARY KEY,
      nomor_pengajuan TEXT UNIQUE NOT NULL,
      kategori TEXT NOT NULL,
      sumber TEXT NOT NULL DEFAULT 'finance',
      pic_name TEXT,
      nama_proyek TEXT,
      nama_pemohon TEXT,
      jumlah REAL NOT NULL DEFAULT 0,
      bank_tujuan TEXT,
      no_rek_tujuan TEXT,
      atas_nama_tujuan TEXT,
      keterangan TEXT NOT NULL,
      lampiran_url TEXT,
      lampiran_nama TEXT,
      periode_payroll TEXT,
      tanggal_invoice TEXT,
      nomor_invoice TEXT,
      judul_invoice TEXT,
      nominal_invoice REAL,
      tujuan_invoice TEXT,
      status TEXT NOT NULL DEFAULT 'pending_admin_approval',
      catatan_penolakan TEXT,
      alasan_revisi TEXT,
      bukti_transfer_nama TEXT,
      bukti_transfer_url TEXT,
      tanggal_transfer TEXT,
      disbursed_by TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      listing_employee TEXT,
      detail_tagihan TEXT,
      riwayat_revisi TEXT
    );

    CREATE TABLE IF NOT EXISTS group_disbursements (
      id TEXT PRIMARY KEY,
      judul TEXT NOT NULL,
      keterangan TEXT,
      total_nominal REAL NOT NULL DEFAULT 0,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disbursement_executions (
      id TEXT PRIMARY KEY,
      tanggal TEXT NOT NULL,
      judul TEXT NOT NULL,
      group_disbursement_id TEXT NOT NULL,
      group_judul TEXT NOT NULL,
      total_nominal REAL NOT NULL,
      item_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS income_records (
      id TEXT PRIMARY KEY,
      nama_proyek TEXT NOT NULL,
      hari_tanggal TEXT NOT NULL,
      kategori_id TEXT NOT NULL,
      kategori_keterangan TEXT NOT NULL,
      metode_pembayaran TEXT NOT NULL CHECK(metode_pembayaran IN ('TF', 'Cash')),
      no_rek_tujuan TEXT,
      nama_pengirim TEXT NOT NULL,
      jumlah REAL NOT NULL,
      keterangan TEXT NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      tanggal TEXT NOT NULL,
      nama_proyek TEXT NOT NULL,
      judul TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'done',
      kategori_transaksi TEXT NOT NULL CHECK(kategori_transaksi IN ('uang_masuk', 'uang_keluar')),
      jenis TEXT NOT NULL,
      nominal REAL NOT NULL,
      referensi_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      ip_address TEXT
    );

    CREATE TABLE IF NOT EXISTS api_settings (
      id TEXT PRIMARY KEY,
      api_key TEXT NOT NULL,
      secret_key TEXT NOT NULL,
      last_generated_at TEXT NOT NULL,
      generated_by TEXT NOT NULL
    );
  `);

  // Seed default data if users table is empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, phone, created_at)
    VALUES (@id, @name, @email, @password, @role, @phone, @created_at)
  `);

  insertUser.run({
    id: 'usr-1',
    name: 'Budi Santoso',
    email: 'admin@inovasidigital.id',
    password: 'admin123',
    role: 'admin',
    phone: '081234567890',
    created_at: '2026-01-01T08:00:00Z',
  });

  insertUser.run({
    id: 'usr-2',
    name: 'Siti Rahmawati',
    email: 'finance@inovasidigital.id',
    password: 'finance123',
    role: 'finance_manager',
    phone: '081298765432',
    created_at: '2026-01-01T08:00:00Z',
  });

  // Projects
  const insertProject = db.prepare(`
    INSERT INTO projects (id, nama, kode, bank_name, no_rek_bank, atas_nama, deskripsi)
    VALUES (@id, @nama, @kode, @bank_name, @no_rek_bank, @atas_nama, @deskripsi)
  `);

  insertProject.run({
    id: 'prj-1',
    nama: 'KawanEdu',
    kode: 'KWE',
    bank_name: 'BCA',
    no_rek_bank: 'BCA 8820-192-881',
    atas_nama: 'PT Inovasi Digital Kreasi',
    deskripsi: 'Platform ekosistem pembelajaran digital terpadu sekolah dan madrasah.',
  });

  insertProject.run({
    id: 'prj-2',
    nama: 'Terniva',
    kode: 'TRN',
    bank_name: 'Mandiri',
    no_rek_bank: 'Mandiri 137-00-1928374-1',
    atas_nama: 'PT Inovasi Digital Kreasi',
    deskripsi: 'Sistem cerdas manajemen peternakan dan agrikultur modern.',
  });

  insertProject.run({
    id: 'prj-3',
    nama: 'Scrava',
    kode: 'SCR',
    bank_name: 'BNI',
    no_rek_bank: 'BNI 0928-182-990',
    atas_nama: 'PT Inovasi Digital Kreasi',
    deskripsi: 'Aplikasi otomasi pencatatan kreatif, inventory, dan marketplace.',
  });

  // Income Categories
  const insertCategory = db.prepare('INSERT INTO income_categories (id, keterangan) VALUES (?, ?)');
  insertCategory.run('cat-1', 'Pembayaran SPP');
  insertCategory.run('cat-2', 'Pembayaran Pendaftaran');
  insertCategory.run('cat-3', 'Sponsorship & Hibah Riset');
  insertCategory.run('cat-4', 'Langganan Lisensi Software (SaaS)');

  // Employees
  const insertEmployee = db.prepare(`
    INSERT INTO employees (id, nama, bank, no_rek, atas_nama, lampiran_ktp_url, created_at)
    VALUES (@id, @nama, @bank, @no_rek, @atas_nama, @lampiran_ktp_url, @created_at)
  `);

  insertEmployee.run({
    id: 'emp-1',
    nama: 'Ahmad Dahlan',
    bank: 'BCA',
    no_rek: '8820192811',
    atas_nama: 'Ahmad Dahlan',
    lampiran_ktp_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
    created_at: '2026-01-02T10:00:00Z',
  });

  insertEmployee.run({
    id: 'emp-2',
    nama: 'Dewi Sartika',
    bank: 'Mandiri',
    no_rek: '1370019283742',
    atas_nama: 'Dewi Sartika',
    lampiran_ktp_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    created_at: '2026-01-02T10:00:00Z',
  });

  insertEmployee.run({
    id: 'emp-3',
    nama: 'Budi Prakoso',
    bank: 'BCA',
    no_rek: '8820394812',
    atas_nama: 'Budi Prakoso',
    lampiran_ktp_url: '',
    created_at: '2026-01-02T10:00:00Z',
  });

  insertEmployee.run({
    id: 'emp-4',
    nama: 'Siti Aisyah',
    bank: 'BNI',
    no_rek: '0928182991',
    atas_nama: 'Siti Aisyah',
    lampiran_ktp_url: '',
    created_at: '2026-01-02T10:00:00Z',
  });

  insertEmployee.run({
    id: 'emp-5',
    nama: 'Rian Hidayat',
    bank: 'BRI',
    no_rek: '0129018291823',
    atas_nama: 'Rian Hidayat',
    lampiran_ktp_url: '',
    created_at: '2026-01-02T10:00:00Z',
  });

  // Fund Requests
  const insertReq = db.prepare(`
    INSERT INTO fund_requests (
      id, nomor_pengajuan, kategori, sumber, pic_name, nama_proyek, nama_pemohon, jumlah,
      bank_tujuan, no_rek_tujuan, atas_nama_tujuan, keterangan, lampiran_url, lampiran_nama,
      periode_payroll, tanggal_invoice, nomor_invoice, judul_invoice, nominal_invoice,
      tujuan_invoice, status, catatan_penolakan, alasan_revisi, bukti_transfer_nama,
      bukti_transfer_url, tanggal_transfer, disbursed_by, created_by, created_at, updated_at,
      listing_employee, detail_tagihan, riwayat_revisi
    ) VALUES (
      @id, @nomor_pengajuan, @kategori, @sumber, @pic_name, @nama_proyek, @nama_pemohon, @jumlah,
      @bank_tujuan, @no_rek_tujuan, @atas_nama_tujuan, @keterangan, @lampiran_url, @lampiran_nama,
      @periode_payroll, @tanggal_invoice, @nomor_invoice, @judul_invoice, @nominal_invoice,
      @tujuan_invoice, @status, @catatan_penolakan, @alasan_revisi, @bukti_transfer_nama,
      @bukti_transfer_url, @tanggal_transfer, @disbursed_by, @created_by, @created_at, @updated_at,
      @listing_employee, @detail_tagihan, @riwayat_revisi
    )
  `);

  insertReq.run({
    id: 'req-1',
    nomor_pengajuan: 'ND-OPR-202610-001',
    kategori: 'operasional',
    sumber: 'finance',
    pic_name: null,
    nama_proyek: 'KawanEdu',
    nama_pemohon: 'Hendra Wijaya',
    jumlah: 4500000,
    bank_tujuan: 'BCA',
    no_rek_tujuan: '8820192811',
    atas_nama_tujuan: 'PT AWS Indonesia Cloud',
    keterangan: 'Pembayaran tagihan server cloud production AWS bulan Oktober 2026',
    lampiran_url: 'https://storage.inovasidigital.id/docs/invoice_aws_oct2026.pdf',
    lampiran_nama: 'invoice_aws_oct2026.pdf',
    periode_payroll: null,
    tanggal_invoice: null,
    nomor_invoice: null,
    judul_invoice: null,
    nominal_invoice: null,
    tujuan_invoice: null,
    status: 'pending_admin_approval',
    catatan_penolakan: null,
    alasan_revisi: null,
    bukti_transfer_nama: null,
    bukti_transfer_url: null,
    tanggal_transfer: null,
    disbursed_by: null,
    created_by: 'Siti Rahmawati',
    created_at: '2026-10-01T09:30:00Z',
    updated_at: '2026-10-01T09:30:00Z',
    listing_employee: null,
    detail_tagihan: null,
    riwayat_revisi: null,
  });

  const payrollListing = JSON.stringify([
    { id: 'pitem-1', employeeId: 'emp-1', no: 1, nama: 'Ahmad Dahlan', noRekening: '8820192811', bank: 'BCA', jumlah: 7500000 },
    { id: 'pitem-2', employeeId: 'emp-2', no: 2, nama: 'Dewi Sartika', noRekening: '1370019283742', bank: 'Mandiri', jumlah: 6500000 },
    { id: 'pitem-3', employeeId: 'emp-3', no: 3, nama: 'Budi Prakoso', noRekening: '8820394812', bank: 'BCA', jumlah: 4500000 },
  ]);

  insertReq.run({
    id: 'req-2',
    nomor_pengajuan: 'ND-PAY-202610-002',
    kategori: 'payroll',
    sumber: 'finance',
    pic_name: null,
    nama_proyek: 'KawanEdu',
    nama_pemohon: 'Finance Divisi',
    jumlah: 18500000,
    bank_tujuan: 'BCA',
    no_rek_tujuan: '8820192811',
    atas_nama_tujuan: 'Multi Rekening Payroll',
    keterangan: 'Pencairan gaji bulanan 3 developer KawanEdu periode Oktober 2026',
    lampiran_url: 'https://storage.inovasidigital.id/docs/rekap_payroll_kwe_oct.pdf',
    lampiran_nama: 'rekap_payroll_kwe_oct.pdf',
    periode_payroll: 'Oktober 2026',
    tanggal_invoice: null,
    nomor_invoice: null,
    judul_invoice: null,
    nominal_invoice: null,
    tujuan_invoice: null,
    status: 'approved',
    catatan_penolakan: null,
    alasan_revisi: null,
    bukti_transfer_nama: null,
    bukti_transfer_url: null,
    tanggal_transfer: null,
    disbursed_by: null,
    created_by: 'Siti Rahmawati',
    created_at: '2026-10-02T10:00:00Z',
    updated_at: '2026-10-02T11:15:00Z',
    listing_employee: payrollListing,
    detail_tagihan: null,
    riwayat_revisi: null,
  });

  insertReq.run({
    id: 'req-3',
    nomor_pengajuan: 'ND-RMB-202610-003',
    kategori: 'reimburse',
    sumber: 'pic',
    pic_name: 'Irfan Maulana (PIC)',
    nama_proyek: 'Terniva',
    nama_pemohon: 'Irfan Maulana',
    jumlah: 1250000,
    bank_tujuan: 'Mandiri',
    no_rek_tujuan: '1370019283742',
    atas_nama_tujuan: 'Irfan Maulana',
    keterangan: 'Reimburse bahan pakan uji coba IoT dan transport lapangan peternakan Subang',
    lampiran_url: 'https://storage.inovasidigital.id/docs/struk_pakan_lapangan.jpg',
    lampiran_nama: 'struk_pakan_lapangan.jpg',
    periode_payroll: null,
    tanggal_invoice: null,
    nomor_invoice: null,
    judul_invoice: null,
    nominal_invoice: null,
    tujuan_invoice: null,
    status: 'pending_pic_review',
    catatan_penolakan: null,
    alasan_revisi: null,
    bukti_transfer_nama: null,
    bukti_transfer_url: null,
    tanggal_transfer: null,
    disbursed_by: null,
    created_by: 'Irfan Maulana (PIC)',
    created_at: '2026-10-03T14:20:00Z',
    updated_at: '2026-10-03T14:20:00Z',
    listing_employee: null,
    detail_tagihan: null,
    riwayat_revisi: null,
  });

  insertReq.run({
    id: 'req-4',
    nomor_pengajuan: 'ND-TAX-202610-004',
    kategori: 'pajak',
    sumber: 'finance',
    pic_name: null,
    nama_proyek: 'KawanEdu',
    nama_pemohon: 'Finance Divisi',
    jumlah: 3200000,
    bank_tujuan: 'Bank Persepsi (Mandiri)',
    no_rek_tujuan: '1370000998822',
    atas_nama_tujuan: 'Kas Negara PPh 21',
    keterangan: 'Setoran Masa PPh Pasal 21 dan PPh Final UMKM bulan September 2026',
    lampiran_url: 'https://storage.inovasidigital.id/docs/ebilling_pph21_sep.pdf',
    lampiran_nama: 'ebilling_pph21_sep.pdf',
    periode_payroll: 'September 2026',
    tanggal_invoice: null,
    nomor_invoice: null,
    judul_invoice: null,
    nominal_invoice: null,
    tujuan_invoice: null,
    status: 'done',
    catatan_penolakan: null,
    alasan_revisi: null,
    bukti_transfer_nama: 'bilyet_ebilling_pajak.pdf',
    bukti_transfer_url: 'https://storage.inovasidigital.id/bukti/bilyet_ebilling_pajak.pdf',
    tanggal_transfer: '2026-10-04',
    disbursed_by: 'Siti Rahmawati',
    created_by: 'Siti Rahmawati',
    created_at: '2026-10-04T08:30:00Z',
    updated_at: '2026-10-04T13:00:00Z',
    listing_employee: null,
    detail_tagihan: null,
    riwayat_revisi: null,
  });

  // Group Disbursements
  const insertGroup = db.prepare(`
    INSERT INTO group_disbursements (id, judul, keterangan, total_nominal, details, created_at)
    VALUES (@id, @judul, @keterangan, @total_nominal, @details, @created_at)
  `);

  const groupDetails = JSON.stringify([
    { id: 'gdetail-1', employeeId: 'emp-1', nama: 'Ahmad Dahlan', noRek: '8820192811', bank: 'BCA', nominal: 7500000 },
    { id: 'gdetail-2', employeeId: 'emp-2', nama: 'Dewi Sartika', noRek: '1370019283742', bank: 'Mandiri', nominal: 6500000 },
  ]);

  insertGroup.run({
    id: 'grp-1',
    judul: 'Payroll Tim Pengembang KawanEdu',
    keterangan: 'Grup pencairan rutin akhir bulan engineer proyek KawanEdu',
    total_nominal: 14000000,
    details: groupDetails,
    created_at: '2026-10-01T11:00:00Z',
  });

  // Income Records
  const insertIncome = db.prepare(`
    INSERT INTO income_records (
      id, nama_proyek, hari_tanggal, kategori_id, kategori_keterangan,
      metode_pembayaran, no_rek_tujuan, nama_pengirim, jumlah, keterangan,
      created_at, created_by
    ) VALUES (
      @id, @nama_proyek, @hari_tanggal, @kategori_id, @kategori_keterangan,
      @metode_pembayaran, @no_rek_tujuan, @nama_pengirim, @jumlah, @keterangan,
      @created_at, @created_by
    )
  `);

  insertIncome.run({
    id: 'inc-1',
    nama_proyek: 'KawanEdu',
    hari_tanggal: 'Senin, 2026-10-05',
    kategori_id: 'cat-1',
    kategori_keterangan: 'Pembayaran SPP',
    metode_pembayaran: 'TF',
    no_rek_tujuan: 'BCA 8820-192-881',
    nama_pengirim: 'Yayasan Pendidikan Al-Falah',
    jumlah: 15000000,
    keterangan: 'Pembayaran SPP & modul 250 siswa periode Oktober 2026',
    created_at: '2026-10-05T10:15:00Z',
    created_by: 'Siti Rahmawati',
  });

  insertIncome.run({
    id: 'inc-2',
    nama_proyek: 'Terniva',
    hari_tanggal: 'Selasa, 2026-10-06',
    kategori_id: 'cat-2',
    kategori_keterangan: 'Pembayaran Pendaftaran',
    metode_pembayaran: 'Cash',
    no_rek_tujuan: null,
    nama_pengirim: 'Kelompok Ternak Barokah Jaya',
    jumlah: 2500000,
    keterangan: 'Pendaftaran 10 unit kandang telemetry IoT mitra peternakan',
    created_at: '2026-10-06T14:30:00Z',
    created_by: 'Siti Rahmawati',
  });

  // Transactions
  const insertTrx = db.prepare(`
    INSERT INTO transactions (id, tanggal, nama_proyek, judul, status, kategori_transaksi, jenis, nominal, referensi_id, created_at)
    VALUES (@id, @tanggal, @nama_proyek, @judul, @status, @kategori_transaksi, @jenis, @nominal, @referensi_id, @created_at)
  `);

  insertTrx.run({
    id: 'trx-1',
    tanggal: '2026-10-04',
    nama_proyek: 'KawanEdu',
    judul: 'Setoran Masa Pajak PPh Pasal 21',
    status: 'done',
    kategori_transaksi: 'uang_keluar',
    jenis: 'Pajak Perusahaan',
    nominal: 3200000,
    referensi_id: 'req-4',
    created_at: '2026-10-04T13:00:00Z',
  });

  insertTrx.run({
    id: 'trx-2',
    tanggal: '2026-10-05',
    nama_proyek: 'KawanEdu',
    judul: 'Pembayaran SPP Yayasan Al-Falah',
    status: 'done',
    kategori_transaksi: 'uang_masuk',
    jenis: 'Pembayaran SPP',
    nominal: 15000000,
    referensi_id: 'inc-1',
    created_at: '2026-10-05T10:15:00Z',
  });

  // System Logs
  const insertLog = db.prepare(`
    INSERT INTO system_logs (id, timestamp, user_name, role, action, detail, ip_address)
    VALUES (@id, @timestamp, @user_name, @role, @action, @detail, @ip_address)
  `);

  insertLog.run({
    id: 'log-1',
    timestamp: '2026-10-04T08:30:00Z',
    user_name: 'Siti Rahmawati',
    role: 'finance_manager',
    action: 'CREATE_PENGAJUAN',
    detail: 'Membuat pengajuan dana ND-TAX-202610-004 Rp 3.200.000',
    ip_address: '192.168.1.45',
  });

  insertLog.run({
    id: 'log-2',
    timestamp: '2026-10-04T10:00:00Z',
    user_name: 'Budi Santoso',
    role: 'admin',
    action: 'APPROVE_PENGAJUAN',
    detail: 'Menyetujui pengajuan dana ND-TAX-202610-004',
    ip_address: '192.168.1.10',
  });

  insertLog.run({
    id: 'log-3',
    timestamp: '2026-10-04T13:00:00Z',
    user_name: 'Siti Rahmawati',
    role: 'finance_manager',
    action: 'UPLOAD_BUKTI_TRANSFER',
    detail: 'Mengunggah bukti transfer pengajuan ND-TAX-202610-004',
    ip_address: '192.168.1.45',
  });

  // API Settings
  const insertSettings = db.prepare(`
    INSERT INTO api_settings (id, api_key, secret_key, last_generated_at, generated_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSettings.run(
    'cred-1',
    'idk_live_9a8f7e6d5c4b3a21e0f9',
    'idk_sec_4f8e1a9c2b3d7e6f8a0b1c2d3e4f5a6b',
    '2026-10-01T08:00:00Z',
    'Budi Santoso'
  );
}

// Initialize database
initDatabase();

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function mapFundRequestRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    nomorPengajuan: row.nomor_pengajuan,
    kategori: row.kategori,
    sumber: row.sumber,
    picName: row.pic_name || undefined,
    namaProyek: row.nama_proyek || undefined,
    namaPemohon: row.nama_pemohon || undefined,
    jumlah: Number(row.jumlah),
    bankTujuan: row.bank_tujuan || undefined,
    noRekTujuan: row.no_rek_tujuan || undefined,
    atasNamaTujuan: row.atas_nama_tujuan || undefined,
    keterangan: row.keterangan,
    lampiranUrl: row.lampiran_url || undefined,
    lampiranNama: row.lampiran_nama || undefined,
    periodePayroll: row.periode_payroll || undefined,
    tanggalInvoice: row.tanggal_invoice || undefined,
    nomorInvoice: row.nomor_invoice || undefined,
    judulInvoice: row.judul_invoice || undefined,
    nominal: row.nominal_invoice != null ? Number(row.nominal_invoice) : undefined,
    tujuanInvoice: row.tujuan_invoice || undefined,
    status: row.status,
    catatanPenolakan: row.catatan_penolakan || undefined,
    alasanRevisi: row.alasan_revisi || undefined,
    buktiTransferNama: row.bukti_transfer_nama || undefined,
    buktiTransferUrl: row.bukti_transfer_url || undefined,
    tanggalTransfer: row.tanggal_transfer || undefined,
    disbursedBy: row.disbursed_by || undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listingEmployee: row.listing_employee ? JSON.parse(row.listing_employee) : undefined,
    detailTagihan: row.detail_tagihan ? JSON.parse(row.detail_tagihan) : undefined,
    riwayatRevisi: row.riwayat_revisi ? JSON.parse(row.riwayat_revisi) : undefined,
  };
}

function mapEmployeeRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    nama: row.nama,
    bank: row.bank,
    noRek: row.no_rek,
    atasNama: row.atas_nama,
    lampiranKtpUrl: row.lampiran_ktp_url || undefined,
    createdAt: row.created_at,
  };
}

function mapProjectRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    nama: row.nama,
    kode: row.kode,
    bankName: row.bank_name,
    noRekBank: row.no_rek_bank,
    atasNama: row.atas_nama,
    deskripsi: row.deskripsi || undefined,
  };
}

function mapIncomeRecordRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    namaProyek: row.nama_proyek,
    hariTanggal: row.hari_tanggal,
    kategoriId: row.kategori_id,
    kategoriKeterangan: row.kategori_keterangan,
    metodePembayaran: row.metode_pembayaran,
    noRekTujuan: row.no_rek_tujuan || undefined,
    namaPengirim: row.nama_pengirim,
    jumlah: Number(row.jumlah),
    keterangan: row.keterangan,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function mapTransactionRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    tanggal: row.tanggal,
    namaProyek: row.nama_proyek,
    judul: row.judul,
    status: row.status,
    kategoriTransaksi: row.kategori_transaksi,
    jenis: row.jenis,
    nominal: Number(row.nominal),
    referensiId: row.referensi_id || undefined,
  };
}

function mapLogRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    timestamp: row.timestamp,
    user: row.user_name,
    role: row.role,
    action: row.action,
    detail: row.detail,
    ipAddress: row.ip_address || undefined,
  };
}

function createLog(action: string, detail: string, userName = 'System', role = 'system', ip = '127.0.0.1') {
  const stmt = db.prepare(`
    INSERT INTO system_logs (id, timestamp, user_name, role, action, detail, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(`log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, new Date().toISOString(), userName, role, action, detail, ip);
}

// -----------------------------------------------------------------------------
// REST API Routes
// -----------------------------------------------------------------------------

// --- AUTH ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Email atau password tidak valid' });
  }

  createLog('USER_LOGIN', `User ${user.name} (${user.role}) berhasil masuk ke sistem.`, user.name, user.role, req.ip || '127.0.0.1');

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    createdAt: user.created_at,
  });
});

// --- USERS ---
app.get('/api/users', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT id, name, email, password, role, phone, created_at FROM users ORDER BY created_at DESC').all() as any[];
  const users = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
    phone: u.phone || undefined,
    createdAt: u.created_at,
  }));
  res.json(users);
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  const id = `usr-${Date.now()}`;
  const createdAt = new Date().toISOString();

  try {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, role, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, email, password, role, phone || null, createdAt);

    createLog('ADD_USER', `Menambahkan pengguna baru: ${name} [Role: ${role}]`, 'Admin', 'admin');

    res.status(201).json({ id, name, email, password, role, phone, createdAt });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan user' });
  }
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, phone } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'User tidak ditemukan' });

    const stmt = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          password = COALESCE(?, password),
          role = COALESCE(?, role),
          phone = COALESCE(?, phone)
      WHERE id = ?
    `);
    stmt.run(name, email, password, role, phone, id);

    createLog('UPDATE_USER', `Memperbarui user ${name || existing.name} (ID: ${id})`, 'Admin', 'admin');

    const updated = db.prepare('SELECT id, name, email, password, role, phone, created_at FROM users WHERE id = ?').get(id) as any;
    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      password: updated.password,
      role: updated.role,
      phone: updated.phone || undefined,
      createdAt: updated.created_at,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal mengupdate user' });
  }
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  createLog('DELETE_USER', `Menghapus user: ${user.name} (ID: ${id})`, 'Admin', 'admin');
  res.json({ success: true, message: 'User berhasil dihapus' });
});

// --- EMPLOYEES ---
app.get('/api/employees', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY created_at DESC').all();
  res.json(rows.map(mapEmployeeRow));
});

app.post('/api/employees', (req: Request, res: Response) => {
  const { nama, bank, noRek, atasNama, lampiranKtpUrl } = req.body;
  if (!nama || !bank || !noRek || !atasNama) {
    return res.status(400).json({ error: 'Nama, Bank, No Rekening, dan Atas Nama wajib diisi' });
  }

  const id = `emp-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO employees (id, nama, bank, no_rek, atas_nama, lampiran_ktp_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, nama, bank, noRek, atasNama, lampiranKtpUrl || null, createdAt);

  createLog('ADD_EMPLOYEE', `Menambahkan karyawan baru: ${nama} (${bank} ${noRek})`, 'Admin', 'admin');

  res.status(201).json({ id, nama, bank, noRek, atasNama, lampiranKtpUrl, createdAt });
});

app.put('/api/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nama, bank, noRek, atasNama, lampiranKtpUrl } = req.body;

  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Karyawan tidak ditemukan' });

  const stmt = db.prepare(`
    UPDATE employees
    SET nama = COALESCE(?, nama),
        bank = COALESCE(?, bank),
        no_rek = COALESCE(?, no_rek),
        atas_nama = COALESCE(?, atas_nama),
        lampiran_ktp_url = COALESCE(?, lampiran_ktp_url)
    WHERE id = ?
  `);
  stmt.run(nama, bank, noRek, atasNama, lampiranKtpUrl, id);

  createLog('UPDATE_EMPLOYEE', `Memperbarui data karyawan ID ${id} (${nama || existing.nama})`, 'Admin', 'admin');

  const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  res.json(mapEmployeeRow(updated));
});

app.delete('/api/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  if (!emp) return res.status(404).json({ error: 'Karyawan tidak ditemukan' });

  db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  createLog('DELETE_EMPLOYEE', `Menghapus karyawan: ${emp.nama} (ID: ${id})`, 'Admin', 'admin');
  res.json({ success: true });
});

// --- CATEGORIES ---
app.get('/api/categories', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM income_categories').all();
  res.json(rows);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { keterangan } = req.body;
  if (!keterangan) return res.status(400).json({ error: 'Keterangan wajib diisi' });

  const id = `cat-${Date.now()}`;
  db.prepare('INSERT INTO income_categories (id, keterangan) VALUES (?, ?)').run(id, keterangan);

  createLog('ADD_KATEGORI', `Menambahkan kategori uang masuk: ${keterangan}`, 'Admin', 'admin');
  res.status(201).json({ id, keterangan });
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { keterangan } = req.body;
  db.prepare('UPDATE income_categories SET keterangan = ? WHERE id = ?').run(keterangan, id);
  createLog('UPDATE_KATEGORI', `Memperbarui kategori ID ${id}`, 'Admin', 'admin');
  res.json({ id, keterangan });
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = db.prepare('SELECT * FROM income_categories WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM income_categories WHERE id = ?').run(id);
  createLog('DELETE_KATEGORI', `Menghapus kategori: ${cat?.keterangan || id}`, 'Admin', 'admin');
  res.json({ success: true });
});

// --- PROJECTS ---
app.get('/api/projects', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM projects').all();
  res.json(rows.map(mapProjectRow));
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { nama, kode, bankName, noRekBank, atasNama, deskripsi } = req.body;
  if (!nama || !kode || !bankName || !noRekBank || !atasNama) {
    return res.status(400).json({ error: 'Nama, Kode, Bank, No Rek Bank, dan Atas Nama wajib diisi' });
  }

  const id = `prj-${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO projects (id, nama, kode, bank_name, no_rek_bank, atas_nama, deskripsi)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, nama, kode, bankName, noRekBank, atasNama, deskripsi || null);

    createLog('ADD_PROYEK', `Menambahkan proyek: ${nama} (${kode})`, 'Admin', 'admin');
    res.status(201).json({ id, nama, kode, bankName, noRekBank, atasNama, deskripsi });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan proyek' });
  }
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nama, kode, bankName, noRekBank, atasNama, deskripsi } = req.body;

  db.prepare(`
    UPDATE projects
    SET nama = COALESCE(?, nama),
        kode = COALESCE(?, kode),
        bank_name = COALESCE(?, bank_name),
        no_rek_bank = COALESCE(?, no_rek_bank),
        atas_nama = COALESCE(?, atas_nama),
        deskripsi = COALESCE(?, deskripsi)
    WHERE id = ?
  `).run(nama, kode, bankName, noRekBank, atasNama, deskripsi, id);

  createLog('UPDATE_PROYEK', `Memperbarui proyek ID ${id}`, 'Admin', 'admin');
  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json(mapProjectRow(updated));
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const prj = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  createLog('DELETE_PROYEK', `Menghapus proyek: ${prj?.nama || id}`, 'Admin', 'admin');
  res.json({ success: true });
});

// --- FUND REQUESTS ---
app.get('/api/fund-requests', (req: Request, res: Response) => {
  const { project, status } = req.query;
  let query = 'SELECT * FROM fund_requests WHERE 1=1';
  const params: any[] = [];

  if (project) {
    query += ' AND LOWER(nama_proyek) = LOWER(?)';
    params.push(project);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(mapFundRequestRow));
});

app.get('/api/fund-requests/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
  res.json(mapFundRequestRow(row));
});

app.post('/api/fund-requests', (req: Request, res: Response) => {
  const data = req.body;
  const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
  const prefixMap: Record<string, string> = {
    operasional: 'OPR',
    payroll: 'PAY',
    reimburse: 'REI',
    pajak: 'PJK',
    pengadaan: 'PNG',
    invoice: 'INV',
  };
  const code = prefixMap[data.kategori] || 'REQ';

  const countRow = db.prepare('SELECT count(*) as count FROM fund_requests').get() as { count: number };
  const randNum = String(countRow.count + 1).padStart(3, '0');
  const nomorPengajuan = data.nomorPengajuan || `ND-${code}-${yearMonth}-${randNum}`;

  const id = `req-${Date.now()}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO fund_requests (
      id, nomor_pengajuan, kategori, sumber, pic_name, nama_proyek, nama_pemohon, jumlah,
      bank_tujuan, no_rek_tujuan, atas_nama_tujuan, keterangan, lampiran_url, lampiran_nama,
      periode_payroll, tanggal_invoice, nomor_invoice, judul_invoice, nominal_invoice,
      tujuan_invoice, status, catatan_penolakan, alasan_revisi, bukti_transfer_nama,
      bukti_transfer_url, tanggal_transfer, disbursed_by, created_by, created_at, updated_at,
      listing_employee, detail_tagihan, riwayat_revisi
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run(
    id,
    nomorPengajuan,
    data.kategori,
    data.sumber || 'finance',
    data.picName || null,
    data.namaProyek || null,
    data.namaPemohon || null,
    Number(data.jumlah) || 0,
    data.bankTujuan || null,
    data.noRekTujuan || null,
    data.atasNamaTujuan || null,
    data.keterangan,
    data.lampiranUrl || null,
    data.lampiranNama || null,
    data.periodePayroll || null,
    data.tanggalInvoice || null,
    data.nomorInvoice || null,
    data.judulInvoice || null,
    data.nominal != null ? Number(data.nominal) : null,
    data.tujuanInvoice || null,
    data.status || 'pending_admin_approval',
    null,
    null,
    null,
    null,
    null,
    null,
    data.createdBy || (data.sumber === 'pic' ? data.picName || 'PIC Lapangan' : 'Finance Manager'),
    now,
    now,
    data.listingEmployee ? JSON.stringify(data.listingEmployee) : null,
    data.detailTagihan ? JSON.stringify(data.detailTagihan) : null,
    null
  );

  createLog(
    `CREATE_PENGAJUAN_${code}`,
    `Membuat pengajuan dana ${data.kategori} (${nomorPengajuan}) sejumlah Rp ${(Number(data.jumlah) || 0).toLocaleString('id-ID')} [Sumber: ${(data.sumber || 'finance').toUpperCase()}].`,
    data.createdBy || 'Finance Manager',
    data.sumber === 'pic' ? 'system' : 'finance_manager'
  );

  const row = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.status(201).json(mapFundRequestRow(row));
});

app.put('/api/fund-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const existing = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE fund_requests
    SET kategori = COALESCE(?, kategori),
        nama_proyek = COALESCE(?, nama_proyek),
        nama_pemohon = COALESCE(?, nama_pemohon),
        jumlah = COALESCE(?, jumlah),
        bank_tujuan = COALESCE(?, bank_tujuan),
        no_rek_tujuan = COALESCE(?, no_rek_tujuan),
        atas_nama_tujuan = COALESCE(?, atas_nama_tujuan),
        keterangan = COALESCE(?, keterangan),
        lampiran_url = COALESCE(?, lampiran_url),
        lampiran_nama = COALESCE(?, lampiran_nama),
        periode_payroll = COALESCE(?, periode_payroll),
        tanggal_invoice = COALESCE(?, tanggal_invoice),
        nomor_invoice = COALESCE(?, nomor_invoice),
        judul_invoice = COALESCE(?, judul_invoice),
        nominal_invoice = COALESCE(?, nominal_invoice),
        tujuan_invoice = COALESCE(?, tujuan_invoice),
        status = COALESCE(?, status),
        updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    data.kategori,
    data.namaProyek,
    data.namaPemohon,
    data.jumlah != null ? Number(data.jumlah) : null,
    data.bankTujuan,
    data.noRekTujuan,
    data.atasNamaTujuan,
    data.keterangan,
    data.lampiranUrl,
    data.lampiranNama,
    data.periodePayroll,
    data.tanggalInvoice,
    data.nomorInvoice,
    data.judulInvoice,
    data.nominal != null ? Number(data.nominal) : null,
    data.tujuanInvoice,
    data.status,
    now,
    id
  );

  createLog('UPDATE_PENGAJUAN', `Memperbarui data pengajuan dana ID ${id}`, 'Finance Manager', 'finance_manager');

  const updated = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.json(mapFundRequestRow(updated));
});

app.delete('/api/fund-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  db.prepare('DELETE FROM fund_requests WHERE id = ?').run(id);
  createLog('DELETE_PENGAJUAN', `Menghapus pengajuan dana ${reqRow.nomor_pengajuan} (ID: ${id})`, 'Finance Manager', 'finance_manager');
  res.json({ success: true });
});

// Review PIC Request (Approve to Admin or Reject)
app.post('/api/fund-requests/:id/review-pic', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, notes } = req.body;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  const now = new Date().toISOString();
  if (action === 'approve') {
    db.prepare(`
      UPDATE fund_requests
      SET status = 'pending_admin_approval', updated_at = ?
      WHERE id = ?
    `).run(now, id);
    createLog('REVIEW_PIC_APPROVE', `Finance menyetujui & meneruskan pengajuan PIC ${reqRow.nomor_pengajuan} ke Admin`, 'Finance Manager', 'finance_manager');
  } else {
    db.prepare(`
      UPDATE fund_requests
      SET status = 'rejected', catatan_penolakan = ?, updated_at = ?
      WHERE id = ?
    `).run(notes || 'Ditolak oleh Finance Manager', now, id);
    createLog('REVIEW_PIC_REJECT', `Finance menolak pengajuan PIC ${reqRow.nomor_pengajuan}: ${notes}`, 'Finance Manager', 'finance_manager');
  }

  const updated = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.json(mapFundRequestRow(updated));
});

// Admin Approve
app.post('/api/fund-requests/:id/admin-approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE fund_requests
    SET status = 'approved', updated_at = ?
    WHERE id = ?
  `).run(now, id);

  createLog(
    'ADMIN_APPROVE_PENGAJUAN',
    `Admin menyetujui pengajuan dana ${reqRow.nomor_pengajuan} (${reqRow.kategori}) senilai Rp ${Number(reqRow.jumlah).toLocaleString('id-ID')}`,
    'Budi Santoso',
    'admin'
  );

  const updated = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.json(mapFundRequestRow(updated));
});

// Admin Reject
app.post('/api/fund-requests/:id/admin-reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE fund_requests
    SET status = 'rejected', catatan_penolakan = ?, updated_at = ?
    WHERE id = ?
  `).run(notes || 'Ditolak oleh Admin', now, id);

  createLog(
    'ADMIN_REJECT_PENGAJUAN',
    `Admin menolak pengajuan dana ${reqRow.nomor_pengajuan} dengan catatan: "${notes}"`,
    'Budi Santoso',
    'admin'
  );

  const updated = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.json(mapFundRequestRow(updated));
});

// Revise & Resubmit Fund Request
app.post('/api/fund-requests/:id/revise', (req: Request, res: Response) => {
  const { id } = req.params;
  const { updatedFields, revisionNotes, revisedBy } = req.body;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  const now = new Date().toISOString();
  const riwayat = reqRow.riwayat_revisi ? JSON.parse(reqRow.riwayat_revisi) : [];
  riwayat.push({
    tanggal: now,
    catatan: revisionNotes || 'Perbaikan pengajuan',
    oleh: revisedBy || 'Finance Manager',
  });

  const fields = updatedFields || {};

  db.prepare(`
    UPDATE fund_requests
    SET jumlah = COALESCE(?, jumlah),
        keterangan = COALESCE(?, keterangan),
        bank_tujuan = COALESCE(?, bank_tujuan),
        no_rek_tujuan = COALESCE(?, no_rek_tujuan),
        atas_nama_tujuan = COALESCE(?, atas_nama_tujuan),
        status = 'pending_admin_approval',
        alasan_revisi = ?,
        riwayat_revisi = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    fields.jumlah != null ? Number(fields.jumlah) : null,
    fields.keterangan || null,
    fields.bankTujuan || null,
    fields.noRekTujuan || null,
    fields.atasNamaTujuan || null,
    revisionNotes,
    JSON.stringify(riwayat),
    now,
    id
  );

  createLog(
    'REVISI_PENGAJUAN',
    `Finance Manager merevisi pengajuan ${reqRow.nomor_pengajuan} dan mengajukan ulang ke Admin: "${revisionNotes}"`,
    revisedBy || 'Finance Manager',
    'finance_manager'
  );

  const updated = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.json(mapFundRequestRow(updated));
});

// Upload Bukti Transfer (Disburse / Done)
app.post('/api/fund-requests/:id/transfer', (req: Request, res: Response) => {
  const { id } = req.params;
  const { proofName, proofUrl, tanggalTransfer, disbursedBy } = req.body;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  const now = new Date().toISOString();
  const dateStr = tanggalTransfer || now.split('T')[0];

  db.prepare(`
    UPDATE fund_requests
    SET status = 'done',
        bukti_transfer_nama = ?,
        bukti_transfer_url = ?,
        tanggal_transfer = ?,
        disbursed_by = ?,
        updated_at = ?
    WHERE id = ?
  `).run(proofName, proofUrl, dateStr, disbursedBy || 'Finance Manager', now, id);

  // Automatically record as uang_keluar transaction
  const trxId = `trx-${Date.now()}`;
  db.prepare(`
    INSERT INTO transactions (id, tanggal, nama_proyek, judul, status, kategori_transaksi, jenis, nominal, referensi_id, created_at)
    VALUES (?, ?, ?, ?, 'done', 'uang_keluar', ?, ?, ?, ?)
  `).run(
    trxId,
    dateStr,
    reqRow.nama_proyek || 'PT Inovasi Digital Kreasi',
    reqRow.keterangan || `Transfer ${reqRow.kategori} ${reqRow.nomor_pengajuan}`,
    reqRow.kategori.charAt(0).toUpperCase() + reqRow.kategori.slice(1),
    Number(reqRow.jumlah),
    id,
    now
  );

  createLog(
    'UPLOAD_BUKTI_TRANSFER',
    `Bukti transfer diunggah untuk ${reqRow.nomor_pengajuan} (Rp ${Number(reqRow.jumlah).toLocaleString('id-ID')}). Status menjadi DONE.`,
    disbursedBy || 'Finance Manager',
    'finance_manager'
  );

  const updated = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id);
  res.json(mapFundRequestRow(updated));
});

// --- GROUP DISBURSEMENTS ---
app.get('/api/group-disbursements', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM group_disbursements ORDER BY created_at DESC').all() as any[];
  const groups = rows.map((g) => ({
    id: g.id,
    judul: g.judul,
    keterangan: g.keterangan || undefined,
    totalNominal: Number(g.total_nominal),
    details: g.details ? JSON.parse(g.details) : [],
    createdAt: g.created_at,
  }));
  res.json(groups);
});

app.post('/api/group-disbursements', (req: Request, res: Response) => {
  const { judul, keterangan, details, totalNominal } = req.body;
  if (!judul || !details) {
    return res.status(400).json({ error: 'Judul dan rincian penerima wajib diisi' });
  }

  const id = `grp-${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO group_disbursements (id, judul, keterangan, total_nominal, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, judul, keterangan || null, Number(totalNominal) || 0, JSON.stringify(details), createdAt);

  createLog('CREATE_GROUP_DISBURSEMENT', `Membuat Group Disbursement "${judul}" (${details.length} penerima, Rp ${(Number(totalNominal) || 0).toLocaleString('id-ID')})`, 'Finance Manager', 'finance_manager');

  res.status(201).json({
    id,
    judul,
    keterangan,
    totalNominal: Number(totalNominal) || 0,
    details,
    createdAt,
  });
});

app.put('/api/group-disbursements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { judul, keterangan, details, totalNominal } = req.body;

  db.prepare(`
    UPDATE group_disbursements
    SET judul = COALESCE(?, judul),
        keterangan = COALESCE(?, keterangan),
        total_nominal = COALESCE(?, total_nominal),
        details = COALESCE(?, details)
    WHERE id = ?
  `).run(judul, keterangan, totalNominal != null ? Number(totalNominal) : null, details ? JSON.stringify(details) : null, id);

  createLog('UPDATE_GROUP_DISBURSEMENT', `Memperbarui Group Disbursement ID ${id}`, 'Finance Manager', 'finance_manager');

  const updated = db.prepare('SELECT * FROM group_disbursements WHERE id = ?').get(id) as any;
  res.json({
    id: updated.id,
    judul: updated.judul,
    keterangan: updated.keterangan || undefined,
    totalNominal: Number(updated.total_nominal),
    details: updated.details ? JSON.parse(updated.details) : [],
    createdAt: updated.created_at,
  });
});

app.delete('/api/group-disbursements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const grp = db.prepare('SELECT * FROM group_disbursements WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM group_disbursements WHERE id = ?').run(id);
  createLog('DELETE_GROUP_DISBURSEMENT', `Menghapus Group Disbursement "${grp?.judul || id}"`, 'Finance Manager', 'finance_manager');
  res.json({ success: true });
});

// Execute Group Disbursement
app.post('/api/group-disbursements/:id/execute', (req: Request, res: Response) => {
  const { id } = req.params;
  const { executedBy } = req.body;
  const grp = db.prepare('SELECT * FROM group_disbursements WHERE id = ?').get(id) as any;
  if (!grp) return res.status(404).json({ error: 'Group disbursement tidak ditemukan' });

  const details = grp.details ? JSON.parse(grp.details) : [];
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const execId = `exec-${Date.now()}`;
  db.prepare(`
    INSERT INTO disbursement_executions (id, tanggal, judul, group_disbursement_id, group_judul, total_nominal, item_count, created_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    execId,
    dateStr,
    `Pencairan Massal: ${grp.judul}`,
    id,
    grp.judul,
    Number(grp.total_nominal),
    details.length,
    now,
    executedBy || 'Finance Manager'
  );

  // Record to transactions
  const trxId = `trx-grp-${Date.now()}`;
  db.prepare(`
    INSERT INTO transactions (id, tanggal, nama_proyek, judul, status, kategori_transaksi, jenis, nominal, referensi_id, created_at)
    VALUES (?, ?, ?, ?, 'done', 'uang_keluar', 'Group Disbursement', ?, ?, ?)
  `).run(
    trxId,
    dateStr,
    'PT Inovasi Digital Kreasi',
    `Pencairan Massal ${grp.judul} (${details.length} rekening)`,
    Number(grp.total_nominal),
    execId,
    now
  );

  createLog(
    'EXECUTE_GROUP_DISBURSEMENT',
    `Mengeksekusi pencairan massal "${grp.judul}" senilai Rp ${Number(grp.total_nominal).toLocaleString('id-ID')} (${details.length} penerima)`,
    executedBy || 'Finance Manager',
    'finance_manager'
  );

  res.json({ success: true, executionId: execId });
});

// --- INCOME RECORDS ---
app.get('/api/income-records', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM income_records ORDER BY created_at DESC').all();
  res.json(rows.map(mapIncomeRecordRow));
});

app.post('/api/income-records', (req: Request, res: Response) => {
  const {
    namaProyek,
    hariTanggal,
    kategoriId,
    kategoriKeterangan,
    metodePembayaran,
    noRekTujuan,
    namaPengirim,
    jumlah,
    keterangan,
    createdBy,
  } = req.body;

  if (!namaProyek || !hariTanggal || !kategoriId || !metodePembayaran || !namaPengirim || !jumlah) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  const id = `inc-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO income_records (
      id, nama_proyek, hari_tanggal, kategori_id, kategori_keterangan,
      metode_pembayaran, no_rek_tujuan, nama_pengirim, jumlah, keterangan,
      created_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    namaProyek,
    hariTanggal,
    kategoriId,
    kategoriKeterangan,
    metodePembayaran,
    noRekTujuan || null,
    namaPengirim,
    Number(jumlah),
    keterangan,
    now,
    createdBy || 'Finance Manager'
  );

  // Automatically record to transactions as uang_masuk
  const dateOnly = hariTanggal.includes(', ') ? hariTanggal.split(', ')[1] : now.split('T')[0];
  const trxId = `trx-inc-${Date.now()}`;
  db.prepare(`
    INSERT INTO transactions (id, tanggal, nama_proyek, judul, status, kategori_transaksi, jenis, nominal, referensi_id, created_at)
    VALUES (?, ?, ?, ?, 'done', 'uang_masuk', ?, ?, ?, ?)
  `).run(
    trxId,
    dateOnly,
    namaProyek,
    `${kategoriKeterangan} - ${namaPengirim}`,
    kategoriKeterangan,
    Number(jumlah),
    id,
    now
  );

  createLog(
    'CATAT_UANG_MASUK',
    `Mencatat uang masuk ${namaProyek} (${metodePembayaran}) dari ${namaPengirim} sebesar Rp ${Number(jumlah).toLocaleString('id-ID')}`,
    createdBy || 'Finance Manager',
    'finance_manager'
  );

  const row = db.prepare('SELECT * FROM income_records WHERE id = ?').get(id);
  res.status(201).json(mapIncomeRecordRow(row));
});

app.delete('/api/income-records/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const rec = db.prepare('SELECT * FROM income_records WHERE id = ?').get(id) as any;
  if (!rec) return res.status(404).json({ error: 'Uang masuk tidak ditemukan' });

  db.prepare('DELETE FROM income_records WHERE id = ?').run(id);
  db.prepare('DELETE FROM transactions WHERE referensi_id = ?').run(id);

  createLog('DELETE_UANG_MASUK', `Menghapus pencatatan uang masuk ID ${id} (${rec.nama_proyek})`, 'Finance Manager', 'finance_manager');
  res.json({ success: true });
});

// --- TRANSACTIONS ---
app.get('/api/transactions', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY tanggal DESC, created_at DESC').all();
  res.json(rows.map(mapTransactionRow));
});

// --- LOGS ---
app.get('/api/logs', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 200').all();
  res.json(rows.map(mapLogRow));
});

app.post('/api/logs', (req: Request, res: Response) => {
  const { action, detail, user, role } = req.body;
  createLog(action, detail, user || 'User', role || 'system', req.ip || '127.0.0.1');
  res.status(201).json({ success: true });
});

// --- API SETTINGS & REGENERATION ---
app.get('/api/settings/keys', (_req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM api_settings LIMIT 1').get() as any;
  if (!row) {
    return res.json({
      apiKey: 'idk_live_demo_key',
      secretKey: 'idk_sec_demo_secret',
      lastGeneratedAt: new Date().toISOString(),
      generatedBy: 'Admin',
    });
  }
  res.json({
    apiKey: row.api_key,
    secretKey: row.secret_key,
    lastGeneratedAt: row.last_generated_at,
    generatedBy: row.generated_by,
  });
});

app.post('/api/settings/regenerate-keys', (req: Request, res: Response) => {
  const { generatedBy } = req.body;
  const generateKey = (prefix: string, len: number) => {
    const chars = 'abcdef0123456789';
    let res = prefix;
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const newKey = generateKey('idk_live_', 24);
  const newSecret = generateKey('idk_sec_', 32);
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE api_settings
    SET api_key = ?, secret_key = ?, last_generated_at = ?, generated_by = ?
    WHERE id = 'cred-1'
  `).run(newKey, newSecret, now, generatedBy || 'Budi Santoso');

  createLog('REGENERATE_API_KEYS', 'Kunci akses API (Public & Secret Key) berhasil diperbarui oleh Administrator', generatedBy || 'Admin', 'admin');

  res.json({
    apiKey: newKey,
    secretKey: newSecret,
    lastGeneratedAt: now,
    generatedBy: generatedBy || 'Budi Santoso',
  });
});

// --- SYSTEM RESET (Reset to clean initial state) ---
app.post('/api/system/reset', (_req: Request, res: Response) => {
  db.exec(`
    DELETE FROM users;
    DELETE FROM employees;
    DELETE FROM projects;
    DELETE FROM income_categories;
    DELETE FROM fund_requests;
    DELETE FROM group_disbursements;
    DELETE FROM disbursement_executions;
    DELETE FROM income_records;
    DELETE FROM transactions;
    DELETE FROM system_logs;
    DELETE FROM api_settings;
  `);

  seedInitialData();
  createLog('RESET_SYSTEM_DATA', 'Database direset kembali ke data default inisial', 'System', 'system');
  res.json({ success: true, message: 'Database reset to initial seed data' });
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Server
// -----------------------------------------------------------------------------
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
