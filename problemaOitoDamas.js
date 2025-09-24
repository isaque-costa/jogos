/* problemaOitoDamas.js
   Versão sem imagens de fundo das casas — apenas as damas têm imagem.
*/
(() => {
  const IMAGES = {
    queen: 'dama.jpg',
    threat: 'damaAmeacada.jpg',
  };

  let damas = [];
  let qtdDamas = 8;
  let n = 0;

  document.addEventListener('DOMContentLoaded', () => {
    const selectQtd = document.getElementById('qtd_damas');
    const btnResolver = document.getElementById('btnResolver');
    const btnLimpar = document.getElementById('btnLimpar');

    selectQtd.addEventListener('change', montaTabuleiro);
    btnResolver.addEventListener('click', resolve);
    btnLimpar.addEventListener('click', reiniciaTabuleiro);

    montaTabuleiro();
  });

  function inicializa() {
    n = 0;
    qtdDamas = parseInt(document.getElementById('qtd_damas').value, 10) || 8;
    damas = Array(qtdDamas).fill(null);
    imprime('mensagem', '');
  }

  function montaTabuleiro() {
    inicializa();
    const table = document.createElement('table');

    for (let i = 0; i < qtdDamas; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < qtdDamas; j++) {
        const td = document.createElement('td');
        const cell = document.createElement('div');
        cell.className = 'square';
        cell.id = `a${i}${j}`;
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener('click', () => joga(cell.id));

        td.appendChild(cell);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    const container = document.getElementById('tabuleiro');
    container.innerHTML = '';
    container.appendChild(table);
  }

  function joga(casa) {
    if (livre(casa)) {
      fazLance(casa);
    } else {
      desfazLance(casa);
    }
    const temAmeaca = sinalizaAmeacas();
    imprime('mensagem', '');
    if (n === qtdDamas && !temAmeaca) {
      imprime('mensagem', 'Problema resolvido!');
    }
    return temAmeaca;
  }

  function fazLance(casa) {
    if (n < qtdDamas) {
      damas[n++] = casa;
      marcaCasa(casa, 'queen');
    }
  }

  function desfazLance(casa) {
    retiraDama(casa);
    const idx = damas.indexOf(casa);
    if (idx !== -1) {
      damas[idx] = damas[n - 1];
      damas[n - 1] = null;
      n--;
    }
  }

  function sinalizaAmeacas() {
    let temAmeaca = false;
    const atacada = Array(qtdDamas).fill(false);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && ameaca(damas[i], damas[j])) {
          atacada[i] = true;
          temAmeaca = true;
          break;
        }
      }
    }

    for (let i = 0; i < n; i++) {
      marcaCasa(damas[i], atacada[i] ? 'threat' : 'queen');
    }

    return temAmeaca;
  }

  function ameaca(damaA, damaB) {
    return (
      obtemDiagonal1(damaA) === obtemDiagonal1(damaB) ||
      obtemDiagonal2(damaA) === obtemDiagonal2(damaB) ||
      obtemLinha(damaA) === obtemLinha(damaB) ||
      obtemColuna(damaA) === obtemColuna(damaB)
    );
  }

  function resolve() {
    const btnResolver = document.getElementById('btnResolver');
    btnResolver.disabled = true;

    let colunas = [...Array(qtdDamas).keys()];
    let erro;

    do {
      reiniciaTabuleiro();
      colunas = embaralha(colunas.slice());
      erro = false;
      for (let i = 0; i < qtdDamas; i++) {
        erro = joga(`a${i}${colunas[i]}`);
        if (erro) break;
      }
    } while (erro);

    btnResolver.disabled = false;
  }

  function reiniciaTabuleiro() {
    // limpa as damas atuais
    for (let i = 0; i < n; i++) {
      if (damas[i]) retiraDama(damas[i]);
    }
    inicializa();
  }

  function embaralha(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }

  function livre(casa) {
    const cell = document.getElementById(casa);
    return !cell.classList.contains('queen') && !cell.classList.contains('threat');
  }

  function retiraDama(casa) {
    const cell = document.getElementById(casa);
    cell.classList.remove('queen', 'threat');
  }

  function marcaCasa(casa, tipo) {
    const cell = document.getElementById(casa);
    cell.classList.remove('queen', 'threat');

    if (tipo === 'queen') {
      cell.classList.add('queen');
    } else if (tipo === 'threat') {
      cell.classList.add('threat');
    }
  }

  function imprime(elemento, texto) {
    document.getElementById(elemento).textContent = texto;
  }

  function obtemDiagonal1(casa) {
    return obtemLinha(casa) + obtemColuna(casa);
  }
  function obtemDiagonal2(casa) {
    return obtemLinha(casa) - obtemColuna(casa);
  }
  function obtemLinha(casa) {
    return parseInt(casa[1], 10);
  }
  function obtemColuna(casa) {
    return parseInt(casa[2], 10);
  }
})();
