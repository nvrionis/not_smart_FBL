import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        setTimeout(() => {
            window.location.href = "login.html";  // Redirect if not logged in
        }, 500); // Delay to allow Firebase to check properly
    }
});
