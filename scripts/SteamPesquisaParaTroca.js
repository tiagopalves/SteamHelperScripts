// ==UserScript==
// @name         Steam - Pesquisa para Troca
// @namespace    https://github.com/tiagopalves/SteamHelperScripts
// @version      2.0.1
// @description  Cole uma lista de jogos e o script pesquisa cada um, um por um, no campo de busca da sua biblioteca Steam, retornando os que faltam.
// @author       Tiago P. Alves
// @homepage     https://github.com/tiagopalves/SteamHelperScripts
// @homepageURL  https://github.com/tiagopalves/SteamHelperScripts
// @supportURL   https://github.com/tiagopalves/SteamHelperScripts/issues
// @updateURL    https://raw.githubusercontent.com/tiagopalves/SteamHelperScripts/main/scripts/SteamPesquisaParaTroca.js
// @downloadURL  https://raw.githubusercontent.com/tiagopalves/SteamHelperScripts/main/scripts/SteamPesquisaParaTroca.js
// @match        https://steamcommunity.com/id/*/games/*
// @match        https://steamcommunity.com/profiles/*/games/*
// @icon         https://img.icons8.com/?size=48&id=13650&format=png
// @run-at       document-end
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  /* -------------------------------------------------------------
   *  Utilidades
   * ----------------------------------------------------------- */

  function normalize(str) {
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase()
      .replace(/[™®©]/g, '')
      .replace(/[^a-z0-9]+/g, ' ') // qualquer coisa que não seja letra/número vira espaço
      .trim()
      .replace(/\s+/g, ' ');
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Dispara o setter nativo do input para que o React perceba a mudança
  // (setar .value direto não dispara o onChange do React).
  function setNativeInputValue(el, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function findSearchInput() {
    return (
      document.querySelector('input[placeholder="Buscar um jogo"]') ||
      document.querySelector('input[placeholder*="jogo" i]') ||
      document.querySelector('input[placeholder*="game" i]')
    );
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return el.offsetParent !== null && (rect.width > 0 || rect.height > 0);
  }

  // Pesquisa UM jogo no campo de busca real da página e verifica se
  // algum resultado visível corresponde exatamente ao nome buscado.
  // A biblioteca Steam exibe o nome do jogo no atributo "alt" da capa,
  // então usamos isso para conferir o resultado do filtro.
  async function searchOneGame(input, title) {
    setNativeInputValue(input, title);
    await wait(500); // dá tempo do React re-renderizar a lista filtrada

    const norm = normalize(title);
    const imgs = Array.from(document.querySelectorAll('img[alt]'));
    return imgs.some(img => img.alt && isVisible(img) && normalize(img.alt) === norm);
  }

  /* -------------------------------------------------------------
   *  UI
   * ----------------------------------------------------------- */

  const STYLE = `
    #pt-fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 999999;
      background-image: linear-gradient(to right, #47bfff 5%, #1a44c2 95%);
      color: #fff;
      font-weight: 400;
      font-size: 13px;
      letter-spacing: .3px;
      border: none;
      border-radius: 2px;
      padding: 12px 18px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.5);
      font-family: "Motiva Sans", Arial, sans-serif;
    }
    #pt-fab:hover { background-image: linear-gradient(to right, #6dd0ff 5%, #2955d6 95%); }

    .pt-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.75);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Motiva Sans", Arial, sans-serif;
    }
    .pt-modal {
      background: #1b2838;
      color: #c7d5e0;
      width: 520px;
      max-width: 92vw;
      max-height: 86vh;
      border-radius: 3px;
      padding: 24px;
      box-shadow: 0 8px 30px rgba(0,0,0,.6);
      display: flex;
      flex-direction: column;
      border: 1px solid #000;
    }
    .pt-modal h2 {
      margin: 0 0 10px;
      font-size: 18px;
      color: #fff;
      font-weight: 400;
    }
    .pt-modal .pt-hint {
      font-size: 12px;
      color: #8f98a0;
      margin: 0 0 18px;
      line-height: 1.5;
    }
    .pt-modal textarea {
      width: 100%;
      min-height: 260px;
      resize: vertical;
      background: #32424e;
      color: #e6f1f9;
      border: 1px solid #000;
      border-radius: 2px;
      padding: 10px;
      font-size: 13px;
      box-sizing: border-box;
      font-family: inherit;
      margin-bottom: 12px;
    }
    .pt-modal textarea:focus {
      outline: none;
      border-color: #66c0f4;
    }

    .pt-progress {
      font-size: 12px;
      color: #8f98a0;
    }
    .pt-progress-bar-track {
      width: 100%;
      height: 4px;
      background: #32424e;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 6px;
    }
    .pt-progress-bar-fill {
      height: 100%;
      background-image: linear-gradient(to right, #47bfff, #1a44c2);
      width: 0%;
      transition: width .2s ease;
    }

    .pt-btn-row {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 28px;
    }
    .pt-btn {
      min-width: 100px;
      border: none;
      border-radius: 2px;
      padding: 10px 20px;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: .3px;
      cursor: pointer;
      color: #fff;
    }
    .pt-btn:disabled { opacity: .5; cursor: default; }
    .pt-btn-primary {
      background-image: linear-gradient(to right, #47bfff 5%, #1a44c2 95%);
    }
    .pt-btn-primary:hover:not(:disabled) {
      background-image: linear-gradient(to right, #6dd0ff 5%, #2955d6 95%);
    }
    .pt-btn-secondary {
      background-image: linear-gradient(to right, #4f4f4f 5%, #2a2a2a 95%);
      color: #c6d4df;
    }
    .pt-btn-secondary:hover:not(:disabled) {
      background-image: linear-gradient(to right, #626262 5%, #3a3a3a 95%);
    }

    .pt-results { overflow-y: auto; }
    .pt-results h3 {
      font-size: 14px;
      color: #fff;
      font-weight: 400;
      margin: 14px 0 6px;
    }
    .pt-results ul {
      margin: 0;
      padding-left: 18px;
      font-size: 13px;
      line-height: 1.6;
    }
    .pt-missing { color: #ff6b6b; }
    .pt-missing a {
      color: #66c0f4;
      text-decoration: none;
    }
    .pt-missing a:hover { text-decoration: underline; }
    .pt-owned { color: #90ee90; }
    .pt-empty { color: #8f98a0; font-style: italic; font-size: 13px; }
  `;

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  function createOverlay(contentEl) {
    const overlay = document.createElement('div');
    overlay.className = 'pt-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    const modal = document.createElement('div');
    modal.className = 'pt-modal';
    modal.appendChild(contentEl);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return overlay;
  }

  function buildInputForm() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <h2>Pesquisa para Troca</h2>
      <div class="pt-hint">Cole abaixo a lista de jogos (um por linha, marcadores como "*" ou "-" são ignorados). O script vai pesquisar cada um no campo de busca da sua biblioteca.</div>
      <textarea placeholder="Copie a lista de jogos aqui..."></textarea>
      <div class="pt-progress" data-role="progress" style="display:none;">
        <span data-role="progress-text">Pesquisando...</span>
        <div class="pt-progress-bar-track"><div class="pt-progress-bar-fill" data-role="progress-fill"></div></div>
      </div>
      <div class="pt-btn-row">
        <button class="pt-btn pt-btn-secondary" data-action="cancel">Cancelar</button>
        <button class="pt-btn pt-btn-primary" data-action="submit">Enviar</button>
      </div>
    `;
    return wrap;
  }

  function parseGameList(raw) {
    return raw
      .split('\n')
      .map(line => line.replace(/^[\s*\-•\d.)]+/, '').trim())
      .filter(Boolean);
  }

  function buildStoreSearchUrl(title) {
    return `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`;
  }

  function buildResultsView(missing, owned) {
    const wrap = document.createElement('div');
    wrap.className = 'pt-results';

    const missingHtml = missing.length
      ? `<ul>${missing.map(n => `<li class="pt-missing"><a href="${buildStoreSearchUrl(n)}" target="_blank" rel="noopener noreferrer">${escapeHtml(n)}</a></li>`).join('')}</ul>`
      : `<div class="pt-empty">Você já tem todos os jogos da lista!</div>`;

    const ownedHtml = owned.length
      ? `<ul>${owned.map(n => `<li class="pt-owned">${escapeHtml(n)}</li>`).join('')}</ul>`
      : `<div class="pt-empty">Nenhum jogo da lista foi encontrado na sua biblioteca.</div>`;

    wrap.innerHTML = `
      <h2>Resultado</h2>
      <h3>❌ Você não tem (${missing.length})</h3>
      ${missingHtml}
      <h3>✅ Você já tem (${owned.length})</h3>
      ${ownedHtml}
      <div class="pt-btn-row">
        <button class="pt-btn pt-btn-secondary" data-action="copy">Copiar lista</button>
        <button class="pt-btn pt-btn-secondary" data-action="open-all" ${missing.length ? '' : 'disabled'}>Abrir todos os links</button>
        <button class="pt-btn pt-btn-primary" data-action="close">Fechar</button>
      </div>
    `;
    return wrap;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* -------------------------------------------------------------
   *  Fluxo principal
   * ----------------------------------------------------------- */

  function openInputModal() {
    const form = buildInputForm();
    const overlay = createOverlay(form);
    const textarea = form.querySelector('textarea');
    textarea.focus();

    const cancelBtn = form.querySelector('[data-action="cancel"]');
    const submitBtn = form.querySelector('[data-action="submit"]');
    const progressWrap = form.querySelector('[data-role="progress"]');
    const progressText = form.querySelector('[data-role="progress-text"]');
    const progressFill = form.querySelector('[data-role="progress-fill"]');

    cancelBtn.addEventListener('click', () => overlay.remove());

    submitBtn.addEventListener('click', async () => {
      const list = parseGameList(textarea.value);
      if (!list.length) {
        alert('Cole ao menos um nome de jogo.');
        return;
      }

      const input = findSearchInput();
      if (!input) {
        alert('Não encontrei o campo de busca da biblioteca nesta página. Confirme que você está em .../games/?tab=all');
        return;
      }

      const originalValue = input.value;
      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      textarea.disabled = true;
      progressWrap.style.display = 'block';

      const missing = [];
      const found = [];

      for (let i = 0; i < list.length; i++) {
        const title = list[i];
        progressText.textContent = `Pesquisando ${i + 1}/${list.length}: ${title}`;
        progressFill.style.width = `${Math.round(((i + 1) / list.length) * 100)}%`;

        try {
          const hasIt = await searchOneGame(input, title);
          if (hasIt) found.push(title);
          else missing.push(title);
        } catch (err) {
          console.error('[Pesquisa para Troca]', title, err);
          missing.push(title);
        }
      }

      // restaura o campo de busca como estava
      setNativeInputValue(input, originalValue);

      overlay.remove();
      const resultsView = buildResultsView(missing, found);
      const resultsOverlay = createOverlay(resultsView);

      resultsView.querySelector('[data-action="close"]').addEventListener('click', () => resultsOverlay.remove());
      resultsView.querySelector('[data-action="copy"]').addEventListener('click', () => {
        const text = missing.join('\n');
        if (typeof GM_setClipboard === 'function') {
          GM_setClipboard(text);
        } else {
          navigator.clipboard.writeText(text).catch(() => {});
        }
      });
      const openAllBtn = resultsView.querySelector('[data-action="open-all"]');
      if (openAllBtn) {
        openAllBtn.addEventListener('click', () => {
          missing.forEach((title, idx) => {
            setTimeout(() => {
              window.open(buildStoreSearchUrl(title), '_blank', 'noopener,noreferrer');
            }, idx * 150);
          });
        });
      }
    });
  }

  function addFab() {
    const btn = document.createElement('button');
    btn.id = 'pt-fab';
    btn.textContent = 'Pesquisa para Troca';
    btn.addEventListener('click', openInputModal);
    document.body.appendChild(btn);
  }

  injectStyle();
  addFab();
})();
