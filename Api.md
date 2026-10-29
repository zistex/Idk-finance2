# Dokumentasi REST API Backend - PT. Inovasi Digital Kreasi

Dokumentasi lengkap seluruh REST API endpoint untuk sistem internal keuangan dan operasional PT. Inovasi Digital Kreasi.
Dikelompokkan secara ketat berdasarkan **Role Finance** dan **Role Admin** sesuai spesifikasi kebutuhan sistem.

---

## 1. Spesifikasi Teknis Global & Kredensial

### 1.1 Base URL
```
https://api.inovasidigital.id/v1
```

### 1.2 Standar Request Headers
Seluruh endpoint (kecuali endpoint login publik) wajib menyertakan header autentikasi berikut:

```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
Accept: application/json
```

---

## 2. Modul Autentikasi (Publik)

### 2.1 POST /auth/login
Melakukan login pengguna (Admin atau Finance Manager) dengan email dan password.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/auth/login
```

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
```

**Request Body (JSON):**
```json
{
  "email": "finance@inovasidigital.id",
  "password": "finance123"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Autentikasi berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_payload_finance",
    "user": {
      "id": "usr-2",
      "name": "Siti Rahmawati",
      "email": "finance@inovasidigital.id",
      "role": "finance_manager",
      "phone": "081377881122"
    }
  }
}
```

---

## 3. Modul Role: Finance Manager

Endpoint yang diakses oleh **Finance Manager** untuk operasional harian:
1. Pengajuan Dana (6 Kategori, 2 Sumber [Finance / PIC], Revisi)
2. Transfer Bank & Group Disbursement (Upload Bukti, Bulk TXT, Cetak Voucher)
3. Pencatatan Uang Masuk (TF / Cash, Rekening Proyek Otomatis)
4. Laporan Keuangan (Arus Kas Masuk/Keluar, Laba Rugi, Neraca)

---

### 3.1 Sub-Modul: Pengajuan Dana

#### 3.1.1 POST /finance/pengajuan
Membuat pengajuan dana baru untuk 6 jenis kebutuhan (`operasional`, `payroll`, `reimburse`, `pajak`, `pengadaan`, `invoice`), baik langsung dari Finance (`sumber: finance`) maupun diteruskan dari PIC (`sumber: pic`).

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/pengajuan
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

##### Contoh 1: Request Body - Pengajuan Operasional
```json
{
  "kategori": "operasional",
  "sumber": "finance",
  "namaProyek": "KawanEdu",
  "namaPemohon": "Rizki Firmansyah (Lead DevOps)",
  "jumlah": 8500000,
  "bankTujuan": "BCA",
  "noRekTujuan": "0129384756",
  "atasNamaTujuan": "PT Cloud Indo Perkasa",
  "keterangan": "Perpanjangan Server Production AWS Cloud & CDN Streaming Edukasi Periode Nov 2026",
  "lampiranNama": "Invoice_AWS_KawanEdu_Nov.pdf"
}
```

##### Contoh 2: Request Body - Pengajuan Payroll
```json
{
  "kategori": "payroll",
  "sumber": "finance",
  "periodePayroll": "Oktober 2026",
  "jumlah": 37500000,
  "keterangan": "Topup Payroll Gaji Tim Pengembang & Operasional Oktober 2026",
  "lampiranNama": "Listing_Gaji_Oktober_2026.pdf",
  "listingEmployee": [
    { "no": 1, "employeeId": "emp-1", "nama": "Andi Pratama", "bank": "BCA", "noRekening": "5270198271", "jumlah": 9000000 },
    { "no": 2, "employeeId": "emp-2", "nama": "Dewi Lestari", "bank": "Mandiri", "noRekening": "1370001928311", "jumlah": 8500000 },
    { "no": 3, "employeeId": "emp-3", "nama": "Rian Kurniawan", "bank": "BNI", "noRekening": "0819283746", "jumlah": 7500000 },
    { "no": 4, "employeeId": "emp-4", "nama": "Maya Puspita", "bank": "BRI", "noRekening": "0283746190", "jumlah": 6500000 },
    { "no": 5, "employeeId": "emp-5", "nama": "Farhan Maulana", "bank": "BCA", "noRekening": "6040192837", "jumlah": 6000000 }
  ]
}
```

##### Contoh 3: Request Body - Pengajuan Reimburse (Sumber PIC Lapangan)
```json
{
  "kategori": "reimburse",
  "sumber": "pic",
  "picName": "Hendra Wijaya (Project Manager Terniva)",
  "namaProyek": "Terniva",
  "namaPemohon": "Hendra Wijaya",
  "jumlah": 1450000,
  "bankTujuan": "BCA",
  "noRekTujuan": "7829102931",
  "atasNamaTujuan": "Hendra Wijaya",
  "keterangan": "Reimburse Transportasi & Akomodasi Uji Coba Lapangan Sensor Terniva di Boyolali",
  "lampiranNama": "Kuitansi_Tol_BBM_Terniva.jpg"
}
```

##### Contoh 4: Request Body - Pengajuan Pajak
```json
{
  "kategori": "pajak",
  "sumber": "finance",
  "periodePayroll": "Masa Pajak September 2026",
  "jumlah": 4200000,
  "bankTujuan": "Bank Persepsi Mandiri",
  "noRekTujuan": "000019283741",
  "atasNamaTujuan": "Kas Negara (KPP Pratama)",
  "keterangan": "Penyetoran PPh 21 Karyawan dan PPh 23 Masa September 2026",
  "lampiranNama": "Kode_Billing_Pajak_Sept.pdf"
}
```

##### Contoh 5: Request Body - Pengajuan Pengadaan
```json
{
  "kategori": "pengadaan",
  "sumber": "finance",
  "namaPemohon": "Bagas Aditya (Tim Teknis Scrava)",
  "jumlah": 6800000,
  "bankTujuan": "BCA",
  "noRekTujuan": "1122334455",
  "atasNamaTujuan": "CV Kharisma Komputer",
  "keterangan": "Pengadaan 2 Unit Monitor Dell UltraSharp 24 inch untuk Station Desain UI/UX Scrava",
  "lampiranNama": "Quotation_CV_Kharisma.pdf"
}
```

