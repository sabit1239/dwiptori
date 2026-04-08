import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSubmit() {
    if (!email.trim()) return toast.error('Email দিন');
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const q = query(
        collection(db, 'passwordResets'),
        where('email', '==', email.toLowerCase()),
        where('createdAt', '>=', today)
      );
      const snap = await getDocs(q);
      if (snap.size >= 2) {
        toast.error('আজকের জন্য limit শেষ! কাল আবার চেষ্টা করুন।');
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      await addDoc(collection(db, 'passwordResets'), {
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        toast.error('এই email এ কোনো account নেই');
      } else {
        toast.error('কিছু সমস্যা হয়েছে, আবার চেষ্টা করুন');
      }
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tide-50 to-slate-100 flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">Email পাঠানো হয়েছে!</h2>
          <p className="text-slate-500 mb-2">
            <span className="font-medium text-slate-700">{email}</span> এ password reset link পাঠানো হয়েছে।
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Email না পেলে Spam folder চেক করুন।
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Login এ ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tide-50 to-slate-100 flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md animate-fade-in">
        <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-tide-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Login এ ফিরে যান
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-tide-100 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-tide-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">Password ভুলে গেছেন?</h1>
        <p className="text-slate-500 text-sm mb-6">
          আপনার email দিন — reset link পাঠানো হবে। দিনে সর্বোচ্চ ২বার।
        </p>
        <div className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="apnar-email@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'পাঠানো হচ্ছে...' : 'Reset Link পাঠান'}
          </button>
        </div>
      </div>
    </div>
  );
}
