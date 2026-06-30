document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('mobile-menu-btn') || document.querySelector('.mobile-menu-btn');
    const nav = document.getElementById('site-nav') || document.querySelector('.main-nav');
    const backdrop = document.getElementById('nav-backdrop');
    const body = document.body;
    const siteHeader = document.querySelector('.site-header');

    function syncMobileHeaderHeight() {
        if (!siteHeader) return;
        var mq = window.matchMedia('(max-width: 768px)');
        if (mq.matches) {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    document.documentElement.style.setProperty(
                        '--mobile-header-h',
                        siteHeader.offsetHeight + 'px',
                    );
                });
            });
        } else {
            document.documentElement.style.setProperty('--mobile-header-h', '0px');
        }
    }

    syncMobileHeaderHeight();
    window.addEventListener('resize', syncMobileHeaderHeight, { passive: true });
    window.addEventListener('orientationchange', syncMobileHeaderHeight);

    var navTransitionEndHandler = null;
    var navVisibilityFallback = null;

    function syncNavVisibilityForViewport() {
        if (!nav) return;
        if (window.matchMedia('(max-width: 768px)').matches) {
            if (body.classList.contains('nav-open')) {
                nav.style.visibility = 'visible';
                nav.setAttribute('aria-hidden', 'false');
            } else {
                nav.style.visibility = 'hidden';
                nav.setAttribute('aria-hidden', 'true');
            }
        } else {
            body.classList.remove('nav-open');
            body.style.overflow = '';
            if (backdrop) {
                backdrop.hidden = true;
                backdrop.setAttribute('aria-hidden', 'true');
            }
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
            nav.style.visibility = '';
            nav.setAttribute('aria-hidden', 'false');
        }
    }

    syncNavVisibilityForViewport();
    window.addEventListener('resize', syncNavVisibilityForViewport, { passive: true });

    function setNavOpen(open) {
        if (!menuBtn || !nav) return;
        if (!window.matchMedia('(max-width: 768px)').matches) return;
        if (navTransitionEndHandler) {
            nav.removeEventListener('transitionend', navTransitionEndHandler);
            navTransitionEndHandler = null;
        }
        if (open) {
            if (navVisibilityFallback) {
                window.clearTimeout(navVisibilityFallback);
                navVisibilityFallback = null;
            }
            nav.style.visibility = 'visible';
            nav.setAttribute('aria-hidden', 'false');
            syncMobileHeaderHeight();
            body.classList.add('nav-open');
        } else {
            if (navVisibilityFallback) {
                window.clearTimeout(navVisibilityFallback);
                navVisibilityFallback = null;
            }
            navVisibilityFallback = window.setTimeout(function () {
                navVisibilityFallback = null;
                if (!body.classList.contains('nav-open')) {
                    nav.style.visibility = 'hidden';
                    nav.setAttribute('aria-hidden', 'true');
                }
            }, 380);
            navTransitionEndHandler = function (e) {
                if (e.propertyName !== 'transform') return;
                if (navVisibilityFallback) {
                    window.clearTimeout(navVisibilityFallback);
                    navVisibilityFallback = null;
                }
                nav.removeEventListener('transitionend', navTransitionEndHandler);
                navTransitionEndHandler = null;
                if (!body.classList.contains('nav-open')) {
                    nav.style.visibility = 'hidden';
                    nav.setAttribute('aria-hidden', 'true');
                }
            };
            nav.addEventListener('transitionend', navTransitionEndHandler);
            body.classList.remove('nav-open');
        }
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (backdrop) {
            backdrop.hidden = !open;
            backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
        }
        body.style.overflow = open ? 'hidden' : '';
    }

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () {
            setNavOpen(!body.classList.contains('nav-open'));
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', function () {
            setNavOpen(false);
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setNavOpen(false);
    });

    nav &&
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.matchMedia('(max-width: 768px)').matches) {
                    setNavOpen(false);
                }
            });
        });

    const progressEl = document.getElementById('scroll-progress');
    if (progressEl) {
        function updateProgress() {
            const doc = document.documentElement;
            const scrollTop = doc.scrollTop || document.body.scrollTop;
            const height = doc.scrollHeight - doc.clientHeight;
            const pct = height > 0 ? Math.round((scrollTop / height) * 100) : 0;
            progressEl.style.width = pct + '%';
            progressEl.setAttribute('aria-valuenow', String(pct));
        }
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    try {
        var path = location.pathname + location.search;
        var key = 'alko_recent_v1';
        var arr = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(arr)) arr = [];
        if (path && path.length > 0 && !/\.(ico|png|jpe?g|svg|webp|gif)$/i.test(path)) {
            arr = arr.filter(function (p) {
                return p !== path;
            });
            arr.unshift(path);
            arr = arr.slice(0, 6);
            localStorage.setItem(key, JSON.stringify(arr));
        }
    } catch (err) {
        /* ignore */
    }

    function labelForPath(p) {
        if (p === '/' || p === '') return 'Главная';
        if (p.indexOf('/catalog') !== -1) return 'Каталог';
        if (p.indexOf('/contacts') !== -1) return 'Контакты';
        if (p.indexOf('/faq') !== -1) return 'FAQ';
        if (p.indexOf('/rayony') !== -1) return 'Районы';
        if (p.indexOf('/metro/') !== -1) return 'Метро';
        if (p.indexOf('/kategoria/') !== -1) return 'Категории';
        if (p.indexOf('/povod/') !== -1) return 'Повод';
        if (p.indexOf('/vopros/') !== -1) return 'Вопросы';
        if (p.indexOf('/raion/') !== -1) return 'Район';
        var base = p.replace(/\/$/, '').split('/').pop() || p;
        if (base.indexOf('.html') !== -1) base = base.replace('.html', '');
        return base.length > 24 ? base.slice(0, 22) + '…' : base;
    }

    function renderRecentWidget() {
        var host = document.querySelector('[data-recent-widget]');
        if (!host) return;
        try {
            var list = JSON.parse(localStorage.getItem('alko_recent_v1') || '[]');
            if (!Array.isArray(list) || list.length < 2) return;
            var skip = location.pathname + location.search;
            var items = list.filter(function (p) {
                return p !== skip;
            }).slice(0, 4);
            if (!items.length) return;
            var ul = document.createElement('ul');
            items.forEach(function (p) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = p;
                a.textContent = labelForPath(p);
                li.appendChild(a);
                ul.appendChild(li);
            });
            var title = document.createElement('h3');
            title.textContent = host.getAttribute('data-label') || 'Вы недавно смотрели';
            host.innerHTML = '';
            host.appendChild(title);
            host.appendChild(ul);
            host.hidden = false;
        } catch (e) {
            /* ignore */
        }
    }

    renderRecentWidget();

    const categoryBtns = document.querySelectorAll('.category-btn');
    const products = document.querySelectorAll('.product-card');
    if (categoryBtns.length && products.length) {
        categoryBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                categoryBtns.forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                const category = btn.dataset.category;
                products.forEach(function (product) {
                    if (category === 'all' || product.dataset.category === category) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });
    }

    const forms = document.querySelectorAll('#order-form, form[data-telegram-form]');
    forms.forEach(function (form) {
        if (form.tagName !== 'FORM') return;
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const statusDiv =
                form.querySelector('[data-order-status]') ||
                document.getElementById('order-status');
            if (!statusDiv) return;
            statusDiv.innerHTML = '⏳ Отправка...';
            statusDiv.style.color = '#333';

            const nameEl = form.querySelector('[name="name"], #name');
            const phoneEl = form.querySelector('[name="phone"], #phone');
            const commentEl = form.querySelector('[name="comment"], #comment');

            const name = nameEl ? nameEl.value.trim() : '';
            const phone = phoneEl ? phoneEl.value.trim() : '';
            const comment = commentEl ? commentEl.value.trim() : '';

            const data = {
                name: name,
                phone: phone,
                comment: comment,
                source: form.getAttribute('data-source') || 'Сайт АЛКОдоставка',
                orderType: form.getAttribute('data-order-type') || 'Заявка с сайта',
                pageUrl: window.location.href,
            };

            try {
                const response = await fetch('/api/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                let result = {};
                try {
                    result = await response.json();
                } catch (parseErr) {
                    result = { error: 'Некорректный ответ сервера' };
                }

                if (response.ok && result.success) {
                    statusDiv.innerHTML =
                        '✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.';
                    statusDiv.style.color = '#2e7d32';
                    form.reset();
                } else if (result.code === 'TELEGRAM_NOT_CONFIGURED') {
                    statusDiv.innerHTML =
                        '⚠️ Форма временно недоступна. Позвоните <a href="tel:+79997863967">+7 (999) 786-39-67</a> или напишите в WhatsApp / Telegram — кнопки на экране.';
                    statusDiv.style.color = '#e65100';
                } else {
                    statusDiv.innerHTML =
                        '❌ Ошибка: ' +
                        (result.error || 'Не удалось отправить заявку') +
                        '. Позвоните <a href="tel:+79997863967">+7 (999) 786-39-67</a> или используйте мессенджеры.';
                    statusDiv.style.color = '#d32f2f';
                }
            } catch (err) {
                statusDiv.innerHTML =
                    '❌ Ошибка соединения. Позвоните <a href="tel:+79997863967">+7 (999) 786-39-67</a> или напишите в WhatsApp / Telegram.';
                statusDiv.style.color = '#d32f2f';
            }
        });
    });

    document.querySelectorAll('.accordion-header').forEach(function (header) {
        header.addEventListener('click', function () {
            const parentItem = header.parentElement;
            if (parentItem) parentItem.classList.toggle('active');
        });
    });

    /* ===== Корзина (localStorage, не меняет структуру order-form) ===== */
    var CART_KEY = 'alko_cart_v1';

    function readCart() {
        try {
            var raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            return Array.isArray(raw) ? raw : [];
        } catch (e) {
            return [];
        }
    }

    function writeCart(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        updateCartUi();
    }

    function parsePrice(text) {
        return parseInt(String(text || '').replace(/\D/g, ''), 10) || 0;
    }

    function formatRub(n) {
        return n.toLocaleString('ru-RU') + ' ₽';
    }

    function cartSummaryText(items) {
        if (!items.length) return '';
        var lines = items.map(function (it) {
            return it.name + ' × ' + it.qty + ' — ' + formatRub(it.price * it.qty);
        });
        var total = items.reduce(function (s, it) {
            return s + it.price * it.qty;
        }, 0);
        lines.push('Итого: ' + formatRub(total));
        return lines.join('\n');
    }

    function addToCart(name, price) {
        if (!name || !price) return;
        var items = readCart();
        var found = items.find(function (it) {
            return it.name === name;
        });
        if (found) {
            found.qty += 1;
        } else {
            items.push({ name: name, price: price, qty: 1 });
        }
        writeCart(items);
    }

    function removeFromCart(name) {
        writeCart(
            readCart().filter(function (it) {
                return it.name !== name;
            }),
        );
    }

    function changeQty(name, delta) {
        var items = readCart();
        items = items
            .map(function (it) {
                if (it.name !== name) return it;
                return Object.assign({}, it, { qty: it.qty + delta });
            })
            .filter(function (it) {
                return it.qty > 0;
            });
        writeCart(items);
    }

    function ensureCartUi() {
        if (document.getElementById('site-cart-btn')) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'site-cart-btn';
        btn.className = 'btn-header-pill btn-header-cart';
        btn.setAttribute('aria-label', 'Корзина');
        btn.innerHTML = '🛒 <span class="cart-btn-label">Корзина</span> <span class="cart-count" id="cart-count">0</span>';

        var cluster = document.querySelector('.header-cta-cluster');
        if (cluster) {
            cluster.insertBefore(btn, cluster.firstChild);
        }

        var panel = document.createElement('div');
        panel.id = 'cart-panel';
        panel.className = 'cart-panel';
        panel.hidden = true;
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Корзина заказа');
        panel.innerHTML =
            '<div class="cart-panel-inner">' +
            '<div class="cart-panel-head"><h2>Корзина</h2><button type="button" class="cart-panel-close" id="cart-panel-close" aria-label="Закрыть">×</button></div>' +
            '<ul class="cart-items" id="cart-items"></ul>' +
            '<p class="cart-total" id="cart-total">0 ₽</p>' +
            '<div class="cart-panel-actions">' +
            '<a href="/contacts.html#feedback-form" class="btn btn-large" id="cart-checkout">Оформить заявку</a>' +
            '<button type="button" class="btn btn-large btn-outline" id="cart-clear">Очистить</button>' +
            '</div></div>';
        document.body.appendChild(panel);

        var backdrop = document.createElement('div');
        backdrop.id = 'cart-backdrop';
        backdrop.className = 'cart-backdrop';
        backdrop.hidden = true;
        document.body.appendChild(backdrop);

        btn.addEventListener('click', function () {
            panel.hidden = false;
            backdrop.hidden = false;
            body.style.overflow = 'hidden';
        });

        function closeCart() {
            panel.hidden = true;
            backdrop.hidden = true;
            if (!body.classList.contains('nav-open')) body.style.overflow = '';
        }

        document.getElementById('cart-panel-close').addEventListener('click', closeCart);
        backdrop.addEventListener('click', closeCart);
        document.getElementById('cart-clear').addEventListener('click', function () {
            writeCart([]);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hidden) closeCart();
        });
    }

    function renderCartPanel(items) {
        var list = document.getElementById('cart-items');
        var totalEl = document.getElementById('cart-total');
        if (!list || !totalEl) return;

        list.innerHTML = '';
        var total = 0;
        if (!items.length) {
            var empty = document.createElement('li');
            empty.className = 'cart-empty';
            empty.textContent = 'Корзина пуста — добавьте товары из каталога';
            list.appendChild(empty);
        } else {
            items.forEach(function (it) {
                total += it.price * it.qty;
                var li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML =
                    '<span class="cart-item-name">' +
                    it.name +
                    '</span>' +
                    '<span class="cart-item-price">' +
                    formatRub(it.price * it.qty) +
                    '</span>' +
                    '<span class="cart-item-qty">' +
                    '<button type="button" class="cart-qty-btn" data-cart-minus="' +
                    encodeURIComponent(it.name) +
                    '">−</button>' +
                    '<span>' +
                    it.qty +
                    '</span>' +
                    '<button type="button" class="cart-qty-btn" data-cart-plus="' +
                    encodeURIComponent(it.name) +
                    '">+</button>' +
                    '</span>' +
                    '<button type="button" class="cart-remove" data-cart-remove="' +
                    encodeURIComponent(it.name) +
                    '" aria-label="Удалить">×</button>';
                list.appendChild(li);
            });
        }
        totalEl.textContent = 'Итого: ' + formatRub(total);

        list.querySelectorAll('[data-cart-minus]').forEach(function (b) {
            b.addEventListener('click', function () {
                changeQty(decodeURIComponent(b.getAttribute('data-cart-minus')), -1);
            });
        });
        list.querySelectorAll('[data-cart-plus]').forEach(function (b) {
            b.addEventListener('click', function () {
                changeQty(decodeURIComponent(b.getAttribute('data-cart-plus')), 1);
            });
        });
        list.querySelectorAll('[data-cart-remove]').forEach(function (b) {
            b.addEventListener('click', function () {
                removeFromCart(decodeURIComponent(b.getAttribute('data-cart-remove')));
            });
        });
    }

    function updateCartUi() {
        var items = readCart();
        var count = items.reduce(function (s, it) {
            return s + it.qty;
        }, 0);
        var countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = String(count);
        renderCartPanel(items);
    }

    ensureCartUi();
    updateCartUi();

    document.querySelectorAll('.product-card').forEach(function (card) {
        if (card.querySelector('.btn-add-cart')) return;
        var nameEl = card.querySelector('h3');
        var priceEl = card.querySelector('.product-price');
        if (!nameEl || !priceEl) return;
        var name = nameEl.textContent.trim();
        var price = parsePrice(priceEl.textContent);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-add-cart';
        btn.textContent = 'В корзину';
        btn.addEventListener('click', function () {
            addToCart(name, price);
            btn.textContent = 'Добавлено ✓';
            window.setTimeout(function () {
                btn.textContent = 'В корзину';
            }, 1200);
        });
        card.appendChild(btn);
    });

    /* Подстановка корзины в поле комментария заявки (order-form не меняется) */
    var commentField = document.querySelector('#order-form [name="comment"], #comment');
    if (commentField && !commentField.value.trim()) {
        var cartItems = readCart();
        if (cartItems.length) {
            commentField.value = cartSummaryText(cartItems) + '\n\nАдрес доставки: ';
        }
    }
});
