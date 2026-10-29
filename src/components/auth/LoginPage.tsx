import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Shield, Wallet, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(email, password);
    if (!success) {
      setErrorMsg('Email atau password tidak sesuai. Silakan periksa kembali.');
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    login(roleEmail, rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8">
        {/* Company Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            PT. Inovasi Digital Kreasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Internal Operasional & Manajemen Keuangan
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@inovasidigital.id"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick One-Click Credentials for Review */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Akses Cepat Pengujian Role
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@inovasidigital.id', 'admin123')}
              className="p-3 border border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Role Admin</span>
              </div>
              <div className="text-[11px] text-slate-600 truncate">Budi Santoso</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('finance@inovasidigital.id', 'finance123')}
              className="p-3 border border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs mb-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>Finance Mgr</span>
              </div>
              <div className="text-[11px] text-slate-600 truncate">Siti Rahmawati</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">finance123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
