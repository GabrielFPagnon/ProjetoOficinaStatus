import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Users, Car, Plus, Send, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('os'); // 'os', 'clientes', 'veiculos'

  // Estados dos Dados
  const [clientes, setClientes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [valorFipe, setValorFipe] = useState(null);

  // Estados dos Formulários
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '' });
  const [clienteCriado, setClienteCriado] = useState(null);

  const [novoVeiculo, setNovoVeiculo] = useState({
    clienteId: '',
    placa: '',
    marcaId: '',
    marca: '',
    modeloId: '',
    modelo: '',
    anoModelo: '',
    valorFipe: 0
  });

  const [novaOS, setNovaOS] = useState({ veiculoId: '', descricaoProblema: '' });
  const [valorOrcamento, setValorOrcamento] = useState({});

  // Carregar dados iniciais
  useEffect(() => {
    carregarClientes();
    carregarMarcasFipe();
  }, []);

  const carregarClientes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clientes`);
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const carregarMarcasFipe = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fipe/marcas`);
      setMarcas(res.data);
    } catch (err) {
      console.error('Erro ao carregar FIPE:', err);
    }
  };

  const handleMarcaChange = async (e) => {
    const marcaId = e.target.value;
    const marcaObj = marcas.find(m => m.codigo === marcaId);
    setNovoVeiculo({ ...novoVeiculo, marcaId, marca: marcaObj ? marcaObj.nome : '' });
    
    if (marcaId) {
      const res = await axios.get(`${API_BASE}/fipe/marcas/${marcaId}/modelos`);
      setModelos(res.data);
    }
  };

  const handleCriarCliente = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/clientes`, novoCliente);
      setClienteCriado(res.data);
      setNovoCliente({ nome: '', telefone: '' });
      carregarClientes();
    } catch (err) {
      alert('Erro ao cadastrar cliente');
    }
  };

  const handleCriarVeiculo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/veiculos`, novoVeiculo);
      alert('Veículo cadastrado com sucesso!');
      setNovoVeiculo({ clienteId: '', placa: '', marcaId: '', marca: '', modeloId: '', modelo: '', anoModelo: '', valorFipe: 0 });
    } catch (err) {
      alert('Erro ao cadastrar veículo');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar / Menu Lateral */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Oficina Status</h1>
              <span className="text-xs text-blue-400 font-medium">Gestão Integrada</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setAbaAtiva('os')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${abaAtiva === 'os' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            >
              <Wrench className="w-5 h-5" /> Ordens de Serviço
            </button>

            <button
              onClick={() => setAbaAtiva('clientes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${abaAtiva === 'clientes' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            >
              <Users className="w-5 h-5" /> Clientes & Telegram
            </button>

            <button
              onClick={() => setAbaAtiva('veiculos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${abaAtiva === 'veiculos' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            >
              <Car className="w-5 h-5" /> Veículos & FIPE
            </button>
          </nav>
        </div>

        <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-4">
          Sistema Integrado Telegram API
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cadastro de Clientes e Opt-in Telegram</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <form onSubmit={handleCriarCliente} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Novo Cliente</h3>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={novoCliente.nome}
                    onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                    placeholder="Ex: Gabriel Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Telefone / Contato</label>
                  <input
                    type="text"
                    required
                    value={novoCliente.telefone}
                    onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                    placeholder="Ex: (42) 99999-9999"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Cadastrar Cliente
                </button>
              </form>

              {/* Exibição do Link de Opt-in do Telegram */}
              {clienteCriado && (
                <div className="bg-blue-950/40 border border-blue-500/30 p-6 rounded-2xl space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Link de Opt-in Gerado!
                  </h3>
                  <p className="text-sm text-slate-300">
                    Envie o link abaixo para o cliente ou peça para ele escanear o código no balcão:
                  </p>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 break-all text-xs font-mono text-blue-300">
                    {clienteCriado.deepLink}
                  </div>
                  <a
                    href={clienteCriado.deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
                  >
                    Abrir no Telegram <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VEÍCULOS (FIPE) */}
        {abaAtiva === 'veiculos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cadastro de Veículos (API FIPE)</h2>
            <form onSubmit={handleCriarVeiculo} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-2xl space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Proprietário</label>
                <select
                  required
                  value={novoVeiculo.clienteId}
                  onChange={e => setNovoVeiculo({ ...novoVeiculo, clienteId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione o Cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.telefone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    value={novoVeiculo.placa}
                    onChange={e => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                    placeholder="ABC1D23"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Marca (FIPE)</label>
                  <select
                    required
                    value={novoVeiculo.marcaId}
                    onChange={handleMarcaChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione a Marca</option>
                    {marcas.map(m => (
                      <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Modelo</label>
                <input
                  type="text"
                  required
                  value={novoVeiculo.modelo}
                  onChange={e => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Palio Attractiveness 1.0"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-medium transition">
                Salvar Veículo
              </button>
            </form>
          </div>
        )}

        {/* ORDENS DE SERVIÇO */}
        {abaAtiva === 'os' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Painel de Ordens de Serviço (OS)</h2>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400">
                Selecione as ações para enviar orçamentos diretos ao Telegram do cliete para que ele aprove!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}