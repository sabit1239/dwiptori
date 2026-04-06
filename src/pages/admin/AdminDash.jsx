import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { Users, Wallet, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDash() {
  const [stats,    setStats]    = useState({ members: 0, totalFunds: 0, pending: 0, approved: 0 });
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      const [usersSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'payments')),
      ]);

      const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const approved = payments.filter(p => p.status === 'approved');
      const pending  = payments.filter(p => p.status === 'pending');
      const totalFunds = approved.reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        members:    usersSnap.size,
        totalFunds,
        pending:    pending.length,
        approved:   approved.length,
      });

      // Sort recent by createdAt client-side
      const sorted = payments
        .filter(p => p.createdAt)
        .sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.())
        .slice(0, 6);
      setRecent(sorted);
      setLoading(false);
    })();
  }, []);

  const STATUS_STYLE = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-500 mt-1">Dwiptori fund management at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet}      label="Total Funds Collected" color="bg-tide-600"
          value={`৳${stats.totalFunds.toLocaleString()}`} />
        <StatCard icon={Users}       label="Total Members" color="bg-island-600"
          value={stats.members} />
        <StatCard icon={Clock}       label="Pending Payments" color="bg-sand-500"
          value={stats.pending} sub={stats.pending > 0 ? 'Needs review' : 'All clear'} />
        <StatCard icon={CheckCircle} label="Approved Payments" color="bg-tide-500"
          value={stats.approved} />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-tide-600" />
            <h2 className="font-semibold text-slate-800">Recent Submissions</h2>
          </div>
          <Link to="/admin/payments" className="text-sm text-tide-600 hover:underline flex items-center gap-1">
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>TrxID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-medium">{p.memberName}</div>
                      <div className="text-xs text-slate-400">{p.senderPhone}</div>
                    </td>
                    <td className="font-semibold">৳{p.amount?.toLocaleString()}</td>
                    <td>{p.method}</td>
                    <td className="font-mono text-xs">{p.trxId}</td>
                    <td>{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yy') : '—'}</td>
                    <td><span className={STATUS_STYLE[p.status] || 'badge-pending'}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
