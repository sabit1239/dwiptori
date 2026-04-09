import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react';

const MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

export default function LedgerPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    getDocs(collection(db, 'ledger')).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance      = totalIncome - totalExpense;

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  const grouped = {};
  filtered.forEach(e => {
    const key = `${e.month} ${e.year}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  function downloadCSV(monthEntries, monthLabel) {
    const rows = [
      ['তারিখ', 'ধরন', 'বিবরণ', 'পরিমাণ'],
      ...monthEntries.map(e => [
        e.createdAt?.toDate ? format(e.createdAt.toDate(), 'dd MMM yyyy') : '—',
        e.type === 'income' ? 'আয়' : 'ব্যয়',
        e.description,
        e.amount,
      ])
    ];
    const income  = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    rows.push([]);
    rows.push(['', 'মোট আয়', income, '']);
    rows.push(['', 'মোট ব্যয়', expense, '']);
    rows.push(['', 'নিট', income - expense, '']);

    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Dwiptori_${monthLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">হিসাবের খাতা</h1>
        <p className="text-slate-500 mt-1">সংগঠনের আয় ও ব্যয়ের হিসাব</p>
      </div>

      {/* Summary */}
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
        <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
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

      {/* Entries */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">এখনো কোনো হিসাব নেই</p>
        </div>
      ) : (
        Object.entries(grouped).map(([monthKey, monthEntries]) => {
          const mIncome  = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
          const mExpense = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
          return (
            <div key={monthKey} className="bg-white rounded-2xl shadow-card overflow-hidden">
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
                      </div>
                    </div>
                    <div className={`font-display font-bold text-lg flex-shrink-0
                      ${e.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {e.type === 'income' ? '+' : '-'}৳{e.amount.toLocaleString()}
                    </div>
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
