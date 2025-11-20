/**
 * Script para testar se a configuração está correta
 */

require('dotenv').config();

function testarConfiguracao() {
    console.log('🔍 Testando configuração do bot...\n');
    
    const erros = [];
    const avisos = [];
    
    // Testar dependências
    console.log('1. Testando dependências...');
    try {
        require('telegraf');
        console.log('   ✅ telegraf instalado');
    } catch (e) {
        erros.push('telegraf não instalado. Execute: npm install');
        console.log('   ❌ telegraf NÃO instalado');
    }
    
    try {
        require('dotenv');
        console.log('   ✅ dotenv instalado');
    } catch (e) {
        erros.push('dotenv não instalado. Execute: npm install');
        console.log('   ❌ dotenv NÃO instalado');
    }
    
    try {
        require('crc');
        console.log('   ✅ crc instalado');
    } catch (e) {
        erros.push('crc não instalado. Execute: npm install');
        console.log('   ❌ crc NÃO instalado');
    }
    
    console.log();
    
    // Testar variáveis de ambiente
    console.log('2. Testando variáveis de ambiente...');
    
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const PIX_KEY = process.env.PIX_KEY;
    const PIX_MERCHANT_NAME = process.env.PIX_MERCHANT_NAME;
    const PIX_MERCHANT_CITY = process.env.PIX_MERCHANT_CITY;
    
    if (!TOKEN || TOKEN === 'SEU_TOKEN_AQUI') {
        erros.push('Token do bot não configurado no arquivo .env');
        console.log('   ❌ Token não configurado');
    } else {
        console.log('   ✅ Token configurado');
    }
    
    if (!PIX_KEY || PIX_KEY === 'sua_chave_pix@email.com') {
        erros.push('Chave PIX não configurada no arquivo .env');
        console.log('   ❌ Chave PIX não configurada');
    } else {
        console.log('   ✅ Chave PIX configurada');
    }
    
    if (!PIX_MERCHANT_NAME || PIX_MERCHANT_NAME === 'Seu Nome ou Empresa' || PIX_MERCHANT_NAME === 'Seu Nome') {
        avisos.push('Nome do beneficiário ainda está com valor padrão');
        console.log('   ⚠️  Nome do beneficiário com valor padrão');
    } else {
        console.log('   ✅ Nome do beneficiário configurado');
    }
    
    if (!PIX_MERCHANT_CITY || PIX_MERCHANT_CITY === 'Sao Paulo') {
        avisos.push('Cidade ainda está com valor padrão (Sao Paulo)');
        console.log('   ⚠️  Cidade com valor padrão');
    } else {
        console.log('   ✅ Cidade configurada');
    }
    
    console.log();
    
    // Testar gerador de PIX
    console.log('3. Testando gerador de PIX...');
    try {
        const { gerarPixCopiaCola } = require('./pix-generator');
        
        const codigo = gerarPixCopiaCola({
            chave: 'teste@email.com',
            valor: 10.00,
            nomeBeneficiario: 'Teste',
            cidade: 'Sao Paulo',
            identificador: 'TEST123'
        });
        
        if (codigo && codigo.length > 50) {
            console.log('   ✅ Gerador de PIX funcionando');
            console.log(`   📝 Exemplo de código gerado: ${codigo.substring(0, 50)}...`);
        } else {
            erros.push('Gerador de PIX retornou código inválido');
            console.log('   ❌ Gerador de PIX com problema');
        }
    } catch (error) {
        erros.push(`Erro ao testar gerador de PIX: ${error.message}`);
        console.log(`   ❌ Erro ao testar gerador de PIX: ${error.message}`);
    }
    
    console.log();
    console.log('='.repeat(60));
    console.log();
    
    // Resumo
    if (erros.length === 0 && avisos.length === 0) {
        console.log('✅ SUCESSO! Tudo está configurado corretamente!');
        console.log();
        console.log('Próximo passo: Execute o bot com:');
        console.log('   npm start');
        return 0;
    }
    
    if (erros.length > 0) {
        console.log('❌ ERROS ENCONTRADOS:');
        erros.forEach((erro, i) => {
            console.log(`   ${i + 1}. ${erro}`);
        });
        console.log();
    }
    
    if (avisos.length > 0) {
        console.log('⚠️  AVISOS:');
        avisos.forEach((aviso, i) => {
            console.log(`   ${i + 1}. ${aviso}`);
        });
        console.log();
    }
    
    if (erros.length > 0) {
        console.log('Por favor, corrija os erros acima antes de executar o bot.');
        console.log('Consulte o arquivo README.md para mais detalhes.');
        return 1;
    } else {
        console.log('O bot pode funcionar, mas revise os avisos acima.');
        return 0;
    }
}

// Executar teste
process.exit(testarConfiguracao());

