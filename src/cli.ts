import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { embedCommand } from './commands/embed.js';
import { extractCommand } from './commands/extract.js';
import { inspectCommand } from './commands/inspect.js';

const program = new Command()
  .name('vitaeflow')
  .description('CLI for the VitaeFlow open standard — validate, embed, extract, and inspect structured resumes in PDFs.')
  .version('0.1.0');

program.addCommand(validateCommand);
program.addCommand(embedCommand);
program.addCommand(extractCommand);
program.addCommand(inspectCommand);

program.parse();
