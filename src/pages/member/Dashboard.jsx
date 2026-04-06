import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import {
  Wallet, CreditCard, Clock, CheckCircle, XCircle,
  TrendingUp, ArrowRight, Banknote
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
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

const STATUS_META = {
  pending:  { icon: Clock,        color: 'text-sand-500',   bg: 'badge-pending',  label: 'Pending' },
  approved: { icon: CheckCircle,  color: 'text-island-600', bg: 'badge-approved', label: 'Approved' },
  rejected: { icon: XCircle,      color: 'text-coral-500',  bg: 'badge-rejected', label: 'Rejected' },
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      const q = query(
        collection(db, 'payments'),
        where('uid', '==', profile.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, [profile?.uid]);

  const approved = payments.filter(p => p.status === 'approved');
  const pending  = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">
            Hello, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your contribution overview</p>
        </div>
        <Link to="/pay" className="btn-primary hidden sm:flex">
          <CreditCard className="w-4 h-4" />
          Pay Monthly Fee
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Wallet}   label="Total Contributed" color="bg-tide-600"
          value={`৳${(profile?.totalPaid || 0).toLocaleString()}`} />
        <StatCard icon={CheckCircle} label="Approved Payments" color="bg-island-600"
          value={approved.length} sub="Last 5 payments" />
        <StatCard icon={Clock}    label="Pending Review" color="bg-sand-500"
          value={pending.length} sub={pending.length > 0 ? 'Awaiting admin' : 'All clear'} />
      </div>

      {/* Mobile pay button */}
      <Link to="/pay" className="btn-primary sm:hidden w-full py-3">
        <CreditCard className="w-4 h-4" />
        Submit Monthly Payment
      </Link>

      {/* Recent payments */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-tide-600" />
            <h2 className="font-semibold text-slate-800">Recent Payments</h2>
          </div>
          <Link to="/receipts" className="text-sm text-tide-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <Banknote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No payments yet</p>
            <p className="text-sm text-slate-400 mt-1">Submit your first monthly contribution</p>
            <Link to="/pay" className="btn-primary mx-auto mt-4 w-fit">Pay Now</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>TrxID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const meta = STATUS_META[p.status] || STATUS_META.pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={p.id}>
                      <td>{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '—'}</td>
                      <td className="font-semibold">৳{p.amount?.toLocaleString()}</td>
                      <td className="font-mono text-xs">{p.trxId}</td>
                      <td>
                        <span className={meta.bg}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
