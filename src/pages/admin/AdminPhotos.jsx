import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Camera, Clock } from 'lucide-react';

export default function AdminPhotos() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(all.filter(u => u.photoURL && u.photoStatus === 'pending'));
      } catch(e) {
        toast.error('Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function approve(u) {
    setActing(u.uid);
    try {
      await updateDoc(doc(db, 'users', u.uid), { photoStatus: 'approved' });
      setUsers(us => us.filter(x => x.uid !== u.uid));
      toast.success(`${u.name} এর ফটো approved! ✅`);
    } catch { toast.error('Failed'); }
    setActing(null);
  }

  async function reject(u) {
    setActing(u.uid);
    try {
      await updateDoc(doc(db, 'users', u.uid), { photoStatus: 'rejected', photoURL: null });
      setUsers(us => us.filter(x => x.uid !== u.uid));
      toast.success(`${u.name} এর ফটো rejected`);
    } catch { toast.error('Failed'); }
    setActing(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Photo Approval</h1>
        <p className="text-slate-500 mt-1">Member দের profile photo approve বা reject করুন</p>
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Camera className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">কোনো pending photo নেই ✅</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map(u => (
              <div key={u.uid} className="p-5 flex items-center gap-4">
                <img src={u.photoURL} alt={u.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800">{u.name}</div>
                  <div className="text-sm text-slate-500">{u.email}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
                    <Clock className="w-3 h-3" /> Pending approval
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => approve(u)} disabled={acting === u.uid}
                    className="btn-success py-2 px-3 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {acting === u.uid ? '...' : 'Approve'}
                  </button>
                  <button onClick={() => reject(u)} disabled={acting === u.uid}
                    className="btn-danger py-2 px-3 text-sm">
                    <XCircle className="w-4 h-4" />
                    {acting === u.uid ? '...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
