import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { CreditCard, Copy, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function PayPage() {
  const { profile } = useAuth();
  const [numbers,    setNumbers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied,     setCopied]     = useState('');
  const [form, setForm] = useState({
    senderName: '', senderPhone: '', trxId: '', amount: '', method: 'bKash',
  });

  useEffect(() => {
    getDocs(collection(db, 'paymentNumbers'))
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('Numbers loaded:', data);
        setNumbers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Load error:', err.message);
        toast.error('Load error: ' + err.message);
        setLoading(false);
      });
  }, []);

  function copyNumber(num) {
    navigator.clipboard.writeText(num);
    setCopied(num);
    toast.success('Number copied!');
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleSubmit() {
    if (!form.senderName.trim()) return toast.error('Sender নাম দিন');
    if (!form.senderPhone.trim()) return toast.error('Sender phone দিন');
    if (!form.trxId.trim()) return toast.error('TrxID দিন');
    if (!form.amount || isNaN(form.amount)) return toast.error('সঠিক amount দিন');

    setSubmitting(true);
    try {
      const dupSnap = await getDocs(query(collection(db, 'payments'), where('trxId', '==', form.trxId.trim())));
      if (!dupSnap.empty) {
        toast.error('এই TrxID আগেই submit হয়েছে!');
        setSubmitting(false);
        return;
      }
      await addDoc(collection(db, 'payments'), {
        uid:         profile.uid,
        memberName:  profile.name,
        memberEmail: profile.email,
        senderName:  form.senderName.trim(),
        senderPhone: form.senderPhone.trim(),
        trxId:       form.trxId.trim(),
        amount:      Number(form.amount),
        method:      form.method,
        status:      'pending',
        createdAt:   serverTimestamp(),
      });
      toast.success('Payment submit হয়েছে! Admin approval এর অপেক্ষায়।');
      setForm({ senderName: '', senderPhone: '', trxId: '', amount: '', method: 'bKash' });
    } catch(e) {
      toast.error('Failed: ' + e.message);
    }
    setSubmitting(false);
  }

  const bkash = numbers.filter(n => n.method === 'bKash');
  const nagad = numbers.filter(n => n.method === 'Nagad');

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">চাঁদা জমা দিন</h1>
        <p className="text-slate-500 mt-1">নিচের নম্বরে টাকা পাঠিয়ে form fill করুন</p>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-tide-600 text-white text-sm font-bold flex items-center justify-center">১</div>
          <h2 className="font-semibold text-slate-800">নম্বরে টাকা পাঠান</h2>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-4">Loading...</div>
        ) : numbers.length === 0 ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Admin এখনো payment number যোগ করেননি</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* সব numbers দেখাও — filter ছাড়া */}
            {numbers.map(n => (
              <div key={n.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border
                  ${n.method === 'bKash' ? 'bg-pink-50 border-pink-100' : 'bg-orange-50 border-orange-100'}`}>
                <div>
                  <div className={`text-xs font-bold mb-0.5 ${n.method === "bKash" ? "text-pink-600" : "text-orange-600"}`}>{n.method === "bKash" ? "💗 bKash" : "🟠 Nagad"}</div>
                  <div className="font-mono font-bold text-slate-800">{n.number}</div>
                  {n.name && <div className="text-xs text-slate-500">{n.name}</div>}
                </div>
                <button onClick={() => copyNumber(n.number)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                    ${copied === n.number
                      ? 'bg-green-100 text-green-700'
                      : n.method === 'bKash'
                        ? 'bg-white text-pink-600 hover:bg-pink-100 border border-pink-200'
                        : 'bg-white text-orange-600 hover:bg-orange-100 border border-orange-200'}`}>
                  {copied === n.number ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === n.number ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-tide-600 text-white text-sm font-bold flex items-center justify-center">২</div>
          <h2 className="font-semibold text-slate-800">Payment তথ্য দিন</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['bKash', 'Nagad'].map(m => (
              <button key={m} onClick={() => setForm(f => ({ ...f, method: m }))}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${form.method === m
                    ? m === 'bKash' ? 'bg-pink-500 text-white' : 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {m}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Sender এর নাম *</label>
            <input className="input-field" placeholder="যে পাঠিয়েছে তার নাম"
              value={form.senderName} onChange={e => setForm(f => ({ ...f, senderName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Sender এর Phone *</label>
            <input className="input-field" placeholder="01XXXXXXXXX"
              value={form.senderPhone} onChange={e => setForm(f => ({ ...f, senderPhone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Transaction ID (TrxID) *</label>
            <input className="input-field font-mono" placeholder="TrxID"
              value={form.trxId} onChange={e => setForm(f => ({ ...f, trxId: e.target.value }))} />
          </div>
          <div>
            <label className="label">Amount (টাকা) *</label>
            <input type="number" className="input-field" placeholder="0"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary w-full py-3 text-base justify-center">
            <Send className="w-4 h-4" />
            {submitting ? 'Submit হচ্ছে...' : 'Payment Submit করুন'}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          Submit করার পর Admin verify করবেন। Approve হলে আপনার Receipts পেজে receipt দেখাবে।
        </div>
      </div>
    </div>
  );
}
