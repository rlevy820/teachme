// walkthrough/check.ts — runs a single check action.
//
// Shows the user what we want to check and why, asks consent,
// runs the command, interprets the output, stores the result.
//
// Returns 'ran' or 'skipped' so the loop knows what happened.

import { execSync } from 'node:child_process';
import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import reenterSelect, { green, spinClear, withMargin } from '../prompt.js';
import { logCheck } from '../session.js';
import type { CheckAction, Session } from '../types.js';

const MODEL = 'claude-haiku-4-5-20251001';

const CheckResultSchema = z.object({
  conclusion: z.string(), // one plain english sentence — what this tells us
  installed: z.boolean(),
});

async function interpretOutput(
  client: Anthropic,
  action: CheckAction,
  output: string,
): Promise<z.infer<typeof CheckResultSchema>> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 128,
    system: 'You are a JSON API. Only respond with raw JSON. No markdown, no explanation.',
    messages: [
      {
        role: 'user',
        content: `Command: ${action.command}
Output:
${output || '(no output — command may have failed or returned nothing)'}

Did this confirm ${action.name} is installed and working?

Return raw JSON only:
{ "conclusion": "...", "installed": true }

Keep "conclusion" to one short plain english sentence. No jargon.`,
      },
    ],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') throw new Error('Expected text response from AI');

  const raw = block.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return CheckResultSchema.parse(JSON.parse(raw));
}

export async function runCheck(
  client: Anthropic,
  session: Session,
  action: CheckAction,
): Promise<'ran' | 'skipped'> {
  process.stdout.write('\n');
  process.stdout.write(withMargin(action.reason) + '\n\n');

  const choice = await reenterSelect({
    message: `Can I run \`${action.command}\`?`,
    choices: [
      { title: 'Yes', value: 'yes' },
      { title: 'Skip', value: 'skip' },
    ],
  });

  if (choice === 'skip') return 'skipped';

  // Run the command (fast — no spinner needed)
  let rawOutput = '';
  try {
    rawOutput = execSync(action.command, {
      encoding: 'utf8',
      timeout: 10_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'stderr' in e) {
      rawOutput = String((e as { stderr: unknown }).stderr);
    }
  }

  // Interpret with AI (1-2s — spinner clears when done)
  const result = await spinClear('reading output', () =>
    interpretOutput(client, action, rawOutput),
  );

  // Write result on the cleared line — name + conclusion on one line
  process.stdout.write(`\n${green('●')} ${result.conclusion}\n\n`);

  logCheck(session, { command: action.command, output: rawOutput, conclusion: result.conclusion });

  return 'ran';
}
