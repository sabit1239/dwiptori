import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

function generateReceipt(payment, memberName) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  const W = pdf.internal.pageSize.getWidth();

  // Header background
  pdf.setFillColor(14, 165, 233);
  pdf.rect(0, 0, W, 45, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('DWIPTORI', W / 2, 18, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('দ্বীপ তরী — Monthly Fund Collection', W / 2, 26, { align: 'center' });

  pdf.setFontSize(9);
  pdf.text('PAYMENT RECEIPT', W / 2, 36, { align: 'center' });

  // Receipt body
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(9);

  const rows = [
    ['Receipt No.',    `#${payment.id?.slice(-8).toUpperCase()}`],
    ['Member Name',    memberName],
    ['Sender Name',    payment.senderName],
    ['Sender Phone',   payment.senderPhone],
    ['Transaction ID', payment.trxId],
    ['Method',         payment.method],
    ['Amount',         `BDT ${payment.amount?.toLocaleString()}`],
    ['Date',           payment.createdAt?.toDate
      ? format(payment.createdAt.toDate(), 'dd MMMM yyyy, hh:mm a') : '—'],
    ['Status',         'APPROVED ✓'],
  ];

  let y = 58;
  rows.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, 15, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 41, 59);
    pdf.text(String(value), 75, y);
    y += 10;
  });

  // Footer
  pdf.setFillColor(241, 245, 249);
  pdf.rect(0, 155, W, 30, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This is a computer-generated receipt and does not require a signature.', W / 2, 165, { align: 'center' });
  pdf.text('Dwiptori Fund Management System', W / 2, 172, { align: 'center' });

  pdf.save(`Dwiptori_Receipt_${payment.trxId}.pdf`);
}

const STATUS = {
  pending:  { icon: Clock,        cls: 'badge-pending',  label: 'Pending' },
  approved: { icon: CheckCircle,  cls: 'badge-approved', label: 'Approved' },
  rejected: { icon: XCircle,      cls: 'badge-rejected', label: 'Rejected' },
};

export default function ReceiptsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      const q = query(
        collection(db, 'payments'),
        where('uid', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, [profile?.uid]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">My Receipts</h1>
        <p className="text-slate-500 mt-1">All your payment submissions and downloadable receipts</p>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading your payments…</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
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
                            onClick={() => { generateReceipt(p, profile.name); toast.success('Receipt downloaded!'); }}
                            className="flex items-center gap-1.5 text-xs font-medium text-tide-600
                                       hover:text-tide-800 hover:bg-tide-50 px-2.5 py-1.5 rounded-lg transition-colors">
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
