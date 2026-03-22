import { describe, expect, it } from 'vitest';
import { createSession, logHistory } from '../src/session.js';

// ─── createSession ────────────────────────────────────────────────────────────

describe('createSession', () => {
  it('derives projectName from the path', () => {
    const session = createSession({ projectPath: '/home/user/my-project' });
    expect(session.meta.projectName).toBe('my-project');
  });

  it('handles trailing slash in path', () => {
    const session = createSession({ projectPath: '/home/user/my-project/' });
    expect(session.meta.projectPath).toBe('/home/user/my-project/');
  });

  it('records a start timestamp', () => {
    const before = new Date().toISOString();
    const session = createSession({ projectPath: '/foo/bar' });
    const after = new Date().toISOString();
    expect(session.meta.startedAt >= before).toBe(true);
    expect(session.meta.startedAt <= after).toBe(true);
  });

  it('starts with null project fields', () => {
    const session = createSession({ projectPath: '/foo/bar' });
    expect(session.project.structure).toBeNull();
    expect(session.project.keyFiles).toBeNull();
    expect(session.project.summary).toBeNull();
  });

  it('starts with empty history', () => {
    const session = createSession({ projectPath: '/foo/bar' });
    expect(session.history).toEqual([]);
  });
});

// ─── logHistory ───────────────────────────────────────────────────────────────

describe('logHistory', () => {
  it('appends an entry with the correct fields', () => {
    const session = createSession({ projectPath: '/foo' });
    logHistory(session, 'user', 'hello');
    expect(session.history).toHaveLength(1);
    expect(session.history[0].type).toBe('user');
    expect(session.history[0].content).toBe('hello');
    expect(session.history[0].at).toBeTruthy();
  });

  it('preserves order across multiple entries', () => {
    const session = createSession({ projectPath: '/foo' });
    logHistory(session, 'user', 'first');
    logHistory(session, 'ai', 'second');
    logHistory(session, 'system', 'third');
    expect(session.history).toHaveLength(3);
    expect(session.history[0].content).toBe('first');
    expect(session.history[1].content).toBe('second');
    expect(session.history[2].content).toBe('third');
  });

  it('accepts all valid entry types', () => {
    const session = createSession({ projectPath: '/foo' });
    logHistory(session, 'ai', 'a');
    logHistory(session, 'user', 'b');
    logHistory(session, 'system', 'c');
    expect(session.history.map((e) => e.type)).toEqual(['ai', 'user', 'system']);
  });
});
