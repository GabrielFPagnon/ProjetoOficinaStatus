import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Users, Car, Plus, Send, CheckCircle2, Clock, AlertTriangle, ChevronRight, Menu, X } from 'lucide-react';

const API_BASE = 'https://oficina-status-api-dwh6e3ccf4hgb6eq.eastus-01.azurewebsites.net/api';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('os');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Estados de Dados
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);

  // Estados de Formulários
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

  const [erroPlaca, setErroPlaca] = useState('');
  const [novaOS, setNovaOS] = useState({ veiculoId: '', descricaoProblema: '' });

  // Estados de Envio de Orçamento
  const [osSelecionadaId, setOsSelecionadaId] = useState('');
  const [valorInput, setValorInput] = useState('');

  useEffect(() => {
    carregarClientes();
    carregarVeiculos();
    carregarMarcasFipe();
    carregarOrdensServico();
  }, []);

  const carregarClientes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clientes`);
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const carregarVeiculos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/veiculos`);
      setVeiculos(res.data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
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

  const carregarOrdensServico = async () => {
    try {
      const res = await axios.get(`${API_BASE}/os`);
      setOrdensServico(res.data);
    } catch (err) {
      console.error('Erro ao carregar OS:', err);
    }
  };

  const handleMarcaChange = async (e) => {
    const marcaId = e.target.value;
    const marcaObj = marcas.find(m => m.codigo.toString() === marcaId.toString());

    setNovoVeiculo({
      ...novoVeiculo,
      marcaId,
      marca: marcaObj ? marcaObj.nome : '',
      modeloId: '',
      modelo: ''
    });

    if (marcaId) {
      try {
        const res = await axios.get(`${API_BASE}/fipe/marcas/${marcaId}/modelos`);
        const listaModelos = res.data.modelos || res.data;
        setModelos(Array.isArray(listaModelos) ? listaModelos : []);
      } catch (err) {
        console.error('Erro ao carregar modelos FIPE:', err);
        setModelos([]);
      }
    } else {
      setModelos([]);
    }
  };

  const handlePlacaChange = (e) => {
    const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    setNovoVeiculo({ ...novoVeiculo, placa: valor });

    const regexPlacaMercosul = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    const regexPlacaTradicional = /^[A-Z]{3}-?[0-9]{4}$/;

    if (valor.length > 0 && !regexPlacaMercosul.test(valor) && !regexPlacaTradicional.test(valor)) {
      setErroPlaca('Placa inválida! Use o formato Mercosul (ABC1D23) ou Tradicional (ABC-1234).');
    } else {
      setErroPlaca('');
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

    const regexPlacaMercosul = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    const regexPlacaTradicional = /^[A-Z]{3}-?[0-9]{4}$/;

    if (!regexPlacaMercosul.test(novoVeiculo.placa) && !regexPlacaTradicional.test(novoVeiculo.placa)) {
      alert('Por favor, informe uma placa válida no padrão DETRAN.');
      return;
    }

    try {
      const payload = {
        clienteId: parseInt(novoVeiculo.clienteId, 10),
        placa: novoVeiculo.placa,
        codigoFipe: novoVeiculo.codigoFipe || 'N/A',
        marca: novoVeiculo.marca,
        modelo: novoVeiculo.modelo,
        anoModelo: novoVeiculo.anoModelo ? parseInt(novoVeiculo.anoModelo, 10) : new Date().getFullYear(),
        valorFipe: parseFloat(novoVeiculo.valorFipe) || 0
      };

      await axios.post(`${API_BASE}/veiculos`, payload);
      alert('Veículo cadastrado com sucesso!');
      setNovoVeiculo({ clienteId: '', placa: '', marcaId: '', marca: '', modeloId: '', modelo: '', anoModelo: '', valorFipe: 0 });
      setModelos([]);
      setErroPlaca('');
      carregarVeiculos();
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar veículo');
    }
  };

  const handleCriarOS = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/os`, {
        veiculoId: parseInt(novaOS.veiculoId, 10),
        descricaoProblema: novaOS.descricaoProblema
      });
      alert(`OS #${res.data.id} criada com sucesso!`);
      setNovaOS({ veiculoId: '', descricaoProblema: '' });
      carregarOrdensServico();
    } catch (err) {
      alert('Erro ao criar Ordem de Serviço');
    }
  };

  const handleEnviarOrcamento = async () => {
    if (!osSelecionadaId || !valorInput || parseFloat(valorInput) <= 0) {
      alert('Selecione uma OS e informe um valor de orçamento válido!');
      return;
    }

    try {
      await axios.post(`${API_BASE}/os/${osSelecionadaId}/orcamento`, {
        valorTotal: parseFloat(valorInput)
      });
      alert(`Orçamento da OS #${osSelecionadaId} enviado ao Telegram!`);
      setOsSelecionadaId('');
      setValorInput('');
      carregarOrdensServico();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao enviar orçamento para o Telegram.');
    }
  };

  const handleMudarEtapa = async (osId, novoStatus) => {
    try {
      await axios.patch(`${API_BASE}/os/${osId}/status`, { status: novoStatus });
      alert(`Status da OS #${osId} atualizado para '${novoStatus}' e notificação enviada no Telegram!`);
      carregarOrdensServico();
    } catch (err) {
      alert('Erro ao atualizar etapa da OS.');
    }
  };

  const navegarPara = (aba) => {
    setAbaAtiva(aba);
    setMenuMobileAberto(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Header Mobile */}
      <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base leading-tight">Oficina Status</span>
        </div>
        <button
          onClick={() => setMenuMobileAberto(!menuMobileAberto)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 focus:outline-none"
        >
          {menuMobileAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Desktop & Overlay Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${menuMobileAberto ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          <div className="hidden md:flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Oficina Status</h1>
              <span className="text-xs text-blue-400 font-medium">Gestão Integrada</span>
            </div>
          </div>

          <nav className="space-y-2 mt-12 md:mt-0">
            <button
              onClick={() => navegarPara('os')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${abaAtiva === 'os' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            >
              <Wrench className="w-5 h-5" /> Ordens de Serviço
            </button>

            <button
              onClick={() => navegarPara('clientes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${abaAtiva === 'clientes' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            >
              <Users className="w-5 h-5" /> Clientes
            </button>

            <button
              onClick={() => navegarPara('veiculos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${abaAtiva === 'veiculos' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
            >
              <Car className="w-5 h-5" /> Veículos
            </button>
          </nav>
        </div>

        <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-4">
          Sistema Integrado Telegram API
        </div>
      </aside>

      {/* Backdrop para fechar menu no mobile */}
      {menuMobileAberto && (
        <div
          onClick={() => setMenuMobileAberto(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold">Cadastro de Clientes e Opt-in Telegram</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <form onSubmit={handleCriarCliente} className="bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
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

              {clienteCriado && (
                <div className="bg-blue-950/40 border border-blue-500/30 p-5 sm:p-6 rounded-2xl space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Link de Opt-in Gerado!
                  </h3>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 break-all text-xs font-mono text-blue-300">
                    {clienteCriado.deepLink}
                  </div>
                  <a href={clienteCriado.deepLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
                    Abrir no Telegram <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VEÍCULOS */}
        {abaAtiva === 'veiculos' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold">Cadastro de Veículos (API FIPE)</h2>
            <form onSubmit={handleCriarVeiculo} className="bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Proprietário</label>
                <select
                  required
                  value={novoVeiculo.clienteId}
                  onChange={e => setNovoVeiculo({ ...novoVeiculo, clienteId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Selecione o Cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.telefone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    value={novoVeiculo.placa}
                    onChange={handlePlacaChange}
                    className={`w-full bg-slate-900 border ${erroPlaca ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono uppercase text-sm sm:text-base`}
                    placeholder="ABC1D23"
                  />
                  {erroPlaca && <p className="text-xs text-red-400 mt-1">{erroPlaca}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Marca (FIPE)</label>
                  {/* Select de Marcas FIPE Seguro */}
                  <select
                    required
                    value={novoVeiculo.marcaId}
                    onChange={handleMarcaChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Selecione a Marca</option>
                    {Array.isArray(marcas) && marcas.map(m => (
                      <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Modelo</label>
                {modelos.length > 0 ? (
                  <select
                    required
                    value={novoVeiculo.modeloId}
                    onChange={handleModeloChange}
                    disabled={!novoVeiculo.marcaId}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base disabled:opacity-50"
                  >
                    <option value="">Selecione o Modelo</option>
                    {Array.isArray(modelos) && modelos.map(m => (
                      <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={novoVeiculo.modelo}
                    onChange={e => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Ex: Palio Attractiveness 1.0"
                  />
                )}
              </div>

              <button type="submit" disabled={!!erroPlaca} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-3 rounded-xl font-medium transition">
                Salvar Veículo
              </button>
            </form>
          </div>
        )}

        {/* ORDENS DE SERVIÇO */}
        {abaAtiva === 'os' && (
          <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold">Painel de Ordens de Serviço (OS)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Formulário de Abertura de OS */}
              <form onSubmit={handleCriarOS} className="bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Abrir Nova OS</h3>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Veículo Cadastrado</label>
                  <select
                    required
                    value={novaOS.veiculoId}
                    onChange={e => setNovaOS({ ...novaOS, veiculoId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Selecione o Veículo</option>
                    {veiculos.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.placa} - {v.modelo} ({v.proprietario_nome})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Descrição do Serviço</label>
                  <textarea
                    required
                    rows="3"
                    value={novaOS.descricaoProblema}
                    onChange={e => setNovaOS({ ...novaOS, descricaoProblema: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Ex: Troca de pastilhas e alinhamento"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Abrir Ordem de Serviço
                </button>
              </form>

              {/* Envio de Orçamento */}
              <div className="bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                  <Send className="w-5 h-5" /> Disparar / Reenviar Orçamento
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Ordem de Serviço</label>
                    <select
                      value={osSelecionadaId}
                      onChange={e => setOsSelecionadaId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    >
                      <option value="">Selecione a OS</option>
                      {ordensServico.map(os => (
                        <option
                          key={os.id}
                          value={os.id}
                          disabled={os.status === 'aprovado' || os.status === 'entregue' || os.status === 'concluido'}
                        >
                          OS #{os.id} - {os.placa} [{os.status.toUpperCase()}] {(os.status === 'aprovado' || os.status === 'entregue') ? '(Bloqueado)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Valor Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorInput}
                      onChange={e => setValorInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Ex: 480.00"
                    />
                  </div>
                  <button
                    onClick={handleEnviarOrcamento}
                    className="w-full bg-blue-300 hover:bg-blue-900 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 text-white"
                  >
                    <Send className="w-4 h-4" /> Enviar Orçamento ao Telegram
                  </button>
                </div>
              </div>
            </div>

            {/* Listagem das OS e Ações de Etapa */}
            <div className="bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Ordens de Serviço Ativas</h3>
              <div className="space-y-3">
                {ordensServico.map(os => (
                  <div key={os.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-blue-400">OS #{os.id}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                          {os.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{os.modelo} - <span className="font-mono text-slate-400">{os.placa}</span> ({os.cliente_nome})</p>
                      <p className="text-xs text-slate-400 mt-0.5">{os.descricao_problema}</p>
                      {os.valor_total && <p className="text-xs text-green-400 font-bold mt-1">Valor: R$ {parseFloat(os.valor_total).toFixed(2)}</p>}
                    </div>

                    {/* Botões de Avanço de Etapa com Notificação no Telegram */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {os.status === 'aprovado' && (
                        <button onClick={() => handleMudarEtapa(os.id, 'em_execucao')} className="w-full sm:w-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-xs font-semibold rounded-lg transition">
                          Iniciar Manutenção
                        </button>
                      )}
                      {os.status === 'em_execucao' && (
                        <button onClick={() => handleMudarEtapa(os.id, 'pronto')} className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg transition">
                          Marcar como Pronto
                        </button>
                      )}
                      {os.status === 'pronto' && (
                        <button onClick={() => handleMudarEtapa(os.id, 'entregue')} className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-500 text-xs font-semibold rounded-lg transition">
                          Finalizar OS (Entregue)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}