import { Command } from 'commander';
import { embedResume, formatVitaeFlowFilename } from '@vitaeflow/sdk';
import { readPdf, readJson, writePdf, success, exitWithError } from '../utils.js';

export const embedCommand = new Command('embed')
  .description('Embed a VitaeFlow JSON resume into a PDF.')
  .argument('<pdf>', 'Path to the source PDF')
  .argument('<json>', 'Path to the VitaeFlow JSON resume')
  .option('-o, --output <path>', 'Output PDF path (defaults to <name>.vf.pdf)')
  .action(async (pdfPath: string, jsonPath: string, opts: { output?: string }) => {
    let pdf: Uint8Array;
    try {
      pdf = await readPdf(pdfPath);
    } catch (err) {
      exitWithError(`Cannot read PDF: ${pdfPath} — ${(err as Error).message}`);
    }

    let resume: unknown;
    try {
      resume = await readJson(jsonPath);
    } catch (err) {
      exitWithError(`Cannot read JSON: ${jsonPath} — ${(err as Error).message}`);
    }

    let result: Uint8Array;
    try {
      result = await embedResume(pdf, resume as Parameters<typeof embedResume>[1]);
    } catch (err) {
      exitWithError((err as Error).message);
    }

    const outputPath = opts.output ?? formatVitaeFlowFilename(pdfPath);

    try {
      await writePdf(outputPath, result);
    } catch (err) {
      exitWithError(`Cannot write output: ${outputPath} — ${(err as Error).message}`);
    }

    success(`Embedded resume → ${outputPath}`);
  });
