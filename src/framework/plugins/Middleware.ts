/**
 * Middleware base e middlewares comuns
 */

import { IMiddleware, BotContext } from '../types/interfaces';

/**
 * Classe base para middleware
 */
export abstract class Middleware implements IMiddleware {
  abstract name: string;
  abstract execute(ctx: BotContext, next: () => Promise<void>): Promise<void>;
}

/**
 * Middleware de logging
 */
export class LoggingMiddleware extends Middleware {
  name = 'logging';

  async execute(ctx: BotContext, next: () => Promise<void>): Promise<void> {
    const start = Date.now();
    const userId = ctx.from?.id;
    const username = ctx.from?.username;
    const updateType = ctx.updateType;

    console.log(`📨 [${new Date().toISOString()}] Usuário: ${username || userId} | Tipo: ${updateType}`);

    await next();

    const duration = Date.now() - start;
    console.log(`✅ [${new Date().toISOString()}] Processado em ${duration}ms`);
  }
}

/**
 * Middleware de autenticação
 */
export class AuthMiddleware extends Middleware {
  name = 'auth';

  constructor(private allowedUsers?: number[]) {
    super();
  }

  async execute(ctx: BotContext, next: () => Promise<void>): Promise<void> {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply('❌ Não foi possível identificar o usuário.');
      return;
    }

    // Se há lista de usuários permitidos, verificar
    if (this.allowedUsers && !this.allowedUsers.includes(userId)) {
      await ctx.reply('❌ Você não tem permissão para usar este bot.');
      return;
    }

    await next();
  }
}

/**
 * Middleware de rate limiting
 */
export class RateLimitMiddleware extends Middleware {
  name = 'rate-limit';
  private requests: Map<number, number[]> = new Map();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minuto
  ) {
    super();
    
    // Limpar dados antigos a cada minuto
    setInterval(() => this.cleanup(), 60000);
  }

  async execute(ctx: BotContext, next: () => Promise<void>): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) {
      await next();
      return;
    }

    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Filtrar requisições dentro da janela de tempo
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      await ctx.reply('⏱️ Você está enviando muitas requisições. Por favor, aguarde um momento.');
      return;
    }

    // Adicionar nova requisição
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);

    await next();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [userId, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => now - t < this.windowMs);
      if (recent.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, recent);
      }
    }
  }
}

/**
 * Middleware de tratamento de erros
 */
export class ErrorHandlerMiddleware extends Middleware {
  name = 'error-handler';

  async execute(ctx: BotContext, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (error) {
      console.error('Erro capturado pelo middleware:', error);
      
      try {
        await ctx.reply('❌ Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      } catch (replyError) {
        console.error('Erro ao enviar mensagem de erro:', replyError);
      }
    }
  }
}

