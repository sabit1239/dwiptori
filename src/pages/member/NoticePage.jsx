import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { Bell, Pin } from 'lucide-react';

const TYPES = [
  { key: 'general',  label: 'সাধারণ',  color: 'bg-slate-100 text-slate-600' },
  { key: 'urgent',   label: 'জরুরি',   color: 'bg-red-100 text-red-600' },
  { key: 'meeting',  label: 'মিটিং',   color: 'bg-blue-100 text-blue-600' },
  { key: 'payment',  label: 'চাঁদা',   color: 'bg-green-100 text-green-600' },
  { key: 'event',    label: 'ইভেন্ট',  color: 'bg-purple-100 text-purple-600' },
];

export default function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    getDocs(collection(db, 'notices')).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });
      setNotices(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? notices : notices.filter(n => n.type === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Notice Board</h1>
        <p className="text-slate-500 mt-1">সংগঠনের সকল নোটিশ ও ঘোষণা</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${filter === 'all' ? 'bg-tide-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          সব
        </button>
        {TYPES.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${filter === t.key ? 'bg-tide-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">কোনো নোটিশ নেই</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(n => {
            const typeMeta = TYPES.find(t => t.key === n.type) || TYPES[0];
            return (
              <div key={n.id}
                className={`glass-card p-5 ${n.pinned ? 'border-2 border-tide-200' : ''} ${n.type === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {n.pinned && (
                    <span className="text-xs font-medium text-tide-600 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeMeta.color}`}>
                    {typeMeta.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {n.createdAt?.toDate ? format(n.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : '—'}
                  </span>
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{n.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{n.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
