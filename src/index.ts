import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { scanDirectory } from './scout/directory.js';
import { readKeyFiles } from './scout/files.js';
import { createSession } from './session.js';

// Always load .env from the TeachMe project folder, regardless of where the user runs it from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const question = process.argv[2] ?? null; // null = `teachme` alone, string = `teachme "question"`
  const projectPath = process.cwd();

  const client = new Anthropic();
  const session = createSession({ projectPath });

  // Scout phase — read the project before anything opens in the browser
  const structure = scanDirectory(projectPath).join('\n');
  session.project.structure = structure;
  session.project.keyFiles = readKeyFiles(projectPath);

  // TODO: boot Express server, open browser, hand off to teaching session
  // If question is null: tutor prompts "what do you want to explore?"
  // If question is string: tutor answers immediately
  void client;
  void question;
}

main().catch((err) => {
  process.stdout.write(`\n${err.message}\n`);
  process.exit(1);
});
