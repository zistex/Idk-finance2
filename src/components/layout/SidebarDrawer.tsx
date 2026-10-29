import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Send,
  ArrowDownCircle,
  BarChart3,
  CheckCircle2,
  Users,
  Tags,
  Briefcase,
  UserCheck,
  ListOrdered,
  History,
  KeyRound,
  X,
  Building2,
  CreditCard,
  Layers,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeMenu, setActiveMenu, fundRequests } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Badge counters
  const pendingAdminApprovalCount = fundRequests.filter(
    (r) => r.status === 'pending_admin_approval'
  ).length;

  const pendingFinanceReviewCount = fundRequests.filter(
    (r) => r.status === 'pending_pic_review'
  ).length;

  const rejectedCount = fundRequests.filter(
    (r) => r.status === 'rejected'
  ).length;

  const readyToTransferCount = fundRequests.filter(
    (r) => r.status === 'approved'
  ).length;

  const handleSelect = (key: string) => {
    setActiveMenu(key);
    // On small screens, close the drawer
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                PT. Inovasi Digital Kreasi
              </h1>
              <p className="text-[11px] text-slate-400">Sistem Internal Operasional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            Peran Aktif
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAdmin ? 'bg-blue-400' : 'bg-emerald-400'
                }`}
              />
              {isAdmin ? 'Administrator Utama' : 'Finance Manager'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">{currentUser?.name}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {isAdmin ? (
            /* ADMIN MODULES ONLY */
            <>
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Verifikasi & Persetujuan
              </div>
              <button
                onClick={() => handleSelect('approval_pengajuan')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'approval_pengajuan'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approval Pengajuan Dana</span>
                </div>
                {pendingAdminApprovalCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {pendingAdminApprovalCount}
                  </span>
                )}
              </button>

              <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Master Data
              </div>
              <button
                onClick={() => handleSelect('crud_employee')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'crud_employee'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>CRUD Employee</span>
              </button>

              <button
                onClick={() => handleSelect('crud_kategori')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'crud_kategori'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Tags className="w-4 h-4" />
                <span>CRUD Kategori</span>
              </button>

              <button
                onClick={() => handleSelect('crud_proyek')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'crud_proyek'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>CRUD Proyek</span>
              </button>

              <button
                onClick={() => handleSelect('crud_user')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'crud_user'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>CRUD User</span>
              </button>

              <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Audit & Laporan
              </div>
              <button
                onClick={() => handleSelect('laporan_admin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'laporan_admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Laporan Keuangan</span>
              </button>

              <button
                onClick={() => handleSelect('daftar_transaksi')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'daftar_transaksi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Daftar Transaksi</span>
              </button>

              <button
                onClick={() => handleSelect('daftar_logs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'daftar_logs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Daftar Logs</span>
              </button>

              <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Sistem
              </div>
              <button
                onClick={() => handleSelect('pengaturan')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'pengaturan'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Pengaturan API & Secret</span>
              </button>
            </>
          ) : (
            /* FINANCE MANAGER MODULES ONLY */
            <>
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Operasional Finansial
              </div>
              <button
                onClick={() => handleSelect('pengajuan_dana')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'pengajuan_dana'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Pengajuan Dana</span>
                </div>
                {pendingFinanceReviewCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {pendingFinanceReviewCount} Baru
                  </span>
                )}
                {rejectedCount > 0 && (
                  <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {rejectedCount} Revisi
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelect('transfer_bank')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'transfer_bank'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Transfer Bank & Disbursement</span>
                </div>
                {readyToTransferCount > 0 && (
                  <span className="bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {readyToTransferCount} Siap
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelect('uang_masuk')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'uang_masuk'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Pencatatan Uang Masuk</span>
              </button>

              <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Laporan & Pembukuan
              </div>
              <button
                onClick={() => handleSelect('laporan_finance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeMenu === 'laporan_finance'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Laporan Keuangan</span>
              </button>
            </>
          )}
        </div>

        {/* Footer info in drawer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span>Versi Internal 1.0</span>
            <span className="font-mono text-slate-500">PT. IDK</span>
          </div>
        </div>
      </aside>
    </>
  );
};
