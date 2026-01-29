const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Initialize LowDB
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Set defaults
db.defaults({
  history: [],
  favorites: [],
  journalRankings: [] // Cache for journal rankings
}).write();

const dbService = {
  // History
  addHistory: (search) => {
    db.get('history')
      .unshift(search)
      .take(50) // Keep last 50
      .write();
  },

  getHistory: () => {
    return db.get('history').value();
  },

  // Favorites
  addFavorite: (paper) => {
    const exists = db.get('favorites')
      .find({ id: paper.id })
      .value();

    if (!exists) {
      db.get('favorites')
        .push(paper)
        .write();
    }
  },

  removeFavorite: (paperId) => {
    db.get('favorites')
      .remove({ id: paperId })
      .write();
  },

  getFavorites: () => {
    return db.get('favorites').value();
  },

  // Journal Rankings (Simple Cache)
  getJournalRank: (journalName) => {
    if (!journalName) return null;
    return db.get('journalRankings')
      .find(j => j.name.toLowerCase() === journalName.toLowerCase())
      .value();
  }
};

module.exports = { dbService };
