import { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Wallet, Edit2, Save, X, Camera, Clock, CheckCircle, XCircle } from 'lucide-react';

const CLOUD_NAME = 'dqwhdo2zw';
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

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL:    data.secure_url,
        photoStatus: 'pending',
        photoPublicId: data.public_id,
      });
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
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1">আপনার account details ম্যানেজ করুন</p>
      </div>

      {/* Avatar */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {profile?.photoURL && photoStatus === 'approved' ? (
            <img src={profile.photoURL} alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover shadow-card" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tide-400 to-tide-700
                            flex items-center justify-center text-white text-3xl font-display font-bold shadow-glow">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-tide-600 text-white
                       flex items-center justify-center shadow-md hover:bg-tide-700 transition-colors">
            {uploading ? <span className="text-xs">...</span> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={handlePhotoUpload} />
        </div>
        <div>
          <div className="font-display text-xl font-bold text-slate-800">{profile?.name}</div>
          <div className="text-sm text-slate-500">{profile?.email}</div>
          <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            ${profile?.role === 'admin' ? 'bg-tide-100 text-tide-700' : 'bg-island-100 text-island-700'}`}>
            {profile?.role === 'admin' ? '🛡 Admin' : '👤 Member'}
          </div>
          {photoStatus === 'pending' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3" /> ফটো approval এর অপেক্ষায়
            </div>
          )}
          {photoStatus === 'approved' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3" /> ফটো approved ✅
            </div>
          )}
          {photoStatus === 'rejected' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              <XCircle className="w-3 h-3" /> ফটো rejected — আবার upload করুন
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-island-600">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold text-slate-800">
            ৳{(profile?.totalPaid || 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-500">মোট চাঁদা</div>
        </div>
      </div>

      {/* Details */}
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
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
            </label>
            <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-500 text-sm">
              {profile?.email}
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
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
