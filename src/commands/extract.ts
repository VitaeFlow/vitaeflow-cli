import { Command } from 'commander';
import { extractResume } from '@vitaeflow/sdk';
import { writeFile } from 'node:fs/promises';
import { readPdf, success, fail, warn, exitWithError } from '../utils.js';

export const extractCommand = new Command('extract')
  .description('Extract VitaeFlow JSON data from a PDF.')
  .argument('<pdf>', 'Path to a .vf.pdf file')
  .option('-o, --output <path>', 'Write JSON to file instead of stdout')
  .option('--json', 'Output raw result (including validation) as JSON')
  .action(async (pdfPath: string, opts: { output?: string; json?: boolean }) => {
    let pdf: Uint8Array;
    try {
      pdf = await readPdf(pdfPath);
    } catch (err) {
      exitWithError(`Cannot read PDF: ${pdfPath} — ${(err as Error).message}`);
    }

    let result: Awaited<ReturnType<typeof extractResume>>;
    try {
      result = await extractResume(pdf);
    } catch (err) {
      exitWithError(`Extraction failed: ${(err as Error).message}`);
    }

    if (!result) {
      fail('No VitaeFlow data found in this PDF.');
      process.exit(1);
    }

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.validation.valid ? 0 : 1);
    }

    if (!result.resume) {
      fail('VitaeFlow data found but invalid:');
      for (const err of result.validation.errors) {
        console.log('  ' + (err.path || '/') + ' ' + err.message);
      }
      process.exit(1);
    }

    const json = JSON.stringify(result.resume, null, 2);

    if (opts.output) {
      try {
        await writeFile(opts.output, json, 'utf-8');
        success(`Extracted resume → ${opts.output}`);
      } catch (err) {
        exitWithError(`Cannot write file: ${opts.output} — ${(err as Error).message}`);
      }
    } else {
      console.log(json);
    }

    if (result.validation.warnings.length > 0) {
      for (const w of result.validation.warnings) {
        warn(w);
      }
    }
  });
