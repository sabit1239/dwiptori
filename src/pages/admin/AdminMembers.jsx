import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Users, Search, Shield, User, Wallet, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminMembers() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState({ field: 'name', dir: 'asc' });
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  async function toggleRole(member) {
    if (member.email === 'sabitshikder12@gmail.com') {
      toast.error('Main admin cannot be demoted!');
      return;
    }
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    try {
      await updateDoc(doc(db, 'users', member.uid), { role: newRole });
      await addDoc(collection(db, 'activityLogs'), {
        type: 'settings',
        message: `${member.name} কে ${newRole === 'admin' ? 'Admin' : 'Member'} করা হয়েছে`,
        detail: `Email: ${member.email}`,
        adminName: profile?.name,
        adminEmail: profile?.email,
        createdAt: serverTimestamp(),
      });
      setMembers(ms => ms.map(m => m.uid === member.uid ? { ...m, role: newRole } : m));
      toast.success(`${member.name} is now ${newRole === 'admin' ? 'an Admin' : 'a Member'}`);
    } catch { toast.error('Failed to update role'); }
  }

  async function deleteUser(member) {
    if (member.email === 'sabitshikder12@gmail.com') {
      toast.error('Main admin cannot be deleted!');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', member.uid));
      await addDoc(collection(db, 'activityLogs'), {
        type: 'deleted',
        message: `${member.name} এর account delete করা হয়েছে`,
        detail: `Email: ${member.email} · Phone: ${member.phone || '—'}`,
        adminName: profile?.name,
        adminEmail: profile?.email,
        createdAt: serverTimestamp(),
      });
      setMembers(ms => ms.filter(m => m.uid !== member.uid));
      toast.success(`${member.name} এর account delete হয়েছে`);
      setConfirm(null);
    } catch { toast.error('Delete failed'); }
  }

  function toggleSort(field) {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' });
  }

  const SortIcon = ({ field }) => sort.field !== field ? null
    : sort.dir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 inline" />
    : <ChevronDown className="w-3.5 h-3.5 inline" />;

  const filtered = members
    .filter(m => [m.name, m.email, m.phone].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const av = a[sort.field] ?? '';
      const bv = b[sort.field] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });

  const totalFunds = members.reduce((s, m) => s + (m.totalPaid || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 text-center mb-1">
              Account Delete করবেন?
            </h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              <span className="font-medium text-slate-700">{confirm.name}</span> এর account permanently delete হবে।
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center py-2">
                Cancel
              </button>
              <button onClick={() => deleteUser(confirm)} className="btn-danger flex-1 justify-center py-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Members</h1>
        <p className="text-slate-500 mt-1">{members.length} জন সদস্য · মোট ৳{totalFunds.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'মোট সদস্য', value: members.length,                             icon: Users,  color: 'bg-tide-600' },
          { label: 'Admin',      value: members.filter(m=>m.role==='admin').length, icon: Shield, color: 'bg-island-600' },
          { label: 'মোট চাঁদা', value: `৳${totalFunds.toLocaleString()}`,          icon: Wallet, color: 'bg-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-4 h-4 text-white" /></div>
            <div>
              <div className="font-display font-bold text-lg text-slate-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" className="input-field pl-10 bg-white shadow-sm"
          placeholder="নাম, email বা phone দিয়ে খুঁজুন..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')} className="cursor-pointer hover:text-slate-800">
                    সদস্য <SortIcon field="name" />
                  </th>
                  <th>Contact</th>
                  <th onClick={() => toggleSort('totalPaid')} className="cursor-pointer hover:text-slate-800">
                    চাঁদা <SortIcon field="totalPaid" />
                  </th>
                  <th>যোগদান</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.uid || m.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {m.photoURL && m.photoStatus === 'approved' ? (
                          <img src={m.photoURL} alt={m.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tide-400 to-tide-600
                                          flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {m.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-800">{m.name}</div>
                          {m.photoStatus === 'pending' && (
                            <div className="text-xs text-yellow-600">📷 ফটো pending</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{m.email}</div>
                      <div className="text-xs text-slate-400">{m.phone || '—'}</div>
                    </td>
                    <td className="font-semibold text-island-700">৳{(m.totalPaid||0).toLocaleString()}</td>
                    <td className="text-sm">
                      {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <span className={m.role === 'admin'
                        ? 'badge-approved'
                        : 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600'}>
                        {m.role === 'admin'
                          ? <><Shield className="w-3 h-3" />Admin</>
                          : <><User className="w-3 h-3" />Member</>}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRole(m)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200
                                     hover:bg-slate-50 text-slate-600 transition-colors">
                          {m.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                        {m.email !== 'sabitshikder12@gmail.com' && (
                          <button onClick={() => setConfirm(m)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-400">কোনো member পাওয়া যায়নি</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
