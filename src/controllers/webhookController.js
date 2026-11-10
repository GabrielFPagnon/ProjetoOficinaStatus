const db = require('../database');
const telegramService = require('../services/telegram');

async function handleTelegramWebhook(req, res) {
  const secretHeader = req.get('X-Telegram-Bot-Api-Secret-Token');
  if (secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).send('Não autorizado');
  }

  res.sendStatus(200);
  const update = req.body;

  try {
    if (update.message) {
      const msg = update.message;
      const text = msg.text || '';
      const chatId = msg.chat.id.toString();

      if (text.startsWith('/start ')) {
        const codigoConvite = text.split(' ')[1];
        const clienteRes = await db.query('SELECT id FROM clientes WHERE id::text = $1', [codigoConvite]);

        if (clienteRes.rows.length > 0) {
          const clienteId = clienteRes.rows[0].id;
          const canalRes = await db.query(
            `INSERT INTO canais_usuario (usuario_id, plataforma, chat_id, codigo_convite, ativo)
             VALUES ($1, 'telegram', $2, $3, true)
             ON CONFLICT (plataforma, chat_id) DO UPDATE SET ativo = true, usuario_id = $1
             RETURNING id`,
            [clienteId, chatId, codigoConvite]
          );

          await db.query(
            `INSERT INTO mensagens (canal_usuario_id, plataforma, direcao, id_externo, conteudo, status, payload_bruto)
             VALUES ($1, 'telegram', 'entrada', $2, $3, 'respondida', $4)`,
            [canalRes.rows[0].id, msg.message_id.toString(), text, update]
          );

          await telegramService.enviarMensagem(chatId, ' Cadastro vinculado à Oficina Status!');
        } else {
          await telegramService.enviarMensagem(chatId, ' Código inválido.');
        }
      }
    }

    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message.chat.id.toString();
      const [entidade, osId, acao] = cq.data.split(':');

      if (entidade === 'os') {
        const novoStatus = acao === 'aprovar' ? 'aprovado' : 'rejeitado';
        await db.query('UPDATE ordens_servico SET status = $1, atualizado_em = NOW() WHERE id = $2', [novoStatus, osId]);
        await db.query('INSERT INTO etapas (ordem_servico_id, status, observacao) VALUES ($1, $2, $3)', [osId, novoStatus, `Cliente respondeu: ${acao}`]);
        await telegramService.responderCallback(cq.id, `Status: ${novoStatus}`);
        await telegramService.enviarMensagem(chatId, `OS #${osId} atualizada para: <b>${novoStatus.toUpperCase()}</b>.`);
      }
    }
  } catch (err) {
    console.error('Erro no webhook:', err);
  }
}

module.exports = { handleTelegramWebhook };