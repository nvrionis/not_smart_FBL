// script.js

// Global Variables
const budgetLimit = 48;
let budget = budgetLimit;
let picks = 0;
const maxPicks = 5;
let pairs = []; // This will be loaded from pairs.json

// DOM Elements
const budgetEl = document.getElementById("budget");
const picksEl = document.getElementById("picks");
const warningEl = document.getElementById("warning");
const grid = document.getElementById("playerGrid");
const submitBtn = document.getElementById("submitButton");
const darkModeToggle = document.getElementById("darkModeToggle");

function loadPairs() {
    fetch("pairs.json")
      .then((response) => response.json())
      .then((data) => {
        pairs = data;
        assignExpectedRankRanges(); // Compute expected rank ranges per price group.
        populateGrid();
        updateBudgetUI();
      })
      .catch((error) => console.error("Error loading pairs:", error));
  }
  

document.addEventListener("DOMContentLoaded", loadPairs);

// Returns a suit emoji based on the pair's price
function getSuitIcon(price) {
    let icon;
    if (price >= 13) {
      icon = "♠";  // Spades for highest-priced pairs
    } else if (price >= 10) {
      icon = "♥";  // Hearts for slightly lower-priced pairs
    } else if (price >= 7) {
      icon = "♦";  // Diamonds for mid-priced pairs
    } else {
      icon = "♣";  // Clubs for the lowest-priced pairs
    }
    console.log("Price:", price, "Icon:", icon);
    return icon;
  }
  
// Compute the median of an array of numbers
function median(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }
  
// Compute expected rank ranges for each pair based on price groups.
// For each unique price (sorted descending), assign a range [minExpected, maxExpected]
// where, for example, if one pair has price 15 then its expected range is [1,1],
// if two pairs have price 14 then the expected range is [2,3], etc.
function assignExpectedRankRanges() {
    // Create a copy of pairs sorted by price descending.
    let sortedPairs = [...pairs].sort((a, b) => b.price - a.price);
  
    // Group pairs by price.
    const groups = {};
    sortedPairs.forEach(pair => {
      const price = pair.price;
      if (!groups[price]) {
        groups[price] = [];
      }
      groups[price].push(pair);
    });
  
    // Process groups in descending order of price.
    const sortedPrices = Object.keys(groups).sort((a, b) => b - a);
    let currentRank = 1;
    sortedPrices.forEach(price => {
      let group = groups[price];
      const count = group.length;
      // The expected range for this group is from currentRank to currentRank + count - 1.
      const minExpected = currentRank;
      const maxExpected = currentRank + count - 1;
      group.forEach(pair => {
        pair.expectedMin = minExpected;
        pair.expectedMax = maxExpected;
      });
      currentRank += count;
    });
  }
  
  

// Returns the color for the rank based on actual vs expected
function getRankColor(actual, expectedMin, expectedMax) {
    const actualRank = parseInt(actual, 10);
    const minExpected = parseInt(expectedMin, 10);
    const maxExpected = parseInt(expectedMax, 10);
    if (isNaN(actualRank) || isNaN(minExpected) || isNaN(maxExpected)) return "#333333";
    if (actualRank < minExpected) {
      return "green";
    } else if (actualRank > maxExpected) {
      return "red";
    } else {
      return "orange";
    }
  }
  

function updateBudgetColor() {
    // Calculate the minimum price from the pairs array
    const minPrice = Math.min(...pairs.map(p => p.price));
    // Determine how many picks remain
    const remainingPicks = maxPicks - picks;
    // Calculate the value left for the next pick, assuming you reserve enough for the other picks
    const availableValue = budget - ((remainingPicks - 1) * minPrice);
    
    // Set the color based on availableValue tiers:
    //   > 12: (Tier 1) – default (or you could choose a specific color)
    // 10–12: (Tier 2) – green
    // 7–9:  (Tier 3) – orange
    //  < 7:  (Tier 4) – red
    if (availableValue > 12) {
      // Here you might choose to keep it default or pick a color.
      // For example, using your light mode text color:
      budgetEl.style.color = "#208bc9"; 
    } else if (availableValue >= 10 && availableValue <= 12) {
      budgetEl.style.color = "#1cad4f";
    } else if (availableValue >= 7 && availableValue <= 9) {
      budgetEl.style.color = "#c28825";
    } else { // availableValue < 7
      budgetEl.style.color = "#cf3d11";
    }
  }
  
// Update UI for budget, warning and pair availability
function updateBudgetUI() {
    // Calculate the minimum price for reference
    const minPrice = Math.min(...pairs.map(p => p.price));
    const remainingPicks = maxPicks - picks;
    const requiredBudget = remainingPicks * minPrice;
    
    // Show warning if needed
    warningEl.style.display = budget < requiredBudget ? "block" : "none";
    
    // Update pair availability (and then sort grid, etc.)
    updatePairAvailability();
    
    // Update the submit button visibility
    toggleSubmitButton();
    
    // Update the budget element's color based on available funds for the next pick
    updateBudgetColor();
  }
  

// Toggle selection of a pair card
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
  
    // Update the displayed budget and picks
    budgetEl.textContent = budget;
    picksEl.textContent = picks;
    
    // Update the state of available pairs
    updatePairAvailability();
    
    // Update the submit button visibility
    toggleSubmitButton();
    
    // **Update the budget color after every selection change**
    updateBudgetColor();
  }
  

// Reset all selections
function resetSelection() {
    document.querySelectorAll(".pair").forEach((cell) => cell.classList.remove("selected"));
    budget = budgetLimit;
    picks = 0;
    budgetEl.textContent = budget;
    picksEl.textContent = picks;
    submitBtn.disabled = true; 
    updateBudgetUI();
}
  