##### Contoh 6: Request Body - Pengajuan Invoice
```json
{
  "kategori": "invoice",
  "sumber": "finance",
  "namaProyek": "KawanEdu",
  "tanggalInvoice": "2026-10-18",
  "nomorInvoice": "INV-KWE-2026-088",
  "judulInvoice": "Pengadaan Lisensi Modul Interaktif SD IT Cahaya Bangsa",
  "nominal": 12500000,
  "tujuanInvoice": "Yayasan Bina Insan Mandiri",
  "jumlah": 12500000,
  "keterangan": "Tagihan implementasi modul KawanEdu semester ganjil tahun ajaran 2026/2027",
  "detailTagihan": [
    { "id": "invd-1", "deskripsi": "Lisensi Akun Guru Modul KawanEdu (30 Akun)", "qty": 30, "hargaSatuan": 150000, "total": 4500000 },
    { "id": "invd-2", "deskripsi": "Lisensi Akun Siswa Terpadu (160 Siswa)", "qty": 160, "hargaSatuan": 50000, "total": 8000000 }
  ]
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Pengajuan dana berhasil didaftarkan dan menunggu approval Admin",
  "data": {
    "id": "req-1729881234567",
    "nomorPengajuan": "ND-OPR-202610-007",
    "kategori": "operasional",
    "sumber": "finance",
    "namaProyek": "KawanEdu",
    "namaPemohon": "Rizki Firmansyah (Lead DevOps)",
    "jumlah": 8500000,
    "status": "pending_admin_approval",
    "tujuanTransfer": {
      "bank": "BCA",
      "noRekening": "0129384756",
      "atasNama": "PT Cloud Indo Perkasa"
    },
    "keterangan": "Perpanjangan Server Production AWS Cloud & CDN Streaming Edukasi Periode Nov 2026",
    "lampiranNama": "Invoice_AWS_KawanEdu_Nov.pdf",
    "createdAt": "2026-10-28T19:30:00.000Z",
    "createdBy": "Siti Rahmawati (Finance Manager)"
  }
}
```

---

#### 3.1.2 GET /finance/pengajuan
Mengambil daftar riwayat pengajuan dana dengan filter nama proyek, status, kategori, dan sumber.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/pengajuan?namaProyek=KawanEdu&status=approved
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Query Parameters:**
- `namaProyek` (string, opsional): `KawanEdu` | `Terniva` | `Scrava`
- `status` (string, opsional): `pending_admin_approval` | `approved` | `rejected` | `done` | `pending_pic_review`
- `kategori` (string, opsional): `operasional` | `payroll` | `reimburse` | `pajak` | `pengadaan` | `invoice`
- `sumber` (string, opsional): `finance` | `pic`

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "metadata": {
    "total_data": 1,
    "filters": {
      "namaProyek": "KawanEdu",
      "status": "approved"
    }
  },
  "data": [
    {
      "id": "req-1",
      "nomorPengajuan": "ND-OPR-202610-001",
      "kategori": "operasional",
      "sumber": "finance",
      "namaProyek": "KawanEdu",
      "namaPemohon": "Rizki Firmansyah (Lead DevOps)",
      "jumlah": 8500000,
      "bankTujuan": "BCA",
      "noRekTujuan": "0129384756",
      "atasNamaTujuan": "PT Cloud Indo Perkasa",
      "keterangan": "Perpanjangan Server Production AWS Cloud & CDN Streaming Edukasi Periode Nov 2026",
      "lampiranNama": "Invoice_AWS_KawanEdu_Nov.pdf",
      "status": "approved",
      "catatanPenolakan": null,
      "riwayatRevisi": [],
      "buktiTransferNama": null,
      "createdAt": "2026-10-20T09:00:00.000Z",
      "updatedAt": "2026-10-21T11:00:00.000Z",
      "createdBy": "Siti Rahmawati"
    }
  ]
}
```

---

#### 3.1.3 GET /finance/pengajuan/:id
Mendapatkan detail komprehensif satu pengajuan dana berdasarkan ID.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/pengajuan/req-5
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "req-5",
    "nomorPengajuan": "ND-PNG-202610-005",
    "kategori": "pengadaan",
    "sumber": "finance",
    "namaPemohon": "Bagas Aditya (Tim Teknis Scrava)",
    "jumlah": 6800000,
    "bankTujuan": "BCA",
    "noRekTujuan": "1122334455",
    "atasNamaTujuan": "CV Kharisma Komputer",
    "keterangan": "Pengadaan 2 Unit Monitor Dell UltraSharp 24 inch untuk Station Desain UI/UX Scrava",
    "lampiranNama": "Quotation_CV_Kharisma.pdf",
    "status": "rejected",
    "catatanPenolakan": "Mohon lampirkan perbandingan minimal 2 vendor toko komputer lain sebelum diajukan kembali.",
    "riwayatRevisi": [],
    "createdAt": "2026-10-22T13:00:00.000Z",
    "updatedAt": "2026-10-23T09:45:00.000Z",
    "createdBy": "Siti Rahmawati"
  }
}
```

---

#### 3.1.4 PUT /finance/pengajuan/:id
Memperbarui data pengajuan dana (sebelum final / ketika dalam revisi).

**Method & URL:**
```http
PUT https://api.inovasidigital.id/v1/finance/pengajuan/req-5
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "namaPemohon": "Bagas Aditya (Tim Teknis Scrava)",
  "jumlah": 6400000,
  "bankTujuan": "BCA",
  "noRekTujuan": "1122334455",
  "atasNamaTujuan": "CV Kharisma Komputer",
  "keterangan": "Pengadaan 2 Unit Monitor Dell UltraSharp disesuaikan penawaran diskon",
  "lampiranNama": "Quotation_CV_Kharisma_Revisi.pdf"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengajuan dana berhasil diperbarui",
  "data": {
    "id": "req-5",
    "jumlah": 6400000,
    "keterangan": "Pengadaan 2 Unit Monitor Dell UltraSharp disesuaikan penawaran diskon",
    "updatedAt": "2026-10-28T19:35:00.000Z"
  }
}
```

---

