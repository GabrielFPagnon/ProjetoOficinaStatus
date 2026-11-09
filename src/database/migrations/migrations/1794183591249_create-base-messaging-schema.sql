/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};

-- Up Migration (Criação dos tipos e tabelas base)

CREATE TYPE plataforma_msg AS ENUM ('telegram', 'discord');
CREATE TYPE status_msg AS ENUM ('enfileirada', 'enviada', 'falha', 'respondida');

-- Tabela de Clientes
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Vínculo 
CREATE TABLE canais_usuario (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plataforma plataforma_msg NOT NULL,
  chat_id TEXT NOT NULL,
  codigo_convite TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  vinculado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_plataforma_chat UNIQUE (plataforma, chat_id)
);

-- Tabela de Auditoria e Registro de Mensagens
CREATE TABLE mensagens (
  id BIGSERIAL PRIMARY KEY,
  canal_usuario_id BIGINT REFERENCES canais_usuario(id) ON DELETE SET NULL,
  plataforma plataforma_msg NOT NULL,
  direcao TEXT NOT NULL CHECK (direcao IN ('saida', 'entrada')),
  id_externo TEXT,
  conteudo TEXT NOT NULL,
  status status_msg NOT NULL DEFAULT 'enfileirada',
  erro_codigo TEXT,
  erro_descricao TEXT,
  payload_bruto JSONB,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enviada_em TIMESTAMPTZ,
  respondida_em TIMESTAMPTZ
);

CREATE INDEX idx_mensagens_plataforma_id_externo ON mensagens (plataforma, id_externo);
CREATE INDEX idx_mensagens_status ON mensagens (status);

--- Down Migration (Rollback)
-- Down Migration SQL:
-- DROP TABLE IF EXISTS mensagens;
-- DROP TABLE IF EXISTS canais_usuario;
-- DROP TABLE IF EXISTS clientes;
-- DROP TYPE IF EXISTS status_msg;
-- DROP TYPE IF EXISTS plataforma_msg;
