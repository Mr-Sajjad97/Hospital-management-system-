import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';

export interface Medicine {
  id: number;
  name: string;
  company: string;
  batch: string;
  expiry: string;
  buy_price: number;
  sale_price: number;
  qty: number;
}

export interface Purchase {
  id: number;
  date: string;
  invoice_no: string;
  medicine_id: number;
  qty: number;
  buy_price: number;
  supplier: string;
}

export interface PurchasePayment {
  id: number;
  invoice_no: string;
  date: string;
  supplier: string;
  amount: number;
  method: string;
  note: string;
}

export interface Sale {
  id: number;
  date: string;
  medicine_id: number;
  qty: number;
  price: number;
  cost: number;
  customer: string;
  bill_no: string | null;
}

export interface LabRecord {
  id: number;
  date: string;
  patient: string;
  test: string;
  fee: number;
}

export interface OpdRecord {
  id: number;
  date: string;
  patient: string;
  doctor: string;
  fee: number;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  salary: number;
  phone: string;
}

export interface SalaryPayment {
  id: number;
  date: string;
  employee_id: number;
  amount: number;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  note: string;
}

export interface AppAuth {
  passwordHash: string;
  recoveryKeyHash: string;
}

interface HmsDatabase {
  medicines: Medicine[];
  purchases: Purchase[];
  purchase_payments: PurchasePayment[];
  sales: Sale[];
  lab: LabRecord[];
  opd: OpdRecord[];
  employees: Employee[];
  salaries: SalaryPayment[];
  expenses: Expense[];
  auth: AppAuth | null;
}

