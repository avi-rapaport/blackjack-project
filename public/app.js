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
