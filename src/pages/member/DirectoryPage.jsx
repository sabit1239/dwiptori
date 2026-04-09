import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Search, Phone, Mail, Shield, User, Lock } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function DirectoryPage() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500">এই পেজটি শুধুমাত্র Admin দের জন্য।</p>
      </div>
    );
  }

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(all.sort((a, b) => a.name?.localeCompare(b.name)));
      setLoading(false);
    })();
  }, []);

  const filtered = members.filter(m =>
    [m.name, m.email, m.phone, m.role].some(v =>
      v?.toLowerCase().includes(search.toLowerCase()))
  );

  const admins  = filtered.filter(m => m.role === 'admin');
  const regular = filtered.filter(m => m.role !== 'admin');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Member Directory</h1>
        <p className="text-slate-500 mt-1">Dwiptori এর সকল সদস্য</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-display font-bold text-tide-700">{members.length}</div>
          <div className="text-sm text-slate-500">মোট সদস্য</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-display font-bold text-island-700">
            {members.filter(m => m.role === 'admin').length}
          </div>
          <div className="text-sm text-slate-500">Admin</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" className="input-field pl-10"
          placeholder="নাম বা phone দিয়ে খুঁজুন..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          {admins.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-tide-600" />
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">পরিচালনা কমিটি</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admins.map(m => <MemberCard key={m.uid || m.id} member={m} isAdmin />)}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">সদস্যবৃন্দ</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {regular.map(m => <MemberCard key={m.uid || m.id} member={m} />)}
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-500">কোনো সদস্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member: m, isAdmin }) {
  return (
    <div className={`glass-card p-5 flex items-center gap-4 transition-all hover:shadow-glow
      ${isAdmin ? 'border-tide-200 border' : ''}`}>
      {m.photoURL && m.photoStatus === 'approved' ? (
        <img src={m.photoURL} alt={m.name}
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2 border-white shadow-md" />
      ) : (
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white
                         text-xl font-display font-bold flex-shrink-0 shadow-md
                         ${isAdmin
                           ? 'bg-gradient-to-br from-tide-500 to-tide-700'
                           : 'bg-gradient-to-br from-slate-400 to-slate-600'}`}>
          {m.name?.[0]?.toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-slate-800 truncate">{m.name}</div>
          {isAdmin && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             text-xs font-medium bg-tide-100 text-tide-700">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>
        {m.phone && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <Phone className="w-3.5 h-3.5" />
            <a href={`tel:${m.phone}`} className="hover:text-tide-600 transition-colors">
              {m.phone}
            </a>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
          <Mail className="w-3 h-3" />
          <span className="truncate">{m.email}</span>
        </div>
      </div>
    </div>
  );
}
