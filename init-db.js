import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('ofzn.db');

db.exec(`
CREATE TABLE IF NOT EXISTS admins(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT
);
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  m3u_url TEXT,
  status TEXT DEFAULT 'active',
  expires_at TEXT
);
`);

// seed admin
const email = 'admin@ofzn.local';
const pass = 'admin123';
const hash = bcrypt.hashSync(pass, 10);
db.prepare('INSERT OR IGNORE INTO admins (email, password_hash) VALUES (?,?)').run(email, hash);

console.log('DB initialized.');
console.log('Admin ->', email, '/', pass);
