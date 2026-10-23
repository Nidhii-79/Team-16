const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// Every file in /routes is loaded automatically, so each feature lives in its own file.
const dir = path.join(__dirname, 'routes');
fs.readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .forEach((f) => app.use(require(path.join(dir, f))));

app.use((err, req, res, next) => {
  console.error(err.message); // never log passwords or tokens
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log('CMS API running on http://localhost:' + PORT));
}
module.exports = app;
