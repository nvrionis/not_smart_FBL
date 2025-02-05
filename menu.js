document.addEventListener("DOMContentLoaded", () => {
    console.log("menu.js loaded, attempting to fetch menu.html...");

    fetch("menu.html")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        console.log("menu.html successfully fetched!");
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = html;

        // Insert the menu at the very top of the body
        document.body.prepend(tempContainer.firstElementChild);
  
        // Ensure logout button works after inserting the menu
        addLogoutFunctionality();
        addBurgerMenuFunctionality();
      })
      .catch(error => console.error("Error fetching menu.html:", error));
  
    function addLogoutFunctionality() {
        document.addEventListener("click", (event) => {
            if (event.target.id === "logout") {
                window.location.href = "login.html"; // Redirect on logout
            }
        });
    }

    function addBurgerMenuFunctionality() {
        console.log("Initializing burger menu...");
        const burgerMenu = document.getElementById("burgerMenu");
        const navLinks = document.getElementById("navLinks");

        if (burgerMenu && navLinks) {
            burgerMenu.addEventListener("click", () => {
                console.log("Burger menu clicked!");
                navLinks.classList.toggle("show");
            });
        } else {
            console.error("Burger menu elements not found!");
        }
    }
});
