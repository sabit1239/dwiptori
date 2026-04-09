import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { Users, Wallet, Clock, CheckCircle, TrendingUp, ArrowRight, Bell, Camera, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function StatCard({ icon: Icon, label, value, color, sub, to }) {
  const card = (
    <div className={`bg-white rounded-2xl p-5 shadow-card flex items-center gap-4 ${to ? 'hover:shadow-glow transition-all cursor-pointer' : ''}`}>
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-display font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
        {sub && <div className={`text-xs mt-0.5 ${sub.includes('Review') ? 'text-yellow-600' : 'text-slate-400'}`}>{sub}</div>}
      </div>
      {to && <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function AdminDash() {
  const { profile } = useAuth();
  const [stats,    setStats]    = useState({ members: 0, totalFunds: 0, pending: 0, approved: 0, pendingPhotos: 0 });
  const [recent,   setRecent]   = useState([]);
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      const [usersSnap, paymentsSnap, noticesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'notices')),
      ]);
      const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const users    = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const approved = payments.filter(p => p.status === 'approved');
      const pending  = payments.filter(p => p.status === 'pending');
      const pendingPhotos = users.filter(u => u.photoStatus === 'pending').length;
      const totalFunds    = approved.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      setStats({ members: usersSnap.size, totalFunds, pending: pending.length, approved: approved.length, pendingPhotos });
      setRecent(payments.slice(0, 6));

      const ns = noticesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }).slice(0, 2);
      setNotices(ns);
      setLoading(false);
    })();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ দুপুর' : 'শুভ সন্ধ্যা';

  const STATUS_STYLE = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome */}
      <div className="bg-gradient-to-br from-tide-800 to-tide-950 rounded-2xl p-6 text-white">
        <p className="text-tide-300 text-sm">{greeting} 👋</p>
        <h1 className="font-display text-2xl font-bold mt-1">{profile?.name}</h1>
        <p className="text-tide-400 text-sm mt-1">Admin Panel — Dwiptori Fund Management</p>
      </div>

      {/* Alert cards */}
      {(stats.pending > 0 || stats.pendingPhotos > 0) && (
        <div className="space-y-2">
          {stats.pending > 0 && (
            <Link to="/admin/payments"
              className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 hover:bg-yellow-100 transition-colors">
              <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-sm text-yellow-700 font-medium">{stats.pending}টি payment approve করা বাকি</span>
              <ArrowRight className="w-4 h-4 text-yellow-500 ml-auto" />
            </Link>
          )}
          {stats.pendingPhotos > 0 && (
            <Link to="/admin/photos"
              className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-100 transition-colors">
              <Camera className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-700 font-medium">{stats.pendingPhotos}টি profile photo approve করা বাকি</span>
              <ArrowRight className="w-4 h-4 text-blue-500 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Wallet}      label="মোট তহবিল"    color="bg-tide-600"   value={`৳${stats.totalFunds.toLocaleString()}`} />
        <StatCard icon={Users}       label="মোট সদস্য"    color="bg-island-600" value={stats.members}    to="/admin/members" />
        <StatCard icon={Clock}       label="Pending"       color="bg-yellow-500" value={stats.pending}    to="/admin/payments"
          sub={stats.pending > 0 ? `${stats.pending}টি Review দরকার` : 'সব clear'} />
        <StatCard icon={CheckCircle} label="Approved"      color="bg-green-500"  value={stats.approved} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-slate-700 text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/admin/notices',  icon: Bell,      label: 'নোটিশ দিন',   color: 'bg-purple-100 text-purple-700' },
            { to: '/admin/ledger',   icon: BookOpen,  label: 'হিসাব লিখুন', color: 'bg-green-100 text-green-700' },
            { to: '/admin/payments', icon: CheckCircle, label: 'Payments',  color: 'bg-tide-100 text-tide-700' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className={`glass-card p-4 text-center hover:shadow-glow transition-all ${color}`}>
              <Icon className="w-6 h-6 mx-auto mb-1.5" />
              <div className="text-xs font-medium">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent notices */}
      {notices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-tide-600" />
              <h2 className="font-semibold text-slate-800">সাম্প্রতিক নোটিশ</h2>
            </div>
            <Link to="/admin/notices" className="text-xs text-tide-600 hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {notices.map(n => (
              <div key={n.id} className="px-5 py-3">
                <div className="font-medium text-slate-800 text-sm">{n.title}</div>
                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-tide-600" />
            <h2 className="font-semibold text-slate-800">সাম্প্রতিক Payments</h2>
          </div>
          <Link to="/admin/payments" className="text-xs text-tide-600 hover:underline flex items-center gap-1">
            সব দেখুন <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-slate-400">কোনো payment নেই</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">{p.memberName}</div>
                  <div className="text-xs text-slate-400">
                    {p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yy') : '—'} · {p.method}
                  </div>
                </div>
                <div className="font-semibold text-slate-800 flex-shrink-0">৳{p.amount?.toLocaleString()}</div>
                <span className={`${STATUS_STYLE[p.status] || 'badge-pending'} flex-shrink-0`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
