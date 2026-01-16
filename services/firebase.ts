import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, push, remove, update, onValue, Unsubscribe } from 'firebase/database';

// ⚠️ IMPORTANTE: Substitua estas configurações pelas suas credenciais do Firebase
// Acesse: https://console.firebase.google.com
// 1. Crie um novo projeto
// 2. Ative Realtime Database
// 3. Copie as credenciais abaixo

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBxFCKVNNv8ITRBxQZlXs-8D0jOqsY2QpA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "agendaflow-bcf63.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agendaflow-bcf63",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "agendaflow-bcf63.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "436794882324",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://agendaflow-bcf63-default-rtdb.firebaseio.com",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:436794882324:web:dba43233cc778f3e69aa01",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, set, push, remove, update, onValue };
export type { Unsubscribe };
