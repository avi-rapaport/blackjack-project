import { roundRepo } from "../repositories/round.repo.js";
import { playerRepo } from "../repositories/player.repo.js";

function getRandomCard() {
  //prettier-ignore
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ["hearts", "diamonds", "clubs", "spades"];

  const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];

  return { rank: randomRank, suit: randomSuit };
}

function calculateHand(cards) {
  let total = 0;
  let aceCount = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aceCount += 1;
      total += 11;
    } else if (["J", "Q", "K"].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
}

function playDealerTurn(initalDealerCards) {
  const dealerCards = [...initalDealerCards];
  let dealerTotal = calculateHand(dealerCards);

  while (dealerTotal < 17) {
    const newCard = getRandomCard();
    dealerCards.push(newCard);
    dealerTotal = calculateHand(dealerCards);
  }

  return { dealerCards, dealerTotal, isBust: dealerTotal > 21 };
}

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

function handlePlayerTurn(playerTotal) {
  let status = "in_progress";
  if (playerTotal === 21) {
  }
}

async function playPlayerHit(playerId) {
  const activeRound = await roundRepo.getActiveRoundByPlayerId(playerId);
  if (!activeRound) {
    const error = new Error("Player doesn't have round in progress!");
    error.status = 404;
    throw error;
  }

  const newCard = getRandomCard();
  await roundRepo.addCardToPlayer(activeRound._id, newCard);
  const updatedCards = [...activeRound.playerCards, newCard];
  const playerTotal = calculateHand(updatedCards);

  let status = "in_progress";

  if (playerTotal > 21) {
    status = "player_bust";
    await roundRepo.updateRoundStatus(activeRound._id, status);
  }

  const player = await playerRepo.findPlayerById(playerId);

  return {
    playerCards: updatedCards,
    playerTotal,
    status,
    chips: player.chips,
  };
}

export const roundService = {
  startRound,
};
