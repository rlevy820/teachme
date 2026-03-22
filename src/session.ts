// session.ts — the spine of TeachMe.
// Every module reads from and writes to this.
// Designed to be saveable to disk later without restructuring.

import type { HistoryEntry, Session } from './types.js';

export function createSession({ projectPath }: { projectPath: string }): Session {
  return {
    meta: {
      startedAt: new Date().toISOString(),
      projectPath,
      projectName: projectPath.split('/').pop() ?? projectPath,
      platform: process.platform,
    },
    project: {
      structure: null,
      keyFiles: null,
      summary: null,
    },
    history: [],
  };
}

export function logHistory(session: Session, type: HistoryEntry['type'], content: string): void {
  session.history.push({ type, content, at: new Date().toISOString() });
}
