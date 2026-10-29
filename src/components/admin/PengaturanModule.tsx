import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTanggalWaktu, formatRupiah } from '../../utils/formatters';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Code2,
  Send,
  Filter,
  CheckCircle2,
  Layers,
  ArrowRight,
  Database,
  Terminal,
} from 'lucide-react';

export const PengaturanModule: React.FC = () => {
  const { apiSettings, regenerateApiKeys, fundRequests, projects, createFundRequest } = useApp();

  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab for API Guide
  const [activeApiTab, setActiveApiTab] = useState<'endpoint_post' | 'endpoint_get'>('endpoint_post');

  // Simulator for Endpoint 2: GET
  const [simGetProject, setSimGetProject] = useState<string>('all');
  const [simGetStatus, setSimGetStatus] = useState<string>('all');
  const [simGetResponse, setSimGetResponse] = useState<string | null>(null);

  // Simulator for Endpoint 1: POST
  const [simPostCategory, setSimPostCategory] = useState<'operasional' | 'reimburse' | 'pengadaan'>('operasional');
  const [simPostProject, setSimPostProject] = useState<string>('KawanEdu');
  const [simPostApplicant, setSimPostApplicant] = useState<string>('Budi Kurnia (DevOps Lead)');
  const [simPostAmount, setSimPostAmount] = useState<number>(3500000);
  const [simPostDesc, setSimPostDesc] = useState<string>('Biaya perpanjangan SSL Wildcard & DNS Server');
  const [simPostResponse, setSimPostResponse] = useState<string | null>(null);
  const [simPostSuccess, setSimPostSuccess] = useState<boolean>(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerate = () => {
    if (
      confirm(
        'PERINGATAN: Meregenerasi API Key & Secret Key akan membuat kunci sebelumnya tidak berlaku. Lanjutkan?'
      )
    ) {
      regenerateApiKeys();
    }
  };

  // Run GET Simulation
  const handleRunGetSimulation = () => {
    const filtered = fundRequests.filter((req) => {
      if (simGetProject !== 'all' && req.namaProyek !== simGetProject) return false;
      if (simGetStatus !== 'all' && req.status !== simGetStatus) return false;
      return true;
    });

    const responsePayload = {
      status: 'success',
      code: 200,
      timestamp: new Date().toISOString(),
      metadata: {
        total_data: filtered.length,
        filters: {
          namaProyek: simGetProject === 'all' ? null : simGetProject,
          status: simGetStatus === 'all' ? null : simGetStatus,
        },
      },
      data: filtered.map((r) => ({
        id: r.id,
        nomorPengajuan: r.nomorPengajuan,
        kategori: r.kategori,
        sumber: r.sumber,
        namaProyek: r.namaProyek || null,
        namaPemohon: r.namaPemohon || r.picName || null,
        jumlah: r.jumlah,
        status: r.status,
        keterangan: r.keterangan,
        tujuanTransfer: r.noRekTujuan
          ? {
              bank: r.bankTujuan,
              noRekening: r.noRekTujuan,
              atasNama: r.atasNamaTujuan,
            }
          : null,
        detailInvoice: r.detailTagihan || null,
        listingPayroll: r.listingEmployee || null,
        catatanPenolakan: r.catatanPenolakan || null,
        riwayatRevisi: r.riwayatRevisi || [],
        buktiTransfer: r.buktiTransferNama
          ? {
              fileNama: r.buktiTransferNama,
              tanggalTransfer: r.tanggalTransfer,
              disbursedBy: r.disbursedBy,
            }
          : null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };

    setSimGetResponse(JSON.stringify(responsePayload, null, 2));
  };

  // Run POST Simulation
  const handleRunPostSimulation = () => {
    const newReq = createFundRequest({
      kategori: simPostCategory,
      sumber: 'finance',
      namaProyek: simPostProject,
      namaPemohon: simPostApplicant,
      jumlah: Number(simPostAmount),
      bankTujuan: 'BCA',
      noRekTujuan: '5270198271',
      atasNamaTujuan: simPostApplicant,
      keterangan: simPostDesc,
      lampiranNama: 'Quotation_Tagihan_SSL.pdf',
      status: 'pending_admin_approval',
    });

    const successResponse = {
      status: 'success',
      code: 201,
      message: 'Pengajuan dana berhasil dibuat dan menunggu approval Admin',
      timestamp: new Date().toISOString(),
      data: {
        id: newReq.id,
        nomorPengajuan: newReq.nomorPengajuan,
        kategori: newReq.kategori,
        sumber: newReq.sumber,
        namaProyek: newReq.namaProyek,
        namaPemohon: newReq.namaPemohon,
        jumlah: newReq.jumlah,
        status: newReq.status,
        keterangan: newReq.keterangan,
        createdAt: newReq.createdAt,
      },
    };

    setSimPostResponse(JSON.stringify(successResponse, null, 2));
    setSimPostSuccess(true);
  };

  // Sample Responses for static documentation
  const samplePostResponse = JSON.stringify(
    {
      status: 'success',
      code: 201,
      message: 'Pengajuan dana berhasil dibuat dan menunggu approval Admin',
      timestamp: '2026-10-28T19:30:00.000Z',
      data: {
        id: 'req-1729881234567',
        nomorPengajuan: 'ND-OPR-202610-007',
        kategori: 'operasional',
        sumber: 'finance',
        namaProyek: 'KawanEdu',
        namaPemohon: 'Rizki Firmansyah',
        jumlah: 8500000,
        tujuanTransfer: {
          bank: 'BCA',
          noRekening: '0129384756',
          atasNama: 'PT Cloud Indo Perkasa',
        },
        keterangan: 'Perpanjangan Server Production AWS Cloud & CDN Streaming',
        lampiranNama: 'Invoice_AWS_KawanEdu_Nov.pdf',
        status: 'pending_admin_approval',
        createdAt: '2026-10-28T19:30:00.000Z',
        createdBy: 'Siti Rahmawati (Finance Manager)',
      },
    },
    null,
    2
  );

  const sampleGetResponse = JSON.stringify(
    {
      status: 'success',
      code: 200,
      timestamp: '2026-10-28T19:30:00.000Z',
      metadata: {
        total_data: 2,
        filters: {
          namaProyek: 'KawanEdu',
          status: 'approved',
        },
      },
      data: [
        {
          id: 'req-1',
          nomorPengajuan: 'ND-OPR-202610-001',
          kategori: 'operasional',
          sumber: 'finance',
          namaProyek: 'KawanEdu',
          namaPemohon: 'Rizki Firmansyah (Lead DevOps)',
          jumlah: 8500000,
          status: 'approved',
          keterangan: 'Perpanjangan Server Production AWS Cloud & CDN Streaming Edukasi Periode Nov 2026',
          tujuanTransfer: {
            bank: 'BCA',
            noRekening: '0129384756',
            atasNama: 'PT Cloud Indo Perkasa',
          },
          lampiranNama: 'Invoice_AWS_KawanEdu_Nov.pdf',
          catatanPenolakan: null,
          riwayatRevisi: [],
          buktiTransfer: null,
          createdAt: '2026-10-20T09:00:00.000Z',
          updatedAt: '2026-10-21T11:00:00.000Z',
          createdBy: 'Siti Rahmawati',
        },
        {
          id: 'req-6',
          nomorPengajuan: 'ND-INV-202610-006',
          kategori: 'invoice',
          sumber: 'finance',
          namaProyek: 'KawanEdu',
          jumlah: 12500000,
          status: 'approved',
          keterangan: 'Tagihan implementasi modul KawanEdu semester ganjil tahun ajaran 2026/2027',
          tujuanTransfer: {
            tujuan: 'Yayasan Bina Insan Mandiri',
            nomorInvoice: 'INV-KWE-2026-088',
          },
          detailInvoice: [
            {
              id: 'invd-1',
              deskripsi: 'Lisensi Akun Guru Modul KawanEdu (30 Akun)',
              qty: 30,
              hargaSatuan: 150000,
              total: 4500000,
            },
            {
              id: 'invd-2',
              deskripsi: 'Lisensi Akun Siswa Terpadu (160 Siswa)',
              qty: 160,
              hargaSatuan: 50000,
              total: 8000000,
            },
          ],
          catatanPenolakan: null,
          riwayatRevisi: [],
          buktiTransfer: null,
          createdAt: '2026-10-18T10:00:00.000Z',
          updatedAt: '2026-10-19T14:00:00.000Z',
          createdBy: 'Siti Rahmawati',
        },
      ],
    },
    null,
    2
  );

  const curlPostExample = `curl -X POST https://api.inovasidigital.id/v1/pengajuan \\
  -H "X-API-KEY: ${apiSettings.apiKey}" \\
  -H "Authorization: Bearer ${apiSettings.secretKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "kategori": "operasional",
    "sumber": "finance",
    "namaProyek": "KawanEdu",
    "namaPemohon": "Rizki Firmansyah",
    "jumlah": 8500000,
    "bankTujuan": "BCA",
    "noRekTujuan": "0129384756",
    "atasNamaTujuan": "PT Cloud Indo Perkasa",
    "keterangan": "Perpanjangan Server Production AWS Cloud & CDN Streaming",
    "lampiranNama": "Invoice_AWS_KawanEdu_Nov.pdf"
  }'`;

  const curlGetExample = `curl -X GET "https://api.inovasidigital.id/v1/pengajuan?namaProyek=KawanEdu&status=approved" \\
  -H "X-API-KEY: ${apiSettings.apiKey}" \\
  -H "Authorization: Bearer ${apiSettings.secretKey}" \\
  -H "Content-Type: application/json"`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengaturan Kredensial API & Secret</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola Public API Key dan Secret Key untuk integrasi antarmuka JSON endpoint PT. Inovasi Digital Kreasi.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate API Keys</span>
        </button>
      </div>

      {/* Keys Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        {/* API Key */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800">
              Public API Key (Header: X-API-KEY)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">X-API-KEY</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={apiSettings.apiKey}
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
            <button
              onClick={() => handleCopy(apiSettings.apiKey, 'apiKey')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copiedKey === 'apiKey' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Key</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secret Key */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800">
              Secret Key (Authorization: Bearer &lt;token&gt;)
            </label>
            <span className="text-[11px] text-red-500 font-medium">
              Rahasia: Gunakan hanya di lingkungan server backend
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type={showSecret ? 'text' : 'password'}
              readOnly
              value={apiSettings.secretKey}
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
              title={showSecret ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleCopy(apiSettings.secretKey, 'secretKey')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copiedKey === 'secretKey' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Secret</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Terakhir Digenerate:{' '}
            <strong className="text-slate-800 font-mono">
              {formatTanggalWaktu(apiSettings.lastGeneratedAt)}
            </strong>
          </div>
          <div>
            Oleh:{' '}
            <strong className="text-slate-800 font-medium">{apiSettings.generatedBy}</strong>
          </div>
        </div>
      </div>

      {/* PANDUAN INTEGRASI MOCK DATA JSON KE API BACKEND (2 ENDPOINT) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Panduan Integrasi Mock Data JSON ke API Backend
              </h3>
              <p className="text-xs text-slate-500">
                Spesifikasi teknis 2 Endpoint utama untuk integrasi sistem pengajuan dana PT. Inovasi Digital Kreasi.
              </p>
            </div>
          </div>

          {/* Endpoint Switcher Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveApiTab('endpoint_post')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeApiTab === 'endpoint_post'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-900/30 text-white uppercase">
                POST
              </span>
              <span>1. POST Pengajuan Dana</span>
            </button>

            <button
              onClick={() => setActiveApiTab('endpoint_get')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeApiTab === 'endpoint_get'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-900/30 text-white uppercase">
                GET
              </span>
              <span>2. GET List & Riwayat Pengajuan (Filter)</span>
            </button>
          </div>
        </div>

        {/* 1. ENDPOINT: POST PENGAJUAN DANA */}
        {activeApiTab === 'endpoint_post' && (
          <div className="p-6 space-y-6 text-xs">
            {/* Endpoint Spec Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded">
                    POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    /api/v1/pengajuan
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Content-Type: <strong className="font-mono">application/json</strong>
                </span>
              </div>
              <p className="text-slate-600">
                Membuat pengajuan dana baru ke sistem. Mendukung 6 jenis modul (<code>operasional</code>, <code>payroll</code>, <code>reimburse</code>, <code>pajak</code>, <code>pengadaan</code>, <code>invoice</code>) baik bersumber dari <code>finance</code> maupun <code>pic</code>.
              </p>
            </div>

            {/* Request Headers & Body Spec */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2">Request Headers Wajib:</h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div><span className="text-slate-400">X-API-KEY:</span> {apiSettings.apiKey}</div>
                  <div><span className="text-slate-400">Authorization:</span> Bearer {apiSettings.secretKey.slice(0, 16)}...</div>
                  <div><span className="text-slate-400">Content-Type:</span> application/json</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2">Parameter Utama Request Body:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><code>kategori</code>: operasional | payroll | reimburse | pajak | pengadaan | invoice</li>
                  <li><code>sumber</code>: finance (langsung ke Admin) | pic (perlu review Finance)</li>
                  <li><code>namaProyek</code>: KawanEdu | Terniva | Scrava</li>
                  <li><code>namaPemohon</code>: Nama lengkap pemohon</li>
                  <li><code>jumlah</code>: Nilai nominal angka (Rp)</li>
                  <li><code>bankTujuan</code>, <code>noRekTujuan</code>, <code>atasNamaTujuan</code></li>
                  <li><code>keterangan</code>: Rincian keperluan dana</li>
                </ul>
              </div>
            </div>

            {/* cURL Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  Contoh Perintah cURL (POST):
                </span>
                <button
                  onClick={() => handleCopy(curlPostExample, 'curl_post')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'curl_post' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'curl_post' ? 'cURL Tersalin' : 'Salin cURL'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {curlPostExample}
              </pre>
            </div>

            {/* Sample Response (HTTP 201 Created) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Sample Response (HTTP 201 Created):
                </span>
                <button
                  onClick={() => handleCopy(samplePostResponse, 'sample_post_res')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'sample_post_res' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'sample_post_res' ? 'JSON Tersalin' : 'Salin Sample JSON'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed border border-slate-800">
                {samplePostResponse}
              </pre>
            </div>

            {/* Interactive Live POST Simulator */}
            <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    ▶
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Simulasi Langsung: Uji Coba POST Pengajuan ke State Real
                  </h4>
                </div>
                <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Live Tester
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kategori Pengajuan
                  </label>
                  <select
                    value={simPostCategory}
                    onChange={(e) => setSimPostCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="operasional">operasional</option>
                    <option value="reimburse">reimburse</option>
                    <option value="pengadaan">pengadaan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Proyek
                  </label>
                  <select
                    value={simPostProject}
                    onChange={(e) => setSimPostProject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.nama}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jumlah Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    value={simPostAmount}
                    onChange={(e) => setSimPostAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Keterangan Pengajuan
                </label>
                <input
                  type="text"
                  value={simPostDesc}
                  onChange={(e) => setSimPostDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Data yang dikirim akan langsung tersimpan di antrean Approval Admin.
                </span>
                <button
                  type="button"
                  onClick={handleRunPostSimulation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim POST Request</span>
                </button>
              </div>

              {/* POST Response Display */}
              {simPostResponse && (
                <div className="space-y-2 pt-2 border-t border-blue-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      HTTP 201 Created (Respons API Berhasil)
                    </span>
                    <button
                      onClick={() => handleCopy(simPostResponse, 'sim_post_res')}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      {copiedKey === 'sim_post_res' ? 'Tersalin!' : 'Salin JSON Respons'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg font-mono text-[11px] max-h-56 overflow-y-auto">
                    {simPostResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ENDPOINT: GET LIST RIWAYAT PENGAJUAN DANA */}
        {activeApiTab === 'endpoint_get' && (
          <div className="p-6 space-y-6 text-xs">
            {/* Endpoint Spec Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-600 text-white font-mono font-bold text-xs rounded">
                    GET
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    /api/v1/pengajuan
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Format Output: <strong className="font-mono">application/json</strong>
                </span>
              </div>
              <p className="text-slate-600">
                Mengambil daftar & riwayat pengajuan dana beserta status terkini, detail tagihan (invoice), rincian listing karyawan (payroll), riwayat catatan revisi, dan status bukti transfer. Dapat difilter menggunakan query parameters <strong>namaProyek</strong> dan <strong>status</strong>.
              </p>
            </div>

            {/* Query Parameters Specification */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-2">Query Parameters Filter:</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Parameter</th>
                      <th className="py-2.5 px-3">Tipe Data</th>
                      <th className="py-2.5 px-3">Wajib?</th>
                      <th className="py-2.5 px-3">Pilihan Nilai / Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-3 text-blue-700 font-bold">namaProyek</td>
                      <td className="py-2 px-3 text-slate-500">string</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Opsional</td>
                      <td className="py-2 px-3 font-sans text-slate-700">
                        Filter nama proyek: <code>KawanEdu</code>, <code>Terniva</code>, <code>Scrava</code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-blue-700 font-bold">status</td>
                      <td className="py-2 px-3 text-slate-500">string</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">Opsional</td>
                      <td className="py-2 px-3 font-sans text-slate-700">
                        <code>pending_admin_approval</code>, <code>approved</code>, <code>rejected</code>, <code>done</code>, <code>pending_pic_review</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* cURL Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                  Contoh Perintah cURL (GET dengan Filter):
                </span>
                <button
                  onClick={() => handleCopy(curlGetExample, 'curl_get')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'curl_get' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'curl_get' ? 'cURL Tersalin' : 'Salin cURL'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {curlGetExample}
              </pre>
            </div>

            {/* Sample Response (HTTP 200 OK) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Sample Response (HTTP 200 OK):
                </span>
                <button
                  onClick={() => handleCopy(sampleGetResponse, 'sample_get_res')}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'sample_get_res' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'sample_get_res' ? 'JSON Tersalin' : 'Salin Sample JSON'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                {sampleGetResponse}
              </pre>
            </div>

            {/* Interactive Live GET Simulator */}
            <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ▶
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Simulasi Langsung: Uji Coba Filter GET & Lihat Response JSON
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Query Tester
                </span>
              </div>

              {/* Filter selections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Filter by Nama Proyek (?namaProyek=...)
                  </label>
                  <select
                    value={simGetProject}
                    onChange={(e) => setSimGetProject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="all">Semua Proyek</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.nama}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Filter by Status (?status=...)
                  </label>
                  <select
                    value={simGetStatus}
                    onChange={(e) => setSimGetStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending_admin_approval">pending_admin_approval (Menunggu Admin)</option>
                    <option value="approved">approved (Disetujui Admin / Siap Transfer)</option>
                    <option value="rejected">rejected (Ditolak / Perlu Revisi)</option>
                    <option value="done">done (Selesai Ditransfer)</option>
                    <option value="pending_pic_review">pending_pic_review (Dari PIC)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-[11px] text-slate-600">
                  Endpoint: /api/v1/pengajuan{simGetProject !== 'all' || simGetStatus !== 'all' ? '?' : ''}
                  {simGetProject !== 'all' ? `namaProyek=${simGetProject}` : ''}
                  {simGetProject !== 'all' && simGetStatus !== 'all' ? '&' : ''}
                  {simGetStatus !== 'all' ? `status=${simGetStatus}` : ''}
                </span>

                <button
                  type="button"
                  onClick={handleRunGetSimulation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Jalankan GET Query</span>
                </button>
              </div>

              {/* Response Display */}
              {simGetResponse && (
                <div className="space-y-2 pt-2 border-t border-emerald-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      HTTP 200 OK (Data Hasil Filter Ditemukan)
                    </span>
                    <button
                      onClick={() => handleCopy(simGetResponse, 'sim_get_res')}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      {copiedKey === 'sim_get_res' ? 'Tersalin!' : 'Salin JSON Respons'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg font-mono text-[11px] max-h-72 overflow-y-auto">
                    {simGetResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
