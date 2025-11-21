/**
 * Exemplo de bot com servidor HTTP integrado
 * Demonstra como usar o Bot Engine com Express para criar webhooks e rotas personalizadas
 */

import 'dotenv/config';
import { BotEngine } from '../src/framework';

// Validar token
if (!process.env.BOT_TOKEN) {
  console.error('❌ Erro: BOT_TOKEN não configurado');
  process.exit(1);
}

// Criar bot com servidor HTTP
const bot = new BotEngine({
  token: process.env.BOT_TOKEN,
  name: 'Bot com HTTP',
  description: 'Bot Telegram com servidor HTTP integrado',
  http: {
    enabled: true,
    port: 3000,
    host: 'localhost',
    cors: true
  }
});

const logger = bot.getLogger();

logger.info('🚀 Inicializando bot com servidor HTTP...');

// Comandos do bot
bot.registerCommand({
  command: 'start',
  description: 'Inicia a conversa',
  handler: async (ctx) => {
    const userName = ctx.from?.first_name || 'Usuário';
    logger.info(`Comando /start - Usuário: ${userName} (${ctx.from?.id})`);
    
    await ctx.reply(
      `👋 Olá, ${userName}!\n\n` +
      `Este bot possui integração com servidor HTTP.\n` +
      `Acesse http://localhost:3000 para ver as rotas disponíveis.`
    );
  }
});

bot.registerCommand({
  command: 'help',
  description: 'Mostra ajuda',
  handler: async (ctx) => {
    logger.info(`Comando /help - Usuário: ${ctx.from?.id}`);
    
    await ctx.reply(
      `📚 *Comandos disponíveis:*\n\n` +
      `/start - Inicia a conversa\n` +
      `/help - Mostra esta mensagem\n` +
      `/status - Status do bot\n\n` +
      `*API HTTP:*\n` +
      `GET /health - Health check\n` +
      `GET /status - Status do bot\n` +
      `POST /webhook/send - Enviar mensagem`,
      { parse_mode: 'Markdown' }
    );
  }
});

bot.registerCommand({
  command: 'status',
  description: 'Mostra o status do bot',
  handler: async (ctx) => {
    logger.info(`Comando /status - Usuário: ${ctx.from?.id}`);
    
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    await ctx.reply(
      `✅ *Bot Online*\n\n` +
      `⏱ Uptime: ${hours}h ${minutes}m\n` +
      `🌐 HTTP: http://localhost:3000`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Configurar rotas HTTP personalizadas
const httpServer = bot.getHttpServer();

if (httpServer) {
  logger.info('🌐 Configurando rotas HTTP...');

  // Rota para enviar mensagens via webhook
  httpServer.post('/webhook/send', async (req, res) => {
    try {
      const { chatId, message } = req.body;

      if (!chatId || !message) {
        logger.warn('Webhook: Parâmetros inválidos recebidos');
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          required: ['chatId', 'message']
        });
      }

      logger.info(`Webhook: Enviando mensagem para chat ${chatId}`);

      // Enviar mensagem via Telegram
      const telegram = bot.getTelegrafInstance().telegram;
      await telegram.sendMessage(chatId, message);

      logger.info(`Webhook: Mensagem enviada com sucesso para ${chatId}`);

      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        chatId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Webhook: Erro ao enviar mensagem', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagem',
        details: (error as Error).message
      });
    }
  });

  // Rota para obter informações do bot
  httpServer.get('/bot/info', async (req, res) => {
    try {
      logger.info('HTTP: Requisição de informações do bot');
      
      const botInfo = bot.getBotInfo();
      
      res.json({
        id: botInfo?.id,
        username: botInfo?.username,
        firstName: botInfo?.first_name,
        canJoinGroups: botInfo?.can_join_groups,
        canReadAllGroupMessages: botInfo?.can_read_all_group_messages,
        supportsInlineQueries: botInfo?.supports_inline_queries
      });
    } catch (error) {
      logger.error('HTTP: Erro ao obter informações do bot', error as Error);
      
      res.status(500).json({
        error: 'Erro ao obter informações do bot'
      });
    }
  });

  // Rota para webhook de integração externa
  httpServer.post('/webhook/integration', async (req, res) => {
    try {
      logger.info('Webhook: Integração externa recebida', req.body);
      
      const { event, data } = req.body;

      // Processar diferentes tipos de eventos
      switch (event) {
        case 'user.created':
          logger.info(`Evento: Novo usuário criado - ${data.name}`);
          // Aqui você pode enviar uma notificação para um chat específico
          break;

        case 'order.completed':
          logger.info(`Evento: Pedido completado - ${data.orderId}`);
          // Enviar notificação sobre o pedido
          break;

        case 'alert':
          logger.warn(`Alerta recebido: ${data.message}`);
          // Enviar alerta para administradores
          break;

        default:
          logger.warn(`Evento desconhecido: ${event}`);
      }

      res.json({
        success: true,
        message: 'Evento processado',
        event,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Webhook: Erro ao processar integração', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Erro ao processar evento'
      });
    }
  });

  // Rota de estatísticas
  httpServer.get('/stats', (req, res) => {
    logger.info('HTTP: Requisição de estatísticas');
    
    const memUsage = process.memoryUsage();
    
    res.json({
      uptime: process.uptime(),
      memory: {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
      },
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    });
  });

  logger.info('✓ Rotas HTTP configuradas');
}

// Iniciar bot
bot.launch()
  .then(() => {
    logger.info('✅ Bot iniciado com sucesso!');
    logger.info('');
    logger.info('📡 Endpoints disponíveis:');
    logger.info('   GET  http://localhost:3000/');
    logger.info('   GET  http://localhost:3000/health');
    logger.info('   GET  http://localhost:3000/status');
    logger.info('   GET  http://localhost:3000/bot/info');
    logger.info('   GET  http://localhost:3000/stats');
    logger.info('   POST http://localhost:3000/webhook/send');
    logger.info('   POST http://localhost:3000/webhook/integration');
    logger.info('');
    logger.info('💡 Teste o webhook com:');
    logger.info('   curl -X POST http://localhost:3000/webhook/send \\');
    logger.info('     -H "Content-Type: application/json" \\');
    logger.info('     -d \'{"chatId": "SEU_CHAT_ID", "message": "Olá do webhook!"}\'');
  })
  .catch((error) => {
    logger.error('❌ Erro ao iniciar bot', error);
    process.exit(1);
  });

// Graceful shutdown
process.once('SIGINT', () => {
  logger.info('🛑 Recebido SIGINT, encerrando...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  logger.info('🛑 Recebido SIGTERM, encerrando...');
  bot.stop('SIGTERM');
});

