import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Optional Postgres pool
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined });
  pool.query('CREATE TABLE IF NOT EXISTS prompt_history (id SERIAL PRIMARY KEY, user_id VARCHAR(255), prompt_text TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())').catch(console.error);
}

// Health
app.get('/health', async (_req, res) => {
  res.json({ status: 'healthy', db: !!pool });
});

// Chat (simple echo using basic logic similar to Python version)
app.post('/chat', async (req, res) => {
  try {
    const { message, user_id = 'anonymous' } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });

    // Log prompt (best-effort)
    if (pool) {
      pool.query('INSERT INTO prompt_history(user_id, prompt_text) VALUES($1,$2)', [user_id, message]).catch(() => {});
    }

    const lower = message.toLowerCase();
    let intent = 'general_query';
    if (['hello','hi','hey','namaste','chacha'].some(k=>lower.includes(k))) intent = 'greeting';
    else if (['thank','thanks','bye','goodbye'].some(k=>lower.includes(k))) intent = 'closing';

    const docs = [
      { title: 'Namami Gange Programme Overview', content: 'The Namami Gange Programme is an integrated conservation mission for river Ganga.' },
    ];
    const best = docs[0];
    let answer = intent === 'greeting'
      ? "🙏 Namaste! Main Chacha Chaudhary hun! Aaj aapko Ganga ke baare mein kya jaanna hai?"
      : intent === 'closing'
      ? "🙏 Dhanyawad! Phir milenge."
      : `🧠 Chacha Chaudhary kehta hai: ${best.content}`;

    res.json({ answer, sources: [best.title], intent, confidence: 0.9, timestamp: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// History
app.get('/history', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const userId = req.query.user_id;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, prompt_text, created_at FROM prompt_history
       ${userId ? 'WHERE user_id = $1' : ''}
       ORDER BY created_at DESC
       LIMIT ${limit}`,
      userId ? [userId] : []
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Docs info (static)
app.get('/docs-info', (_req, res) => {
  res.json({ total_documents: 1, documents: [{ id: 1, title: 'Namami Gange Programme Overview' }] });
});

app.listen(PORT, () => {
  console.log(`🚀 Express server listening on http://localhost:${PORT}`);
});
