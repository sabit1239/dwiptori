// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0vaBeig5CbI30hTKvEJUYR_ryCeJZDsM",
  authDomain: "dwiptori-real1.firebaseapp.com",
  projectId: "dwiptori-real1",
  storageBucket: "dwiptori-real1.firebasestorage.app",
  messagingSenderId: "971248530806",
  appId: "1:971248530806:web:7a10573b3e990d4c1bb657",
  measurementId: "G-K9395M74NP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
