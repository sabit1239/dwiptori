import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Download, X, Save } from 'lucide-react';

const MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

export default function AdminLedger() {
  const { profile } = useAuth();
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirm,  setConfirm]  = useState(null);
  const [filter,   setFilter]   = useState('all');

  const now = new Date();
  const empty = {
    type:        'income',
    amount:      '',
    description: '',
    month:       MONTHS[now.getMonth()],
    year:        now.getFullYear(),
  };
  const [form, setForm] = useState(empty);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'ledger'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setEntries(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.amount || isNaN(form.amount)) return toast.error('সঠিক পরিমাণ দিন');
    if (!form.description.trim()) return toast.error('বিবরণ দিন');
    try {
      await addDoc(collection(db, 'ledger'), {
        type:        form.type,
        amount:      Number(form.amount),
        description: form.description.trim(),
        month:       form.month,
        year:        Number(form.year),
        addedBy:     profile?.name,
        createdAt:   serverTimestamp(),
      });
      toast.success('এন্ট্রি যোগ হয়েছে!');
      setShowForm(false);
      setForm(empty);
      load();
    } catch { toast.error('Failed'); }
  }

  async function handleDelete(entry) {
    try {
      await deleteDoc(doc(db, 'ledger', entry.id));
      setEntries(es => es.filter(e => e.id !== entry.id));
      toast.success('Delete হয়েছে');
      setConfirm(null);
    } catch { toast.error('Failed'); }
  }

  function downloadCSV(monthEntries, monthLabel) {
    const rows = [
      ['তারিখ', 'ধরন', 'বিবরণ', 'পরিমাণ', 'যোগকারী'],
      ...monthEntries.map(e => [
        e.createdAt?.toDate ? format(e.createdAt.toDate(), 'dd MMM yyyy') : '—',
        e.type === 'income' ? 'আয়' : 'ব্যয়',
        e.description,
        e.amount,
        e.addedBy || '—',
      ])
    ];
    const income  = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    rows.push([]);
    rows.push(['', '', 'মোট আয়', income, '']);
    rows.push(['', '', 'মোট ব্যয়', expense, '']);
    rows.push(['', '', 'নিট', income - expense, '']);

    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Dwiptori_${monthLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download শুরু হয়েছে!');
  }

  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance      = totalIncome - totalExpense;

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  // মাস অনুযায়ী group করা
  const grouped = {};
  filtered.forEach(e => {
    const key = `${e.month} ${e.year}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Delete Confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 text-center mb-1">Delete করবেন?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">এই এন্ট্রিটা permanently delete হবে।</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center py-2">Cancel</button>
              <button onClick={() => handleDelete(confirm)} className="btn-danger flex-1 justify-center py-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-slate-800">নতুন এন্ট্রি</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">

              {/* Type */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setForm(f => ({ ...f, type: 'income' }))}
                  className={`py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                    ${form.type === 'income' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                  <TrendingUp className="w-4 h-4" /> আয় (Income)
                </button>
                <button onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
                  className={`py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                    ${form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  <TrendingDown className="w-4 h-4" /> ব্যয় (Expense)
                </button>
              </div>

              <div>
                <label className="label">পরিমাণ (টাকা) *</label>
                <input type="number" className="input-field" placeholder="0"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>

              <div>
                <label className="label">বিবরণ * (কী কারণে?)</label>
                <input className="input-field" placeholder="যেমন: মাসিক চাঁদা, অনুষ্ঠানের খরচ..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">মাস</label>
                  <select className="input-field" value={form.month}
                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">বছর</label>
                  <input type="number" className="input-field" value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">
                <Save className="w-4 h-4" /> যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">হিসাবের খাতা</h1>
          <p className="text-slate-500 mt-1">আয় ও ব্যয়ের সম্পূর্ণ হিসাব</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> নতুন এন্ট্রি
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-slate-800">৳{totalIncome.toLocaleString()}</div>
            <div className="text-sm text-slate-500">মোট আয়</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-slate-800">৳{totalExpense.toLocaleString()}</div>
            <div className="text-sm text-slate-500">মোট ব্যয়</div>
          </div>
        </div>
        <div className={`bg-white rounded-2xl p-5 shadow-card flex items-center gap-4`}>
          <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-tide-600' : 'bg-orange-500'}`}>
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`text-2xl font-display font-bold ${balance >= 0 ? 'text-tide-700' : 'text-orange-600'}`}>
              ৳{Math.abs(balance).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">{balance >= 0 ? 'ব্যালেন্স' : 'ঘাটতি'}</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all',     label: 'সব' },
          { key: 'income',  label: 'আয়' },
          { key: 'expense', label: 'ব্যয়' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${filter === key ? 'bg-tide-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grouped by month */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">কোনো এন্ট্রি নেই — উপরে বাটন চাপুন</p>
        </div>
      ) : (
        Object.entries(grouped).map(([monthKey, monthEntries]) => {
          const mIncome  = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
          const mExpense = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
          return (
            <div key={monthKey} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Month header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div>
                  <h3 className="font-display font-bold text-slate-800">{monthKey}</h3>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-green-600">আয়: ৳{mIncome.toLocaleString()}</span>
                    <span className="text-red-500">ব্যয়: ৳{mExpense.toLocaleString()}</span>
                    <span className={mIncome - mExpense >= 0 ? 'text-tide-600' : 'text-orange-500'}>
                      নিট: ৳{(mIncome - mExpense).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => downloadCSV(monthEntries, monthKey)}
                  className="flex items-center gap-1.5 text-xs font-medium text-tide-600 hover:text-tide-800 bg-tide-50 hover:bg-tide-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              {/* Entries */}
              <div className="divide-y divide-slate-100">
                {monthEntries.map(e => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                    <div className={`p-2 rounded-xl flex-shrink-0
                      ${e.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {e.type === 'income'
                        ? <TrendingUp className="w-4 h-4" />
                        : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800">{e.description}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {e.createdAt?.toDate ? format(e.createdAt.toDate(), 'dd MMM yyyy') : '—'}
                        {e.addedBy && <span className="ml-2">· {e.addedBy}</span>}
                      </div>
                    </div>
                    <div className={`font-display font-bold text-lg flex-shrink-0
                      ${e.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {e.type === 'income' ? '+' : '-'}৳{e.amount.toLocaleString()}
                    </div>
                    <button onClick={() => setConfirm(e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
