import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Waves, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password)
      return toast.error('All fields are required');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm)
      return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Dwiptori 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use'
        ? 'Email already registered' : err.message);
    } finally { setLoading(false); }
  }

  const fields = [
    { field:'name',     label:'Full Name',    icon:User,  type:'text',     ph:'Md. Rahim Uddin' },
    { field:'email',    label:'Email',         icon:Mail,  type:'email',    ph:'you@example.com' },
    { field:'phone',    label:'Phone Number',  icon:Phone, type:'tel',      ph:'01XXXXXXXXX' },
    { field:'password', label:'Password',      icon:Lock,  type:'password', ph:'Min. 6 characters' },
    { field:'confirm',  label:'Confirm Password', icon:Lock, type:'password', ph:'Repeat password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-tide-50">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-tide-600 flex items-center justify-center">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-tide-800">Dwiptori</span>
        </div>

        <div className="glass-card p-8">
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">Create Account</h1>
          <p className="text-slate-500 text-sm mb-6">Join the Dwiptori community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ field, label, icon: Icon, type, ph }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={type === 'password' ? (showPwd ? 'text' : 'password') : type}
                    className="input-field pl-10"
                    placeholder={ph}
                    value={form[field]}
                    onChange={update(field)}
                  />
                  {field === 'password' && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-tide-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
