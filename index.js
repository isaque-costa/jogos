function carregar(pagina) {
  const frame = document.getElementById("frameJogo");
  frame.src = pagina;
  frame.onload = () => {
    try {
      frame.style.height = frame.contentWindow.document.body.scrollHeight + 40 + "px";
    } catch (e) {
      frame.style.height = "600px"; // fallback se houver restrição de CORS
    }
  };
}