interface BackupFileInfo {
  filename: string;
  sizeBytes: number;
  updatedAt: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const INITIAL_DB: HmsDatabase = {
  medicines: [
    { id: 1, name: 'Paracetamol 500mg', company: 'GSK Pharma', batch: 'B-2026A', expiry: '2028-06', buy_price: 25, sale_price: 40, qty: 180 },
    { id: 2, name: 'Amoxicillin 250mg', company: 'Abbott Labs', batch: 'AMX-104', expiry: '2027-11', buy_price: 110, sale_price: 165, qty: 65 },
    { id: 3, name: 'Ceftriaxone 1g Inj', company: 'Getz Pharma', batch: 'CEF-882', expiry: '2027-08', buy_price: 220, sale_price: 340, qty: 8 },
    { id: 4, name: 'Omeprazole 20mg', company: 'Sami Pharma', batch: 'OMP-419', expiry: '2028-02', buy_price: 85, sale_price: 130, qty: 92 },
    { id: 5, name: 'Insulin Glargine Pen', company: 'Sanofi', batch: 'INS-901', expiry: '2027-04', buy_price: 1450, sale_price: 1850, qty: 6 },
  ],
  purchases: [
    { id: 1, date: todayStr(), invoice_no: 'PUR-20260929-101500', medicine_id: 1, qty: 200, buy_price: 25, supplier: 'Prime Medico Distributors' },
    { id: 2, date: todayStr(), invoice_no: 'PUR-20260929-101500', medicine_id: 2, qty: 80, buy_price: 110, supplier: 'Prime Medico Distributors' },
    { id: 3, date: todayStr(), invoice_no: 'PUR-20260929-142000', medicine_id: 4, qty: 100, buy_price: 85, supplier: 'City Pharma Supply' },
  ],
  purchase_payments: [
    { id: 1, invoice_no: 'PUR-20260929-101500', date: todayStr(), supplier: 'Prime Medico Distributors', amount: 10000, method: 'Bank Transfer', note: 'Initial payment' },
    { id: 2, invoice_no: 'PUR-20260929-142000', date: todayStr(), supplier: 'City Pharma Supply', amount: 8500, method: 'Cash', note: 'Full settlement' },
  ],
  sales: [
    { id: 1, date: todayStr(), medicine_id: 1, qty: 20, price: 40, cost: 25, customer: 'Walk-in Customer', bill_no: 'INV-20260929-0001' },
    { id: 2, date: todayStr(), medicine_id: 2, qty: 15, price: 165, cost: 110, customer: 'Ahmed Raza', bill_no: 'INV-20260929-0002' },
    { id: 3, date: todayStr(), medicine_id: 4, qty: 8, price: 130, cost: 85, customer: 'Fatima Noor', bill_no: 'INV-20260929-0003' },
  ],
  lab: [
    { id: 1, date: todayStr(), patient: 'Zainab Bibi', test: 'Complete Blood Count (CBC)', fee: 1200 },
    { id: 2, date: todayStr(), patient: 'Usman Tariq', test: 'Lipid Profile & HbA1c', fee: 3500 },
    { id: 3, date: todayStr(), patient: 'Bilal Hussain', test: 'Liver Function Test (LFT)', fee: 1800 },
  ],
  opd: [
    { id: 1, date: todayStr(), patient: 'M. Kashif', doctor: 'Dr. Sajjad Shah (Medical Specialist)', fee: 1500 },
    { id: 2, date: todayStr(), patient: 'Ayesha Siddiqa', doctor: 'Dr. Hina Malik (Gynecologist)', fee: 2000 },
    { id: 3, date: todayStr(), patient: 'Hamza Ali', doctor: 'Dr. Kamran Iqbal (Pediatrics)', fee: 1500 },
  ],
  employees: [
    { id: 1, name: 'Dr. Sajjad Shah', role: 'Senior Medical Officer', salary: 50000, phone: '0300-1234567' },
    { id: 2, name: 'Nadia Parveen', role: 'Head Nurse', salary: 35000, phone: '0321-7654321' },
    { id: 3, name: 'Tariq Mehmood', role: 'Lab Technician', salary: 32000, phone: '0333-9876543' },
    { id: 4, name: 'Imran Khan', role: 'Chief Pharmacist', salary: 38000, phone: '0345-1122334' },
  ],
  salaries: [
    { id: 1, date: '2026-09-29', employee_id: 1, amount: 50000.0 },
  ],
  expenses: [
    { id: 1, date: todayStr(), category: 'Electricity & Generator Fuel', amount: 4500, note: 'Emergency backup diesel' },
    { id: 2, date: todayStr(), category: 'Medical Consumables', amount: 2200, note: 'Sanitizers, gloves, syringes' },
  ],
  auth: null,
};

const STORAGE_KEY = 'hms_modern_complete_db_v2';

type PageName =
  | 'Dashboard'
  | 'Medicines'
  | 'Purchase'
  | 'Sale'
  | 'Lab'
  | 'OPD'
  | 'Employees'
  | 'Expenses';

const PAGES: { icon: string; name: PageName }[] = [
  { icon: '📊', name: 'Dashboard' },
  { icon: '💊', name: 'Medicines' },
  { icon: '🛒', name: 'Purchase' },
  { icon: '🧾', name: 'Sale' },
  { icon: '🔬', name: 'Lab' },
  { icon: '🏥', name: 'OPD' },
  { icon: '👤', name: 'Employees' },
  { icon: '💸', name: 'Expenses' },
];

const BAR_GRADIENTS = [
  'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
  'linear-gradient(180deg, #2dd4bf 0%, #0891b2 100%)',
  'linear-gradient(180deg, #34d399 0%, #059669 100%)',
  'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
  'linear-gradient(180deg, #86efac 0%, #22c55e 100%)',
  'linear-gradient(180deg, #a3e635 0%, #16a34a 100%)',
];

function simpleHash(str: string): string {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function isPasswordStrong(pw: string): boolean {
  return (
    pw.length >= 12 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^a-zA-Z0-9]/.test(pw)
  );
}

export default function App() {
  const [db, setDb] = useState<HmsDatabase>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_DB, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_DB;
  });

  const [serverLoaded, setServerLoaded] = useState(false);
  const [lastAutoBackupTime, setLastAutoBackupTime] = useState<string>('Auto-Synced');
  const [backupFiles, setBackupFiles] = useState<BackupFileInfo[]>([]);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const isInitialMount = useRef(true);

  // 1. On startup: Automatically restore from server file (data/hms_database.json or backups/hms_YYYY-MM-DD.json)
  useEffect(() => {
    fetch('/api/db')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.data && Array.isArray(res.data.medicines)) {
          setDb({ ...INITIAL_DB, ...res.data });
          if (res.backups) setBackupFiles(res.backups);
          setLastAutoBackupTime('Restored from file');
        } else {
          // First time: write initial DB to server file immediately
          fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(db),
          })
            .then((r2) => r2.json())
            .then((res2) => {
              if (res2?.backups) setBackupFiles(res2.backups);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        setServerLoaded(true);
      });
  }, []);

  // 2. Whenever DB changes: Automatically save to localStorage AND server file (data/hms_database.json + backups/hms_YYYY-MM-DD.json)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // ignore
    }
    if (!serverLoaded) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok) {
          setLastAutoBackupTime(res.savedAt || 'Saved');
          if (res.backups) setBackupFiles(res.backups);
        }
      })
      .catch(() => {});
  }, [db, serverLoaded]);

  const [darkMode, setDarkMode] = useState(true);
  const [activePage, setActivePage] = useState<PageName>('Dashboard');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'Today' | 'This Week' | 'This Month' | 'All Time'>('All Time');

  // Laptop Window State (Maximize/Full Screen, Windowed, Close)
  const [windowState, setWindowState] = useState<'maximized' | 'windowed' | 'closed'>('maximized');
  const [chartMode, setChartMode] = useState<'trading' | 'monthly' | 'live'>('trading');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [shortcutGuideOpen, setShortcutGuideOpen] = useState(false);
  const [lastActivityPage, setLastActivityPage] = useState<PageName>('Sale');
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Live Trading Chart Stream State (Candlesticks + Live Price Line + Volume)
  const [tradingCandles, setTradingCandles] = useState<
    Array<{
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      bullish: boolean;
    }>
  >(() => {
    const now = Date.now();
    let price = 14850;
    return Array.from({ length: 24 }, (_, idx) => {
      const t = new Date(now - (23 - idx) * 2000);
      const timeStr = t.toTimeString().slice(0, 8);
      const open = price;
      const delta = Math.round((Math.random() - 0.43) * 260);
      const close = Math.max(2500, open + delta);
      const high = Math.max(open, close) + Math.round(Math.random() * 140) + 25;
      const low = Math.max(1500, Math.min(open, close) - Math.round(Math.random() * 130) - 20);
      const volume = Math.round(35 + Math.random() * 65);
      price = close;
      return {
        time: timeStr,
        open,
        high,
        low,
        close,
        volume,
        bullish: close >= open,
      };
    });
  });
  const [liveJitter, setLiveJitter] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  // Dashboard date range
  const [dashFrom, setDashFrom] = useState('2000-01-01');
  const [dashTo, setDashTo] = useState(todayStr());

  // Banner / Toast feedback
  const [banner, setBanner] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  // Modals
  const [receiptModal, setReceiptModal] = useState<string | null>(null);
  const [supplierBalancesModal, setSupplierBalancesModal] = useState(false);
  const [recordPaymentModal, setRecordPaymentModal] = useState(false);
  const [salaryHistoryEmployee, setSalaryHistoryEmployee] = useState<Employee | null>(null);
  const [paySalaryConfirmEmployee, setPaySalaryConfirmEmployee] = useState<Employee | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Auth / Lock screen modal
  const [isLocked, setIsLocked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');
  const [recoveryKeyModal, setRecoveryKeyModal] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetRecoveryInput, setResetRecoveryInput] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');

  // Form states per page
  const [medForm, setMedForm] = useState({
    name: '',
    company: '',
    batch: '',
    expiry: '',
    buy_price: '',
    sale_price: '',
    qty: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    invoice_no: '',
    medicine_id: '',
    qty: '',
    buy_price: '',
    supplier: '',
    paid_now: '',
  });

  const [saleForm, setSaleForm] = useState({
    medicine_id: '',
    qty: '',
    customer: '',
  });

  const [labForm, setLabForm] = useState({
    patient: '',
    test: '',
    fee: '',
  });

  const [opdForm, setOpdForm] = useState({
    patient: '',
    doctor: '',
    fee: '',
  });

  const [empForm, setEmpForm] = useState({
    name: '',
    role: '',
    salary: '',
    phone: '',
  });

  const [expForm, setExpForm] = useState({
    category: '',
    amount: '',
    note: '',
  });

  const [supplierPaymentForm, setSupplierPaymentForm] = useState({
    invoice_no: '',
    supplier: '',
    amount: '',
    method: 'Cash',
    note: '',
  });

  const showNotice = (type: 'error' | 'success' | 'info', message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Toggle Fullscreen & Windowed/Maximized
  const handleToggleMaximize = () => {
    if (windowState === 'windowed') {
      setWindowState('maximized');
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch {
        // ignore
      }
    } else {
      setWindowState('windowed');
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSelectPage = (page: PageName) => {
    if (page !== 'Dashboard') {
      setLastActivityPage(page);
    }
    setActivePage(page);
    setSelectedId(null);
    setDeleteConfirmId(null);
    setSearchTerm('');
    setDateFilter('All Time');
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back button handler (replaces Minimize in top-right bar — ALWAYS active and works from any activity, modal, or Dashboard)
  const handleBackToDashboard = () => {
    // 1. If any popup/modal is open, close it immediately
    if (
      backupModalOpen ||
      guideModalOpen ||
      receiptModal !== null ||
      supplierBalancesModal ||
      recordPaymentModal ||
      salaryHistoryEmployee !== null ||
      paySalaryConfirmEmployee !== null ||
      deleteConfirmId !== null ||
      authModalOpen
    ) {
      setBackupModalOpen(false);
      setGuideModalOpen(false);
      setReceiptModal(null);
      setSupplierBalancesModal(false);
      setRecordPaymentModal(false);
      setSalaryHistoryEmployee(null);
      setPaySalaryConfirmEmployee(null);
      setDeleteConfirmId(null);
      setAuthModalOpen(false);
      showNotice('info', '← Popup closed.');
      return;
    }

    // 2. If user is inside any activity (Medicines, Purchase, Sale, Lab, OPD, Employees, Expenses), return to Dashboard
    if (activePage !== 'Dashboard') {
      const prevName = activePage;
      setLastActivityPage(activePage);
      setActivePage('Dashboard');
      setSelectedId(null);
      setDeleteConfirmId(null);
      setSearchTerm('');
      setDateFilter('All Time');
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      showNotice('info', `← Back to Dashboard (from ${prevName})`);
      return;
    }

    // 3. If user is already on Dashboard, scroll to top or switch back to the last activity
    if (mainScrollRef.current && mainScrollRef.current.scrollTop > 40) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      showNotice('info', '← Scrolled to top of Dashboard');
    } else if (lastActivityPage && lastActivityPage !== 'Dashboard') {
      setActivePage(lastActivityPage);
      showNotice('info', `↩ Returned to ${lastActivityPage}`);
    } else {
      showNotice('info', '📊 Aap abhi Dashboard par hi hain.');
    }
  };

  // Dashboard preset handler
  const applyDashPreset = (days: number | null) => {
    const end = new Date();
    const endStr = end.toISOString().slice(0, 10);
    let startStr = '2000-01-01';
    if (days === -1) {
      startStr = '2000-01-01';
    } else if (days === null) {
      startStr = `${endStr.slice(0, 8)}01`;
    } else {
      const start = new Date(end.getTime() - days * 86400000);
      startStr = start.toISOString().slice(0, 10);
    }
    setDashFrom(startStr);
    setDashTo(endStr);
  };

  // Dashboard calculations
  const dashMetrics = useMemo(() => {
    const inRange = (d: string) => d >= dashFrom && d <= dashTo;

    const sale = db.sales
      .filter((s) => inRange(s.date))
      .reduce((acc, s) => acc + s.qty * s.price, 0);
    const cogs = db.sales
      .filter((s) => inRange(s.date))
      .reduce((acc, s) => acc + s.qty * s.cost, 0);
    const purch = db.purchases
      .filter((p) => inRange(p.date))
      .reduce((acc, p) => acc + p.qty * p.buy_price, 0);
    const lab = db.lab
      .filter((l) => inRange(l.date))
      .reduce((acc, l) => acc + l.fee, 0);
    const opd = db.opd
      .filter((o) => inRange(o.date))
      .reduce((acc, o) => acc + o.fee, 0);
    const sal = db.salaries
      .filter((s) => inRange(s.date))
      .reduce((acc, s) => acc + s.amount, 0);
    const exp = db.expenses
      .filter((e) => inRange(e.date))
      .reduce((acc, e) => acc + e.amount, 0);

    const income = sale + lab + opd;
    const cost = cogs + sal + exp;
    const profit = income - cost;

    const medicineTypes = db.medicines.length;
    const totalUnits = db.medicines.reduce((acc, m) => acc + m.qty, 0);
    const stockValue = db.medicines.reduce((acc, m) => acc + m.qty * m.buy_price, 0);
    const lowStock = db.medicines.filter((m) => m.qty < 10).length;
    const totalEmployees = db.employees.length;
    const monthlySalaryTotal = db.employees.reduce((acc, e) => acc + e.salary, 0);

    return {
      sale,
      cogs,
      purch,
      lab,
      opd,
      sal,
      exp,
      income,
      cost,
      profit: Math.max(profit, 0),
      loss: Math.max(-profit, 0),
      medicineTypes,
      totalUnits,
      stockValue,
      lowStock,
      totalEmployees,
      monthlySalaryTotal,
    };
  }, [db, dashFrom, dashTo]);

  // Growth Overview Graph data (matching uploaded Monthly Growth Overview Dashboard.png design)
  const growthChartData = useMemo(() => {
    if (chartMode === 'monthly') {
      // Progressive 6-month hospital growth series scaled with current live income
      const currentMonthIncome = Math.max(Math.round(dashMetrics.income / 100), 112);
      const raw = [
        { label: 'Jan', val: Math.round(currentMonthIncome * 0.40) },
        { label: 'Feb', val: Math.round(currentMonthIncome * 0.52) },
        { label: 'Mar', val: Math.round(currentMonthIncome * 0.64) },
        { label: 'Apr', val: Math.round(currentMonthIncome * 0.76) },
        { label: 'May', val: Math.round(currentMonthIncome * 0.88) },
        { label: 'Jun', val: currentMonthIncome },
      ];
      const maxVal = Math.max(...raw.map((r) => r.val), 120);
      const yMax = Math.ceil(maxVal / 20) * 20;
      const growthPct = raw[0].val > 0 ? Math.round(((raw[5].val - raw[0].val) / raw[0].val) * 100) : 87;
      return {
        bars: raw.map((r, idx) => {
          const liveVal = Math.max(10, Math.round(r.val + (isLiveStreaming ? (liveJitter[idx] || 0) * 0.15 : 0)));
          return {
            ...r,
            val: liveVal,
            heightPct: Math.min(100, Math.max(Math.round((liveVal / yMax) * 100), 12)),
            gradient: BAR_GRADIENTS[idx % BAR_GRADIENTS.length],
          };
        }),
        yTicks: [yMax, Math.round(yMax * 0.83), Math.round(yMax * 0.66), Math.round(yMax * 0.5), Math.round(yMax * 0.33), Math.round(yMax * 0.16), 0],
        growthPct,
        xAxisLabel: 'Month (Live Animated)',
        periodLabel: 'Jan – Jun 2026 · LIVE',
      };
    } else {
      // Live Department Financial Bars sorted ascending so the rising trend arrow looks great
      const raw = [
        { label: 'COGS', val: Math.round(dashMetrics.cogs) },
        { label: 'OPD Fees', val: Math.round(dashMetrics.opd) },
        { label: 'Pharmacy', val: Math.round(dashMetrics.sale) },
        { label: 'Lab Tests', val: Math.round(dashMetrics.lab) },
        { label: 'Expenses', val: Math.round(dashMetrics.exp) },
        { label: 'Total Income', val: Math.round(dashMetrics.income) },
      ];
      const maxVal = Math.max(...raw.map((r) => r.val), 100) * 1.08;
      const yMax = Math.ceil(maxVal / 1000) * 1000 || 120;
      return {
        bars: raw.map((r, idx) => {
          const liveVal = Math.max(0, Math.round(r.val + (isLiveStreaming ? (liveJitter[idx] || 0) : 0)));
          return {
            ...r,
            val: liveVal,
            heightPct: Math.min(100, Math.max(Math.round((liveVal / yMax) * 100), 10)),
            gradient: BAR_GRADIENTS[idx % BAR_GRADIENTS.length],
          };
        }),
        yTicks: [
          yMax,
          Math.round(yMax * 0.8),
          Math.round(yMax * 0.6),
          Math.round(yMax * 0.4),
          Math.round(yMax * 0.2),
          0,
        ],
        growthPct: 87,
        xAxisLabel: 'Hospital Department (Live Stream)',
        periodLabel: `${dashFrom} to ${dashTo} · LIVE`,
      };
    }
  }, [chartMode, dashMetrics, dashFrom, dashTo, liveJitter, isLiveStreaming]);

  // Real-time Live Trading Ticker Effect (updates every 1.2s like TradingView / Binance)
  useEffect(() => {
    if (!isLiveStreaming) return;
    const baseAnchor = Math.max(3500, Math.round(dashMetrics.income - dashMetrics.cost * 0.35));
    const timer = setInterval(() => {
      const nowStr = new Date().toTimeString().slice(0, 8);
      setTradingCandles((prev) => {
        const last = prev[prev.length - 1] || {
          time: nowStr,
          open: baseAnchor,
          high: baseAnchor + 150,
          low: baseAnchor - 150,
          close: baseAnchor,
          volume: 50,
          bullish: true,
        };
        const open = last.close;
        // Gentle pull toward real hospital financial anchor + live trading momentum
        const pull = (baseAnchor - open) * 0.08;
        const randomSwing = (Math.random() - 0.46) * 320;
        const close = Math.max(1200, Math.round(open + pull + randomSwing));
        const high = Math.max(open, close) + Math.round(25 + Math.random() * 150);
        const low = Math.max(800, Math.min(open, close) - Math.round(20 + Math.random() * 140));
        const volume = Math.round(30 + Math.random() * 70);
        const nextCandle = {
          time: nowStr,
          open,
          high,
          low,
          close,
          volume,
          bullish: close >= open,
        };
        return [...prev.slice(-23), nextCandle];
      });
      setLiveJitter(
        Array.from({ length: 6 }, (_, i) => Math.round((Math.random() - 0.45) * (40 + i * 25)))
      );
    }, 1200);
    return () => clearInterval(timer);
  }, [isLiveStreaming, dashMetrics.income, dashMetrics.cost]);

  // Helper for table date filter
  const passesDateFilter = (recordDate: string) => {
    if (dateFilter === 'All Time') return true;
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    let startIso = todayIso;
    if (dateFilter === 'Today') {
      startIso = todayIso;
    } else if (dateFilter === 'This Week') {
      const dayOfWeek = (today.getDay() + 6) % 7;
      const start = new Date(today.getTime() - dayOfWeek * 86400000);
      startIso = start.toISOString().slice(0, 10);
    } else if (dateFilter === 'This Month') {
      startIso = `${todayIso.slice(0, 8)}01`;
    }
    return recordDate >= startIso && recordDate <= todayIso;
  };

  // Add handlers
  const handleAddMedicine = () => {
    const { name, company, batch, expiry, buy_price, sale_price, qty } = medForm;
    if (!name.trim() || !company.trim() || !batch.trim() || !expiry.trim() || !buy_price || !sale_price || !qty) {
      return showNotice('error', 'Please complete all required fields.');
    }
    const bp = parseFloat(buy_price);
    const sp = parseFloat(sale_price);
    const q = parseInt(qty, 10);
    if (isNaN(bp) || isNaN(sp) || isNaN(q) || bp < 0 || sp < 0 || q < 0) {
      return showNotice('error', 'Please enter valid positive numbers for prices and quantity.');
    }
    const nextId = db.medicines.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          id: nextId,
          name: name.trim(),
          company: company.trim(),
          batch: batch.trim(),
          expiry: expiry.trim(),
          buy_price: bp,
          sale_price: sp,
          qty: q,
        },
      ],
    }));
    setMedForm({ name: '', company: '', batch: '', expiry: '', buy_price: '', sale_price: '', qty: '' });
    showNotice('success', `Medicine "${name.trim()}" added & auto-saved to backup file.`);
  };

  const handleAddPurchase = () => {
    const { invoice_no, medicine_id, qty, buy_price, supplier, paid_now } = purchaseForm;
    if (!medicine_id || !qty || !buy_price || !supplier.trim()) {
      return showNotice('error', 'Please complete all required fields.');
    }
    const medId = parseInt(medicine_id, 10);
    const q = parseInt(qty, 10);
    const bp = parseFloat(buy_price);
    const paid = paid_now.trim() ? parseFloat(paid_now) : 0;

    if (isNaN(medId) || isNaN(q) || isNaN(bp) || isNaN(paid) || q <= 0 || bp < 0 || paid < 0) {
      return showNotice('error', 'Quantity must be positive and prices/payments cannot be negative.');
    }

    const now = new Date();
    const inv =
      invoice_no.trim() ||
      `PUR-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.toTimeString().slice(0, 8).replace(/:/g, '')}`;

    const nextId = db.purchases.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const nextPayId = db.purchase_payments.reduce((max, p) => Math.max(max, p.id), 0) + 1;

    setDb((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) =>
        m.id === medId ? { ...m, qty: m.qty + q, buy_price: bp } : m
      ),
      purchases: [
        {
          id: nextId,
          date: todayStr(),
          invoice_no: inv,
          medicine_id: medId,
          qty: q,
          buy_price: bp,
          supplier: supplier.trim(),
        },
        ...prev.purchases,
      ],
      purchase_payments:
        paid > 0
          ? [
              ...prev.purchase_payments,
              {
                id: nextPayId,
                invoice_no: inv,
                date: todayStr(),
                supplier: supplier.trim(),
                amount: paid,
                method: 'Cash',
                note: 'Initial payment',
              },
            ]
          : prev.purchase_payments,
    }));

    setPurchaseForm({ invoice_no: '', medicine_id: '', qty: '', buy_price: '', supplier: '', paid_now: '' });
    showNotice('success', `Purchase recorded under invoice ${inv} & auto-saved.`);
  };

  const buildReceiptText = (billNo: string, date: string, customer: string, medName: string, qty: number, unitPrice: number) => {
    const total = qty * unitPrice;
    return [
      'HOSPITAL / PHARMACY',
      'SALES RECEIPT',
      '==============================',
      `Bill No: ${billNo}`,
      `Date: ${date}`,
      `Customer: ${customer}`,
      '------------------------------',
      `Medicine: ${medName}`,
      `Quantity: ${qty}`,
      `Unit Price: ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `TOTAL: ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      '==============================',
      'Thank you!',
    ].join('\n');
  };

  const handleAddSale = (generateBill: boolean) => {
    const { medicine_id, qty, customer } = saleForm;
    if (!medicine_id || !qty) {
      return showNotice('error', 'Please select a medicine and enter quantity.');
    }
    const medId = parseInt(medicine_id, 10);
    const q = parseInt(qty, 10);
    if (isNaN(medId) || isNaN(q) || q <= 0) {
      return showNotice('error', 'Please enter a valid positive quantity.');
    }
    const med = db.medicines.find((m) => m.id === medId);
    if (!med) {
      return showNotice('error', 'Please select a valid medicine.');
    }
    if (q > med.qty) {
      return showNotice('error', `Insufficient stock. Only ${med.qty} unit(s) remaining.`);
    }

    const nextId = db.sales.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    const custName = customer.trim() || 'Walk-in Customer';
    const date = todayStr();
    const billNo = generateBill ? `INV-${date.replace(/-/g, '')}-${String(nextId).padStart(4, '0')}` : null;

    setDb((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === medId ? { ...m, qty: m.qty - q } : m)),
      sales: [
        {
          id: nextId,
          date,
          medicine_id: medId,
          qty: q,
          price: med.sale_price,
          cost: med.buy_price,
          customer: custName,
          bill_no: billNo,
        },
        ...prev.sales,
      ],
    }));

    setSaleForm({ medicine_id: '', qty: '', customer: '' });

    if (generateBill && billNo) {
      const receipt = buildReceiptText(billNo, date, custName, med.name, q, med.sale_price);
      setReceiptModal(receipt);
    } else {
      showNotice('success', 'Sale recorded without bill & auto-saved.');
    }
  };

  const handleAddLab = () => {
    const { patient, test, fee } = labForm;
    if (!patient.trim() || !test.trim() || !fee) {
      return showNotice('error', 'Please complete all required fields.');
    }
    const f = parseFloat(fee);
    if (isNaN(f) || f < 0) {
      return showNotice('error', 'Please enter a valid fee amount.');
    }
    const nextId = db.lab.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      lab: [{ id: nextId, date: todayStr(), patient: patient.trim(), test: test.trim(), fee: f }, ...prev.lab],
    }));
    setLabForm({ patient: '', test: '', fee: '' });
    showNotice('success', 'Lab test record added & auto-saved.');
  };

  const handleAddOpd = () => {
    const { patient, doctor, fee } = opdForm;
    if (!patient.trim() || !doctor.trim() || !fee) {
      return showNotice('error', 'Please complete all required fields.');
    }
    const f = parseFloat(fee);
    if (isNaN(f) || f < 0) {
      return showNotice('error', 'Please enter a valid OPD fee.');
    }
    const nextId = db.opd.reduce((max, o) => Math.max(max, o.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      opd: [{ id: nextId, date: todayStr(), patient: patient.trim(), doctor: doctor.trim(), fee: f }, ...prev.opd],
    }));
    setOpdForm({ patient: '', doctor: '', fee: '' });
    showNotice('success', 'OPD appointment record added & auto-saved.');
  };

  const handleAddEmployee = () => {
    const { name, role, salary, phone } = empForm;
    if (!name.trim() || !role.trim() || !salary || !phone.trim()) {
      return showNotice('error', 'Please complete all required fields.');
    }
    const sal = parseFloat(salary);
    if (isNaN(sal) || sal < 0) {
      return showNotice('error', 'Please enter a valid salary amount.');
    }
    const nextId = db.employees.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        { id: nextId, name: name.trim(), role: role.trim(), salary: sal, phone: phone.trim() },
      ],
    }));
    setEmpForm({ name: '', role: '', salary: '', phone: '' });
    showNotice('success', `Employee "${name.trim()}" added & auto-saved.`);
  };

  const handleAddExpense = () => {
    const { category, amount, note } = expForm;
    if (!category.trim() || !amount || !note.trim()) {
      return showNotice('error', 'Please complete all required fields.');
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) {
      return showNotice('error', 'Please enter a valid expense amount.');
    }
    const nextId = db.expenses.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      expenses: [
        { id: nextId, date: todayStr(), category: category.trim(), amount: amt, note: note.trim() },
        ...prev.expenses,
      ],
    }));
    setExpForm({ category: '', amount: '', note: '' });
    showNotice('success', 'Expense recorded & auto-saved.');
  };

  const handleDeleteSelected = () => {
    if (selectedId === null) {
      return showNotice('error', 'Please click a row in the table first to select it.');
    }
    setDeleteConfirmId(selectedId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    setDb((prev) => {
      switch (activePage) {
        case 'Medicines':
          return { ...prev, medicines: prev.medicines.filter((r) => r.id !== id) };
        case 'Purchase':
          return { ...prev, purchases: prev.purchases.filter((r) => r.id !== id) };
        case 'Sale':
          return { ...prev, sales: prev.sales.filter((r) => r.id !== id) };
        case 'Lab':
          return { ...prev, lab: prev.lab.filter((r) => r.id !== id) };
        case 'OPD':
          return { ...prev, opd: prev.opd.filter((r) => r.id !== id) };
        case 'Employees':
          return { ...prev, employees: prev.employees.filter((r) => r.id !== id) };
        case 'Expenses':
          return { ...prev, expenses: prev.expenses.filter((r) => r.id !== id) };
        default:
          return prev;
      }
    });
    setSelectedId(null);
    setDeleteConfirmId(null);
    showNotice('info', `Record #${id} deleted & backup file updated.`);
  };

  // Supplier Balances aggregation
  const supplierBalances = useMemo(() => {
    const groups = new Map<
      string,
      { invoice_no: string; supplier: string; firstDate: string; totalBill: number }
    >();
    for (const p of db.purchases) {
      const inv = p.invoice_no || `LEGACY-${String(p.id).padStart(6, '0')}`;
      const key = `${inv}||${p.supplier}`;
      const existing = groups.get(key);
      const lineTotal = p.qty * p.buy_price;
      if (!existing) {
        groups.set(key, {
          invoice_no: inv,
          supplier: p.supplier,
          firstDate: p.date,
          totalBill: lineTotal,
        });
      } else {
        existing.totalBill += lineTotal;
        if (p.date < existing.firstDate) existing.firstDate = p.date;
      }
    }

    return Array.from(groups.values())
      .map((g) => {
        const paid = db.purchase_payments
          .filter((pp) => pp.invoice_no === g.invoice_no)
          .reduce((acc, pp) => acc + pp.amount, 0);
        return {
          ...g,
          paid,
          due: g.totalBill - paid,
        };
      })
      .sort((a, b) => b.firstDate.localeCompare(a.firstDate));
  }, [db.purchases, db.purchase_payments]);

  const handleSaveSupplierPayment = () => {
    const inv = supplierPaymentForm.invoice_no.trim();
    const sup = supplierPaymentForm.supplier.trim();
    const amt = parseFloat(supplierPaymentForm.amount);
    if (!inv || isNaN(amt) || amt <= 0) {
      return showNotice('error', 'Invoice number and a positive amount are required.');
    }
    const exists = db.purchases.some((p) => p.invoice_no === inv);
    if (!exists) {
      return showNotice('error', 'No purchase invoice was found with that number.');
    }
    const nextId = db.purchase_payments.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      purchase_payments: [
        ...prev.purchase_payments,
        {
          id: nextId,
          invoice_no: inv,
          date: todayStr(),
          supplier: sup,
          amount: amt,
          method: supplierPaymentForm.method.trim() || 'Cash',
          note: supplierPaymentForm.note.trim(),
        },
      ],
    }));
    setSupplierPaymentForm({ invoice_no: '', supplier: '', amount: '', method: 'Cash', note: '' });
    setRecordPaymentModal(false);
    showNotice('success', 'Supplier payment recorded & auto-saved.');
  };

  // Employee Salary Actions
  const handleTriggerPaySalary = () => {
    const emp = db.employees.find((e) => e.id === selectedId);
    if (!emp) {
      return showNotice('error', 'Please click an employee row in the table first, then click Pay Salary.');
    }
    setPaySalaryConfirmEmployee(emp);
  };

  const confirmPaySalary = () => {
    if (!paySalaryConfirmEmployee) return;
    const nextId = db.salaries.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    setDb((prev) => ({
      ...prev,
      salaries: [
        {
          id: nextId,
          date: todayStr(),
          employee_id: paySalaryConfirmEmployee.id,
          amount: paySalaryConfirmEmployee.salary,
        },
        ...prev.salaries,
      ],
    }));
    setPaySalaryConfirmEmployee(null);
    showNotice('success', 'Salary payment recorded & auto-saved to backup file.');
  };

  const handleTriggerSalaryHistory = () => {
    const emp = db.employees.find((e) => e.id === selectedId);
    if (!emp) {
      return showNotice('error', 'Select an employee first.');
    }
    setSalaryHistoryEmployee(emp);
  };

  // Restore from server auto-backup file
  const handleRestoreServerBackup = (filename: string) => {
    fetch('/api/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok && res.data) {
          setDb({ ...INITIAL_DB, ...res.data });
          if (res.backups) setBackupFiles(res.backups);
          setBackupModalOpen(false);
          showNotice('success', `Restored automatically from ${filename}`);
        } else {
          showNotice('error', 'Could not restore backup file.');
        }
      })
      .catch(() => showNotice('error', 'Failed to restore backup file.'));
  };

  // Manual download copy if user wants a copy on their USB/Desktop
  const handleBackupDownload = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hms_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('success', `Backup copy downloaded (hms_${todayStr()}.json).`);
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && Array.isArray(parsed.medicines)) {
          setDb({ ...INITIAL_DB, ...parsed });
          showNotice('success', 'Database backup restored & synced to server file.');
        } else {
          showNotice('error', 'Invalid HMS backup file format.');
        }
      } catch {
        showNotice('error', 'Could not parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // AuthWindow logic
  const handleAuthSubmit = () => {
    if (!db.auth) {
      if (!isPasswordStrong(authPassword)) {
        return showNotice(
          'error',
          'Weak Password: Use at least 12 characters, including uppercase, lowercase, a number, and a symbol.'
        );
      }
      if (authPassword !== authConfirm) {
        return showNotice('error', 'Password Mismatch: The passwords do not match.');
      }
      const rawRecovery =
        'RK-' +
        Array.from({ length: 16 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
      setDb((prev) => ({
        ...prev,
        auth: {
          passwordHash: simpleHash(authPassword),
          recoveryKeyHash: simpleHash(rawRecovery),
        },
      }));
      setAuthPassword('');
      setAuthConfirm('');
      setAuthModalOpen(false);
      setIsLocked(false);
      setRecoveryKeyModal(rawRecovery);
      return;
    }

    if (simpleHash(authPassword) === db.auth.passwordHash) {
      setAuthPassword('');
      setIsLocked(false);
      setAuthModalOpen(false);
      showNotice('success', 'Signed in successfully.');
    } else {
      showNotice('error', 'Sign In Failed: Incorrect password.');
    }
  };

  const handleResetWithRecoveryKey = () => {
    if (!db.auth) return;
    if (simpleHash(resetRecoveryInput.trim()) !== db.auth.recoveryKeyHash) {
      return showNotice('error', 'Invalid Key: Recovery key is incorrect.');
    }
    if (!isPasswordStrong(resetNewPass)) {
      return showNotice(
        'error',
        'Weak Password: Use at least 12 characters, including uppercase, lowercase, a number, and a symbol.'
      );
    }
    if (resetNewPass !== resetConfirmPass) {
      return showNotice('error', 'Password Mismatch: The passwords do not match.');
    }
    setDb((prev) => ({
      ...prev,
      auth: prev.auth ? { ...prev.auth, passwordHash: simpleHash(resetNewPass) } : null,
    }));
    setResetRecoveryInput('');
    setResetNewPass('');
    setResetConfirmPass('');
    setResetMode(false);
    showNotice('success', 'Password updated successfully. You can now sign in.');
  };

  // Theme colors
  const bgMain = darkMode ? 'bg-[#0d1117] text-white' : 'bg-slate-100 text-slate-900';
  const bgSidebar = darkMode
    ? 'bg-[#1a1a2e] text-white border-r border-[#2a2a4a]'
    : 'bg-white text-slate-800 border-r border-slate-200';
  const bgCard = darkMode
    ? 'bg-[#16213e] border border-[#23325b]'
    : 'bg-white border border-slate-200';
  const bgInput = darkMode
    ? 'bg-[#1e1e2e] border border-[#334155] text-white placeholder-gray-500'
    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400';

  // Closed Window State
  if (windowState === 'closed') {
    return (
      <div className="h-screen bg-[#070a0e] text-white flex flex-col items-center justify-center p-6">
        <div className={`w-full max-w-md rounded-xl p-8 text-center ${bgCard}`}>
          <div className="text-4xl text-[#4fc3f7] mb-2">✚</div>
          <h2 className="text-lg font-bold mb-1">Hospital Management System Closed</h2>
          <p className="text-xs text-gray-400 mb-6">
            All records have been automatically backed up to <span className="font-mono text-gray-200">data/hms_database.json</span> and <span className="font-mono text-gray-200">backups/hms_{todayStr()}.json</span>.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setWindowState('maximized')}
              className="w-full py-2.5 px-4 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs transition cursor-pointer"
            >
              Relaunch Hospital Management System
            </button>
            <button
              onClick={handleBackupDownload}
              className="w-full py-2 px-4 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white font-semibold text-xs transition cursor-pointer"
            >
              Download Copy of Backup File (.json)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If app is locked, show AuthWindow screen
  if (isLocked) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center p-6 ${bgMain}`}>
        {banner && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
              banner.type === 'error'
                ? 'bg-[#dc2626] text-white'
                : banner.type === 'success'
                ? 'bg-[#16a34a] text-white'
                : 'bg-[#0f3460] text-white'
            }`}
          >
            {banner.message}
          </div>
        )}
        <div className={`w-full max-w-md rounded-xl p-8 text-center ${bgCard}`}>
          <div className="text-4xl font-bold text-[#4fc3f7] mb-1">✚ HMS</div>
          <div className="text-sm text-gray-400 mb-6">Hospital Management System — Secure Sign In</div>

          {!resetMode ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">{db.auth ? 'Sign In' : 'Create Admin Password'}</h2>
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                className={`w-full px-3 py-2.5 rounded-lg text-sm ${bgInput}`}
              />
              {!db.auth && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={authConfirm}
                  onChange={(e) => setAuthConfirm(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm ${bgInput}`}
                />
              )}
              <button
                onClick={handleAuthSubmit}
                className="w-full py-2.5 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white font-semibold text-sm transition cursor-pointer"
              >
                {db.auth ? 'Sign In' : 'Create Password'}
              </button>
              {db.auth && (
                <button
                  onClick={() => setResetMode(true)}
                  className="w-full py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 text-xs transition cursor-pointer"
                >
                  Forgot Password / Reset with Recovery Key
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Reset Password</h2>
              <input
                type="text"
                placeholder="Recovery key"
                value={resetRecoveryInput}
                onChange={(e) => setResetRecoveryInput(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${bgInput}`}
              />
              <input
                type="password"
                placeholder="New strong password (12+ chars)"
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${bgInput}`}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={resetConfirmPass}
                onChange={(e) => setResetConfirmPass(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${bgInput}`}
              />
              <button
                onClick={handleResetWithRecoveryKey}
                className="w-full py-2.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm transition cursor-pointer"
              >
                Reset Password
              </button>
              <button
                onClick={() => setResetMode(false)}
                className="w-full py-2 rounded-lg border border-gray-600 text-gray-300 text-xs cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isWindowed = windowState === 'windowed';

  // Calculate SVG Trend Line Coordinates for the 6 bars in the Growth Chart
  const svgPoints = growthChartData.bars.map((bar, idx) => {
    const x = 8.33 + idx * 16.66; // Center of each of the 6 columns (in % of 100 width)
    const y = 92 - (bar.heightPct * 0.72); // Top of each bar in SVG viewBox (0..100)
    return { x, y, val: bar.val };
  });
  const polylinePoints = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div
      className={
        isWindowed
          ? 'h-screen overflow-hidden bg-[#05070b] p-3 sm:p-6 flex items-center justify-center'
          : 'h-screen overflow-hidden flex flex-col'
      }
    >
      <div
        className={`flex flex-col ${bgMain} font-sans select-none overflow-hidden ${
          isWindowed
            ? 'w-full max-w-[1320px] h-[90vh] rounded-xl border border-[#2a3b68] shadow-2xl'
            : 'h-screen w-full flex-1'
        }`}
      >
        {/* Top Window Bar: Left Brand + Right Controls: Back (←), Full Screen (☐/❐), Close (✕) */}
        <div
          className={`h-10 px-3 flex items-center justify-between select-none shrink-0 relative z-[60] ${
            darkMode
              ? 'bg-[#111625] border-b border-[#252f4a] text-gray-200'
              : 'bg-slate-200 border-b border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold truncate">
            <span className="text-[#4fc3f7] text-sm">✚</span>
            <span>Hospital Management System — {activePage}</span>
            {activePage !== 'Dashboard' && (
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="ml-1 px-2.5 py-0.5 rounded bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs transition"
              >
                ← Back to Dashboard
              </button>
            )}
            <span className="text-gray-500 hidden sm:inline">·</span>
            <span className="text-[11px] text-emerald-400 font-normal hidden sm:inline">
              Auto-Backup File: backups/hms_{todayStr()}.json ({lastAutoBackupTime})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isOnline && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                ⚡ Offline Mode Active
              </span>
            )}
            {!isInstalled && (
              <button
                type="button"
                onClick={async () => {
                  if (isInstallable) {
                    await install();
                  } else {
                    setShortcutGuideOpen(true);
                  }
                }}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1"
                title="Install Desktop Shortcut & Offline App"
              >
                <span>🖥</span>
                <span>Install Desktop Shortcut</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setGuideModalOpen(true)}
              className="px-2.5 py-1 rounded bg-[#16213e] hover:bg-[#0f3460] text-gray-200 text-[11px] font-medium transition cursor-pointer whitespace-nowrap"
            >
              📘 Guide
            </button>

            {/* Back Button (Replaces Minimize — Always Clickable & Returns to Dashboard from any activity) */}
            <button
              type="button"
              onClick={handleBackToDashboard}
              title={
                activePage === 'Dashboard'
                  ? `Switch to ${lastActivityPage} or Scroll Top`
                  : 'Back to Dashboard'
              }
              aria-label="Back to Dashboard"
              className={`px-3 h-7 rounded flex items-center gap-1 text-xs font-extrabold transition whitespace-nowrap cursor-pointer shadow-xs ${
                activePage !== 'Dashboard'
                  ? 'bg-[#16a34a] hover:bg-[#15803d] text-white ring-1 ring-emerald-400/50'
                  : 'bg-[#0f3460] hover:bg-[#1e4b8f] text-white'
              }`}
            >
              <span>←</span>
              <span>{activePage !== 'Dashboard' ? 'Back to Dashboard' : 'Back'}</span>
            </button>

            {/* Full Screen / Restore Center Button */}
            <button
              onClick={handleToggleMaximize}
              title={isWindowed ? 'Full Screen / Maximize' : 'Restore Window Size'}
              aria-label="Toggle Full Screen"
              className="w-8 h-7 rounded flex items-center justify-center text-xs hover:bg-gray-700/60 transition cursor-pointer"
            >
              {isWindowed ? '☐' : '❐'}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setWindowState('closed')}
              title="Close Application"
              aria-label="Close Application"
              className="w-8 h-7 rounded flex items-center justify-center text-xs hover:bg-[#dc2626] hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {banner && (
          <div
            className={`fixed top-12 right-4 z-50 px-4 py-3 rounded-lg text-sm font-semibold shadow-xl flex items-center gap-3 ${
              banner.type === 'error'
                ? 'bg-[#dc2626] text-white'
                : banner.type === 'success'
                ? 'bg-[#16a34a] text-white'
                : 'bg-[#0f3460] text-white'
            }`}
          >
            <span>{banner.message}</span>
            <button onClick={() => setBanner(null)} className="text-white/80 hover:text-white font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Fixed Workspace Split: Left Sidebar stays 100% locked while Main Content scrolls independently */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar (Fixed, does NOT scroll when right activity scrolls) */}
          <aside className={`w-[220px] h-full shrink-0 flex flex-col justify-between overflow-y-auto ${bgSidebar}`}>
            <div>
              <div className="pt-5 pb-4 text-center">
                <div className="text-4xl text-[#4fc3f7] leading-none mb-1">✚</div>
                <div className="text-lg font-bold tracking-wide">HMS</div>
                <div className="text-[11px] text-gray-400">Hospital Management</div>
              </div>
              <div className="mx-4 h-px bg-[#333] mb-2" />
              <nav className="px-2.5 space-y-1">
                {PAGES.map((p) => {
                  const isActive = activePage === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => handleSelectPage(p.name)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#0f3460] text-white'
                          : darkMode
                          ? 'text-[#ccc] hover:bg-[#16213e]'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-2.5 space-y-2">
              <div className="mx-2 h-px bg-[#333] mb-2" />
              {!isInstalled && (
                <button
                  type="button"
                  onClick={async () => {
                    if (isInstallable) {
                      await install();
                    } else {
                      setShortcutGuideOpen(true);
                    }
                  }}
                  className="w-full py-2 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>🖥</span>
                  <span>Desktop Shortcut & Offline</span>
                </button>
              )}
              <button
                onClick={() => setBackupModalOpen(true)}
                className="w-full py-2 px-2.5 rounded-lg text-[11px] font-medium bg-[#16213e] hover:bg-[#0f3460] text-emerald-300 transition cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <span>💾</span>
                <span>Auto-Backup Files ({backupFiles.length})</span>
              </button>
              <button
                onClick={() => {
                  if (db.auth) {
                    setIsLocked(true);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="w-full py-2 rounded-lg text-[11px] font-medium bg-[#16213e] hover:bg-[#0f3460] text-gray-200 transition cursor-pointer whitespace-nowrap"
              >
                🔒 {db.auth ? 'Lock App' : 'Set Admin Password'}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full py-2 rounded-lg text-[11px] font-medium bg-[#16213e] hover:bg-[#0f3460] text-white transition cursor-pointer whitespace-nowrap"
              >
                {darkMode ? '☀  Light Mode' : '🌙  Dark Mode'}
              </button>

              {/* Developer Signature at the very bottom of the Sidebar Menu */}
              <div className="pt-2 mt-1 border-t border-[#2a3655] text-center">
                <div className="px-2.5 py-2 rounded-lg bg-gradient-to-r from-[#0f3460] via-[#16213e] to-[#0f3460] border border-[#4fc3f7]/35 shadow-sm">
                  <div className="text-[10px] font-extrabold text-[#4fc3f7] tracking-wide leading-snug">
                    Developed by Sajjad Qaiser Shah
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area (Scrolls independently while Sidebar stays fixed) */}
          <main ref={mainScrollRef} className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
            {/* Page Header */}
            <header className="px-6 pt-4 pb-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {activePage !== 'Dashboard' && (
                  <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className="px-3.5 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-extrabold transition cursor-pointer whitespace-nowrap shadow-xs flex items-center gap-1.5"
                  >
                    <span>←</span>
                    <span>Back to Dashboard</span>
                  </button>
                )}
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span>{PAGES.find((p) => p.name === activePage)?.icon}</span>
                  <span>{activePage}</span>
                </h1>
              </div>
              <div className="text-xs text-gray-400">
                Date Filter: {dashFrom} to {dashTo}
              </div>
            </header>

            {/* Dashboard Page */}
            {activePage === 'Dashboard' && (
              <div className="px-5 py-3 space-y-4 pb-8">
                {/* Financial Overview Header & Date Range Filter */}
                <div className={`rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 ${bgCard}`}>
                  <div className="text-base font-bold text-[#4fc3f7] flex items-center gap-2">
                    <span>📊 Financial Overview</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: 'Today', days: 0 },
                      { label: 'This Week', days: 6 },
                      { label: 'This Month', days: null },
                      { label: 'Year', days: 365 },
                      { label: 'All Time', days: -1 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyDashPreset(preset.days)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0f3460] hover:bg-[#1e4b8f] text-white transition cursor-pointer whitespace-nowrap"
                      >
                        {preset.label}
                      </button>
                    ))}
                    <input
                      type="date"
                      value={dashFrom}
                      onChange={(e) => setDashFrom(e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs tabular-nums ${bgInput}`}
                    />
                    <input
                      type="date"
                      value={dashTo}
                      onChange={(e) => setDashTo(e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs tabular-nums ${bgInput}`}
                    />
                  </div>
                </div>

                {/* Monthly & Financial Growth Overview Card (Styled after user's uploaded image) */}
                <div
                  className={`rounded-2xl p-6 border ${
                    darkMode
                      ? 'bg-gradient-to-br from-[#121d38] via-[#162444] to-[#0f292e] border-[#263c6e] text-white'
                      : 'bg-gradient-to-br from-[#f0f7ff] via-[#f5fbf9] to-[#e6f7f0] border-sky-200 text-[#0f2942]'
                  }`}
                >
                  {/* Top Header Row of Growth Card */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      {/* Rising Bars + Arrow SVG Icon */}
                      <div
                        className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 ${
                          darkMode ? 'bg-[#0d182e] border border-[#284275]' : 'bg-white shadow-xs border border-sky-100'
                        }`}
                      >
                        <svg viewBox="0 0 48 48" className="w-9 h-9">
                          <rect x="6" y="28" width="7" height="14" rx="2" fill="#2563eb" />
                          <rect x="17" y="21" width="7" height="21" rx="2" fill="#0ea5e9" />
                          <rect x="28" y="13" width="7" height="29" rx="2" fill="#10b981" />
                          <path
                            d="M7 22 L19 14 L32 7 M32 7 L25 7 M32 7 L32 14"
                            stroke="#0284c7"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                          Monthly Growth Overview
                        </h2>
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-sky-200/80' : 'text-slate-600'}`}>
                          Progress Today • Bigger Goals Tomorrow
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Live Stream Play/Pause Button */}
                      <button
                        type="button"
                        onClick={() => setIsLiveStreaming((s) => !s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition border ${
                          isLiveStreaming
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                          }`}
                        />
                        <span>{isLiveStreaming ? 'LIVE TRADING ON' : 'PAUSED (Click to Live)'}</span>
                      </button>

                      {/* Mode Switcher */}
                      <div
                        className={`flex items-center gap-1 p-1 rounded-lg border ${
                          darkMode ? 'bg-[#0d1527] border-[#253861]' : 'bg-white/90 border-sky-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setChartMode('trading')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                            chartMode === 'trading'
                              ? 'bg-[#16a34a] text-white'
                              : darkMode
                              ? 'text-gray-300 hover:text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📈 Live Trading Graph
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartMode('monthly')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                            chartMode === 'monthly'
                              ? 'bg-[#0284c7] text-white'
                              : darkMode
                              ? 'text-gray-300 hover:text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📊 Monthly Growth (Live)
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartMode('live')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                            chartMode === 'live'
                              ? 'bg-[#0284c7] text-white'
                              : darkMode
                              ? 'text-gray-300 hover:text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          🏥 Hospital Breakdown
                        </button>
                      </div>

                      {/* Live Trading Price & Growth Box */}
                      {(() => {
                        const lastCandle = tradingCandles[tradingCandles.length - 1] || {
                          open: 14500,
                          close: 15100,
                          high: 15250,
                          low: 14400,
                          bullish: true,
                        };
                        const prevCandle = tradingCandles[tradingCandles.length - 2] || lastCandle;
                        const diff = lastCandle.close - prevCandle.close;
                        const pct = prevCandle.close > 0 ? ((diff / prevCandle.close) * 100).toFixed(2) : '1.25';
                        const isUp = diff >= 0;
                        return (
                          <div
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
                              darkMode
                                ? 'bg-emerald-950/50 border-emerald-700/50'
                                : 'bg-emerald-50/90 border-emerald-200'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-bold ${
                                isUp ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            >
                              {isUp ? '↗' : '↘'}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                LIVE HOSPITAL INDEX
                              </div>
                              <div
                                className={`text-lg font-extrabold leading-tight tabular-nums ${
                                  isUp ? 'text-[#22c55e]' : 'text-rose-400'
                                }`}
                              >
                                Rs {lastCandle.close.toLocaleString('en-US')}
                              </div>
                              <div
                                className={`text-[10px] font-bold tabular-nums ${
                                  isUp ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isUp ? '▲ +' : '▼ '}
                                {diff} ({isUp ? '+' : ''}
                                {pct}%) · +{growthChartData.growthPct}%
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* LIVE TRADING TERMINAL (Candlesticks + Real-Time Moving Line + Live Price Laser) */}
                  {chartMode === 'trading' &&
                    (() => {
                      const highMax = Math.max(...tradingCandles.map((c) => c.high), 5000) + 250;
                      const lowMin = Math.max(0, Math.min(...tradingCandles.map((c) => c.low), 1000) - 250);
                      const range = Math.max(highMax - lowMin, 500);
                      const yTicks = [
                        highMax,
                        Math.round(lowMin + range * 0.8),
                        Math.round(lowMin + range * 0.6),
                        Math.round(lowMin + range * 0.4),
                        Math.round(lowMin + range * 0.2),
                        lowMin,
                      ];
                      const lastCandle = tradingCandles[tradingCandles.length - 1] || {
                        time: 'LIVE',
                        open: 15000,
                        high: 15200,
                        low: 14800,
                        close: 15100,
                        volume: 60,
                        bullish: true,
                      };
                      const lastY = 100 - ((lastCandle.close - lowMin) / range) * 100;

                      const linePoints = tradingCandles
                        .map((c, idx) => {
                          const x = ((idx + 0.5) / tradingCandles.length) * 100;
                          const y = 100 - ((c.close - lowMin) / range) * 100;
                          return `${x.toFixed(2)},${y.toFixed(2)}`;
                        })
                        .join(' ');

                      const areaPoints = `2.08,100 ${linePoints} 97.92,100`;

                      return (
                        <div
                          className={`rounded-xl p-4 sm:p-5 border mb-5 ${
                            darkMode ? 'bg-[#09101d] border-[#1f345a]' : 'bg-slate-900 text-white border-slate-700'
                          }`}
                        >
                          {/* Top Trading Ticker Strip */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                HMS/PKR LIVE TRADING FEED
                              </span>
                              <span className="text-gray-400 font-mono">
                                OPEN: <strong className="text-white">{lastCandle.open}</strong>
                              </span>
                              <span className="text-gray-400 font-mono">
                                HIGH: <strong className="text-emerald-400">{lastCandle.high}</strong>
                              </span>
                              <span className="text-gray-400 font-mono">
                                LOW: <strong className="text-rose-400">{lastCandle.low}</strong>
                              </span>
                              <span className="text-gray-400 font-mono">
                                LIVE:{' '}
                                <strong
                                  className={lastCandle.bullish ? 'text-emerald-400' : 'text-rose-400'}
                                >
                                  Rs {lastCandle.close}
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const nowStr = new Date().toTimeString().slice(0, 8);
                                  setTradingCandles((prev) => {
                                    const last = prev[prev.length - 1];
                                    const jump = Math.round(220 + Math.random() * 350);
                                    const close = last.close + jump;
                                    return [
                                      ...prev.slice(-23),
                                      {
                                        time: nowStr,
                                        open: last.close,
                                        high: close + 90,
                                        low: last.close - 30,
                                        close,
                                        volume: 95,
                                        bullish: true,
                                      },
                                    ];
                                  });
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer transition"
                              >
                                ⚡ + Revenue / Buy Tick
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nowStr = new Date().toTimeString().slice(0, 8);
                                  setTradingCandles((prev) => {
                                    const last = prev[prev.length - 1];
                                    const drop = Math.round(180 + Math.random() * 280);
                                    const close = Math.max(1200, last.close - drop);
                                    return [
                                      ...prev.slice(-23),
                                      {
                                        time: nowStr,
                                        open: last.close,
                                        high: last.close + 40,
                                        low: close - 80,
                                        close,
                                        volume: 88,
                                        bullish: false,
                                      },
                                    ];
                                  });
                                }}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer transition"
                              >
                                📉 - Expense / Sell Tick
                              </button>
                            </div>
                          </div>

                          {/* Candlestick + Live Line Canvas */}
                          <div className="flex items-stretch gap-2">
                            {/* Y-Axis Price Scale */}
                            <div className="flex flex-col justify-between text-right pr-2 text-[11px] font-mono text-gray-400 tabular-nums h-64 select-none">
                              {yTicks.map((t, i) => (
                                <span key={i}>Rs {t.toLocaleString('en-US')}</span>
                              ))}
                            </div>

                            {/* Trading Plot Area */}
                            <div className="flex-1 relative h-64 border-l border-b border-slate-700/80 bg-[#060b14] rounded-lg overflow-hidden">
                              {/* Gridlines */}
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {yTicks.map((_, idx) => (
                                  <div key={idx} className="w-full border-t border-slate-800/80" />
                                ))}
                              </div>

                              {/* SVG Candlesticks + Glowing Live Trend Line + Live Price Laser */}
                              <svg
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                className="absolute inset-0 w-full h-full overflow-visible"
                              >
                                <defs>
                                  <linearGradient id="liveAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
                                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>

                                {/* Glowing Area under live price curve */}
                                <polygon points={areaPoints} fill="url(#liveAreaFill)" />

                                {/* Live Horizontal Price Laser Line */}
                                <line
                                  x1="0"
                                  y1={lastY}
                                  x2="100"
                                  y2={lastY}
                                  stroke={lastCandle.bullish ? '#22c55e' : '#f43f5e'}
                                  strokeWidth="0.4"
                                  strokeDasharray="1.5,1.5"
                                />

                                {/* Candlesticks (Wicks + Bodies) */}
                                {tradingCandles.map((c, idx) => {
                                  const xCenter = ((idx + 0.5) / tradingCandles.length) * 100;
                                  const highY = 100 - ((c.high - lowMin) / range) * 100;
                                  const lowY = 100 - ((c.low - lowMin) / range) * 100;
                                  const openY = 100 - ((c.open - lowMin) / range) * 100;
                                  const closeY = 100 - ((c.close - lowMin) / range) * 100;
                                  const bodyTop = Math.min(openY, closeY);
                                  const bodyHeight = Math.max(Math.abs(closeY - openY), 1.4);
                                  const color = c.bullish ? '#22c55e' : '#ef4444';

                                  return (
                                    <g key={`${c.time}-${idx}`}>
                                      {/* High-Low Wick */}
                                      <line
                                        x1={xCenter}
                                        y1={highY}
                                        x2={xCenter}
                                        y2={lowY}
                                        stroke={color}
                                        strokeWidth="0.45"
                                      />
                                      {/* Open-Close Candle Body */}
                                      <rect
                                        x={xCenter - 1.25}
                                        y={bodyTop}
                                        width="2.5"
                                        height={bodyHeight}
                                        fill={color}
                                        rx="0.3"
                                      />
                                    </g>
                                  );
                                })}

                                {/* Bright Cyan Live Moving Ticker Line */}
                                <polyline
                                  fill="none"
                                  stroke="#38bdf8"
                                  strokeWidth="0.9"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={linePoints}
                                />

                                {/* Live Pulsing Dot at Latest Price */}
                                <circle
                                  cx={((tradingCandles.length - 0.5) / tradingCandles.length) * 100}
                                  cy={lastY}
                                  r="1.5"
                                  fill={lastCandle.bullish ? '#22c55e' : '#ef4444'}
                                  stroke="#ffffff"
                                  strokeWidth="0.5"
                                />
                              </svg>

                              {/* Live Floating Price Tag on Right Edge */}
                              <div
                                style={{ top: `${Math.min(90, Math.max(6, lastY))}%` }}
                                className={`absolute right-1 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold text-white shadow-md transition-all duration-300 ${
                                  lastCandle.bullish ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              >
                                Rs {lastCandle.close.toLocaleString('en-US')}
                              </div>
                            </div>
                          </div>

                          {/* Time Axis Labels */}
                          <div className="flex justify-between pl-16 pr-2 pt-2 text-[10px] font-mono text-gray-400">
                            {tradingCandles
                              .filter((_, i) => i % 4 === 0 || i === tradingCandles.length - 1)
                              .map((c, i) => (
                                <span key={i}>{c.time}</span>
                              ))}
                          </div>
                        </div>
                      );
                    })()}

                  {/* Main Chart Box */}
                  <div
                    className={`rounded-xl p-4 sm:p-6 border ${
                      darkMode ? 'bg-[#0e172a]/90 border-[#22355c]' : 'bg-white/95 border-slate-200'
                    }`}
                  >
                    <div className="flex items-stretch gap-3">
                      {/* Vertical "Value" Axis Title */}
                      <div className="hidden sm:flex items-center justify-center w-5">
                        <span
                          className={`text-xs font-semibold -rotate-90 whitespace-nowrap ${
                            darkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}
                        >
                          Value
                        </span>
                      </div>

                      {/* Y-Axis Labels */}
                      <div
                        className={`flex flex-col justify-between text-right pr-2 text-[11px] font-medium tabular-nums h-60 select-none ${
                          darkMode ? 'text-gray-400' : 'text-slate-500'
                        }`}
                      >
                        {growthChartData.yTicks.map((tick, i) => (
                          <span key={i}>{tick.toLocaleString('en-US')}</span>
                        ))}
                      </div>

                      {/* Bars + Gridlines + Rising Trend Line Overlay */}
                      <div className="flex-1 flex flex-col">
                        <div className="relative h-60 border-l border-b border-sky-500/25 flex items-end justify-around px-2 sm:px-6 pt-8">
                          {/* Horizontal Gridlines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {growthChartData.yTicks.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-full border-t ${
                                  darkMode ? 'border-slate-700/40' : 'border-slate-200/80'
                                }`}
                              />
                            ))}
                          </div>

                          {/* SVG Rising Trend Line with Circular Nodes & Arrowhead */}
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                          >
                            <defs>
                              <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="50%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#22c55e" />
                              </linearGradient>
                            </defs>
                            <polyline
                              fill="none"
                              stroke="url(#trendGrad)"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={polylinePoints}
                            />
                            {/* Arrowhead at the last bar point */}
                            {svgPoints.length >= 2 && (
                              <polygon
                                points={`${svgPoints[svgPoints.length - 1].x},${svgPoints[svgPoints.length - 1].y - 1.5} ${
                                  svgPoints[svgPoints.length - 1].x - 2.4
                                },${svgPoints[svgPoints.length - 1].y - 1.2} ${
                                  svgPoints[svgPoints.length - 1].x - 1.1
                                },${svgPoints[svgPoints.length - 1].y + 2.4}`}
                                fill="#22c55e"
                              />
                            )}
                          </svg>

                          {/* 6 Rounded Gradient Columns */}
                          {growthChartData.bars.map((bar, idx) => (
                            <div
                              key={bar.label}
                              className="relative z-10 flex flex-col items-center justify-end h-full w-full max-w-[74px] px-1 group"
                            >
                              {/* Value Label on Top of Bar */}
                              <div
                                className={`text-xs sm:text-sm font-extrabold tabular-nums mb-2 ${
                                  darkMode ? 'text-white' : 'text-slate-800'
                                }`}
                              >
                                {bar.val.toLocaleString('en-US')}
                              </div>

                              {/* Bar Body */}
                              <div
                                style={{
                                  height: `${bar.heightPct}%`,
                                  background: bar.gradient,
                                }}
                                className="w-full rounded-t-xl relative shadow-md transition-all duration-300 group-hover:brightness-110"
                              >
                                {/* Circular Marker Ring near top of bar */}
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-sky-500 shadow-xs absolute -top-1.5 left-1/2 -translate-x-1/2 z-30" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* X-Axis Bar Labels */}
                        <div className="flex justify-around px-2 sm:px-6 pt-2.5">
                          {growthChartData.bars.map((bar) => (
                            <div
                              key={bar.label}
                              className={`w-full max-w-[74px] text-center text-xs font-semibold truncate ${
                                darkMode ? 'text-gray-300' : 'text-slate-700'
                              }`}
                            >
                              {bar.label}
                            </div>
                          ))}
                        </div>

                        {/* X-Axis Title */}
                        <div
                          className={`text-center text-xs font-semibold mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}
                        >
                          {growthChartData.xAxisLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom 4 KPI Cards Row (Matching the 4 cards at the bottom of the uploaded image) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
                    {/* Card 1 */}
                    <div
                      className={`rounded-xl p-4 flex items-center gap-3.5 border ${
                        darkMode ? 'bg-[#0e1b33] border-sky-900/50' : 'bg-sky-50/90 border-sky-200'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#1d6feb] text-white flex items-center justify-center text-lg shrink-0">
                        🏥
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                          OPD & Lab Patients
                        </div>
                        <div className="text-xl font-extrabold tabular-nums">
                          {(db.opd.length + db.lab.length).toLocaleString('en-US')}
                        </div>
                        <div className="text-[11px] text-sky-400 font-medium">
                          Active Hospital Visits
                        </div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div
                      className={`rounded-xl p-4 flex items-center gap-3.5 border ${
                        darkMode ? 'bg-[#0d2622] border-emerald-900/50' : 'bg-emerald-50/90 border-emerald-200'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-lg shrink-0">
                        💰
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                          Total Revenue
                        </div>
                        <div className="text-xl font-extrabold tabular-nums text-[#22c55e]">
                          Rs {dashMetrics.income.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-medium">
                          Sales + Lab + OPD
                        </div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div
                      className={`rounded-xl p-4 flex items-center gap-3.5 border ${
                        darkMode ? 'bg-[#1a1836] border-indigo-900/50' : 'bg-indigo-50/90 border-indigo-200'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-lg shrink-0">
                        🛒
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                          Pharmacy Sales
                        </div>
                        <div className="text-xl font-extrabold tabular-nums">
                          Rs {dashMetrics.sale.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[11px] text-indigo-400 font-medium">
                          {db.sales.length} Bills Recorded
                        </div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div
                      className={`rounded-xl p-4 flex items-center gap-3.5 border ${
                        darkMode ? 'bg-[#0e2430] border-cyan-900/50' : 'bg-cyan-50/90 border-cyan-200'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#0891b2] text-white flex items-center justify-center text-lg shrink-0">
                        📈
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                          Net Profit
                        </div>
                        <div className="text-xl font-extrabold tabular-nums text-[#4fc3f7]">
                          Rs {dashMetrics.profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-medium">
                          After COGS & Expenses
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5 Classic HMS KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { icon: '💰', title: 'Total Income', val: dashMetrics.income, color: 'text-[#16a34a]' },
                    { icon: '📉', title: 'Total Expenses', val: dashMetrics.cost, color: 'text-[#ea580c]' },
                    { icon: '📈', title: 'Total Profit', val: dashMetrics.profit, color: 'text-[#16a34a]' },
                    { icon: '📉', title: 'Total Loss', val: dashMetrics.loss, color: 'text-[#dc2626]' },
                    { icon: '🛒', title: 'Medicine Purchases', val: dashMetrics.purch, color: 'text-[#7c3aed]' },
                  ].map((kpi) => (
                    <div key={kpi.title} className={`rounded-xl p-4 ${bgCard}`}>
                      <div className="text-2xl mb-1">{kpi.icon}</div>
                      <div className="text-xs text-gray-400">{kpi.title}</div>
                      <div className={`text-2xl font-bold mt-1 tabular-nums ${kpi.color}`}>
                        {kpi.val.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3 Breakdown Panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Income Breakdown */}
                  <div className={`rounded-xl p-4 ${bgCard}`}>
                    <div className="text-sm font-bold text-[#16a34a] mb-2">Income Breakdown</div>
                    <div className="h-px bg-[#333] mb-3" />
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Medical store sale', val: dashMetrics.sale },
                        { label: 'Lab', val: dashMetrics.lab },
                        { label: 'OPD fees', val: dashMetrics.opd },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between items-center">
                          <span className="text-gray-400">{r.label}</span>
                          <span className="font-bold tabular-nums">
                            {r.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className={`rounded-xl p-4 ${bgCard}`}>
                    <div className="text-sm font-bold text-[#ea580c] mb-2">Expense Breakdown</div>
                    <div className="h-px bg-[#333] mb-3" />
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Cost of Medicines Sold', val: dashMetrics.cogs },
                        { label: 'Salaries', val: dashMetrics.sal },
                        { label: 'Expenses', val: dashMetrics.exp },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between items-center">
                          <span className="text-gray-400">{r.label}</span>
                          <span className="font-bold tabular-nums">
                            {r.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock & Staff */}
                  <div className={`rounded-xl p-4 ${bgCard}`}>
                    <div className="text-sm font-bold text-[#4fc3f7] mb-2">Stock & Staff</div>
                    <div className="h-px bg-[#333] mb-3" />
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Medicine Types</span>
                        <span className="font-bold tabular-nums">{dashMetrics.medicineTypes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Units</span>
                        <span className="font-bold tabular-nums">{dashMetrics.totalUnits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Stock Value</span>
                        <span className="font-bold tabular-nums">
                          {dashMetrics.stockValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Low Stock (&lt;10)</span>
                        <span className={`font-bold tabular-nums ${dashMetrics.lowStock > 0 ? 'text-[#dc2626]' : ''}`}>
                          {dashMetrics.lowStock}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total employees</span>
                        <span className="font-bold tabular-nums">{dashMetrics.totalEmployees}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Monthly Salary Total</span>
                        <span className="font-bold tabular-nums">
                          {dashMetrics.monthlySalaryTotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CRUD Pages */}
            {activePage !== 'Dashboard' && (
              <div className="px-5 py-3 flex-1 flex flex-col space-y-3 pb-8">
                {/* New Entry Form Card */}
                <div className={`rounded-xl p-4 shrink-0 ${bgCard}`}>
                  <div className="text-xs font-bold text-[#4fc3f7] mb-3">➕ New Entry</div>

                  {activePage === 'Medicines' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Name"
                          value={medForm.name}
                          onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Company</label>
                        <input
                          type="text"
                          placeholder="Company"
                          value={medForm.company}
                          onChange={(e) => setMedForm({ ...medForm, company: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Batch</label>
                        <input
                          type="text"
                          placeholder="Batch"
                          value={medForm.batch}
                          onChange={(e) => setMedForm({ ...medForm, batch: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Expiry</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM"
                          value={medForm.expiry}
                          onChange={(e) => setMedForm({ ...medForm, expiry: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Buy Price</label>
                        <input
                          type="number"
                          placeholder="Buy Price"
                          value={medForm.buy_price}
                          onChange={(e) => setMedForm({ ...medForm, buy_price: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Sale Price</label>
                        <input
                          type="number"
                          placeholder="Sale Price"
                          value={medForm.sale_price}
                          onChange={(e) => setMedForm({ ...medForm, sale_price: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Qty</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={medForm.qty}
                          onChange={(e) => setMedForm({ ...medForm, qty: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {activePage === 'Purchase' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Invoice No. (optional)</label>
                        <input
                          type="text"
                          placeholder="Auto if blank"
                          value={purchaseForm.invoice_no}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_no: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Medicine</label>
                        <select
                          value={purchaseForm.medicine_id}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, medicine_id: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        >
                          <option value="">Select Medicine...</option>
                          {db.medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.id} - {m.name} (Stock: {m.qty})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Qty</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={purchaseForm.qty}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, qty: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Buy Price</label>
                        <input
                          type="number"
                          placeholder="Buy Price"
                          value={purchaseForm.buy_price}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, buy_price: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Supplier</label>
                        <input
                          type="text"
                          placeholder="Supplier"
                          value={purchaseForm.supplier}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Paid Now</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={purchaseForm.paid_now}
                          onChange={(e) => setPurchaseForm({ ...purchaseForm, paid_now: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {activePage === 'Sale' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Medicine</label>
                        <select
                          value={saleForm.medicine_id}
                          onChange={(e) => setSaleForm({ ...saleForm, medicine_id: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        >
                          <option value="">Select Medicine...</option>
                          {db.medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.id} - {m.name} (Price: {m.sale_price} | Qty: {m.qty})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Qty</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={saleForm.qty}
                          onChange={(e) => setSaleForm({ ...saleForm, qty: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Customer</label>
                        <input
                          type="text"
                          placeholder="Walk-in Customer"
                          value={saleForm.customer}
                          onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {activePage === 'Lab' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Patient</label>
                        <input
                          type="text"
                          placeholder="Patient Name"
                          value={labForm.patient}
                          onChange={(e) => setLabForm({ ...labForm, patient: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Test</label>
                        <input
                          type="text"
                          placeholder="Test Name"
                          value={labForm.test}
                          onChange={(e) => setLabForm({ ...labForm, test: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Fee</label>
                        <input
                          type="number"
                          placeholder="Fee"
                          value={labForm.fee}
                          onChange={(e) => setLabForm({ ...labForm, fee: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {activePage === 'OPD' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Patient</label>
                        <input
                          type="text"
                          placeholder="Patient Name"
                          value={opdForm.patient}
                          onChange={(e) => setOpdForm({ ...opdForm, patient: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Doctor</label>
                        <input
                          type="text"
                          placeholder="Doctor Name"
                          value={opdForm.doctor}
                          onChange={(e) => setOpdForm({ ...opdForm, doctor: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Fee</label>
                        <input
                          type="number"
                          placeholder="Fee"
                          value={opdForm.fee}
                          onChange={(e) => setOpdForm({ ...opdForm, fee: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {activePage === 'Employees' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Employee Name"
                          value={empForm.name}
                          onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Role</label>
                        <input
                          type="text"
                          placeholder="Role"
                          value={empForm.role}
                          onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Salary</label>
                        <input
                          type="number"
                          placeholder="Monthly Salary"
                          value={empForm.salary}
                          onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Phone</label>
                        <input
                          type="text"
                          placeholder="Phone"
                          value={empForm.phone}
                          onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {activePage === 'Expenses' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Category</label>
                        <input
                          type="text"
                          placeholder="Category"
                          value={expForm.category}
                          onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Amount</label>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={expForm.amount}
                          onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Note</label>
                        <input
                          type="text"
                          placeholder="Note"
                          value={expForm.note}
                          onChange={(e) => setExpForm({ ...expForm, note: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {activePage === 'Sale' ? (
                      <>
                        <button
                          onClick={() => handleAddSale(true)}
                          className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                        >
                          Sell & Generate Bill
                        </button>
                        <button
                          onClick={() => handleAddSale(false)}
                          className="px-4 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                        >
                          Sell Without Bill
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (activePage === 'Medicines') handleAddMedicine();
                          if (activePage === 'Purchase') handleAddPurchase();
                          if (activePage === 'Lab') handleAddLab();
                          if (activePage === 'OPD') handleAddOpd();
                          if (activePage === 'Employees') handleAddEmployee();
                          if (activePage === 'Expenses') handleAddExpense();
                        }}
                        className="px-5 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                      >
                        ✚ Add
                      </button>
                    )}

                    <button
                      onClick={handleDeleteSelected}
                      className="px-4 py-2 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                    >
                      🗑 Delete
                    </button>

                    {activePage === 'Purchase' && (
                      <>
                        <button
                          onClick={() => setSupplierBalancesModal(true)}
                          className="px-4 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                        >
                          Supplier Balances
                        </button>
                        <button
                          onClick={() => setRecordPaymentModal(true)}
                          className="px-4 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                        >
                          Record Payment
                        </button>
                      </>
                    )}

                    {activePage === 'Employees' && (
                      <>
                        <button
                          onClick={handleTriggerPaySalary}
                          className="px-4 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                        >
                          💵 Pay Salary
                        </button>
                        <button
                          onClick={handleTriggerSalaryHistory}
                          className="px-4 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                        >
                          Salary History
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Search & Date Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-60 px-3 py-1.5 rounded-lg text-xs ${bgInput}`}
                  />
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-3 py-1.5 rounded-lg bg-[#374151] hover:bg-gray-600 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                  >
                    Clear
                  </button>

                  {['Purchase', 'Sale', 'Lab', 'OPD', 'Expenses'].includes(activePage) && (
                    <div className="flex items-center gap-1 ml-1">
                      {(['Today', 'This Week', 'This Month', 'All Time'] as const).map((df) => (
                        <button
                          key={df}
                          onClick={() => setDateFilter(df)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                            dateFilter === df
                              ? 'bg-[#4fc3f7] text-[#0d1117] font-bold'
                              : 'bg-[#0f3460] text-white hover:bg-[#1e4b8f]'
                          }`}
                        >
                          {df}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Table */}
                <div className={`flex-1 rounded-xl overflow-hidden flex flex-col min-h-[260px] ${bgCard}`}>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs tabular-nums">
                      <thead>
                        <tr className="bg-[#0f3460] text-[#4fc3f7] font-bold">
                          {activePage === 'Medicines' &&
                            ['ID', 'Name', 'Company', 'Batch', 'Expiry', 'Buy', 'Sale', 'Qty'].map((h) => (
                              <th key={h} className="py-2.5 px-3">
                                {h}
                              </th>
                            ))}
                          {activePage === 'Purchase' &&
                            ['ID', 'Date', 'Invoice', 'Medicine', 'Qty', 'Unit Cost', 'Supplier', 'Line Total'].map(
                              (h) => (
                                <th key={h} className="py-2.5 px-3">
                                  {h}
                                </th>
                              )
                            )}
                          {activePage === 'Sale' &&
                            ['ID', 'Date', 'Bill No.', 'Customer', 'Medicine', 'Qty', 'Price', 'Total', 'Receipt'].map(
                              (h) => (
                                <th key={h} className="py-2.5 px-3">
                                  {h}
                                </th>
                              )
                            )}
                          {activePage === 'Lab' &&
                            ['ID', 'Date', 'Patient', 'Test', 'Fee'].map((h) => (
                              <th key={h} className="py-2.5 px-3">
                                {h}
                              </th>
                            ))}
                          {activePage === 'OPD' &&
                            ['ID', 'Date', 'Patient', 'Doctor', 'Fee'].map((h) => (
                              <th key={h} className="py-2.5 px-3">
                                {h}
                              </th>
                            ))}
                          {activePage === 'Employees' &&
                            ['ID', 'Name', 'Role', 'Salary', 'Phone'].map((h) => (
                              <th key={h} className="py-2.5 px-3">
                                {h}
                              </th>
                            ))}
                          {activePage === 'Expenses' &&
                            ['ID', 'Date', 'Category', 'Amount', 'Note'].map((h) => (
                              <th key={h} className="py-2.5 px-3">
                                {h}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {activePage === 'Medicines' &&
                          db.medicines
                            .filter((m) =>
                              `${m.id} ${m.name} ${m.company} ${m.batch} ${m.expiry}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((m) => {
                              const isSelected = selectedId === m.id;
                              const isLow = m.qty < 10;
                              return (
                                <tr
                                  key={m.id}
                                  onClick={() => setSelectedId(m.id)}
                                  className={`cursor-pointer transition ${
                                    isSelected
                                      ? 'bg-[#0f3460] text-white'
                                      : isLow
                                      ? 'bg-red-950/50 text-red-300'
                                      : 'hover:bg-[#1e293b]/50'
                                  }`}
                                >
                                  <td className="py-2 px-3">{m.id}</td>
                                  <td className="py-2 px-3 font-medium">{m.name}</td>
                                  <td className="py-2 px-3">{m.company}</td>
                                  <td className="py-2 px-3">{m.batch}</td>
                                  <td className="py-2 px-3">{m.expiry}</td>
                                  <td className="py-2 px-3">{m.buy_price.toFixed(2)}</td>
                                  <td className="py-2 px-3">{m.sale_price.toFixed(2)}</td>
                                  <td className="py-2 px-3 font-bold">
                                    {m.qty} {isLow && <span className="ml-1 text-[10px] text-red-400">· Low Stock</span>}
                                  </td>
                                </tr>
                              );
                            })}

                        {activePage === 'Purchase' &&
                          db.purchases
                            .filter((p) => passesDateFilter(p.date))
                            .map((p) => {
                              const medName =
                                db.medicines.find((m) => m.id === p.medicine_id)?.name || `Med #${p.medicine_id}`;
                              return { ...p, medName, lineTotal: p.qty * p.buy_price };
                            })
                            .filter((p) =>
                              `${p.id} ${p.date} ${p.invoice_no} ${p.medName} ${p.supplier}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((p) => (
                              <tr
                                key={p.id}
                                onClick={() => setSelectedId(p.id)}
                                className={`cursor-pointer transition ${
                                  selectedId === p.id ? 'bg-[#0f3460] text-white' : 'hover:bg-[#1e293b]/50'
                                }`}
                              >
                                <td className="py-2 px-3">{p.id}</td>
                                <td className="py-2 px-3">{p.date}</td>
                                <td className="py-2 px-3 font-mono">{p.invoice_no}</td>
                                <td className="py-2 px-3 font-medium">{p.medName}</td>
                                <td className="py-2 px-3">{p.qty}</td>
                                <td className="py-2 px-3">{p.buy_price.toFixed(2)}</td>
                                <td className="py-2 px-3">{p.supplier}</td>
                                <td className="py-2 px-3 font-bold">{p.lineTotal.toFixed(2)}</td>
                              </tr>
                            ))}

                        {activePage === 'Sale' &&
                          db.sales
                            .filter((s) => passesDateFilter(s.date))
                            .map((s) => {
                              const medName =
                                db.medicines.find((m) => m.id === s.medicine_id)?.name || `Med #${s.medicine_id}`;
                              return { ...s, medName, total: s.qty * s.price };
                            })
                            .filter((s) =>
                              `${s.id} ${s.date} ${s.bill_no || 'No Bill'} ${s.customer} ${s.medName}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((s) => (
                              <tr
                                key={s.id}
                                onClick={() => setSelectedId(s.id)}
                                className={`cursor-pointer transition ${
                                  selectedId === s.id ? 'bg-[#0f3460] text-white' : 'hover:bg-[#1e293b]/50'
                                }`}
                              >
                                <td className="py-2 px-3">{s.id}</td>
                                <td className="py-2 px-3">{s.date}</td>
                                <td className="py-2 px-3 font-mono">{s.bill_no || 'No Bill'}</td>
                                <td className="py-2 px-3">{s.customer}</td>
                                <td className="py-2 px-3 font-medium">{s.medName}</td>
                                <td className="py-2 px-3">{s.qty}</td>
                                <td className="py-2 px-3">{s.price.toFixed(2)}</td>
                                <td className="py-2 px-3 font-bold">{s.total.toFixed(2)}</td>
                                <td className="py-2 px-3">
                                  {s.bill_no && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceiptModal(
                                          buildReceiptText(s.bill_no!, s.date, s.customer, s.medName, s.qty, s.price)
                                        );
                                      }}
                                      className="px-2 py-0.5 rounded bg-[#16a34a] text-white text-[10px] font-semibold hover:bg-[#15803d] cursor-pointer whitespace-nowrap"
                                    >
                                      View Bill
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}

                        {activePage === 'Lab' &&
                          db.lab
                            .filter((l) => passesDateFilter(l.date))
                            .filter((l) =>
                              `${l.id} ${l.date} ${l.patient} ${l.test}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((l) => (
                              <tr
                                key={l.id}
                                onClick={() => setSelectedId(l.id)}
                                className={`cursor-pointer transition ${
                                  selectedId === l.id ? 'bg-[#0f3460] text-white' : 'hover:bg-[#1e293b]/50'
                                }`}
                              >
                                <td className="py-2 px-3">{l.id}</td>
                                <td className="py-2 px-3">{l.date}</td>
                                <td className="py-2 px-3 font-medium">{l.patient}</td>
                                <td className="py-2 px-3">{l.test}</td>
                                <td className="py-2 px-3 font-bold">{l.fee.toFixed(2)}</td>
                              </tr>
                            ))}

                        {activePage === 'OPD' &&
                          db.opd
                            .filter((o) => passesDateFilter(o.date))
                            .filter((o) =>
                              `${o.id} ${o.date} ${o.patient} ${o.doctor}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((o) => (
                              <tr
                                key={o.id}
                                onClick={() => setSelectedId(o.id)}
                                className={`cursor-pointer transition ${
                                  selectedId === o.id ? 'bg-[#0f3460] text-white' : 'hover:bg-[#1e293b]/50'
                                }`}
                              >
                                <td className="py-2 px-3">{o.id}</td>
                                <td className="py-2 px-3">{o.date}</td>
                                <td className="py-2 px-3 font-medium">{o.patient}</td>
                                <td className="py-2 px-3">{o.doctor}</td>
                                <td className="py-2 px-3 font-bold">{o.fee.toFixed(2)}</td>
                              </tr>
                            ))}

                        {activePage === 'Employees' &&
                          db.employees
                            .filter((e) =>
                              `${e.id} ${e.name} ${e.role} ${e.phone}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((e) => (
                              <tr
                                key={e.id}
                                onClick={() => setSelectedId(e.id)}
                                className={`cursor-pointer transition ${
                                  selectedId === e.id ? 'bg-[#0f3460] text-white' : 'hover:bg-[#1e293b]/50'
                                }`}
                              >
                                <td className="py-2 px-3">{e.id}</td>
                                <td className="py-2 px-3 font-medium">{e.name}</td>
                                <td className="py-2 px-3">{e.role}</td>
                                <td className="py-2 px-3 font-bold">{e.salary.toLocaleString('en-US')}</td>
                                <td className="py-2 px-3">{e.phone}</td>
                              </tr>
                            ))}

                        {activePage === 'Expenses' &&
                          db.expenses
                            .filter((ex) => passesDateFilter(ex.date))
                            .filter((ex) =>
                              `${ex.id} ${ex.date} ${ex.category} ${ex.note}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((ex) => (
                              <tr
                                key={ex.id}
                                onClick={() => setSelectedId(ex.id)}
                                className={`cursor-pointer transition ${
                                  selectedId === ex.id ? 'bg-[#0f3460] text-white' : 'hover:bg-[#1e293b]/50'
                                }`}
                              >
                                <td className="py-2 px-3">{ex.id}</td>
                                <td className="py-2 px-3">{ex.date}</td>
                                <td className="py-2 px-3 font-medium">{ex.category}</td>
                                <td className="py-2 px-3 font-bold">{ex.amount.toFixed(2)}</td>
                                <td className="py-2 px-3">{ex.note}</td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Auto-Backup Files Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-xl p-6 space-y-4 ${bgCard}`}>
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#4fc3f7]">
                  💾 Automatic File Backups (Server Disk)
                </h3>
                <p className="text-xs text-gray-400">
                  Har entry khud-ba-khud <span className="font-mono text-gray-200">data/hms_database.json</span> aur <span className="font-mono text-gray-200">backups/</span> folder mein save aur restore hoti hai.
                </p>
              </div>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {backupFiles.length === 0 ? (
                <div className="text-xs text-gray-400 py-4 text-center">
                  Saving initial backup file...
                </div>
              ) : (
                backupFiles.map((bf) => (
                  <div
                    key={bf.filename}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-gray-800 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-emerald-400">backups/{bf.filename}</div>
                      <div className="text-[11px] text-gray-400">
                        Updated: {new Date(bf.updatedAt).toLocaleString()} · {(bf.sizeBytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreServerBackup(bf.filename)}
                      className="px-3 py-1.5 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Restore This File
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={handleBackupDownload}
                  className="px-3.5 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
                >
                  ⬇ Download Copy to PC
                </button>
                <label className="px-3.5 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-bold cursor-pointer">
                  📂 Load External File
                  <input type="file" accept=".json" onChange={handleBackupRestore} className="hidden" />
                </label>
              </div>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Shortcut & Offline Setup Modal */}
      {shortcutGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-xl p-6 space-y-4 ${bgCard}`}>
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-base font-bold text-[#4fc3f7]">
                🖥 Desktop Shortcut & Offline Chalane Ka Tareeqa
              </h3>
              <button
                type="button"
                onClick={() => setShortcutGuideOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-gray-200">
              <div className="p-3 rounded-lg bg-[#0d1117] border border-emerald-500/30">
                <div className="font-bold text-emerald-400 mb-1">
                  Tareeqa 1: Browser Se Direct Desktop App Install Karein (PWA)
                </div>
                <p>
                  Chrome ya Edge ke upar Address Bar (`http://localhost:3000`) ke dain (right) kone mein <strong>Install Icon (📥 / 🖥)</strong> par click karein, ya <strong>3 Dots (⋮) → Cast, save, and share → Install Hospital Management System</strong> par click karein. Is se aap ke Desktop par HMS ka icon ban jayega.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1117] border border-sky-500/30">
                <div className="font-bold text-sky-400 mb-1">
                  Tareeqa 2: 100% Offline Chalane Ke Liye (`Create_Desktop_Shortcut.bat`)
                </div>
                <p>
                  Aap ke project folder ke andar <strong><code className="text-amber-300">Create_Desktop_Shortcut.bat</code></strong> aur <strong><code className="text-amber-300">Run_HMS.bat</code></strong> files bana di gayi hain. Sirf <code>Create_Desktop_Shortcut.bat</code> par double-click karein — aap ke Windows Desktop par shortcut ban jayega jo bina internet (Offline) server aur app dono ko chala dega!
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShortcutGuideOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                Theek Hai (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roman Urdu Complete Guide Modal */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-xl p-6 max-h-[85vh] overflow-y-auto space-y-4 ${bgCard}`}>
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-base font-bold text-[#4fc3f7]">
                📘 Hospital Management System — Ye Kaise Kaam Karta Hai?
              </h3>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-gray-200">
              <p>
                <strong>1. 💾 Automatic File Backup & Restore:</strong> Ab aap ko khud backup ya restore karne ki zaroorat nahi! Aap jo bhi entry karte hain wo khud-ba-khud server par <code className="text-emerald-300">data/hms_database.json</code> aur rozana ki file <code className="text-emerald-300">backups/hms_{todayStr()}.json</code> mein save hoti hai, aur app khulte hi khud-ba-khud wahan se restore ho jati hai.
              </p>
              <p>
                <strong>2. ← Back Button & Fixed Sidebar Menu:</strong> Upar dain (top-right) taraf Minimize ki jagah <strong>← Back</strong> button laga diya gaya hai taake aap kisi bhi activity (Medicines, Sale, Lab, OPD) mein hon to ek click se wapas <strong>Dashboard</strong> par aa sakein. Aur jab aap page upar-neeche scroll karenge to left side wala Menu apni jagah fixed rahega.
              </p>
              <p>
                <strong>3. 📊 Monthly Growth Overview Graph:</strong> Dashboard par aap ke bheje gaye design ke mutabiq <strong>Monthly Growth Overview</strong> graph (gradient bars + rising trend arrow + circular nodes + 4 summary cards) laga diya gaya hai.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                Samajh Aa Gaya (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl p-6 ${bgCard}`}>
            <h3 className="text-base font-bold text-[#4fc3f7] mb-3">Sales Receipt</h3>
            <pre className="bg-[#0d1117] text-gray-100 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap border border-gray-800">
              {receiptModal}
            </pre>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                🖨 Print Bill
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([receiptModal], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `receipt_${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-lg bg-[#0f3460] hover:bg-[#1e4b8f] text-white text-xs font-bold cursor-pointer"
              >
                💾 Save Receipt
              </button>
              <button
                onClick={() => setReceiptModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Balances Modal */}
      {supplierBalancesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl rounded-xl p-6 ${bgCard}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#4fc3f7]">Supplier Invoice Balances</h3>
              <button
                onClick={() => setSupplierBalancesModal(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="bg-[#0f3460] text-[#4fc3f7]">
                    <th className="py-2 px-3">Invoice No.</th>
                    <th className="py-2 px-3">Supplier</th>
                    <th className="py-2 px-3">First Date</th>
                    <th className="py-2 px-3">Total Bill</th>
                    <th className="py-2 px-3">Paid</th>
                    <th className="py-2 px-3">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {supplierBalances.map((r) => (
                    <tr key={`${r.invoice_no}-${r.supplier}`}>
                      <td className="py-2 px-3 font-mono">{r.invoice_no}</td>
                      <td className="py-2 px-3 font-medium">{r.supplier}</td>
                      <td className="py-2 px-3">{r.firstDate}</td>
                      <td className="py-2 px-3">{r.totalBill.toFixed(2)}</td>
                      <td className="py-2 px-3 text-[#16a34a]">{r.paid.toFixed(2)}</td>
                      <td className={`py-2 px-3 font-bold ${r.due > 0 ? 'text-[#dc2626]' : 'text-gray-400'}`}>
                        {r.due.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Supplier Payment Modal */}
      {recordPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl p-6 space-y-3 ${bgCard}`}>
            <h3 className="text-base font-bold text-[#4fc3f7]">Record Supplier Payment</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Invoice Number</label>
              <input
                type="text"
                placeholder="e.g. PUR-20260929-101500"
                value={supplierPaymentForm.invoice_no}
                onChange={(e) => setSupplierPaymentForm({ ...supplierPaymentForm, invoice_no: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Supplier Name</label>
              <input
                type="text"
                placeholder="Supplier Name"
                value={supplierPaymentForm.supplier}
                onChange={(e) => setSupplierPaymentForm({ ...supplierPaymentForm, supplier: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount Paid</label>
              <input
                type="number"
                placeholder="Amount Paid"
                value={supplierPaymentForm.amount}
                onChange={(e) => setSupplierPaymentForm({ ...supplierPaymentForm, amount: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Payment Method</label>
              <input
                type="text"
                placeholder="Cash / Bank Transfer"
                value={supplierPaymentForm.method}
                onChange={(e) => setSupplierPaymentForm({ ...supplierPaymentForm, method: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Note</label>
              <input
                type="text"
                placeholder="Note"
                value={supplierPaymentForm.note}
                onChange={(e) => setSupplierPaymentForm({ ...supplierPaymentForm, note: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSaveSupplierPayment}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                Save Payment
              </button>
              <button
                onClick={() => setRecordPaymentModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Salary Confirmation Modal */}
      {paySalaryConfirmEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-xl p-6 ${bgCard}`}>
            <h3 className="text-base font-bold text-[#4fc3f7] mb-2">Confirm Salary Payment</h3>
            <p className="text-xs text-gray-300 mb-4">
              Record salary payment of{' '}
              <span className="font-bold text-white">
                {paySalaryConfirmEmployee.salary.toLocaleString('en-US')}
              </span>{' '}
              to <span className="font-bold text-white">{paySalaryConfirmEmployee.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmPaySalary}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => setPaySalaryConfirmEmployee(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {salaryHistoryEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-xl p-6 ${bgCard}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#4fc3f7]">
                Salary Payment History: {salaryHistoryEmployee.name}
              </h3>
              <button
                onClick={() => setSalaryHistoryEmployee(null)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="bg-[#0f3460] text-[#4fc3f7]">
                    <th className="py-2 px-3">Payment ID</th>
                    <th className="py-2 px-3">Payment Date</th>
                    <th className="py-2 px-3">Salary Month</th>
                    <th className="py-2 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {db.salaries
                    .filter((s) => s.employee_id === salaryHistoryEmployee.id)
                    .map((s) => {
                      const d = new Date(s.date + 'T00:00:00');
                      const monthStr = isNaN(d.getTime())
                        ? 'Unknown'
                        : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      return (
                        <tr key={s.id}>
                          <td className="py-2 px-3">{s.id}</td>
                          <td className="py-2 px-3">{s.date}</td>
                          <td className="py-2 px-3">{monthStr}</td>
                          <td className="py-2 px-3 font-bold">
                            {s.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-xl p-6 ${bgCard}`}>
            <h3 className="text-base font-bold text-[#dc2626] mb-2">Delete Record</h3>
            <p className="text-xs text-gray-300 mb-4">
              Are you sure you want to delete record #{deleteConfirmId} from {activePage}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Admin Password Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl p-6 space-y-3 ${bgCard}`}>
            <h3 className="text-base font-bold text-[#4fc3f7]">Create Admin Password</h3>
            <p className="text-xs text-gray-400">
              Use at least 12 characters, including uppercase, lowercase, a number, and a symbol.
            </p>
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={authConfirm}
              onChange={(e) => setAuthConfirm(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-xs ${bgInput}`}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleAuthSubmit}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                Create Password
              </button>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Key One-Time Display Modal */}
      {recoveryKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl p-6 space-y-3 ${bgCard}`}>
            <h3 className="text-base font-bold text-amber-400">⚠ Save Your Recovery Key</h3>
            <p className="text-xs text-gray-300">
              Your password recovery key is shown below. Save it somewhere safe; it is shown only once.
            </p>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-amber-500/40 font-mono text-sm text-center text-amber-300 select-all">
              {recoveryKeyModal}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setRecoveryKeyModal(null)}
                className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold cursor-pointer"
              >
                I Have Saved It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
