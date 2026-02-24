// walkthrough/assess.ts — one AI call per iteration of the assessment loop.
//
// Takes session state and returns the next action.
// The caller handles the action, updates session state, and calls this again.
//
// Returns one of four action types:
//   check       — run a command to see what's installed
//   question    — ask the user something only they would know
//   instruction — something needs to be installed or fixed first
//   ready       — everything's in place, time to start

import type Anthropic from '@anthropic-ai/sdk';
import { AssessmentActionSchema, type AssessmentAction, type Session } from '../types.js';

const MODEL = 'claude-sonnet-4-6';

function formatHistory(session: Session): string {
  if (session.checks.length === 0) return 'Nothing checked yet.';

  return session.checks
    .map((c) => `- ${c.command}\n  Output: ${c.output.trim().slice(0, 300)}\n  Conclusion: ${c.conclusion}`)
    .join('\n\n');
}

export async function assessNext(
  client: Anthropic,
  session: Session,
): Promise<AssessmentAction> {
  const history = formatHistory(session);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are a JSON API for Reenter — a tool that helps developers run old projects locally.

Your job: figure out what needs to happen next to get this project running on the user's machine.

You respond with exactly one action at a time. Choose from:

check — run a command to see what's installed or running
{ "type": "check", "name": "Node.js", "description": "the software this app runs on", "reason": "This app runs on Node.js — it's what executes all the code. Without it, nothing will run. We're going to check your computer has it installed.", "command": "node --version" }

question — ask the user something only they would know
{ "type": "question", "text": "...", "options": ["option 1", "option 2"] }
Omit "options" if you need a free-text answer.

instruction — something needs to be installed or fixed before continuing
{ "type": "instruction", "summary": "PHP isn't installed", "installCommand": "brew install php", "steps": ["Go to php.net and download the latest version", "Run the installer", "Restart your terminal"], "verifyCommand": "php --version" }
"installCommand" is the single command that fixes it on this OS — include it when one exists.
Omit "installCommand" if there is no simple one-liner for this OS.
Omit "verifyCommand" if there is nothing to verify after.

ready — everything needed is in place, time to start
{ "type": "ready", "startCommand": "npm start", "notes": ["The admin panel won't work without a running database"] }
"notes" are specific soft blockers — things that won't work yet and why. Never use generic warnings.

Rules:
- Never return "instruction" before running a "check" to confirm the problem
- Never return "ready" until all required dependencies are confirmed present
- Prefer "check" over "question" — only ask the user what the machine can't answer
- One action at a time. Never bundle multiple steps.
- For "check": "reason" must (1) start with "This app..." to ground it in context, (2) explain why the app needs it, (3) say we're running the command to check it's installed. Plain english. No jargon.
- Only respond with raw JSON. No markdown, no explanation.`,
    messages: [
      {
        role: 'user',
        content: `Goal: get this project running locally on the user's machine.

OS: ${session.meta.platform}

PROJECT SUMMARY:
${session.project.summary ?? 'No summary available.'}

FILE STRUCTURE:
${session.project.structure ?? 'No structure available.'}

PROJECT FILES:
${session.project.keyFiles ?? 'No files read.'}

HISTORY:
${history}

What is the next action?`,
      },
    ],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') throw new Error('Expected text response from AI');

  // Strip markdown code fences if present
  const raw = block.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  return AssessmentActionSchema.parse(JSON.parse(raw));
}
