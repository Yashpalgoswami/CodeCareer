const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');
const { migrate } = require('./db/database');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

const uploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message || 'Internal server error' });
});

const port = Number(process.env.PORT || 4000);

async function start() {
  await migrate();
  app.listen(port, () => {
    console.log(`CodeCareer backend listening on port ${port}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
