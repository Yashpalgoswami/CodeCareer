const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/codecareer.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

async function migrate() {
  const migrationFile = path.resolve(__dirname, '../../migrations/001_init.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await get('SELECT name FROM schema_migrations WHERE name = ?', ['001_init.sql']);
  if (!existing) {
    await new Promise((resolve, reject) => {
      db.exec(sql, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    await run('INSERT INTO schema_migrations (name) VALUES (?)', ['001_init.sql']);
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  migrate,
};