#### 3.1.5 DELETE /finance/pengajuan/:id
Menghapus pengajuan dana (hanya berlaku jika status draft atau ditolak).

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/finance/pengajuan/req-5
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengajuan dana ID req-5 berhasil dihapus dari sistem"
}
```

---

#### 3.1.6 POST /finance/pengajuan/:id/review-pic
Memvalidasi pengajuan dana yang masuk dari PIC Lapangan (Approve untuk diteruskan ke antrean Admin, atau Reject dengan alasan).

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/pengajuan/req-4/review-pic
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON - Jika Disetujui & Diteruskan ke Admin):**
```json
{
  "action": "approve"
}
```

**Request Body (JSON - Jika Ditolak oleh Finance):**
```json
{
  "action": "reject",
  "catatan": "Kuitansi bukti bensin dan tol tidak lengkap stempel resmi SPBU"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengajuan PIC berhasil diverifikasi dan diteruskan ke antrean approval Admin",
  "data": {
    "id": "req-4",
    "nomorPengajuan": "ND-RMB-202610-004",
    "status": "pending_admin_approval",
    "reviewedBy": "Siti Rahmawati (Finance Manager)",
    "reviewedAt": "2026-10-28T19:32:00.000Z"
  }
}
```

---

#### 3.1.7 POST /finance/pengajuan/:id/revisi
Mengajukan ulang permohonan dana yang sebelumnya ditolak oleh Admin dengan menyertakan dokumen/data perbaikan dan catatan revisi.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/pengajuan/req-5/revisi
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "jumlah": 6400000,
  "keterangan": "Pengadaan 2 unit monitor Dell UltraSharp disesuaikan ke vendor CV Prima Jaya Informatika",
  "lampiranNama": "Perbandingan_Vendor_Kharisma_vs_Prima.pdf",
  "catatanRevisi": "Sudah dilampirkan tabel perbandingan 2 vendor komputer dan harga turun menjadi Rp 6.400.000"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengajuan perbaikan berhasil diajukan ulang ke Admin",
  "data": {
    "id": "req-5",
    "nomorPengajuan": "ND-PNG-202610-005",
    "status": "pending_admin_approval",
    "catatanRevisi": "Sudah dilampirkan tabel perbandingan 2 vendor komputer dan harga turun menjadi Rp 6.400.000",
    "updatedAt": "2026-10-28T19:36:00.000Z"
  }
}
```

---

### 3.2 Sub-Modul: Transfer Bank & Group Disbursement

#### 3.2.1 GET /finance/transfer-bank/ready
Mengambil daftar pengajuan yang telah disetujui Admin (`status: approved`) dan siap untuk diunggah bukti transfernya.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/transfer-bank/ready
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total_siap_transfer": 1,
  "data": [
    {
      "id": "req-1",
      "nomorPengajuan": "ND-OPR-202610-001",
      "kategori": "operasional",
      "namaProyek": "KawanEdu",
      "jumlah": 8500000,
      "bankTujuan": "BCA",
      "noRekTujuan": "0129384756",
      "atasNamaTujuan": "PT Cloud Indo Perkasa",
      "keterangan": "Perpanjangan Server Production AWS Cloud & CDN Streaming",
      "status": "approved"
    }
  ]
}
```

---

#### 3.2.2 POST /finance/transfer-bank/upload-bukti
Mengunggah bukti transfer dana perbankan. Setelah request ini sukses, status pengajuan otomatis berubah menjadi `done` dan transaksi dicatat ke buku kas keluar.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/transfer-bank/upload-bukti
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "fundRequestId": "req-1",
  "buktiTransferNama": "Bukti_TF_BCA_AWS_KawanEdu_001.pdf",
  "buktiTransferUrl": "https://storage.inovasidigital.id/proofs/Bukti_TF_BCA_AWS.pdf",
  "tanggalTransfer": "2026-10-28"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Bukti transfer berhasil diverifikasi. Status pengajuan menjadi DONE dan transaksi kas dicatat.",
  "data": {
    "fundRequestId": "req-1",
    "status": "done",
    "transactionId": "trx-172988990011",
    "tanggalTransfer": "2026-10-28",
    "disbursedBy": "Siti Rahmawati (Finance Manager)"
  }
}
```

---

#### 3.2.3 GET /finance/group-disbursement
Mengambil daftar seluruh kelompok disbursement (Group Disbursement) beserta detail karyawan penerima.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/group-disbursement
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total_groups": 1,
  "data": [
    {
      "id": "grp-1",
      "judul": "Karyawan KawanEdu",
      "keterangan": "Group transfer berkala untuk tim inti pengembangan modul KawanEdu",
      "totalNominal": 23500000,
      "totalPenerima": 3,
      "details": [
        { "id": "gd-1", "employeeId": "emp-1", "nama": "Andi Pratama", "bank": "BCA", "noRek": "5270198271", "nominal": 9000000 },
        { "id": "gd-2", "employeeId": "emp-2", "nama": "Dewi Lestari", "bank": "Mandiri", "noRek": "1370001928311", "nominal": 8500000 },
        { "id": "gd-3", "employeeId": "emp-5", "nama": "Farhan Maulana", "bank": "BCA", "noRek": "6040192837", "nominal": 6000000 }
      ],
      "createdAt": "2026-10-01T10:00:00Z"
    }
  ]
}
```

---

#### 3.2.4 POST /finance/group-disbursement
Membuat Group Disbursement baru dengan multi-pilih karyawan dari master data Admin.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/group-disbursement
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "judul": "Honor Pengajar Workshop Terniva",
  "keterangan": "Disbursement honor pengajar sesi pelatihan IoT kandang cerdas Boyolali",
  "details": [
    { "employeeId": "emp-3", "nama": "Rian Kurniawan", "bank": "BNI", "noRek": "0819283746", "nominal": 7500000 },
    { "employeeId": "emp-4", "nama": "Maya Puspita", "bank": "BRI", "noRek": "0283746190", "nominal": 6500000 }
  ],
  "totalNominal": 14000000
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Group disbursement baru berhasil disimpan",
  "data": {
    "id": "grp-172989123456",
    "judul": "Honor Pengajar Workshop Terniva",
    "keterangan": "Disbursement honor pengajar sesi pelatihan IoT kandang cerdas Boyolali",
    "totalNominal": 14000000,
    "totalPenerima": 2,
    "createdAt": "2026-10-28T19:35:00.000Z"
  }
}
```

---

#### 3.2.5 PUT /finance/group-disbursement/:id
Memperbarui judul, keterangan, atau rincian penerima dalam group disbursement.

**Method & URL:**
```http
PUT https://api.inovasidigital.id/v1/finance/group-disbursement/grp-172989123456
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "judul": "Honor Pengajar Workshop Terniva (Batch 2 Revisi)",
  "keterangan": "Penyesuaian penambahan akomodasi transport pengajar",
  "details": [
    { "employeeId": "emp-3", "nama": "Rian Kurniawan", "bank": "BNI", "noRek": "0819283746", "nominal": 8000000 },
    { "employeeId": "emp-4", "nama": "Maya Puspita", "bank": "BRI", "noRek": "0283746190", "nominal": 7000000 }
  ],
  "totalNominal": 15000000
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Group disbursement berhasil diperbarui",
  "data": {
    "id": "grp-172989123456",
    "judul": "Honor Pengajar Workshop Terniva (Batch 2 Revisi)",
    "totalNominal": 15000000,
    "updatedAt": "2026-10-28T19:38:00.000Z"
  }
}
```

