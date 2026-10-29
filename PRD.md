# Product Requirements Document (PRD)
## Sistem Internal Keuangan & Operasional PT. Inovasi Digital Kreasi

- **Dokumen Versi:** 1.0.0
- **Status:** Approved / Production Specification
- **Target Pengguna:** Administrator Utama & Finance Manager PT. Inovasi Digital Kreasi
- **Kesesuaian Arsitektur:** Sinkron dengan `Api.md`, `ERD.md`, dan Implementasi Antarmuka UI/UX

---

## 1. Pendahuluan & Latar Belakang

PT. Inovasi Digital Kreasi merupakan perusahaan teknologi yang menaungi produk dan proyek digital strategis seperti **KawanEdu** (Platform EdTech Pendidikan), **Terniva** (IoT & Smart Livestock Management), dan **Scrava** (Platform Rekrutmen & Penilaian Talenta Digital). 

Untuk memastikan akuntabilitas tata kelola keuangan, tata kelola kas keluar, penerimaan kas masuk, pencairan dana, serta pelaporan manajerial, diperlukan sistem internal terintegrasi yang menghubungkan peran **Administrator (Admin)** dan **Finance Manager** dengan alur kerja yang ketat, transparan, dan dapat diaudit secara digital.

---

## 2. Batasan Produk (Product Scope & Boundaries)

Sistem ini **hanya** memuat modul-modul yang ditentukan dalam spesifikasi bisnis tanpa modul tambahan yang tidak relevan:

1. **Autentikasi Pengguna:** Login email & password standar tanpa switch role di dalam aplikasi.
2. **Modul Finance Manager:**
   - Pengajuan Dana (6 Kategori: Operasional, Payroll, Reimburse, Pajak, Pengadaan, Invoice) dengan 2 sumber pengajuan (Finance langsung & PIC Lapangan) serta siklus revisi.
   - Transfer Bank & Group Disbursement (Upload bukti transfer, Group Disbursement dengan multi-pilih karyawan dari Admin, ekspor file TXT transfer bank, dan cetak voucher PDF).
   - Pencatatan Uang Masuk (Kategori dari master Admin, pilihan TF/Cash, auto-fill rekening bank proyek jika TF, pencatatan otomatis ke transaksi kas).
   - Laporan Keuangan Finance (Arus Kas dengan filter rentang tanggal & proyek, Laba Rugi, dan Neraca / Balance Sheet).
3. **Modul Admin:**
   - Approval Pengajuan Dana (Approve/Reject dengan catatan penolakan wajib untuk revisi).
   - Master CRUD Employee (Data identitas karyawan, rekening bank, dan lampiran KTP).
   - Master CRUD Kategori Uang Masuk (Pembayaran SPP, Pendaftaran, dll.).
   - Master CRUD Proyek (KawanEdu, Terniva, Scrava beserta rekening bank penampungan).
   - Master CRUD User (Pengelolaan user role Admin & Finance Manager).
   - Laporan Eksekutif Admin (Uang Masuk, Uang Keluar, dan Laba Rugi).
   - Daftar Transaksi (Jurnal transaksi terintegrasi dengan filter dan pagination).
   - Daftar Audit Logs (Pencatatan aktivitas pengguna dan sistem dengan pagination).
   - Pengaturan Kredensial API (Generate & regenerate API Key dan Secret Key).

---

## 3. Matriks Peran & Hak Akses (Role-Based Access Control)

