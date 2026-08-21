import { calculateHand } from "./utils/round.utils.js";

const chipsEl = document.querySelector("#chips");

let playerId = localStorage.getItem("playerId");
let chipsAmount = localStorage.getItem("chips");
let roundData;

async function initPage() {
  if (!playerId) {
    const gameRes = await fetch("http://localhost:3000/start-game", {
      method: "post",
      headers: { "Content-type": "application/json" },
    });

    const gameData = await gameRes.json();
    playerId = gameData.playerId;
    localStorage.setItem("playerId", playerId);
    chipsEl.textContent = "Chips: 1000";
  }

  const roundRes = await fetch("http://localhost:3000/my-round", {
    headers: { "x-player-id": playerId },
  });

  roundData = await roundRes.json();
  console.log(roundData);

  if (roundData.round === null) {
    document.getElementById("start-section").classList.remove("hidden");
    chipsEl.textContent = chipsAmount ? `Chips: ${chipsAmount}` : "Chips: 1000";
  } else {
    document.getElementById("resume-section").classList.remove("hidden");
  }
}

function renderPlayerCards(playerCards) {
  const container = document.querySelector("#player-cards");
  container.innerHTML = "";

  playerCards.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.textContent = card.rank;
    cardEl.className = "card";
    container.appendChild(cardEl);
  });
}

function renderGameStatus(status) {
  const messageEl = document.querySelector("#game-message");
  if (!messageEl) return;

  messageEl.className = "game-message";

  if (status === "player_bust") {
    messageEl.textContent = "💥 BUST! You went over 21.";
    messageEl.classList.add("lose");
  } else if (status === "dealer_bust") {
    messageEl.textContent = "🎉 Dealer Bust! You Win!";
    messageEl.classList.add("win");
  } else if (status === "player_win") {
    messageEl.textContent = "🏆 You Won!";
    messageEl.classList.add("win");
  } else if (status === "dealer_win") {
    messageEl.textContent = "❌ Dealer Won!";
    messageEl.classList.add("lose");
  } else if (status === "push") {
    messageEl.textContent = "🤝 Push (Tie)! Bet returned.";
    messageEl.classList.add("push");
  } else {
    messageEl.classList.add("hidden");
    return;
  }

  document.querySelector("#actions").classList.add("hidden");
}

function handleResumeRound() {
  const dealerUpCard = document.querySelector("#dealer-card-2");
  const cardsTotal = document.querySelector("#total");
  const { playerCards } = roundData;

  document.getElementById("resume-section").classList.add("hidden");
  document.querySelector("#actions").classList.remove("hidden");

  chipsEl.textContent = `Chips: ${roundData.remainingChips}`;
  dealerUpCard.textContent = roundData.dealerUpCard.rank;
  cardsTotal.textContent = `cards total: ${calculateHand(playerCards)}`;
  renderPlayerCards(playerCards);
}

async function handleStartRound() {
  const dealerUpCard = document.querySelector("#dealer-card-2");
  const cardsTotal = document.querySelector("#total");
  const amountToBet = Number(document.querySelector("#bet-input").value);

  const errorElement = document.querySelector("#error-message");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
  }

  const startRes = await fetch("http://localhost:3000/start-round", {
    method: "post",
    headers: { "Content-type": "application/json", "x-player-id": playerId },
    body: JSON.stringify({ bet: amountToBet }),
  });

  if (!startRes.ok) {
    const errData = await startRes.json();
    errorElement.textContent = errData.message;
    errorElement.classList.remove("hidden");
    return;
  }

  roundData = await startRes.json();
  const { playerCards, remainingChips } = roundData;

  document.getElementById("start-section").classList.add("hidden");
  document.querySelector("#actions").classList.remove("hidden");

  localStorage.setItem("chips", remainingChips);
  chipsEl.textContent = `Chips: ${remainingChips}`;
  dealerUpCard.textContent = roundData.dealerUpCard.rank;
  cardsTotal.textContent = `cards total: ${calculateHand(playerCards)}`;

  renderPlayerCards(playerCards);
}

async function handleStand() {
  const errorElement = document.querySelector("#error-message");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
  }

  const standRes = await fetch("http://localhost:3000/stand", {
    method: "post",
    headers: { "Content-type": "application/json", "x-player-id": playerId },
  });

  if (!standRes.ok) {
    const errData = await standRes.json();
    errorElement.textContent = errData.message;
    errorElement.classList.remove("hidden");
    return;
  }

  roundData = await standRes.json();
  const { status } = roundData;

  renderGameStatus(status);
}

async function handleHit() {
  const cardsTotal = document.querySelector("#total");
  const errorElement = document.querySelector("#error-message");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
  }

  const hitRes = await fetch("http://localhost:3000/hit", {
    method: "post",
    headers: { "Content-type": "application/json", "x-player-id": playerId },
  });

  if (!hitRes.ok) {
    const errData = await hitRes.json();
    errorElement.textContent = errData.message;
    errorElement.classList.remove("hidden");
    return;
  }

  roundData = await hitRes.json();
  const { playerCards, playerTotal, status } = roundData;

  cardsTotal.textContent = `cards total: ${playerTotal}`;
  renderPlayerCards(playerCards);

  if (playerTotal === 21) {
    handleStand();
  }

  if (status === "player_bust") {
    renderGameStatus(status);
  }
}

document.addEventListener("DOMContentLoaded", initPage);

const play = document.querySelector("#play");
play.addEventListener("click", async (e) => {
  if (e.target.id === "resume-btn") {
    handleResumeRound();
  } else if (e.target.id === "start-btn") {
    handleStartRound();
  }
});

const actions = document.querySelector("#actions");
actions.addEventListener("click", (e) => {
  if (e.target.id === "hit") {
    handleHit();
  } else if (e.target.id === "stand") {
    handleStand();
  }
});
