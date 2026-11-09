CREATE TYPE status_os AS ENUM (
  'orcamento_pendente',
  'aguardando_aprovacao',
  'aprovado',
  'rejeitado',
  'em_execucao',
  'pronto',
  'entregue'
);

-- Tabela de Usuários/Funcionários da Oficina (Admin, Atendente, Mecânico)
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('admin', 'atendente', 'mecanico')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Veículos 
CREATE TABLE veiculos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa VARCHAR(10) NOT NULL UNIQUE,
  codigo_fipe VARCHAR(20),
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano_modelo INT NOT NULL,
  valor_fipe NUMERIC(10, 2),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Ordens de Serviço 
CREATE TABLE ordens_servico (
  id BIGSERIAL PRIMARY KEY,
  veiculo_id BIGINT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  status status_os NOT NULL DEFAULT 'orcamento_pendente',
  descricao_problema TEXT NOT NULL,
  valor_total NUMERIC(10, 2) DEFAULT 0.00,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de Etapas das Ordens de Serviço
CREATE TABLE etapas (
  id BIGSERIAL PRIMARY KEY,
  ordem_servico_id BIGINT NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  status status_os NOT NULL,
  observacao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--- Down Migration SQL:
-- DROP TABLE IF EXISTS etapas;
-- DROP TABLE IF EXISTS ordens_servico;
-- DROP TABLE IF EXISTS veiculos;
-- DROP TABLE IF EXISTS usuarios;
-- DROP TYPE IF EXISTS status_os;