| Fitur / Modul | Role Admin | Role Finance Manager | PIC Lapangan (External Input) |
| :--- | :---: | :---: | :---: |
| **Login Sistem (Email & Password)** | Ya | Ya | Tidak (Submit via PIC Flow) |
| **Buat Pengajuan Dana Baru** | Tidak | Ya | Ya (Masuk antrean review Finance) |
| **Review Pengajuan PIC** | Tidak | Ya (Approve/Reject) | Tidak |
| **Revisi & Ajukan Ulang Pengajuan Ditolak** | Tidak | Ya | Tidak |
| **Approval Pengajuan Dana** | Ya (Approve/Reject + Catatan) | Tidak | Tidak |
| **Upload Bukti Transfer Bank (Status Done)**| Tidak | Ya | Tidak |
| **CRUD Group Disbursement** | Tidak | Ya (Pilih karyawan dari master) | Tidak |
| **Download TXT & PDF Voucher Bank** | Tidak | Ya | Tidak |
| **Pencatatan Uang Masuk** | Tidak | Ya (Rekening proyek auto) | Tidak |
| **Laporan Arus Kas (Filter Date & Proyek)** | Tidak | Ya | Tidak |
| **Laporan Laba Rugi & Neraca** | Ya (Laba Rugi Ringkas) | Ya (Laba Rugi & Neraca Lengkap) | Tidak |
| **Master CRUD Employee** | Ya | Read Only (Untuk Payroll/Disbursement) | Tidak |
| **Master CRUD Kategori Uang Masuk** | Ya | Read Only (Saat input uang masuk) | Tidak |
| **Master CRUD Proyek** | Ya | Read Only (Saat input pengajuan & uang masuk) | Tidak |
| **Master CRUD User** | Ya | Tidak | Tidak |
| **Daftar Transaksi (Pagination)** | Ya | View Kas | Tidak |
| **Daftar Audit Logs (Pagination)** | Ya | Tidak | Tidak |
| **Generate/Regenerate API Key & Secret** | Ya | Tidak | Tidak |

---

## 4. Spesifikasi Fungsional Rinci

### 4.1 Modul Autentikasi
- **Alur Masuk:** Pengguna mengakses sistem melalui form login standar dengan memasukkan `email` dan `password`.
- **Aturan UI/UX:**
  - Tidak ada tombol *Switch Role* setelah pengguna berhasil masuk ke dalam aplikasi.
  - Sesi login mempertahankan state pengguna (disimpan pada LocalStorage/Session).
  - Tombol Logout tersedia di header kanan untuk mengakhiri sesi.

---

### 4.2 Modul Finance Manager

#### 4.2.1 Pengajuan Dana
Mendukung 6 kategori kebutuhan dana dengan validasi atribut spesifik:
1. **Operasional:**
   - Atribut: Nama Proyek (`KawanEdu`, `Terniva`, `Scrava`), Nama Pemohon, Jumlah (Rp), Rekening Bank Tujuan & Atas Nama, Keterangan, Lampiran File (PDF/JPG).
2. **Payroll:**
   - Atribut: Periode Gaji, Jumlah Total Topup, Keterangan, Lampiran Listing Karyawan (`Listing Employee`: No, Nama, No. Rekening, Bank, Jumlah).
3. **Reimburse:**
   - Atribut: Nama Proyek, Nama Pemohon, Jumlah (Rp), Rekening Bank Tujuan & Atas Nama, Keterangan, Lampiran Bukti Transaksi (PDF/JPG).
4. **Pajak:**
   - Atribut: Periode Masa Pajak, Jumlah (Rp), No. Rekening Tujuan / Bank Persepsi & Atas Nama, Keterangan, Lampiran Kode Billing / Bukti Pajak (PDF/JPG).
5. **Pengadaan:**
   - Atribut: Pemohon, Jumlah (Rp), No. Rekening Tujuan Vendor & Atas Nama, Keterangan Spesifikasi Barang, Lampiran Quotation / Penawaran (PDF/JPG).
6. **Invoice:**
   - Atribut: Tanggal Invoice, Nomor Invoice, Judul Invoice, Nominal Tagihan, Tujuan Tagihan, Keterangan, serta **Detail Tagihan CRUD** (Deskripsi, Qty, Harga Satuan, Total otomatis).

**Mekanisme Dua Sumber Pengajuan (Dual Source):**
- **Sumber Finance:** Dibuat langsung oleh Finance Manager, langsung masuk status `pending_admin_approval`.
- **Sumber PIC:** Masuk dari PIC Lapangan dengan status `pending_pic_review`. Finance Manager memeriksa dokumen tersebut:
  - Jika disetujui: Diteruskan ke Admin (`pending_admin_approval`).
  - Jika ditolak: Dikembalikan ke PIC dengan catatan evaluasi.

