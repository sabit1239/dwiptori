import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, Save, X, Bell, Pin } from 'lucide-react';

const TYPES = [
  { key: 'general',  label: 'সাধারণ',    color: 'bg-slate-100 text-slate-600' },
  { key: 'urgent',   label: 'জরুরি',     color: 'bg-red-100 text-red-600' },
  { key: 'meeting',  label: 'মিটিং',     color: 'bg-blue-100 text-blue-600' },
  { key: 'payment',  label: 'চাঁদা',     color: 'bg-green-100 text-green-600' },
  { key: 'event',    label: 'ইভেন্ট',    color: 'bg-purple-100 text-purple-600' },
];

export default function AdminNotices() {
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);

  const empty = { title: '', body: '', type: 'general', pinned: false };
  const [form, setForm] = useState(empty);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'notices'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
    setNotices(data);
    setLoading(false);
  }

  function openAdd() {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(n) {
    setForm({ title: n.title, body: n.body, type: n.type, pinned: n.pinned || false });
    setEditing(n.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return toast.error('শিরোনাম দিন');
    if (!form.body.trim())  return toast.error('বিবরণ দিন');
    try {
      if (editing) {
        await updateDoc(doc(db, 'notices', editing), {
          title:     form.title.trim(),
          body:      form.body.trim(),
          type:      form.type,
          pinned:    form.pinned,
          updatedAt: serverTimestamp(),
        });
        toast.success('আপডেট হয়েছে!');
      } else {
        await addDoc(collection(db, 'notices'), {
          title:     form.title.trim(),
          body:      form.body.trim(),
          type:      form.type,
          pinned:    form.pinned,
          createdAt: serverTimestamp(),
        });
        toast.success('নোটিশ যোগ হয়েছে!');
      }
      setShowForm(false);
      load();
    } catch { toast.error('Failed'); }
  }

  async function handleDelete(n) {
    try {
      await deleteDoc(doc(db, 'notices', n.id));
      setNotices(ns => ns.filter(x => x.id !== n.id));
      toast.success('Delete হয়েছে');
      setConfirm(null);
    } catch { toast.error('Failed'); }
  }

  async function togglePin(n) {
    try {
      await updateDoc(doc(db, 'notices', n.id), { pinned: !n.pinned });
      load();
      toast.success(n.pinned ? 'Pin সরানো হয়েছে' : 'Pin করা হয়েছে');
    } catch { toast.error('Failed'); }
  }

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
            <p className="text-slate-500 text-sm text-center mb-6">এই নোটিশটা permanently delete হবে।</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center py-2">Cancel</button>
              <button onClick={() => handleDelete(confirm)} className="btn-danger flex-1 justify-center py-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-slate-800">
                {editing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">

              {/* Type */}
              <div>
                <label className="label">ধরন</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                        ${form.type === t.key ? t.color + ' ring-2 ring-offset-1 ring-tide-400' : 'bg-slate-100 text-slate-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">শিরোনাম *</label>
                <input className="input-field" placeholder="নোটিশের শিরোনাম"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className="label">বিবরণ *</label>
                <textarea className="input-field min-h-[100px] resize-none" placeholder="নোটিশের বিস্তারিত..."
                  value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="pinned" checked={form.pinned}
                  onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  className="w-4 h-4 rounded accent-tide-600" />
                <label htmlFor="pinned" className="text-sm font-medium text-slate-700 cursor-pointer">
                  📌 উপরে pin করুন
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">
                <Save className="w-4 h-4" /> {editing ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Notice Board</h1>
          <p className="text-slate-500 mt-1">সব member কে নোটিশ পাঠান</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> নতুন নোটিশ
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-card">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">কোনো নোটিশ নেই</p>
            <button onClick={openAdd} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> প্রথম নোটিশ দিন
            </button>
          </div>
        ) : (
          notices.map(n => {
            const typeMeta = TYPES.find(t => t.key === n.type) || TYPES[0];
            return (
              <div key={n.id} className={`bg-white rounded-2xl shadow-card p-5 ${n.pinned ? 'border-2 border-tide-200' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {n.pinned && <span className="text-xs font-medium text-tide-600 flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>}
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeMeta.color}`}>{typeMeta.label}</span>
                      <span className="text-xs text-slate-400">
                        {n.createdAt?.toDate ? format(n.createdAt.toDate(), 'dd MMM yyyy') : '—'}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-slate-800 text-lg mb-1">{n.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{n.body}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => togglePin(n)}
                      className={`p-1.5 rounded-lg transition-colors ${n.pinned ? 'text-tide-600 bg-tide-50' : 'text-slate-400 hover:text-tide-600 hover:bg-tide-50'}`}>
                      <Pin className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-tide-600 hover:bg-tide-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirm(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
