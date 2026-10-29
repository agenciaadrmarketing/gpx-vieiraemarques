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

  // ======================= POPUP DE CONTATO (quiz de qualificação, >R$10k) =======================
  var WA_PHONE = "551533470189";
  // Google Apps Script Web App dedicado a esta LP (grava na planilha +
  // notifica recjohny091@gmail.com e agencia.adrmarketing@gmail.com).
  var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwDCMLNOJw6KNDbZIOD-HxGxMUXYjcq3qlWVdVeLYFBFuA7_WKWpFLWlFRZcS5419cC/exec";

  var popupState = { open: false, pendingMsg: "" };
  var popupEls = {};
  var quizSteps = [];
  var quizCounted = [];
  var quizAnswers = {};
  var quizHist = [];
  var quizCur = 0;

  function criarPopup() {
    var veil = document.createElement("div");
    veil.id = "popup-veil";
    veil.setAttribute("role", "dialog");
    veil.setAttribute("aria-modal", "true");
    veil.setAttribute("aria-labelledby", "tp-form-titulo");
    veil.style.cssText = "display:none;position:fixed;inset:0;z-index:1200;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .3s ease;";
    veil.innerHTML =
      '<style>' +
        '.popup-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 15px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.16);border-radius:10px;color:#EDEDED;font:inherit;font-size:14.5px;line-height:1.4;cursor:pointer;transition:border-color .15s ease,background .15s ease;}' +
        '.popup-opt::before{content:"";flex:0 0 17px;width:17px;height:17px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);box-sizing:border-box;transition:.15s ease;}' +
        '.popup-opt:hover,.popup-opt:focus-visible{border-color:#167E3B;outline:none;}' +
        '.popup-opt.sel{border-color:#167E3B;background:rgba(22,126,59,0.12);}' +
        '.popup-opt.sel::before{border-color:#167E3B;background:#167E3B;box-shadow:inset 0 0 0 3px #141414;}' +
        '#popup-voltar:hover{color:#FFFFFF;}' +
        '#popup-enviar:hover{background:#1a9346;border-color:#1a9346;}' +
      '</style>' +
      '<div data-fechar-popup aria-hidden="true" style="position:absolute;inset:0;cursor:pointer;"></div>' +
      '<div class="tp-pop" style="position:relative;width:100%;max-width:460px;max-height:92vh;overflow:auto;background:#141414;border:1px solid rgba(255,255,255,0.14);border-radius:20px;padding:34px 32px;box-shadow:0 60px 100px -30px rgba(0,0,0,0.7);opacity:0;transform:translateY(28px) scale(0.96);transition:opacity .35s ease, transform .4s cubic-bezier(.16,.84,.44,1);font-family:\'Lexend Deca\',Helvetica,sans-serif;">' +
        '<button type="button" data-fechar-popup aria-label="Fechar formulário" style="position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.05);color:#FFFFFF;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;z-index:2;">&times;</button>' +
        '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:18px;">' +
          '<img src="uploads/logo-vieira-marques-sociedade-advogados.webp" alt="Vieira &amp; Marques Sociedade de Advogados" width="153" height="34" style="height:34px;width:auto;display:block;filter:invert(1);margin-bottom:10px;">' +
        '</div>' +
        '<h2 id="tp-form-titulo" style="margin:0 0 6px;text-align:center;font-size:21px;font-weight:600;line-height:1.3;color:#FFFFFF;">Vamos entender o seu caso</h2>' +
        '<p style="margin:0 0 20px;text-align:center;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.62);">Leva menos de um minuto — a mensagem já vai pronta.</p>' +

        '<div id="popup-quiz">' +
          '<div style="height:4px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden;">' +
            '<div id="popup-bar" style="height:100%;width:0%;background:#167E3B;transition:width .3s ease;"></div>' +
          '</div>' +
          '<p id="popup-count" style="margin:8px 0 18px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.45);"></p>' +

          '<div class="popup-step" data-key="tipo">' +
            '<span style="display:block;margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Qual tipo de golpe você sofreu?</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Pix enviado para golpista</button>' +
              '<button type="button" class="popup-opt">Falsa venda de veículo</button>' +
              '<button type="button" class="popup-opt">Empréstimo ou consignado que não contratei</button>' +
              '<button type="button" class="popup-opt">Outra fraude bancária</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="valor" style="display:none;">' +
            '<span style="display:block;margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Valor aproximado do prejuízo</span>' +
            '<span style="display:block;margin:0 0 12px;font-size:13px;font-weight:300;color:rgba(255,255,255,0.5);">Some tudo o que foi perdido no golpe.</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Menos de 10 mil reais</button>' +
              '<button type="button" class="popup-opt">Entre 10 mil e 50 mil reais</button>' +
              '<button type="button" class="popup-opt">Entre 50 mil e 100 mil reais</button>' +
              '<button type="button" class="popup-opt">Mais de 100 mil reais</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="quando" style="display:none;">' +
            '<span style="display:block;margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Quando o golpe aconteceu?</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Há menos de 30 dias</button>' +
              '<button type="button" class="popup-opt">Entre 1 e 6 meses</button>' +
              '<button type="button" class="popup-opt">Há mais de 6 meses</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="como" style="display:none;">' +
            '<span style="display:block;margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Como o golpe aconteceu?</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Eu mesmo fiz a transferência, achando que era alguém de confiança</button>' +
              '<button type="button" class="popup-opt">Movimentaram minha conta sem autorização</button>' +
              '<button type="button" class="popup-opt">Fizeram um empréstimo em meu nome</button>' +
              '<button type="button" class="popup-opt">Outro</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="banco" style="display:none;">' +
            '<span style="display:block;margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Você avisou o banco logo após perceber o golpe?</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Sim</button>' +
              '<button type="button" class="popup-opt" data-alert>Ainda não</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="_aviso" data-skip-count style="display:none;">' +
            '<div style="margin:0 0 16px;padding:14px 16px;background:rgba(191,140,60,0.14);border:1px solid rgba(191,140,60,0.34);border-radius:10px;font-size:13.5px;line-height:1.55;color:#FFD9A0;">' +
              '<strong>Importante:</strong> ligue para o seu banco assim que puder e peça a contestação pelo <strong>MED (Mecanismo Especial de Devolução do Pix)</strong>. O prazo é curto. Enquanto isso, continue aqui para falar com a nossa equipe.' +
            '</div>' +
            '<div style="display:grid;gap:9px;"><button type="button" class="popup-opt" data-continue>Entendi, continuar</button></div>' +
          '</div>' +

          '<div class="popup-step" data-key="bo" style="display:none;">' +
            '<span style="display:block;margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Foi registrado boletim de ocorrência?</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Sim</button>' +
              '<button type="button" class="popup-opt">Ainda não</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="provas" style="display:none;">' +
            '<span style="display:block;margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Você ainda tem os comprovantes e as conversas do golpe?</span>' +
            '<div style="display:grid;gap:9px;">' +
              '<button type="button" class="popup-opt">Sim, tenho tudo</button>' +
              '<button type="button" class="popup-opt">Tenho só uma parte</button>' +
              '<button type="button" class="popup-opt">Não tenho</button>' +
            '</div>' +
          '</div>' +

          '<div class="popup-step" data-key="_contato" style="display:none;">' +
            '<label style="display:flex;flex-direction:column;gap:7px;margin-bottom:13px;">' +
              '<span style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Nome completo</span>' +
              '<input id="input-nome" type="text" autocomplete="name" placeholder="Seu nome" style="width:100%;padding:13px 15px;font-size:15px;color:#FFFFFF;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.16);border-radius:8px;outline:none;box-sizing:border-box;font-family:inherit;">' +
            '</label>' +
            '<label style="display:flex;flex-direction:column;gap:7px;">' +
              '<span style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">WhatsApp</span>' +
              '<input id="input-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="(15) 90000-0000" style="width:100%;padding:13px 15px;font-size:15px;color:#FFFFFF;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.16);border-radius:8px;outline:none;box-sizing:border-box;font-family:inherit;">' +
            '</label>' +
            '<p id="popup-erro" role="alert" style="display:none;margin:13px 0 0;font-size:13px;line-height:1.5;color:#FFB4A8;background:rgba(191,60,60,0.16);border:1px solid rgba(191,60,60,0.36);border-radius:8px;padding:10px 12px;"></p>' +
            '<button type="button" id="popup-enviar" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:16px;padding:16px 22px;border-radius:999px;font-weight:600;font-size:15px;background:#167E3B;color:#FFFFFF;border:1px solid #167E3B;cursor:pointer;font-family:inherit;">Continuar no WhatsApp</button>' +
          '</div>' +

          '<button type="button" id="popup-voltar" style="display:none;margin:16px auto 0;padding:4px 0;background:none;border:0;color:rgba(255,255,255,0.5);font-size:13px;cursor:pointer;font-family:inherit;">&larr; Voltar</button>' +
        '</div>' +

        '<div id="popup-bloqueio" style="display:none;flex-direction:column;align-items:center;text-align:center;gap:14px;">' +
          '<p style="margin:0;font-size:15px;line-height:1.6;color:#EDEDED;">No momento, atendemos exclusivamente casos com prejuízo <strong>acima de R$ 10.000</strong>.</p>' +
          '<button type="button" id="popup-bloqueio-fechar" style="display:inline-flex;align-items:center;justify-content:center;width:100%;margin-top:6px;padding:16px 22px;border-radius:999px;font-weight:600;font-size:15px;background:rgba(255,255,255,0.08);color:#FFFFFF;border:1px solid rgba(255,255,255,0.18);cursor:pointer;">Entendi</button>' +
        '</div>' +

        '<p style="margin:18px 0 0;text-align:center;font-size:11.5px;line-height:1.5;color:rgba(255,255,255,0.5);">Seus dados são sigilosos. Nada de spam.</p>' +
      '</div>';
    document.body.appendChild(veil);
    return veil;
  }

  function quizIdx(key) {
    for (var i = 0; i < quizSteps.length; i++) if (quizSteps[i].dataset.key === key) return i;
    return -1;
  }

  function quizShow(i) {
    quizSteps.forEach(function (s, j) { s.style.display = j === i ? "block" : "none"; });
    quizCur = i;
    var s = quizSteps[i];
    if (!s.hasAttribute("data-skip-count")) {
      var n = quizCounted.indexOf(s) + 1;
      popupEls.bar.style.width = (n / quizCounted.length * 100) + "%";
      popupEls.count.textContent = "Etapa " + n + " de " + quizCounted.length;
    }
    popupEls.voltar.style.display = quizHist.length === 0 ? "none" : "block";
  }

  function quizGo(i) {
    quizHist.push(quizCur);
    quizShow(i);
  }

  function quizReset() {
    quizAnswers = {};
    quizHist = [];
    popupEls.quiz.querySelectorAll(".popup-opt.sel").forEach(function (b) { b.classList.remove("sel"); });
    popupEls.erro.style.display = "none";
    popupEls.inputNome.value = "";
    popupEls.inputTel.value = "";
    quizShow(0);
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

  function abrirPopup() {
    popupState.open = true;
    quizReset();
    popupEls.quiz.style.display = "block";
    popupEls.bloqueio.style.display = "none";
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
      mensagem: popupState.pendingMsg || "", origem_form: "popup_quiz", pagina: window.location.href,
      tipo_golpe: quizAnswers.tipo || "", quando: quizAnswers.quando || "", como: quizAnswers.como || "",
      avisou_banco: quizAnswers.banco || "", boletim_ocorrencia: quizAnswers.bo || "", provas: quizAnswers.provas || ""
    }, utm);
    // Dispara os 3 mecanismos sempre, sem depender de um só - o retorno de
    // sendBeacon() só confirma que o navegador aceitou enfileirar o envio,
    // não que ele chegou no servidor. O /exec do Apps Script sempre responde
    // com um redirecionamento (302 para script.googleusercontent.com), e em
    // vários navegadores isso faz o sendBeacon falhar depois do redirect sem
    // avisar. Image (GET) segue redirecionamento normalmente e é o que
    // comprovadamente funciona; sendBeacon continua disparando também por
    // sobreviver a navegação/fechamento de página. A deduplicação do lado do
    // Apps Script (mesmo WhatsApp em menos de 2 min) evita linha duplicada.
    var qs = Object.keys(dados).map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(dados[k] || "");
    }).join("&");
    try { new Image().src = SHEET_ENDPOINT + "?" + qs; } catch (err) {}
    try { fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", body: JSON.stringify(dados) }); } catch (err) {}
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([JSON.stringify(dados)], { type: "text/plain;charset=UTF-8" });
        navigator.sendBeacon(SHEET_ENDPOINT, blob);
      } catch (err) {}
    }
  }

  function enviarQuiz() {
    var nome = popupEls.inputNome.value.trim();
    var tel = popupEls.inputTel.value.trim();
    if (nome.length < 2 || tel.replace(/\D/g, "").length < 10) {
      popupEls.erro.textContent = "Preciso do seu nome e de um WhatsApp com DDD para continuar.";
      popupEls.erro.style.display = "block";
      return;
    }
    popupEls.erro.style.display = "none";

    var faixaValor = quizAnswers.valor || "";
    var msg = "Olá, sou " + nome + ". Vim pela página de Golpe do Pix e quero uma análise do meu caso." +
      "\n\n• Tipo de golpe: " + (quizAnswers.tipo || "-") +
      "\n• Prejuízo aproximado: " + (faixaValor || "-") +
      "\n• Quando aconteceu: " + (quizAnswers.quando || "-") +
      "\n• Como aconteceu: " + (quizAnswers.como || "-") +
      "\n• Avisei o banco: " + (quizAnswers.banco || "-") +
      "\n• Boletim de ocorrência: " + (quizAnswers.bo || "-") +
      "\n• Comprovantes e conversas: " + (quizAnswers.provas || "-");
    var url = "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(msg);

    popupState.pendingMsg = msg;
    // Planilha via sendBeacon (+Image+fetch): independe do GTM e sobrevive a
    // qualquer navegação que vier a seguir.
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
    window.dataLayer.push({ event: "whatsapp_click", link_url: url, link_text: "Popup quiz: " + faixaValor });

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
    popupEls.quiz = document.getElementById("popup-quiz");
    popupEls.bloqueio = document.getElementById("popup-bloqueio");
    popupEls.bar = document.getElementById("popup-bar");
    popupEls.count = document.getElementById("popup-count");
    popupEls.voltar = document.getElementById("popup-voltar");
    popupEls.erro = document.getElementById("popup-erro");
    popupEls.inputNome = document.getElementById("input-nome");
    popupEls.inputTel = document.getElementById("input-tel");
    popupEls.enviar = document.getElementById("popup-enviar");

    quizSteps = [].slice.call(popupEls.quiz.querySelectorAll(".popup-step"));
    quizCounted = quizSteps.filter(function (s) { return !s.hasAttribute("data-skip-count"); });

    veil.querySelectorAll("[data-fechar-popup]").forEach(function (el) {
      el.addEventListener("click", fecharPopup);
    });
    document.getElementById("popup-bloqueio-fechar").addEventListener("click", fecharPopup);

    popupEls.quiz.addEventListener("click", function (e) {
      var b = e.target.closest(".popup-opt");
      if (!b) return;
      var step = b.closest(".popup-step");
      var key = step.dataset.key;

      if (b.hasAttribute("data-continue")) { quizGo(quizIdx("bo")); return; }

      step.querySelectorAll(".popup-opt").forEach(function (o) { o.classList.toggle("sel", o === b); });
      quizAnswers[key] = b.textContent.trim();

      if (key === "valor" && quizAnswers.valor === "Menos de 10 mil reais") {
        // Desqualifica na hora, antes mesmo de nome/WhatsApp serem
        // preenchidos - não chega a coletar dado nenhum de quem está abaixo
        // de R$ 10.000, então não há nada pra enviar pra planilha aqui.
        setTimeout(function () {
          popupEls.quiz.style.display = "none";
          popupEls.bloqueio.style.display = "flex";
        }, 180);
        return;
      }

      setTimeout(function () {
        if (b.hasAttribute("data-alert")) quizGo(quizIdx("_aviso"));
        else if (key === "banco") quizGo(quizIdx("bo"));
        else quizGo(quizCur + 1);
      }, 180);
    });
    popupEls.voltar.addEventListener("click", function () {
      if (quizHist.length) quizShow(quizHist.pop());
    });
    popupEls.enviar.addEventListener("click", enviarQuiz);
    popupEls.inputTel.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); enviarQuiz(); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && popupState.open) fecharPopup();
    });

    // Toda CTA de WhatsApp da página abre o quiz de qualificação em vez de
    // ir direto pro WhatsApp.
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="https://wa.me/"]');
      if (!link) return;
      e.preventDefault();
      abrirPopup();
    });

    capturarUtm();
  }

  initPopup();
})();
