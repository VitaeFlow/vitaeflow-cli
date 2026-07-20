import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { PDFDocument } from 'pdf-lib';
import { embedResume } from '@vitaeflow/sdk';

const exec = promisify(execFile);
const CLI = join(import.meta.dirname, '..', 'dist', 'cli.js');
const FIXTURES = join(import.meta.dirname, 'fixtures');
const TMP = join(import.meta.dirname, '.tmp');

const VALID_JSON = join(FIXTURES, 'valid-resume.json');
const INVALID_JSON = join(FIXTURES, 'invalid-resume.json');
const BLANK_PDF = join(TMP, 'blank.pdf');
const VF_PDF = join(TMP, 'test.vf.pdf');

function run(args: string[]) {
  return exec('node', [CLI, ...args]);
}

function runExpectFail(args: string[]) {
  return exec('node', [CLI, ...args]).catch((err) => ({
    stdout: err.stdout as string,
    stderr: err.stderr as string,
    code: err.code as number,
  }));
}

beforeAll(async () => {
  await mkdir(TMP, { recursive: true });

  // Create a blank PDF
  const doc = await PDFDocument.create();
  doc.addPage();
  const pdfBytes = await doc.save();
  await writeFile(BLANK_PDF, pdfBytes);

  // Create a VitaeFlow PDF
  const resume = JSON.parse(await readFile(VALID_JSON, 'utf-8'));
  const enriched = await embedResume(new Uint8Array(pdfBytes), resume);
  await writeFile(VF_PDF, enriched);
});

afterAll(async () => {
  const files = [BLANK_PDF, VF_PDF, join(TMP, 'output.vf.pdf'), join(TMP, 'extracted.json')];
  for (const f of files) {
    await unlink(f).catch(() => {});
  }
  await unlink(TMP).catch(() => {});
});

describe('validate', () => {
  it('should accept a valid resume', async () => {
    const { stdout } = await run(['validate', VALID_JSON]);
    expect(stdout).toContain('Valid resume');
  });

  it('should reject an invalid resume', async () => {
    const result = await runExpectFail(['validate', INVALID_JSON]);
    expect(result.stderr).toContain('Invalid resume');
  });

  it('should support tolerant mode', async () => {
    const { stdout } = await run(['validate', VALID_JSON, '--mode', 'tolerant']);
    expect(stdout).toContain('Valid resume');
    expect(stdout).toContain('tolerant');
  });

  it('should output JSON with --json flag', async () => {
    const { stdout } = await run(['validate', VALID_JSON, '--json']);
    const result = JSON.parse(stdout);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should output errors as JSON with --json flag', async () => {
    const result = await runExpectFail(['validate', INVALID_JSON, '--json']);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors.length).toBeGreaterThan(0);
  });
});

describe('embed', () => {
  it('should embed a resume into a PDF', async () => {
    const output = join(TMP, 'output.vf.pdf');
    const { stdout } = await run(['embed', BLANK_PDF, VALID_JSON, '-o', output]);
    expect(stdout).toContain('Embedded resume');
    const bytes = await readFile(output);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it('should reject an invalid resume', async () => {
    const output = join(TMP, 'should-not-exist.pdf');
    const result = await runExpectFail(['embed', BLANK_PDF, INVALID_JSON, '-o', output]);
    expect(result.stderr).toBeTruthy();
  });
});

describe('extract', () => {
  it('should extract resume JSON from a VitaeFlow PDF', async () => {
    const { stdout } = await run(['extract', VF_PDF]);
    const resume = JSON.parse(stdout);
    expect(resume.version).toBe('0.2');
    expect(resume.basics.givenName).toBe('Marie');
  });

  it('should write to file with -o flag', async () => {
    const output = join(TMP, 'extracted.json');
    const { stdout } = await run(['extract', VF_PDF, '-o', output]);
    expect(stdout).toContain('Extracted resume');
    const content = JSON.parse(await readFile(output, 'utf-8'));
    expect(content.basics.email).toBe('marie.laurent@example.com');
  });

  it('should fail on a plain PDF', async () => {
    const result = await runExpectFail(['extract', BLANK_PDF]);
    expect(result.stderr).toContain('No VitaeFlow data');
  });
});

describe('inspect', () => {
  it('should detect VitaeFlow data', async () => {
    const { stdout } = await run(['inspect', VF_PDF]);
    expect(stdout).toContain('Yes');
    expect(stdout).toContain('0.2');
    expect(stdout).toContain('standard');
  });

  it('should report no VitaeFlow data for plain PDF', async () => {
    const result = await runExpectFail(['inspect', BLANK_PDF]);
    expect(result.stderr).toContain('No VitaeFlow data');
  });

  it('should output JSON with --json flag', async () => {
    const { stdout } = await run(['inspect', VF_PDF, '--json']);
    const result = JSON.parse(stdout);
    expect(result.vitaeflow).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.profile).toBe('standard');
  });
});
