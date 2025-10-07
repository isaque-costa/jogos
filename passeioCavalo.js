/* passeioCavalo.js
   Implementação moderna do Passeio do Cavalo.
   - clique em uma casa: faz o lance (se válido) ou desfaz;
   - Voltar: desfaz último movimento;
   - Limpar: reinicia o tabuleiro;
   - Resolver: tenta achar passeio cobrindo todas as casas (heurística de Warnsdorff + backtracking).
*/
(() => {
  const MOVES = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  let tam = 8;
  let max = 64;
  let path = [];
  let visited = null;

  let elTab, elMsg, selTam, btnVoltar, btnLimpar, btnResolver;

  document.addEventListener("DOMContentLoaded", () => {
    elTab = document.getElementById("tabuleiro");
    elMsg = document.getElementById("mensagem");
    selTam = document.getElementById("tam_tabuleiro");
    btnVoltar = document.getElementById("btnVoltar");
    btnLimpar = document.getElementById("btnLimpar");
    btnResolver = document.getElementById("btnResolver");

    selTam.addEventListener("change", montaTabuleiro);
    btnVoltar.addEventListener("click", desempilhaJogada);
    btnLimpar.addEventListener("click", reiniciaTabuleiro);
    btnResolver.addEventListener("click", resolve);

    montaTabuleiro();
  });

  function inicializaEstado() {
    tam = parseInt(selTam.value, 10) || 8;
    max = tam * tam;
    path = [];
    visited = Array.from({ length: tam }, () => Array(tam).fill(false));
    btnVoltar.disabled = true;
    btnLimpar.disabled = true;
    imprime("");
  }

  function montaTabuleiro() {
    inicializaEstado();
    const table = document.createElement("table");

    for (let r = 0; r < tam; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < tam; c++) {
        const td = document.createElement("td");
        const cell = document.createElement("div");
        cell.className = "square";
        cell.id = `a${r}${c}`;
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener("click", () => joga(cell.id));
        td.appendChild(cell);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    elTab.innerHTML = "";
    elTab.appendChild(table);
  }

  function imprime(texto) {
    elMsg.textContent = texto;
  }

  function joga(casaId) {
    if (path.length === 0) {
      empilhaJogada(casaId);
      return;
    }

    const idx = path.indexOf(casaId);
    if (idx === path.length - 1) {
      desempilhaJogada();
      return;
    }

    const [r, c] = [obtemLinha(casaId), obtemColuna(casaId)];
    if (livre(r, c) && moveEmL(r, c, path[path.length - 1])) {
      empilhaJogada(casaId);
    } else {
      imprime("Movimento inválido");
      setTimeout(() => imprime(""), 800);
    }
  }

  function empilhaJogada(casaId) {
    const r = obtemLinha(casaId),
      c = obtemColuna(casaId);
    visited[r][c] = true;
    path.push(casaId);
    atualizaVisual();
    btnVoltar.disabled = false;
    btnLimpar.disabled = false;

    if (path.length === max) imprime("Problema resolvido!");
  }

  function desempilhaJogada() {
    if (path.length === 0) return;
    const last = path.pop();
    const r = obtemLinha(last),
      c = obtemColuna(last);
    visited[r][c] = false;
    atualizaVisual();

    if (path.length === 0) {
      btnVoltar.disabled = true;
      btnLimpar.disabled = true;
    }
    imprime("");
  }

  function reiniciaTabuleiro() {
    inicializaEstado();
    montaTabuleiro();
  }

  function livre(r, c) {
    return !visited[r][c];
  }

  function moveEmL(r, c, casaAnteriorId) {
    const ra = obtemLinha(casaAnteriorId),
      ca = obtemColuna(casaAnteriorId);
    const dr = Math.abs(r - ra),
      dc = Math.abs(c - ca);
    return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
  }

  function atualizaVisual() {
    for (let r = 0; r < tam; r++) {
      for (let c = 0; c < tam; c++) {
        const cell = document.getElementById(`a${r}${c}`);
        if (!cell) continue;
        cell.classList.remove("current", "visited");
        cell.textContent = "";
      }
    }

    for (let i = 0; i < path.length - 1; i++) {
      const id = path[i];
      const el = document.getElementById(id);
      if (el) el.textContent = i + 1;
    }

    if (path.length > 0) {
      const atual = document.getElementById(path[path.length - 1]);
      if (atual) {
        atual.classList.add("current");
        atual.textContent = path.length;
      }
    }
  }

  // ---------- SOLVER ----------

  function resolve() {
    inicializaEstado();
    btnResolver.disabled = true;
    imprime("Procurando solução...");

    // Warnsdorff simples (greedy)
    function greedyFrom(startR, startC) {
      const vis = Array.from({ length: tam }, () => Array(tam).fill(false));
      const pathg = [];
      let r = startR,
        c = startC;
      vis[r][c] = true;
      pathg.push(`a${r}${c}`);

      for (let step = 1; step < max; step++) {
        const moves = [];
        for (const [dr, dc] of MOVES) {
          const nr = r + dr,
            nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < tam && nc < tam && !vis[nr][nc]) {
            let count = 0;
            for (const [odr, odc] of MOVES) {
              const tr = nr + odr,
                tc = nc + odc;
              if (
                tr >= 0 &&
                tc >= 0 &&
                tr < tam &&
                tc < tam &&
                !vis[tr][tc]
              )
                count++;
            }
            moves.push({ nr, nc, count });
          }
        }
        if (moves.length === 0) return null;
        moves.sort((a, b) => a.count - b.count);
        const min = moves[0].count;
        const best = moves.filter((m) => m.count === min);
        const pick = best[Math.floor(Math.random() * best.length)];
        r = pick.nr;
        c = pick.nc;
        vis[r][c] = true;
        pathg.push(`a${r}${c}`);
      }

      return pathg.length === max ? pathg : null;
    }

    const MAX_GREEDY_ATTEMPTS = Math.max(200, tam * tam * 6);
    let solution = null;
    for (let t = 0; t < MAX_GREEDY_ATTEMPTS && !solution; t++) {
      const sr = Math.floor(Math.random() * tam);
      const sc = Math.floor(Math.random() * tam);
      const p = greedyFrom(sr, sc);
      if (p) solution = p;
    }

    if (!solution) {
      // fallback: backtracking controlado
      const vis = Array.from({ length: tam }, () => Array(tam).fill(false));
      const pathRec = [];

      function nextMoves(r, c) {
        const moves = [];
        for (const [dr, dc] of MOVES) {
          const nr = r + dr,
            nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < tam && nc < tam && !vis[nr][nc]) {
            let count = 0;
            for (const [odr, odc] of MOVES) {
              const tr = nr + odr,
                tc = nc + odc;
              if (
                tr >= 0 &&
                tc >= 0 &&
                tr < tam &&
                tc < tam &&
                !vis[tr][tc]
              )
                count++;
            }
            moves.push({ nr, nc, count });
          }
        }
        moves.sort((a, b) => a.count - b.count || Math.random() - 0.5);
        return moves;
      }

      function backtrack(r, c, depth) {
        vis[r][c] = true;
        pathRec.push(`a${r}${c}`);
        if (depth === max) return true;
        const moves = nextMoves(r, c);
        for (const mv of moves) {
          if (backtrack(mv.nr, mv.nc, depth + 1)) return true;
        }
        vis[r][c] = false;
        pathRec.pop();
        return false;
      }

      const MAX_BACKTRACK_STARTS = tam * tam * 3;
      let ok = false;
      for (let attempt = 0; attempt < MAX_BACKTRACK_STARTS && !ok; attempt++) {
        for (let r = 0; r < tam; r++) vis[r].fill(false);
        pathRec.length = 0;
        const sr = Math.floor(Math.random() * tam);
        const sc = Math.floor(Math.random() * tam);
        ok = backtrack(sr, sc, 1);
      }

      if (ok) solution = pathRec;
    }

    if (solution) {
      for (const id of solution) {
        const r = obtemLinha(id),
          c = obtemColuna(id);
        visited[r][c] = true;
        path.push(id);
      }
      atualizaVisual();
      imprime("Solução encontrada!");
    } else {
      imprime("Nenhuma solução encontrada após várias tentativas.");
    }

    btnResolver.disabled = false;
    btnVoltar.disabled = path.length === 0;
    btnLimpar.disabled = path.length === 0;
  }

  function obtemLinha(id) {
    return parseInt(id[1], 10);
  }
  function obtemColuna(id) {
    return parseInt(id[2], 10);
  }

  window._passeioDoCavalo = { montaTabuleiro, reiniciaTabuleiro, resolve };
})();
