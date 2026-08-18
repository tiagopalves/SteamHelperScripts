// ==UserScript==
// @name         Steam - Market Auto Order and Register Key
// @namespace    https://steamcommunity.com
// @version      4.2.1
// @description  Compra assistida Steam - Modal compacto funcional e Registro de keys automático
// @match        https://steamcommunity.com/market/listings/*
// @match        https://steamcommunity.com/id/*/gamecards/*
// @match        https://steamcommunity.com/profiles/*/gamecards/*
// @match        https://store.steampowered.com/account/registerkey*
// @icon         https://img.icons8.com/?size=48&id=13650&format=png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ==================== DESCRIÇÃO ====================
    //
    // AUTO BUY
    //   Ao abrir uma página de listing com ?autobuy=1, clica automaticamente
    //   no botão de compra assim que ele estiver disponível no DOM.
    //
    // CHECKBOX HANDLER
    //   Garante que o checkbox de aceite do SSA (Steam Subscriber Agreement)
    //   seja marcado, tanto em modais legados quanto nos React (aria-checked).
    //
    // MODAL HANDLER
    //   Reposiciona e redimensiona o modal de encomenda via CSS injetado,
    //   e preenche automaticamente o preço com base na maior oferta de compra.
    //
    // OBSERVERS
    //   Monitora mudanças no DOM para detectar abertura do modal e criação
    //   do botão de batch buy, acionando os handlers correspondentes.
    //
    // PRICE EXTRACTOR
    //   Localiza e extrai o valor da maior oferta de compra (buy order)
    //   listada na tabela da página de listing.
    //
    // REGISTER KEY
    //   Na página de registro de key, marca o SSA automaticamente e submete
    //   o formulário assim que o checkbox estiver disponível.
    //
    // STYLE INJECTOR
    //   Injeta e remove uma tag <style> com !important para sobrescrever
    //   o posicionamento e tamanho do modal nativo do Steam.
    //
    // =======================================================

    // ==================== CONFIG ====================

    const CONFIG = {
        INCREMENT: 0.01,
        MAX_RETRY_BUY: 60,
        MAX_RETRY_CHECK: 30,
        MODAL_WIDTH: 700,
        MODAL_HEIGHT: 370,
        MODAL_GAP: 20,
        Z_INDEX: 999999,
    };

    const SELECTORS = {
        SSA_CHECKBOX: '#accept_ssa, input[name="accept_ssa"]',
        SSA_LABEL: 'label[for="accept_ssa"]',
        MODAL_DIALOG: 'dialog[open]',
        MODAL_FORM: 'form',
        REACT_CHECKBOX: '[role="checkbox"]',
        TEXT_INPUT: 'input[type="text"]',
        BUY_BUTTON: 'button',
        SELL_CARD: '.qdgHaAqLaa0-',
        GREEN_BUTTON: 'button[data-accent-color="green"]',
        GAME_CARDS_CONTAINER: '.gamecards_inventorylink',
        MARKET_LINK: '.badge_card_to_collect_links a',
    };

    const TEXTS = {
        PT: { buy: 'comprar', order: 'Encomendar', market: 'Buscar no Mercado', orders_for: 'encomendas por' },
        EN: { buy: 'buy', order: 'Place Order', market: 'Search the Market', orders_for: 'orders for' },
    };

    // ==================== PAGE CONTEXT ====================

    const PAGE = {
        IS_LISTING:     /^https:\/\/steamcommunity\.com\/market\/listings\/\d+\/.+/.test(location.href),
        IS_GAMECARDS:   /\/(id|profiles)\/[^/]+\/gamecards\//.test(location.href),
        IS_REGISTERKEY: location.href.startsWith('https://store.steampowered.com/account/registerkey'),
    };

    // ==================== UTILS ====================

    const Utils = {
        parsePrice(text) {
            return parseFloat(text.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        },

        formatPrice(value) {
            return `R$ ${value.toFixed(2).replace('.', ',')}`;
        },

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        findButtonByText(buttons, ...texts) {
            return buttons.find(btn => {
                const btnText = (btn.innerText || '').trim().toLowerCase();
                return texts.some(text => btnText === text.toLowerCase());
            });
        },

        waitForElement(selector, maxMs = 10000, interval = 200) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const check = () => {
                    const el = document.querySelector(selector);
                    if (el) return resolve(el);
                    if (Date.now() - start >= maxMs) return reject(`Timeout: ${selector}`);
                    setTimeout(check, interval);
                };
                check();
            });
        },

        waitFor(fn, maxMs = 10000, interval = 200) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const check = () => {
                    const result = fn();
                    if (result) return resolve(result);
                    if (Date.now() - start >= maxMs) return reject('Timeout waitFor');
                    setTimeout(check, interval);
                };
                check();
            });
        },
    };

    // ==================== STYLE INJECTOR ====================

    const StyleInjector = {
        styleId: 'steam-auto-modal-style',

        inject(left, top) {
            let tag = document.getElementById(StyleInjector.styleId);
            if (!tag) {
                tag = document.createElement('style');
                tag.id = StyleInjector.styleId;
                document.head.appendChild(tag);
            }
            tag.textContent = `
                dialog[open] {
                    position: fixed !important;
                    left: ${left}px !important;
                    top: ${top}px !important;
                    width: ${CONFIG.MODAL_WIDTH}px !important;
                    max-width: ${CONFIG.MODAL_WIDTH}px !important;
                    height: ${CONFIG.MODAL_HEIGHT}px !important;
                    max-height: ${CONFIG.MODAL_HEIGHT}px !important;
                    margin: 0 !important;
                    transform: none !important;
                    overflow: hidden !important;
                    z-index: ${CONFIG.Z_INDEX} !important;
                    border-radius: 4px !important;
                }
            `;
        },

        remove() {
            document.getElementById(StyleInjector.styleId)?.remove();
        },
    };

    // ==================== OBSERVERS ====================

    const Observers = {
        watchModalChanges() {
            if (!PAGE.IS_LISTING) return;

            let lastModalCheck = 0;
            const DEBOUNCE_MS = 100;

            const observer = new MutationObserver(() => {
                const now = Date.now();
                if (now - lastModalCheck < DEBOUNCE_MS) return;
                lastModalCheck = now;

                CheckboxHandler.ensureLegacySSA();

                const modal = document.querySelector(SELECTORS.MODAL_DIALOG);
                if (modal) {
                    ModalHandler.moveToLeftSide();
                } else {
                    StyleInjector.remove();
                }

                document.querySelectorAll(SELECTORS.MODAL_FORM).forEach(form => {
                    if (form.dataset.processed) return;

                    const title = form.querySelector('h2');
                    if (!title) return;

                    const text = title.innerText;
                    if (!text.includes(TEXTS.PT.order) && !text.includes(TEXTS.EN.order)) return;

                    form.dataset.processed = '1';
                    setTimeout(() => ModalHandler.processBuyModal(form), 400);
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'open'],
            });

            setInterval(() => {
                const modal = document.querySelector(SELECTORS.MODAL_DIALOG);
                if (modal) ModalHandler.moveToLeftSide();
            }, 500);
        },

        watchBatchBuyButton() {
            if (!PAGE.IS_GAMECARDS) return;

            const observer = new MutationObserver(() => {
                const container = document.querySelector(SELECTORS.GAME_CARDS_CONTAINER);
                if (!container) return;

                const links = Array.from(document.querySelectorAll(SELECTORS.MARKET_LINK))
                    .filter(link => link.innerText.includes(TEXTS.PT.market));

                const existing = document.getElementById('steam_batch_buy');

                if (links.length === 0) {
                    existing?.remove();
                    return;
                }

                if (existing) return;

                const button = document.createElement('a');
                button.id = 'steam_batch_buy';
                button.className = 'btn_green_white_innerfade btn_medium';
                button.innerHTML = '<span>Abrir páginas de compra</span>';

                Object.assign(button.style, {
                    float: 'right',
                    marginLeft: '10px',
                    cursor: 'pointer',
                });

                button.onclick = () => {
                    links.forEach(link => window.open(link.href + '?autobuy=1', '_blank'));
                };

                container.appendChild(button);
            });

            observer.observe(document.body, { childList: true, subtree: true });
        },
    };

    // ==================== AUTO BUY ====================

    const AutoBuy = {
        async openBuyDialog(retry = 0) {
            const buttons = Array.from(document.querySelectorAll(SELECTORS.BUY_BUTTON));
            const buyBtn = Utils.findButtonByText(buttons, TEXTS.PT.buy, TEXTS.EN.buy);

            if (buyBtn) {
                buyBtn.click();
                return;
            }

            if (retry >= CONFIG.MAX_RETRY_BUY) return;
            await Utils.delay(300);
            AutoBuy.openBuyDialog(retry + 1);
        },

        startIfUrlParam() {
            if (!PAGE.IS_LISTING) return;
            if (new URL(location.href).searchParams.get('autobuy') !== '1') return;

            const tryOpen = async () => {
                try {
                    await Utils.waitForElement(SELECTORS.GREEN_BUTTON, 15000, 300);
                    await Utils.delay(600);
                    AutoBuy.openBuyDialog();
                } catch (e) {
                    console.warn('[Steam Auto] Botão de compra não encontrado:', e);
                }
            };

            if (document.readyState === 'complete') tryOpen();
            else window.addEventListener('load', tryOpen);
        },
    };

    // ==================== CHECKBOX HANDLER ====================

    const CheckboxHandler = {
        async ensureLegacySSA() {
            const checkbox = document.querySelector(SELECTORS.SSA_CHECKBOX);
            if (!checkbox || checkbox.checked) return;

            try { checkbox.click(); await Utils.delay(80); } catch (e) {}
            if (checkbox.checked) return;

            try {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('input', { bubbles: true }));
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            } catch (e) {}

            if (checkbox.checked) return;
            try { document.querySelector(SELECTORS.SSA_LABEL)?.click(); } catch (e) {}
        },

        async ensureReactCheckbox(modal, retry = 0) {
            await CheckboxHandler.ensureLegacySSA();

            const checkbox = modal.querySelector(SELECTORS.REACT_CHECKBOX);
            if (!checkbox) {
                if (retry < CONFIG.MAX_RETRY_CHECK) {
                    await Utils.delay(200);
                    return CheckboxHandler.ensureReactCheckbox(modal, retry + 1);
                }
                return;
            }

            if (checkbox.getAttribute('aria-checked') === 'false') {
                checkbox.click();
                await Utils.delay(150);
                if (checkbox.getAttribute('aria-checked') === 'false' && retry < CONFIG.MAX_RETRY_CHECK) {
                    await Utils.delay(200);
                    return CheckboxHandler.ensureReactCheckbox(modal, retry + 1);
                }
            }
        },

        setReactInputValue(input, value) {
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        },
    };

    // ==================== MODAL HANDLER ====================

    const ModalHandler = {
        moveToLeftSide() {
            if (!PAGE.IS_LISTING) return;

            const dialog = document.querySelector(SELECTORS.MODAL_DIALOG);
            if (!dialog) return;

            const buyButtons = Array.from(document.querySelectorAll(SELECTORS.GREEN_BUTTON));
            const sellCard = buyButtons
                .find(btn => {
                    const text = (btn.innerText || '').trim().toLowerCase();
                    return text === TEXTS.PT.buy || text === TEXTS.EN.buy;
                })
                ?.closest(SELECTORS.SELL_CARD);

            let leftPos = 20;
            let topPos = 80;

            if (sellCard) {
                const rect = sellCard.getBoundingClientRect();
                leftPos = rect.left;
                topPos = Math.max(rect.top - CONFIG.MODAL_HEIGHT - CONFIG.MODAL_GAP, 20);
            }

            StyleInjector.inject(leftPos, topPos);
        },

        async processBuyModal(modal) {
            ModalHandler.moveToLeftSide();
            await CheckboxHandler.ensureReactCheckbox(modal);

            const highest = await Utils.waitFor(
                () => PriceExtractor.getHighestBuyOrder(),
                8000,
                300
            ).catch(() => null);

            if (highest === null) return;

            const input = await Utils.waitFor(
                () => modal.querySelector(SELECTORS.TEXT_INPUT),
                5000,
                200
            ).catch(() => null);

            if (input) {
                CheckboxHandler.setReactInputValue(input, Utils.formatPrice(highest + CONFIG.INCREMENT));
            }
        },
    };

    // ==================== PRICE EXTRACTOR ====================

    const PriceExtractor = {
        getHighestBuyOrder() {
            const spans = document.querySelectorAll('span');

            for (const span of spans) {
                const text = span.innerText || '';
                if (!text.includes(TEXTS.PT.orders_for) && !text.includes(TEXTS.EN.orders_for)) continue;

                const parent = span.closest('div');
                if (!parent) continue;

                let priceElement =
                    parent.querySelector('tbody tr:first-child td:first-child') ||
                    parent.querySelector('tr:first-child td:first-child') ||
                    parent.querySelector('tr td');

                if (!priceElement) {
                    const cells = parent.querySelectorAll('td, span, div[class*="price"]');
                    for (const cell of cells) {
                        if (/[\d,]+/.test(cell.innerText || '')) {
                            priceElement = cell;
                            break;
                        }
                    }
                }

                if (priceElement) return Utils.parsePrice(priceElement.innerText);
            }

            return null;
        },
    };

    // ==================== REGISTER KEY ====================

    const RegisterKey = {
        async autoSubmit() {
            await CheckboxHandler.ensureLegacySSA();

            const checkbox = document.querySelector(SELECTORS.SSA_CHECKBOX);
            if (!checkbox?.checked) return;

            const btn = document.querySelector('#register_btn');
            if (btn && !btn.dataset.autoClicked) {
                btn.dataset.autoClicked = '1';
                await Utils.delay(300);
                btn.click();
            }
        },

        init() {
            if (!PAGE.IS_REGISTERKEY) return;

            const trySubmit = async () => {
                try {
                    await Utils.waitForElement(SELECTORS.SSA_CHECKBOX, 10000, 200);
                } catch (e) {}

                RegisterKey.autoSubmit();

                const interval = setInterval(async () => {
                    const btn = document.querySelector('#register_btn');
                    if (btn?.dataset.autoClicked) {
                        clearInterval(interval);
                        return;
                    }
                    await RegisterKey.autoSubmit();
                }, 300);

                setTimeout(() => clearInterval(interval), 15000);
            };

            if (document.readyState === 'complete') trySubmit();
            else window.addEventListener('load', trySubmit);
        },
    };

    // ==================== INIT ====================

    AutoBuy.startIfUrlParam();
    Observers.watchBatchBuyButton();
    Observers.watchModalChanges();
    RegisterKey.init();

    console.log('[Steam Auto v4.2.1] Carregado:', location.href, PAGE);

})();
