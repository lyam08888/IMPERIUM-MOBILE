const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3001;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

// Helper pour lire la base
function readDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
// Helper pour écrire la base
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Récupérer les données d'un joueur
app.get('/api/player/:id', (req, res) => {
  const db = readDB();
  const player = db[req.params.id];
  if (!player) return res.status(404).json({ error: 'Not found' });
  res.json(player);
});

// Sauvegarder/mettre à jour les données d'un joueur
app.post('/api/player/:id', (req, res) => {
  const db = readDB();
  db[req.params.id] = req.body;
  writeDB(db);
  res.json({ success: true });
});

// Lister tous les joueurs (debug)
app.get('/api/players', (req, res) => {
  const db = readDB();
  res.json(Object.keys(db));
});

app.listen(PORT, () => {
  console.log(`API IMPERIUM en écoute sur http://localhost:${PORT}`);
});