/**
 * Testes para os templates do CLI
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { createBasicTemplate } from '../../src/cli/templates/basic';
import { createExpressTemplate } from '../../src/cli/templates/express';

describe('CLI Templates', () => {
  const testProjectsDir = path.join(__dirname, '../tmp-projects');

  beforeAll(() => {
    fs.ensureDirSync(testProjectsDir);
  });

  afterAll(() => {
    fs.removeSync(testProjectsDir);
  });

  describe('Basic Template', () => {
    const projectName = 'test-basic-bot';
    const projectPath = path.join(testProjectsDir, projectName);

    beforeEach(async () => {
      if (fs.existsSync(projectPath)) {
        fs.removeSync(projectPath);
      }
      await createBasicTemplate(projectPath, projectName);
    });

    it('deve criar estrutura de diretórios', () => {
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src'))).toBe(true);
    });

    it('deve criar package.json', () => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = fs.readJsonSync(packageJsonPath);
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.dependencies['bot-engine-telegram']).toBeDefined();
      expect(packageJson.dependencies['telegraf']).toBeDefined();
      expect(packageJson.dependencies['dotenv']).toBeDefined();
    });

    it('deve criar tsconfig.json', () => {
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const tsconfig = fs.readJsonSync(tsconfigPath);
      expect(tsconfig.compilerOptions.target).toBe('ES2020');
      expect(tsconfig.compilerOptions.module).toBe('commonjs');
    });

    it('deve criar arquivo .env.example', () => {
      const envExamplePath = path.join(projectPath, '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);

      const content = fs.readFileSync(envExamplePath, 'utf8');
      expect(content).toContain('BOT_TOKEN');
      expect(content).toContain('BOT_NAME');
    });

    it('deve criar arquivo .env', () => {
      const envPath = path.join(projectPath, '.env');
      expect(fs.existsSync(envPath)).toBe(true);
    });

    it('deve criar arquivo .gitignore', () => {
      const gitignorePath = path.join(projectPath, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const content = fs.readFileSync(gitignorePath, 'utf8');
      expect(content).toContain('node_modules');
      expect(content).toContain('.env');
      expect(content).toContain('dist');
    });

    it('deve criar README.md', () => {
      const readmePath = path.join(projectPath, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);

      const content = fs.readFileSync(readmePath, 'utf8');
      expect(content).toContain(projectName);
      expect(content).toContain('Bot Engine');
    });

    it('deve criar src/index.ts', () => {
      const indexPath = path.join(projectPath, 'src', 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);

      const content = fs.readFileSync(indexPath, 'utf8');
      expect(content).toContain('BotEngine');
      expect(content).toContain('registerCommand');
      expect(content).toContain('start');
      expect(content).toContain('help');
      expect(content).toContain('info');
    });

    it('deve ter scripts npm configurados', () => {
      const packageJson = fs.readJsonSync(path.join(projectPath, 'package.json'));
      
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.watch).toBeDefined();
    });
  });

  describe('Express Template', () => {
    const projectName = 'test-express-bot';
    const projectPath = path.join(testProjectsDir, projectName);

    beforeEach(async () => {
      if (fs.existsSync(projectPath)) {
        fs.removeSync(projectPath);
      }
      await createExpressTemplate(projectPath, projectName);
    });

    it('deve criar estrutura de diretórios completa', () => {
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'routes'))).toBe(true);
    });

    it('deve criar package.json com Express', () => {
      const packageJson = fs.readJsonSync(path.join(projectPath, 'package.json'));
      
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.dependencies['bot-engine-telegram']).toBeDefined();
      expect(packageJson.dependencies['express']).toBeDefined();
      expect(packageJson.dependencies['telegraf']).toBeDefined();
      expect(packageJson.devDependencies['@types/express']).toBeDefined();
    });

    it('deve criar arquivos de configuração do Express', () => {
      expect(fs.existsSync(path.join(projectPath, 'src', 'bot.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'server.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'index.ts'))).toBe(true);
    });

    it('deve criar rotas HTTP', () => {
      expect(fs.existsSync(path.join(projectPath, 'src', 'routes', 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'routes', 'status.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'routes', 'webhook.ts'))).toBe(true);
    });

    it('deve ter configurações de porta no .env.example', () => {
      const content = fs.readFileSync(path.join(projectPath, '.env.example'), 'utf8');
      
      expect(content).toContain('BOT_TOKEN');
      expect(content).toContain('PORT');
      expect(content).toContain('HOST');
    });

    it('deve criar src/bot.ts com comandos', () => {
      const content = fs.readFileSync(path.join(projectPath, 'src', 'bot.ts'), 'utf8');
      
      expect(content).toContain('createBot');
      expect(content).toContain('BotEngine');
      expect(content).toContain('registerCommand');
    });

    it('deve criar src/server.ts com Express', () => {
      const content = fs.readFileSync(path.join(projectPath, 'src', 'server.ts'), 'utf8');
      
      expect(content).toContain('express');
      expect(content).toContain('createServer');
      expect(content).toContain('app.use');
    });

    it('deve criar src/index.ts integrando bot e server', () => {
      const content = fs.readFileSync(path.join(projectPath, 'src', 'index.ts'), 'utf8');
      
      expect(content).toContain('createBot');
      expect(content).toContain('createServer');
      expect(content).toContain('bot.launch');
      expect(content).toContain('app.listen');
    });

    it('deve ter rotas de webhook configuradas', () => {
      const content = fs.readFileSync(
        path.join(projectPath, 'src', 'routes', 'webhook.ts'),
        'utf8'
      );
      
      expect(content).toContain('webhook');
      expect(content).toContain('router.post');
      expect(content).toContain('sendMessage');
    });

    it('deve ter README com documentação do Express', () => {
      const content = fs.readFileSync(path.join(projectPath, 'README.md'), 'utf8');
      
      expect(content).toContain('Express');
      expect(content).toContain('HTTP');
      expect(content).toContain('webhook');
      expect(content).toContain('Endpoints');
    });
  });

  describe('Validação de Arquivos', () => {
    it('template basic deve ter todos os arquivos necessários', async () => {
      const projectPath = path.join(testProjectsDir, 'validation-basic');
      await createBasicTemplate(projectPath, 'validation-basic');

      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        '.env',
        '.env.example',
        '.gitignore',
        'README.md',
        'src/index.ts'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(projectPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('template express deve ter todos os arquivos necessários', async () => {
      const projectPath = path.join(testProjectsDir, 'validation-express');
      await createExpressTemplate(projectPath, 'validation-express');

      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        '.env',
        '.env.example',
        '.gitignore',
        'README.md',
        'src/index.ts',
        'src/bot.ts',
        'src/server.ts',
        'src/routes/index.ts',
        'src/routes/status.ts',
        'src/routes/webhook.ts'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(projectPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });
  });

  describe('Conteúdo dos Arquivos', () => {
    it('deve gerar código TypeScript válido no basic template', async () => {
      const projectPath = path.join(testProjectsDir, 'syntax-basic');
      await createBasicTemplate(projectPath, 'syntax-basic');

      const indexContent = fs.readFileSync(
        path.join(projectPath, 'src', 'index.ts'),
        'utf8'
      );

      // Verificar imports
      expect(indexContent).toMatch(/import.*from.*bot-engine-telegram/);
      expect(indexContent).toMatch(/import.*dotenv/);

      // Verificar criação do bot
      expect(indexContent).toMatch(/new BotEngine/);
      expect(indexContent).toMatch(/bot\.registerCommand/);
      expect(indexContent).toMatch(/bot\.launch/);
    });

    it('deve gerar código TypeScript válido no express template', async () => {
      const projectPath = path.join(testProjectsDir, 'syntax-express');
      await createExpressTemplate(projectPath, 'syntax-express');

      // Verificar bot.ts
      const botContent = fs.readFileSync(
        path.join(projectPath, 'src', 'bot.ts'),
        'utf8'
      );
      expect(botContent).toMatch(/export function createBot/);
      expect(botContent).toMatch(/new BotEngine/);

      // Verificar server.ts
      const serverContent = fs.readFileSync(
        path.join(projectPath, 'src', 'server.ts'),
        'utf8'
      );
      expect(serverContent).toMatch(/export function createServer/);
      expect(serverContent).toMatch(/express\(\)/);
    });
  });
});

