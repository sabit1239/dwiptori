import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Wallet, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(profile?.name || '');
  const [phone,   setPhone]   = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: name.trim(), phone: phone.trim() });
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally { setLoading(false); }
  }

  function cancel() {
    setName(profile?.name || '');
    setPhone(profile?.phone || '');
    setEditing(false);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account details</p>
      </div>

      {/* Avatar + name banner */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tide-400 to-tide-700
                        flex items-center justify-center text-white text-2xl font-display font-bold shadow-glow">
          {profile?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-display text-xl font-bold text-slate-800">{profile?.name}</div>
          <div className="text-sm text-slate-500">{profile?.email}</div>
          <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            ${profile?.role === 'admin'
              ? 'bg-tide-100 text-tide-700'
              : 'bg-island-100 text-island-700'}`}>
            {profile?.role === 'admin' ? '🛡 Admin' : '👤 Member'}
          </div>
        </div>
      </div>

      {/* Total contribution */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-island-600">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold text-slate-800">
            ৳{(profile?.totalPaid || 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-500">Total Contribution</div>
        </div>
      </div>

      {/* Editable details */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Account Details</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary py-1.5 px-3 text-sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancel} className="btn-secondary py-1.5 px-3 text-sm">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={loading} className="btn-primary py-1.5 px-3 text-sm">
                <Save className="w-3.5 h-3.5" /> {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
            </label>
            {editing
              ? <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
              : <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-700">{profile?.name}</div>}
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </label>
            <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-500 text-sm">
              {profile?.email} <span className="text-xs ml-1">(cannot be changed)</span>
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
            </label>
            {editing
              ? <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              : <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-700">{profile?.phone || '—'}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
