import { Command } from 'commander';
import { validateResume } from '@vitaeflow/sdk';
import type { ValidationMode } from '@vitaeflow/sdk';
import pc from 'picocolors';
import { readJson, success, fail, warn, exitWithError } from '../utils.js';

export const validateCommand = new Command('validate')
  .description('Validate a VitaeFlow JSON resume file.')
  .argument('<file>', 'Path to a .json resume file')
  .option('-m, --mode <mode>', 'Validation mode: strict or tolerant', 'strict')
  .option('--json', 'Output result as JSON')
  .action(async (file: string, opts: { mode: string; json?: boolean }) => {
    const mode = opts.mode as ValidationMode;
    if (mode !== 'strict' && mode !== 'tolerant') {
      exitWithError('Mode must be "strict" or "tolerant".');
    }

    let data: unknown;
    try {
      data = await readJson(file);
    } catch (err) {
      exitWithError(`Cannot read file: ${file} — ${(err as Error).message}`);
    }

    const result = validateResume(data, { mode });

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.valid ? 0 : 1);
    }

    if (result.valid) {
      success(`Valid resume (${mode} mode)`);
    } else {
      fail(`Invalid resume (${mode} mode) — ${result.errors.length} error(s)`);
      console.log();
      for (const err of result.errors) {
        const path = err.path || '/';
        console.log('  ' + pc.red(path) + ' ' + err.message);
      }
    }

    if (result.warnings.length > 0) {
      console.log();
      for (const w of result.warnings) {
        warn(w);
      }
    }

    process.exit(result.valid ? 0 : 1);
  });
