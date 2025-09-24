/* passeioCavalo.js
   Implementação moderna do Passeio do Cavalo.
   - clique em uma casa: faz o lance (se válido) ou desfaz;
   - Voltar: desfaz último movimento;
   - Limpar: reinicia o tabuleiro;
   - Resolver: tenta achar passeio cobrindo todas as casas (backtracking com heurística).
*/
(() => {
  // constantes / offsets do cavalo
  const MOVES = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  // estado
  let tam = 8;
  let max = 64;
  let path = [];   // pilha de casas visitadas: cada item "a{row}{col}"
  let visited = null; // matriz booleana
  // elementos DOM
  let elTab, elMsg, selTam, btnVoltar, btnLimpar, btnResolver;

  // inicialização
  document.addEventListener('DOMContentLoaded', () => {
    elTab = document.getElementById('tabuleiro');
    elMsg = document.getElementById('mensagem');
    selTam = document.getElementById('tam_tabuleiro');
    btnVoltar = document.getElementById('btnVoltar');
    btnLimpar = document.getElementById('btnLimpar');
    btnResolver = document.getElementById('btnResolver');

    selTam.addEventListener('change', montaTabuleiro);
    btnVoltar.addEventListener('click', desempilhaJogada);
    btnLimpar.addEventListener('click', reiniciaTabuleiro);
    btnResolver.addEventListener('click', resolve);

    montaTabuleiro();
  });

  function inicializaEstado() {
    tam = parseInt(selTam.value, 10) || 8;
    max = tam * tam;
    path = [];
    visited = Array.from({ length: tam }, () => Array(tam).fill(false));
    btnVoltar.disabled = true;
    btnLimpar.disabled = true;
    imprime('');
  }

  function montaTabuleiro() {
    inicializaEstado();
    const table = document.createElement('table');

    for (let r = 0; r < tam; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < tam; c++) {
        const td = document.createElement('td');
        const cell = document.createElement('div');
        cell.className = 'square';
        cell.id = `a${r}${c}`;
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => joga(cell.id));
        td.appendChild(cell);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    elTab.innerHTML = '';
    elTab.appendChild(table);
  }

  function imprime(texto) {
    elMsg.textContent = texto;
  }

  function joga(casaId) {
    // se primeira jogada, aceita qualquer casa
    if (path.length === 0) {
      empilhaJogada(casaId);
      return;
    }
    // se já tem cavalo nessa casa -> desfazer essa jogada (isso só acontece clicando em casa atual)
    const idx = path.indexOf(casaId);
    if (idx === path.length - 1) {
      desempilhaJogada();
      return;
    }
    // validar movimento em L e casa livre
    const [r, c] = [obtemLinha(casaId), obtemColuna(casaId)];
    if (livre(r, c) && moveEmL(r, c, path[path.length - 1])) {
      empilhaJogada(casaId);
    } else {
      // movimento inválido: não faz nada ou mostra mensagem breve
      imprime('Movimento inválido');
      setTimeout(() => imprime(''), 800);
    }
  }

  function empilhaJogada(casaId) {
    const r = obtemLinha(casaId), c = obtemColuna(casaId);
    // marca visitada
    visited[r][c] = true;
    path.push(casaId);

    // atualiza visual: última casa fica current
    atualizaVisual();

    // habilita controles
    btnVoltar.disabled = false;
    btnLimpar.disabled = false;

    if (path.length === max) {
      imprime('Problema resolvido!');
    }
  }

  function desempilhaJogada() {
    if (path.length === 0) return;
    const last = path.pop();
    const r = obtemLinha(last), c = obtemColuna(last);
    visited[r][c] = false;

    atualizaVisual();

    if (path.length === 0) {
      btnVoltar.disabled = true;
      btnLimpar.disabled = true;
    }
    imprime('');
  }

  function reiniciaTabuleiro() {
    // limpa visited + path e atualiza visual
    inicializaEstado();
    // apenas redesenha o tabuleiro (mantém selecao de tamanho)
    montaTabuleiro();
  }

  function livre(r, c) {
    return !visited[r][c];
  }

  function moveEmL(r, c, casaAnteriorId) {
    const ra = obtemLinha(casaAnteriorId), ca = obtemColuna(casaAnteriorId);
    const dr = Math.abs(r - ra), dc = Math.abs(c - ca);
    return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
  }

  function atualizaVisual() {
    // limpa classes de todas as células
    for (let r = 0; r < tam; r++) {
      for (let c = 0; c < tam; c++) {
        const cell = document.getElementById(`a${r}${c}`);
        if (!cell) continue;
        cell.classList.remove('current', 'visited');
      }
    }
    // marca visitadas (exceto a atual)
    for (let i = 0; i < path.length - 1; i++) {
      const id = path[i];
      const el = document.getElementById(id);
      if (el) el.classList.add('visited');
    }
    // marca atual (se houver)
    if (path.length > 0) {
      const atual = document.getElementById(path[path.length - 1]);
      if (atual) atual.classList.add('current');
    }
  }

  // ---------- SOLVER (backtracking + heurística de Warnsdorff) ----------
  function resolve() {
    inicializaEstado();
//    imprime('Procurando solução...');
    btnResolver.disabled = true;

    // tentativa: começamos em (0,0) por padrão — você pode mudar
    const startR = 0, startC = 0;

    // visited local p/ solver
    const vis = Array.from({ length: tam }, () => Array(tam).fill(false));
    const pathSolver = [];

    // função utilitária: ordena próximos moves por número de opções (Warnsdorff)
    function nextMoves(r, c) {
      const moves = [];
      for (const [dr, dc] of MOVES) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < tam && nc < tam && !vis[nr][nc]) {
          // contar opções a partir deste próximo
          let count = 0;
          for (const [odr, odc] of MOVES) {
            const tr = nr + odr, tc = nc + odc;
            if (tr >= 0 && tc >= 0 && tr < tam && tc < tam && !vis[tr][tc]) count++;
          }
          moves.push({ nr, nc, choices: count });
        }
      }
      // ordem crescente de choices (Warnsdorff)
      moves.sort((a, b) => a.choices - b.choices);
      return moves;
    }

    // backtracking recursivo
    function backtrack(r, c, depth) {
      vis[r][c] = true;
      pathSolver.push(`a${r}${c}`);

      if (depth === max) {
        return true;
      }

      const moves = nextMoves(r, c);
      for (const mv of moves) {
        if (backtrack(mv.nr, mv.nc, depth + 1)) return true;
      }

      // backtrack
      vis[r][c] = false;
      pathSolver.pop();
      return false;
    }

    // executar solver (pode demorar em tabuleiros grandes)
    // tentar em vários starts se desejar (aqui fixo em 0,0)
    const ok = backtrack(startR, startC, 1);

    if (ok) {
      // aplica solução visualmente
      for (const id of pathSolver) {
        const r = obtemLinha(id), c = obtemColuna(id);
        visited[r][c] = true;
        path.push(id);
      }
      atualizaVisual();
//      imprime('Solução encontrada: ' + pathSolver.join(' '));
    } else {
      imprime('O problema é impossível (nenhuma solução encontrada a partir de 0,0).');
    }

    btnResolver.disabled = false;
    btnVoltar.disabled = path.length === 0;
    btnLimpar.disabled = path.length === 0;
  }

  // utilitários
  function obtemLinha(id) { return parseInt(id[1], 10); }
  function obtemColuna(id) { return parseInt(id[2], 10); }

  // expor apenas para debug se necessário (opcional)
  window._passeioDoCavalo = {
    montaTabuleiro, reiniciaTabuleiro, resolve
  };
})();
