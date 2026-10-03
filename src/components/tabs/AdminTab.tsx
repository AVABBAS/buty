import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  Cpu,
  RefreshCw,
  Trash2,
  Download,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
  Search,
  ExternalLink,
  Bot,
  Zap,
  Layers,
  Sparkles,
  Shirt,
  Heart,
  Eye,
  Check,
  RotateCcw,
  Clock,
  HardDrive,
  Crown,
  CreditCard,
  Tag,
  Star,
  Gift
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { SUBSCRIPTION_PLANS, VALID_PROMO_CODES } from '../../data/subscriptionPlans';

interface AdminTabProps {
  adminId?: string;
  adminUsername?: string;
  onNavigateTab: (tab: any) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({ adminId, adminUsername, onNavigateTab }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'subscriptions' | 'performance' | 'bot' | 'security' | 'sandbox'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [grantTargetId, setGrantTargetId] = useState<string>('');
  const [grantTier, setGrantTier] = useState<string>('vip');
  const [grantDuration, setGrantDuration] = useState<number>(3);
  const [isGranting, setIsGranting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searchUserQuery, setSearchUserQuery] = useState<string>('');
  const [selectedUserDossier, setSelectedUserDossier] = useState<any | null>(null);
  const [isDossierLoading, setIsDossierLoading] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; latency: number } | null>(null);

  // Sandbox inputs
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('کت اورسایز طوسی با شال کرم');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(false);

