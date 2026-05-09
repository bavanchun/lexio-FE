/**
 * Architecture boundary tests — doc §6.7.7
 *
 * These tests verify that the eslint-plugin-boundaries rules are correctly
 * enforced. They run ESLint programmatically on fixture files and assert that
 * forbidden cross-layer imports produce errors.
 *
 * Why: Prevents accidental dependency inversions from creeping in silently.
 * The same rules are enforced in CI via `pnpm lint:boundaries`.
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { describe, it, expect, afterEach } from 'vitest';

// Root of the lexio-web package (two levels up from tests/architecture/)
const WEB_ROOT = join(import.meta.dirname, '..', '..');

/** Temporary fixture files created per test, cleaned up in afterEach. */
const tmpFiles: string[] = [];

function createTmpFixture(relPath: string, content: string): string {
  const absPath = join(WEB_ROOT, relPath);
  mkdirSync(join(absPath, '..'), { recursive: true });
  writeFileSync(absPath, content, 'utf8');
  tmpFiles.push(absPath);
  return absPath;
}

function eslintFile(absPath: string): { exitCode: number; output: string } {
  try {
    const output = execSync(`pnpm lint "${absPath}"`, {
      cwd: WEB_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exitCode: 0, output };
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return {
      exitCode: e.status ?? 1,
      output: (e.stdout ?? '') + (e.stderr ?? ''),
    };
  }
}

afterEach(() => {
  for (const f of tmpFiles) {
    try {
      unlinkSync(f);
    } catch {
      /* already gone */
    }
  }
  tmpFiles.length = 0;
});

describe('Clean Architecture boundaries', () => {
  it('core/ MUST NOT import from lib/storage', () => {
    // A core use-case that accidentally reaches into Dexie storage.
    createTmpFixture(
      'core/use-cases/__boundary_violation_fixture__.ts',
      `// fixture: forbidden import — core → lib
import { } from '../../lib/storage/index';
export {};
`,
    );
    const { exitCode, output } = eslintFile(
      join(WEB_ROOT, 'core/use-cases/__boundary_violation_fixture__.ts'),
    );
    expect(exitCode, `Expected ESLint to fail.\nOutput:\n${output}`).not.toBe(0);
    expect(output).toMatch(/boundaries\/dependencies/);
  });

  it('core/ MUST NOT import from features/', () => {
    createTmpFixture(
      'core/use-cases/__boundary_violation_fixture2__.ts',
      `// fixture: forbidden import — core → features
import { } from '../../features/auth/index';
export {};
`,
    );
    const { exitCode, output } = eslintFile(
      join(WEB_ROOT, 'core/use-cases/__boundary_violation_fixture2__.ts'),
    );
    expect(exitCode, `Expected ESLint to fail.\nOutput:\n${output}`).not.toBe(0);
    expect(output).toMatch(/boundaries\/dependencies/);
  });

  it('lib/ MUST NOT import from features/', () => {
    createTmpFixture(
      'lib/__boundary_violation_fixture__.ts',
      `// fixture: forbidden import — lib → features
import { } from '../features/vocabulary/index';
export {};
`,
    );
    const { exitCode, output } = eslintFile(
      join(WEB_ROOT, 'lib/__boundary_violation_fixture__.ts'),
    );
    expect(exitCode, `Expected ESLint to fail.\nOutput:\n${output}`).not.toBe(0);
    expect(output).toMatch(/boundaries\/dependencies/);
  });

  it('features/ MUST NOT cross-import other features', () => {
    createTmpFixture(
      'features/learning/__boundary_violation_fixture__.ts',
      `// fixture: forbidden import — features/learning → features/auth
import { } from '../auth/index';
export {};
`,
    );
    const { exitCode, output } = eslintFile(
      join(WEB_ROOT, 'features/learning/__boundary_violation_fixture__.ts'),
    );
    expect(exitCode, `Expected ESLint to fail.\nOutput:\n${output}`).not.toBe(0);
    expect(output).toMatch(/boundaries\/dependencies/);
  });

  it('features/ CAN import from core/', () => {
    createTmpFixture(
      'features/learning/__boundary_ok_fixture__.ts',
      `// fixture: allowed import — features → core
import type { UserCard } from '../../core/entities/user-card';
export type { UserCard };
`,
    );
    const { exitCode, output } = eslintFile(
      join(WEB_ROOT, 'features/learning/__boundary_ok_fixture__.ts'),
    );
    expect(exitCode, `Expected ESLint to pass.\nOutput:\n${output}`).toBe(0);
  });
});
