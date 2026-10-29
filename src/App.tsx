/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { SidebarDrawer } from './components/layout/SidebarDrawer';
import { Header } from './components/layout/Header';

// Finance Manager Modules
import { PengajuanDanaModule } from './components/finance/PengajuanDanaModule';
import { TransferBankModule } from './components/finance/TransferBankModule';
import { PencatatanUangMasukModule } from './components/finance/PencatatanUangMasukModule';
import { LaporanFinanceModule } from './components/finance/LaporanFinanceModule';

// Admin Modules
import { ApprovalPengajuanModule } from './components/admin/ApprovalPengajuanModule';
import { CrudEmployeeModule } from './components/admin/CrudEmployeeModule';
import { CrudKategoriModule } from './components/admin/CrudKategoriModule';
import { CrudProyekModule } from './components/admin/CrudProyekModule';
import { CrudUserModule } from './components/admin/CrudUserModule';
import { LaporanAdminModule } from './components/admin/LaporanAdminModule';
import { DaftarTransaksiModule } from './components/admin/DaftarTransaksiModule';
import { DaftarLogsModule } from './components/admin/DaftarLogsModule';
import { PengaturanModule } from './components/admin/PengaturanModule';

const MainAppLayout: React.FC = () => {
  const { currentUser, activeMenu } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'admin';

  const renderActiveModule = () => {
    if (isAdmin) {
      switch (activeMenu) {
        case 'approval_pengajuan':
          return <ApprovalPengajuanModule />;
        case 'crud_employee':
          return <CrudEmployeeModule />;
        case 'crud_kategori':
          return <CrudKategoriModule />;
        case 'crud_proyek':
          return <CrudProyekModule />;
        case 'crud_user':
          return <CrudUserModule />;
        case 'laporan_admin':
          return <LaporanAdminModule />;
        case 'daftar_transaksi':
          return <DaftarTransaksiModule />;
        case 'daftar_logs':
          return <DaftarLogsModule />;
        case 'pengaturan':
          return <PengaturanModule />;
        default:
          return <ApprovalPengajuanModule />;
      }
    } else {
      // Finance Manager
      switch (activeMenu) {
        case 'pengajuan_dana':
          return <PengajuanDanaModule />;
        case 'transfer_bank':
          return <TransferBankModule />;
        case 'uang_masuk':
          return <PencatatanUangMasukModule />;
        case 'laporan_finance':
          return <LaporanFinanceModule />;
        default:
          return <PengajuanDanaModule />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Left Drawer Navigation */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
