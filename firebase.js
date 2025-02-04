import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Replace with your Firebase project details
const firebaseConfig = {
    apiKey: "AIzaSyAAwtiJ4IVajjZPb7bRquAqYW_BuYmWYtA",
    authDomain: "bridgefantasy-a4029.firebaseapp.com",
    projectId: "bridgefantasy-a4029",
    storageBucket: "bridgefantasy-a4029.firebasestorage.app",
    messagingSenderId: "498498831907",
    appId: "1:498498831907:web:3cbbde4ca573df2d0e5396"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
