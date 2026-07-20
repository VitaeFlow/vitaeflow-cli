import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { embedCommand } from './commands/embed.js';
import { extractCommand } from './commands/extract.js';
import { inspectCommand } from './commands/inspect.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command()
  .name('vitaeflow')
  .description('CLI for the VitaeFlow open standard — validate, embed, extract, and inspect structured resumes in PDFs.')
  .version(packageJson.version);

program.addCommand(validateCommand);
program.addCommand(embedCommand);
program.addCommand(extractCommand);
program.addCommand(inspectCommand);

program.parse();