---

#### 3.2.6 DELETE /finance/group-disbursement/:id
Menghapus kelompok group disbursement.

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/finance/group-disbursement/grp-172989123456
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Group disbursement berhasil dihapus"
}
```

---

#### 3.2.7 POST /finance/disbursement/export-txt
Mengenerate dan mengunduh file format teks baku untuk transaksi transfer massal bank (BCA/Mandiri Bulk Transfer).

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/disbursement/export-txt
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "groupDisbursementId": "grp-1",
  "judulBatch": "Disbursement Gaji KawanEdu Periode Oktober",
  "tanggalEksekusi": "2026-10-28"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "filename": "Disbursement_Karyawan_KawanEdu_2026-10-28.txt",
  "contentType": "text/plain",
  "totalRecords": 3,
  "checksumTotal": 23500000,
  "fileContent": "PT. INOVASI DIGITAL KREASI - BULK BANK DISBURSEMENT FILE\nJudul Batch: Disbursement Gaji KawanEdu Periode Oktober\nTanggal Eksekusi: 2026-10-28\nTotal Nominal: Rp 23.500.000\n-------------------------------------------------------------\n1\tAndi Pratama\tBCA\t5270198271\t9000000\tDisbursement Gaji KawanEdu\n2\tDewi Lestari\tMandiri\t1370001928311\t8500000\tDisbursement Gaji KawanEdu\n3\tFarhan Maulana\tBCA\t6040192837\t6000000\tDisbursement Gaji KawanEdu\n-------------------------------------------------------------\nChecksum: SHA256_VERIFIED"
}
```

---

#### 3.2.8 POST /finance/disbursement/generate-voucher
Mengenerate data voucher resmi pencairan dana untuk cetak dokumen / arsip PDF.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/disbursement/generate-voucher
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "groupDisbursementId": "grp-1",
  "judul": "Disbursement Gaji KawanEdu Periode Oktober",
  "tanggal": "2026-10-28"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "voucherNumber": "DSB-20261028-001",
    "company": "PT. INOVASI DIGITAL KREASI",
    "tanggal": "2026-10-28",
    "judul": "Disbursement Gaji KawanEdu Periode Oktober",
    "totalNominal": 23500000,
    "totalPenerima": 3,
    "details": [
      { "no": 1, "nama": "Andi Pratama", "bank": "BCA", "noRek": "5270198271", "nominal": 9000000 },
      { "no": 2, "nama": "Dewi Lestari", "bank": "Mandiri", "noRek": "1370001928311", "nominal": 8500000 },
      { "no": 3, "nama": "Farhan Maulana", "bank": "BCA", "noRek": "6040192837", "nominal": 6000000 }
    ],
    "signatories": [
      { "role": "Finance Manager", "name": "Siti Rahmawati" },
      { "role": "Direktur / Admin Utama", "name": "Budi Santoso" }
    ]
  }
}
```

---

### 3.3 Sub-Modul: Pencatatan Uang Masuk

#### 3.3.1 POST /finance/uang-masuk
Mencatat penerimaan uang masuk. Jika metode transfer (`TF`), nomor rekening bank tujuan terisi otomatis dari data master proyek terkait. Jika metode tunai (`Cash`), nama pengirim wajib diisi. Transaksi otomatis dibukukan ke daftar transaksi kas masuk.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/finance/uang-masuk
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

##### Contoh Request Body 1: Pembayaran Via Transfer Bank (TF)
```json
{
  "namaProyek": "KawanEdu",
  "hariTanggal": "Senin, 2026-10-05",
  "kategoriId": "cat-1",
  "kategoriKeterangan": "Pembayaran SPP",
  "metodePembayaran": "TF",
  "noRekTujuan": "BCA - 8830192831 (a.n PT Inovasi Digital Kreasi)",
  "namaPengirim": "SMA Global Mandiri Tangerang",
  "jumlah": 18500000,
  "keterangan": "Pembayaran SPP Paket Sekolah Digital 450 Siswa Bulan Oktober"
}
```

##### Contoh Request Body 2: Pembayaran Via Tunai (Cash)
```json
{
  "namaProyek": "KawanEdu",
  "hariTanggal": "Rabu, 2026-10-21",
  "kategoriId": "cat-5",
  "kategoriKeterangan": "Pendapatan Workshop & Pelatihan",
  "metodePembayaran": "Cash",
  "namaPengirim": "Panitia MGMP Guru Komputer DKI",
  "jumlah": 3500000,
  "keterangan": "Biaya registrasi tunai workshop kurikulum merdeka digital"
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Uang masuk berhasil dicatat dan dibukukan ke transaksi kas",
  "data": {
    "id": "inc-172989234567",
    "transactionId": "trx-inc-172989234567",
    "namaProyek": "KawanEdu",
    "hariTanggal": "Senin, 2026-10-05",
    "kategoriKeterangan": "Pembayaran SPP",
    "metodePembayaran": "TF",
    "noRekTujuan": "BCA - 8830192831 (a.n PT Inovasi Digital Kreasi)",
    "namaPengirim": "SMA Global Mandiri Tangerang",
    "jumlah": 18500000,
    "createdAt": "2026-10-28T19:35:00.000Z",
    "createdBy": "Siti Rahmawati"
  }
}
```

---

#### 3.3.2 GET /finance/uang-masuk
Mengambil riwayat pencatatan uang masuk dengan filter proyek, kategori, dan metode pembayaran.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/uang-masuk?namaProyek=KawanEdu&metode=TF
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total_records": 1,
  "total_nominal": 18500000,
  "data": [
    {
      "id": "inc-1",
      "namaProyek": "KawanEdu",
      "hariTanggal": "Senin, 2026-10-05",
      "kategoriId": "cat-1",
      "kategoriKeterangan": "Pembayaran SPP",
      "metodePembayaran": "TF",
      "noRekTujuan": "BCA - 8830192831 (a.n PT Inovasi Digital Kreasi)",
      "namaPengirim": "SMA Global Mandiri Tangerang",
      "jumlah": 18500000,
      "keterangan": "Pembayaran SPP Paket Sekolah Digital 450 Siswa Bulan Oktober",
      "createdAt": "2026-10-05T09:30:00Z",
      "createdBy": "Siti Rahmawati"
    }
  ]
}
```

