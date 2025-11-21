/**
 * Testes para integração HTTP do BotEngine
 */

import { BotEngine } from '../../../src/framework/core/BotEngine';
import { ConsoleLogger } from '../../../src/framework/utils/Logger';
import request from 'supertest';

// Mock do Telegraf
jest.mock('telegraf', () => {
  return {
    Telegraf: jest.fn().mockImplementation(() => ({
      command: jest.fn(),
      action: jest.fn(),
      hears: jest.fn(),
      on: jest.fn(),
      use: jest.fn(),
      launch: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn(),
      catch: jest.fn(),
      telegram: {
        getMe: jest.fn().mockResolvedValue({
          id: 123456789,
          username: 'test_bot',
          first_name: 'Test Bot',
          is_bot: true
        }),
        sendMessage: jest.fn().mockResolvedValue({})
      },
      botInfo: {
        id: 123456789,
        username: 'test_bot',
        first_name: 'Test Bot'
      }
    }))
  };
});

describe('BotEngine - Integração HTTP', () => {
  let bot: BotEngine;
  let logger: ConsoleLogger;
  const TEST_TOKEN = 'test_token_123';

  beforeEach(() => {
    logger = new ConsoleLogger();
  });

  afterEach(async () => {
    // Limpar instância do bot
    // Não chamar stop aqui pois alguns testes já fazem isso
  });

  describe('Configuração HTTP', () => {
    it('deve criar bot sem servidor HTTP', () => {
      bot = new BotEngine(
        { token: TEST_TOKEN },
        logger
      );

      expect(bot.getHttpServer()).toBeUndefined();
    });

    it('deve criar bot com servidor HTTP', () => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          http: {
            enabled: true,
            port: 3002
          }
        },
        logger
      );

      const httpServer = bot.getHttpServer();
      expect(httpServer).toBeDefined();
      expect(httpServer?.getPort()).toBe(3002);
    });

    it('deve configurar CORS', () => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          http: {
            enabled: true,
            cors: true
          }
        },
        logger
      );

      expect(bot.getHttpServer()).toBeDefined();
    });
  });

  describe('Rotas Padrão', () => {
    beforeEach(() => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          name: 'Test Bot',
          description: 'Bot para testes',
          http: {
            enabled: true,
            port: 3003
          }
        },
        logger
      );
    });

    it('deve ter rota GET /', async () => {
      const httpServer = bot.getHttpServer();
      const app = httpServer?.getApp();

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Bot');
      expect(response.body.version).toBe('1.2.0');
      expect(response.body.endpoints).toBeDefined();
    });

    it('deve ter rota GET /health', async () => {
      const httpServer = bot.getHttpServer();
      const app = httpServer?.getApp();

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('deve ter rota GET /status', async () => {
      const httpServer = bot.getHttpServer();
      const app = httpServer?.getApp();

      const response = await request(app).get('/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('online');
      expect(response.body.bot).toBeDefined();
      expect(response.body.bot.username).toBe('test_bot');
      expect(response.body.server).toBeDefined();
    });
  });

  describe('Rotas Customizadas', () => {
    beforeEach(() => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          http: {
            enabled: true,
            port: 3004
          }
        },
        logger
      );
    });

    it('deve adicionar rota GET customizada', async () => {
      const httpServer = bot.getHttpServer();
      
      httpServer?.get('/custom', (req, res) => {
        res.json({ custom: true });
      });

      const app = httpServer?.getApp();
      const response = await request(app).get('/custom');

      expect(response.status).toBe(200);
      expect(response.body.custom).toBe(true);
    });

    it('deve adicionar rota POST customizada', async () => {
      const httpServer = bot.getHttpServer();
      
      httpServer?.post('/data', (req, res) => {
        res.json({ received: req.body });
      });

      const app = httpServer?.getApp();
      const response = await request(app)
        .post('/data')
        .send({ test: 'value' });

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'value' });
    });

    it('deve acessar bot via closure', async () => {
      const httpServer = bot.getHttpServer();
      
      httpServer?.get('/bot-info', (req, res) => {
        const info = bot.getBotInfo();
        res.json({ botId: info?.id });
      });

      const app = httpServer?.getApp();
      const response = await request(app).get('/bot-info');

      expect(response.status).toBe(200);
      expect(response.body.botId).toBe(123456789);
    });
  });

  describe('Integração Bot + HTTP', () => {
    beforeEach(() => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          http: {
            enabled: true,
            port: 3005
          }
        },
        logger
      );
    });

    it('deve registrar comando e criar webhook', async () => {
      bot.registerCommand({
        command: 'start',
        handler: async (ctx) => {
          await ctx.reply('Hello');
        }
      });

      const httpServer = bot.getHttpServer();
      
      httpServer?.post('/trigger-command', async (req, res) => {
        const { chatId } = req.body;
        
        try {
          const telegram = bot.getTelegrafInstance().telegram;
          await telegram.sendMessage(chatId, 'Triggered from HTTP');
          res.json({ success: true });
        } catch (error) {
          res.status(500).json({ success: false });
        }
      });

      const app = httpServer?.getApp();
      const response = await request(app)
        .post('/trigger-command')
        .send({ chatId: 123456 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve compartilhar logger entre bot e http', async () => {
      const httpServer = bot.getHttpServer();
      const botLogger = bot.getLogger();

      expect(botLogger).toBeDefined();

      httpServer?.get('/log-test', (req, res) => {
        botLogger.info('HTTP request received');
        res.json({ logged: true });
      });

      const app = httpServer?.getApp();
      const response = await request(app).get('/log-test');

      expect(response.status).toBe(200);
      expect(response.body.logged).toBe(true);
    });
  });

  describe('Launch e Stop', () => {
    it('deve iniciar bot e servidor HTTP', async () => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          http: {
            enabled: true,
            port: 3006
          }
        },
        logger
      );

      await expect(bot.launch()).resolves.not.toThrow();
      
      // Limpar
      bot.stop();
      const httpServer = bot.getHttpServer();
      if (httpServer) {
        await httpServer.stop();
      }
    });

    it('deve parar bot e servidor HTTP', async () => {
      bot = new BotEngine(
        {
          token: TEST_TOKEN,
          http: {
            enabled: true,
            port: 3007
          }
        },
        logger
      );

      await bot.launch();
      expect(() => bot.stop()).not.toThrow();
      
      // Aguardar um pouco para o servidor fechar
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});

