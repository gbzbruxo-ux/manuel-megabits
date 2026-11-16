const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('sessao')
    const sock = makeWASocket({ logger: P({ level: 'silent' }), auth: state, printQRInTerminal: false, browser: ['MANUEL MEGABITS', 'Chrome', '1.0'] })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Conexão fechada, reconectando...', shouldReconnect)
            if (shouldReconnect) start()
        } else if (connection === 'open') {
            console.log('BOT LIGADO! - MANUEL MEGABITS')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const from = msg.key.remoteJid
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase().trim()

        const preco = `🚀📶 TABELA DE MEGAS — MANUEL MEGABITS 📶🚀

━━━━━━━━━━━━━━━━━━

💰 PACOTES DE INTERNET 🌐

🔹 10 MT ➜ 📱 500 MB
🔹 15 MT ➜ 📱 750 MB
🔹 20 MT ➜ 📱 1.000 MB
🔹 25 MT ➜ 📱 1.250 MB
🔹 30 MT ➜ 📱 1.500 MB
🔹 35 MT ➜ 📱 1.750 MB
🔹 40 MT ➜ 📱 2.000 MB
🔹 50 MT ➜ 📱 2.500 MB
🔹 60 MT ➜ 📱 3.000 MB
🔹 70 MT ➜ 📱 3.500 MB
🔹 80 MT ➜ 📱 4.000 MB
🔹 90 MT ➜ 📱 4.500 MB
🔹 100 MT ➜ 📱 5.000 MB
🔹 150 MT ➜ 📱 7.500 MB
🔹 200 MT ➜ 📱 10.000 MB

━━━━━━━━━━━━━━━━━━

⚡📲 MANUEL MEGABITS 🚀

🌐 Internet rápida, simples e acessível! 💯

💸 Preços acessíveis ⚡ Transferências rápidas 📶 Mais megas para navegar 🤝 Atendimento de confiança

🔥 ESCOLHE O TEU PACOTE E APROVEITA! 🔥

🚀 MANUEL MEGABITS — Conectando-te ao mundo digital! 🌍📱

Escreve *!pagamento* para pagar
Escreve *!pedido* para pedir`

        const pagamento = `💳 PAGAMENTO - MANUEL MEGABITS 💳

M-Pesa: 851084903 - Fátima
E-Mola: 868892879 - Alberto

Depois de pagar envia comprovativo aqui!

Mensagem ou chamada: 868 892 879`

        const pedido = `🛒 FAZER PEDIDO - MANUEL MEGABITS

Para pedir, envia assim:

Nome:
Pacote que queres (ex: 100MT - 5GB):
Número que vai receber:

Exemplo:
Manuel, 100MT, 851084903

Depois faz pagamento com *!pagamento*`

        if (text === '!preco' || text === '!preço' || text === '!precos' || text === '!tabela' || text === '!megas') {
            await sock.sendMessage(from, { text: preco })
        }
        if (text === '!pagamento' || text === '!pagar') {
            await sock.sendMessage(from, { text: pagamento })
        }
        if (text === '!pedido' || text === '!comprar') {
            await sock.sendMessage(from, { text: pedido })
        }
        if (text === '!menu' || text === '!ajuda' || text === 'oi' || text === 'ola' || text === 'olá') {
            await sock.sendMessage(from, { text: `👋 Olá! Bem-vindo à MANUEL MEGABITS 🔥\n\nEscreve:\n*!preco* - Ver tabela completa\n*!pagamento* - Ver como pagar\n*!pedido* - Fazer pedido` })
        }
    })

    if (!sock.authState.creds.registered) {
        const numero = '258851084903'
        setTimeout(async () => {
            const code = await sock.requestPairingCode(numero)
            console.log('TEU CODIGO E: ' + code)
        }, 3000)
    }
}
start()
