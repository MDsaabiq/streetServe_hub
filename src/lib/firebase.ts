import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDk4r52V7lSBSbV38bsCg8yXIMVwIYlcbU",
  authDomain: "golgappa-3dbb8.firebaseapp.com",
  projectId: "golgappa-3dbb8",
  storageBucket: "golgappa-3dbb8.firebasestorage.app",
  messagingSenderId: "469558741202",
  appId: "1:469558741202:web:e626a6b3bdba1df76c850b",
  measurementId: "G-FYZB3DSD54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;