import { roundRepo } from "../repositories/round.repo.js";
import { playerRepo } from "../repositories/player.repo.js";
import { getRandomCard, calculateHand } from "../utils/round.utils.js";

async function handlePayments(playerId, status, bet) {
  if (["player_win", "dealer_bust"].includes(status)) {
    const remainingChips = await playerRepo.updatePlayerChips(
      playerId,
      bet * 2,
    );
    return remainingChips;
  }
  if (status === "push") {
    const remainingChips = await playerRepo.updatePlayerChips(playerId, bet);
    return remainingChips;
  }
}

async function startRound(bet, playerId) {
  const player = await playerRepo.findPlayerById(playerId);
  if (bet <= 0 || bet > player.chips) {
    const error = new Error(
      "Invalid bet or Player don't have enough chips to bet",
    );
    error.status = 400;
    throw error;
  }

  const playerHaveRound = await roundRepo.getActiveRoundByPlayerId(playerId);
  if (playerHaveRound) {
    const error = new Error("Player already have round in progress!");
    error.status = 409;
    throw error;
  }

  const remainingChips = await playerRepo.updatePlayerChips(playerId, -bet);

  const playerCards = [getRandomCard(), getRandomCard()];
  const dealerCards = [getRandomCard(), getRandomCard()];

  const newRound = {
    playerId,
    bet,
    playerCards,
    dealerCards,
    status: "in_progress",
    createdAt: new Date().toISOString(),
  };

  const roundId = await roundRepo.saveRound(newRound);
  return {
    roundId,
    playerCards,
    dealerUpCard: dealerCards[0],
    remainingChips,
  };
}

async function playPlayerTurn(playerId) {
  const activeRound = await roundRepo.getActiveRoundByPlayerId(playerId);
  if (!activeRound) {
    const error = new Error("Player doesn't have round in progress!");
    error.status = 404;
    throw error;
  }

  const newCard = getRandomCard();
  const updatedCards = [...activeRound.playerCards, newCard];
  await roundRepo.updateRound(activeRound._id, { playerCards: updatedCards });
  const playerTotal = calculateHand(updatedCards);

  let status = "in_progress";

  if (playerTotal > 21) {
    status = "player_bust";
    await roundRepo.updateRound(activeRound._id, { status });
  }

  const player = await playerRepo.findPlayerById(playerId);

  return {
    playerCards: updatedCards,
    playerTotal,
    status,
    chips: player.chips,
  };
}

async function playDealerTurn(playerId) {
  const activeRound = await roundRepo.getActiveRoundByPlayerId(playerId);
  if (!activeRound) {
    const error = new Error("Player doesn't have round in progress!");
    error.status = 404;
    throw error;
  }

  const dealerCards = [...activeRound.dealerCards];
  let dealerTotal = calculateHand(dealerCards);

  while (dealerTotal < 17) {
    const newCard = getRandomCard();
    dealerCards.push(newCard);
    dealerTotal = calculateHand(dealerCards);
  }

  const player = await playerRepo.findPlayerById(playerId);
  let status;
  let remainingChips = player.chips;
  const playerTotal = calculateHand(activeRound.playerCards);
  if (dealerTotal > 21) {
    status = "dealer_bust";
  } else {
    if (playerTotal > dealerTotal) {
      status = "player_win";
      remainingChips = await handlePayments(playerId, status, activeRound.bet);
    } else if (dealerTotal > playerTotal) {
      status = "dealer_win";
    } else {
      status = "push";
      remainingChips = await handlePayments(playerId, status, activeRound.bet);
    }

    await roundRepo.updateRound(activeRound._id, { dealerCards, status });
  }

  return {
    playerCards: activeRound.playerCards,
    dealerCards,
    playerTotal,
    dealerTotal,
    status,
    chips: remainingChips,
  };
}

export const roundService = {
  startRound,
  playPlayerTurn,
  playDealerTurn,
};
