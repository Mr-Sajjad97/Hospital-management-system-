import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const DB_FILE = path.join(DATA_DIR, 'hms_database.json');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function writeDailyBackup(dataObj: unknown) {
  try {
    ensureDirs();
    const backupFile = path.join(BACKUP_DIR, `hms_${todayStr()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(dataObj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Auto daily backup warning:', err);
  }
}

function loadDatabaseFromDisk(): unknown | null {
  ensureDirs();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse main DB file, checking backups...', e);
    }
  }
  // Automatic restore from latest backup file if main DB file doesn't exist
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('hms_') && f.endsWith('.json'))
      .sort()
      .reverse();
    if (files.length > 0) {
      const latestBackup = path.join(BACKUP_DIR, files[0]);
      const raw = fs.readFileSync(latestBackup, 'utf-8');
      const parsed = JSON.parse(raw);
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to auto-restore from backup directory:', e);
  }
  return null;
}

// GET /api/db — Auto-restores database from file on startup
app.get('/api/db', (_req, res) => {
  const data = loadDatabaseFromDisk();
  const backups = listBackupFiles();
  res.json({
    data,
    backups,
    dbFilePath: 'data/hms_database.json',
    todayBackupPath: `backups/hms_${todayStr()}.json`,
  });
});

// POST /api/db — Auto-saves database to file AND daily backup file
app.post('/api/db', (req, res) => {
  try {
    ensureDirs();
    const dbData = req.body;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
    writeDailyBackup(dbData);
    res.json({
      ok: true,
      savedAt: new Date().toLocaleTimeString(),
      dbFilePath: 'data/hms_database.json',
      todayBackupPath: `backups/hms_${todayStr()}.json`,
      backups: listBackupFiles(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

function listBackupFiles() {
  ensureDirs();
  try {
    return fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((filename) => {
        const full = path.join(BACKUP_DIR, filename);
        const stat = fs.statSync(full);
        return {
          filename,
          sizeBytes: stat.size,
          updatedAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.filename.localeCompare(a.filename));
  } catch {
    return [];
  }
}

// GET /api/backups — List all automatic daily backup files
app.get('/api/backups', (_req, res) => {
  res.json({ backups: listBackupFiles() });
});

// POST /api/backups/restore — Restore from a specific backup file on disk
app.post('/api/backups/restore', (req, res) => {
  try {
    const { filename } = req.body;
    const safeName = path.basename(String(filename || ''));
    const target = path.join(BACKUP_DIR, safeName);
    if (!fs.existsSync(target)) {
      return res.status(404).json({ ok: false, error: 'Backup file not found' });
    }
    const raw = fs.readFileSync(target, 'utf-8');
    const parsed = JSON.parse(raw);
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    res.json({ ok: true, data: parsed, backups: listBackupFiles() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HMS Server running on http://localhost:${PORT}`);
  });
}

startServer();