**Alur Penolakan & Revisi:**
- Jika Admin menolak permohonan dana, Admin **wajib mengisi catatan penolakan**.
- Pengajuan berstatus `rejected` akan masuk ke tab *Revisi Diperlukan* di antarmuka Finance Manager.
- Finance Manager dapat mengedit nominal, deskripsi, melampirkan berkas perbaikan, menyertakan catatan revisi, dan mengajukan ulang ke Admin.

---

#### 4.2.2 Transfer Bank & Group Disbursement
1. **Daftar Siap Transfer & Upload Bukti:**
   - Menampilkan pengajuan yang berstatus `approved` oleh Admin.
   - Finance Manager mengunggah file bukti transfer bank (PDF/JPG/PNG) dan tanggal transfer.
   - Dialog upload dilengkapi **`overflow-y-auto`** agar konten formulir dan tombol aksi tidak terpotong pada berbagai resolusi layar.
   - Setelah diunggah, status pengajuan otomatis berubah menjadi **`done`** dan otomatis dicatat ke jurnal kas keluar (`kategoriTransaksi: uang_keluar`).
2. **Master Group Disbursement (CRUD):**
   - Finance Manager dapat membuat kelompok transfer berkala (misal: "Karyawan KawanEdu", "Honor Mentor Workshop").
   - Formulir detail menyediakan fitur multi-pilih dari data karyawan yang dikelola oleh Admin.
   - Nominal per karyawan dapat disesuaikan atau menggunakan standar gaji.
3. **Eksekusi Disbursement:**
   - Finance memilih kelompok disbursement dan tanggal eksekusi.
   - **Download File TXT:** Menghasilkan file teks format tab-delimited standar bank (BCA/Mandiri bulk payroll upload) dengan checksum nominal.
   - **Download / Cetak Voucher PDF:** Menghasilkan lembar voucher resmi lengkap dengan kop PT. Inovasi Digital Kreasi, rincian rekening, dan kolom tanda tangan otorisasi (Finance Manager & Direktur).

---

#### 4.2.3 Pencatatan Uang Masuk
- Formulir input mencatat penerimaan kas perusahaan dengan field:
  - **Nama Proyek:** Pilihan proyek (`KawanEdu`, `Terniva`, `Scrava`).
  - **Hari/Tanggal:** Hari dan tanggal transaksi kas diterima.
  - **Kategori Penerimaan:** Diambil secara dinamis dari Master Kategori yang dikelola Admin (misal: "Pembayaran SPP", "Pembayaran Pendaftaran").
  - **Metode Pembayaran:** `TF` (Transfer Bank) atau `Cash` (Tunai).
  - **Nomor Rekening Tujuan Bank:** **Otomatis terisi** saat nama proyek dipilih jika metode transfer adalah `TF`.
  - **Nama Pengirim:** Wajib diisi jika metode `Cash`, atau mencatat nama institusi/pengirim jika `TF`.
  - **Jumlah (Nominal Rp) & Keterangan.**
- Dialog formulir input dilengkapi **`overflow-y-auto`** dan batas ketinggian layar (`max-h-[90vh]`).
- Setiap pencatatan sukses otomatis menambahkan catatan ke daftar transaksi kas masuk (`kategoriTransaksi: uang_masuk`).

---

#### 4.2.4 Laporan Keuangan (Finance Manager)
1. **Laporan Arus Kas Masuk & Keluar:**
   - Filter tanggal awal (*Start Date*) dan tanggal akhir (*End Date*).
   - Filter berdasarkan nama proyek (`Semua Proyek`, `KawanEdu`, `Terniva`, `Scrava`).
   - Kartu ringkasan: Total Uang Masuk, Total Uang Keluar, dan Selisih Bersih (*Net Cashflow*).
   - Tabel riwayat arus kas dengan indikator visual kas masuk (hijau) dan keluar (merah).
2. **Laporan Laba Rugi:**
   - Menampilkan total pendapatan usaha dengan breakdown per kategori.
   - Menampilkan total beban usaha operasional dan pajak.
   - Menghitung laba/rugi bersih berjalan.
