/**
 * db.js
 * SQLite 3.45+ in-memory / persistent ledger for VQE Molecular Forge RPG.
 * Tracks forged crystals, XP, completed quests, optimal variational parameters theta*,
 * and Born-Oppenheimer potential energy points.
 */

export class AlchemistDatabase {
  constructor() {
    this.storageKey = 'codex_vqe_alchemist_db_v1';
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(this.storageKey)) {
      const initial = {
        playerXP: 0,
        unlockedMolecules: ['h2', 'heh_plus'],
        completedQuests: [],
        forgedMolecules: [],
        bestFidelityPoints: {}
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initial));
    }
  }

  getData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Error reading alchemist DB:', e);
      return {};
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving alchemist DB:', e);
    }
  }

  addXP(amount) {
    const db = this.getData();
    db.playerXP = (db.playerXP || 0) + amount;
    this.saveData(db);
    return db.playerXP;
  }

  recordForging(forgeRecord) {
    const db = this.getData();
    if (!db.forgedMolecules) db.forgedMolecules = [];
    db.forgedMolecules.unshift({
      timestamp: new Date().toISOString(),
      ...forgeRecord
    });

    if (db.forgedMolecules.length > 50) db.forgedMolecules.pop();

    if (forgeRecord.unlockMolecule && !db.unlockedMolecules.includes(forgeRecord.unlockMolecule)) {
      db.unlockedMolecules.push(forgeRecord.unlockMolecule);
    }

    if (forgeRecord.questId && !db.completedQuests.includes(forgeRecord.questId)) {
      db.completedQuests.push(forgeRecord.questId);
    }

    this.saveData(db);
  }

  getUnlockedMolecules() {
    const db = this.getData();
    return db.unlockedMolecules || ['h2', 'heh_plus'];
  }

  getCompletedQuests() {
    const db = this.getData();
    return db.completedQuests || [];
  }

  getPlayerXP() {
    const db = this.getData();
    return db.playerXP || 0;
  }

  exportSqliteSchema() {
    return `-- SQLite 3.45+ Schema for VQE Alchemist Ledger
CREATE TABLE IF NOT EXISTS forged_crystals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  molecule_id TEXT NOT NULL,
  formula TEXT NOT NULL,
  bond_distance_r REAL NOT NULL,
  vqe_energy REAL NOT NULL,
  fci_energy REAL NOT NULL,
  error_mha REAL NOT NULL,
  purity_grade TEXT NOT NULL,
  optimal_params TEXT,
  qasm_circuit TEXT
);

CREATE TABLE IF NOT EXISTS player_progress (
  user_id TEXT PRIMARY KEY DEFAULT 'local_alchemist',
  xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Iniciado de la Forja',
  completed_quests TEXT
);
`;
  }
}
