// mongo/db.js
const fs = require('fs').promises;
const cardsData = require('../fun/cards.js');

const DB_DIR = './data/';

async function readPlayerData() {
  try {
    const playerData = await fs.readFile(DB_DIR + 'players.json', 'utf8');
    return JSON.parse(playerData);
  } catch (err) {
    console.error('Error reading players.json:', err);
    return {};
  }
}

async function getPlayerCards(userID) {
  const playerData = await readPlayerData();
  return playerData[userID]?.cards?.name || [];
}

async function getUserCardFromName(userID, cardName) {
  const cards = await getPlayerCards(userID);
  return cardsData[cardName] || null;
}

module.exports = {
  getUserCardFromName,
  // Add more functions as needed
};