---

#### 3.3.3 DELETE /finance/uang-masuk/:id
Menghapus pencatatan penerimaan uang masuk dan membatalkan transaksi buku kas terkait.

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/finance/uang-masuk/inc-1
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pencatatan uang masuk ID inc-1 berhasil dihapus dan jurnal kas dibatalkan"
}
```

---

### 3.4 Sub-Modul: Laporan Keuangan (Finance)

#### 3.4.1 GET /finance/laporan/arus-kas
Laporan transaksi arus kas masuk & keluar dengan filter rentang tanggal dan nama proyek.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/laporan/arus-kas?startDate=2026-10-01&endDate=2026-10-31&namaProyek=KawanEdu
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Query Parameters:**
- `startDate` (YYYY-MM-DD): Tanggal awal periode
- `endDate` (YYYY-MM-DD): Tanggal akhir periode
- `namaProyek` (string, opsional): `KawanEdu` | `Terniva` | `Scrava`

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "summary": {
    "totalUangMasuk": 24700000,
    "totalUangKeluar": 0,
    "netCashflow": 24700000,
    "periode": "2026-10-01 s/d 2026-10-31",
    "filterProyek": "KawanEdu"
  },
  "data": [
    {
      "id": "trx-1",
      "tanggal": "2026-10-05",
      "namaProyek": "KawanEdu",
      "judul": "Pembayaran SPP Siswa KawanEdu Bulan Oktober",
      "kategoriTransaksi": "uang_masuk",
      "nominal": 18500000,
      "status": "done"
    },
    {
      "id": "trx-2",
      "tanggal": "2026-10-08",
      "namaProyek": "KawanEdu",
      "judul": "Pendaftaran Siswa Baru Angkatan 2026 KawanEdu",
      "kategoriTransaksi": "uang_masuk",
      "nominal": 6200000,
      "status": "done"
    }
  ]
}
```

---

#### 3.4.2 GET /finance/laporan/laba-rugi
Laporan laba rugi komprehensif periode berjalan.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/laporan/laba-rugi
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "pendapatan": {
      "total": 70700000,
      "breakdown": [
        { "kategori": "Pembayaran SPP", "jumlah": 18500000 },
        { "kategori": "Pembayaran Pendaftaran", "jumlah": 6200000 },
        { "kategori": "Jasa Implementasi IoT", "jumlah": 27500000 },
        { "kategori": "Lisensi Software Scrava", "jumlah": 15000000 },
        { "kategori": "Workshop Guru", "jumlah": 3500000 }
      ]
    },
    "bebanUsaha": {
      "total": 4200000,
      "breakdown": [
        { "jenis": "Beban Pajak PPh", "jumlah": 4200000 },
        { "jenis": "Beban Operasional AWS", "jumlah": 0 },
        { "jenis": "Beban Payroll", "jumlah": 0 }
      ]
    },
    "labaBersih": 66500000,
    "statusLaba": "SURPLUS"
  }
}
```

---

#### 3.4.3 GET /finance/laporan/neraca
Laporan posisi keuangan (Balance Sheet / Neraca) yang menyeimbangkan aktiva lancar/tetap terhadap kewajiban dan ekuitas.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/finance/laporan/neraca
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "aktiva": {
      "asetLancar": {
        "kasBank": 63000000,
        "kasTunai": 3500000,
        "piutangInvoice": 12500000,
        "totalAsetLancar": 79000000
      },
      "asetTetap": {
        "peralatanLabDanServer": 150000000,
        "totalAsetTetap": 150000000
      },
      "totalAktiva": 229000000
    },
    "pasiva": {
      "kewajibanLancar": 46000000,
      "ekuitas": {
        "modalDisetor": 100000000,
        "labaDitahan": 83000000,
        "totalEkuitas": 183000000
      },
      "totalPasiva": 229000000
    },
    "isBalanced": true
  }
}
```

---

## 4. Modul Role: Admin

Endpoint yang diakses oleh **Administrator Utama**:
1. Approval Pengajuan Dana (Approve/Reject dengan Catatan)
2. Master CRUD Employee (Data Karyawan & Rekening Bank)
3. Master CRUD Kategori Uang Masuk (SPP, Pendaftaran, dll.)
4. Master CRUD Proyek (KawanEdu, Terniva, Scrava, dll.)
5. Master CRUD User (Admin & Finance Manager)
6. Laporan Eksekutif (Uang Masuk, Uang Keluar, Laba Rugi)
7. Daftar Transaksi (Pagination, Filter, Search)
8. Daftar Audit Logs (Pagination, User & System Actions)
9. Pengaturan API Key & Secret Key

---

### 4.1 Sub-Modul: Approval Pengajuan Dana (Admin)

#### 4.1.1 GET /admin/approval/pending
Mengambil daftar pengajuan dana yang sedang menunggu persetujuan Admin (`status: pending_admin_approval`).

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/approval/pending
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total_pending": 1,
  "data": [
    {
      "id": "req-2",
      "nomorPengajuan": "ND-PAY-202610-002",
      "kategori": "payroll",
      "sumber": "finance",
      "periodePayroll": "Oktober 2026",
      "jumlah": 37500000,
      "keterangan": "Topup Payroll Gaji Tim Pengembang & Operasional Oktober 2026",
      "lampiranNama": "Listing_Gaji_Oktober_2026.pdf",
      "status": "pending_admin_approval",
      "listingEmployee": [
        { "no": 1, "nama": "Andi Pratama", "bank": "BCA", "noRekening": "5270198271", "jumlah": 9000000 },
        { "no": 2, "nama": "Dewi Lestari", "bank": "Mandiri", "noRekening": "1370001928311", "jumlah": 8500000 }
      ],
      "createdAt": "2026-10-24T08:30:00Z",
      "createdBy": "Siti Rahmawati"
    }
  ]
}
```

---

#### 4.1.2 POST /admin/approval/:id/approve
Menyetujui permohonan pengajuan dana. Status pengajuan berubah menjadi `approved` sehingga siap ditransfer oleh Finance Manager.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/approval/req-2/approve
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "catatanApproval": "Pengajuan topup payroll disetujui sesuai rekap kehadiran dan budget bulan Oktober."
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengajuan dana berhasil disetujui",
  "data": {
    "id": "req-2",
    "nomorPengajuan": "ND-PAY-202610-002",
    "status": "approved",
    "catatanApproval": "Pengajuan topup payroll disetujui sesuai rekap kehadiran dan budget bulan Oktober.",
    "approvedBy": "Budi Santoso (Admin)",
    "approvedAt": "2026-10-28T19:40:00.000Z"
  }
}
```

