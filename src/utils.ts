import { readFile, writeFile } from 'node:fs/promises';
import pc from 'picocolors';

export async function readPdf(path: string): Promise<Uint8Array> {
  const buffer = await readFile(path);
  return new Uint8Array(buffer);
}

export async function readJson(path: string): Promise<unknown> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

export async function writePdf(path: string, data: Uint8Array): Promise<void> {
  await writeFile(path, data);
}

export function success(msg: string): void {
  console.log(pc.green('✓') + ' ' + msg);
}

export function warn(msg: string): void {
  console.log(pc.yellow('⚠') + ' ' + msg);
}

export function fail(msg: string): void {
  console.error(pc.red('✗') + ' ' + msg);
}

export function label(key: string, value: string): void {
  console.log(pc.dim(key + ':') + ' ' + value);
}

export function exitWithError(msg: string): never {
  fail(msg);
  process.exit(2);
}
