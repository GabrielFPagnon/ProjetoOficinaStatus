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
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ error: 'Erro ao criar veículo' });
  }
}

async function listarVeiculos(req, res) {
  try {
    const result = await db.query(
      `SELECT v.*, c.nome as proprietario_nome, c.telefone as proprietario_telefone 
       FROM veiculos v 
       JOIN clientes c ON c.id = v.cliente_id 
       ORDER BY v.id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro ao listar veículos' });
  }
}

async function criarOS(req, res) {
  const { veiculoId, descricaoProblema } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ordens_servico (veiculo_id, descricao_problema, status)
       VALUES ($1, $2, 'orcamento_pendente') RETURNING *`,
      [veiculoId, descricaoProblema]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    res.status(500).json({ error: 'Erro ao criar Ordem de Serviço' });
  }
}

async function listarOS(req, res) {
  try {
    const result = await db.query(
      `SELECT os.*, v.placa, v.modelo, v.marca, c.nome as cliente_nome, c.telefone as cliente_telefone
       FROM ordens_servico os
       JOIN veiculos v ON v.id = os.veiculo_id
       JOIN clientes c ON c.id = v.cliente_id
       ORDER BY os.id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar OS:', error);
    res.status(500).json({ error: 'Erro ao listar OS' });
  }
}

async function enviarOrcamento(req, res) {
  const { id } = req.params;
  const { valorTotal } = req.body;

  try {
    // 1. Verificar status atual da OS
    const checkOS = await db.query('SELECT status FROM ordens_servico WHERE id = $1', [id]);
    if (checkOS.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    }

    const statusAtual = checkOS.rows[0].status;
    if (statusAtual === 'aprovado' || statusAtual === 'concluido') {
      return res.status(400).json({ error: 'Não é possível alterar o valor de um orçamento já aprovado ou concluído!' });
    }

    // 2. Atualizar orçamento e mudar status para aguardando_aprovacao
    const osRes = await db.query(
      `UPDATE ordens_servico SET valor_total = $1, status = 'aguardando_aprovacao', atualizado_em = NOW() WHERE id = $2 RETURNING *`,
      [valorTotal, id]
    );

    const os = osRes.rows[0];

    // 3. Notificar via Telegram
    const canalRes = await db.query(
      `SELECT cu.chat_id, v.modelo, v.placa FROM ordens_servico os
       JOIN veiculos v ON v.id = os.veiculo_id
       JOIN canais_usuario cu ON cu.usuario_id = v.cliente_id
       WHERE os.id = $1 AND cu.ativo = true AND cu.plataforma = 'telegram'`,
      [id]
    );

    if (canalRes.rows.length > 0) {
      const { chat_id, modelo, placa } = canalRes.rows[0];
      const texto = `🛠 <b>Orçamento da OS #${os.id}</b>\nVeículo: <b>${modelo} (${placa})</b>\nValor: <b>R$ ${parseFloat(valorTotal).toFixed(2)}</b>\n\n${statusAtual === 'rejeitado' ? '⚠️ <i>Este é um novo orçamento revisado pela oficina.</i>' : ''}`;
      const botoes = [[
        { text: ' Aprovar', callback_data: `os:${os.id}:aprovar` },
        { text: ' Rejeitar', callback_data: `os:${os.id}:rejeitar` }
      ]];
      await telegramService.enviarMensagem(chat_id, texto, botoes);
    }

    res.json({ mensagem: 'Orçamento enviado!', os });
  } catch (error) {
    console.error('Erro ao enviar orçamento:', error);
    res.status(500).json({ error: 'Erro ao enviar orçamento' });
  }
}

async function atualizarStatusOS(req, res) {
  const { id } = req.params;
  let { status } = req.body;

  // Normalização exata para o ENUM status_os do PostgreSQL
  if (status === 'em_manutencao') status = 'em_execucao';
  if (status === 'pronto_para_retirada') status = 'pronto';
  if (status === 'concluido' || status === 'finalizado') status = 'entregue';

  try {
    const result = await db.query(
      `UPDATE ordens_servico SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    }

    const os = result.rows[0];

    // Busca o canal Telegram do cliente
    const canalRes = await db.query(
      `SELECT cu.chat_id, v.modelo, v.placa FROM ordens_servico os
       JOIN veiculos v ON v.id = os.veiculo_id
       JOIN canais_usuario cu ON cu.usuario_id = v.cliente_id
       WHERE os.id = $1 AND cu.ativo = true AND cu.plataforma = 'telegram'`,
      [id]
    );

    if (canalRes.rows.length > 0) {
      const { chat_id, modelo, placa } = canalRes.rows[0];
      let mensagemStatus = '';

      if (status === 'em_execucao') {
        mensagemStatus = ` <b>Status Atualizado - OS #${os.id}</b>\nO seu veículo <b>${modelo} (${placa})</b> já entrou em manutenção na oficina!`;
      } else if (status === 'pronto') {
        mensagemStatus = ` <b>Veículo Pronto! - OS #${os.id}</b>\nO serviço no seu veículo <b>${modelo} (${placa})</b> foi finalizado. Você já pode vir retirá-lo!`;
      } else if (status === 'entregue') {
        mensagemStatus = ` <b>OS Finalizada - OS #${os.id}</b>\nVeículo entregue! Muito obrigado por confiar na Oficina Status!`;
      }

      if (mensagemStatus) {
        await telegramService.enviarMensagem(chat_id, mensagemStatus);
      }
    }

    res.json(os);
  } catch (error) {
    console.error('Erro detalhado ao atualizar status da OS:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar status da OS.' });
  }
}

module.exports = {
  criarVeiculo,
  listarVeiculos,
  criarOS,
  listarOS,
  enviarOrcamento,
  atualizarStatusOS
};