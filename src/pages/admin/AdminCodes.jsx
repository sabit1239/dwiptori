import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Key, Copy, CheckCircle, User, Clock } from 'lucide-react';

export default function AdminCodes() {
  const [codes,    setCodes]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newCode,  setNewCode]  = useState('');
  const [adding,   setAdding]   = useState(false);
  const [confirm,  setConfirm]  = useState(null);
  const [copied,   setCopied]   = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'memberCodes'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setCodes(data);
    setLoading(false);
  }

  function generateCode() {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900) + 100;
    const seq  = String(codes.length + 1).padStart(3, '0');
    setNewCode(`DWT-${year}-${seq}`);
  }

  async function handleAdd() {
    if (!newCode.trim()) return toast.error('Code দিন');
    const exists = codes.find(c => c.code === newCode.trim().toUpperCase());
    if (exists) return toast.error('এই code আগেই আছে!');

    setAdding(true);
    try {
      await addDoc(collection(db, 'memberCodes'), {
        code:      newCode.trim().toUpperCase(),
        status:    'active',
        usedBy:    null,
        usedByName: null,
        usedAt:    null,
        createdAt: serverTimestamp(),
      });
      toast.success('Code যোগ হয়েছে!');
      setNewCode('');
      load();
    } catch { toast.error('Failed'); }
    setAdding(false);
  }

  async function handleDelete(c) {
    try {
      await deleteDoc(doc(db, 'memberCodes', c.id));
      toast.success('Delete হয়েছে');
      setConfirm(null);
      load();
    } catch { toast.error('Failed'); }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Code copied!');
    setTimeout(() => setCopied(''), 2000);
  }

  const active = codes.filter(c => c.status === 'active' && !c.usedBy);
  const used   = codes.filter(c => c.usedBy);

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
            <p className="text-slate-500 text-sm text-center mb-2">
              Code: <span className="font-mono font-bold text-slate-800">{confirm.code}</span>
            </p>
            {confirm.usedBy && (
              <p className="text-red-500 text-xs text-center mb-4">⚠️ এই code টা already use হয়েছে!</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center py-2">Cancel</button>
              <button onClick={() => handleDelete(confirm)} className="btn-danger flex-1 justify-center py-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Member Codes</h1>
        <p className="text-slate-500 mt-1">Offline form এর জন্য activation code</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'মোট code',  value: codes.length,  color: 'bg-tide-600' },
          { label: 'Available', value: active.length,  color: 'bg-green-500' },
          { label: 'Used',      value: used.length,    color: 'bg-slate-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Key className="w-5 h-5 text-white" />
            </div>
            <div className="font-display font-bold text-xl text-slate-800">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Add Code */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">নতুন Code যোগ করুন</h2>
        <div className="flex gap-2">
          <input className="input-field flex-1 font-mono uppercase"
            placeholder="যেমন: DWT-2025-001"
            value={newCode}
            onChange={e => setNewCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={generateCode}
            className="btn-secondary px-3 py-2 text-sm flex-shrink-0">
            Auto
          </button>
          <button onClick={handleAdd} disabled={adding}
            className="btn-primary px-4 py-2 text-sm flex-shrink-0">
            <Plus className="w-4 h-4" />
            {adding ? '...' : 'যোগ করুন'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          💡 "Auto" চাপলে automatic code generate হবে, অথবা নিজে লিখুন
        </p>
      </div>

      {/* Available Codes */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-green-50">
                <h3 className="font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Available Codes ({active.length})
                </h3>
                <p className="text-xs text-green-600 mt-0.5">এই codes গুলো এখনো use হয়নি</p>
              </div>
              <div className="divide-y divide-slate-100">
                {active.map(c => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-slate-800 text-lg">{c.code}</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3 h-3" /> Active — ব্যবহারের জন্য প্রস্তুত
                      </div>
                    </div>
                    <button onClick={() => copyCode(c.code)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0
                        ${copied === c.code ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {copied === c.code ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === c.code ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={() => setConfirm(c)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Used Codes */}
          {used.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> Used Codes ({used.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">এই codes গুলো member রা use করেছে</p>
              </div>
              <div className="divide-y divide-slate-100">
                {used.map(c => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-slate-600 text-lg">{c.code}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <User className="w-3 h-3" />
                        {c.usedByName || 'Unknown'}
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full flex-shrink-0">
                      Used
                    </span>
                    <button onClick={() => setConfirm(c)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {codes.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-card">
              <Key className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">কোনো code নেই — উপরে যোগ করুন</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
