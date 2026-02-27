/* simple Express backend for FinanzasCO
   - Stores everything in-memory; restart clears data
   - Provides basic auth/register and CRUD endpoints
   - Intended as a starting point to connect with frontend
*/
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// sqlite database
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    pass TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS profile (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS txns (
    id TEXT PRIMARY KEY,
    fecha TEXT, tipo TEXT, descripcion TEXT, categoria TEXT,
    tipoGasto TEXT, monto REAL, emoji TEXT, notas TEXT, cuenta TEXT
  )`);
  // additional tables (cuentas, deudas, metas) can be created here
});

// helpers
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const today = () => new Date().toISOString().slice(0,10);

// auth
app.post('/api/register', (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) return res.status(400).json({ error: 'email and pass required' });
  const stmt = db.prepare(`INSERT INTO users(email,pass) VALUES(?,?)`);
  stmt.run(email, pass, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return res.status(409).json({ error: 'user exists' });
      }
      return res.status(500).json({ error: 'db error' });
    }
    return res.json({ success: true });
  });
  stmt.finalize();
});

app.post('/api/login', (req, res) => {
  const { email, pass } = req.body;
  db.get(`SELECT * FROM users WHERE email = ? AND pass = ?`, [email, pass], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    return res.json({ success: true });
  });
});

// simple CRUD for transactions
app.get('/api/txns', (req, res) => {
  db.all(`SELECT * FROM txns ORDER BY rowid DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    return res.json(rows);
  });
});
app.post('/api/txns', (req, res) => {
  const t = { ...req.body, id: uid(), fecha: req.body.fecha || today() };
  const stmt = db.prepare(`INSERT INTO txns(id,fecha,tipo,descripcion,categoria,tipoGasto,monto,emoji,notas,cuenta) VALUES(?,?,?,?,?,?,?,?,?,?)`);
  stmt.run(t.id, t.fecha, t.tipo, t.descripcion, t.categoria, t.tipoGasto, t.monto, t.emoji, t.notas, t.cuenta, function(err){
    if(err) return res.status(500).json({error:'db error'});
    return res.json(t);
  });
  stmt.finalize();
});
app.delete('/api/txns/:id', (req, res) => {
  db.run(`DELETE FROM txns WHERE id = ?`, [req.params.id], function(err){
    if(err) return res.status(500).json({error:'db error'});
    return res.json({ success: true });
  });
});

// profile endpoint
app.get('/api/profile', (req, res) => {
  db.get(`SELECT value FROM profile WHERE key='profile'`, [], (err, row) => {
    if (err) return res.status(500).json({error:'db error'});
    return res.json(row ? JSON.parse(row.value) : null);
  });
});
app.post('/api/profile', (req, res) => {
  const data = JSON.stringify(req.body);
  const stmt = db.prepare(`INSERT OR REPLACE INTO profile(key,value) VALUES('profile',?)`);
  stmt.run(data, function(err){
    if(err) return res.status(500).json({error:'db error'});
    return res.json(req.body);
  });
  stmt.finalize();
});

// other endpoints could be added in similar fashion (cuentas, deudas, metas...)

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
