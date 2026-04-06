import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

const ADMIN_EMAILS = [
  'sabitshikder12@gmail.com',
];

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function register({ name, email, phone, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const userDoc = {
      uid: cred.user.uid,
      name, email, phone,
      role: isAdmin ? 'admin' : 'member',
      totalPaid: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    await addDoc(collection(db, 'activityLogs'), {
      type: 'member_joined',
      message: `${name} নতুন member হিসেবে যোগ দিয়েছেন`,
      detail: `Email: ${email} · Phone: ${phone}`,
      createdAt: serverTimestamp(),
    });
    setProfile(userDoc);
    return cred;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) setProfile(snap.data());
    return cred;
  }

  function logout() {
    setProfile(null);
    return signOut(auth);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
