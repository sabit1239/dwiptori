import { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Key, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CodeVerification({ onVerified }) {
  const { profile, user } = useAuth();
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!code.trim()) return toast.error('Code দিন');

    setLoading(true);
    try {
      const snap = await getDocs(query(
        collection(db, 'memberCodes'),
        where('code', '==', code.trim().toUpperCase()),
        where('status', '==', 'active'),
      ));

      if (snap.empty) {
        toast.error('Code টি invalid বা already use হয়েছে!');
        setLoading(false);
        return;
      }

      const codeDoc = snap.docs[0];

      // Code already used by someone else
      if (codeDoc.data().usedBy && codeDoc.data().usedBy !== user.uid) {
        toast.error('এই code টি অন্য কেউ ব্যবহার করেছে!');
        setLoading(false);
        return;
      }

      // Mark code as used
      await updateDoc(doc(db, 'memberCodes', codeDoc.id), {
        usedBy:    user.uid,
        usedByName: profile?.name,
        usedAt:    new Date(),
      });

      // Save code to user profile
      await updateDoc(doc(db, 'users', user.uid), {
        memberCode:   code.trim().toUpperCase(),
        codeVerified: true,
      });

      toast.success('✅ Code verified! স্বাগতম Dwiptori পরিবারে!');
      onVerified();
    } catch(e) {
      toast.error('Error: ' + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tide-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-tide-600 to-tide-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Key className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">Member Verification</h1>
          <p className="text-slate-500">আপনার offline form এ দেওয়া code টা দিন</p>
        </div>

        <div className="glass-card p-6 space-y-5">
          <div className="bg-tide-50 border border-tide-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-tide-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-tide-700">
                <div className="font-semibold mb-1">এটা একবারই করতে হবে</div>
                <div className="text-tide-600 text-xs leading-relaxed">
                  আপনার form এ যে code দেওয়া হয়েছে সেটা একবার দিলে আর কখনো চাইবে না। এই code টাই আপনার Member ID হবে।
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Member Code</label>
            <input
              className="input-field font-mono text-center text-xl tracking-widest uppercase"
              placeholder="DWT-2025-001"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
          </div>

          <button onClick={handleVerify} disabled={loading}
            className="btn-primary w-full py-3.5 text-base justify-center">
            {loading ? (
              'Verifying...'
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Verify করুন <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Code না পেয়ে থাকলে Admin এর সাথে যোগাযোগ করুন
        </p>
      </div>
    </div>
  );
}
