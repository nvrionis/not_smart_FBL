import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "my_squad.html";  // Redirect if logged in
    } else {
        document.getElementById("startBtn").addEventListener("click", () => {
            window.location.href = "login.html"; // Send to login if not logged in
        });
    }
});
