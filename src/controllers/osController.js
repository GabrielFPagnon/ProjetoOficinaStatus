const db = require('../database');
const telegramService = require('../services/telegram');

async function criarVeiculo(req, res) {
  const { clienteId, placa, codigoFipe, marca, modelo, anoModelo, valorFipe } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO veiculos (cliente_id, placa, codigo_fipe, marca, modelo, ano_modelo, valor_fipe)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [clienteId, placa, codigoFipe, marca, modelo, anoModelo, valorFipe]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar veículo' });
  }
}

async function criarOS(req, res) {
  const { veiculoId, descricaoProblema } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ordens_servico (veiculo_id, status, descricao_problema) VALUES ($1, 'orcamento_pendente', $2) RETURNING *`,
      [veiculoId, descricaoProblema]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar OS' });
  }
}

async function enviarOrcamento(req, res) {
  const { id } = req.params;
  const { valorTotal } = req.body;
  try {
    const osRes = await db.query(
      `UPDATE ordens_servico SET valor_total = $1, status = 'aguardando_aprovacao', atualizado_em = NOW() WHERE id = $2 RETURNING *`,
      [valorTotal, id]
    );
    const os = osRes.rows[0];

    const canalRes = await db.query(
      `SELECT cu.chat_id, v.modelo, v.placa FROM ordens_servico os
       JOIN veiculos v ON v.id = os.veiculo_id
       JOIN canais_usuario cu ON cu.usuario_id = v.cliente_id
       WHERE os.id = $1 AND cu.ativo = true AND cu.plataforma = 'telegram'`,
      [id]
    );

    if (canalRes.rows.length > 0) {
      const { chat_id, modelo, placa } = canalRes.rows[0];
      const texto = ` <b>Orçamento - OS #${os.id}</b>\nVeículo: <b>${modelo} (${placa})</b>\nValor: <b>R$ ${parseFloat(valorTotal).toFixed(2)}</b>`;
      const botoes = [[
        { text: ' Aprovar', callback_data: `os:${os.id}:aprovar` },
        { text: ' Rejeitar', callback_data: `os:${os.id}:rejeitar` }
      ]];
      await telegramService.enviarMensagem(chat_id, texto, botoes);
    }

    res.json({ mensagem: 'Orçamento enviado!', os });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar orçamento' });
  }
}

async function atualizarStatusOS(req, res) {
  const { id } = req.params;
  const { novoStatus } = req.body;
  try {
    const osRes = await db.query('UPDATE ordens_servico SET status = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *', [novoStatus, id]);
    res.json(osRes.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
}

module.exports = { criarVeiculo, criarOS, enviarOrcamento, atualizarStatusOS };