  const adminHeaders = {
    'x-admin-id': adminId || '291775184',
    'x-admin-username': adminUsername || 'av_abbas',
    'Content-Type': 'application/json',
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const start = Date.now();
      const res = await fetch('/api/admin/overview', { headers: adminHeaders });
      const latency = Date.now() - start;
      setPingResult({ ok: res.ok, latency });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      showNotification('خطا در برقراری ارتباط با سرور ادمین');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: adminHeaders });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // Ignore
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions', { headers: adminHeaders });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionsList(data.subscriptions || []);
      }
    } catch {
      // Ignore
    }
  };

  const handleGrantSubscription = async () => {
    if (!grantTargetId.trim()) {
      showNotification('لطفاً شناسه تلگرام کاربر را وارد کنید');
      return;
    }
    setIsGranting(true);
    try {
      const res = await fetch('/api/admin/subscription/grant', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          targetTelegramId: grantTargetId.trim(),
          tier: grantTier,
          durationMonths: grantDuration,
          planName: `اشتراک ${grantTier.toUpperCase()} اهدایی مدیریت`,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showNotification(`✅ ${data.message}`);
        setGrantTargetId('');
        fetchSubscriptions();
      } else {
        showNotification(data.error || 'خطا در اعطای اشتراک');
      }
    } catch {
      showNotification('خطا در ارتباط با سرور');
    } finally {
      setIsGranting(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchSubscriptions();
  }, []);

  const handleClearCache = async () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    try {
      const res = await fetch('/api/admin/clear-cache', { method: 'POST', headers: adminHeaders });
      const data = await res.json();
      showNotification(data.message || 'کش با موفقیت پاکسازی شد');
      fetchOverview();
    } catch {
      showNotification('خطا در پاکسازی کش');
    }
  };

  const handleClearRateLimit = async () => {
    try {
      const res = await fetch('/api/admin/clear-ratelimit', { method: 'POST', headers: adminHeaders });
      const data = await res.json();
      showNotification(data.message || 'محدودیت‌های آی‌پی بازنشانی شدند');
      fetchOverview();
    } catch {
      showNotification('خطا در بازنشانی لیمیت‌ها');
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const res = await fetch('/api/admin/toggle-maintenance', { method: 'POST', headers: adminHeaders });
      const data = await res.json();
      showNotification(`حالت تعمیرات: ${data.isMaintenanceMode ? 'فعال شد ⚠️' : 'غیرفعال شد ✅'}`);
      fetchOverview();
    } catch {
      showNotification('خطا در تغییر وضعیت تعمیرات');
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/admin/export', { headers: adminHeaders });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ayna_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showNotification('دانلود بکاپ آغاز شد');
    } catch {
      showNotification('خطا در دانلود بکاپ دیتابیس');
    }
  };

  const handleInspectUser = async (targetTelegramId: string) => {
    setIsDossierLoading(true);
    try {
      const res = await fetch(`/api/admin/user/${targetTelegramId}`, { headers: adminHeaders });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserDossier(data.userData);
      } else {
        showNotification('کاربر یافت نشد یا داده‌ای ندارد');
      }
    } catch {
      showNotification('خطا در خواندن پرونده کاربر');
    } finally {
      setIsDossierLoading(false);
    }
  };

  const handleTestBotPing = async () => {
    try {
      const res = await fetch('/api/admin/test-bot-ping', { method: 'POST', headers: adminHeaders });
      const data = await res.json();
      if (data.ok) {
        showNotification(`✅ ربات تلگرام متصل است: @${data.result?.username}`);
      } else {
        showNotification(`⚠️ ربات تلگرام: ${data.message || 'عدم اتصال'}`);
      }
    } catch {
      showNotification('خطا در تست ربات تلگرام');
    }
  };

  const handleRunSandboxTest = async () => {
    setIsSandboxRunning(true);
    setSandboxResponse(null);
    try {
      const res = await fetch('/api/ai/make-it-mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: sandboxPrompt, vibe: 'Minimalist Chic' }),
      });
      const data = await res.json();
      setSandboxResponse(data);
      showNotification('تست هوش مصنوعی با موفقیت کامل شد');
    } catch (e: any) {
      showNotification(`خطا در تست: ${e.message}`);
    } finally {
      setIsSandboxRunning(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchUserQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.telegramId?.includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24 animate-in-fade">
      {/* Admin Crown Badge & Identification */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-rose-950/70 border border-amber-500/30 p-4 text-stone-100 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-tight text-amber-200">داشبورد فرماندهی مدیر</h1>
                <span className="text-[10px] text-amber-300 font-latin font-bold bg-amber-950/90 border border-amber-600/60 px-2 py-0.5 rounded-full">
                  ADMIN LEVEL 1
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                تأیید هویت: <span className="font-latin text-amber-300 font-semibold">291775184</span> / <span className="font-latin text-rose-300 font-semibold">@Av_abbas</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchOverview();
              fetchUsers();
            }}
            className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-850 active:scale-95 border border-amber-500/30 text-amber-300 flex items-center justify-center transition-all shadow-xs"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Global Notification Banner */}
        {actionMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 animate-in-fade">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs (6 Major Functional Areas) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'overview'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>آمار و وضعیت سرور</span>
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'users'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>فهرست کاربران ({users.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('subscriptions');
            fetchSubscriptions();
          }}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'subscriptions'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>اشتراک‌ها و پلن‌ها ({subscriptionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('performance')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'performance'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>پرفورمنس و کش</span>
        </button>

        <button
          onClick={() => setActiveSection('bot')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'bot'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>بات تلگرام</span>
        </button>

        <button
          onClick={() => setActiveSection('security')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'security'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>امنیت و اورژانس</span>
        </button>

        <button
          onClick={() => setActiveSection('sandbox')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSection === 'sandbox'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>تست زنده هوش مصنوعی</span>
        </button>
      </div>

      {/* SECTION 1: SYSTEM OVERVIEW & METRICS */}
      {activeSection === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1: Total Users */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-medium">کل کاربران</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xl font-extrabold text-stone-50 font-latin">
                {stats?.totalUsers ?? '...'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">● همگام و ثبت‌شده</span>
            </div>

            {/* Metric 2: Total Saved Looks */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-medium">لوک‌های ذخیره‌شده</span>
                <Shirt className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-xl font-extrabold text-stone-50 font-latin">
                {stats?.totalLooks ?? '...'}
              </span>
              <span className="text-[10px] text-rose-400 block mt-0.5">● استایل‌های شخصی</span>
            </div>

            {/* Metric 3: Memory Usage */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-medium">مصرف حافظه RAM</span>
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xl font-extrabold text-stone-50 font-latin">
                {stats?.memoryRssMb ? `${stats.memoryRssMb} MB` : '...'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-latin">
                Heap: {stats?.memoryHeapMb ?? '0'} MB
              </span>
            </div>

            {/* Metric 4: Cache Entries */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-medium">کش LRU فعال</span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-xl font-extrabold text-stone-50 font-latin">
                {stats?.cacheSize ?? '0'} / {stats?.maxCacheSize ?? '1000'}
              </span>
              <span className="text-[10px] text-yellow-400 block mt-0.5">پاسخ سریع بدون تأخیر</span>
            </div>

            {/* Metric 5: Server Uptime */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-medium">زمان فعالیت سرور</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-extrabold text-stone-50 font-latin">
                {stats?.uptimeSeconds ? `${Math.floor(stats.uptimeSeconds / 60)} دقیقه` : '...'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-latin">Node {stats?.nodeVersion ?? ''}</span>
            </div>

            {/* Metric 6: Database Engine */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-medium">پایگاه داده</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-extrabold text-stone-50 font-latin uppercase">
                {stats?.databaseType ?? 'Embedded'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">● متصل و پایدار</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold text-stone-200">عملیات فوری مدیر</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleClearCache}
                className="p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 active:scale-95 border border-stone-800 text-stone-200 flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="font-semibold">تخلیه کش هوش مصنوعی</span>
              </button>

              <button
                onClick={handleClearRateLimit}
                className="p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 active:scale-95 border border-stone-800 text-stone-200 flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">آزادسازی آی‌پی‌ها</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 active:scale-95 border border-stone-800 text-stone-200 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">دانلود فایل پشتیبان (JSON)</span>
              </button>

              <button
                onClick={handleToggleMaintenance}
                className={`p-3 rounded-2xl active:scale-95 border flex items-center gap-2 transition-all ${
                  stats?.isMaintenanceMode
                    ? 'bg-red-950/80 border-red-500/50 text-red-200'
                    : 'bg-stone-950 hover:bg-stone-850 border-stone-800 text-stone-200'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${stats?.isMaintenanceMode ? 'text-red-400' : 'text-stone-400'}`} />
                <span className="font-semibold">
                  {stats?.isMaintenanceMode ? 'تعمیرات: فعال' : 'حالت تعمیرات'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: USERS DIRECTORY & DOSSIER */}
      {activeSection === 'users' && (
        <div className="space-y-3">
          {/* User Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              placeholder="جستجوی کاربر با آیدی عددی، نام یا نام کاربری..."
              className="w-full bg-stone-900 border border-white/[0.08] focus:border-amber-400/50 rounded-2xl p-3 pl-10 text-xs text-stone-100 placeholder:text-stone-500 outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          </div>

          {/* User List */}
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-stone-900/60 border border-stone-800 text-stone-400 text-xs">
                کاربری با این مشخصات یافت نشد.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.telegramId}
                  className="p-3.5 rounded-2xl bg-stone-900/90 border border-white/[0.06] hover:border-amber-500/30 transition-all flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-100">
                        {u.firstName || 'کاربر بدون نام'}
                      </span>
                      {u.username && (
                        <span className="text-[11px] text-amber-300 font-latin">
                          @{u.username}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400">
                      <span className="font-latin">ID: {u.telegramId}</span>
                      <span>·</span>
                      <span>لباس‌ها: {u.closetCount ?? 0}</span>
                      <span>·</span>
                      <span>لوک‌ها: {u.looksCount ?? 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInspectUser(u.telegramId)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده پرونده</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* User Dossier Modal Drawer */}
          {selectedUserDossier && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in-fade">
              <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-stone-100">پرونده اختصاصی کاربر</h3>
                  </div>
                  <button
                    onClick={() => setSelectedUserDossier(null)}
                    className="text-stone-400 hover:text-stone-200 text-xs"
                  >
                    بستن ✕
                  </button>
                </div>

                {/* Profile Meta */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 text-xs">
                  <div>نام: <span className="font-bold text-stone-200">{selectedUserDossier.profile?.firstName || 'ثبت‌نشده'}</span></div>
                  <div>یوزرنیم: <span className="font-latin text-amber-300">@{selectedUserDossier.profile?.username || 'ندارد'}</span></div>
                  <div>آخرین فعالیت: <span className="text-stone-400">{selectedUserDossier.profile?.lastActive || 'مشخص نیست'}</span></div>
                </div>

                {/* Style DNA Summary */}
                {selectedUserDossier.dna && (
                  <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 text-xs">
                    <div className="font-bold text-amber-300 mb-1">خلاصه DNA استایل:</div>
                    <div className="text-[11px] text-stone-300">
                      فرم چهره: {selectedUserDossier.dna.faceShape} · جنس پوست: {selectedUserDossier.dna.skinType} · بافت مو: {selectedUserDossier.dna.hairTexture}
                    </div>
                  </div>
                )}

                {/* Closet & Shelf Counts */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center">
                    <div className="text-stone-400 text-[10px]">لباس‌های کمد</div>
                    <div className="text-base font-bold text-stone-100">{selectedUserDossier.closet?.length || 0} آیتم</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center">
                    <div className="text-stone-400 text-[10px]">استایل‌های ذخیره شده</div>
                    <div className="text-base font-bold text-stone-100">{selectedUserDossier.savedLooks?.length || 0} لوک</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserDossier(null)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                >
                  بستن پرونده
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: SUBSCRIPTIONS & PREMIUM MANAGEMENT */}
      {activeSection === 'subscriptions' && (
        <div className="space-y-3">
          {/* Grant Subscription Card */}
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-stone-100">اهدای دستی اشتراک پریمیوم به کاربر</h3>
            </div>
            <p className="text-[11px] text-stone-400">
              مدیر می‌تواند به هر شناسه کاربری، اشتراک VIP یا الماس به مدت دلخواه اهدا کند:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={grantTargetId}
                onChange={(e) => setGrantTargetId(e.target.value)}
                placeholder="شناسه عددی تلگرام کاربر (مثلاً 291775184)..."
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400/50 rounded-xl px-3 py-2 text-xs text-stone-100 outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">پلن اشتراک:</label>
                  <select
                    value={grantTier}
                    onChange={(e) => setGrantTier(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-stone-200 outline-none"
                  >
                    <option value="glow">گلو (Glow)</option>
                    <option value="vip">وی‌آی‌پی (VIP Atelier)</option>
                    <option value="diamond">الماس (Diamond Haute Couture)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">مدت اعتبار:</label>
                  <select
                    value={grantDuration}
                    onChange={(e) => setGrantDuration(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-stone-200 outline-none"
                  >
                    <option value={1}>۱ ماهه</option>
                    <option value={3}>۳ ماهه (فصلی)</option>
                    <option value={6}>۶ ماهه</option>
                    <option value={12}>۱۲ ماهه (سالانه)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGrantSubscription}
                disabled={isGranting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 text-stone-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>{isGranting ? 'در حال ثبت اشتراک...' : 'فعال‌سازی فوری اشتراک برای کاربر'}</span>
              </button>
            </div>
          </div>

          {/* Active Subscriptions List */}
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-stone-100">کاربران دارای اشتراک فعال ({subscriptionsList.length})</h3>
              </div>
              <button
                onClick={fetchSubscriptions}
                className="text-[11px] text-amber-300 hover:underline"
              >
                تازه‌سازی
              </button>
            </div>

            {subscriptionsList.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-stone-950 border border-stone-800/80 text-stone-400 text-xs">
                هنوز کاربری مشترک پریمیوم نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {subscriptionsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-100">
                          {item.user?.firstName || 'کاربر'}
                        </span>
                        {item.user?.username && (
                          <span className="text-[10px] text-amber-300 font-latin">
                            @{item.user.username}
                          </span>
                        )}
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">
                          {item.subscription?.tier}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-latin">
                        ID: {item.telegramId} · انقضا: {item.subscription?.expiresAt ? new Date(item.subscription.expiresAt).toLocaleDateString('fa-IR') : 'دائم'}
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      ● فعال
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Promo Codes Master */}
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-stone-100">کدهای تخفیف فعال در سیستم</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(VALID_PROMO_CODES).map(([code, percent]) => (
                <div key={code} className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                  <span className="font-latin font-bold text-stone-200">{code}</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    {percent}٪ تخفیف
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Plans Pricing Master */}
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-stone-100">تعرفه‌های فعال فروشگاه پریمیوم</h3>
            <div className="space-y-2 text-xs">
              {SUBSCRIPTION_PLANS.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-100 block">{p.name}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{p.durationMonths} ماهه · {p.features.length} قابلیت اختصاصی</span>
                  </div>
                  <div className="text-left font-latin">
                    <span className="text-amber-300 font-bold">{p.priceToman.toLocaleString('fa-IR')} ت</span>
                    <span className="text-[10px] text-yellow-400 block">⭐ {p.priceStars} Stars</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PERFORMANCE & CACHE */}
      {activeSection === 'performance' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold text-stone-200">وضعیت کش و تأخیر شبکه</h3>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              هوش مصنوعی از یک کش دو سطحی با ظرفیت ۱۰۰۰ درخواست پرتکرار بهره می‌برد. زمان پاسخ‌دهی برای درخواست‌های کش‌شده کمتر از ۱۰ میلی‌ثانیه است.
            </p>

            {pingResult && (
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-300">تأخیر پینگ سرور (Latency):</span>
                <span className={`font-latin font-bold ${pingResult.latency < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {pingResult.latency} ms
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleClearCache}
                className="p-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 border border-rose-500/30 text-rose-200 text-xs font-bold transition-all text-center"
              >
                تخلیه کامل کش (Flush)
              </button>

              <button
                onClick={fetchOverview}
                className="p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 active:scale-95 border border-stone-800 text-stone-200 text-xs font-semibold transition-all text-center"
              >
                اندازه‌گیری مجدد تأخیر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: TELEGRAM BOT INTEGRATION */}
      {activeSection === 'bot' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-200">وضعیت و تست ربات تلگرام</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stats?.telegramBotConfigured ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-amber-950 text-amber-300 border border-amber-700/50'
              }`}>
                {stats?.telegramBotConfigured ? 'توکن متصل است' : 'توکن محلی/محیطی'}
              </span>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              آدرس وب‌اپ ثبت‌شده در بات تلگرام:
              <br />
              <span className="font-latin text-stone-200 text-[10px] break-all">{stats?.appUrl || window.location.origin}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleTestBotPing}
                className="p-3 rounded-2xl bg-blue-950/60 hover:bg-blue-900/80 active:scale-95 border border-blue-500/30 text-blue-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>تست پینگ ربات</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(stats?.appUrl || window.location.origin);
                  showNotification('آدرس وب‌اپ در کلیپ‌بورد کپی شد');
                }}
                className="p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 active:scale-95 border border-stone-800 text-stone-200 text-xs font-semibold transition-all text-center"
              >
                کپی لینک WebApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SECURITY & EMERGENCY CONTROLS */}
      {activeSection === 'security' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold text-stone-200">کنترل‌های امنیتی و اضطراری</h3>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-300">سپر CSP و ضد فریم‌ربایی:</span>
                <span className="text-emerald-400 font-bold">فعال (Telegram Safe)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-300">سیستم دفاعی Rate Limiter:</span>
                <span className="text-emerald-400 font-bold">۱۲۰ درخواست در دقیقه</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-300">آی‌پی‌های فعال در لیمیت:</span>
                <span className="font-latin text-amber-300 font-bold">{stats?.activeRateLimitIps ?? 0}</span>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <button
                onClick={handleToggleMaintenance}
                className={`w-full p-3.5 rounded-2xl active:scale-98 border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  stats?.isMaintenanceMode
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/60 border-red-500/50 text-red-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {stats?.isMaintenanceMode ? 'خروج از حالت تعمیرات (بازگشایی سرویس)' : 'فعال‌سازی حالت تعمیرات فوری (Maintenance)'}
                </span>
              </button>

              <button
                onClick={handleClearRateLimit}
                className="w-full p-3 rounded-2xl bg-stone-950 hover:bg-stone-850 active:scale-98 border border-stone-800 text-stone-300 text-xs font-semibold transition-all text-center"
              >
                ریست کردن جدول مسدودیت‌های موقت IP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: AI ENGINE LIVE SANDBOX */}
      {activeSection === 'sandbox' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-stone-900 border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold text-stone-200">سندباکس تست مستقیم هوش مصنوعی</h3>
            <p className="text-[11px] text-stone-400">
              ارسال مستقیم پرامپت به موتور استایل آینا و مشاهده ساختار JSON بازگشتی برای اعتبارسنجی:
            </p>

            <textarea
              value={sandboxPrompt}
              onChange={(e) => setSandboxPrompt(e.target.value)}
              rows={2}
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400/50 rounded-2xl p-3 text-xs text-stone-100 outline-none resize-none"
              placeholder="پرامپت استایل مورد نظر را بنویسید..."
            />

            <button
              onClick={handleRunSandboxTest}
              disabled={isSandboxRunning}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSandboxRunning ? 'در حال ارسال و تحلیل...' : 'اجرای تست استایل'}</span>
            </button>

            {sandboxResponse && (
              <div className="mt-3 p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                <div className="font-bold text-amber-300">خروجی هوش مصنوعی:</div>
                <pre className="text-[10px] font-latin text-stone-300 overflow-x-auto max-h-48 p-2 rounded-xl bg-stone-900/80">
                  {JSON.stringify(sandboxResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return to Normal App Switcher */}
      <div className="pt-2">
        <button
          onClick={() => onNavigateTab('home')}
          className="w-full py-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.08] text-stone-300 text-xs font-bold transition-all text-center flex items-center justify-center gap-2"
        >
          <span>مشاهده برنامه در حالت کاربر عادی</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>
    </div>
  );
};
