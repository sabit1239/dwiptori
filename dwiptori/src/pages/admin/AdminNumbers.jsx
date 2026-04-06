import { useEffect, useState } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Phone, Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';

const METHODS = ['bKash', 'Nagad'];

function NumberRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing]   = useState(false);
  const [number,  setNumber]    = useState(item.number);
  const [method,  setMethod]    = useState(item.method);
  const [loading, setLoading]   = useState(false);

  async function save() {
    if (!number.trim()) return toast.error('Number cannot be empty');
    setLoading(true);
    await onUpdate(item.id, { number: number.trim(), method });
    setEditing(false);
    setLoading(false);
  }

  function cancel() { setNumber(item.number); setMethod(item.method); setEditing(false); }

  const colors = {
    bKash: 'border-pink-200 bg-pink-50 text-pink-700',
    Nagad: 'border-orange-200 bg-orange-50 text-orange-700',
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${colors[item.method] || 'border-slate-200 bg-slate-50'}`}>
      {editing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            {METHODS.map(m => (
              <label key={m} className={`flex-1 text-center py-1.5 rounded-lg cursor-pointer text-sm font-medium border transition-all
                ${method === m ? 'border-tide-500 bg-white text-tide-700' : 'border-transparent text-slate-500'}`}>
                <input type="radio" name={`method-${item.id}`} value={m} className="sr-only"
                  checked={method === m} onChange={() => setMethod(m)} />
                {m}
              </label>
            ))}
          </div>
          <input type="tel" value={number} onChange={e => setNumber(e.target.value)}
            className="input-field font-mono" placeholder="01XXXXXXXXX" />
          <div className="flex gap-2">
            <button onClick={save} disabled={loading} className="btn-primary py-1.5 px-3 text-sm flex-1">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={cancel} className="btn-secondary py-1.5 px-3 text-sm">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-60">{item.method}</div>
            <div className="text-lg font-mono font-bold mt-0.5">{item.number}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)}
              className="p-2 rounded-lg bg-white/60 hover:bg-white transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg bg-white/60 hover:bg-red-50 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNumbers() {
  const [numbers,  setNumbers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [newNum,   setNewNum]   = useState('');
  const [newMethod,setNewMethod]= useState('bKash');

  async function load() {
    const snap = await getDocs(collection(db, 'paymentNumbers'));
    setNumbers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addNumber() {
    if (!newNum.trim()) return toast.error('Enter a phone number');
    try {
      const docRef = await addDoc(collection(db, 'paymentNumbers'), {
        number: newNum.trim(), method: newMethod, createdAt: serverTimestamp(),
      });
      setNumbers(n => [...n, { id: docRef.id, number: newNum.trim(), method: newMethod }]);
      setNewNum(''); setAdding(false);
      toast.success(`${newMethod} number added!`);
    } catch { toast.error('Failed to add number'); }
  }

  async function updateNumber(id, data) {
    await updateDoc(doc(db, 'paymentNumbers', id), data);
    setNumbers(ns => ns.map(n => n.id === id ? { ...n, ...data } : n));
    toast.success('Number updated!');
  }

  async function deleteNumber(id) {
    if (!confirm('Remove this payment number?')) return;
    await deleteDoc(doc(db, 'paymentNumbers', id));
    setNumbers(ns => ns.filter(n => n.id !== id));
    toast.success('Number removed');
  }

  const bkashNums = numbers.filter(n => n.method === 'bKash');
  const nagadNums = numbers.filter(n => n.method === 'Nagad');

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Payment Numbers</h1>
          <p className="text-slate-500 mt-1">Manage bKash & Nagad numbers shown to members</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Number
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4 animate-slide-up">
          <h2 className="font-semibold text-slate-800">Add New Number</h2>
          <div className="flex gap-2">
            {METHODS.map(m => (
              <label key={m} className={`flex-1 text-center py-2 rounded-xl cursor-pointer text-sm font-medium border-2 transition-all
                ${newMethod === m ? 'border-tide-500 bg-tide-50 text-tide-700' : 'border-slate-200 text-slate-500'}`}>
                <input type="radio" name="newMethod" value={m} className="sr-only"
                  checked={newMethod === m} onChange={() => setNewMethod(m)} />
                {m}
              </label>
            ))}
          </div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="tel" className="input-field pl-10 font-mono" placeholder="01XXXXXXXXX"
              value={newNum} onChange={e => setNewNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNumber()} />
          </div>
          <div className="flex gap-2">
            <button onClick={addNumber} className="btn-primary flex-1">
              <Check className="w-4 h-4" /> Add Number
            </button>
            <button onClick={() => { setAdding(false); setNewNum(''); }} className="btn-secondary">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-center py-8">Loading…</div>
      ) : numbers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <Phone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No payment numbers yet</p>
          <p className="text-sm text-slate-400">Click "Add Number" to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bkashNums.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">bKash</h2>
              <div className="space-y-3">
                {bkashNums.map(n => (
                  <NumberRow key={n.id} item={n} onUpdate={updateNumber} onDelete={deleteNumber} />
                ))}
              </div>
            </div>
          )}
          {nagadNums.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Nagad</h2>
              <div className="space-y-3">
                {nagadNums.map(n => (
                  <NumberRow key={n.id} item={n} onUpdate={updateNumber} onDelete={deleteNumber} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
