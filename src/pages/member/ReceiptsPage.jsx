import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Download, FileText, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function generateReceipt(payment, memberName) {
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${payment.trxId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: white; max-width: 420px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0369a1, #0284c7); color: white; padding: 28px 24px; text-align: center; }
        .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        .header p { opacity: 0.8; font-size: 13px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; margin-top: 8px; }
        .body { padding: 24px; }
        .amount-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; }
        .amount { font-size: 32px; font-weight: bold; color: #0284c7; }
        .amount-label { font-size: 12px; color: #64748b; margin-top: 4px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-size: 13px; }
        .value { font-weight: 600; font-size: 13px; color: #1e293b; }
        .approved { color: #16a34a; font-weight: bold; display: flex; align-items: center; gap: 4px; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 11px; color: #94a3b8; }
        .print-btn { display: block; width: calc(100% - 48px); margin: 16px 24px; background: #0284c7; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
        @media print { .print-btn { display: none; } body { background: white; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🏝 Dwiptori</h1>
          <p>দ্বীপ তরী — Payment Receipt</p>
          <div class="badge">APPROVED ✓</div>
        </div>
        <div class="body">
          <div class="amount-box">
            <div class="amount">৳${Number(payment.amount).toLocaleString()}</div>
            <div class="amount-label">Payment Amount</div>
          </div>
          <div class="row"><span class="label">Receipt No.</span><span class="value">#${payment.id?.slice(-8).toUpperCase()}</span></div>
          <div class="row"><span class="label">Member Name</span><span class="value">${memberName}</span></div>
          <div class="row"><span class="label">Sender Name</span><span class="value">${payment.senderName}</span></div>
          <div class="row"><span class="label">Sender Phone</span><span class="value">${payment.senderPhone}</span></div>
          <div class="row"><span class="label">Transaction ID</span><span class="value">${payment.trxId}</span></div>
          <div class="row"><span class="label">Method</span><span class="value">${payment.method}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${payment.createdAt?.toDate ? format(payment.createdAt.toDate(), 'dd MMMM yyyy, hh:mm a') : '—'}</span></div>
          <div class="row"><span class="label">Status</span><span class="approved">✓ APPROVED</span></div>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <div class="footer">
          <p>This is a computer-generated receipt.</p>
          <p>Dwiptori Fund Management System</p>
        </div>
      </div>
    </body>
    </html>
  `);
  win.document.close();
}

const STATUS = {
  pending:  { icon: Clock,       cls: 'badge-pending',  label: 'Pending',  color: 'bg-yellow-100 text-yellow-600' },
  approved: { icon: CheckCircle, cls: 'badge-approved', label: 'Approved', color: 'bg-green-100 text-green-600' },
  rejected: { icon: XCircle,     cls: 'badge-rejected', label: 'Rejected', color: 'bg-red-100 text-red-500' },
};

export default function ReceiptsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    if (!profile?.uid) return;
    getDocs(query(collection(db, 'payments'), where('uid', '==', profile.uid))).then(snap => {
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPayments(sorted);
      setLoading(false);
    }).catch(err => {
      toast.error('Load error: ' + err.message);
      setLoading(false);
    });
  }, [profile?.uid]);

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalApproved = payments.filter(p => p.status === 'approved').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">My Receipts</h1>
        <p className="text-slate-500 mt-1">আপনার সকল payment ও receipt</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'মোট approved', value: `৳${totalApproved.toLocaleString()}`, color: 'text-green-700' },
          { label: 'Approved',     value: payments.filter(p => p.status === 'approved').length, color: 'text-green-700' },
          { label: 'Pending',      value: payments.filter(p => p.status === 'pending').length,  color: 'text-yellow-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className={`font-display font-bold text-xl ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'approved', 'pending', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all
              ${filter === f ? 'bg-tide-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f === 'all' ? 'সব' : f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">কোনো payment নেই</p>
          <Link to="/pay" className="btn-primary mt-4 text-sm py-2 px-5 inline-flex">
            <CreditCard className="w-4 h-4" /> Payment দিন
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const meta = STATUS[p.status] || STATUS.pending;
            const Icon = meta.icon;
            return (
              <div key={p.id} className="glass-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">৳{p.amount?.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">{p.method}</span>
                        <span className={meta.cls + ' text-xs'}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        TrxID: {p.trxId} · {p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '—'}
                      </div>
                    </div>
                  </div>
                  {p.status === 'approved' && (
                    <button
                      onClick={() => { generateReceipt(p, profile.name); toast.success('Receipt খুলছে...'); }}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-tide-600 hover:text-tide-800 bg-tide-50 hover:bg-tide-100 px-3 py-2 rounded-xl transition-colors">
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
