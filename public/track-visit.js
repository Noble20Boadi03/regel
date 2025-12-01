// Track page visits in Firestore
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAu9wfWgBwfPUB3-qFECrQxckNDwCdkKA",
  authDomain: "gegel-glit-glam.firebaseapp.com",
  projectId: "gegel-glit-glam",
  storageBucket: "gegel-glit-glam.firebasestorage.app",
  messagingSenderId: "105374344569",
  appId: "1:105374344569:web:0ce7b1c9d5f2050eed7ba8"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Track page visit
async function trackPageVisit() {
  try {
    const visitData = {
      page: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer || 'Direct',
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
    
    await addDoc(collection(db, 'site_visits'), visitData);
    console.log('Page visit tracked successfully');
  } catch (error) {
    // Silently fail - don't block page functionality
    console.warn('Visit tracking skipped:', error.message);
  }
}

// Track visit when page loads with a small delay to avoid blocking
setTimeout(() => {
  trackPageVisit();
}, 1000);
