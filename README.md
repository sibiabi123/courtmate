# 🎮 VIT-G-Hub OMNI

**VIT-G-Hub OMNI** is a premium, real-time campus digital twin for coordinating physical sports and digital esports matchmaking at **Vellore Institute of Technology (VIT)**.

---

## 🚀 Key Technologies & Stack
- **Next.js 16.3** with App Router, Turbopack, and Incremental PPR enabled.
- **tRPC v11** & **React Query v5** for type-safe server queries.
- **Drizzle ORM** mapping Postgres relational schemas with Drizzle-Zod validation.
- **Supabase Realtime** exclusively supporting broadcast channels and database event triggers (No Pusher).
- **Upstash Redis** running ELO rankings caching, daily quest generators, and AI occupancies.
- **Offline First**: Zustand + IndexedDB (`idb` package) to sync offline modifications automatically.
- **AI Agentic Layer**: Vercel AI SDK producing automated match summaries, descriptions, and moderators.
- **3D Digital Twin**: React Three Fiber/Drei mapping interactive glowing campus coordinates.

---

## 📦 Zero-Local Services Setup

This edition is engineered to run completely serverless, utilizing cloud services for zero system memory footprints.
All direct calls connect to Neon.tech and Upstash clouds.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` into `.env` and fill in cloud connection URLs:
   ```bash
   cp .env.example .env
   ```

3. Deploy and seed database:
   ```bash
   npm run vit:deploy
   ```

4. Launch dev server:
   ```bash
   npm run dev
   ```