// Dummy logout function (clears localStorage and reloads the page)
function logoutSelection() {
  localStorage.clear();
  location.reload();
}

// Update pair availability based on remaining budget and picks
function updatePairAvailability() {
    document.querySelectorAll(".pair").forEach((cell) => {
      const price = parseInt(cell.dataset.price, 10);
  
      if (!cell.classList.contains("selected") && price > budget) {
        cell.classList.add("disabled");
      } else {
        cell.classList.remove("disabled");
      }
    });
  }
  

// Toggle the submit button based on the number of picks
function toggleSubmitButton() {
    submitBtn.disabled = picks < maxPicks;
  }
  

// Submit the selection when exactly 5 pairs are picked
function submitSelection() {
    // Ensure that exactly 5 pairs are selected
    if (picks !== maxPicks) {
      alert("Please select exactly 5 pairs before submitting.");
      return;
    }
    
    // Get the current timestamp in ISO format
    const timestamp = new Date().toISOString();
  
    // Collect selected pairs (using the first line of the cell's innerText as the pair identifier)
    const selectedPairs = [];
    document.querySelectorAll(".pair.selected").forEach((cell) => {
      selectedPairs.push(cell.innerText.split("\n")[0]);
    });
    
    // Build the submission data object
    const submissionData = {
      timestamp: timestamp,
      picks: selectedPairs
    };
  
    // TODO: Implement database submission logic here.
    // For example, you might send submissionData to your backend using fetch:
    //
    // fetch('/submit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(submissionData)
    // })
    // .then(response => response.json())
    // .then(data => console.log('Submission successful:', data))
    // .catch(error => console.error('Submission error:', error));
    
    console.log("Submitting data to the database:", submissionData);
  
    // Temporary confirmation message
    alert("Your selection has been submitted!");
  
    // Optionally, reset selections after submission
    resetSelection();
  }

// New function to show additional information using a modal
function showPairInfo(pair) {
    const modal = document.getElementById("infoModal");
    const modalContent = document.getElementById("modalContent");
  
    // Build the content HTML
    let infoHTML = `<p><strong>Προκριματικός:</strong> ${pair.prokrimatikos_club}</p>
                    <p><strong>Ποσοστό προκριματικών:</strong> ${pair.prokrimatikos_pososto}</p>`;
  
    // Only include the day percentages if they are more than 0
    if (parseFloat(pair.day_1) > 0) {
      infoHTML += `<p><strong>Ποσοστό 1ης μέρας:</strong> ${pair.day_1}</p>`;
    }
    if (parseFloat(pair.day_2) > 0) {
      infoHTML += `<p><strong>Ποσοστό 2ης μέρας:</strong> ${pair.day_2}</p>`;
    }
    if (parseFloat(pair.day_3) > 0) {
      infoHTML += `<p><strong>Ποσοστό 3ης μέρας:</strong> ${pair.day_3}</p>`;
    }
  
    modalContent.innerHTML = infoHTML;
    modal.style.display = "flex";
  }
  
  // Close modal function
  function closeModal() {
    const modal = document.getElementById("infoModal");
    modal.style.display = "none";
  }
  
  // Attach event listeners for closing the modal
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("infoModal").addEventListener("click", (event) => {
    if (event.target.id === "infoModal") {
      closeModal();
    }
  });
  
  // Update the populateGrid function to include the info icon (see previous changes)
  function populateGrid() {
    grid.innerHTML = "";
  
    pairs.forEach((pair, index) => {
      const cell = document.createElement("div");
      cell.classList.add("pair");
      cell.dataset.index = index;
      cell.dataset.price = pair.price;
  
      // Choose which name to show first (shorter one first)
      const name1 = pair.player1;
      const name2 = pair.player2;
      const [firstName, secondName] =
        name1.length <= name2.length ? [name1, name2] : [name2, name1];
  
      // Determine the ranking HTML.
      // If pair.rank is set (and not "placeholder") then use it.
      let rankHTML = "";
      if (pair.rank && pair.rank !== "placeholder") {
        // Use the expectedMin and expectedMax computed earlier.
        const rankColor = getRankColor(pair.rank, pair.expectedMin, pair.expectedMax);
        rankHTML = `<div class="ranking-tag" style="background-color: ${rankColor}; color: white;">
                      ${pair.rank}
                    </div>`;
      } else {
        // Optionally, display an empty ranking circle.
        rankHTML = `<div class="ranking-tag"></div>`;
      }
  
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
  
      // When clicking the pair card, toggle selection (if not disabled)
      cell.addEventListener("click", () => toggleSelection(cell, pair));
  
      // Attach event listener to the info icon
      const infoIcon = cell.querySelector(".info-icon");
      infoIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        showPairInfo(pair);
      });
  
      grid.appendChild(cell);
    });
  
    updatePairAvailability();
  }
  

// Dark Mode toggle functions
function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  if (isDarkMode) {
    localStorage.setItem("darkMode", "enabled");
    document.getElementById("dark-mode-style").setAttribute("href", "dark-mode.css");
    darkModeToggle.innerText = "";
  } else {
    localStorage.setItem("darkMode", "disabled");
    document.getElementById("dark-mode-style").setAttribute("href", "");
    darkModeToggle.innerText = "";
  }
}

function checkDarkMode() {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    document.getElementById("dark-mode-style").setAttribute("href", "dark-mode.css");
    darkModeToggle.innerText = "";
  } else {
    darkModeToggle.innerText = "";
  }
}

checkDarkMode();
populateGrid();
updateBudgetUI();
