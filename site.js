/* LP Golpe do Pix — Vieira & Marques (versão 12/11/2026)
 * Quiz de qualificação em 6 etapas. Todo botão da página abre o quiz; nenhum
 * leva direto ao WhatsApp. Valor digitado em R$ + banco na mesma tela; abaixo
 * de R$ 10.000 = recusa definitiva, gravada no aparelho (localStorage).
 * Medição: dataLayer + Clarity por etapa ('quiz_etapa'), recusa
 * ('quiz_recusado') e envio ('lead_form_submitted', usado pela conversão do
 * Google Ads no GTM). Planilha (Apps Script → Kommo) igual à versão anterior.
 */
(function () {
  "use strict";

  var WA_PHONE = "551533470189";
  // Google Apps Script desta LP (grava na planilha e notifica a equipe).
  var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwDCMLNOJw6KNDbZIOD-HxGxMUXYjcq3qlWVdVeLYFBFuA7_WKWpFLWlFRZcS5419cC/exec";
  var MINIMO = 10000;
  var CHAVE_RECUSA = "gpx_recusado";

  var BANCOS = ["Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Caixa", "Santander", "Inter", "C6 Bank", "Mercado Pago", "PicPay", "PagBank", "Sicoob", "Sicredi", "Outro"];

  var ETAPAS = [
    { key: "tipo", q: "Qual tipo de golpe você sofreu?", opts: ["Pix enviado para golpista", "Falsa venda de veículo", "Empréstimo ou consignado que não contratei", "Outra fraude bancária"] },
    { key: "valor", q: "Quanto você perdeu e de qual banco saiu o dinheiro?", tipo: "valor" },
    { key: "quando", q: "Quando aconteceu?", opts: ["Há menos de 30 dias", "Entre 1 e 6 meses", "Há mais de 6 meses"] },
    { key: "como", q: "Como aconteceu?", opts: ["Eu mesmo fiz a transferência", "Movimentaram minha conta sem autorização", "Fizeram um empréstimo em meu nome", "Outro"] },
    { key: "provas", q: "Você tem boletim de ocorrência e comprovantes?", opts: ["Sim, tenho tudo", "Tenho só uma parte", "Ainda não"] },
    { key: "dados", q: "Para onde a equipe pode responder?", tipo: "dados" }
  ];

  var resp = {};
  var atual = 0;
  var el = {};

  // ---------- medição ----------
  function dl(obj) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(obj); }
  function cl(nome) { try { if (typeof window.clarity === "function") window.clarity("event", nome); } catch (e) {} }
  function marcarEtapa(n) { dl({ event: "quiz_etapa", etapa: n }); cl("quiz_etapa_" + n); }

  // ---------- recusa definitiva ----------
  function recusado() { try { return localStorage.getItem(CHAVE_RECUSA) === "1"; } catch (e) { return false; } }
  function gravarRecusa() { try { localStorage.setItem(CHAVE_RECUSA, "1"); } catch (e) {} }

  // ---------- utilidades ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function valorNumero(txt) { var d = String(txt || "").replace(/\D/g, ""); return d ? parseInt(d, 10) : 0; }
  function formatarReais(n) { return n.toLocaleString("pt-BR"); }

  function capturarUtm() {
    try {
      if (sessionStorage.getItem("lead_utm")) return;
      var q = new URLSearchParams(window.location.search);
      sessionStorage.setItem("lead_utm", JSON.stringify({
        utm_source: q.get("utm_source") || "", utm_medium: q.get("utm_medium") || "", utm_campaign: q.get("utm_campaign") || "",
        utm_term: q.get("utm_term") || "", utm_content: q.get("utm_content") || "", gclid: q.get("gclid") || "", fbclid: q.get("fbclid") || ""
      }));
    } catch (e) {}
  }

  // ---------- abrir / fechar ----------
  function abrir() {
    el.qz.classList.add("open");
    document.body.style.overflow = "hidden";
    if (recusado()) { mostrarRecusa(false); return; }
    el.flow.hidden = false; el.stop.hidden = true;
    resp = {}; atual = 0; render();
  }
  function fechar() { el.qz.classList.remove("open"); document.body.style.overflow = ""; }

  function mostrarRecusa(registrar) {
    el.flow.hidden = true; el.stop.hidden = false;
    if (registrar) { gravarRecusa(); dl({ event: "quiz_recusado" }); cl("quiz_recusado"); }
  }

  // ---------- etapas ----------
  function render() {
    var e = ETAPAS[atual];
    var n = atual + 1;
    el.bar.style.width = Math.round(n / ETAPAS.length * 100) + "%";
    el.count.textContent = "Pergunta " + n + " de " + ETAPAS.length;
    el.err.style.display = "none";
    el.back.style.visibility = atual === 0 ? "hidden" : "visible";
    var h = '<h2 class="qz__q" id="qz-q">' + esc(e.q) + "</h2>";

    if (e.opts) {
      h += '<div class="qz__opts">' + e.opts.map(function (o) {
        return '<button type="button" class="opt' + (resp[e.key] === o ? " sel" : "") + '">' + esc(o) + "</button>";
      }).join("") + "</div>";
      el.next.style.display = "none";
    } else if (e.tipo === "valor") {
      h += '<div class="fld"><label for="qz-valor">Valor aproximado do prejuízo</label>' +
        '<div class="money"><span>R$</span><input id="qz-valor" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (resp.valorNum ? formatarReais(resp.valorNum) : "") + '"></div></div>' +
        '<div class="fld"><label for="qz-banco">Banco de onde saiu o dinheiro</label><select id="qz-banco"><option value="">Selecione</option>' +
        BANCOS.map(function (b) { return "<option" + (resp.banco === b ? " selected" : "") + ">" + esc(b) + "</option>"; }).join("") + "</select></div>";
      el.next.style.display = ""; el.next.textContent = "Continuar";
    } else {
      h += '<div class="fld"><label for="input-nome">Nome completo</label><input id="input-nome" autocomplete="name" value="' + esc(resp.nome || "") + '"></div>' +
        '<div class="fld"><label for="input-tel">WhatsApp com DDD</label><input id="input-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000" value="' + esc(resp.tel || "") + '"></div>';
      el.next.style.display = ""; el.next.textContent = "Continuar no WhatsApp";
    }
    el.step.innerHTML = h;
    marcarEtapa(n);

    if (e.tipo === "valor") {
      var iv = document.getElementById("qz-valor");
      iv.addEventListener("input", function () { var v = valorNumero(iv.value); iv.value = v ? formatarReais(v) : ""; });
      iv.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); avancar(); } });
      setTimeout(function () { iv.focus(); }, 60);
    }
    if (e.tipo === "dados") {
      var it = document.getElementById("input-tel");
      it.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); enviar(); } });
    }
  }

  function erro(msg) { el.err.textContent = msg; el.err.style.display = "block"; }

  function avancar() {
    var e = ETAPAS[atual];
    if (e.tipo === "valor") {
      var v = valorNumero(document.getElementById("qz-valor").value);
      var b = document.getElementById("qz-banco").value;
      if (!v) return erro("Digite o valor aproximado do prejuízo.");
      if (!b) return erro("Selecione o banco de onde saiu o dinheiro.");
      resp.valorNum = v; resp.banco = b;
      if (v < MINIMO) { mostrarRecusa(true); return; }
    }
    if (e.tipo === "dados") { enviar(); return; }
    atual++; render();
  }

  // ---------- envio ----------
  function enviarPlanilha(dados) {
    if (!SHEET_ENDPOINT) return;
    var qs = Object.keys(dados).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(dados[k] || ""); }).join("&");
    // Image (GET) segue o redirecionamento do Apps Script; sendBeacon sobrevive à navegação.
    // O Apps Script deduplica o mesmo WhatsApp em menos de 2 minutos.
    try { new Image().src = SHEET_ENDPOINT + "?" + qs; } catch (e) {}
    try { fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", body: JSON.stringify(dados) }).catch(function () {}); } catch (e) {}
    if (navigator.sendBeacon) { try { navigator.sendBeacon(SHEET_ENDPOINT, new Blob([JSON.stringify(dados)], { type: "text/plain;charset=UTF-8" })); } catch (e) {} }
  }

  var FRASE_TIPO = {
    "Pix enviado para golpista": "um golpe do Pix",
    "Falsa venda de veículo": "um golpe de falsa venda de veículo",
    "Empréstimo ou consignado que não contratei": "um empréstimo ou consignado que não contratei",
    "Outra fraude bancária": "uma fraude bancária"
  };

  function enviar() {
    var nome = document.getElementById("input-nome").value.trim();
    var tel = document.getElementById("input-tel").value.trim();
    resp.nome = nome; resp.tel = tel;
    if (nome.length < 2 || tel.replace(/\D/g, "").length < 10) return erro("Preciso do seu nome e de um WhatsApp com DDD para continuar.");

    var valorTxt = "R$ " + formatarReais(resp.valorNum);
    var quando = (resp.quando || "").replace(/^Há /, "").toLowerCase();
    var msg = "Olá, sou " + nome + ". Sofri " + (FRASE_TIPO[resp.tipo] || "um golpe") + " pelo banco " + resp.banco +
      ", com prejuízo de aproximadamente " + valorTxt + ", há " + quando + ". " + (resp.como || "") + ". Boletim e comprovantes: " + (resp.provas || "") + ".";
    var url = "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(msg);

    var utm = {}; try { utm = JSON.parse(sessionStorage.getItem("lead_utm") || "{}"); } catch (e) {}
    enviarPlanilha(Object.assign({
      nome: nome, whatsapp: tel, faixa_valor: valorTxt, valor: String(resp.valorNum), banco: resp.banco,
      mensagem: msg, origem_form: "popup_quiz_v2", pagina: window.location.href,
      tipo_golpe: resp.tipo || "", quando: resp.quando || "", como: resp.como || "",
      avisou_banco: "", boletim_ocorrencia: resp.provas || "", provas: resp.provas || ""
    }, utm));

    var foi = false;
    function seguir() {
      if (foi) return; foi = true;
      var aba = window.open(url, "_blank", "noopener,noreferrer");
      if (!aba) window.location.href = url;
    }
    // Conversão do Google Ads: só neste clique (tag do GTM ligada a 'lead_form_submitted').
    // O WhatsApp abre depois que o GTM processa o evento, ou em 1,5 s.
    dl({ event: "lead_form_submitted", nome: nome, faixa_valor: valorTxt, eventCallback: seguir, eventTimeout: 1500 });
    dl({ event: "whatsapp_click", link_url: url, link_text: "Quiz v2: " + valorTxt });
    cl("quiz_enviado");
    setTimeout(seguir, 1500);
    fechar();
  }

  // ---------- inicialização ----------
  function init() {
    el.qz = document.getElementById("qz");
    el.flow = document.getElementById("qz-flow");
    el.stop = document.getElementById("qz-stop");
    el.step = document.getElementById("qz-step");
    el.bar = document.getElementById("qz-bar");
    el.count = document.getElementById("qz-count");
    el.err = document.getElementById("qz-err");
    el.back = document.getElementById("qz-back");
    el.next = document.getElementById("qz-next");

    document.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-quiz]")) { ev.preventDefault(); abrir(); return; }
      if (ev.target.closest("[data-qz-close]")) { fechar(); return; }
      if (ev.target === el.qz) { fechar(); return; }
      var o = ev.target.closest(".opt");
      if (o && el.qz.contains(o)) {
        var e = ETAPAS[atual];
        resp[e.key] = o.textContent.trim();
        el.step.querySelectorAll(".opt").forEach(function (x) { x.classList.toggle("sel", x === o); });
        setTimeout(function () { atual++; render(); }, 160);
      }
    });
    el.next.addEventListener("click", avancar);
    el.back.addEventListener("click", function () { if (atual > 0) { atual--; render(); } });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && el.qz.classList.contains("open")) fechar(); });

    // Botão flutuante aparece depois da primeira tela.
    var flt = document.querySelector(".float");
    var hero = document.querySelector(".hero");
    if (flt && hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (ents) { flt.classList.toggle("on", !ents[0].isIntersecting); }).observe(hero);
    }
    capturarUtm();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
