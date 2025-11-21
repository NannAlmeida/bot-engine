#!/usr/bin/env node

/**
 * CLI para criar projetos com bot-engine-telegram
 */

import { program } from 'commander';
import { initCommand } from './commands/init';
import { version } from '../../package.json';

program
  .name('create-bot-engine')
  .description('CLI para criar projetos com bot-engine-telegram')
  .version(version);

program
  .command('init [project-name]')
  .description('Cria um novo projeto com template básico')
  .option('-t, --template <template>', 'Template a ser usado (basic, express)', 'basic')
  .action(initCommand);

// Se nenhum argumento for passado, executa o init
if (process.argv.length === 2) {
  program.parse([...process.argv, 'init']);
} else {
  program.parse(process.argv);
}

