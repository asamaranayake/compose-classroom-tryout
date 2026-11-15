const express = require('express');
const { Pool } = require('pg');

const app = express();
const database = new Pool({
  host: process.env.DB_HOST || 'database',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'classroom',
  user: process.env.DB_USER || 'classroom',
  password: process.env.DB_PASSWORD || 'classroom-demo-only'
});

app.use(express.json());

app.get('/health', async (_request, response) => {
  try {
    await database.query('SELECT 1');
    response.status(200).json({ status: 'ok', database: 'connected' });
  } catch {
    response.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.get('/api/notes', async (_request, response) => {
  try {
    const result = await database.query(
      'SELECT id, body, created_at FROM notes ORDER BY id DESC LIMIT 50'
    );
    response.json(result.rows);
  } catch {
    response.status(500).json({ error: 'Could not load notes.' });
  }
});

app.post('/api/notes', async (request, response) => {
  const body = typeof request.body.body === 'string' ? request.body.body.trim() : '';
  if (!body || body.length > 200) {
    return response.status(400).json({ error: 'Enter a note between 1 and 200 characters.' });
  }

  try {
    const result = await database.query(
      'INSERT INTO notes (body) VALUES ($1) RETURNING id, body, created_at',
      [body]
    );
    response.status(201).json(result.rows[0]);
  } catch {
    response.status(500).json({ error: 'Could not save the note.' });
  }
});

async function start() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id BIGSERIAL PRIMARY KEY,
      body VARCHAR(200) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Notes API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Could not start the Notes API:', error.message);
  process.exit(1);
});
