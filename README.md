<div align="center">

<img width="100" alt="Conflux logo" src="https://github.com/user-attachments/assets/d3d258a4-ce7f-41db-80f3-65b2d4c272c4" />


# Conflux

**Team knowledge that compounds.**

Conflux is an open source team knowledge base with AI-powered search,
persistent Q&A, and automatic expert discovery.

[Live Demo](https://conflux.vercel.app) · [Quick Start](#quick-start) · [How it works](#how-it-works)

<img width="3600" height="2025" alt="Conflux landing page" src="https://github.com/user-attachments/assets/93191b13-a608-4f25-8cd8-d15107a94c23" />

</div>

---

## The problem

Knowledge lives in the wrong places. Docs nobody can find. Slack threads
that scroll away. Answers in one person's head who just quit.

Notion gives you writing. Stack Overflow for Teams gives you Q&A.
Neither tells you who on your team actually knows about a topic.
Neither gets smarter over time.

Conflux does all three.

---

## Features

- **Ask, don't search**- type a question, get a direct answer synthesised
  from your team's documents with cited sources
- **Persistent Q&A**- post questions, get AI-drafted answers, let teammates
  verify them. Verified answers enter the search index permanently
- **Automatic expert discovery**- expertise map built silently from writing
  and answering behaviour. No profiles to fill in
- **Rich document editor**- Tiptap-powered with slash commands, code blocks,
  and markdown shortcuts
- **Workspace isolation**- full data isolation per team at the API layer

---

## How it works

### RAG pipeline

Documents are chunked at the paragraph level and embedded using Gemini's
`gemini-embedding-001` model into PostgreSQL with pgvector. When someone
searches, the query is embedded and a cosine similarity search retrieves
the top 5 most relevant chunks. These are passed to Gemini with a strict
grounded-answer prompt - the model only answers from retrieved context,
never from training data.

### Q&A feedback loop

Posted questions trigger the RAG pipeline automatically, generating an AI
draft answer immediately. When a human verifies and accepts an answer, it
gets embedded and stored as a new chunk in the search index. Every human
correction makes future searches more accurate. The knowledge base compounds.

### Expert graph

Every contribution increments a per-user, per-tag expertise score silently:

| Action | Points |
|--------|--------|
| Write a document | +5 per tag |
| Post a human answer | +2 per tag |
| Answer accepted | +10 per tag |

When AI retrieval confidence is low (which is determined by cosine similarity
distance) the top scorer for the relevant tags is surfaced as a suggestion.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL via Neon |
| Vector search | pgvector |
| ORM | Prisma |
| Auth | BetterAuth |
| AI | Google Gemini (gemini-embedding-001 + gemini-2.5-flash-lite) |
| Editor | Tiptap |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Quick start

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database (free tier)
- A [Google AI Studio](https://aistudio.google.com) API key (free)
- A [Google Cloud](https://console.cloud.google.com) OAuth app

### 1. Clone and install

```bash
git clone https://github.com/yourusername/conflux.git
cd conflux
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

### 3. Enable pgvector and run migrations

On your Neon database, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then:

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
```

---

## Deployment

Conflux runs on Vercel + Neon - both free tiers are sufficient.

1. Push repo to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Add your Vercel URL to Google OAuth authorised redirect URIs
5. Deploy

---

## License

GPL-3.0. See [LICENSE](LICENSE).
