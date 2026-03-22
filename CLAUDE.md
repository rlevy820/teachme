# TeachMe — Project Briefing for Claude

**Authors:** Ryan Levy & Claude

Read this before doing anything. This is the context for every session.

---

## What This Is

A local web app you boot from your terminal. You `cd` into any project, run `teachme "your question"`, and a browser opens with a tutor who has read your code and teaches at your level — one exchange at a time.

It's not a chatbot. It's not a documentation tool. It's a tutor that knows your project and knows how to explain things to you specifically.

---

## Who It's For

Built for and by a self-taught developer who:
- Learns by building, not reading
- Writes their own docs to reinforce understanding (the react.md approach)
- Needs things explained from first principles, not assumed
- Gets lost in walls of text and lecture-style responses

---

## Core Principles (never violate these)

- **Feynman first** — assume nothing. Build from first principles every time. If you can't explain it simply, the explanation isn't ready yet.
- **One thing at a time** — never more than a few sentences before a natural pause. The user continues or asks something. Never a wall of text.
- **Short by default** — a real conversation doesn't start with three paragraphs. Answer the question. Pause. Let them respond.
- **Why before how** — always explain why something exists before explaining how it works.
- **Tangents are first-class** — when the user doesn't follow an analogy or wants to go deeper on one piece, that's a tangent. The system tracks it and returns to the main thread when it resolves.
- **Plain english** — define jargon the moment you use it. Never use one unknown term to explain another.
- **Context-grounded** — every explanation should reference the user's actual code where possible, not generic examples.
- **Design before code** — conversation flow and experience must be fully designed before coding begins. Never hear a problem and jump to "let's start coding."
- **Phase gates** — each design phase has an explicit done signal. Don't bleed phases together.

---

## The Tutor Persona (derived from react.md)

The tutor teaches exactly the way the react.md doc reads. That doc was written by Ryan to explain React to someone at his level — it's the ground truth for voice, pace, and depth.

**What it does every time:**
1. States what something is — one plain english sentence
2. Explains why it exists — the motivation, not just the mechanism
3. Introduces code or examples
4. Walks through it piece by piece, naming every part

**Analogy style:** always grounded in something physical or familiar. Ports as real-life ports. A spreadsheet as a database table. The "pretend version" of the webpage for the virtual DOM.

**What the tutor assumes the learner has:**
- Knows what a terminal is
- Knows what a function is
- Has seen HTML before
- That's it. Nothing about CS concepts, data structures, or theory.

**What the tutor never does:**
- Define a thing using another unknown term
- Give a complete picture when a partial picture is enough to move forward
- Ask "does that make sense?" — it pauses at natural logic breaks and waits

---

## The Tangent System

When the user doesn't follow something in the current explanation, they can break into a tangent.

**How it starts:** highlight any text in the tutor's response → a "Tangent" button appears at the end of the selection → click it → tangent card appears.

**Layout:** one card, two zones. Main chat content sits at the top of the card. When a tangent opens, a tangent area expands below it within the same card — with its own "What's going on" input at the bottom. The main content doesn't move or resize. The tangent feels like a lightweight extension of the same conversation, not a separate thing. When it closes, it just collapses — no separate window disappearing, no jarring shift.

**How it ends:** user types `/back` in the tangent input → tangent card disappears. Main chat picks up where it was.

**Data model:** ephemeral. The tangent exchange is not persisted. If the interaction warrants a knowledge profile update (user struggled), that update happens silently — but the conversation is gone when closed.

**Who controls it:** the user entirely. No auto-close, no tutor suggestions to return. User-driven start and stop.

**Model selector:** visible in the header but parked for later. Not a v1 feature.

**Left strip:** visual only. No functional purpose.

---

## The Tech Stack

**Existing (keep as-is):**
- Node.js CLI entry point
- TypeScript strict mode, tsup build, Biome, Vitest
- Anthropic API (Haiku for cheap reads, Sonnet for reasoning)
- Zod for all AI response validation
- `@inquirer/core` for any terminal UI still needed

**New (to add):**
- Express server — spins up locally when you run `teachme`
- React frontend — the browser UI (Vite)
- The web UI handles: conversation display, highlight-to-tangent, thread navigation

**Model strategy:**
- `claude-haiku-4-5` — reading and indexing the project files
- `claude-sonnet-4-6` — all teaching responses (this is the reasoning-heavy part)

---

## The First Moment

Two entry points:

```
$ teachme
```
Tutor opens and asks what you want to explore. Call and response from the start — the tutor leads.

```
$ teachme "how does auth work here"
```
Tutor answers immediately. No preamble, no orientation.

