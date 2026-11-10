const FIPE_BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

// Função que pega a marca do veiculo
async function getMarcas() {
  const res = await fetch(`${FIPE_BASE_URL}/carros/marcas`);
  return await res.json();
}

// Função que pega o modelo do veiculo
async function getModelos(marcaId) {
  const res = await fetch(`${FIPE_BASE_URL}/carros/marcas/${marcaId}/modelos`);
  const json = await res.json();
  return json.modelos;
}

// Função que pega o ano do veiculo
async function getAnos(marcaId, modeloId) {
  const res = await fetch(`${FIPE_BASE_URL}/carros/marcas/${marcaId}/modelos/${modeloId}/anos`);
  return await res.json();
}

// Função que pega o valor relativo do dia na FIPE
async function getValorFipe(marcaId, modeloId, anoId) {
  const res = await fetch(`${FIPE_BASE_URL}/carros/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`);
  return await res.json();
}

module.exports = {
  getMarcas,
  getModelos,
  getAnos,
  getValorFipe,
};