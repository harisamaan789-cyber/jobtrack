const Database = require("better-sqlite3");

const db = new Database("jobtrack.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Applied',
        applied_date TEXT,
        job_url TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;