# CLI - Bot Engine

O Bot Engine inclui uma ferramenta CLI (Command Line Interface) para facilitar a criação de novos projetos.

## Instalação

### Instalação Global

```bash
npm install -g bot-engine-telegram
```

### Uso com npx (sem instalação)

```bash
npx bot-engine-telegram init meu-bot
```

## Comandos

### `init` - Criar Novo Projeto

Cria um novo projeto com template configurado.

```bash
create-bot-engine init [nome-do-projeto] [opções]
```

#### Argumentos

- `nome-do-projeto` (opcional): Nome do projeto. Se não fornecido, será solicitado interativamente.

#### Opções

- `-t, --template <template>`: Template a ser usado. Valores: `basic`, `express` (padrão: `basic`)

#### Exemplos

**Modo Interativo:**

```bash
create-bot-engine init
```

Você será guiado através de um assistente interativo que perguntará:
1. Nome do projeto
2. Template desejado

**Modo Direto:**

```bash
# Criar projeto com template básico
create-bot-engine init meu-bot

# Criar projeto com template Express
create-bot-engine init meu-bot --template express
```

## Templates Disponíveis

### 1. Basic

Template simples com comandos básicos.

**Características:**
- Bot Telegram com comandos `/start`, `/help` e `/info`
- Logs básicos configurados
- Estrutura de projeto limpa
- Arquivo `.env` para configuração
- TypeScript configurado

**Estrutura:**

```
meu-bot/
├── src/
│   └── index.ts          # Arquivo principal
├── .env                  # Configurações
├── .env.example          # Exemplo de configurações
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**Uso:**

```bash
create-bot-engine init meu-bot --template basic
cd meu-bot
# Configure o BOT_TOKEN no arquivo .env
npm run dev
```

### 2. Express

Template com servidor HTTP integrado usando Express.

**Características:**
- Bot Telegram completo
- Servidor HTTP/REST API
- Rotas para webhooks
- Sistema de integrações
- CORS configurável
- Logs detalhados

**Estrutura:**

```
meu-bot/
├── src/
│   ├── routes/
│   │   ├── index.ts      # Rota principal
│   │   ├── status.ts     # Status do bot
│   │   └── webhook.ts    # Webhooks
│   ├── bot.ts            # Configuração do bot
│   ├── server.ts         # Configuração do Express
│   └── index.ts          # Arquivo principal
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**Uso:**

```bash
create-bot-engine init meu-bot --template express
cd meu-bot
# Configure o BOT_TOKEN no arquivo .env
npm run dev
```

**Endpoints Padrão:**

- `GET /` - Informações do bot
- `GET /health` - Health check
- `GET /status` - Status do bot e servidor
- `POST /webhook` - Webhook para integrações

## Após Criar o Projeto

### 1. Configure o Token

Edite o arquivo `.env`:

```env
BOT_TOKEN=seu_token_aqui
BOT_NAME=Nome do seu bot
```

Para obter um token:
1. Abra o Telegram
2. Procure por [@BotFather](https://t.me/BotFather)
3. Execute `/newbot`
4. Siga as instruções
5. Copie o token fornecido

### 2. Instale as Dependências

```bash
npm install
```

### 3. Execute o Bot

**Modo Desenvolvimento:**

```bash
npm run dev
```

**Modo Produção:**

```bash
npm run build
npm start
```

## Scripts Disponíveis

Todos os projetos criados incluem os seguintes scripts:

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript
- `npm start` - Executa a versão compilada
- `npm run watch` - Compila com watch mode

## Customização

### Adicionar Comandos

Edite `src/index.ts` (template basic) ou `src/bot.ts` (template express):

```typescript
bot.registerCommand({
  command: 'meucmd',
  description: 'Meu comando customizado',
  handler: async (ctx) => {
    await ctx.reply('Olá do meu comando!');
  }
});
```

### Adicionar Rotas HTTP (Template Express)

Crie um novo arquivo em `src/routes/`:

```typescript
import { Router } from 'express';

const router = Router();

router.get('/minha-rota', (req, res) => {
  res.json({ message: 'Minha rota!' });
});

export default router;
```

Importe em `src/server.ts`:

```typescript
import minhaRota from './routes/minha-rota';
app.use('/minha-rota', minhaRota);
```

## Exemplos de Uso

### Criar Bot Básico

```bash
# Criar projeto
npx create-bot-engine init bot-simples

# Entrar no diretório
cd bot-simples

# Configurar token no .env
echo "BOT_TOKEN=seu_token_aqui" > .env

# Instalar e executar
npm install
npm run dev
```

### Criar Bot com API

```bash
# Criar projeto com Express
npx create-bot-engine init bot-api --template express

# Entrar e configurar
cd bot-api
echo "BOT_TOKEN=seu_token_aqui" > .env
echo "PORT=3000" >> .env

# Instalar e executar
npm install
npm run dev
```

## Troubleshooting

### Erro: "BOT_TOKEN não configurado"

**Solução:** Configure o token no arquivo `.env`:

```env
BOT_TOKEN=123456:ABC-DEF...
```

### Erro: "Porta já em uso" (Template Express)

**Solução:** Altere a porta no arquivo `.env`:

```env
PORT=3001
```

### Bot não responde

**Verificações:**
1. Token está correto?
2. Bot está iniciado sem erros?
3. Você enviou `/start` no Telegram?

## Recursos Adicionais

- [Documentação do Framework](./framework.md)
- [Guia Rápido](./quick-start.md)
- [Integração HTTP](./http-integration.md)
- [Exemplos](../examples/)

## Suporte

- **Issues:** [GitHub Issues](https://github.com/NannAlmeida/bot-engine/issues)
- **Documentação:** [Docs](https://github.com/NannAlmeida/bot-engine)
- **Telegram:** [@BotEngine](https://t.me/bot_engine_framework)

