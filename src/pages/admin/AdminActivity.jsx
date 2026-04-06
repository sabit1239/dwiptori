import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { Activity, UserPlus, CheckCircle, XCircle, Settings } from 'lucide-react';

const TYPE_META = {
  member_joined: { icon: UserPlus,     color: 'bg-tide-100 text-tide-700',    label: 'New Member' },
  approved:      { icon: CheckCircle,  color: 'bg-green-100 text-green-700',  label: 'Approved' },
  rejected:      { icon: XCircle,      color: 'bg-red-100 text-red-600',      label: 'Rejected' },
  settings:      { icon: Settings,     color: 'bg-slate-100 text-slate-600',  label: 'Settings' },
};

export default function AdminActivity() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-800">Activity Log</h1>
        <p className="text-slate-500 mt-1">সকল admin action ও member join এর ইতিহাস</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">এখনো কোনো activity নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map(log => {
              const meta = TYPE_META[log.type] || TYPE_META.settings;
              const Icon = meta.icon;
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800">{log.message}</div>
                    {log.detail && <div className="text-sm text-slate-500 mt-0.5">{log.detail}</div>}
                    <div className="text-xs text-slate-400 mt-1">
                      {log.createdAt?.toDate ? format(log.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : '—'}
                      {log.adminName && <span className="ml-2">· by {log.adminName}</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
