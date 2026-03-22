import { describe, expect, it } from 'vitest';
import { AnalysisSchema } from '../src/types.js';

// ─── AnalysisSchema ───────────────────────────────────────────────────────────

describe('AnalysisSchema', () => {
  it('parses a valid summary', () => {
    expect(() => AnalysisSchema.parse({ summary: 'A todo app built with React.' })).not.toThrow();
  });

  it('throws on missing summary', () => {
    expect(() => AnalysisSchema.parse({})).toThrow();
  });

  it('throws on non-string summary', () => {
    expect(() => AnalysisSchema.parse({ summary: 42 })).toThrow();
  });
});
