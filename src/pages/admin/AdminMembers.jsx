import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Users, Search, Shield, User, Wallet, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState({ field: 'name', dir: 'asc' });

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  async function toggleRole(member) {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    try {
      await updateDoc(doc(db, 'users', member.uid), { role: newRole });
      setMembers(ms => ms.map(m => m.uid === member.uid ? { ...m, role: newRole } : m));
      toast.success(`${member.name} is now ${newRole === 'admin' ? 'an Admin' : 'a Member'}`);
    } catch { toast.error('Failed to update role'); }
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
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });

  const totalFunds = members.reduce((s, m) => s + (m.totalPaid || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Members</h1>
          <p className="text-slate-500 mt-1">{members.length} registered members · ৳{totalFunds.toLocaleString()} total collected</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, icon: Users, color: 'bg-tide-600' },
          { label: 'Admins',        value: members.filter(m=>m.role==='admin').length, icon: Shield, color: 'bg-island-600' },
          { label: 'Total Collected', value: `৳${totalFunds.toLocaleString()}`, icon: Wallet, color: 'bg-sand-500' },
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" className="input-field pl-10 bg-white shadow-sm"
          placeholder="Search by name, email, or phone…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading members…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')} className="cursor-pointer hover:text-slate-800">
                    Name <SortIcon field="name" />
                  </th>
                  <th>Contact</th>
                  <th onClick={() => toggleSort('totalPaid')} className="cursor-pointer hover:text-slate-800">
                    Contributed <SortIcon field="totalPaid" />
                  </th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.uid || m.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tide-400 to-tide-600
                                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="font-medium text-slate-800">{m.name}</div>
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
                        ? 'badge-approved' : 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600'}>
                        {m.role === 'admin' ? <><Shield className="w-3 h-3" />Admin</> : <><User className="w-3 h-3" />Member</>}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => toggleRole(m)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200
                                   hover:bg-slate-50 text-slate-600 transition-colors">
                        {m.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-400">No members match your search</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
