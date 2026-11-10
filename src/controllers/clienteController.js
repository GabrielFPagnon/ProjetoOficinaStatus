// src/controllers/clienteController.js
const db = require('../database');

async function criarCliente(req, res) {
  const { nome, telefone } = req.body;
  
  try {
    const result = await db.query(
      'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING *',
      [nome, telefone]
    );
    
    const cliente = result.rows[0];
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'seu_bot';
    const deepLink = `https://t.me/${botUsername}?start=${cliente.id}`;
    
    res.status(201).json({ cliente, deepLink });
  } catch (error) {
    // Adicione esta linha para exibir a mensagem do Postgres no terminal:
    console.error('Erro detalhado no Postgres ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
}

async function listarClientes(req, res) {
  try {
    const result = await db.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
}

module.exports = { criarCliente, listarClientes };