---

#### 4.1.3 POST /admin/approval/:id/reject
Menolak permohonan pengajuan dana. **Catatan penolakan wajib disertakan** agar Finance Manager dapat merevisi dan mengajukan ulang.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/approval/req-5/reject
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "catatanPenolakan": "Mohon lampirkan perbandingan minimal 2 vendor toko komputer lain sebelum diajukan kembali."
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengajuan dana ditolak dengan catatan perbaikan",
  "data": {
    "id": "req-5",
    "nomorPengajuan": "ND-PNG-202610-005",
    "status": "rejected",
    "catatanPenolakan": "Mohon lampirkan perbandingan minimal 2 vendor toko komputer lain sebelum diajukan kembali.",
    "rejectedBy": "Budi Santoso (Admin)",
    "rejectedAt": "2026-10-28T19:42:00.000Z"
  }
}
```

---

### 4.2 Sub-Modul: Master CRUD Employee (Admin)

#### 4.2.1 GET /admin/employees
Mengambil daftar seluruh karyawan terdaftar.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/employees
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total": 5,
  "data": [
    {
      "id": "emp-1",
      "nama": "Andi Pratama",
      "bank": "BCA",
      "noRek": "5270198271",
      "atasNama": "Andi Pratama",
      "lampiranKtpUrl": "https://storage.inovasidigital.id/ktp/emp1.jpg",
      "createdAt": "2026-01-15T10:00:00Z"
    },
    {
      "id": "emp-2",
      "nama": "Dewi Lestari",
      "bank": "Mandiri",
      "noRek": "1370001928311",
      "atasNama": "Dewi Lestari",
      "lampiranKtpUrl": "https://storage.inovasidigital.id/ktp/emp2.jpg",
      "createdAt": "2026-02-01T09:00:00Z"
    }
  ]
}
```

---

#### 4.2.2 POST /admin/employees
Mendaftarkan karyawan baru ke dalam sistem.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/employees
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "nama": "Nurul Hidayah",
  "bank": "BSI",
  "noRek": "7119283746",
  "atasNama": "Nurul Hidayah",
  "lampiranKtpUrl": "https://storage.inovasidigital.id/ktp/ktp_nurul.jpg"
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Karyawan baru berhasil didaftarkan",
  "data": {
    "id": "emp-1729895000",
    "nama": "Nurul Hidayah",
    "bank": "BSI",
    "noRek": "7119283746",
    "atasNama": "Nurul Hidayah",
    "lampiranKtpUrl": "https://storage.inovasidigital.id/ktp/ktp_nurul.jpg",
    "createdAt": "2026-10-28T19:44:00.000Z"
  }
}
```

---

#### 4.2.3 PUT /admin/employees/:id
Memperbarui rincian data karyawan, nama bank, atau nomor rekening.

**Method & URL:**
```http
PUT https://api.inovasidigital.id/v1/admin/employees/emp-1729895000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "nama": "Nurul Hidayah SE",
  "bank": "BCA",
  "noRek": "5270999888",
  "atasNama": "Nurul Hidayah",
  "lampiranKtpUrl": "https://storage.inovasidigital.id/ktp/ktp_nurul_update.jpg"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Data karyawan berhasil diperbarui",
  "data": {
    "id": "emp-1729895000",
    "nama": "Nurul Hidayah SE",
    "bank": "BCA",
    "noRek": "5270999888",
    "atasNama": "Nurul Hidayah",
    "lampiranKtpUrl": "https://storage.inovasidigital.id/ktp/ktp_nurul_update.jpg"
  }
}
```

---

#### 4.2.4 DELETE /admin/employees/:id
Menghapus data karyawan dari database.

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/admin/employees/emp-1729895000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Data karyawan ID emp-1729895000 berhasil dihapus"
}
```

---

### 4.3 Sub-Modul: Master CRUD Kategori Uang Masuk (Admin)

#### 4.3.1 GET /admin/kategori
Mengambil daftar kategori penerimaan uang masuk.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/kategori
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total": 5,
  "data": [
    { "id": "cat-1", "keterangan": "Pembayaran SPP" },
    { "id": "cat-2", "keterangan": "Pembayaran Pendaftaran" },
    { "id": "cat-3", "keterangan": "Pendapatan Lisensi Software" },
    { "id": "cat-4", "keterangan": "Pendapatan Jasa Implementasi & Maintenance" },
    { "id": "cat-5", "keterangan": "Pendapatan Workshop & Pelatihan" }
  ]
}
```

---

#### 4.3.2 POST /admin/kategori
Menambahkan kategori penerimaan uang masuk baru.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/kategori
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "keterangan": "Pendapatan Hibah & Riset Teknologi"
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Kategori uang masuk baru berhasil ditambahkan",
  "data": {
    "id": "cat-1729896000",
    "keterangan": "Pendapatan Hibah & Riset Teknologi"
  }
}
```

---

#### 4.3.3 PUT /admin/kategori/:id
Memperbarui keterangan kategori penerimaan.

**Method & URL:**
```http
PUT https://api.inovasidigital.id/v1/admin/kategori/cat-1729896000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "keterangan": "Pendapatan Hibah Kompetitif Kemendikbud"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Kategori berhasil diperbarui",
  "data": {
    "id": "cat-1729896000",
    "keterangan": "Pendapatan Hibah Kompetitif Kemendikbud"
  }
}
```

---

#### 4.3.4 DELETE /admin/kategori/:id
Menghapus kategori penerimaan uang masuk.

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/admin/kategori/cat-1729896000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Kategori ID cat-1729896000 berhasil dihapus"
}
```

---

### 4.4 Sub-Modul: Master CRUD Proyek (Admin)

#### 4.4.1 GET /admin/proyek
Mengambil daftar master proyek beserta rekening penampungan bank perbankan.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/proyek
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total": 3,
  "data": [
    {
      "id": "prj-1",
      "nama": "KawanEdu",
      "kode": "KWE",
      "bankName": "BCA",
      "noRekBank": "BCA - 8830192831 (a.n PT Inovasi Digital Kreasi)",
      "atasNama": "PT Inovasi Digital Kreasi",
      "deskripsi": "Platform EdTech Digital Learning & Sekolah Terintegrasi"
    },
    {
      "id": "prj-2",
      "nama": "Terniva",
      "kode": "TRN",
      "bankName": "Mandiri",
      "noRekBank": "Mandiri - 1370092837190 (a.n PT Inovasi Digital Kreasi)",
      "atasNama": "PT Inovasi Digital Kreasi",
      "deskripsi": "Sistem Manajemen Peternakan Pintar Berbasis IoT & AI"
    },
    {
      "id": "prj-3",
      "nama": "Scrava",
      "kode": "SCR",
      "bankName": "BNI",
      "noRekBank": "BNI - 0928374619 (a.n PT Inovasi Digital Kreasi)",
      "atasNama": "PT Inovasi Digital Kreasi",
      "deskripsi": "Aplikasi Rekrutmen & Penilaian Kompetensi Talenta Digital"
    }
  ]
}
```

