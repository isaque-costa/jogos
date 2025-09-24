(() => {
  // estatísticas
  let NTrocouGanhou = 0, TrocouGanhou = 0;
  let NTrocouPerdeu = 0, TrocouPerdeu = 0;

  // estado do jogo
  let premio = 0, X = 0, Y = 0, Z = 0, clique = 1;

  const portas = [null, "p1", "p2", "p3"];
  const msg = document.getElementById("msg");

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnRestart").addEventListener("click", main);
    document.getElementById("btnResetStats").addEventListener("click", resetEstatisticas);
    portas.slice(1).forEach((id, i) => {
      document.getElementById(id).addEventListener("click", () => escolheu(i + 1));
    });
    main();
  });

  function main() {
    premio = aleatorio(3);
    clique = 1;
    X = Y = Z = 0;
    mensagem("apresenta");
    for (let i = 1; i <= 3; i++) revela(i, "porta");
  }

  function escolheu(porta) {
    if (clique === 1) {
      primeiroClique(porta);
      clique++;
    } else if (clique === 2 && porta !== Y) {
      segundoClique(porta);
      clique++;
    }
  }

  function primeiroClique(porta) {
    X = porta;
    revela(X, "destaque");

    if (X === premio) {
      do { Y = aleatorio(3); } while (Y === premio);
      Z = 6 - X - Y;
    } else {
      Z = premio;
      Y = 6 - X - Z;
    }
    revela(Y, "bode");
    mensagem("oferta");
  }

  function segundoClique(porta) {
    if (premio === X) {
      revela(X, "premio");
      revela(Z, "bode");
    } else {
      revela(X, "bode");
      revela(Z, "premio");
    }

    if (porta === premio) {
      mensagem("ganhou");
      porta === X ? NTrocouGanhou++ : TrocouGanhou++;
    } else {
      mensagem("perdeu");
      porta === X ? NTrocouPerdeu++ : TrocouPerdeu++;
    }
    atualizaEstatisticas();
  }

  function atualizaEstatisticas() {
    const TrocouPercent = TrocouGanhou + TrocouPerdeu > 0
      ? (TrocouGanhou / (TrocouGanhou + TrocouPerdeu) * 100) : 0;
    const NTrocouPercent = NTrocouGanhou + NTrocouPerdeu > 0
      ? (NTrocouGanhou / (NTrocouGanhou + NTrocouPerdeu) * 100) : 0;

    document.getElementById("NTrocGanhou").textContent = NTrocouGanhou;
    document.getElementById("TrocGanhou").textContent = TrocouGanhou;
    document.getElementById("NTrocPerdeu").textContent = NTrocouPerdeu;
    document.getElementById("TrocPerdeu").textContent = TrocouPerdeu;
    document.getElementById("TrocPercent").textContent = TrocouPercent.toFixed(2);
    document.getElementById("NTrocPercent").textContent = NTrocouPercent.toFixed(2);
  }

  function resetEstatisticas() {
    NTrocouGanhou = TrocouGanhou = NTrocouPerdeu = TrocouPerdeu = 0;
    atualizaEstatisticas();
  }

  function mensagem(tipo) {
    switch (tipo) {
      case "apresenta": 
        msg.textContent = "Escolha uma porta."; 
        break;
      case "oferta": 
        msg.textContent = "Deseja trocar de porta?"; 
        break;
      case "ganhou": 
        msg.textContent = "Parabéns! Você ganhou o carro!"; 
        break;
      case "perdeu": 
        msg.textContent = "Que pena! Você perdeu."; 
        break;
  }
}


  function revela(num, tipo) {
    const el = document.getElementById("p" + num);
    switch (tipo) {
      case "porta": el.src = "porta.jpg"; el.style.cursor = "pointer"; break;
      case "destaque": el.src = "portaDestaque.jpg"; break;
      case "bode": el.src = "bode.jpg"; el.style.cursor = "default"; break;
      case "premio": el.src = "premio.jpg"; el.style.cursor = "default"; break;
    }
  }

  function aleatorio(n) {
    return Math.floor(Math.random() * n) + 1;
  }
})();
