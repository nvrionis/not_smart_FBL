// my_squad.js
import { auth, db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// -------------- Global Variables & DOM Elements --------------
const budgetLimit = 48;
let budget = budgetLimit;
let picks = 0;
const maxPicks = 5;
let pairs = [];  // Array to store pair objects loaded from Firestore

const budgetEl = document.getElementById("budget");
const picksEl = document.getElementById("picks");
const grid = document.getElementById("playerGrid");
const submitBtn = document.getElementById("submitButton");
const resetBtn = document.getElementById("resetButton");
const logoutBtn = document.getElementById("logoutButton");
const warningEl = document.getElementById("warning");
const modal = document.getElementById("infoModal");
const modalContent = document.getElementById("modalContent");

// -------------- Check for Logged-In User --------------
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// -------------- Firebase: Load Pairs Data --------------
async function loadPairs() {
  try {
    const pairsCollection = collection(db, "pairs");
    const snapshot = await getDocs(pairsCollection);
    pairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    pairs.forEach(pair => {
      pair.price = Number(pair.price);
    });
    assignExpectedRankRanges();
    populateGrid();
    updateBudgetUI();
  } catch (error) {
    console.error("Error loading pairs:", error);
  }
}

function sortPairs(selected, available, disabled) {
    // Ensure price sorting works correctly with Firestore data
    const sortByPrice = (a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
  
    // Sort pairs by price in descending order
    selected.sort(sortByPrice);
    available.sort(sortByPrice);
    disabled.sort(sortByPrice);
  
    // Clear the grid and re-append sorted pairs
    grid.innerHTML = "";
    [...selected, ...available, ...disabled].forEach((cell) => grid.appendChild(cell));
  }  

function updatePairAvailability() {
    let selectedPairs = [];
    let availablePairs = [];
    let disabledPairs = [];
  
    // Get the lowest price from Firestore-based pairs
    const minPrice = Math.min(...pairs.map((p) => parseFloat(p.price)));
  
    // Calculate remaining picks and budget threshold
    const remainingPicks = maxPicks - picks;
    const threshold = budget - (minPrice * (remainingPicks - 1));
  
    // Update pair availability based on Firestore data
    document.querySelectorAll(".pair").forEach((cell) => {
      const price = parseFloat(cell.dataset.price);
      
      if (cell.classList.contains("selected")) {
        selectedPairs.push(cell);
      } else if (price > threshold) {
        cell.classList.add("disabled");
        disabledPairs.push(cell);
      } else {
        cell.classList.remove("disabled");
        availablePairs.push(cell);
      }
    });
  
    // Sort pairs visually based on availability & selection
    sortPairs(selectedPairs, availablePairs, disabledPairs);
  }  

function getSuitIcon(price) {
  if (price >= 13) return "♠";
  if (price >= 10) return "♥";
  if (price >= 7) return "♦";
  return "♣";
}

function assignExpectedRankRanges() {
  let sortedPairs = [...pairs].sort((a, b) => b.price - a.price);
  const groups = {};
  sortedPairs.forEach(pair => {
    const p = pair.price;
    if (!groups[p]) groups[p] = [];
    groups[p].push(pair);
  });
  const sortedPrices = Object.keys(groups).sort((a, b) => b - a);
  let currentRank = 1;
  sortedPrices.forEach(price => {
    const group = groups[price];
    const count = group.length;
    group.forEach(pair => {
      pair.expectedMin = currentRank;
      pair.expectedMax = currentRank + count - 1;
    });
    currentRank += count;
  });
}

function getRankColor(actual, expectedMin, expectedMax) {
  const actualRank = parseInt(actual, 10);
  if (actualRank < expectedMin) return "green";
  if (actualRank > expectedMax) return "red";
  return "orange";
}

function updateBudgetColor() {
    const minPrice = Math.min(...pairs.map(p => p.price));
    const remainingPicks = maxPicks - picks;
    const availableValue = budget - ((remainingPicks - 1) * minPrice);

    let color = "#208bc9"; // Default (blue)
    let bgColor = "rgba(32, 139, 201, 0.2)"; // Default background

    if (availableValue >= 10 && availableValue <= 12) {
        color = "#1cad4f"; // Green
        bgColor = "rgba(28, 173, 79, 0.2)";
    } else if (availableValue >= 7 && availableValue <= 9) {
        color = "#c28825"; // Orange
        bgColor = "rgba(194, 136, 37, 0.2)";
    } else if (availableValue < 7) {
        color = "#cf3d11"; // Red
        bgColor = "rgba(207, 61, 17, 0.2)";
    }

    budgetEl.style.color = color;
    budgetEl.style.backgroundColor = bgColor;
    budgetEl.style.borderRadius = "8px";
    budgetEl.style.padding = "5px 10px";
}

function updatePicksColor() {
    let percentage = (picks / maxPicks) * 100;
    let color = "#1cad4f"; // Green when starting

    if (percentage >= 60) {
        color = "#c28825"; // Orange (getting close)
    }
    if (percentage >= 80) {
        color = "#cf3d11"; // Red (almost full)
    }

    picksEl.style.color = color;
    picksEl.style.fontWeight = "bold";
    picksEl.style.transition = "color 0.3s ease-in-out";
}

function updateBudgetUI() {
    updatePairAvailability();
    toggleSubmitButton();
    budgetEl.textContent = budget;
    picksEl.textContent = picks;
    updateBudgetColor();  // Add this
    updatePicksColor();   // Add this
}


function toggleSubmitButton() {
  submitBtn.disabled = picks < maxPicks;
}

function populateGrid() {
    const grid = document.getElementById("playerGrid"); // Target the correct element
    grid.innerHTML = ""; // Clear grid before populating

    pairs.forEach((pair, index) => {
        const cell = document.createElement("div");
        cell.classList.add("pair");
        cell.dataset.index = index;
        cell.dataset.price = pair.price;

        // Choose which name to show first (shorter one first)
        const name1 = pair.player_1;
        const name2 = pair.player_2;
        const [firstName, secondName] =
            name1.length <= name2.length ? [name1, name2] : [name2, name1];

        // Ranking tag
        let rankHTML = "";
        if (pair.total_rank && pair.total_rank !== "placeholder") {
            const rankColor = getRankColor(pair.total_rank, pair.expectedMin, pair.expectedMax);
            rankHTML = `<div class="ranking-tag" style="background-color: ${rankColor}; color: white;">
                          ${pair.total_rank}
                        </div>`;
        }

        // Set card HTML
        cell.innerHTML = `
            <div class="suit-icon">${getSuitIcon(pair.price)}</div>
            <div class="pair-info">
                <div class="pair-names">
                    <strong>${firstName}</strong><br>
                    <strong>${secondName}</strong>
                </div>
            </div>
            <div class="price-tag">${pair.price}cr</div>
            <div class="info-icon">i</div>
            ${rankHTML}
        `;

        // Selection Event
        cell.addEventListener("click", () => toggleSelection(cell, pair));

        // Info Button
        const infoIcon = cell.querySelector(".info-icon");
        infoIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            showPairInfo(index);
        });
        
        

        grid.appendChild(cell);
    });

    updatePairAvailability();
}
 
