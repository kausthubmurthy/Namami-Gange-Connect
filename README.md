# Namami Gange Connect

An offline-friendly AI chatbot that educates people by answering questions about the Namami Gange Programme and River Ganga:
- NLP: NLTK + spaCy
- Retrieval: scikit-learn TF–IDF
- Re-ranking: PyTorch (with graceful fallback)
- Intent classification: TensorFlow (with rule-based fallback)
- FastAPI backend + a clean front-end UI (already present in `Capstone Files/chacha-chaudhary-chatbot.zip`)

You can now run the project with a Node/Express API and a React (Vite) frontend.

## Quick start (Node stack)

Prereqs: Node.js 18+, pnpm or npm, PostgreSQL (optional for history logging)

Server (Express):
```zsh
cd server
cp .env.example .env  # set PORT, DATABASE_URL (optional), CORS_ORIGIN
npm install           # or pnpm i
npm run dev           # http://localhost:8000
```

Client (React + Vite):
```zsh
cd client
cp .env.example .env  # set VITE_API_BASE if backend not on localhost
npm install            # or pnpm i
npm run dev            # http://localhost:5173
```

## API (Express)

- On startup the backend scrapes text from:
  1. https://nmcg.nic.in/
  2. http://cganga.org/scientific-advisory-committee/
  3. http://nihroorkee.gov.in/Gangakosh/ganga.htm
  4. http://gangapedia.in/
  5. https://www.gangaaction.org/ganga-gyan-dhara-samgra-samvaad-workshop-for-clean-ganga/
  6. https://clap4ganga.com/
- Text is split into passages and indexed with TF–IDF.
- A tiny PyTorch MLP re-ranks the top candidates (falls back to cosine if PyTorch is missing).
- A small TensorFlow model handles greetings/thanks/bye (falls back to simple rules if TF is missing).

## API

- GET /health → { status, db }
- POST /chat { message: string, user_id?: string } → { answer, sources[], intent, confidence, timestamp }
- GET /history?limit=50&user_id=... → recent prompts (if DATABASE_URL configured)
- GET /docs-info → static docs info

## Troubleshooting

- If the client can’t reach the server, set VITE_API_BASE in client/.env and ensure CORS_ORIGIN in server/.env allows that origin.

## Notes

- The original Python backend files remain for reference; the Node/Express server is the primary API in this setup.
- Optional PostgreSQL logging is supported in the Node server; set DATABASE_URL in server/.env.
