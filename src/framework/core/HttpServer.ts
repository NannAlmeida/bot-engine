/**
 * Servidor HTTP integrado com Express
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { HttpServerConfig, IHttpServer, HttpHandler, ILogger } from '../types/interfaces';

export class HttpServer implements IHttpServer {
  private app: Application;
  private server?: Server;
  private config: HttpServerConfig;
  private logger: ILogger;

  constructor(config: HttpServerConfig, logger: ILogger) {
    this.config = config;
    this.logger = logger;
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * Configura middleware básico
   */
  private setupMiddleware(): void {
    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    if (this.config.cors) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        if (typeof this.config.cors === 'object') {
          if (this.config.cors.origin) {
            const origin = Array.isArray(this.config.cors.origin)
              ? this.config.cors.origin.join(', ')
              : this.config.cors.origin;
            res.header('Access-Control-Allow-Origin', origin);
          }
          if (this.config.cors.credentials) {
            res.header('Access-Control-Allow-Credentials', 'true');
          }
        } else {
          res.header('Access-Control-Allow-Origin', '*');
        }
        
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        
        next();
      });
    }

    // Request logger
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.logger.debug(`HTTP ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Adiciona uma rota GET
   */
  get(path: string, handler: HttpHandler): void {
    this.logger.debug(`Registrando rota GET: ${path}`);
    this.app.get(path, handler as any);
  }

  /**
   * Adiciona uma rota POST
   */
  post(path: string, handler: HttpHandler): void {
    this.logger.debug(`Registrando rota POST: ${path}`);
    this.app.post(path, handler as any);
  }

  /**
   * Adiciona uma rota PUT
   */
  put(path: string, handler: HttpHandler): void {
    this.logger.debug(`Registrando rota PUT: ${path}`);
    this.app.put(path, handler as any);
  }

  /**
   * Adiciona uma rota DELETE
   */
  delete(path: string, handler: HttpHandler): void {
    this.logger.debug(`Registrando rota DELETE: ${path}`);
    this.app.delete(path, handler as any);
  }

  /**
   * Adiciona middleware HTTP
   */
  use(pathOrHandler: string | HttpHandler, middleware?: HttpHandler): void {
    if (typeof pathOrHandler === 'string') {
      if (middleware) {
        this.app.use(pathOrHandler, middleware as any);
      }
    } else {
      this.app.use(pathOrHandler as any);
    }
  }

  /**
   * Obtém a instância do Express
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Obtém a porta do servidor
   */
  getPort(): number {
    return this.config.port || 3000;
  }

  /**
   * Obtém o host do servidor
   */
  getHost(): string {
    return this.config.host || 'localhost';
  }

  /**
   * Inicia o servidor HTTP
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const port = this.getPort();
        const host = this.getHost();

        this.server = this.app.listen(port, host, () => {
          this.logger.info(`🌐 Servidor HTTP iniciado em http://${host}:${port}`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            this.logger.error(`Porta ${port} já está em uso`, error);
          } else {
            this.logger.error('Erro no servidor HTTP', error);
          }
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Para o servidor HTTP
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server || !this.server.listening) {
        resolve();
        return;
      }

      this.server.close((error) => {
        if (error) {
          this.logger.error('Erro ao parar servidor HTTP', error);
          reject(error);
        } else {
          this.logger.info('🌐 Servidor HTTP parado');
          this.server = undefined;
          resolve();
        }
      });
    });
  }
}

