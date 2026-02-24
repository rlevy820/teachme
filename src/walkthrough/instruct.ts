// walkthrough/instruct.ts — handles an instruction action.
//
// Something needs to be installed or fixed before we can continue.
// If the AI provided an install command, offer to run it automatically.
// Otherwise (or if the user prefers), show manual steps.
// Verifies after if a verifyCommand was given.

import { execSync, spawn } from 'node:child_process';
import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import reenterSelect, { green, spinClear, withMargin } from '../prompt.js';
import { logCheck } from '../session.js';
import type { InstructionAction, Session } from '../types.js';

const MODEL = 'claude-haiku-4-5-20251001';

const VerifyResultSchema = z.object({
  conclusion: z.string(),
  success: z.boolean(),
});

async function verifyInstall(
  client: Anthropic,
  command: string,
  output: string,
): Promise<z.infer<typeof VerifyResultSchema>> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 128,
    system: 'You are a JSON API. Only respond with raw JSON. No markdown, no explanation.',
    messages: [
      {
        role: 'user',
        content: `Verification command: ${command}
Output:
${output || '(no output — command may have failed)'}

Did this confirm the installation worked?

Return raw JSON only:
{ "conclusion": "...", "success": true }

Keep "conclusion" to one short plain english sentence. No jargon.`,
      },
    ],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') throw new Error('Expected text response from AI');

  const raw = block.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return VerifyResultSchema.parse(JSON.parse(raw));
}

// runCommand — for quick verify commands (fast, captured)
function runCommand(command: string): string {
  try {
    return execSync(command, {
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'stderr' in e) {
      return String((e as { stderr: unknown }).stderr);
    }
    return '';
  }
}

// runLive — for install commands that take time (streams output directly to terminal)
function runLive(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function runVerify(
  client: Anthropic,
  session: Session,
  command: string,
): Promise<void> {
  const output = runCommand(command);

  const result = await spinClear('checking', () => verifyInstall(client, command, output));

  process.stdout.write(`\n${green('●')} ${result.conclusion}\n\n`);

  logCheck(session, { command, output, conclusion: result.conclusion });
}

function showSteps(steps: string[]): void {
  process.stdout.write('\n');
  steps.forEach((step, i) => {
    process.stdout.write(withMargin(`${i + 1}. ${step}`) + '\n');
  });
  process.stdout.write('\n');
}

export async function runInstruction(
  client: Anthropic,
  session: Session,
  action: InstructionAction,
): Promise<'done' | 'skipped'> {
  process.stdout.write('\n');
  process.stdout.write(withMargin(action.summary) + '\n\n');

  if (action.installCommand) {
    // Offer to run the install command automatically
    const choice = await reenterSelect({
      message: `Can I run \`${action.installCommand}\` to fix this?`,
      choices: [
        { title: 'Yes, do it', value: 'auto' },
        { title: 'Show me how to do it myself', value: 'manual' },
        { title: 'Skip for now', value: 'skip' },
      ],
    });

    if (choice === 'skip') return 'skipped';

    if (choice === 'auto') {
      process.stdout.write('\n');
      try {
        await runLive(action.installCommand);
      } catch {
        // install command failed — output was already shown live, continue to verify
      }

      if (action.verifyCommand) {
        await runVerify(client, session, action.verifyCommand);
      } else {
        process.stdout.write('\n');
      }
      return 'done';
    }

    // Fell through to manual — show steps
    showSteps(action.steps);
  } else {
    // No install command — manual only
    showSteps(action.steps);
  }

  // Manual path — wait for user to come back
  const ready = await reenterSelect({
    message: 'Ready when you are.',
    choices: [
      { title: "Done, let's continue", value: 'done' },
      { title: 'Skip for now', value: 'skip' },
    ],
  });

  if (ready === 'skip') return 'skipped';

  if (action.verifyCommand) {
    await runVerify(client, session, action.verifyCommand);
  } else {
    process.stdout.write('\n');
  }

  return 'done';
}
