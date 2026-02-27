/* simple Express backend for FinanzasCO
   - Stores data in SQLite using better-sqlite3
   - Provides basic auth/register and CRUD endpoints
   - Intended as a starting point to connect with frontend
*/
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// sqlite database
const db = new Database('./data.db');

// create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    pass TEXT
  );
  CREATE TABLE IF NOT EXISTS profile (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS txns (
    id TEXT PRIMARY KEY,
    fecha TEXT, tipo TEXT, descripcion TEXT, categoria TEXT,
    tipoGasto TEXT, monto REAL, emoji TEXT, notas TEXT, cuenta TEXT
  );
`);

// helpers
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const today = () => new Date().toISOString().slice(0,10);

// auth
app.post('/api/register', (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) return res.status(400).json({ error: 'email and pass required' });
  try {
    const stmt = db.prepare(`INSERT INTO users(email,pass) VALUES(?,?)`);
    stmt.run(email, pass);
    return res.json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'user exists' });
    }
    return res.status(500).json({ error: 'db error' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, pass } = req.body;
  try {
    const stmt = db.prepare(`SELECT * FROM users WHERE email = ? AND pass = ?`);
    const row = stmt.get(email, pass);
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'db error' });
  }
});

// simple CRUD for transactions
app.get('/api/txns', (req, res) => {
  try {
    const stmt = db.prepare(`SELECT * FROM txns ORDER BY rowid DESC`);
    const rows = stmt.all();
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'db error' });
  }
});
app.post('/api/txns', (req, res) => {
  try {
    const t = { ...req.body, id: uid(), fecha: req.body.fecha || today() };
    const stmt = db.prepare(`INSERT INTO txns(id,fecha,tipo,descripcion,categoria,tipoGasto,monto,emoji,notas,cuenta) VALUES(?,?,?,?,?,?,?,?,?,?)`);
    stmt.run(t.id, t.fecha, t.tipo, t.descripcion, t.categoria, t.tipoGasto, t.monto, t.emoji, t.notas, t.cuenta);
    return res.json(t);
  } catch (err) {
    return res.status(500).json({error:'db error'});
  }
});
app.delete('/api/txns/:id', (req, res) => {
  try {
    const stmt = db.prepare(`DELETE FROM txns WHERE id = ?`);
    stmt.run(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({error:'db error'});
  }
});

// profile endpoint
app.get('/api/profile', (req, res) => {
  try {
    const stmt = db.prepare(`SELECT value FROM profile WHERE key='profile'`);
    const row = stmt.get();
    return res.json(row ? JSON.parse(row.value) : null);
  } catch (err) {
    return res.status(500).json({error:'db error'});
  }
});
app.post('/api/profile', (req, res) => {
  try {
    const data = JSON.stringify(req.body);
    const stmt = db.prepare(`INSERT OR REPLACE INTO profile(key,value) VALUES('profile',?)`);
    stmt.run(data);
    return res.json(req.body);
  } catch (err) {
    return res.status(500).json({error:'db error'});
  }
});

// root healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Agile Passion API is running 🚀',
    status: 'ok'
  });
});

// other endpoints could be added in similar fashion (cuentas, deudas, metas...)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