3. **Laporan Neraca (Balance Sheet):**
   - Menampilkan sisi **Aktiva** (Kas Bank, Kas Tunai, Piutang Invoice, Aset Tetap Server & Lab).
   - Menampilkan sisi **Pasiva** (Kewajiban Lancar, Modal Disetor, Laba Ditahan).
   - Indikator validasi Neraca Seimbang (*Balanced*).

---

### 4.3 Modul Admin

#### 4.3.1 Approval Pengajuan Dana
- Menampilkan antrean pengajuan berstatus `pending_admin_approval`.
- Admin dapat melihat dokumen lampiran, rincian biaya, riwayat revisi, dan rincian invoice/payroll.
- **Aksi Persetujuan:** Menyetujui pengajuan (`status -> approved`), memicu notifikasi siap transfer bagi Finance.
- **Aksi Penolakan:** Admin **wajib memberikan catatan alasan penolakan** agar Finance dapat merevisi dan mengajukan ulang.

#### 4.3.2 Master CRUD Employee
- Mengelola data seluruh karyawan PT. Inovasi Digital Kreasi.
- Atribut: ID, Nama Lengkap, Nomor Rekening, Nama Bank (BCA, Mandiri, BNI, BRI, BSI, dll.), Atas Nama Rekening, dan Lampiran KTP.
- Data ini menjadi basis master untuk multi-pilih pada *Group Disbursement* dan *Payroll*.

#### 4.3.3 Master CRUD Kategori
- Mengelola kategori penerimaan uang masuk.
- Atribut: ID, Keterangan (Contoh: *Pembayaran SPP*, *Pembayaran Pendaftaran*, *Pendapatan Lisensi Software*, *Jasa Implementasi*).
- Menjadi opsi dinamis saat Finance mencatat uang masuk.

#### 4.3.4 Master CRUD Proyek
- Mengelola portofolio proyek PT. Inovasi Digital Kreasi.
- Atribut: ID, Nama Proyek (`KawanEdu`, `Terniva`, `Scrava`), Kode Proyek, Rekening Bank Penampungan, Nama Bank, Atas Nama, dan Deskripsi.
- Menjadi acuan otomatisasi rekening penampungan saat pencatatan uang masuk metode `TF`.

#### 4.3.5 Master CRUD User
- Mengelola akun sistem dengan peran `admin` atau `finance_manager`.
- Atribut: ID, Nama, Email, Password, Peran (*Role*), Nomor Telepon.
- Menjamin pemisahan tugas (*segregation of duties*) antara pembuat pengajuan dan pemberi otorisasi.

#### 4.3.6 Laporan Keuangan Eksekutif (Admin)
- Laporan Uang Masuk: Rekapitulasi tanggal, nama proyek, judul transaksi, dan nominal.
- Laporan Uang Keluar: Rekapitulasi pencairan dana selesai (`status: done`).
- Laporan Laba Rugi Eksekutif: Ringkasan pendapatan, pengeluaran, dan surplus/defisit bersih.

#### 4.3.7 Daftar Transaksi Terintegrasi
- Jurnal transaksi kas masuk dan keluar seluruh proyek.
- Filter berdasarkan kategori transaksi (`uang_masuk` / `uang_keluar`), nama proyek, dan pencarian judul.
- Dilengkapi fitur **Pagination** (Page Size, Navigasi Halaman).

#### 4.3.8 Daftar Audit Logs
- Pencatatan otomatis setiap aktivitas yang dilakukan oleh Admin, Finance Manager, maupun sistem.
- Menampung atribut: Timestamp, User, Role, Action (misal: `LOGIN`, `CREATE_PENGAJUAN`, `APPROVE_PENGAJUAN`, `REVISE_PENGAJUAN`, `UPLOAD_BUKTI_TRANSFER`), Detail Keterangan, dan Alamat IP.
- Dilengkapi fitur **Pagination** dan pencarian log.

#### 4.3.9 Pengaturan Kredensial API
- Manajemen Public API Key (`X-API-KEY`) dan Secret Key (`Authorization: Bearer`).
- Fitur *Regenerate Key* dengan konfirmasi keamanan.
- Integrasi dokumentasi interaktif `Api.md` dengan simulator query GET, pengujian POST, dan tombol unduh file `Api.md`.

