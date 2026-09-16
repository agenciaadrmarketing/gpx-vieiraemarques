(function () {
  "use strict";

  var inIframe = window.self !== window.top;

  if (inIframe) {
    // Claude Design editor preview: boot the original DC/React template exactly
    // as before, unchanged, so the visual editor keeps working.
    var mirror = document.getElementById("dc-root");
    if (mirror) mirror.remove();
    var tpl = document.getElementById("dc-source");
    document.body.appendChild(document.importNode(tpl.content, true));
    window.__resources = {
      "https://unpkg.com/react@18.3.1/umd/react.production.min.js": "./vendor/react.production.min.js",
      "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": "./vendor/react-dom.production.min.js"
    };
    var s = document.createElement("script");
    s.src = "./support.js";
    s.defer = true;
    document.head.appendChild(s);
    return;
  }

  // Real top-level navigation (visitors, Google, PageSpeed): the static
  // mirror already in the DOM needs the same small bits of interactivity
  // the React version had - nothing else. No framework is loaded.

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="https://wa.me/"]');
    if (link) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "whatsapp_click",
        link_url: link.href,
        link_text: (link.textContent || "").trim()
      });
    }
  });

  // --- Lightbox (equipe/gallery grid) ---
  var galeria = [
    { src: "uploads/recepcao-escritorio-vieira-marques.webp", titulo: "Nossa recepção", legenda: "Escritório com estrutura real e consolidada" },
    { src: "uploads/equipe-escritorio-vieira-marques-advogados.webp", titulo: "A equipe", legenda: "Advogados e time de atendimento do escritório" },
    { src: "uploads/sala-atendimento-escritorio-advocacia.webp", titulo: "Sala de atendimento", legenda: "Atendimento presencial em nossa sede ou por reunião online" },
    { src: "uploads/advogada-analisando-caso-golpe-pix.webp", titulo: "Como trabalhamos", legenda: "Cada caso é analisado em conjunto pela equipe" }
  ];

  function openLightbox(item) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(5,5,5,0.82);display:flex;align-items:center;justify-content:center;padding:32px;cursor:zoom-out;";
    var card = document.createElement("div");
    card.className = "lb-card";
    card.style.cssText = "max-width:1000px;width:100%;border-radius:16px;overflow:hidden;position:relative;";
    var img = document.createElement("img");
    img.src = item.src;
    img.alt = item.titulo;
    img.style.cssText = "width:100%;max-height:76vh;object-fit:cover;display:block;";
    var caption = document.createElement("div");
    caption.style.cssText = "position:absolute;left:0;right:0;bottom:0;padding:26px 28px;background:linear-gradient(to top, rgba(5,5,5,0.85), transparent);";
    var titulo = document.createElement("p");
    titulo.style.cssText = "font-size:22px;font-weight:600;color:#fff;margin:0;";
    titulo.textContent = item.titulo;
    var legenda = document.createElement("p");
    legenda.style.cssText = "font-size:14.5px;font-weight:300;color:rgba(255,255,255,0.75);margin:6px 0 0;";
    legenda.textContent = item.legenda;
    caption.appendChild(titulo);
    caption.appendChild(legenda);
    card.appendChild(img);
    card.appendChild(caption);
    lb.appendChild(card);
    // Matches the original: clicking anywhere in the overlay (including the
    // card) closes it - there's no stopPropagation in the source template.
    lb.addEventListener("click", function () { closeLightbox(lb); });
    document.body.appendChild(lb);
  }

  function closeLightbox(lb) {
    lb.classList.add("lb-out");
    var card = lb.querySelector(".lb-card");
    if (card) card.classList.add("lb-card-out");
    setTimeout(function () { lb.remove(); }, 240);
  }

  var cards = document.querySelectorAll(".lgrid > div");
  cards.forEach(function (card, i) {
    if (!galeria[i]) return;
    card.addEventListener("click", function () { openLightbox(galeria[i]); });
  });

  // --- Balão (floating hero tip, dismissible, rotates through phrases) ---
  var balaoWrap = document.querySelector(".flutuante");
  var balaoEl = balaoWrap ? balaoWrap.querySelector(".balao") : null;
  var encerrado = false;

  if (balaoEl) {
    var closeBtn = balaoEl.querySelector("button[aria-label='Fechar']");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        encerrado = true;
        if (balaoEl && balaoEl.parentNode) balaoEl.remove();
      });
    }

    var frases = [
      { t: "Fez um Pix e caiu em golpe?", s: "Fale agora com um advogado e entenda o que ainda dá para fazer." },
      { t: "O banco negou sua contestação?", s: "A negativa administrativa não encerra o caso — existe via judicial." },
      { t: "Cada hora conta no golpe do Pix", s: "Quanto antes agir, maior a chance de rastrear e bloquear os valores." },
      { t: "Desconto que você não reconhece?", s: "Empréstimo não contratado pode ser anulado. Tire sua dúvida em minutos." }
    ];
    var visivel = [7000, 9000, 6500, 8000];
    var oculto = [5000, 11000, 7000, 14000];
    var frase = 0;

    function ciclo() {
      if (encerrado) return;
      var i = frase;
      setTimeout(function () {
        if (encerrado || !balaoEl) return;
        balaoEl.style.display = "none";
        setTimeout(function () {
          if (encerrado) return;
          frase = frase + 1;
          var f = frases[frase % frases.length];
          if (balaoEl) {
            var tituloEl = balaoEl.querySelector("p:first-of-type");
            var subEl = balaoEl.querySelector("p:nth-of-type(2)");
            if (tituloEl) tituloEl.textContent = f.t;
            if (subEl) subEl.textContent = f.s;
            balaoEl.style.display = "";
          }
          ciclo();
        }, oculto[i % oculto.length]);
      }, visivel[i % visivel.length]);
    }
    ciclo();
  }
})();
