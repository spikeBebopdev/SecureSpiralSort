
const crypto = require('crypto');

class OrdenacaoEspiralSegura {
  constructor(dados, opcoes = {}) {
    this.dados = Array.isArray(dados) ? [...dados] : [];
    this.numeroCamadas = opcoes.numeroCamadas || Math.max(1, Math.ceil(Math.sqrt(this.dados.length)));
    this.saltAleatorio = opcoes.salt || crypto.randomBytes(16).toString('hex');
    this.logAuditoria = [];
  }

  gerarHash(valor) {
    const hash = crypto.createHash('sha256');
    hash.update(String(valor) + this.saltAleatorio);
    return parseInt(hash.digest('hex').slice(0, 8), 16);
  }

  atribuirCamada(valor, hashMin, hashMax) {
    const hashValor = this.gerarHash(valor);
    const hashNormalizado = (hashValor - hashMin) / (hashMax - hashMin);
    const indiceCamada = Math.min(
      this.numeroCamadas - 1,
      Math.max(0, Math.floor(hashNormalizado * this.numeroCamadas))
    );
    this.logAuditoria.push(`Valor ${valor} atribuído à camada ${indiceCamada}`);
    return indiceCamada;
  }

  ordenarCamadas(camadas) {
    camadas.forEach((camada, indice) => {
      this.logAuditoria.push(`Ordenando camada ${indice} com ${camada.length} elementos`);
      camada.sort((a, b) => a - b);
    });
  }

  consolidarCamadas(camadas) {
    let listaOrdenada = [];
    let sentidoCrescente = true;

    camadas.forEach((camada, indice) => {
      if (!sentidoCrescente) camada.reverse();
      listaOrdenada = listaOrdenada.concat(camada);
      this.logAuditoria.push(`Consolidada camada ${indice}`);
      sentidoCrescente = !sentidoCrescente;
    });

    return listaOrdenada;
  }

  verificarIntegridade(listaOrdenada) {
    for (let i = 0; i < listaOrdenada.length - 1; i++) {
      if (listaOrdenada[i] > listaOrdenada[i + 1]) {
        throw new Error('Falha na verificação de integridade: a lista não está ordenada corretamente');
      }
    }
    this.logAuditoria.push('Verificação de integridade bem-sucedida: a lista está ordenada');
  }

  ordenar() {
    if (!this.dados.length) return [];

    const hashMin = this.gerarHash(Math.min(...this.dados));
    const hashMax = this.gerarHash(Math.max(...this.dados));

    const camadas = Array.from({ length: this.numeroCamadas }, () => []);

    this.dados.forEach((valor) => {
      const indiceCamada = this.atribuirCamada(valor, hashMin, hashMax);
      camadas[indiceCamada].push(valor);
    });

    this.ordenarCamadas(camadas);

    const listaOrdenada = this.consolidarCamadas(camadas);

    this.verificarIntegridade(listaOrdenada);

    return listaOrdenada;
  }

  obterLogAuditoria() {
    return this.logAuditoria;
  }
}

module.exports = OrdenacaoEspiralSegura;

// Exemplo de uso
const dados = [42, 1, 15, 5, 30, 8, 60, 12, 25];
const ordenacao = new OrdenacaoEspiralSegura(dados);
const resultado = ordenacao.ordenar();

console.log('Lista original:', dados);
console.log('Lista ordenada:', resultado);
console.log('Log de auditoria:', ordenacao.obterLogAuditoria());
