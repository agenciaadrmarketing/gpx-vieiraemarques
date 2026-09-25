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

  // ======================= POPUP DE CONTATO (qualificação >R$10k) =======================
  var WA_PHONE = "551533470189";
  // Google Apps Script Web App dedicado a esta LP (grava na planilha +
  // notifica recjohny091@gmail.com e agencia.adrmarketing@gmail.com).
  var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwDCMLNOJw6KNDbZIOD-HxGxMUXYjcq3qlWVdVeLYFBFuA7_WKWpFLWlFRZcS5419cC/exec";
  var MENSAGEM_FIXA = "Oi, vim pela página de Golpe do Pix e preciso de atendimento urgente.";

  var popupState = { open: false, pendingMsg: "" };
  var popupEls = {};

  function criarPopup() {
    var veil = document.createElement("div");
    veil.id = "popup-veil";
    veil.setAttribute("role", "dialog");
    veil.setAttribute("aria-modal", "true");
    veil.setAttribute("aria-labelledby", "tp-form-titulo");
    veil.style.cssText = "display:none;position:fixed;inset:0;z-index:1200;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .3s ease;";
    veil.innerHTML =
      '<div data-fechar-popup aria-hidden="true" style="position:absolute;inset:0;cursor:pointer;"></div>' +
      '<div class="tp-pop" style="position:relative;width:100%;max-width:440px;max-height:92vh;overflow:auto;background:#141414;border:1px solid rgba(255,255,255,0.14);border-radius:20px;padding:34px 32px;box-shadow:0 60px 100px -30px rgba(0,0,0,0.7);opacity:0;transform:translateY(28px) scale(0.96);transition:opacity .35s ease, transform .4s cubic-bezier(.16,.84,.44,1);">' +
        '<button type="button" data-fechar-popup aria-label="Fechar formulário" style="position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.05);color:#FFFFFF;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;">&times;</button>' +
        '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:22px;">' +
          '<img src="uploads/logo-vieira-marques-sociedade-advogados.webp" alt="Vieira &amp; Marques Sociedade de Advogados" width="153" height="34" style="height:34px;width:auto;display:block;filter:invert(1);margin-bottom:10px;">' +
        '</div>' +
        '<h2 id="tp-form-titulo" style="margin:0 0 8px;text-align:center;font-size:22px;font-weight:600;line-height:1.3;color:#FFFFFF;">Vamos conversar?</h2>' +
        '<p id="popup-sub" style="margin:0 0 20px;text-align:center;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.62);">Deixe seu nome e WhatsApp — a mensagem já vai pronta.</p>' +
        '<form id="popup-form" style="display:flex;flex-direction:column;gap:13px;">' +
          '<label style="display:flex;flex-direction:column;gap:7px;">' +
            '<span style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Nome completo</span>' +
            '<input id="input-nome" name="Nome" type="text" autocomplete="name" placeholder="Seu nome" required style="width:100%;padding:13px 15px;font-size:15px;color:#FFFFFF;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.16);border-radius:8px;outline:none;box-sizing:border-box;">' +
          '</label>' +
          '<label style="display:flex;flex-direction:column;gap:7px;">' +
            '<span style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">WhatsApp</span>' +
            '<input id="input-tel" name="Tel" type="tel" autocomplete="tel" placeholder="(15) 90000-0000" required style="width:100%;padding:13px 15px;font-size:15px;color:#FFFFFF;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.16);border-radius:8px;outline:none;box-sizing:border-box;">' +
          '</label>' +
          '<fieldset style="border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;">' +
            '<legend style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);padding:0;margin-bottom:2px;">Valor aproximado do prejuízo</legend>' +
            '<label style="display:flex;align-items:center;gap:9px;font-size:14.5px;color:#EDEDED;cursor:pointer;">' +
              '<input type="radio" name="faixa_valor" value="Acima de R$ 10.000" required style="accent-color:#167E3B;width:17px;height:17px;">' +
              'Acima de R$ 10.000' +
            '</label>' +
            '<label style="display:flex;align-items:center;gap:9px;font-size:14.5px;color:#EDEDED;cursor:pointer;">' +
              '<input type="radio" name="faixa_valor" value="Até R$ 10.000" required style="accent-color:#167E3B;width:17px;height:17px;">' +
              'Até R$ 10.000' +
            '</label>' +
          '</fieldset>' +
          '<p id="popup-aviso-valor" role="status" style="display:none;margin:0;font-size:13px;line-height:1.5;color:#FFD9A0;background:rgba(191,140,60,0.14);border:1px solid rgba(191,140,60,0.34);border-radius:8px;padding:10px 12px;">Atualmente priorizamos casos com prejuízo acima de R$ 10.000. Mesmo assim, você pode nos enviar sua mensagem — cada caso é avaliado individualmente.</p>' +
          '<p id="popup-erro" role="alert" style="display:none;margin:0;font-size:13px;line-height:1.5;color:#FFB4A8;background:rgba(191,60,60,0.16);border:1px solid rgba(191,60,60,0.36);border-radius:8px;padding:10px 12px;"></p>' +
          '<button type="submit" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:6px;padding:16px 22px;border-radius:999px;font-weight:600;font-size:15px;background:#167E3B;color:#FFFFFF;border:1px solid #167E3B;cursor:pointer;">Continuar no WhatsApp</button>' +
          '<p style="margin:4px 0 0;text-align:center;font-size:11.5px;line-height:1.5;color:rgba(255,255,255,0.5);">Seus dados são sigilosos. Nada de spam.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(veil);
    return veil;
  }

  function ajustarPopupViewport() {
    if (!window.visualViewport || !popupEls.veil) return;
    var vv = window.visualViewport;
    popupEls.veil.style.right = "auto";
    popupEls.veil.style.bottom = "auto";
    popupEls.veil.style.top = vv.offsetTop + "px";
    popupEls.veil.style.left = vv.offsetLeft + "px";
    popupEls.veil.style.width = vv.width + "px";
    popupEls.veil.style.height = vv.height + "px";
  }

  function abrirPopupComMsg(msg) {
    popupState.open = true;
    popupState.pendingMsg = msg || MENSAGEM_FIXA;
    popupEls.erro.style.display = "none";
    popupEls.avisoValor.style.display = "none";
    popupEls.form.reset();
    clearTimeout(popupEls._timer);
    clearTimeout(popupEls._fallbackTimer);
    popupEls.veil.style.display = "flex";
    ajustarPopupViewport();
    if (window.visualViewport && !popupEls._vvWired) {
      popupEls._vvWired = true;
      window.visualViewport.addEventListener("resize", ajustarPopupViewport);
      window.visualViewport.addEventListener("scroll", ajustarPopupViewport);
    }
    var pop = popupEls.pop;
    try {
      void popupEls.veil.offsetWidth;
      requestAnimationFrame(function () {
        popupEls.veil.style.opacity = "1";
        if (pop) { pop.style.opacity = "1"; pop.style.transform = "none"; }
      });
    } catch (err) {
      popupEls.veil.style.opacity = "1";
      if (pop) { pop.style.opacity = "1"; pop.style.transform = "none"; }
    }
    popupEls._fallbackTimer = setTimeout(function () {
      popupEls.veil.style.opacity = "1";
      if (pop) { pop.style.opacity = "1"; pop.style.transform = "none"; }
      ajustarPopupViewport();
    }, 80);
  }

  function fecharPopup() {
    if (!popupState.open) return;
    popupState.open = false;
    var pop = popupEls.pop;
    popupEls.veil.style.opacity = "0";
    if (pop) { pop.style.opacity = "0"; pop.style.transform = "translateY(20px) scale(0.96)"; }
    clearTimeout(popupEls._timer);
    clearTimeout(popupEls._fallbackTimer);
    popupEls._timer = setTimeout(function () {
      popupEls.veil.style.display = "none";
    }, 220);
  }

  function capturarUtm() {
    try {
      if (sessionStorage.getItem("lead_utm")) return;
      var q = new URLSearchParams(window.location.search);
      var utm = {
        utm_source: q.get("utm_source") || "", utm_medium: q.get("utm_medium") || "",
        utm_campaign: q.get("utm_campaign") || "", utm_term: q.get("utm_term") || "",
        utm_content: q.get("utm_content") || "", gclid: q.get("gclid") || "", fbclid: q.get("fbclid") || ""
      };
      sessionStorage.setItem("lead_utm", JSON.stringify(utm));
    } catch (err) {}
  }

  function enviarPlanilha(nome, tel, faixaValor) {
    if (!SHEET_ENDPOINT) return;
    var utm = {};
    try { utm = JSON.parse(sessionStorage.getItem("lead_utm") || "{}"); } catch (err) {}
    var dados = Object.assign({
      nome: nome, whatsapp: tel, faixa_valor: faixaValor,
      mensagem: popupState.pendingMsg || "", origem_form: "popup", pagina: window.location.href
    }, utm);
    // sendBeacon é feito pra sobreviver a navegação/fechamento de página (o
    // que pode acontecer logo em seguida, quando window.open é bloqueado e
    // caímos para window.location.href) - fetch/Image não têm essa garantia.
    var enviado = false;
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([JSON.stringify(dados)], { type: "text/plain;charset=UTF-8" });
        enviado = navigator.sendBeacon(SHEET_ENDPOINT, blob);
      } catch (err) {}
    }
    if (!enviado) {
      var qs = Object.keys(dados).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(dados[k] || "");
      }).join("&");
      try { new Image().src = SHEET_ENDPOINT + "?" + qs; } catch (err) {}
      try { fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", body: JSON.stringify(dados) }); } catch (err) {}
    }
  }

  function enviarPopup(e) {
    e.preventDefault();
    var nome = popupEls.inputNome.value.trim();
    var tel = popupEls.inputTel.value.trim();
    var faixaEl = popupEls.form.querySelector('input[name="faixa_valor"]:checked');
    if (!nome || !tel || !faixaEl) {
      popupEls.erro.textContent = "Preciso do seu nome, WhatsApp e do valor aproximado do prejuízo para continuar.";
      popupEls.erro.style.display = "block";
      return;
    }
    var faixaValor = faixaEl.value;
    var msg = popupState.pendingMsg + " (Prejuízo estimado: " + faixaValor + ")";
    var url = "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(msg);

    // Planilha via sendBeacon: independe do GTM e sobrevive a qualquer
    // navegação que vier a seguir.
    enviarPlanilha(nome, tel, faixaValor);
    try { sessionStorage.setItem("popup_lead_enviado", "1"); } catch (err) {}

    var jaSeguiu = false;
    function seguirParaWhatsapp() {
      if (jaSeguiu) return;
      jaSeguiu = true;
      // window.open o mais perto possível do clique original (dentro do
      // eventCallback do GTM, que roda de forma síncrona quando o GTM já
      // carregou) pra não perder o "gesto do usuário": navegadores móveis
      // (Safari/iOS) descartam essa permissão se algo assíncrono rodar antes
      // e bloqueiam a aba em silêncio - sem erro, sem aviso.
      var novaAba = window.open(url, "_blank", "noopener,noreferrer");
      if (!novaAba) window.location.href = url;
    }

    window.dataLayer = window.dataLayer || [];
    // eventCallback/eventTimeout: só segue pro WhatsApp depois que o GTM
    // processar o evento e disparar as tags ligadas a ele (ou após 1,5s, o
    // que vier primeiro). Sem isso, a navegação pro WhatsApp corta a página
    // antes do GTM - que carrega de forma assíncrona - processar o dataLayer,
    // e a tag nunca chega a disparar de fato (era esse o bug: conversão
    // registrada na planilha, mas a tag do GTM ficava sem disparar).
    window.dataLayer.push({
      event: "lead_form_submitted",
      nome: nome,
      faixa_valor: faixaValor,
      eventCallback: seguirParaWhatsapp,
      eventTimeout: 1500
    });
    window.dataLayer.push({ event: "whatsapp_click", link_url: url, link_text: "Popup: " + faixaValor });

    // Rede de segurança: se o GTM não carregar (bloqueador de anúncios, falha
    // de rede), o eventCallback acima nunca dispara sozinho - isso garante
    // que o lead chegue no WhatsApp de qualquer forma.
    setTimeout(seguirParaWhatsapp, 1500);

    fecharPopup();
  }

  function initPopup() {
    var veil = criarPopup();
    popupEls.veil = veil;
    popupEls.pop = veil.querySelector(".tp-pop");
    popupEls.form = document.getElementById("popup-form");
    popupEls.erro = document.getElementById("popup-erro");
    popupEls.avisoValor = document.getElementById("popup-aviso-valor");
    popupEls.inputNome = document.getElementById("input-nome");
    popupEls.inputTel = document.getElementById("input-tel");

    veil.querySelectorAll("[data-fechar-popup]").forEach(function (el) {
      el.addEventListener("click", fecharPopup);
    });
    popupEls.form.addEventListener("submit", enviarPopup);
    popupEls.form.querySelectorAll('input[name="faixa_valor"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        popupEls.avisoValor.style.display = radio.value === "Até R$ 10.000" && radio.checked ? "block" : "none";
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && popupState.open) fecharPopup();
    });

    // Toda CTA de WhatsApp da página abre o popup de qualificação em vez de
    // ir direto pro WhatsApp - a mensagem original do link vira o texto
    // pré-preenchido, só ganha a faixa de valor depois.
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="https://wa.me/"]');
      if (!link) return;
      e.preventDefault();
      var url = new URL(link.href);
      var msg = url.searchParams.get("text") || MENSAGEM_FIXA;
      abrirPopupComMsg(msg);
    });

    capturarUtm();
  }

  initPopup();
})();
