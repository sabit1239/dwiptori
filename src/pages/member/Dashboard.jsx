import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Wallet, CheckCircle, Clock, CreditCard, ArrowRight, Bell, Pin, TrendingUp, XCircle } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      const [pSnap, nSnap] = await Promise.all([
        getDocs(query(collection(db, 'payments'), where('uid', '==', profile.uid))),
        getDocs(collection(db, 'notices')),
      ]);
      const ps = pSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      const ns = nSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }).slice(0, 3);
      setPayments(ps);
      setNotices(ns);
      setLoading(false);
    })();
  }, [profile?.uid]);

  const approved = payments.filter(p => p.status === 'approved');
  const pending  = payments.filter(p => p.status === 'pending');
  const recent   = payments.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ দুপুর' : 'শুভ সন্ধ্যা';

  const TYPE_COLORS = {
    urgent:  'bg-red-50 border-red-200 text-red-700',
    meeting: 'bg-blue-50 border-blue-200 text-blue-700',
    payment: 'bg-green-50 border-green-200 text-green-700',
    event:   'bg-purple-50 border-purple-200 text-purple-700',
    general: 'bg-slate-50 border-slate-200 text-slate-600',
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">

      {/* Welcome */}
      <div className="bg-gradient-to-br from-tide-700 to-tide-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          {profile?.photoURL && profile?.photoStatus === 'approved' ? (
            <img src={profile.photoURL} alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-display font-bold flex-shrink-0">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-tide-300 text-sm">{greeting} 👋</p>
            <h1 className="font-display text-2xl font-bold">{profile?.name}</h1>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1
              ${profile?.role === 'admin' ? 'bg-white/20 text-white' : 'bg-white/10 text-tide-200'}`}>
              {profile?.role === 'admin' ? '🛡 Admin' : '👤 Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Wallet,      label: 'মোট চাঁদা',  value: `৳${(profile?.totalPaid || 0).toLocaleString()}`, color: 'bg-tide-600',   text: 'text-tide-700' },
          { icon: CheckCircle, label: 'Approved',    value: approved.length,  color: 'bg-green-500',  text: 'text-green-700' },
          { icon: Clock,       label: 'Pending',     value: pending.length,   color: 'bg-yellow-500', text: 'text-yellow-700' },
        ].map(({ icon: Icon, label, value, color, text }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className={`font-display font-bold text-lg ${text}`}>{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Submit Payment Button */}
      <Link to="/pay"
        className="flex items-center justify-between bg-gradient-to-r from-tide-600 to-tide-700 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">মাসিক চাঁদা জমা দিন</div>
            <div className="text-tide-200 text-xs">bKash / Nagad এ পাঠিয়ে submit করুন</div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 opacity-70" />
      </Link>

      {/* Notices */}
      {notices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-tide-600" />
              <h2 className="font-semibold text-slate-800">সাম্প্রতিক নোটিশ</h2>
            </div>
            <Link to="/notices" className="text-xs text-tide-600 hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {notices.map(n => (
            <div key={n.id}
              className={`rounded-xl p-4 border ${TYPE_COLORS[n.type] || TYPE_COLORS.general} ${n.type === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex items-start gap-2">
                {n.pinned && <Pin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                <div>
                  <div className="font-semibold text-sm">{n.title}</div>
                  <div className="text-xs mt-0.5 opacity-80 line-clamp-2">{n.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-tide-600" />
            <h2 className="font-semibold text-slate-800">সাম্প্রতিক Payments</h2>
          </div>
          <Link to="/receipts" className="text-xs text-tide-600 hover:underline flex items-center gap-1">
            সব দেখুন <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">এখনো কোনো payment নেই</p>
            <Link to="/pay" className="btn-primary mt-3 text-sm py-2 px-4 inline-flex">
              প্রথম payment দিন
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`p-2 rounded-xl flex-shrink-0
                  ${p.status === 'approved' ? 'bg-green-100 text-green-600'
                  : p.status === 'rejected' ? 'bg-red-100 text-red-500'
                  : 'bg-yellow-100 text-yellow-600'}`}>
                  {p.status === 'approved' ? <CheckCircle className="w-4 h-4" />
                  : p.status === 'rejected' ? <XCircle className="w-4 h-4" />
                  : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{p.method} · {p.trxId}</div>
                  <div className="text-xs text-slate-400">
                    {p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '—'}
                  </div>
                </div>
                <div className="font-display font-bold text-slate-800 flex-shrink-0">
                  ৳{p.amount?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
