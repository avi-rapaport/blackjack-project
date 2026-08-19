export function getRandomCard() {
  //prettier-ignore
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ["hearts", "diamonds", "clubs", "spades"];

  const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];

  return { rank: randomRank, suit: randomSuit };
}

export function calculateHand(cards) {
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
    aceCount -= 1;
  }
  return total;
}
