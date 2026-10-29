import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  RotateCcw,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, resetAllData, activeMenu } = useApp();

  const getMenuLabel = (key: string): string => {
    const map: Record<string, string> = {
      // Finance
      pengajuan_dana: 'Pengajuan Dana',
      transfer_bank: 'Transfer Bank & Disbursement',
      uang_masuk: 'Pencatatan Uang Masuk',
      laporan_finance: 'Laporan Keuangan',
      // Admin
      approval_pengajuan: 'Approval Pengajuan Dana',
      crud_employee: 'Kelola Employee',
      crud_kategori: 'Kelola Kategori Uang Masuk',
      crud_proyek: 'Kelola Proyek',
      crud_user: 'Kelola Pengguna Sistem',
      laporan_admin: 'Laporan Keuangan & Laba Rugi',
      daftar_transaksi: 'Daftar Transaksi Terintegrasi',
      daftar_logs: 'Daftar Audit Logs Sistem',
      pengaturan: 'Pengaturan API & Secret Key',
    };
    return map[key] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-800 hidden sm:inline">
              PT. Inovasi Digital Kreasi
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <span className="font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded text-xs sm:text-sm">
              {getMenuLabel(activeMenu)}
            </span>
          </div>
        </div>

        {/* Right: User info & Actions */}
        <div className="flex items-center gap-3">
          {/* User profile info */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{currentUser?.name}</div>
              <div className="text-[11px] text-slate-600 uppercase font-mono tracking-tight">
                {currentUser?.role === 'admin' ? 'Role Admin' : 'Finance Manager'}
              </div>
            </div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                currentUser?.role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </div>

            {/* Quick action buttons */}
            <button
              onClick={resetAllData}
              title="Reset ke Mock Data Awal"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              title="Keluar dari Sistem"
              className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
