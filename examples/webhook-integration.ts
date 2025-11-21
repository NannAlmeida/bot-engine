/**
 * Exemplo de integração com webhooks externos
 * Demonstra como receber eventos de sistemas externos e notificar via Telegram
 */

import 'dotenv/config';
import { BotEngine } from '../src/framework';

if (!process.env.BOT_TOKEN) {
  console.error('❌ Erro: BOT_TOKEN não configurado');
  process.exit(1);
}

// Chat ID do administrador (configure no .env)
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new BotEngine({
  token: process.env.BOT_TOKEN,
  name: 'Webhook Integration Bot',
  description: 'Bot para integração com webhooks externos',
  http: {
    enabled: true,
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  }
});

const logger = bot.getLogger();
const telegram = bot.getTelegrafInstance().telegram;

// Mapa para armazenar usuários registrados
const registeredUsers = new Map<number, { username?: string; notifications: boolean }>();

// Comandos do bot
bot.registerCommand({
  command: 'start',
  description: 'Registra para receber notificações',
  handler: async (ctx) => {
    const userId = ctx.from!.id;
    const userName = ctx.from?.first_name;

    registeredUsers.set(userId, {
      username: ctx.from?.username,
      notifications: true
    });

    logger.info(`Usuário registrado: ${userName} (${userId})`);

    await ctx.reply(
      `✅ *Registrado com sucesso!*\n\n` +
      `Você receberá notificações quando eventos externos ocorrerem.\n\n` +
      `*Comandos:*\n` +
      `/stop - Parar notificações\n` +
      `/resume - Retomar notificações\n` +
      `/status - Ver seu status`,
      { parse_mode: 'Markdown' }
    );
  }
});

bot.registerCommand({
  command: 'stop',
  description: 'Para de receber notificações',
  handler: async (ctx) => {
    const userId = ctx.from!.id;
    const user = registeredUsers.get(userId);

    if (user) {
      user.notifications = false;
      await ctx.reply('⏸ Notificações pausadas. Use /resume para reativar.');
    } else {
      await ctx.reply('❌ Você não está registrado. Use /start primeiro.');
    }
  }
});

bot.registerCommand({
  command: 'resume',
  description: 'Retoma as notificações',
  handler: async (ctx) => {
    const userId = ctx.from!.id;
    const user = registeredUsers.get(userId);

    if (user) {
      user.notifications = true;
      await ctx.reply('▶️ Notificações reativadas!');
    } else {
      await ctx.reply('❌ Você não está registrado. Use /start primeiro.');
    }
  }
});

