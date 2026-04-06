import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
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
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; }
        .header { background: #0284c7; color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 4px 0 0; opacity: 0.8; font-size: 13px; }
        .body { border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-size: 13px; }
        .value { font-weight: 600; font-size: 13px; color: #1e293b; }
        .amount { font-size: 22px; font-weight: bold; color: #0284c7; }
        .approved { color: #16a34a; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Dwiptori</h1>
        <p>দ্বীপ তরী — Payment Receipt</p>
      </div>
      <div class="body">
        <div class="row"><span class="label">Receipt No.</span><span class="value">#${payment.id?.slice(-8).toUpperCase()}</span></div>
        <div class="row"><span class="label">Member Name</span><span class="value">${memberName}</span></div>
        <div class="row"><span class="label">Sender Name</span><span class="value">${payment.senderName}</span></div>
        <div class="row"><span class="label">Sender Phone</span><span class="value">${payment.senderPhone}</span></div>
        <div class="row"><span class="label">Transaction ID</span><span class="value">${payment.trxId}</span></div>
        <div class="row"><span class="label">Method</span><span class="value">${payment.method}</span></div>
        <div class="row"><span class="label">Amount</span><span class="amount">৳${payment.amount?.toLocaleString()}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${payment.createdAt?.toDate ? format(payment.createdAt.toDate(), 'dd MMMM yyyy, hh:mm a') : '—'}</span></div>
        <div class="row"><span class="label">Status</span><span class="approved">✓ APPROVED</span></div>
      </div>
      <div class="footer">
        <p>This is a computer-generated receipt.</p>
        <p>Dwiptori Fund Management System</p>
      </div>
      <br>
      <center><button onclick="window.print()" style="background:#0284c7;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;">Print / Save as PDF</button></center>
    </body>
    </html>
  `);
  win.document.close();
}

const STATUS = {
  pending:  { icon: Clock,       cls: 'badge-pending',  label: 'Pending' },
  approved: { icon: CheckCircle, cls: 'badge-approved', label: 'Approved' },
  rejected: { icon: XCircle,     cls: 'badge-rejected', label: 'Rejected' },
};

export default function ReceiptsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'payments'),
          where('uid', '==', profile.uid)
        );
        const snap = await getDocs(q);
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setPayments(sorted);
      } catch (err) {
        console.error(err);
        toast.error('Load করতে সমস্যা: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.uid]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">My Receipts</h1>
        <p className="text-slate-500 mt-1">আপনার সকল payment ও receipt</p>
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">কোনো payment নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>পরিমাণ</th>
                  <th>Method</th>
                  <th>TrxID</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const meta = STATUS[p.status] || STATUS.pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={p.id}>
                      <td>{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '—'}</td>
                      <td className="font-semibold">৳{p.amount?.toLocaleString()}</td>
cat > src/pages/member/ReceiptsPage.jsx << 'EOF'
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
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
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; }
        .header { background: #0284c7; color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 4px 0 0; opacity: 0.8; font-size: 13px; }
        .body { border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-size: 13px; }
        .value { font-weight: 600; font-size: 13px; color: #1e293b; }
        .amount { font-size: 22px; font-weight: bold; color: #0284c7; }
        .approved { color: #16a34a; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Dwiptori</h1>
        <p>দ্বীপ তরী — Payment Receipt</p>
      </div>
      <div class="body">
        <div class="row"><span class="label">Receipt No.</span><span class="value">#${payment.id?.slice(-8).toUpperCase()}</span></div>
        <div class="row"><span class="label">Member Name</span><span class="value">${memberName}</span></div>
        <div class="row"><span class="label">Sender Name</span><span class="value">${payment.senderName}</span></div>
        <div class="row"><span class="label">Sender Phone</span><span class="value">${payment.senderPhone}</span></div>
        <div class="row"><span class="label">Transaction ID</span><span class="value">${payment.trxId}</span></div>
        <div class="row"><span class="label">Method</span><span class="value">${payment.method}</span></div>
        <div class="row"><span class="label">Amount</span><span class="amount">৳${payment.amount?.toLocaleString()}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${payment.createdAt?.toDate ? format(payment.createdAt.toDate(), 'dd MMMM yyyy, hh:mm a') : '—'}</span></div>
        <div class="row"><span class="label">Status</span><span class="approved">✓ APPROVED</span></div>
      </div>
      <div class="footer">
        <p>This is a computer-generated receipt.</p>
        <p>Dwiptori Fund Management System</p>
      </div>
      <br>
      <center><button onclick="window.print()" style="background:#0284c7;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;">Print / Save as PDF</button></center>
    </body>
    </html>
  `);
  win.document.close();
}

const STATUS = {
  pending:  { icon: Clock,       cls: 'badge-pending',  label: 'Pending' },
  approved: { icon: CheckCircle, cls: 'badge-approved', label: 'Approved' },
  rejected: { icon: XCircle,     cls: 'badge-rejected', label: 'Rejected' },
};

export default function ReceiptsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'payments'),
          where('uid', '==', profile.uid)
        );
        const snap = await getDocs(q);
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setPayments(sorted);
      } catch (err) {
        console.error(err);
        toast.error('Load করতে সমস্যা: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.uid]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">My Receipts</h1>
        <p className="text-slate-500 mt-1">আপনার সকল payment ও receipt</p>
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">কোনো payment নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>পরিমাণ</th>
                  <th>Method</th>
                  <th>TrxID</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const meta = STATUS[p.status] || STATUS.pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={p.id}>
                      <td>{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '—'}</td>
                      <td className="font-semibold">৳{p.amount?.toLocaleString()}</td>
                      <td>{p.method}</td>
                      <td className="font-mono text-xs">{p.trxId}</td>
                      <td>
                        <span className={meta.cls}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        {p.status === 'approved' ? (
                          <button
                            onClick={() => { generateReceipt(p, profile.name); toast.success('Receipt খুলছে...'); }}
                            className="flex items-center gap-1.5 text-xs font-medium text-tide-600 hover:text-tide-800 hover:bg-tide-50 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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
