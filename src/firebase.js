import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0vaBeig5CbI30hTKvEJUYR_ryCeJZDsM",
  authDomain: "dwiptori-real1.firebaseapp.com",
  projectId: "dwiptori-real1",
  storageBucket: "dwiptori-real1.firebasestorage.app",
  messagingSenderId: "971248530806",
  appId: "1:971248530806:web:763cb7993558bacb1bb657"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
