import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "my_squad.html"; // Redirect on success
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Invalid email or password.";
        errorMessage.style.display = "block"; // Show error message
    }
});
