import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { api } from '../services/api';
import { formatRupiah } from '../utils/formatters';

interface AppContextType {
  currentUser: User | null;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
  
  // Auth
  login: (email: string, pass: string) => Promise<boolean>;
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
  executeGroupDisbursement: (id: string) => void;
  
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
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'idk_current_user',
};

const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: 'idk_live_9a8f7e6d5c4b3a21',
  secretKey: 'idk_sec_4f8e1a9c2b3d7e6f8a0b1c2d3e4f5a6b',
  lastGeneratedAt: new Date().toISOString(),
  generatedBy: 'Budi Santoso',
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set default active menu based on role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setActiveMenu('approval_pengajuan');
    } else {
      setActiveMenu('pengajuan_dana');
    }
  }, [currentUser?.role]);

  // Data states loaded strictly from backend SQLite API
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [groupDisbursements, setGroupDisbursements] = useState<GroupDisbursement[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(DEFAULT_API_SETTINGS);

  // Sync currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Fetch all initial data from SQLite Express Backend
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        emps,
        cats,
        prjs,
        usrs,
        reqs,
        grps,
        incs,
        trxs,
        lgs,
        sett,
      ] = await Promise.all([
        api.getEmployees().catch(() => []),
        api.getCategories().catch(() => []),
        api.getProjects().catch(() => []),
        api.getUsers().catch(() => []),
        api.getFundRequests().catch(() => []),
        api.getGroupDisbursements().catch(() => []),
        api.getIncomeRecords().catch(() => []),
        api.getTransactions().catch(() => []),
        api.getLogs().catch(() => []),
        api.getApiSettings().catch(() => DEFAULT_API_SETTINGS),
      ]);

      setEmployees(emps);
      setCategories(cats);
      setProjects(prjs);
      setUsers(usrs);
      setFundRequests(reqs);
      setGroupDisbursements(grps);
      setIncomeRecords(incs);
      setTransactions(trxs);
      setLogs(lgs);
      setApiSettings(sett);
    } catch (err) {
      console.error('Failed to load data from SQLite backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Log Helper
  const addLog = (action: string, detail: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.name : 'System',
      role: currentUser ? currentUser.role : 'system',
      action,
      detail,
      ipAddress: '127.0.0.1',
    };
    setLogs((prev) => [newLog, ...prev]);

    // Async sync to SQLite
    api.addLog(action, detail, currentUser?.name, currentUser?.role).catch(console.error);
  };

  // Auth
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const loggedUser = await api.login(email, pass);
      setCurrentUser(loggedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(loggedUser));
      await refreshAllData();
      return true;
    } catch (err) {
      // Fallback check against cached users if offline/temporary
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
      );
      if (found) {
        setCurrentUser(found);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
        addLog('USER_LOGIN', `User ${found.name} (${found.role}) berhasil masuk ke sistem.`);
        return true;
      }
      return false;
    }
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
      createdBy: currentUser ? currentUser.name : (data.sumber === 'pic' ? data.picName || 'PIC Lapangan' : 'Finance Manager'),
    };

    setFundRequests((prev) => [newRequest, ...prev]);

    // Persist to backend SQLite
    api.createFundRequest(newRequest)
      .then((saved) => {
        setFundRequests((prev) => prev.map((r) => r.id === newRequest.id ? saved : r));
        api.getLogs().then(setLogs).catch(console.error);
      })
      .catch((err) => console.error('Error saving fund request to backend:', err));

    return newRequest;
  };

  const updateFundRequest = (id: string, updatedFields: Partial<FundRequest>) => {
    setFundRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields, updatedAt: new Date().toISOString() } : item))
    );
    api.updateFundRequest(id, updatedFields)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const deleteFundRequest = (id: string) => {
    setFundRequests((prev) => prev.filter((item) => item.id !== id));
    api.deleteFundRequest(id)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const reviewPicRequest = (id: string, action: 'approve' | 'reject', notes?: string) => {
    setFundRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        return {
          ...req,
          status: action === 'approve' ? 'pending_admin_approval' : 'rejected',
          catatanPenolakan: action === 'reject' ? notes || 'Ditolak oleh Finance Manager' : req.catatanPenolakan,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    api.reviewPicRequest(id, action, notes)
      .then((updated) => {
        setFundRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
  };

  const adminApproveRequest = (id: string) => {
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

    api.adminApproveRequest(id)
      .then((updated) => {
        setFundRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
  };

  const adminRejectRequest = (id: string, notes: string) => {
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

    api.adminRejectRequest(id, notes)
      .then((updated) => {
        setFundRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
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

    api.reviseFundRequest(id, updatedFields, revisionNotes, currentUser?.name)
      .then((updated) => {
        setFundRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
  };

  const uploadTransferProof = (
    id: string,
    proofName: string,
    proofUrl: string,
    tanggalTransfer: string
  ) => {
    const target = fundRequests.find((r) => r.id === id);
    if (!target) return;

    const dateStr = tanggalTransfer || new Date().toISOString().split('T')[0];

    setFundRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'done',
              buktiTransferNama: proofName,
              buktiTransferUrl: proofUrl,
              tanggalTransfer: dateStr,
              disbursedBy: currentUser ? currentUser.name : 'Finance Manager',
              updatedAt: new Date().toISOString(),
            }
          : req
      )
    );

    // Otomatis catat ke Daftar Transaksi sebagai Uang Keluar
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      tanggal: dateStr,
      namaProyek: target.namaProyek || 'PT Inovasi Digital Kreasi',
      judul: target.keterangan || `Transfer ${target.kategori} ${target.nomorPengajuan}`,
      status: 'done',
      kategoriTransaksi: 'uang_keluar',
      jenis: target.kategori.charAt(0).toUpperCase() + target.kategori.slice(1),
      nominal: target.jumlah,
      referensiId: target.id,
    };
    setTransactions((prev) => [newTrx, ...prev]);

    api.uploadTransferProof(id, proofName, proofUrl, dateStr, currentUser?.name)
      .then(() => {
        api.getTransactions().then(setTransactions);
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
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

    api.createGroupDisbursement(data)
      .then((saved) => {
        setGroupDisbursements((prev) => prev.map((g) => (g.id === newGroup.id ? saved : g)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);

    return newGroup;
  };

  const updateGroupDisbursement = (id: string, data: Partial<GroupDisbursement>) => {
    setGroupDisbursements((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g))
    );
    api.updateGroupDisbursement(id, data)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const deleteGroupDisbursement = (id: string) => {
    setGroupDisbursements((prev) => prev.filter((g) => g.id !== id));
    api.deleteGroupDisbursement(id)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const executeGroupDisbursement = (id: string) => {
    api.executeGroupDisbursement(id, currentUser?.name)
      .then(() => {
        api.getTransactions().then(setTransactions);
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
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
    const dateOnly = data.hariTanggal.includes(', ')
      ? data.hariTanggal.split(', ')[1]
      : new Date().toISOString().split('T')[0];

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

    api.createIncomeRecord({ ...data, createdBy: currentUser?.name })
      .then((saved) => {
        setIncomeRecords((prev) => prev.map((i) => (i.id === newRec.id ? saved : i)));
        api.getTransactions().then(setTransactions);
        api.getLogs().then(setLogs);
      })
      .catch(console.error);

    return newRec;
  };

  const deleteIncomeRecord = (id: string) => {
    setIncomeRecords((prev) => prev.filter((i) => i.id !== id));
    setTransactions((prev) => prev.filter((t) => t.referensiId !== id));

    api.deleteIncomeRecord(id)
      .then(() => {
        api.getTransactions().then(setTransactions);
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
  };

  // Master Employee
  const addEmployee = (emp: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [newEmp, ...prev]);

    api.createEmployee(emp)
      .then((saved) => {
        setEmployees((prev) => prev.map((e) => (e.id === newEmp.id ? saved : e)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);

    return newEmp;
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...emp } : e))
    );
    api.updateEmployee(id, emp)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    api.deleteEmployee(id)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  // Master Category
  const addCategory = (cat: Omit<IncomeCategory, 'id'>): IncomeCategory => {
    const newCat: IncomeCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);

    api.createCategory(cat)
      .then((saved) => {
        setCategories((prev) => prev.map((c) => (c.id === newCat.id ? saved : c)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);

    return newCat;
  };

  const updateCategory = (id: string, cat: Partial<IncomeCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...cat } : c))
    );
    api.updateCategory(id, cat)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    api.deleteCategory(id)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  // Master Project
  const addProject = (prj: Omit<Project, 'id'>): Project => {
    const newPrj: Project = {
      ...prj,
      id: `prj-${Date.now()}`,
    };
    setProjects((prev) => [...prev, newPrj]);

    api.createProject(prj)
      .then((saved) => {
        setProjects((prev) => prev.map((p) => (p.id === newPrj.id ? saved : p)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);

    return newPrj;
  };

  const updateProject = (id: string, prj: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prj } : p))
    );
    api.updateProject(id, prj)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    api.deleteProject(id)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  // Master User
  const addUser = (usr: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...usr,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);

    api.createUser(usr)
      .then((saved) => {
        setUsers((prev) => prev.map((u) => (u.id === newUser.id ? saved : u)));
        api.getLogs().then(setLogs);
      })
      .catch(console.error);

    return newUser;
  };

  const updateUser = (id: string, usr: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...usr } : u))
    );
    api.updateUser(id, usr)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    api.deleteUser(id)
      .then(() => api.getLogs().then(setLogs))
      .catch(console.error);
  };

  // Settings
  const regenerateApiKeys = () => {
    api.regenerateApiKeys(currentUser?.name)
      .then((newSettings) => {
        setApiSettings(newSettings);
        api.getLogs().then(setLogs);
      })
      .catch(console.error);
  };

  // Reset System Data
  const resetAllData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke database awal?')) {
      api.resetDatabase()
        .then(() => refreshAllData())
        .catch(console.error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeMenu,
        setActiveMenu,
        isSidebarOpen,
        setIsSidebarOpen,
        isLoading,
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
        executeGroupDisbursement,
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
        refreshAllData,
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
