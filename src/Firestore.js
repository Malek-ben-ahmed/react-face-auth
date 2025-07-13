// Firestore.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ ajoute ça


const firebaseConfig = {
  apiKey: "AIzaSyAkWl5YTg3QmUQNUgzgnm0SCwk5ThBd6tA",
  authDomain: "reconaissance-facialeproject.firebaseapp.com",
  projectId: "reconaissance-facialeproject",
  storageBucket: "reconaissance-facialeproject.firebasestorage.app",
  messagingSenderId: "475505105309",
  appId: "1:475505105309:web:9783737e7f805396377774",
  measurementId: "G-WGR4ZR85BG"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);


const db = getFirestore(app);



export default db; // 
