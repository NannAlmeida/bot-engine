# 📦 Como Publicar no NPM

Guia passo a passo para publicar o framework no NPM.

## ✅ Pré-requisitos

1. Conta no NPM: https://www.npmjs.com/signup
2. NPM CLI instalado e atualizado
3. Login no NPM via terminal

## 🚀 Passos para Publicar

### 1. Login no NPM

```bash
npm login
```

Insira suas credenciais:
- Username
- Password
- Email
- OTP (se 2FA estiver ativado)

### 2. Verificar package.json

Certifique-se de que o `package.json` está correto:

```json
{
  "name": "bot-engine-telegram",
  "version": "1.0.0",
  "description": "A modern, modular TypeScript framework for building Telegram bots",
  "author": {
    "name": "Paulo Renan",
    "email": "rennandeveloper@gmail.com"
  },
  "license": "MIT"
}
```

### 3. Verificar arquivos a serem publicados

O `.npmignore` define o que NÃO será publicado. Será publicado:
- `dist/` - Código compilado
- `README.md` - Documentação
- `LICENSE` - Licença
- `package.json` - Metadados

Verificar com:
```bash
npm pack --dry-run
```

### 4. Compilar o projeto

```bash
npm run clean
npm run build
```

Verifique se compilou sem erros.

### 5. Atualizar versão (semver)

Para atualizações futuras:

```bash
# Patch: bug fixes (1.0.0 -> 1.0.1)
npm version patch

# Minor: new features (1.0.0 -> 1.1.0)
npm version minor

# Major: breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 6. Publicar

**Primeira publicação:**

```bash
npm publish --access public
```

**Publicações futuras:**

```bash
npm publish
```

### 7. Verificar publicação

Acesse: https://www.npmjs.com/package/bot-engine-telegram

## 📝 Checklist Antes de Publicar

- [ ] Código compilado sem erros (`npm run build`)
- [ ] README.md atualizado
- [ ] CHANGELOG.md atualizado (se houver)
- [ ] Versão atualizada no package.json
- [ ] Testes passando
- [ ] Documentação completa
- [ ] Exemplos funcionando
- [ ] LICENSE presente
- [ ] .npmignore configurado

## 🔄 Fluxo de Versionamento

### Primeira versão (1.0.0)
```bash
npm publish --access public
```

### Bug fix (1.0.0 -> 1.0.1)
```bash
# Corrigir bugs
npm version patch
npm publish
```

### Nova feature (1.0.1 -> 1.1.0)
```bash
# Adicionar features
npm version minor
npm publish
```

### Breaking change (1.1.0 -> 2.0.0)
```bash
# Mudanças incompatíveis
npm version major
npm publish
```

## 🏷️ Tags

Publicar com tag específica:

```bash
npm publish --tag beta
npm publish --tag next
npm publish --tag latest  # padrão
```

Instalar versão específica:
```bash
npm install bot-engine-telegram@beta
```

## 🔙 Despublicar (só nas primeiras 72h)

⚠️ Use com cuidado!

```bash
npm unpublish bot-engine-telegram@1.0.0
```

## 📊 Verificar Status

```bash
# Info do pacote
npm info bot-engine-telegram

# Versões publicadas
npm view bot-engine-telegram versions

# Downloads
npm view bot-engine-telegram downloads
```

## 🔗 Links Úteis

- NPM Registry: https://www.npmjs.com/
- NPM Docs: https://docs.npmjs.com/
- Semantic Versioning: https://semver.org/
- Package.json Docs: https://docs.npmjs.com/cli/v10/configuring-npm/package-json

## 🎯 Após Publicar

1. ✅ Verificar no NPM: https://www.npmjs.com/package/bot-engine-telegram
2. ✅ Testar instalação: `npm install bot-engine-telegram`
3. ✅ Criar release no GitHub
4. ✅ Atualizar README com badge do NPM
5. ✅ Anunciar em redes sociais (opcional)
6. ✅ Atualizar changelog

## 🛡️ Segurança

- Nunca commitar tokens ou credenciais
- Usar `.env` para variáveis sensíveis
- Adicionar `.env` no `.gitignore`
- Habilitar 2FA no NPM
- Usar access tokens para CI/CD

## 📧 Suporte

Dúvidas sobre publicação:
- Email: rennandeveloper@gmail.com
- NPM Support: https://www.npmjs.com/support

---

**Boa sorte com a publicação! 🚀**

**Paulo Renan** | rennandeveloper@gmail.com

