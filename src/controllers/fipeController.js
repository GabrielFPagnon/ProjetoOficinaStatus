// src/controllers/fipeController.js
const fipeService = require('../services/fipe');

async function listarMarcas(req, res) {
  try {
    const marcas = await fipeService.getMarcas();
    res.json(marcas);
  } catch (error) {
    console.error('Erro detalhado ao buscar marcas FIPE:', error.message || error);
    res.status(500).json({ error: 'Erro ao buscar marcas' });
  }
}

async function listarModelos(req, res) {
  try {
    const modelos = await fipeService.getModelos(req.params.marcaId);
    res.json(modelos);
  } catch (error) {
    console.error('Erro detalhado ao buscar modelos FIPE:', error.message || error);
    res.status(500).json({ error: 'Erro ao buscar modelos' });
  }
}

async function consultarValor(req, res) {
  try {
    const dados = await fipeService.getValorFipe(req.params.marcaId, req.params.modeloId, req.params.anoId);
    res.json(dados);
  } catch (error) {
    console.error('Erro detalhado ao consultar valor FIPE:', error.message || error);
    res.status(500).json({ error: 'Erro ao consultar FIPE' });
  }
}

module.exports = { listarMarcas, listarModelos, consultarValor };