---

#### 4.4.2 POST /admin/proyek
Menambahkan master proyek baru.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/proyek
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "nama": "KreasiPay",
  "kode": "KRP",
  "bankName": "BCA",
  "noRekBank": "BCA - 8830999000 (a.n PT Inovasi Digital Kreasi)",
  "atasNama": "PT Inovasi Digital Kreasi",
  "deskripsi": "Gateway Pembayaran Terpadu Institusi Pendidikan"
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Proyek baru berhasil ditambahkan",
  "data": {
    "id": "prj-1729897000",
    "nama": "KreasiPay",
    "kode": "KRP",
    "bankName": "BCA",
    "noRekBank": "BCA - 8830999000 (a.n PT Inovasi Digital Kreasi)",
    "atasNama": "PT Inovasi Digital Kreasi",
    "deskripsi": "Gateway Pembayaran Terpadu Institusi Pendidikan"
  }
}
```

---

#### 4.4.3 PUT /admin/proyek/:id
Memperbarui data proyek atau nomor rekening bank proyek.

**Method & URL:**
```http
PUT https://api.inovasidigital.id/v1/admin/proyek/prj-1729897000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "nama": "KreasiPay",
  "kode": "KRP",
  "bankName": "BCA",
  "noRekBank": "BCA - 8830999000 (a.n PT Inovasi Digital Kreasi)",
  "atasNama": "PT Inovasi Digital Kreasi",
  "deskripsi": "Gateway Pembayaran Terintegrasi & QRIS Pendidikan Berstandar Bank Indonesia"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Data proyek berhasil diperbarui",
  "data": {
    "id": "prj-1729897000",
    "nama": "KreasiPay",
    "deskripsi": "Gateway Pembayaran Terintegrasi & QRIS Pendidikan Berstandar Bank Indonesia"
  }
}
```

---

#### 4.4.4 DELETE /admin/proyek/:id
Menghapus data proyek.

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/admin/proyek/prj-1729897000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Proyek ID prj-1729897000 berhasil dihapus"
}
```

---

### 4.5 Sub-Modul: Master CRUD User (Admin)

#### 4.5.1 GET /admin/users
Mengambil daftar seluruh pengguna sistem (`role: admin` dan `role: finance_manager`).

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/users
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total": 2,
  "data": [
    {
      "id": "usr-1",
      "name": "Budi Santoso",
      "email": "admin@inovasidigital.id",
      "role": "admin",
      "phone": "081288990011",
      "createdAt": "2026-01-10T08:00:00Z"
    },
    {
      "id": "usr-2",
      "name": "Siti Rahmawati",
      "email": "finance@inovasidigital.id",
      "role": "finance_manager",
      "phone": "081377881122",
      "createdAt": "2026-01-12T09:30:00Z"
    }
  ]
}
```

---

#### 4.5.2 POST /admin/users
Membuat akun pengguna baru untuk role `admin` atau `finance_manager`.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/users
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Ahmad Fauzi",
  "email": "fauzi@inovasidigital.id",
  "password": "fauzipassword123",
  "role": "finance_manager",
  "phone": "081299887766"
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Pengguna baru berhasil dibuat",
  "data": {
    "id": "usr-1729898000",
    "name": "Ahmad Fauzi",
    "email": "fauzi@inovasidigital.id",
    "role": "finance_manager",
    "phone": "081299887766",
    "createdAt": "2026-10-28T19:46:00.000Z"
  }
}
```

---

#### 4.5.3 PUT /admin/users/:id
Memperbarui data profil, peran, atau kata sandi pengguna.

**Method & URL:**
```http
PUT https://api.inovasidigital.id/v1/admin/users/usr-1729898000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Ahmad Fauzi SE",
  "phone": "081299887700",
  "role": "finance_manager"
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Data pengguna berhasil diperbarui",
  "data": {
    "id": "usr-1729898000",
    "name": "Ahmad Fauzi SE",
    "phone": "081299887700",
    "role": "finance_manager"
  }
}
```

---

#### 4.5.4 DELETE /admin/users/:id
Menghapus akun pengguna dari sistem.

**Method & URL:**
```http
DELETE https://api.inovasidigital.id/v1/admin/users/usr-1729898000
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pengguna ID usr-1729898000 berhasil dihapus"
}
```

---

### 4.6 Sub-Modul: Laporan Keuangan Eksekutif (Admin)

#### 4.6.1 GET /admin/laporan/uang-masuk
Laporan terstruktur seluruh penerimaan uang masuk untuk evaluasi manajemen.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/laporan/uang-masuk
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total_uang_masuk": 70700000,
  "data": [
    {
      "tanggal": "2026-10-05",
      "namaProyek": "KawanEdu",
      "judul": "Pembayaran SPP Siswa KawanEdu Bulan Oktober",
      "nominal": 18500000,
      "status": "done"
    },
    {
      "tanggal": "2026-10-08",
      "namaProyek": "KawanEdu",
      "judul": "Pendaftaran Siswa Baru Angkatan 2026 KawanEdu",
      "nominal": 6200000,
      "status": "done"
    },
    {
      "tanggal": "2026-10-13",
      "namaProyek": "Terniva",
      "judul": "Termin II Instalasi Gateway IoT Sensor Terniva",
      "nominal": 27500000,
      "status": "done"
    },
    {
      "tanggal": "2026-10-17",
      "namaProyek": "Scrava",
      "judul": "Pembayaran Lisensi Platform Scrava PT Sumber Talenta",
      "nominal": 15000000,
      "status": "done"
    },
    {
      "tanggal": "2026-10-21",
      "namaProyek": "KawanEdu",
      "judul": "Penerimaan Registrasi Workshop Pembelajaran Digital",
      "nominal": 3500000,
      "status": "done"
    }
  ]
}
```

---

#### 4.6.2 GET /admin/laporan/uang-keluar
Laporan terstruktur seluruh pengeluaran kas keluar yang telah selesai ditransfer (`status: done`).

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/laporan/uang-keluar
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "total_uang_keluar": 4200000,
  "data": [
    {
      "tanggal": "2026-10-10",
      "namaProyek": "PT Inovasi Digital Kreasi",
      "judul": "Penyetoran PPh 21 Karyawan dan PPh 23 Masa September 2026",
      "nominal": 4200000,
      "status": "done"
    }
  ]
}
```

