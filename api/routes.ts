import { Router, Request, Response } from 'express';
import { db, seedInitialData } from './db.js';
import {
  mapFundRequestRow,
  mapEmployeeRow,
  mapProjectRow,
  mapIncomeRecordRow,
  mapTransactionRow,
  mapLogRow,
  createLog,
} from './helpers.js';

export const apiRouter = Router();

// =============================================================================
// AUTH ROUTES
// =============================================================================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
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

// =============================================================================
// USER MANAGEMENT ROUTES
// =============================================================================
apiRouter.get('/users', (_req: Request, res: Response) => {
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

apiRouter.post('/users', (req: Request, res: Response) => {
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

apiRouter.put('/users/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  createLog('DELETE_USER', `Menghapus user: ${user.name} (ID: ${id})`, 'Admin', 'admin');
  res.json({ success: true, message: 'User berhasil dihapus' });
});

// =============================================================================
// EMPLOYEE ROUTES
// =============================================================================
apiRouter.get('/employees', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY created_at DESC').all();
  res.json(rows.map(mapEmployeeRow));
});

apiRouter.post('/employees', (req: Request, res: Response) => {
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

apiRouter.put('/employees/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  if (!emp) return res.status(404).json({ error: 'Karyawan tidak ditemukan' });

  db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  createLog('DELETE_EMPLOYEE', `Menghapus karyawan: ${emp.nama} (ID: ${id})`, 'Admin', 'admin');
  res.json({ success: true });
});

// =============================================================================
// CATEGORIES ROUTES
// =============================================================================
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM income_categories').all();
  res.json(rows);
});

apiRouter.post('/categories', (req: Request, res: Response) => {
  const { keterangan } = req.body;
  if (!keterangan) return res.status(400).json({ error: 'Keterangan wajib diisi' });

  const id = `cat-${Date.now()}`;
  db.prepare('INSERT INTO income_categories (id, keterangan) VALUES (?, ?)').run(id, keterangan);

  createLog('ADD_KATEGORI', `Menambahkan kategori uang masuk: ${keterangan}`, 'Admin', 'admin');
  res.status(201).json({ id, keterangan });
});

apiRouter.put('/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { keterangan } = req.body;
  db.prepare('UPDATE income_categories SET keterangan = ? WHERE id = ?').run(keterangan, id);
  createLog('UPDATE_KATEGORI', `Memperbarui kategori ID ${id}`, 'Admin', 'admin');
  res.json({ id, keterangan });
});

apiRouter.delete('/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = db.prepare('SELECT * FROM income_categories WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM income_categories WHERE id = ?').run(id);
  createLog('DELETE_KATEGORI', `Menghapus kategori: ${cat?.keterangan || id}`, 'Admin', 'admin');
  res.json({ success: true });
});

// =============================================================================
// PROJECTS ROUTES
// =============================================================================
apiRouter.get('/projects', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM projects').all();
  res.json(rows.map(mapProjectRow));
});

apiRouter.post('/projects', (req: Request, res: Response) => {
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

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const prj = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  createLog('DELETE_PROYEK', `Menghapus proyek: ${prj?.nama || id}`, 'Admin', 'admin');
  res.json({ success: true });
});

// =============================================================================
// FUND REQUESTS ROUTES
// =============================================================================
apiRouter.get('/fund-requests', (req: Request, res: Response) => {
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

apiRouter.get('/fund-requests/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
  res.json(mapFundRequestRow(row));
});

apiRouter.post('/fund-requests', (req: Request, res: Response) => {
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

apiRouter.put('/fund-requests/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/fund-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const reqRow = db.prepare('SELECT * FROM fund_requests WHERE id = ?').get(id) as any;
  if (!reqRow) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });

  db.prepare('DELETE FROM fund_requests WHERE id = ?').run(id);
  createLog('DELETE_PENGAJUAN', `Menghapus pengajuan dana ${reqRow.nomor_pengajuan} (ID: ${id})`, 'Finance Manager', 'finance_manager');
  res.json({ success: true });
});

// Review PIC Request (Approve to Admin or Reject)
apiRouter.post('/fund-requests/:id/review-pic', (req: Request, res: Response) => {
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
apiRouter.post('/fund-requests/:id/admin-approve', (req: Request, res: Response) => {
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
apiRouter.post('/fund-requests/:id/admin-reject', (req: Request, res: Response) => {
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
apiRouter.post('/fund-requests/:id/revise', (req: Request, res: Response) => {
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
apiRouter.post('/fund-requests/:id/transfer', (req: Request, res: Response) => {
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

// =============================================================================
// GROUP DISBURSEMENTS ROUTES
// =============================================================================
apiRouter.get('/group-disbursements', (_req: Request, res: Response) => {
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

apiRouter.post('/group-disbursements', (req: Request, res: Response) => {
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

apiRouter.put('/group-disbursements/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/group-disbursements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const grp = db.prepare('SELECT * FROM group_disbursements WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM group_disbursements WHERE id = ?').run(id);
  createLog('DELETE_GROUP_DISBURSEMENT', `Menghapus Group Disbursement "${grp?.judul || id}"`, 'Finance Manager', 'finance_manager');
  res.json({ success: true });
});

apiRouter.post('/group-disbursements/:id/execute', (req: Request, res: Response) => {
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

// =============================================================================
// INCOME RECORDS ROUTES
// =============================================================================
apiRouter.get('/income-records', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM income_records ORDER BY created_at DESC').all();
  res.json(rows.map(mapIncomeRecordRow));
});

apiRouter.post('/income-records', (req: Request, res: Response) => {
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

apiRouter.delete('/income-records/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const rec = db.prepare('SELECT * FROM income_records WHERE id = ?').get(id) as any;
  if (!rec) return res.status(404).json({ error: 'Uang masuk tidak ditemukan' });

  db.prepare('DELETE FROM income_records WHERE id = ?').run(id);
  db.prepare('DELETE FROM transactions WHERE referensi_id = ?').run(id);

  createLog('DELETE_UANG_MASUK', `Menghapus pencatatan uang masuk ID ${id} (${rec.nama_proyek})`, 'Finance Manager', 'finance_manager');
  res.json({ success: true });
});

// =============================================================================
// TRANSACTIONS ROUTES
// =============================================================================
apiRouter.get('/transactions', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY tanggal DESC, created_at DESC').all();
  res.json(rows.map(mapTransactionRow));
});

// =============================================================================
// SYSTEM LOGS ROUTES
// =============================================================================
apiRouter.get('/logs', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 200').all();
  res.json(rows.map(mapLogRow));
});

apiRouter.post('/logs', (req: Request, res: Response) => {
  const { action, detail, user, role } = req.body;
  createLog(action, detail, user || 'User', role || 'system', req.ip || '127.0.0.1');
  res.status(201).json({ success: true });
});

// =============================================================================
// API SETTINGS & REGENERATION
// =============================================================================
apiRouter.get('/settings/keys', (_req: Request, res: Response) => {
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

apiRouter.post('/settings/regenerate-keys', (req: Request, res: Response) => {
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

// =============================================================================
// SYSTEM RESET
// =============================================================================
apiRouter.post('/system/reset', (_req: Request, res: Response) => {
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
