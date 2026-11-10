const API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

/**
 * Envia mensagem via Telegram
 */
async function enviarMensagem(chatId, texto, botoes = null) {
  const body = {
    chat_id: chatId,
    text: texto,
    parse_mode: 'HTML',
  };

  if (botoes) {
    body.reply_markup = { inline_keyboard: botoes };
  }

  const response = await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  if (!json.ok) {
    const error = new Error(`Telegram Error ${json.error_code}: ${json.description}`);
    error.codigo = json.error_code;
    throw error;
  }

  return json.result.message_id; // Retorna o message_id para salvar em mensagens.id_externo
}

/**
 * Responde ao clique de botão para tirar o ícone de carregamento no Telegram
 */
async function responderCallback(callbackQueryId, texto = null) {
  await fetch(`${API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: texto,
    }),
  });
}

module.exports = {
  enviarMensagem,
  responderCallback,
};