---

#### 4.6.3 GET /admin/laporan/laba-rugi
Laporan laba rugi standar eksekutif.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/laporan/laba-rugi
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "totalPendapatan": 70700000,
    "totalPengeluaran": 4200000,
    "labaBersih": 66500000,
    "statusLaba": "SURPLUS"
  }
}
```

---

### 4.7 Sub-Modul: Daftar Transaksi Terintegrasi (Admin)

#### 4.7.1 GET /admin/transaksi
Mengambil daftar buku transaksi terintegrasi dengan filter dan **pagination**.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/transaksi?page=1&limit=5&kategoriTransaksi=uang_masuk
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `kategoriTransaksi` (opsional): `uang_masuk` | `uang_keluar`
- `namaProyek` (opsional): `KawanEdu` | `Terniva` | `Scrava`
- `search` (opsional, string)

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "pagination": {
    "currentPage": 1,
    "pageSize": 5,
    "totalData": 5,
    "totalPages": 1
  },
  "data": [
    {
      "id": "trx-1",
      "tanggal": "2026-10-05",
      "namaProyek": "KawanEdu",
      "judul": "Pembayaran SPP Siswa KawanEdu Bulan Oktober",
      "kategoriTransaksi": "uang_masuk",
      "jenis": "Pembayaran SPP",
      "nominal": 18500000,
      "status": "done"
    },
    {
      "id": "trx-4",
      "tanggal": "2026-10-13",
      "namaProyek": "Terniva",
      "judul": "Termin II Instalasi Gateway IoT Sensor Terniva",
      "kategoriTransaksi": "uang_masuk",
      "jenis": "Pendapatan Jasa Implementasi",
      "nominal": 27500000,
      "status": "done"
    }
  ]
}
```

---

### 4.8 Sub-Modul: Daftar Audit Logs Sistem (Admin)

#### 4.8.1 GET /admin/logs
Mengambil seluruh histori catatan aktivitas user dan sistem dengan dukungan **pagination**.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/logs?page=1&limit=10
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `search` (opsional, string)

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalData": 8,
    "totalPages": 1
  },
  "data": [
    {
      "id": "log-1",
      "timestamp": "2026-10-25T14:10:00Z",
      "user": "Hendra Wijaya (PIC)",
      "role": "finance_manager",
      "action": "PENGAJUAN_DANA_PIC",
      "detail": "Mengajukan reimbursement transport Terniva sebesar Rp 1.450.000",
      "ipAddress": "192.168.1.104"
    },
    {
      "id": "log-4",
      "timestamp": "2026-10-21T11:00:00Z",
      "user": "Budi Santoso",
      "role": "admin",
      "action": "APPROVE_PENGAJUAN",
      "detail": "Menyetujui pengajuan operasional AWS KawanEdu ND-OPR-202610-001 Rp 8.500.000",
      "ipAddress": "192.168.1.5"
    }
  ]
}
```

---

### 4.9 Sub-Modul: Pengaturan Kredensial API & Secret (Admin)

#### 4.9.1 GET /admin/settings/keys
Melihat informasi kredensial API Key yang aktif.

**Method & URL:**
```http
GET https://api.inovasidigital.id/v1/admin/settings/keys
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
```

**Request Body (JSON):**
```
None (Tidak memerlukan payload body)
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "apiKey": "idk_live_a89f3c1d92e7428ba90f413d7890b21c",
    "secretKeyMasked": "idk_sec_7a2e89d91f4c3b5a...****",
    "lastGeneratedAt": "2026-10-01T08:00:00Z",
    "generatedBy": "Budi Santoso (Admin)"
  }
}
```

---

#### 4.9.2 POST /admin/settings/regenerate-keys
Meregenerasi pasangan API Key dan Secret Key baru. Kunci sebelumnya langsung kadaluarsa.

**Method & URL:**
```http
POST https://api.inovasidigital.id/v1/admin/settings/regenerate-keys
```

**Request Headers:**
```http
X-API-KEY: idk_live_a89f3c1d92e7428ba90f413d7890b21c
Authorization: Bearer idk_sec_7a2e89d91f4c3b5a9821ef456012cba8973d4e5f
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "confirm": true
}
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Pasangan API Key & Secret Key baru berhasil dibuat",
  "data": {
    "apiKey": "idk_live_b78f4d2e11a9428cb11f524e8991c32d",
    "secretKey": "idk_sec_8b3f90e02f5d4c6b0932fe567123dcb9084e5f6a",
    "lastGeneratedAt": "2026-10-28T19:48:00.000Z",
    "generatedBy": "Budi Santoso (Admin)"
  }
}
```

---

## 5. Ringkasan Format Respons Error Standar

Semua kegagalan request mengembalikan kode status HTTP standar RFC 7231 dengan format payload JSON yang konsisten:

### 5.1 400 Bad Request (Validasi Input Gagal)
```json
{
  "status": "error",
  "code": 400,
  "message": "Validasi input gagal",
  "errors": [
    { "field": "jumlah", "message": "Nominal pengajuan wajib bernilai lebih dari 0" },
    { "field": "noRekTujuan", "message": "Nomor rekening tujuan wajib diisi" }
  ]
}
```

### 5.2 401 Unauthorized (Autentikasi Gagal)
```json
{
  "status": "error",
  "code": 401,
  "message": "Autentikasi gagal: X-API-KEY atau Authorization Bearer token tidak valid atau sudah kadaluarsa"
}
```

### 5.3 403 Forbidden (Hak Akses Peran Tidak Memadai)
```json
{
  "status": "error",
  "code": 403,
  "message": "Akses ditolak: Endpoint ini hanya dapat diakses oleh peran Administrator"
}
```

### 5.4 404 Not Found (Data Tidak Ditemukan)
```json
{
  "status": "error",
  "code": 404,
  "message": "Data pengajuan atau referensi ID tidak ditemukan di sistem"
}
```

### 5.5 500 Internal Server Error (Kesalahan Server)
```json
{
  "status": "error",
  "code": 500,
  "message": "Terjadi kesalahan internal pada pemrosesan server backend"
}
```
