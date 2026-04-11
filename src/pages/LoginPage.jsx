import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { toast.error('সব তথ্য দিন'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('স্বাগতম! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.code === 'auth/invalid-credential'
        ? 'Email বা password ভুল' : err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-tide-900 via-tide-800 to-tide-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background circles */}
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

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" />
          <div>
            <div className="font-display font-bold text-xl text-white">Dwiptori</div>
            <div className="text-tide-300 text-sm">দ্বীপ তরী</div>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
              দ্বীপের বুকে<br/>প্রদীপ্ত তারুণ্য
            </h2>
            <p className="text-tide-300 text-base leading-relaxed">
              কুতুবদিয়া দ্বীপের শিক্ষার্থীদের সংগঠন — Dwiptori তে স্বাগতম।
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'সদস্য',      value: '🤝' },
              { label: 'স্বচ্ছ হিসাব', value: '📊' },
              { label: 'সহজ payment', value: '💳' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl mb-1">{value}</div>
                <div className="text-tide-200 text-xs font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
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
          <div className="md:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover" />
            <div>
              <div className="font-display font-bold text-xl text-tide-800">Dwiptori</div>
              <div className="text-tide-500 text-sm">দ্বীপ তরী</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-800 mb-1">স্বাগতম! 👋</h1>
            <p className="text-slate-500">আপনার account এ Login করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" className="input-field pl-10"
                  placeholder="apnar-email@gmail.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>Password</span>
                <Link to="/forgot-password"
                  className="text-xs text-tide-600 font-medium hover:underline">
                  Password ভুলে গেছেন?
                </Link>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base justify-center mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Login হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Login করুন <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Account নেই?{' '}
              <Link to="/register" className="text-tide-600 font-semibold hover:underline">
                এখনই যোগ দিন
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