---

## 5. Standar Desain UI/UX

1. **Navigasi Drawer Kiri (Left Sidebar Drawer):**
   - Seluruh modul navigasi diletakkan pada panel laci sisi kiri yang responsif.
   - Menampilkan identitas pengguna yang sedang login, badge peran (*Admin* berwarna ungu, *Finance Manager* berwarna biru), dan menu modul yang terisolasi sesuai hak akses.
   - Dilengkapi *Live Notification Badges* (misal: jumlah pending approval, jumlah permohonan revisi, jumlah siap transfer).
2. **Desain Modal / Dialog:**
   - Semua dialog input (terutama Formulir Pengajuan, Dialog Transfer Bank, dan Dialog Pencatatan Uang Masuk) wajib memiliki properti **`overflow-y-auto`** dengan batas maksimal `max-h-[90vh]`.
   - Header modal dan tombol aksi simpan/batal tetap terlihat tanpa terpotong oleh scrolling konten formulir.
3. **Penyajian Data:**
   - Format mata uang Rupiah standar Indonesia (`Rp 18.500.000`).
   - Format tanggal Indonesia (`5 Okt 2026`).
   - Indikator status berwarna konsisten:
     - Kuning / Amber: `pending_admin_approval`, `pending_pic_review`.
     - Hijau / Emerald: `approved`, `done`.
     - Merah / Rose: `rejected`.
4. **Pencegahan Error Pengguna:**
   - Konfirmasi modal sebelum aksi destruktif (hapus data, regenerate keys).
   - Validasi formulir real-time untuk input nominal > 0 dan rekening tujuan.

---

## 6. Sinkronisasi dengan Api.md

Seluruh fungsi yang dijelaskan dalam PRD ini terhubung 1-to-1 dengan spesifikasi REST API di **`Api.md`**:

| Modul PRD | Endpoint Utama di Api.md |
| :--- | :--- |
| Login Pengguna | `POST /api/v1/auth/login` |
| Buat Pengajuan Dana | `POST /api/v1/finance/pengajuan` |
| List & Filter Pengajuan | `GET /api/v1/finance/pengajuan` |
| Review Pengajuan PIC | `POST /api/v1/finance/pengajuan/:id/review-pic` |
| Revisi Pengajuan Ditolak | `POST /api/v1/finance/pengajuan/:id/revisi` |
| Antrean Siap Transfer | `GET /api/v1/finance/transfer-bank/ready` |
| Upload Bukti Transfer | `POST /api/v1/finance/transfer-bank/upload-bukti` |
| CRUD Group Disbursement | `GET`, `POST`, `PUT`, `DELETE /api/v1/finance/group-disbursement` |
| Ekspor TXT & Voucher PDF | `POST /api/v1/finance/disbursement/export-txt`, `/generate-voucher` |
| Pencatatan Uang Masuk | `POST`, `GET`, `DELETE /api/v1/finance/uang-masuk` |
| Laporan Finance | `GET /api/v1/finance/laporan/arus-kas`, `/laba-rugi`, `/neraca` |
| Approval Admin | `GET /api/v1/admin/approval/pending`, `POST .../approve`, `POST .../reject` |
| Master Karyawan | `GET`, `POST`, `PUT`, `DELETE /api/v1/admin/employees` |
| Master Kategori | `GET`, `POST`, `PUT`, `DELETE /api/v1/admin/kategori` |
| Master Proyek | `GET`, `POST`, `PUT`, `DELETE /api/v1/admin/proyek` |
| Master User | `GET`, `POST`, `PUT`, `DELETE /api/v1/admin/users` |
| Laporan Eksekutif Admin | `GET /api/v1/admin/laporan/uang-masuk`, `/uang-keluar`, `/laba-rugi` |
| Transaksi Terpadu | `GET /api/v1/admin/transaksi` (dengan pagination) |
| Audit Logs | `GET /api/v1/admin/logs` (dengan pagination) |
| Kredensial API Key | `GET /api/v1/admin/settings/keys`, `POST .../regenerate-keys` |
