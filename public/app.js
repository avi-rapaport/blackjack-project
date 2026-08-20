import { calculateHand } from "./utils/round.utils.js";

async function initPage() {
  let playerId = localStorage.getItem("playerId");

  if (!playerId) {
    const gameRes = await fetch("http://localhost:3000/start-game", {
      method: "post",
      headers: { "Content-type": "application/json" },
    });

    const gameData = await gameRes.json();
    playerId = gameData.playerId;
    localStorage.setItem("playerId", playerId);
  }

  const roundRes = await fetch("http://localhost:3000/my-round", {
    headers: { "x-player-id": playerId },
  });

  const roundData = await roundRes.json();

  if (roundData.round === null) {
    document.getElementById("start-section").classList.remove("hidden");
  } else {
    document.getElementById("resume-section").classList.remove("hidden");
    const chips = document.querySelector("#chips");
    const playerCard1 = document.querySelector("#player-card-1");
    const playerCard2 = document.querySelector("#player-card-2");
    const dealerUpCard = document.querySelector("#dealer-card-2");
    const cardsTotal = document.querySelector("#total");
    console.log(roundData);

    chips.textContent = `Chips: ${roundData.remainingChips}`;
    playerCard1.textContent = roundData.playerCards[0].rank;
    playerCard2.textContent = roundData.playerCards[1].rank;
    dealerUpCard.textContent = roundData.dealerUpCard.rank;
    cardsTotal.textContent = `cards total: ${calculateHand(roundData.playerCards)}`;
  }
}

document.addEventListener("DOMContentLoaded", initPage);

const play = document.querySelector("#play");
play.addEventListener("click", () => {
  document.querySelector("#actions").classList.remove("hidden");
});

async function handleRound() {
  const amountToBet = document.querySelector("#bet-input").value;
  const newRoundRes = await fetch("http://localhost:3000/start-round", {
    method: "post",
    headers: { "Content-type": "application/json", "x-player-id": playerId },
    body: JSON.stringify({ bet: amountToBet }),
  });
}

function updateUI(roundData) {
  // 1. עדכון הקלפים והסכום במסך
  renderCards(roundData.playerCards, roundData.dealerUpCard);

  const playerTotal = calculateHand(roundData.playerCards);

  // 2. בדיקה: אם הסכום 21 או יותר, או שהסבב הסתיים - מנטרלים את כפתור Hit
  if (playerTotal >= 21 || roundData.status !== "in_progress") {
    document.getElementById("hit-btn").disabled = true;
  } else {
    document.getElementById("hit-btn").disabled = false;
  }

  // 3. העברה אוטומטית ל-Stand במידה והגענו ל-21 בול
  if (playerTotal === 21 && roundData.status === "in_progress") {
    handleStand(); // קורא אוטומטית לפונקציה שפונה ל-POST /stand
  }
}
