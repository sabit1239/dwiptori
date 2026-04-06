import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Phone, Hash, DollarSign, User, Copy, CheckCircle, Send } from 'lucide-react';

function NumberCard({ method, number, color }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className={`rounded-2xl p-4 border-2 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-70">{method}</div>
          <div className="text-xl font-mono font-bold mt-0.5">{number}</div>
          <div className="text-xs opacity-60 mt-1">Send money to this number, then fill the form below</div>
        </div>
        <button onClick={copy}
          className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
          {copied
            ? <CheckCircle className="w-4 h-4 text-green-600" />
            : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function PayPage() {
  const { profile } = useAuth();
  const [payNumbers, setPayNumbers] = useState([]);
  const [form, setForm] = useState({
    senderName: profile?.name || '',
    senderPhone: '',
    trxId: '',
    amount: '',
    method: 'bKash',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'paymentNumbers'));
      setPayNumbers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    const { senderName, senderPhone, trxId, amount } = form;
    if (!senderName || !senderPhone || !trxId || !amount)
      return toast.error('Please fill all fields');
    if (isNaN(amount) || Number(amount) <= 0)
      return toast.error('Please enter a valid amount');
    if (!/^\d{10,11}$/.test(senderPhone.replace(/\D/g,'')))
      return toast.error('Please enter a valid phone number');

    setLoading(true);
    try {
      // Check for duplicate TrxID
      const dupQ = query(collection(db, 'payments'), where('trxId', '==', trxId.trim()));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        toast.error('This Transaction ID has already been submitted!');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'payments'), {
        uid:         profile.uid,
        memberName:  profile.name,
        memberEmail: profile.email,
        senderName:  senderName.trim(),
        senderPhone: senderPhone.trim(),
        trxId:       trxId.trim(),
        amount:      Number(amount),
        method:      form.method,
        status:      'pending',
        createdAt:   serverTimestamp(),
      });

      toast.success('Payment submitted! Waiting for admin approval.');
      setForm(f => ({ ...f, senderPhone:'', trxId:'', amount:'' }));
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    } finally { setLoading(false); }
  }

  const bkashNums  = payNumbers.filter(n => n.method === 'bKash');
  const nagadNums  = payNumbers.filter(n => n.method === 'Nagad');

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Submit Payment</h1>
        <p className="text-slate-500 mt-1">Send money first, then fill in the details below</p>
      </div>

      {/* Step 1 - Payment numbers */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-tide-600 text-white text-sm font-bold flex items-center justify-center">1</div>
          <h2 className="font-semibold text-slate-800">Send money to one of these numbers</h2>
        </div>

        {bkashNums.length > 0 && (
          <div className="space-y-2">
            {bkashNums.map(n => (
              <NumberCard key={n.id} method="bKash" number={n.number}
                color="border-pink-200 bg-pink-50 text-pink-900" />
            ))}
          </div>
        )}
        {nagadNums.length > 0 && (
          <div className="space-y-2">
            {nagadNums.map(n => (
              <NumberCard key={n.id} method="Nagad" number={n.number}
                color="border-orange-200 bg-orange-50 text-orange-900" />
            ))}
          </div>
        )}
        {payNumbers.length === 0 && (
          <div className="text-center py-4 text-slate-400 text-sm">
            No payment numbers configured yet. Contact admin.
          </div>
        )}
      </div>

      {/* Step 2 - Form */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-full bg-tide-600 text-white text-sm font-bold flex items-center justify-center">2</div>
          <h2 className="font-semibold text-slate-800">Fill in the payment details</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Sender's Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" className="input-field pl-10"
                  placeholder="Your full name" value={form.senderName}
                  onChange={update('senderName')} />
              </div>
            </div>
            <div>
              <label className="label">Sender's Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" className="input-field pl-10"
                  placeholder="01XXXXXXXXX" value={form.senderPhone}
                  onChange={update('senderPhone')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Transaction ID (TrxID)</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" className="input-field pl-10 font-mono"
                  placeholder="e.g. 8J9K3MNP2Q" value={form.trxId}
                  onChange={update('trxId')} />
              </div>
            </div>
            <div>
              <label className="label">Amount Sent (BDT)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" className="input-field pl-10"
                  placeholder="e.g. 500" value={form.amount}
                  onChange={update('amount')} min="1" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Payment Method</label>
            <div className="flex gap-3">
              {['bKash', 'Nagad'].map(m => (
                <label key={m} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 cursor-pointer transition-all
                  ${form.method === m ? 'border-tide-500 bg-tide-50 text-tide-700' : 'border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="method" value={m} checked={form.method === m}
                    onChange={update('method')} className="sr-only" />
                  <span className="font-medium">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            <Send className="w-4 h-4" />
            {loading ? 'Submitting…' : 'Submit Payment for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
