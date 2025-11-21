/**
 * Comando para inicializar um novo projeto
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { createBasicTemplate } from '../templates/basic';
import { createExpressTemplate } from '../templates/express';

interface InitOptions {
  template?: string;
}

export async function initCommand(projectName?: string, options?: InitOptions) {
  console.log(chalk.cyan.bold('\n🤖 Bem-vindo ao Bot Engine CLI!\n'));

  try {
    // Obter nome do projeto
    if (!projectName) {
      projectName = await input({
        message: 'Qual é o nome do seu projeto?',
        default: 'my-telegram-bot',
        validate: (value: string) => {
          if (!value || value.trim() === '') {
            return 'Por favor, insira um nome válido';
          }
          if (!/^[a-z0-9-_]+$/i.test(value)) {
            return 'Use apenas letras, números, hífens e underscores';
          }
          return true;
        }
      });
    }

    // Obter template
    let template = options?.template || 'basic';
    
    if (!options?.template) {
      template = await select({
        message: 'Qual template você deseja usar?',
        choices: [
          {
            name: 'Basic - Bot simples com comandos básicos',
            value: 'basic',
            description: 'Template básico com comandos /start e /help'
          },
          {
            name: 'Express - Bot com servidor HTTP integrado',
            value: 'express',
            description: 'Bot com Express.js para webhooks e integrações'
          }
        ]
      });
    }

    // Validar template
    const validTemplates = ['basic', 'express'];
    if (!validTemplates.includes(template)) {
      throw new Error(`Template "${template}" inválido. Use: ${validTemplates.join(', ')}`);
    }

    // Verificar se o diretório já existe
    const projectPath = path.join(process.cwd(), projectName);
    if (fs.existsSync(projectPath)) {
      const overwrite = await confirm({
        message: `O diretório "${projectName}" já existe. Deseja sobrescrever?`,
        default: false
      });

      if (!overwrite) {
        console.log(chalk.yellow('\n⚠️  Operação cancelada'));
        process.exit(0);
      }

      fs.removeSync(projectPath);
    }

    // Criar diretório do projeto
    console.log(chalk.blue(`\n📁 Criando projeto em: ${projectPath}`));
    fs.ensureDirSync(projectPath);

    // Criar arquivos baseado no template
    console.log(chalk.blue(`\n📝 Gerando arquivos do template "${template}"...`));
    
    if (template === 'basic') {
      await createBasicTemplate(projectPath, projectName);
    } else if (template === 'express') {
      await createExpressTemplate(projectPath, projectName);
    }

    // Instalar dependências
    console.log(chalk.blue('\n📦 Instalando dependências...'));
    console.log(chalk.gray('   Isso pode levar alguns minutos...\n'));
    
    try {
      execSync('npm install', { 
        cwd: projectPath, 
        stdio: 'inherit'
      });
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Erro ao instalar dependências. Execute "npm install" manualmente.'));
    }

    // Sucesso!
    console.log(chalk.green.bold('\n✅ Projeto criado com sucesso!\n'));
    console.log(chalk.cyan('Para começar:\n'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  # Configure seu token no arquivo .env`));
    console.log(chalk.white(`  npm run dev\n`));

    if (template === 'express') {
      console.log(chalk.cyan('Recursos do template Express:\n'));
      console.log(chalk.white(`  - Bot Telegram com comandos básicos`));
      console.log(chalk.white(`  - Servidor HTTP na porta 3000`));
      console.log(chalk.white(`  - Rota de webhook para integrações`));
      console.log(chalk.white(`  - Rota de status do bot\n`));
    }

  } catch (error) {
    if ((error as any).name === 'ExitPromptError') {
      console.log(chalk.yellow('\n⚠️  Operação cancelada pelo usuário'));
      process.exit(0);
    }
    
    console.error(chalk.red('\n❌ Erro ao criar projeto:'), error);
    process.exit(1);
  }
}