Both:
1. CLI spins up a local Express server
2. Scans the project directory (scout layer)
3. Opens browser to `localhost:PORT`
4. Session begins

Each session is atomic — clean start every time, like opening a new Claude Code session.

---

## The Knowledge Profile

Stored in `~/.config/teachme/profile.json`. Persists across all sessions. This is the only thing that carries over — individual sessions are atomic.

**What it tracks (two signals only):**
1. **Concepts seen** — what topics have come up and roughly how many times. High count means it came up a lot, probably needed repeated explanation. `{ "async/await": 3, "state": 1, "SQL joins": 2 }`
2. **Sticking points** — concepts where the user opened a tangent or asked an immediate follow-up. That's the signal the first explanation didn't land.

**How it's used:** the tutor prompt gets a short plain-english summary — not raw data. Something like: "This user has seen async/await a few times and has struggled with it. Go slower there."

**This is the core iteration area.** How the knowledge profile is designed, what signals it captures, and how the tutor prompt is structured around it will be the main thing we're refining throughout development. Don't over-engineer it upfront — start minimal and iterate.

---

## Project Structure

```
src/
  index.ts          — CLI entry point. Parses args, boots the server, opens browser.
  session.ts        — session state for the current conversation
  types.ts          — Zod schemas + TS types for all AI responses
  prompt.ts         — terminal UI primitives (spinners, etc. — used during boot)

  scout/            — reads and understands the project before anything happens
    directory.ts    — scans folder structure
    files.ts        — reads key files
    analyze.ts      — Haiku builds the plain english project map

  server/           — Express server (NEW)
    index.ts        — boots the server, serves the React app
    routes.ts       — API routes: /ask, /tangent, /continue

  teach/            — teaching logic (NEW)
    tutor.ts        — Sonnet call, builds teaching responses
    thread.ts       — manages main thread and tangent stack
    profile.ts      — reads/writes the knowledge profile

client/             — React frontend (NEW, Vite project)
  src/
    App.tsx         — root component
    components/
      Thread.tsx    — displays the conversation thread
      TangentOverlay.tsx — highlight-to-tangent UI
```

---

## Division of Labor

Ryan brings taste, judgment, and the call on what feels right. Claude brings knowledge of what's technically possible, what patterns exist, and what the tradeoffs are. Decisions always belong to Ryan. Claude presents options — never makes choices unilaterally.

---

## Meta-Commands (for dev sessions with Claude)

- `-cp` — checkpoint: stop, reflect, update CLAUDE.md with what was just decided
- `-decide` — we've been discussing long enough, time to make a call and document it
- `-offtrack` — we're drifting, pull back

Claude should suggest these when it notices a checkpoint moment, a decision lingering, or drift happening — but Ryan pulls the trigger.

---

## Locked Design Decisions

- **Teaching loop** — AI-decided pacing with hard guardrails: max 4 sentences of prose before a pause or code block, one concept per response. AI picks the natural break point within those constraints.
- **80/20 on AI** — use AI where intelligence genuinely moves the needle (teaching responses, reading the codebase, knowing what concept to introduce next). Deterministic logic for everything else (routing, thread tracking, session state, UI).
- **First moment** — tutor answers immediately. No orientation beat, no "here's what I found." The project context is silent — the tutor just knows it.
- **Sessions** — atomic. Each session is a clean start, like opening a new Claude Code session. No saving, no resuming.
- **Tangent system** — see The Tangent System section above. User-controlled, ephemeral, side panel layout.
- **Knowledge profile** — two signals: concepts seen (frequency) and sticking points (tangents/follow-ups). Fed to tutor as a short plain-english summary. Core iteration area throughout development.

---

## Where We Are

- [x] Project rescoped from Reenter to TeachMe
- [x] Core principles defined
- [x] Tutor persona defined (from react.md)
- [x] Tangent mechanic designed and locked — inline expand within single card, user-controlled, ephemeral
- [x] UI layout locked — single card, markdown rendering, "What's going on" input, minimal chrome
- [x] Two entry points locked — `teachme` (tutor prompts) and `teachme "question"` (answers immediately)
- [x] Tech stack decided
- [x] Project structure sketched
- [x] Scout layer built (reused from Reenter)
- [x] Terminal UI primitives built (prompt.ts, reused from Reenter)
- [x] Build setup, CI/CD, linting (reused from Reenter)
- [x] All design questions answered and locked
- [ ] Server layer (Express + routes) — **next**
- [ ] Teaching loop (tutor.ts, thread.ts)
- [ ] React client (conversation UI, tangent expand)
- [ ] Knowledge profile (storage + read/write)
- [ ] CLI entry point updated
- [ ] Global install (`teachme` from anywhere)
