import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminPayments() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filter,   setFilter]   = useState('pending');
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);

  async function load() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) {
      toast.error('Load failed');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(payment) {
    setActing(payment.id);
    try {
      await updateDoc(doc(db, 'payments', payment.id), { status: 'approved' });
      await updateDoc(doc(db, 'users', payment.uid), { totalPaid: increment(Number(payment.amount) || 0) });
      setPayments(ps => ps.map(p => p.id === payment.id ? { ...p, status: 'approved' } : p));
      toast.success('Approved!');
    } catch(e) {
      toast.error('Failed: ' + e.message);
    }
    setActing(null);
  }

  async function reject(payment) {
    setActing(payment.id);
    try {
      await updateDoc(doc(db, 'payments', payment.id), { status: 'rejected' });
      setPayments(ps => ps.map(p => p.id === payment.id ? { ...p, status: 'rejected' } : p));
      toast.success('Rejected!');
    } catch(e) {
      toast.error('Failed: ' + e.message);
    }
    setActing(null);
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const counts = {
    all: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Payment Verification</h1>
        <p className="text-slate-500 mt-1">Member payment approve ও reject করুন</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all
              ${filter === f ? 'bg-tide-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">কোনো payment নেই</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(p => (
              <div key={p.id} className="p-5 hover:bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase">Member</div>
                      <div className="font-semibold text-slate-800">{p.memberName}</div>
                      <div className="text-xs text-slate-500">{p.memberEmail}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase">Sender</div>
                      <div className="font-medium">{p.senderName}</div>
                      <div className="text-xs text-slate-500">{p.senderPhone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase">TrxID</div>
                      <div className="font-mono text-sm font-semibold text-tide-700">{p.trxId}</div>
                      <div className="text-xs text-slate-500">{p.method}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase">Amount</div>
                      <div className="text-xl font-bold text-slate-800">৳{p.amount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase">Date</div>
                      <div className="text-sm">{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase">Status</div>
                      {p.status === 'pending'  && <span className="badge-pending"><Clock className="w-3 h-3" />Pending</span>}
                      {p.status === 'approved' && <span className="badge-approved"><CheckCircle className="w-3 h-3" />Approved</span>}
                      {p.status === 'rejected' && <span className="badge-rejected"><XCircle className="w-3 h-3" />Rejected</span>}
                    </div>
                  </div>
                  {p.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(p)} disabled={acting === p.id}
                        className="btn-success py-2 px-4 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {acting === p.id ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => reject(p)} disabled={acting === p.id}
                        className="btn-danger py-2 px-4 text-sm">
                        <XCircle className="w-4 h-4" />
                        {acting === p.id ? '...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
