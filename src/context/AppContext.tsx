import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Employee,
  IncomeCategory,
  Project,
  FundRequest,
  GroupDisbursement,
  IncomeRecord,
  Transaction,
  SystemLog,
  ApiSettings,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_CATEGORIES,
  INITIAL_PROJECTS,
  INITIAL_FUND_REQUESTS,
  INITIAL_GROUP_DISBURSEMENTS,
  INITIAL_INCOME_RECORDS,
  INITIAL_TRANSACTIONS,
  INITIAL_LOGS,
  INITIAL_API_SETTINGS,
} from '../data/mockData';
import { generateRandomKey } from '../utils/formatters';

interface AppContextType {
  currentUser: User | null;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  
  // Auth
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  switchUser: (role: UserRole) => void;
  
  // Data State
  employees: Employee[];
  categories: IncomeCategory[];
  projects: Project[];
  users: User[];
  fundRequests: FundRequest[];
  groupDisbursements: GroupDisbursement[];
  incomeRecords: IncomeRecord[];
  transactions: Transaction[];
  logs: SystemLog[];
  apiSettings: ApiSettings;
  
  // Fund Request Actions
  createFundRequest: (req: Omit<FundRequest, 'id' | 'nomorPengajuan' | 'createdAt' | 'updatedAt' | 'createdBy'>) => FundRequest;
  updateFundRequest: (id: string, req: Partial<FundRequest>) => void;
  deleteFundRequest: (id: string) => void;
  reviewPicRequest: (id: string, action: 'approve' | 'reject', notes?: string) => void;
  adminApproveRequest: (id: string) => void;
  adminRejectRequest: (id: string, notes: string) => void;
  reviseFundRequest: (id: string, updatedFields: Partial<FundRequest>, revisionNotes: string) => void;
  uploadTransferProof: (id: string, proofName: string, proofUrl: string, tanggalTransfer: string) => void;
  
  // Group Disbursement Actions
  createGroupDisbursement: (data: Omit<GroupDisbursement, 'id' | 'createdAt'>) => GroupDisbursement;
  updateGroupDisbursement: (id: string, data: Partial<GroupDisbursement>) => void;
  deleteGroupDisbursement: (id: string) => void;
  
  // Income Record Actions
  createIncomeRecord: (data: Omit<IncomeRecord, 'id' | 'createdAt' | 'createdBy'>) => IncomeRecord;
  deleteIncomeRecord: (id: string) => void;
  
  // Admin Master CRUD
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  addCategory: (cat: Omit<IncomeCategory, 'id'>) => IncomeCategory;
  updateCategory: (id: string, cat: Partial<IncomeCategory>) => void;
  deleteCategory: (id: string) => void;
  
