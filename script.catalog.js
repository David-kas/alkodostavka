/**
 * Каталог: фильтр, карточки, таймер акции, cross-sell.
 * Подключается только на catalog.html (не грузится на главной).
 */
(function () {
    function whenCoreReady(fn) {
        function run() {
            if (window.alkoAddToCart && window.alkoParsePrice) {
                fn();
                return;
            }
            window.setTimeout(run, 30);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }

    whenCoreReady(function () {
        var addToCart = window.alkoAddToCart;
        var parsePrice = window.alkoParsePrice;
        var openOneClickModal = window.alkoOpenOneClickModal;
        if (!addToCart || !parsePrice) return;

        var categoryBtns = document.querySelectorAll('.category-btn');
        var products = document.querySelectorAll('.catalog-grid .product-card');
        if (categoryBtns.length && products.length) {
            categoryBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    categoryBtns.forEach(function (b) {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    var category = btn.dataset.category;
                    products.forEach(function (product) {
                        product.style.display =
                            category === 'all' || product.dataset.category === category ? 'block' : 'none';
                    });
                });
            });
        }

        products.forEach(function (card) {
            if (card.querySelector('.btn-add-cart')) return;
            var nameEl = card.querySelector('h3');
            var priceEl = card.querySelector('.product-price');
            var imgEl = card.querySelector('.product-image img');
            if (!nameEl || !priceEl) return;
            var name = nameEl.textContent.trim();
            var price = parsePrice(priceEl.textContent);
            var image = imgEl ? imgEl.getAttribute('src') || '' : '';
            var category = card.getAttribute('data-category') || 'strong';

            var actions = document.createElement('div');
            actions.className = 'product-card-actions';

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-add-cart';
            btn.innerHTML = '<span class="btn-add-cart-icon" aria-hidden="true">+</span> В корзину';
            btn.addEventListener('click', function () {
                addToCart(name, price, image);
                btn.classList.add('btn-add-cart--added');
                btn.innerHTML = '<span aria-hidden="true">✓</span> Добавлено';
                window.setTimeout(function () {
                    btn.classList.remove('btn-add-cart--added');
                    btn.innerHTML = '<span class="btn-add-cart-icon" aria-hidden="true">+</span> В корзину';
                }, 1400);
                if (typeof window.showCrossSell === 'function') window.showCrossSell(card, category, name);
            });

            var quickBtn = document.createElement('button');
            quickBtn.type = 'button';
            quickBtn.className = 'btn-quick-order';
            quickBtn.textContent = '1 клик';
            quickBtn.setAttribute('aria-label', 'Быстрый заказ: ' + name);
            quickBtn.addEventListener('click', function () {
                if (openOneClickModal) openOneClickModal(name);
                if (typeof window.showCrossSell === 'function') window.showCrossSell(card, category, name);
            });

            actions.appendChild(btn);
            actions.appendChild(quickBtn);
            card.appendChild(actions);

            card.addEventListener('click', function (e) {
                if (e.target.closest('button')) return;
                if (typeof window.showCrossSell === 'function') window.showCrossSell(card, category, name);
            });
        });

        var timerEl = document.getElementById('promo-countdown');
        if (timerEl) {
            function nextSundayEnd() {
                var now = new Date();
                var end = new Date(now);
                var day = now.getDay();
                var daysUntil = day === 0 ? 0 : 7 - day;
                end.setDate(now.getDate() + daysUntil);
                end.setHours(23, 59, 59, 999);
                if (end <= now) end.setDate(end.getDate() + 7);
                return end;
            }
            var promoEnd = nextSundayEnd();
            function tick() {
                var diff = promoEnd - Date.now();
                if (diff <= 0) {
                    promoEnd = nextSundayEnd();
                    diff = promoEnd - Date.now();
                }
                var d = Math.floor(diff / 86400000);
                var h = Math.floor((diff % 86400000) / 3600000);
                var m = Math.floor((diff % 3600000) / 60000);
                var s = Math.floor((diff % 60000) / 1000);
                timerEl.textContent =
                    (d ? d + 'д ' : '') +
                    String(h).padStart(2, '0') + ':' +
                    String(m).padStart(2, '0') + ':' +
                    String(s).padStart(2, '0');
            }
            tick();
            window.setInterval(tick, 1000);
        }

        var crossSection = document.getElementById('catalog-crosssell');
        var crossGrid = document.getElementById('crosssell-grid');
        if (!crossSection || !crossGrid) return;

        var allCards = Array.from(products);

        window.showCrossSell = function (sourceCard, category) {
            var related = allCards
                .filter(function (c) {
                    return c !== sourceCard && c.getAttribute('data-category') === category;
                })
                .slice(0, 3);
            if (related.length < 2) {
                related = allCards.filter(function (c) {
                    return c !== sourceCard;
                }).slice(0, 3);
            }
            crossGrid.innerHTML = '';
            related.forEach(function (c) {
                var n = c.querySelector('h3');
                var p = c.querySelector('.product-price');
                var img = c.querySelector('.product-image img');
                if (!n || !p) return;
                var mini = document.createElement('div');
                mini.className = 'crosssell-mini-card';
                mini.innerHTML =
                    '<div class="product-image image-wrap" data-watermark>' +
                    (img
                        ? '<img loading="lazy" decoding="async" src="' +
                          img.getAttribute('src') +
                          '" alt="' +
                          (img.getAttribute('alt') || '') +
                          '">'
                        : '') +
                    '</div>' +
                    '<h3>' +
                    n.textContent +
                    '</h3>' +
                    '<span class="product-price">' +
                    p.textContent +
                    '</span>';
                var addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'btn btn-add-cart';
                addBtn.textContent = 'В корзину';
                addBtn.addEventListener('click', function () {
                    addToCart(n.textContent.trim(), parsePrice(p.textContent), img ? img.getAttribute('src') : '');
                });
                mini.appendChild(addBtn);
                crossGrid.appendChild(mini);
            });
            crossSection.hidden = false;
            crossSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
    });
})();
