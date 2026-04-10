import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, X, Users, Link2 } from 'lucide-react';

export default function AdminCommittee() {
  const [members,  setMembers]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);

  const empty = { name: '', role: '', phone: '', email: '', emoji: '👤', order: 0 };
  const [form, setForm] = useState(empty);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [cSnap, uSnap] = await Promise.all([
      getDocs(collection(db, 'committee')),
      getDocs(collection(db, 'users')),
    ]);
    setMembers(cSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0)));
    setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  function openAdd() {
    setForm({ ...empty, order: members.length + 1 });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(m) {
    setForm({ name: m.name || '', role: m.role || '', phone: m.phone || '', email: m.email || '', emoji: m.emoji || '👤', order: m.order || 0 });
    setEditing(m.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('নাম দিন');
    if (!form.role.trim()) return toast.error('পদবী দিন');

    const data = {
      name:  form.name.trim(),
      role:  form.role.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      emoji: form.emoji,
      order: Number(form.order) || 0,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editing) {
        await updateDoc(doc(db, 'committee', editing), data);
        toast.success('আপডেট হয়েছে!');
      } else {
        await addDoc(collection(db, 'committee'), { ...data, createdAt: serverTimestamp() });
        toast.success('যোগ করা হয়েছে!');
      }
      setShowForm(false);
      load();
    } catch { toast.error('Failed'); }
  }

  async function handleDelete(m) {
    try {
      await deleteDoc(doc(db, 'committee', m.id));
      toast.success('Delete হয়েছে');
      setConfirm(null);
      load();
    } catch { toast.error('Failed'); }
  }

  const EMOJIS = ['👑','🤝','📋','💰','🏛️','📢','🎭','⚽','🌟','👤','✨','🎓','🔬','🎨','🏅'];

  // committee member এর email দিয়ে user খোঁজা
  function getLinkedUser(email) {
    if (!email) return null;
    return users.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
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
            <p className="text-slate-500 text-sm text-center mb-6">
              <span className="font-medium text-slate-700">{confirm.name}</span> কে committee থেকে সরানো হবে।
            </p>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-slate-800">
                {editing ? 'সম্পাদনা করুন' : 'নতুন সদস্য যোগ করুন'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">আইকন বেছে নিন</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                        ${form.emoji === e ? 'bg-tide-100 ring-2 ring-tide-500' : 'bg-slate-100 hover:bg-slate-200'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">পূর্ণ নাম *</label>
                <input className="input-field" placeholder="যেমন: মোঃ রাফিউল ইসলাম"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">পদবী *</label>
                <input className="input-field" placeholder="যেমন: সভাপতি, সাধারণ সম্পাদক..."
                  value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <label className="label">
                  Email (site এ account থাকলে profile এর সাথে link হবে)
                </label>
                <input className="input-field" placeholder="email@gmail.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                {form.email && (() => {
                  const linked = getLinkedUser(form.email);
                  return linked ? (
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      <Link2 className="w-3.5 h-3.5" />
                      {linked.name} এর account পাওয়া গেছে ✅
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-1.5 px-1">
                      এই email এ কোনো account নেই — তবুও যোগ করা যাবে
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="label">Phone (ঐচ্ছিক)</label>
                <input className="input-field" placeholder="01XXXXXXXXX"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label">ক্রম নম্বর</label>
                <input type="number" className="input-field" placeholder="1"
                  value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
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
          <h1 className="font-display text-3xl font-bold text-slate-800">Committee</h1>
          <p className="text-slate-500 mt-1">Home page এ দেখানো কমিটির তালিকা</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> নতুন যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">কোনো committee member নেই</p>
            <button onClick={openAdd} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> প্রথম সদস্য যোগ করুন
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map(m => {
              const linked = getLinkedUser(m.email);
              const photo  = linked?.photoURL && linked?.photoStatus === 'approved' ? linked.photoURL : null;
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  {/* Avatar */}
                  {photo ? (
                    <img src={photo} alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {m.emoji || '👤'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-slate-800">{m.name}</div>
                      {linked && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <Link2 className="w-3 h-3" /> Linked
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-tide-600 font-medium">{m.role}</div>
                    {m.phone && <div className="text-xs text-slate-400">{m.phone}</div>}
                  </div>
                  <div className="text-xs text-slate-400 w-8 text-center">#{m.order}</div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-tide-600 hover:bg-tide-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirm(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
