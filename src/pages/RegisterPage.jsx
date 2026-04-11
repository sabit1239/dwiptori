import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  function update(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())  return toast.error('নাম দিন');
    if (!form.email.trim()) return toast.error('Email দিন');
    if (!form.phone.trim()) return toast.error('Phone নম্বর দিন');
    if (form.password.length < 6) return toast.error('Password কমপক্ষে ৬ অক্ষর হতে হবে');
    if (form.password !== form.confirm) return toast.error('Password মিলছে না');

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      toast.success('Account তৈরি হয়েছে! 🎉');
      navigate('/dashboard');
    } catch(err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('এই email এ আগেই account আছে');
      } else {
        toast.error(err.message);
      }
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-tide-900 via-tide-800 to-tide-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{
                width:  `${(i+1)*150}px`,
                height: `${(i+1)*150}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
              }} />
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" />
          <div>
            <div className="font-display font-bold text-xl text-white">Dwiptori</div>
            <div className="text-tide-300 text-sm">দ্বীপ তরী</div>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            Dwiptori পরিবারে<br/>যোগ দিন!
          </h2>
          <p className="text-tide-300 text-base leading-relaxed">
            সদস্য হয়ে মাসিক চাঁদা, নোটিশ ও সংগঠনের সকল তথ্য সহজেই manage করুন।
          </p>
          <div className="space-y-3 pt-2">
            {[
              '✅ সহজে মাসিক চাঁদা submit করুন',
              '✅ Payment receipt download করুন',
              '✅ সংগঠনের নোটিশ সবার আগে পান',
              '✅ হিসাবের খাতা দেখুন',
            ].map(t => (
              <div key={t} className="text-tide-200 text-sm">{t}</div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-tide-400 text-xs">
            © 2025 Dwiptori — Kutubdia Students Association
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover" />
            <div>
              <div className="font-display font-bold text-xl text-tide-800">Dwiptori</div>
              <div className="text-tide-500 text-sm">দ্বীপ তরী</div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-slate-800 mb-1">Account বানান</h1>
            <p className="text-slate-500">Dwiptori পরিবারে যোগ দিন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">পূর্ণ নাম *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-field pl-10" placeholder="আপনার পূর্ণ নাম"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" className="input-field pl-10" placeholder="apnar-email@gmail.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-field pl-10" placeholder="01XXXXXXXXX"
                  value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={form.password} onChange={e => update('password', e.target.value)} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Password নিশ্চিত করুন *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} className="input-field pl-10"
                  placeholder="আবার password দিন"
                  value={form.confirm} onChange={e => update('confirm', e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base justify-center mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Account তৈরি হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  যোগ দিন <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              আগে থেকেই account আছে?{' '}
              <Link to="/login" className="text-tide-600 font-semibold hover:underline">
                Login করুন
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
