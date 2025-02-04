import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Toggle Menu
document.getElementById("menu-btn").addEventListener("click", () => {
    document.getElementById("menu").classList.toggle("open");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html"; // Redirect to login page
});
