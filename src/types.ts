import { z } from 'zod';

// ─── AI Response Schemas ──────────────────────────────────────────────────────

export const AnalysisSchema = z.object({
  summary: z.string(),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

// ─── Session ──────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  type: 'ai' | 'user' | 'system';
  content: string;
  at: string;
}

export interface Session {
  meta: {
    startedAt: string;
    projectPath: string;
    projectName: string;
    platform: string;
  };
  project: {
    structure: string | null;
    keyFiles: string | null;
    summary: string | null;
  };
  history: HistoryEntry[];
}
