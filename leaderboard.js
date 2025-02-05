const leaderboardBody = document.getElementById("leaderboardBody");
const filterDay = document.getElementById("filterDay");
const sortRank = document.getElementById("sortRank");
const sortContainer = document.getElementById("sortContainer");
const tableWrapper = document.querySelector(".table-wrapper");

// Modal elements
const squadModal = document.getElementById("squadModal");
const modalDay = document.getElementById("modalDay");
const modalPlayer = document.getElementById("modalPlayer");
const squadList = document.getElementById("squadList");
const closeModal = document.querySelector(".close");

// Dummy Data
const leaderboardData = [
  { 
    name: "Alice",
    squad: {
      day1: ["Pair A", "Pair B", "Pair C", "Pair D", "Pair E"],
      day2: ["Pair F", "Pair G", "Pair H", "Pair I", "Pair J"],
      day3: ["Pair K", "Pair L", "Pair M", "Pair N", "Pair O"],
      general: ["Pair P", "Pair Q", "Pair R", "Pair S", "Pair T"]
    },
    scores: { day1: 88, day2: 98, day3: 97, general: 96 }
  },
  { 
    name: "Bob",
    squad: {
      day1: ["Pair U", "Pair V", "Pair W", "Pair X", "Pair Y"],
      day2: ["Pair Z", "Pair AA", "Pair BB", "Pair CC", "Pair DD"],
      day3: ["Pair EE", "Pair FF", "Pair GG", "Pair HH", "Pair II"],
      general: ["Pair JJ", "Pair KK", "Pair LL", "Pair MM", "Pair NN"]
    },
    scores: { day1: 90, day2: 92, day3: 93, general: 91 }
  },
  { 
    name: "Charlie",
    squad: {
      day1: ["Pair AB", "Pair AC", "Pair AD", "Pair AE", "Pair AF"],
      day2: ["Pair AG", "Pair AH", "Pair AI", "Pair AJ", "Pair AK"],
      day3: ["Pair AL", "Pair AM", "Pair AN", "Pair AO", "Pair AP"],
      general: ["Pair AQ", "Pair AR", "Pair AS", "Pair AT", "Pair AU"]
    },
    scores: { day1: 85, day2: 88, day3: 98, general: 87 }
  }
];

// Function to Show Squad Modal
function showSquadModal(player, day) {
  modalDay.textContent = day.charAt(0).toUpperCase() + day.slice(1);
  modalPlayer.textContent = player.name;

  squadList.innerHTML = "";
  player.squad[day].forEach(pair => {
    const listItem = document.createElement("li");
    listItem.textContent = pair;
    squadList.appendChild(listItem);
  });

  squadModal.style.display = "flex";
}

// Close Modal
closeModal.addEventListener("click", () => {
  squadModal.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === squadModal) {
    squadModal.style.display = "none";
  }
});

// Function to Render Leaderboard
function renderLeaderboard(selectedDay = "general", sortBy = "general") {
  leaderboardBody.innerHTML = "";
  const isGeneral = selectedDay === "general";
  tableWrapper.classList.toggle("hide-squad", isGeneral);
  sortContainer.style.display = isGeneral ? "block" : "none";

  document.querySelectorAll('.day-column').forEach(col => {
    col.style.display = isGeneral || col.getAttribute('data-day') === selectedDay ? "table-cell" : "none";
  });

  document.querySelectorAll('.squad-column').forEach(col => {
    col.style.display = isGeneral ? "none" : "table-cell";
  });

  let sortedData = leaderboardData.map(player => ({
    ...player,
    score: player.scores[sortBy]
  })).sort((a, b) => b.score - a.score);

  sortedData.forEach((player, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}</td>
      <td class="clickable-username" data-name="${player.name}">${player.name}</td>
      ${!isGeneral ? `<td class="squad-column">${player.squad[selectedDay].join(", ")}</td>` : ""}
      ${isGeneral ? `
        <td class="clickable-score" data-name="${player.name}" data-day="day1">${player.scores.day1}</td>
        <td class="clickable-score" data-name="${player.name}" data-day="day2">${player.scores.day2}</td>
        <td class="clickable-score" data-name="${player.name}" data-day="day3">${player.scores.day3}</td>
        <td>${player.scores.general}</td>
      ` : `<td class="clickable-score" data-name="${player.name}" data-day="${selectedDay}">${player.scores[selectedDay]}</td>`}
    `;

    leaderboardBody.appendChild(row);
  });

  // Attach event listeners for modal on scores
  document.querySelectorAll(".clickable-score").forEach(scoreCell => {
    scoreCell.addEventListener("click", (event) => {
      const playerName = event.target.getAttribute("data-name");
      const day = event.target.getAttribute("data-day");
      const player = leaderboardData.find(p => p.name === playerName);
      showSquadModal(player, day);
    });
  });

  // Attach event listeners for clicking usernames
  document.querySelectorAll(".clickable-username").forEach(usernameCell => {
    usernameCell.addEventListener("click", (event) => {
        const playerName = event.target.getAttribute("data-name");
        showNameModal(playerName);
    });
  });

}

const nameModal = document.getElementById("nameModal");
const playerFullName = document.getElementById("playerFullName");
const closeNameModal = document.getElementById("closeNameModal");

function showNameModal(playerName) {
    playerFullName.textContent = `Full Name: ${playerName}`; // Change this if full name is different
    nameModal.style.display = "flex";
}

// Close modal on click
closeNameModal.addEventListener("click", () => {
    nameModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === nameModal) {
        nameModal.style.display = "none";
    }
});


// Event Listeners for Filters
filterDay.addEventListener("change", () => {
  const selectedDay = filterDay.value;
  renderLeaderboard(selectedDay, selectedDay === "general" ? sortRank.value : selectedDay);
});

sortRank.addEventListener("change", () => {
  if (filterDay.value === "general") {
    renderLeaderboard("general", sortRank.value);
  }
});

// Initialize Leaderboard
renderLeaderboard();
