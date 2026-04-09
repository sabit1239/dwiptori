import { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Wallet, Edit2, Save, X, Camera, Clock, CheckCircle, XCircle, Shield, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLOUD_NAME   = 'dqwhdo2zw';
const UPLOAD_PRESET = 'dwiptori_profiles';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [editing,   setEditing]   = useState(false);
  const [name,      setName]      = useState(profile?.name || '');
  const [phone,     setPhone]     = useState(profile?.phone || '');
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleSave() {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: name.trim(), phone: phone.trim() });
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update');
    } finally { setLoading(false); }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('ফটো ৫MB এর বেশি হওয়া যাবে না');
    if (!file.type.startsWith('image/')) return toast.error('শুধু image file দিন');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'dwiptori_profiles');
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: data.secure_url, photoStatus: 'pending', photoPublicId: data.public_id });
      toast.success('ফটো upload হয়েছে! Admin approval এর অপেক্ষায়।');
    } catch(e) {
      toast.error('Upload failed: ' + e.message);
    } finally { setUploading(false); }
  }

  function cancel() {
    setName(profile?.name || '');
    setPhone(profile?.phone || '');
    setEditing(false);
  }

  const photoStatus = profile?.photoStatus;

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-fade-in">

      {/* Profile Hero Card */}
      <div className="bg-gradient-to-br from-tide-700 to-tide-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {profile?.photoURL && photoStatus === 'approved' ? (
              <img src={profile.photoURL} alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-display font-bold shadow-lg">
                {profile?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-tide-700 flex items-center justify-center shadow-md hover:bg-tide-50 transition-colors">
              {uploading ? <span className="text-xs animate-spin">↻</span> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold truncate">{profile?.name}</h1>
            <p className="text-tide-300 text-sm truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium
                ${profile?.role === 'admin' ? 'bg-white/20 text-white' : 'bg-white/10 text-tide-200'}`}>
                {profile?.role === 'admin' ? <><Shield className="w-3 h-3" /> Admin</> : <><User className="w-3 h-3" /> Member</>}
              </span>
              {photoStatus === 'pending' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-200">
                  <Clock className="w-3 h-3" /> ফটো pending
                </span>
              )}
              {photoStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-200">
                  <CheckCircle className="w-3 h-3" /> ফটো approved
                </span>
              )}
              {photoStatus === 'rejected' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-200">
                  <XCircle className="w-3 h-3" /> ফটো rejected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-island-600">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-xl text-slate-800">৳{(profile?.totalPaid || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500">মোট চাঁদা</div>
          </div>
        </div>
        <Link to="/receipts" className="glass-card p-4 flex items-center gap-3 hover:shadow-glow transition-all">
          <div className="p-2.5 rounded-xl bg-tide-600">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-xl text-slate-800">Receipts</div>
            <div className="text-xs text-slate-500">দেখুন →</div>
          </div>
        </Link>
      </div>

      {/* Account Details */}
      <div className="glass-card p-5 space-y-4">
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

        <div className="space-y-3">
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
            </label>
            {editing
              ? <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
              : <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-700 text-sm">{profile?.name}</div>}
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
            </label>
            <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-500 text-sm">{profile?.email}</div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
            </label>
            {editing
              ? <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              : <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-700 text-sm">{profile?.phone || '—'}</div>}
          </div>
        </div>
      </div>

      {/* Photo hint */}
      {(!profile?.photoURL || photoStatus === 'rejected') && (
        <div className="glass-card p-4 flex items-center gap-3 border border-dashed border-tide-200">
          <Camera className="w-8 h-8 text-tide-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-slate-700">Profile ছবি যোগ করুন</div>
            <div className="text-xs text-slate-500">উপরে ক্যামেরা আইকন চাপুন · Admin approve করলে দেখাবে</div>
          </div>
        </div>
      )}
    </div>
  );
}
