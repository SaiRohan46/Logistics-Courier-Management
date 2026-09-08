import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPath;
try {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  dbPath = path.join(dataDir, 'logistics.db');
} catch (err) {
  dbPath = '/tmp/logistics.db';
}

const db = new sqlite3.Database(dbPath);

// Promisified DB helper methods
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Users Table
        await run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'dispatcher',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Shipments Table
        await run(`
          CREATE TABLE IF NOT EXISTS shipments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_number TEXT UNIQUE NOT NULL,
            sender_name TEXT NOT NULL,
            sender_phone TEXT,
            sender_address TEXT,
            recipient_name TEXT NOT NULL,
            recipient_phone TEXT,
            recipient_address TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            package_type TEXT DEFAULT 'Parcel',
            weight_kg REAL DEFAULT 1.0,
            status TEXT DEFAULT 'pending',
            is_priority INTEGER DEFAULT 0,
            priority_level TEXT DEFAULT 'standard',
            carrier TEXT DEFAULT 'LogiPulse Express',
            estimated_delivery TEXT,
            notes TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
          )
        `);

        // Shipment History Timeline
        await run(`
          CREATE TABLE IF NOT EXISTS shipment_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shipment_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
          )
        `);

        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  });
};

export default db;