  addProject: (prj: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, prj: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addUser: (usr: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, usr: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Settings & System
  regenerateApiKeys: () => void;
  addLog: (action: string, detail: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'idk_current_user',
  EMPLOYEES: 'idk_employees',
  CATEGORIES: 'idk_categories',
  PROJECTS: 'idk_projects',
  USERS: 'idk_users',
  FUND_REQUESTS: 'idk_fund_requests',
  GROUP_DISBURSEMENTS: 'idk_group_disbursements',
  INCOME_RECORDS: 'idk_income_records',
  TRANSACTIONS: 'idk_transactions',
  LOGS: 'idk_logs',
  API_SETTINGS: 'idk_api_settings',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeMenu, setActiveMenu] = useState<string>('pengajuan_dana');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Set default active menu based on role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setActiveMenu('approval_pengajuan');
    } else {
      setActiveMenu('pengajuan_dana');
    }
  }, [currentUser?.role]);

  // Data states with persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [categories, setCategories] = useState<IncomeCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [fundRequests, setFundRequests] = useState<FundRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FUND_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_FUND_REQUESTS;
  });

  const [groupDisbursements, setGroupDisbursements] = useState<GroupDisbursement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUP_DISBURSEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_GROUP_DISBURSEMENTS;
  });

  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOME_RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_INCOME_RECORDS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.API_SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_API_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUND_REQUESTS, JSON.stringify(fundRequests));
  }, [fundRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUP_DISBURSEMENTS, JSON.stringify(groupDisbursements));
  }, [groupDisbursements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOME_RECORDS, JSON.stringify(incomeRecords));
  }, [incomeRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(apiSettings));
  }, [apiSettings]);

  // Log Helper
  const addLog = (action: string, detail: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.name : 'System',
      role: currentUser ? currentUser.role : 'system',
      action,
      detail,
      ipAddress: '192.168.1.10',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Auth
  const login = (email: string, pass: string): boolean => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
    );
    if (found) {
      setCurrentUser(found);
      addLog('USER_LOGIN', `User ${found.name} (${found.role}) berhasil masuk ke sistem.`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addLog('USER_LOGOUT', `User ${currentUser.name} keluar dari sistem.`);
    }
    setCurrentUser(null);
  };

  const switchUser = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      addLog('SWITCH_ROLE', `Beralih peran aktif ke ${targetUser.name} (${role}).`);
    }
  };

  // Fund Requests
  const createFundRequest = (
    data: Omit<FundRequest, 'id' | 'nomorPengajuan' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): FundRequest => {
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
    const randNum = String(fundRequests.length + 1).padStart(3, '0');
    const nomorPengajuan = `ND-${code}-${yearMonth}-${randNum}`;

    const newRequest: FundRequest = {
      ...data,
      id: `req-${Date.now()}`,
      nomorPengajuan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.name : 'PIC',
    };

    setFundRequests((prev) => [newRequest, ...prev]);
    addLog(
      `CREATE_PENGAJUAN_${code}`,
      `Membuat pengajuan dana ${data.kategori} (${nomorPengajuan}) sejumlah Rp ${data.jumlah.toLocaleString('id-ID')} [Sumber: ${data.sumber.toUpperCase()}].`
    );

    return newRequest;
  };

  const updateFundRequest = (id: string, updatedFields: Partial<FundRequest>) => {
    setFundRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields, updatedAt: new Date().toISOString() } : item))
    );
    addLog('UPDATE_PENGAJUAN', `Memperbarui data pengajuan dana ID ${id}`);
  };

  const deleteFundRequest = (id: string) => {
    const req = fundRequests.find((r) => r.id === id);
    setFundRequests((prev) => prev.filter((item) => item.id !== id));
    addLog('DELETE_PENGAJUAN', `Menghapus pengajuan dana ${req?.nomorPengajuan || id}`);
  };

  const reviewPicRequest = (id: string, action: 'approve' | 'reject', notes?: string) => {
    setFundRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        if (action === 'approve') {
          return {
            ...req,
            status: 'pending_admin_approval',
            updatedAt: new Date().toISOString(),
          };
        } else {
          return {
            ...req,
            status: 'rejected',
            catatanPenolakan: notes || 'Ditolak oleh Finance Manager',
            updatedAt: new Date().toISOString(),
          };
        }
      })
    );
    addLog(
      `REVIEW_PIC_${action.toUpperCase()}`,
      `Finance Manager ${action === 'approve' ? 'menyetujui & meneruskan ke Admin' : 'menolak'} pengajuan PIC ID ${id}`
    );
  };

  const adminApproveRequest = (id: string) => {
    const target = fundRequests.find((r) => r.id === id);
    if (!target) return;

    setFundRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'approved',
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    );

    addLog(
      'ADMIN_APPROVE_PENGAJUAN',
      `Admin menyetujui pengajuan dana ${target.nomorPengajuan} (${target.kategori}) senilai Rp ${target.jumlah.toLocaleString('id-ID')}`
    );
  };

  const adminRejectRequest = (id: string, notes: string) => {
    const target = fundRequests.find((r) => r.id === id);
    if (!target) return;

    setFundRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'rejected',
              catatanPenolakan: notes,
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    );

    addLog(
      'ADMIN_REJECT_PENGAJUAN',
      `Admin menolak pengajuan dana ${target.nomorPengajuan} dengan catatan: "${notes}"`
    );
  };

  const reviseFundRequest = (id: string, updatedFields: Partial<FundRequest>, revisionNotes: string) => {
    const target = fundRequests.find((r) => r.id === id);
    if (!target) return;

    const riwayat = target.riwayatRevisi || [];
    const newRiwayat = [
      ...riwayat,
      {
        tanggal: new Date().toISOString(),
        catatan: revisionNotes,
        oleh: currentUser ? currentUser.name : 'Finance Manager',
      },
    ];

    setFundRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              ...updatedFields,
              status: 'pending_admin_approval',
              alasanRevisi: revisionNotes,
              riwayatRevisi: newRiwayat,
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    );

    addLog(
      'REVISI_PENGAJUAN',
      `Finance Manager merevisi pengajuan ${target.nomorPengajuan} dan mengajukan ulang ke Admin: "${revisionNotes}"`
    );
  };

  const uploadTransferProof = (
    id: string,
    proofName: string,
    proofUrl: string,
    tanggalTransfer: string
  ) => {
    const target = fundRequests.find((r) => r.id === id);
    if (!target) return;

    setFundRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'done',
              buktiTransferNama: proofName,
              buktiTransferUrl: proofUrl,
              tanggalTransfer: tanggalTransfer || new Date().toISOString().split('T')[0],
              disbursedBy: currentUser ? currentUser.name : 'Finance Manager',
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    );

    // Otomatis catat ke Daftar Transaksi sebagai Uang Keluar
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      tanggal: tanggalTransfer || new Date().toISOString().split('T')[0],
      namaProyek: target.namaProyek || 'PT Inovasi Digital Kreasi',
      judul: target.keterangan || `Transfer ${target.kategori} ${target.nomorPengajuan}`,
      status: 'done',
      kategoriTransaksi: 'uang_keluar',
      jenis: target.kategori.charAt(0).toUpperCase() + target.kategori.slice(1),
      nominal: target.jumlah,
      referensiId: target.id,
    };
    setTransactions((prev) => [newTrx, ...prev]);

    addLog(
      'UPLOAD_BUKTI_TRANSFER',
      `Bukti transfer diunggah untuk ${target.nomorPengajuan} (${formatRupiahSimple(target.jumlah)}). Status menjadi DONE.`
    );
  };

  // Group Disbursement
  const createGroupDisbursement = (
    data: Omit<GroupDisbursement, 'id' | 'createdAt'>
  ): GroupDisbursement => {
    const newGroup: GroupDisbursement = {
      ...data,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGroupDisbursements((prev) => [newGroup, ...prev]);
    addLog('CREATE_GROUP_DISBURSEMENT', `Membuat Group Disbursement "${data.judul}" (${data.details.length} penerima, Rp ${data.totalNominal.toLocaleString('id-ID')})`);
    return newGroup;
  };

  const updateGroupDisbursement = (id: string, data: Partial<GroupDisbursement>) => {
    setGroupDisbursements((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g))
    );
    addLog('UPDATE_GROUP_DISBURSEMENT', `Memperbarui Group Disbursement ID ${id}`);
  };

  const deleteGroupDisbursement = (id: string) => {
    const grp = groupDisbursements.find((g) => g.id === id);
    setGroupDisbursements((prev) => prev.filter((g) => g.id !== id));
    addLog('DELETE_GROUP_DISBURSEMENT', `Menghapus Group Disbursement "${grp?.judul || id}"`);
  };

  // Income Records
  const createIncomeRecord = (
    data: Omit<IncomeRecord, 'id' | 'createdAt' | 'createdBy'>
  ): IncomeRecord => {
    const newRec: IncomeRecord = {
      ...data,
      id: `inc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.name : 'Finance Manager',
    };
    setIncomeRecords((prev) => [newRec, ...prev]);

    // Otomatis catat ke Daftar Transaksi sebagai Uang Masuk
    const dateOnly = data.hariTanggal.split(', ')[1] || new Date().toISOString().split('T')[0];
    const newTrx: Transaction = {
      id: `trx-inc-${Date.now()}`,
      tanggal: dateOnly,
      namaProyek: data.namaProyek,
      judul: `${data.kategoriKeterangan} - ${data.namaPengirim}`,
      status: 'done',
      kategoriTransaksi: 'uang_masuk',
      jenis: data.kategoriKeterangan,
      nominal: data.jumlah,
      referensiId: newRec.id,
    };
    setTransactions((prev) => [newTrx, ...prev]);

    addLog(
      'CATAT_UANG_MASUK',
      `Mencatat uang masuk ${data.namaProyek} (${data.metodePembayaran}) dari ${data.namaPengirim} sebesar Rp ${data.jumlah.toLocaleString('id-ID')}`
    );
    return newRec;
  };

  const deleteIncomeRecord = (id: string) => {
    const rec = incomeRecords.find((i) => i.id === id);
    setIncomeRecords((prev) => prev.filter((i) => i.id !== id));
    setTransactions((prev) => prev.filter((t) => t.referensiId !== id));
    addLog('DELETE_UANG_MASUK', `Menghapus pencatatan uang masuk ID ${id} (${rec?.namaProyek})`);
  };

  // Master Employee
  const addEmployee = (emp: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addLog('ADD_EMPLOYEE', `Menambahkan karyawan baru: ${emp.nama} (${emp.bank} ${emp.noRek})`);
    return newEmp;
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...emp } : e))
    );
    addLog('UPDATE_EMPLOYEE', `Memperbarui data karyawan ID ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addLog('DELETE_EMPLOYEE', `Menghapus karyawan: ${emp?.nama || id}`);
  };

  // Master Category
  const addCategory = (cat: Omit<IncomeCategory, 'id'>): IncomeCategory => {
    const newCat: IncomeCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addLog('ADD_KATEGORI', `Menambahkan kategori uang masuk: ${cat.keterangan}`);
    return newCat;
  };

  const updateCategory = (id: string, cat: Partial<IncomeCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...cat } : c))
    );
    addLog('UPDATE_KATEGORI', `Memperbarui kategori ID ${id}`);
  };

  const deleteCategory = (id: string) => {
    const c = categories.find((cat) => cat.id === id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    addLog('DELETE_KATEGORI', `Menghapus kategori: ${c?.keterangan || id}`);
  };

  // Master Project
  const addProject = (prj: Omit<Project, 'id'>): Project => {
    const newPrj: Project = {
      ...prj,
      id: `prj-${Date.now()}`,
    };
    setProjects((prev) => [...prev, newPrj]);
    addLog('ADD_PROYEK', `Menambahkan proyek: ${prj.nama} (${prj.kode})`);
    return newPrj;
  };

  const updateProject = (id: string, prj: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prj } : p))
    );
    addLog('UPDATE_PROYEK', `Memperbarui proyek ID ${id}`);
  };

  const deleteProject = (id: string) => {
    const prj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addLog('DELETE_PROYEK', `Menghapus proyek: ${prj?.nama || id}`);
  };

  // Master User
  const addUser = (usr: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...usr,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    addLog('ADD_USER', `Menambahkan pengguna baru: ${usr.name} [Role: ${usr.role}]`);
    return newUser;
  };

  const updateUser = (id: string, usr: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...usr } : u))
    );
    addLog('UPDATE_USER', `Memperbarui user ID ${id}`);
  };

  const deleteUser = (id: string) => {
    const usr = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addLog('DELETE_USER', `Menghapus user: ${usr?.name || id}`);
  };

  // Settings
  const regenerateApiKeys = () => {
    const newKey = generateRandomKey('idk_live_', 32);
    const newSecret = generateRandomKey('idk_sec_', 40);
    const updated: ApiSettings = {
      apiKey: newKey,
      secretKey: newSecret,
      lastGeneratedAt: new Date().toISOString(),
      generatedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
    };
    setApiSettings(updated);
    addLog('REGENERATE_API_KEYS', 'Admin meregenerasi API Key dan Secret Key integrasi sistem.');
  };

  const resetAllData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setCategories(INITIAL_CATEGORIES);
    setProjects(INITIAL_PROJECTS);
    setUsers(INITIAL_USERS);
    setFundRequests(INITIAL_FUND_REQUESTS);
    setGroupDisbursements(INITIAL_GROUP_DISBURSEMENTS);
    setIncomeRecords(INITIAL_INCOME_RECORDS);
    setTransactions(INITIAL_TRANSACTIONS);
    setLogs(INITIAL_LOGS);
    setApiSettings(INITIAL_API_SETTINGS);
    addLog('RESET_SYSTEM', 'Seluruh data di-reset ke data mock awal PT. Inovasi Digital Kreasi.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeMenu,
        setActiveMenu,
        isSidebarOpen,
        setIsSidebarOpen,
        login,
        logout,
        switchUser,
        employees,
        categories,
        projects,
        users,
        fundRequests,
        groupDisbursements,
        incomeRecords,
        transactions,
        logs,
        apiSettings,
        createFundRequest,
        updateFundRequest,
        deleteFundRequest,
        reviewPicRequest,
        adminApproveRequest,
        adminRejectRequest,
        reviseFundRequest,
        uploadTransferProof,
        createGroupDisbursement,
        updateGroupDisbursement,
        deleteGroupDisbursement,
        createIncomeRecord,
        deleteIncomeRecord,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addCategory,
        updateCategory,
        deleteCategory,
        addProject,
        updateProject,
        deleteProject,
        addUser,
        updateUser,
        deleteUser,
        regenerateApiKeys,
        addLog,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

function formatRupiahSimple(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}
