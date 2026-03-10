# Document Review — Internal Attorney Portal

An internal document review and approval tool for Document AI. Lawyers use this to review AI-generated legal documents before they are delivered to clients.

## The Workflow

1. Client submits a document request (e.g. NDA) via the client portal
2. Document AI generates a draft using templates + RAG clause library
3. The draft is routed to an internal Document attorney's **Review Queue** (this app)
4. The attorney reviews the document in the **split-pane review screen**
5. Attorney either **Approves** (document is sent to client) or **Returns** (document is regenerated with revision notes)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Fonts:** Instrument Serif (document body) + DM Sans (UI)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screens

- `/queue` — Review Queue (lawyer inbox)
- `/review/[id]` — Document Review (split-pane: document + AI flags)

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repository
4. Click Deploy — no configuration needed