function showPairInfo(index) {
    if (index < 0 || index >= pairs.length) {
        console.error("Invalid pair index:", index);
        return;
    }

    const pair = pairs[index];

    // Create an array of only fields that exist (not N/A)
    let contentHTML = "";

    if (pair.preliminaries_club) {
        contentHTML += `<p><strong>Preliminaries Club:</strong> ${pair.preliminaries_club}</p>`;
    }
    if (pair.preliminaries_score) {
        contentHTML += `<p><strong>Preliminaries Score:</strong> ${pair.preliminaries_score}</p>`;
    }
    if (pair.day_1_rank) {
        contentHTML += `<p><strong>Day 1:</strong> ${pair.day_1_score}</p>`;
    }
    if (pair.day_2_rank) {
        contentHTML += `<p><strong>Day 2:</strong> ${pair.day_2_score}</p>`;
    }
    if (pair.day_3_rank) {
        contentHTML += `<p><strong>Day 3:</strong> ${pair.day_3_score}</p>`;
    }

    // If all fields are empty, show a message
    if (!contentHTML) {
        contentHTML = `<p><em>No additional information available.</em></p>`;
    }

    modalContent.innerHTML = contentHTML;
    modal.style.display = "flex";
    document.body.classList.add("modal-open"); // Prevent background scroll
}

// Close modal when clicking outside
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal when pressing Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// Close modal when clicking the close button
document.getElementById("modalClose").addEventListener("click", closeModal);

function closeModal() {
    modal.style.display = "none";
    document.body.classList.remove("modal-open"); // Re-enable background scrolling
} 

function toggleSelection(cell, pair) {
  if (cell.classList.contains("disabled")) return;
  if (cell.classList.contains("selected")) {
    cell.classList.remove("selected");
    budget += pair.price;
    picks--;
  } else {
    if (budget < pair.price || picks >= maxPicks) return;
    cell.classList.add("selected");
    budget -= pair.price;
    picks++;
  }
  updateBudgetUI();
}

function resetSelection() {
    document.querySelectorAll(".pair").forEach(cell => {
      cell.classList.remove("selected", "disabled");
    });
  
    budget = budgetLimit;
    picks = 0;
    updateBudgetUI();
  
    // Smoothly scroll to the top
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function submitSelection() {
      if (picks !== maxPicks) {
          alert("Please select exactly 5 pairs before submitting.");
          return;
      }
  
      const user = auth.currentUser;
      if (!user) {
          alert("No user is logged in.");
          return;
      }
  
      const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
      const selectedPairs = document.querySelectorAll(".pair.selected");
  
      // Convert selected pairs into Firestore references
      const squadRefs = Array.from(selectedPairs).map(cell => {
          const pairIndex = parseInt(cell.dataset.index, 10);
          return doc(db, "pairs", pairs[pairIndex].id); // Reference to the pair document
      });
  
      try {
          // Overwrite the squad array in Firestore
          await updateDoc(userDocRef, { squad: squadRefs });
  
          alert("Your squad has been saved!");
          resetSelection();
      } catch (error) {
          console.error("Error saving squad:", error);
          alert("Failed to save your squad. Please try again.");
      }
  }
  

submitBtn.addEventListener("click", submitSelection);
resetBtn.addEventListener("click", resetSelection);
//logoutBtn.addEventListener("click", () => signOut(auth).then(() => window.location.href = "login.html"));

loadPairs();

function adjustStickyBehavior() {
    const stickyHeader = document.querySelector(".sticky-header");
    const scrollableContainer = document.querySelector(".scrollable-container");

    if (stickyHeader && scrollableContainer) {
        const headerHeight = stickyHeader.offsetHeight;
        scrollableContainer.style.top = `${headerHeight + 10}px`; // Prevent overlap
    }
}

// Adjust when page loads & resizes
window.addEventListener("DOMContentLoaded", adjustStickyBehavior);
window.addEventListener("resize", adjustStickyBehavior);

