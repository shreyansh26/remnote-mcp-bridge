import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('project config', () => {
  it('declares the read-only KB metadata permission used by status and export', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8')) as {
      requiredScopes: unknown[];
    };
    expect(manifest.requiredScopes).toContainEqual({ type: 'KnowledgeBaseInfo', level: 'Read' });
    expect(manifest.requiredScopes).toContainEqual({
      type: 'All',
      level: 'ReadCreateModifyDelete',
    });
  });
  it('includes tests in TypeScript typechecking', () => {
    const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8')) as {
      include: string[];
    };

    expect(tsconfig.include).toEqual(expect.arrayContaining(['src', 'test']));
  });

  it('keeps widget entrypoints visible to coverage', async () => {
    const { default: vitestConfig } = await import('../../vitest.config');
    const config = vitestConfig as { test?: { coverage?: { exclude?: string[] } } };

    expect(config.test?.coverage?.exclude).not.toContain('src/widgets/**/*.tsx');
  });
});
