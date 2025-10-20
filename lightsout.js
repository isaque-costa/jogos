let tabuleiro = [];
let tamanho = 3;
let movimentos = 0;
let recorde = null;
let dicas = [];
let mostrandoDicas = false;

// ===== Função principal =====
function main() {
  const select = document.getElementById("gridSize");
  tamanho = parseInt(select.value);

  const total = tamanho * tamanho;
  tabuleiro = Array(total).fill(0);
  movimentos = 0;
  dicas = [];
  mostrandoDicas = false;
  atualizarContador();

  // Carrega recorde salvo
  const salvo = localStorage.getItem(`recordeLightsOut_${tamanho}`);
  recorde = salvo ? parseInt(salvo) : null;
  atualizarRecorde();

  // Monta o tabuleiro
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${tamanho}, 80px)`;

  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = `c${i}`;
    cell.addEventListener("click", () => joga(i));
    board.appendChild(cell);
  }

  // Gera tabuleiro resolvível
  gerarTabuleiroResolvivel();

  atualizarTela();
}

// ===== Gera tabuleiro sempre resolvível =====
function gerarTabuleiroResolvivel() {
  const total = tamanho * tamanho;
  tabuleiro = Array(total).fill(0);

  // Faz algumas jogadas aleatórias para embaralhar
  const qtdJogadas = Math.floor(total / 2) + 1;

  for (let k = 0; k < qtdJogadas; k++) {
    const i = Math.floor(Math.random() * total);
    vizinhos(i).forEach(v => tabuleiro[v] = 1 - tabuleiro[v]);
  }
}

// ===== Calcula vizinhos de uma célula =====
function vizinhos(idx) {
  const viz = [idx];
  const linha = Math.floor(idx / tamanho);
  const coluna = idx % tamanho;

  if (linha > 0) viz.push(idx - tamanho);
  if (linha < tamanho - 1) viz.push(idx + tamanho);
  if (coluna > 0) viz.push(idx - 1);
  if (coluna < tamanho - 1) viz.push(idx + 1);

  return viz;
}

// ===== Jogada do usuário =====
function joga(casa) {
  if (mostrandoDicas) {
    const cell = document.getElementById(`c${casa}`);
    if (dicas.includes(casa)) {
      cell.classList.remove("hint");
      dicas = dicas.filter(d => d !== casa);
    } else {
      limparDicas();
    }
  }

  movimentos++;
  atualizarContador();

  vizinhos(casa).forEach(i => {
    tabuleiro[i] = 1 - tabuleiro[i];
  });

  atualizarTela();

  if (tabuleiro.every(v => v === 0)) {
    setTimeout(() => {
      alert(`Parabéns! Você venceu em ${movimentos} movimentos!`);
      if (recorde === null || movimentos < recorde) {
        recorde = movimentos;
        localStorage.setItem(`recordeLightsOut_${tamanho}`, recorde);
        atualizarRecorde();
        alert(`🎉 Novo recorde: ${recorde} movimentos!`);
      }
      main();
    }, 100);
  }
}

// ===== Atualiza tela =====
function atualizarTela() {
  for (let i = 0; i < tabuleiro.length; i++) {
    const cell = document.getElementById(`c${i}`);
    if (tabuleiro[i] === 1) cell.classList.add("active");
    else cell.classList.remove("active");
  }
}

// ===== Atualiza contador =====
function atualizarContador() {
  document.getElementById("moves").textContent = `Movimentos: ${movimentos}`;
}

// ===== Atualiza recorde =====
function atualizarRecorde() {
  document.getElementById("recorde").textContent = `Recorde: ${recorde ?? "--"}`;
}

// ===== Zera recorde =====
function zerarRecorde() {
  localStorage.removeItem(`recordeLightsOut_${tamanho}`);
  recorde = null;
  atualizarRecorde();
  alert("Recorde apagado!");
}

// ===== Mostrar solução =====
function mostrarSolucao() {
  limparDicas();

  const total = tamanho * tamanho;
  const matriz = Array.from({ length: total }, (_, i) => Array(total).fill(0));

  // Matriz de influência
  for (let i = 0; i < total; i++) {
    for (const v of vizinhos(i)) matriz[i][v] = 1;
  }

  const estado = tabuleiro.slice();
  const A = matriz.map((linha, i) => linha.concat(estado[i]));

  // Gauss mod 2
  function gaussMod2(A, n) {
    let linha = 0;
    const where = Array(n).fill(-1);

    for (let col = 0; col < n; col++) {
      let pivo = linha;
      while (pivo < n && A[pivo][col] === 0) pivo++;
      if (pivo === n) continue;

      [A[linha], A[pivo]] = [A[pivo], A[linha]];
      where[col] = linha;

      for (let i = 0; i < n; i++) {
        if (i !== linha && A[i][col] === 1) {
          for (let j = col; j <= n; j++) A[i][j] ^= A[linha][j];
        }
      }
      linha++;
    }

    const x = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      if (where[i] !== -1) x[i] = A[where[i]][n];
    }
    return x;
  }

  const solucao = gaussMod2(A, total);

  dicas = solucao
    .map((v, i) => (v === 1 ? i : -1))
    .filter(v => v !== -1);

  dicas.forEach(i => document.getElementById(`c${i}`).classList.add("hint"));
  mostrandoDicas = true;
}

// ===== Limpa dicas =====
function limparDicas() {
  document.querySelectorAll(".cell.hint").forEach(c => c.classList.remove("hint"));
  dicas = [];
  mostrandoDicas = false;
}

// ===== Inicializa =====
window.onload = main;
