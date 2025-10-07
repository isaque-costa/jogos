let tabuleiro = [];
let trocaEstado = [];
let movimentos = 0;
let recorde = null;

function main() {
  // inicializa tabuleiro vazio
  tabuleiro = Array(9).fill(0);
  movimentos = 0;
  atualizarContador();

  // carrega recorde do localStorage
  const salvo = localStorage.getItem("recordeLightsOut");
  if (salvo !== null) {
    recorde = parseInt(salvo);
    atualizarRecorde();
  }

  // troca o estado da lâmpada e de suas vizinhas
  trocaEstado = [
    [0, 1, 3],
    [0, 1, 2, 4],
    [1, 2, 5],
    [0, 3, 4, 6],
    [1, 3, 4, 5, 7],
    [2, 4, 5, 8],
    [3, 6, 7],
    [4, 6, 7, 8],
    [5, 7, 8],
  ];

  // monta tabuleiro dinamicamente
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = `c${i}`;
    cell.addEventListener("click", () => joga(i));
    board.appendChild(cell);
  }

  // sorteia configuração inicial
  const i = Math.floor(Math.random() * 9);
  tabuleiro[i] = 1;
  document.getElementById(`c${i}`).classList.add("active");
}

function joga(casa) {
  movimentos++;
  atualizarContador();

  // troca estado das lâmpadas afetadas
  trocaEstado[casa].forEach(idx => {
    tabuleiro[idx] = 1 - tabuleiro[idx];
  });

  // atualiza as lâmpadas na tela
  let acesas = 0;
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById(`c${i}`);
    if (tabuleiro[i] === 1) {
      acesas++;
      cell.classList.add("active");
    } else {
      cell.classList.remove("active");
    }
  }

  // verifica vitória
  if (acesas === 0) {
    setTimeout(() => {
      alert(`Parabéns! Você venceu em ${movimentos} movimentos!`);

      // atualiza recorde se necessário
      if (recorde === null || movimentos < recorde) {
        recorde = movimentos;
        localStorage.setItem("recordeLightsOut", recorde);
        atualizarRecorde();
        alert(`🎉 Novo recorde: ${recorde} movimentos!`);
     
        document.location.reload(true); // recarrega página
      }
    }, 100);
  }
}

function atualizarContador() {
  document.getElementById("moves").textContent = `Movimentos: ${movimentos}`;
}

function atualizarRecorde() {
  document.getElementById("recorde").textContent = `Recorde: ${recorde}`;
}

function zerarRecorde() {
  localStorage.removeItem("recordeLightsOut");
  recorde = null;
  document.getElementById("recorde").textContent = "Recorde: --";
  alert("Recorde apagado!");
}
