/**
 * Testes para o HttpServer
 */

import { HttpServer } from '../../../src/framework/core/HttpServer';
import { ConsoleLogger } from '../../../src/framework/utils/Logger';
import request from 'supertest';

describe('HttpServer', () => {
  let httpServer: HttpServer;
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
    httpServer = new HttpServer(
      {
        enabled: true,
        port: 3001,
        host: 'localhost',
        cors: true
      },
      logger
    );
  });

  afterEach(async () => {
    await httpServer.stop();
  });

  describe('Configuração', () => {
    it('deve criar instância do servidor', () => {
      expect(httpServer).toBeDefined();
      expect(httpServer.getPort()).toBe(3001);
      expect(httpServer.getHost()).toBe('localhost');
    });

    it('deve retornar a instância do Express', () => {
      const app = httpServer.getApp();
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('deve usar porta padrão se não especificada', () => {
      const server = new HttpServer(
        { enabled: true },
        logger
      );
      expect(server.getPort()).toBe(3000);
    });

    it('deve usar host padrão se não especificado', () => {
      const server = new HttpServer(
        { enabled: true },
        logger
      );
      expect(server.getHost()).toBe('localhost');
    });
  });

  describe('Rotas', () => {
    it('deve registrar rota GET', async () => {
      httpServer.get('/test', (req, res) => {
        res.json({ message: 'GET test' });
      });

      const app = httpServer.getApp();
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'GET test' });
    });

    it('deve registrar rota POST', async () => {
      httpServer.post('/test', (req, res) => {
        res.json({ message: 'POST test', data: req.body });
      });

      const app = httpServer.getApp();
      const response = await request(app)
        .post('/test')
        .send({ key: 'value' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('POST test');
      expect(response.body.data).toEqual({ key: 'value' });
    });

    it('deve registrar rota PUT', async () => {
      httpServer.put('/test/:id', (req, res) => {
        res.json({ id: req.params.id, updated: true });
      });

      const app = httpServer.getApp();
      const response = await request(app).put('/test/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: '123', updated: true });
    });

    it('deve registrar rota DELETE', async () => {
      httpServer.delete('/test/:id', (req, res) => {
        res.json({ id: req.params.id, deleted: true });
      });

      const app = httpServer.getApp();
      const response = await request(app).delete('/test/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: '123', deleted: true });
    });
  });

  describe('Middleware', () => {
    it('deve processar JSON body', async () => {
      httpServer.post('/data', (req, res) => {
        res.json(req.body);
      });

      const app = httpServer.getApp();
      const response = await request(app)
        .post('/data')
        .send({ name: 'Test', value: 123 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ name: 'Test', value: 123 });
    });

    it('deve adicionar middleware customizado', async () => {
      let middlewareExecuted = false;

      httpServer.use((req, res, next) => {
        middlewareExecuted = true;
        next();
      });

      httpServer.get('/test', (req, res) => {
        res.json({ ok: true });
      });

      const app = httpServer.getApp();
      await request(app).get('/test');

      expect(middlewareExecuted).toBe(true);
    });

    it('deve adicionar middleware em rota específica', async () => {
      let specificMiddlewareExecuted = false;

      httpServer.use('/protected', (req, res, next) => {
        specificMiddlewareExecuted = true;
        next();
      });

      httpServer.get('/protected/data', (req, res) => {
        res.json({ protected: true });
      });

      httpServer.get('/public/data', (req, res) => {
        res.json({ public: true });
      });

      const app = httpServer.getApp();
      
      // Reset flag
      specificMiddlewareExecuted = false;
      await request(app).get('/protected/data');
      expect(specificMiddlewareExecuted).toBe(true);

      // Reset flag
      specificMiddlewareExecuted = false;
      await request(app).get('/public/data');
      expect(specificMiddlewareExecuted).toBe(false);
    });
  });

  describe('CORS', () => {
    it('deve adicionar headers CORS quando habilitado', async () => {
      httpServer.get('/test', (req, res) => {
        res.json({ ok: true });
      });

      const app = httpServer.getApp();
      const response = await request(app).get('/test');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('deve configurar CORS customizado', async () => {
      const customServer = new HttpServer(
        {
          enabled: true,
          cors: {
            origin: 'https://example.com',
            credentials: true
          }
        },
        logger
      );

      customServer.get('/test', (req, res) => {
        res.json({ ok: true });
      });

      const app = customServer.getApp();
      const response = await request(app).get('/test');

      expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
      expect(response.headers['access-control-allow-credentials']).toBe('true');

      await customServer.stop();
    });

    it('deve responder OPTIONS request', async () => {
      httpServer.post('/test', (req, res) => {
        res.json({ ok: true });
      });

      const app = httpServer.getApp();
      const response = await request(app).options('/test');

      expect(response.status).toBe(200);
    });
  });

  describe('Ciclo de Vida', () => {
    it('deve iniciar servidor', async () => {
      await expect(httpServer.start()).resolves.not.toThrow();
    });

    it('deve parar servidor', async () => {
      const testServer = new HttpServer(
        { enabled: true, port: 3010 },
        logger
      );
      await testServer.start();
      await expect(testServer.stop()).resolves.not.toThrow();
    });

    it('deve permitir múltiplas chamadas de stop', async () => {
      await httpServer.stop();
      await expect(httpServer.stop()).resolves.not.toThrow();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar 404 para rotas não encontradas', async () => {
      const app = httpServer.getApp();
      const response = await request(app).get('/rota-inexistente');

      expect(response.status).toBe(404);
    });

    it('deve tratar erros em handlers', async () => {
      httpServer.get('/error', (req, res) => {
        throw new Error('Erro de teste');
      });

      const app = httpServer.getApp();
      const response = await request(app).get('/error');

      expect(response.status).toBe(500);
    });
  });
});

