// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  orderBy,
  updateDoc 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAu9wfWgBwfPUB3-qFECrQxckNDwCdkKA",
  authDomain: "gegel-glit-glam.firebaseapp.com",
  projectId: "gegel-glit-glam",
  storageBucket: "gegel-glit-glam.firebasestorage.app",
  messagingSenderId: "105374344569",
  appId: "1:105374344569:web:0ce7b1c9d5f2050eed7ba8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, updateDoc };