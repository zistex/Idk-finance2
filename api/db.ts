import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data folder exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'database.sqlite');
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// -----------------------------------------------------------------------------
// Database Initialization & Schema
// -----------------------------------------------------------------------------
export function initDatabase() {
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

export function seedInitialData() {
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
