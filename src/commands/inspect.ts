import { Command } from 'commander';
import { isVitaeFlowPdf, extractResume } from '@vitaeflow/sdk';
import pc from 'picocolors';
import { readPdf, fail, warn, label, exitWithError } from '../utils.js';

export const inspectCommand = new Command('inspect')
  .description('Inspect a PDF to check if it contains VitaeFlow data.')
  .argument('<pdf>', 'Path to a PDF file')
  .option('--json', 'Output result as JSON')
  .action(async (pdfPath: string, opts: { json?: boolean }) => {
    let pdf: Uint8Array;
    try {
      pdf = await readPdf(pdfPath);
    } catch (err) {
      exitWithError(`Cannot read PDF: ${pdfPath} — ${(err as Error).message}`);
    }

    let hasVitaeFlow: boolean;
    try {
      hasVitaeFlow = await isVitaeFlowPdf(pdf);
    } catch (err) {
      exitWithError(`Inspection failed: ${(err as Error).message}`);
    }

    if (opts.json) {
      const result: Record<string, unknown> = {
        vitaeflow: hasVitaeFlow,
      };

      if (hasVitaeFlow) {
        const extracted = await extractResume(pdf);
        if (extracted) {
          result.valid = extracted.validation.valid;
          result.version = extracted.resume?.version ?? null;
          result.profile = extracted.resume?.profile ?? null;
          result.generator = extracted.resume?.meta?.generator ?? null;
          result.errors = extracted.validation.errors;
          result.warnings = extracted.validation.warnings;
        }
      }

      console.log(JSON.stringify(result, null, 2));
      process.exit(hasVitaeFlow ? 0 : 1);
    }

    console.log();
    label('File', pdfPath);
    label('VitaeFlow', hasVitaeFlow ? pc.green('Yes') : pc.red('No'));

    if (!hasVitaeFlow) {
      console.log();
      fail('No VitaeFlow data found in this PDF.');
      process.exit(1);
    }

    const extracted = await extractResume(pdf);
    if (!extracted) {
      process.exit(1);
    }

    const resume = extracted.resume as Record<string, unknown> | null;

    label('Valid', extracted.validation.valid ? pc.green('Yes') : pc.red('No'));
    label('Version', String(resume?.version ?? 'unknown'));
    label('Profile', String(resume?.profile ?? 'unknown'));

    const meta = resume?.meta as Record<string, unknown> | undefined;
    if (meta?.generator) {
      label('Generator', String(meta.generator));
    }

    if (resume) {
      const sections = ['work', 'education', 'skills', 'languages', 'certifications', 'projects', 'publications', 'volunteer', 'references', 'interests']
        .filter((s) => Array.isArray(resume[s]) && (resume[s] as unknown[]).length > 0);
      if (sections.length > 0) {
        label('Sections', sections.join(', '));
      }
    }

    if (extracted.validation.errors.length > 0) {
      console.log();
      fail(`${extracted.validation.errors.length} validation error(s):`);
      for (const err of extracted.validation.errors) {
        console.log('  ' + pc.red(err.path || '/') + ' ' + err.message);
      }
    }

    if (extracted.validation.warnings.length > 0) {
      console.log();
      for (const w of extracted.validation.warnings) {
        warn(w);
      }
    }

    console.log();
    process.exit(extracted.validation.valid ? 0 : 1);
  });
