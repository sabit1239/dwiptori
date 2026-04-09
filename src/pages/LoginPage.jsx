import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Waves, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.code === 'auth/invalid-credential'
        ? 'Invalid email or password' : err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-tide-700 via-tide-600 to-island-600
                      flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{
                width: `${(i+1)*120}px`, height: `${(i+1)*120}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
              }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-white">Dwiptori</div>
              <div className="text-white/70 font-bengali text-sm">দ্বীপ তরী</div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Together we<br />build our island.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Track monthly contributions, manage payments, and keep the community's finances transparent.
          </p>
        </div>
        <div className="relative z-10 flex gap-6">
          {[['Secure', 'Firebase Auth'], ['Transparent', 'Live Tracking'], ['Simple', 'Easy Payments']].map(([t, s]) => (
            <div key={t}>
              <div className="text-white font-semibold text-sm">{t}</div>
              <div className="text-white/60 text-xs">{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-tide-600 flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-tide-800">Dwiptori</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-800 mb-1">Sign in</h1>
          <p className="text-slate-500 mb-8">Access your Dwiptori account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" className="input-field pl-10"
                  placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label flex justify-between">
                <span>Password</span>
                <Link to="/forgot-password"
                  className="text-xs text-tide-600 font-medium hover:underline">
                  Password ভুলে গেছেন?
                </Link>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-tide-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
