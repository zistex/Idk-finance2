import { db } from './db.js';

export function mapFundRequestRow(row: any) {
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

export function mapEmployeeRow(row: any) {
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

export function mapProjectRow(row: any) {
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

export function mapIncomeRecordRow(row: any) {
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

export function mapTransactionRow(row: any) {
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

export function mapLogRow(row: any) {
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

export function createLog(action: string, detail: string, userName = 'System', role = 'system', ip = '127.0.0.1') {
  const stmt = db.prepare(`
    INSERT INTO system_logs (id, timestamp, user_name, role, action, detail, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(`log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, new Date().toISOString(), userName, role, action, detail, ip);
}
