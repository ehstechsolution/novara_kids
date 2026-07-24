// ============================================
// Firebase Config — sem ES modules
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyC-1favCjNraCojHBng__E8hldNI1RTwHk",
  authDomain: "novara-kids.firebaseapp.com",
  projectId: "novara-kids",
  storageBucket: "novara-kids.firebasestorage.app",
  messagingSenderId: "570243486833",
  appId: "1:570243486833:web:feed096155486c5fea37d0"
};

// Firebase SDK via CDN (carregado no HTML antes deste arquivo)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
