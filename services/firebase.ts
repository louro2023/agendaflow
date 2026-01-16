import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, push, remove, update, onValue, Unsubscribe } from 'firebase/database';

// ⚠️ IMPORTANTE: Substitua estas configurações pelas suas credenciais do Firebase
// Acesse: https://console.firebase.google.com
// 1. Crie um novo projeto
// 2. Ative Realtime Database
// 3. Copie as credenciais abaixo

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDmxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "agendaflow-xxxxx.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agendaflow-xxxxx",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "agendaflow-xxxxx.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://agendaflow-xxxxx-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, set, push, remove, update, onValue };
export type { Unsubscribe };
