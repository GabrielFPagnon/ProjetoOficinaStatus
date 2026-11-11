const express = require('express');
const cors = require('cors');
require('dotenv').config();

const webhookController = require('./controllers/webhookController');
const clienteController = require('./controllers/clienteController');
const fipeController = require('./controllers/fipeController');
const osController = require('./controllers/osController');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', mensagem: 'Oficina Status API rodando perfeitamente!' });
});

app.post('/webhook/telegram', webhookController.handleTelegramWebhook);

// FIPE
app.get('/api/fipe/marcas', fipeController.listarMarcas);
app.get('/api/fipe/marcas/:marcaId/modelos', fipeController.listarModelos);
app.get('/api/fipe/marcas/:marcaId/modelos/:modeloId/anos/:anoId', fipeController.consultarValor);

// Clientes
app.post('/api/clientes', clienteController.criarCliente);
app.get('/api/clientes', clienteController.listarClientes);

// Veículos
app.post('/api/veiculos', osController.criarVeiculo);
app.get('/api/veiculos', osController.listarVeiculos);

// Ordens de Serviço
app.post('/api/os', osController.criarOS);
app.get('/api/os', osController.listarOS);
app.post('/api/os/:id/orcamento', osController.enviarOrcamento);
app.patch('/api/os/:id/status', osController.atualizarStatusOS);

module.exports = app;