bot.registerCommand({
  command: 'status',
  description: 'Mostra o status atual',
  handler: async (ctx) => {
    const userId = ctx.from!.id;
    const user = registeredUsers.get(userId);

    if (user) {
      const status = user.notifications ? '✅ Ativo' : '⏸ Pausado';
      await ctx.reply(
        `📊 *Status*\n\n` +
        `ID: \`${userId}\`\n` +
        `Username: @${user.username || 'N/A'}\n` +
        `Notificações: ${status}`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.reply('❌ Você não está registrado. Use /start primeiro.');
    }
  }
});

// Configurar webhooks
const httpServer = bot.getHttpServer();

if (httpServer) {
  // Webhook para notificações de pagamento
  httpServer.post('/webhook/payment', async (req, res) => {
    try {
      const { orderId, amount, status, customerName, customerEmail } = req.body;

      logger.info(`Webhook de pagamento recebido: ${orderId} - ${status}`);

      let message = '';
      let emoji = '';

      switch (status) {
        case 'completed':
          emoji = '✅';
          message = `*Pagamento Aprovado!*\n\n` +
                   `Pedido: \`${orderId}\`\n` +
                   `Valor: R$ ${amount.toFixed(2)}\n` +
                   `Cliente: ${customerName}\n` +
                   `Email: ${customerEmail}`;
          break;

        case 'pending':
          emoji = '⏳';
          message = `*Pagamento Pendente*\n\n` +
                   `Pedido: \`${orderId}\`\n` +
                   `Valor: R$ ${amount.toFixed(2)}\n` +
                   `Cliente: ${customerName}`;
          break;

        case 'failed':
          emoji = '❌';
          message = `*Pagamento Falhou*\n\n` +
                   `Pedido: \`${orderId}\`\n` +
                   `Valor: R$ ${amount.toFixed(2)}\n` +
                   `Cliente: ${customerName}`;
          break;

        default:
          message = `*Status de Pagamento: ${status}*\n\n` +
                   `Pedido: \`${orderId}\`\n` +
                   `Valor: R$ ${amount.toFixed(2)}`;
      }

      // Enviar para todos os usuários registrados
      for (const [userId, user] of registeredUsers) {
        if (user.notifications) {
          try {
            await telegram.sendMessage(userId, `${emoji} ${message}`, {
              parse_mode: 'Markdown'
            });
          } catch (error) {
            logger.error(`Erro ao enviar para usuário ${userId}`, error as Error);
          }
        }
      }

      // Enviar para administrador se configurado
      if (ADMIN_CHAT_ID) {
        await telegram.sendMessage(ADMIN_CHAT_ID, `${emoji} ${message}`, {
          parse_mode: 'Markdown'
        });
      }

      res.json({ success: true, message: 'Notificação enviada' });
    } catch (error) {
      logger.error('Erro no webhook de pagamento', error as Error);
      res.status(500).json({ success: false, error: 'Erro ao processar webhook' });
    }
  });

  // Webhook para alertas do sistema
  httpServer.post('/webhook/alert', async (req, res) => {
    try {
      const { level, title, message, details } = req.body;

      logger.warn(`Alerta recebido: [${level}] ${title}`);

      const emojiMap: Record<string, string> = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🚨',
        critical: '🔴'
      };

      const emoji = emojiMap[level] || '📢';
      const alertMessage = `${emoji} *${title}*\n\n` +
                          `${message}\n\n` +
                          (details ? `_${details}_` : '');

      // Enviar apenas para administrador
      if (ADMIN_CHAT_ID) {
        await telegram.sendMessage(ADMIN_CHAT_ID, alertMessage, {
          parse_mode: 'Markdown'
        });
      } else {
        logger.warn('ADMIN_CHAT_ID não configurado, alerta não enviado');
      }

      res.json({ success: true, message: 'Alerta processado' });
    } catch (error) {
      logger.error('Erro no webhook de alerta', error as Error);
      res.status(500).json({ success: false, error: 'Erro ao processar alerta' });
    }
  });

  // Webhook genérico para notificações customizadas
  httpServer.post('/webhook/notify', async (req, res) => {
    try {
      const { chatId, message, parseMode = 'Markdown' } = req.body;

      if (!chatId || !message) {
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          required: ['chatId', 'message']
        });
      }

      logger.info(`Enviando notificação customizada para ${chatId}`);

      await telegram.sendMessage(chatId, message, {
        parse_mode: parseMode as any
      });

      res.json({ success: true, message: 'Notificação enviada' });
    } catch (error) {
      logger.error('Erro ao enviar notificação', error as Error);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar notificação',
        details: (error as Error).message
      });
    }
  });

  // Endpoint para listar usuários registrados (apenas admin)
  httpServer.get('/users/registered', (req, res) => {
    const users = Array.from(registeredUsers.entries()).map(([userId, user]) => ({
      userId,
      username: user.username,
      notifications: user.notifications
    }));

    res.json({
      total: users.length,
      users
    });
  });
}

// Iniciar bot
bot.launch()
  .then(() => {
    logger.info('✅ Bot de integração iniciado!');
    logger.info('');
    logger.info('🔗 Webhooks disponíveis:');
    logger.info(`   POST http://localhost:${bot.getHttpServer()?.getPort()}/webhook/payment`);
    logger.info(`   POST http://localhost:${bot.getHttpServer()?.getPort()}/webhook/alert`);
    logger.info(`   POST http://localhost:${bot.getHttpServer()?.getPort()}/webhook/notify`);
    logger.info('');
    logger.info('💡 Exemplos de uso:');
    logger.info('');
    logger.info('   # Notificação de pagamento');
    logger.info('   curl -X POST http://localhost:3000/webhook/payment \\');
    logger.info('     -H "Content-Type: application/json" \\');
    logger.info('     -d \'{"orderId":"123","amount":99.90,"status":"completed","customerName":"João Silva","customerEmail":"joao@email.com"}\'');
    logger.info('');
    logger.info('   # Alerta do sistema');
    logger.info('   curl -X POST http://localhost:3000/webhook/alert \\');
    logger.info('     -H "Content-Type: application/json" \\');
    logger.info('     -d \'{"level":"warning","title":"Alto uso de CPU","message":"Servidor está com 90% de CPU","details":"Verificar processos"}\'');
  })
  .catch((error) => {
    logger.error('❌ Erro ao iniciar bot', error);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

