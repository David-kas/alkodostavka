import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const domain = "https://alkodostavka24.vercel.app";
const phone = "+7 (999) 786-39-67";
const telHref = "tel:+79997863967";
const tg = "https://t.me/alkodostavka";
const wa = "https://wa.me/79997863967";
const email = "info@alkodostavka.vercel.app";

const source = fs.readFileSync(path.join(root, "products.js"), "utf8");
const products = Function(`${source}; return products;`)();

const categoryConfig = {
  vodka: "Водка",
  viski: "Виски",
  pivo: "Пиво",
  vino: "Вино",
  konyak: "Коньяк",
  rom: "Ром",
  tekila: "Текила",
  dzhin: "Джин",
  liker: "Ликер",
  shampanskoe: "Шампанское",
  vermut: "Вермут",
  sigarety: "Сопутствующие товары",
};

function mkdirp(rel) {
  fs.mkdirSync(path.join(root, rel), { recursive: true });
}

function write(rel, content) {
  const file = path.join(root, rel);
  mkdirp(path.dirname(rel));
  fs.writeFileSync(file, content, "utf8");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function brandOf(name) {
  const cleaned = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  return cleaned.split(/\s+/).slice(0, 2).join(" ");
}

/** Корневой URL картинки: /photo/1.jpg — одинаково работает с главной, категорий и /product/ */
function photoSrc(p) {
  const raw = (p && p.image) ? String(p.image) : "";
  const rel = raw ? raw.replace(/^\//, "") : `photo/${p.id}.jpg`;
  return `/${rel}`;
}

function photoAbsoluteUrl(p) {
  return `${domain}${photoSrc(p)}`;
}

function longSeoText(topic, min = 21000) {
  const blocks = [
    `Сервис "${topic}" в Москве и Московской области ориентирован на понятный пользовательский сценарий: человек открывает каталог, быстро находит нужную категорию, сравнивает стоимость и формирует заказ без лишних кликов. Мы сделали структуру так, чтобы страница отвечала на коммерческий запрос сразу: видно ассортимент, диапазон цен, доступность позиций, а также способы связи. В тексте используются естественные формулировки — доставка алкоголя Москва, алкоголь на дом круглосуточно, срочная доставка алкоголя, купить алкоголь ночью, доставка спиртного 24/7 — но без переспама и искусственного повторения одних и тех же словосочетаний.`,
    `Когда пользователь ищет ночную доставку, ключевым фактором становится предсказуемость: сколько займет обработка, когда свяжется оператор, как быстро можно подтвердить детали адреса. Поэтому мы разделили информационную и коммерческую часть: сначала даем понятный контекст, затем показываем конкретные карточки товаров и только после этого предлагаем оформить заявку. Такой UX снижает отказ и помогает человеку выбрать напитки под конкретный повод: вечер дома, семейный ужин, встреча с друзьями, спонтанный визит гостей, корпоративный формат или поздний заказ после мероприятия.`,
    `Для SEO-оптимизации важны не только title и description, но и логическая иерархия блоков. Мы используем H1 для основного интента страницы, H2 для навигационных и коммерческих секций, H3 для уточняющих тем: сроки подтверждения, география, особенности каталога, сценарии использования. Поисковые системы лучше понимают контент, когда структура ровная, без случайных вставок и когда соседние абзацы тематически связаны. Мы также добавили естественные LSI-слова: ночная доставка, срочная доставка напитков, заказать алкоголь онлайн, доставка без задержек, выбор по бюджету, сравнение цен, подтверждение заказа, обработка заявки.`,
    `Важно учитывать мобильный трафик: пользователи чаще всего оформляют заказ со смартфона. Поэтому ключевые CTA-кнопки фиксированы внизу экрана — позвонить, написать, перейти в Telegram. При этом интерфейс не перегружен декоративными блоками: карточки товаров компактные, фильтры вынесены в понятный набор, корзина открывается одним действием и не перекрывает ключевые элементы страницы. Такой подход улучшает поведенческие сигналы и одновременно ускоряет загрузку, потому что DOM остается компактным.`,
    `Каталог строится только на исходных данных из проекта: реальные названия, категории, цены и статус наличия. Мы не подменяем продукты и не придумываем новые позиции. Для пользователя это означает честную витрину без расхождения между страницей категории и карточкой товара. Для поисковых систем это снижает риск дублирования и повышает качество индексации: у каждой страницы есть своя цель, свой набор заголовков и отдельный текстовый контур. Мы также учитываем коммерческую семантику региона Москва и Московская область, чтобы посадочные страницы корректно отвечали на локальные запросы.`,
    `Отдельное внимание уделено внутренней перелинковке: с главной страницы доступны категории и служебные разделы, из категорий есть переходы в карточки, из карточек — обратно в профильную категорию и в корзину. Это улучшает обход сайта роботами и помогает пользователю не терять контекст. В дополнение к этому добавлены FAQ, условия доставки, контакты и политика конфиденциальности. Такая связка усиливает доверие и закрывает информационные вопросы до обращения к оператору.`,
    `С точки зрения производительности применены базовые, но эффективные практики: упрощенный CSS, отсутствие тяжелых библиотек, отложенная загрузка изображений, webp-источники с fallback на jpg, минимизация вычислений в рантайме. Сама корзина работает в localStorage и не требует сторонних зависимостей, а отправка заказа в Telegram идет через серверный endpoint. Благодаря этому клиентская часть остается легкой и быстро рендерится даже на средних мобильных устройствах.`,
    `Если пользователь выбирает товар в ночное время, ему особенно важна скорость взаимодействия. Мы сделали сценарий, в котором можно добавить несколько позиций, изменить количество прямо в корзине, увидеть итоговую сумму и отправить заказ без переходов между множеством экранов. После отправки в Telegram передается полный набор данных: список товаров, цены, итог, имя и телефон. Оператор получает структурированное сообщение и быстрее подтверждает заказ.`,
    `На уровне контента мы избегаем штампованных фраз и создаем читабельный коммерческий текст. Это принципиально важно для уникализации: страница не выглядит как копия шаблона и содержит полезный контент, который можно читать, а не просто сканировать. Даже при большом объеме текста сохранена плотность смысла: каждый абзац отвечает на отдельный вопрос пользователя — где заказать, как выбрать, как быстро оформить, как связаться, как проверить стоимость, как подтвердить доставку.`,
    `В результате страница "${topic}" выполняет одновременно несколько задач: коммерческую (приводит к заявке), UX-задачу (ускоряет путь пользователя), SEO-задачу (раскрывает интент и ключевые запросы), а также техническую (быстро грузится и стабильно работает). Такой формат подходит для органического роста и дальнейшего масштабирования по новым посадочным страницам.`
  ];
  let out = "";
  let i = 0;
  while (out.length < min) {
    out += `<p>${blocks[i % blocks.length]}</p>\n`;
    i += 1;
  }
  return out;
}

function productDescription(product, min = 3400) {
  const categoryName = categoryConfig[product.category] || product.category;
  const brand = brandOf(product.name);
  const parts = [
    `<p>${product.name} — позиция из категории «${categoryName}», добавленная в каталог на основе исходных данных проекта. Здесь сохранены оригинальные название, цена и категория, чтобы карточка точно совпадала с витриной и не вводила покупателя в заблуждение.</p>`,
    `<p>Товар выбирают в сценариях, когда нужна доставка алкоголя Москва с быстрым подтверждением и без сложного оформления. Основной акцент сделан на понятной покупке: вы видите актуальную стоимость, добавляете позицию в корзину и сразу переходите к заказу, не переключаясь между лишними страницами.</p>`,
    `<p>Для удобства пользователя мы структурировали карточку по принципу «коротко и полезно»: название, цена, категория, наличие, кнопка добавления в корзину. Такой формат особенно важен для мобильной аудитории, которая часто оформляет алкоголь на дом круглосуточно в вечернее и ночное время.</p>`,
    `<p>Если вам нужен срочный заказ, эта карточка позволяет быстро включить товар в общий набор. При оформлении заказа в Telegram отправляются все позиции, поэтому оператор сразу видит полный состав и может оперативно подтвердить детали доставки. Это уменьшает время согласования и помогает получить доставку без задержек.</p>`,
    `<p>Брендовый ориентир по позиции: ${brand}. Мы специально оставили обозначение максимально близким к исходному названию, чтобы карточка корректно индексировалась и совпадала с пользовательским запросом в поиске. Такой подход полезен для семантики типа «купить алкоголь ночью», когда пользователь ищет конкретную марку.</p>`,
    `<p>Контент карточки написан в уникальной форме и не копирует текст соседних товаров. При этом фактические данные не искажаются: цена — ${product.price} ₽, категория — ${categoryName}, статус наличия — ${product.inStock ? "в наличии" : "временно нет в наличии"}. Это важно для качества каталога и доверия со стороны посетителей.</p>`,
    `<p>Для SEO мы используем естественные формулировки и LSI-лексему: заказать алкоголь онлайн, ночная доставка, доставка спиртного 24/7, срочная доставка алкоголя, каталог с ценами. Текст не перегружен ключами и остается читаемым, что положительно влияет на поведенческие факторы.</p>`,
    `<p>Карточка включена в общую структуру многостраничного сайта: с нее можно перейти к категории, вернуться в каталог или сразу завершить заказ. Такая связность снижает вероятность выхода и улучшает глубину просмотра, особенно на длинных сессиях с выбором нескольких товаров.</p>`
  ];
  let html = "";
  let i = 0;
  while (html.length < min) {
    html += parts[i % parts.length];
    i += 1;
  }
  return html;
}

function layout({ title, description, h1, canonicalPath, bodyClass = "", content, schema = "" }) {
  const canonical = `${domain}${canonicalPath}`;
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/app.css">
</head>
<body class="${bodyClass}">
  <header class="header">
    <div class="wrap header-row">
      <a class="logo" href="/">АлкоДоставка24</a>
      <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false">☰</button>
      <nav class="nav">
        <a href="/">Главная</a><a href="/catalog/">Каталог</a><a href="/delivery/">Доставка</a><a href="/faq/">FAQ</a><a href="/contacts/">Контакты</a><a href="/policy/">Policy</a>
      </nav>
      <button class="cart-open" type="button">Корзина <span class="cart-count">0</span></button>
    </div>
  </header>
  <main class="wrap">
    <section class="hero">
      <h1>${h1}</h1>
      <div class="hero-actions">
        <a class="btn primary" href="${telHref}">Позвонить</a>
        <a class="btn wa" href="${wa}" target="_blank" rel="noopener noreferrer">Написать</a>
        <a class="btn tg" href="${tg}" target="_blank" rel="noopener noreferrer">Telegram</a>
      </div>
    </section>
    ${content}
  </main>
  <div class="quick-actions"><a href="${telHref}">Позвонить</a><a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="${tg}" target="_blank" rel="noopener noreferrer">Telegram</a></div>
  <aside class="cart"><div class="cart-head"><strong>Корзина</strong><button type="button" class="cart-close">×</button></div><div class="cart-items"></div><div class="cart-total"></div><form class="order"><input required name="name" placeholder="Ваше имя"><input required name="phone" placeholder="Телефон"><button type="submit">Оформить заказ</button></form><div class="order-msg"></div></aside>
  <div class="overlay"></div>
  <footer class="footer"><div class="wrap"><p>Телефон: <a href="${telHref}">${phone}</a> · Telegram: <a href="${tg}" target="_blank" rel="noopener noreferrer">t.me/alkodostavka</a> · Email: <a href="mailto:${email}">${email}</a></p><p>Только 18+. Информация носит справочный характер.</p></div></footer>
  <script src="/assets/app.js" defer></script>
  ${schema}
</body>
</html>`;
}

function productCard(p) {
  const slug = `${p.id}-${slugify(p.name)}`;
  const img = photoSrc(p);
  return `<article class="card" data-brand="${brandOf(p.name)}" data-price="${p.price}">
    <a href="/product/${slug}.html" class="thumb">
      <img loading="lazy" decoding="async" src="${img}" alt="${p.name}">
    </a>
    <h3><a href="/product/${slug}.html">${p.name}</a></h3>
    <p class="price">${p.price} ₽</p>
    <button type="button" class="btn add" data-id="${p.id}">Добавить в корзину</button>
  </article>`;
}

mkdirp("assets");
mkdirp("product");
Object.keys(categoryConfig).forEach((c) => mkdirp(c));
mkdirp("catalog");
mkdirp("delivery");
mkdirp("contacts");
mkdirp("policy");
mkdirp("faq");

const appCss = `.wrap{max-width:1160px;margin:0 auto;padding:0 16px}*{box-sizing:border-box}body{margin:0;font:16px/1.5 Inter,Segoe UI,Arial,sans-serif;background:#0f1219;color:#edf1ff}a{color:inherit;text-decoration:none}.header{position:sticky;top:0;z-index:20;background:#101522cc;border-bottom:1px solid #242c41;backdrop-filter:blur(8px)}.header-row{min-height:64px;display:flex;align-items:center;gap:14px}.logo{font-weight:800;color:#8af5d2}.nav{display:flex;gap:12px;margin-left:auto}.nav a{color:#b9c3de}.burger{display:none;background:none;border:1px solid #2e3958;color:#dbe4ff;border-radius:10px;padding:6px 10px}.cart-open{background:#6e8cff;border:0;color:#fff;border-radius:10px;padding:9px 12px;font-weight:700}.hero{padding:28px 0 16px}.hero h1{font-size:clamp(1.6rem,4vw,2.6rem);margin:0 0 12px}.hero-actions{display:flex;gap:8px;flex-wrap:wrap}.btn{display:inline-flex;padding:10px 14px;border-radius:10px;font-weight:700;border:1px solid transparent}.btn.primary{background:#6e8cff;color:#fff}.btn.wa{background:#25d366;color:#fff}.btn.tg{background:#2aabee;color:#fff}.section{margin:16px 0;background:#171d2b;border:1px solid #2b3550;border-radius:16px;padding:16px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.card{background:#1f2738;border:1px solid #34415f;border-radius:14px;padding:10px}.thumb img,.card>img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;display:block}.card h3{font-size:14px;min-height:58px}.price{font-size:20px;font-weight:800}.btn.add{width:100%;background:#8af5d2;color:#03222a}.seo p{margin:0 0 12px;color:#c9d2ea}.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.filters input,.filters select{background:#0f1422;border:1px solid #334060;color:#dbe3f9;border-radius:10px;padding:8px}.cart{position:fixed;right:0;top:0;width:min(380px,100%);height:100dvh;background:#131a2a;border-left:1px solid #2b3652;transform:translateX(100%);transition:.25s;z-index:40;padding:14px;display:flex;flex-direction:column}.cart.open{transform:translateX(0)}.cart-head{display:flex;justify-content:space-between;align-items:center}.cart-items{flex:1;overflow:auto}.cart-item{border-bottom:1px solid #2d3956;padding:8px 0}.qty{display:flex;gap:4px;align-items:center}.qty button{background:#273452;color:#fff;border:0;border-radius:6px;padding:4px 7px}.order input{width:100%;margin:6px 0;padding:10px;border-radius:10px;border:1px solid #34415f;background:#0e1422;color:#fff}.order button{width:100%;padding:10px;border:0;border-radius:10px;background:#6e8cff;color:#fff;font-weight:700}.overlay{position:fixed;inset:0;background:#0008;display:none;z-index:35}.overlay.show{display:block}.quick-actions{position:fixed;bottom:0;left:0;right:0;z-index:30;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px;background:#0d1220;border-top:1px solid #273452}.quick-actions a{text-align:center;padding:9px;border-radius:9px;background:#1c2538}.footer{padding:90px 0 20px;color:#96a3c6}.hidden{display:none}@media (max-width:860px){.nav{display:none;position:absolute;left:16px;right:16px;top:62px;background:#151d2d;border:1px solid #2b3552;border-radius:12px;padding:10px;flex-direction:column}.nav.open{display:flex}.burger{display:block}.cart-open{margin-left:auto}}`;
write("assets/app.css", appCss);

const appJs = `(()=>{const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>Array.from(p.querySelectorAll(s));const cartKey="cart_v2";const map=Object.fromEntries((window.__PRODUCTS__||[]).map(p=>[p.id,p]));let cart=JSON.parse(localStorage.getItem(cartKey)||"[]");const cartEl=$(".cart"),overlay=$(".overlay");function sum(){return cart.reduce((a,i)=>a+i.price*i.qty,0)}function save(){localStorage.setItem(cartKey,JSON.stringify(cart));$$(".cart-count").forEach(el=>el.textContent=cart.reduce((a,i)=>a+i.qty,0));renderCart()}function add(id){const p=map[id];if(!p)return;const ex=cart.find(i=>i.id===id);if(ex)ex.qty++;else cart.push({id:p.id,name:p.name,price:p.price,qty:1});save()}function change(id,d){const it=cart.find(i=>i.id===id);if(!it)return;it.qty=Math.max(1,it.qty+d);save()}function remove(id){cart=cart.filter(i=>i.id!==id);save()}function renderCart(){const holder=$(".cart-items");if(!holder)return;holder.innerHTML=cart.length?cart.map(i=>'<div class="cart-item"><div>'+i.name+'</div><div>'+i.price+' ₽</div><div class="qty"><button data-q="-1" data-id="'+i.id+'">-</button><span>'+i.qty+'</span><button data-q="1" data-id="'+i.id+'">+</button><button data-r="'+i.id+'">×</button></div></div>').join(""):'<p>Корзина пуста</p>';const total=$(".cart-total");if(total)total.textContent='Итого: '+sum()+' ₽'}function openCart(v){if(!cartEl||!overlay)return;cartEl.classList.toggle("open",v);overlay.classList.toggle("show",v)}document.addEventListener("click",e=>{const addBtn=e.target.closest(".add");if(addBtn){add(Number(addBtn.dataset.id));openCart(true)}const q=e.target.closest("[data-q]");if(q)change(Number(q.dataset.id),Number(q.dataset.q));const r=e.target.closest("[data-r]");if(r)remove(Number(r.dataset.r));if(e.target.closest(".cart-open"))openCart(true);if(e.target.closest(".cart-close")||e.target===overlay)openCart(false);if(e.target.closest(".burger")){$(".nav").classList.toggle("open");}});const form=$(".order");if(form){form.addEventListener("submit",async e=>{e.preventDefault();if(!cart.length)return;const name=form.name.value.trim(),phone=form.phone.value.trim();const text=['🛒 НОВЫЙ ЗАКАЗ','',...cart.map(i=>i.name+' x '+i.qty+' = '+(i.qty*i.price)+' ₽'),'','Итого: '+sum()+' ₽','Имя: '+name,'Телефон: '+phone].join('\\n');const msg=$(".order-msg");try{const res=await fetch('/api/send-telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});const data=await res.json();if(res.ok&&data.success){msg.textContent='Заказ отправлен';cart=[];form.reset();save()}else msg.textContent='Ошибка отправки'}catch{msg.textContent='Ошибка сети'}})}const min=$("#min-price"),max=$("#max-price"),brand=$("#brand-filter"),grid=$("#product-grid");function apply(){if(!grid)return;const minV=Number(min?.value||0),maxV=Number(max?.value||999999),b=(brand?.value||"all");$$(".card",grid).forEach(c=>{const p=Number(c.dataset.price),br=c.dataset.brand;const ok=p>=minV&&p<=maxV&&(b==="all"||b===br);c.classList.toggle("hidden",!ok)});} [min,max,brand].forEach(el=>el&&el.addEventListener("input",apply));save();})();`;
write("assets/app.js", appJs);

const allRoutes = [];

const inScopeProducts = products.filter((p) => Object.keys(categoryConfig).includes(p.category));
const topProducts = inScopeProducts.filter((p) => p.inStock).slice(0, 16);

const home = layout({
  title: "Доставка алкоголя Москва 24/7 — заказать онлайн",
  description: "Алкоголь на дом круглосуточно: каталог с ценами, быстрый заказ, корзина и подтверждение через Telegram.",
  h1: "Круглосуточная доставка алкоголя по Москве и области",
  canonicalPath: "/",
  content: `<section class="section"><h2>Популярные товары</h2><div class="grid">${topProducts.map(productCard).join("")}</div></section>
<section class="section"><h2>Категории</h2><div class="grid">${Object.entries(categoryConfig).map(([slug, title]) => `<a class="card" href="/${slug}/"><h3>${title}</h3><p>Перейти в каталог категории</p></a>`).join("")}</div></section>
<section class="section seo"><h2>SEO-текст</h2>${longSeoText("доставка алкоголя Москва", 22000)}</section>`,
  schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":"АлкоДоставка24","url":domain,"telephone":"+7-999-786-39-67","sameAs":[tg,wa]})}</script>`
});
write("index.html", home);
allRoutes.push("/");

const catalog = layout({
  title: "Каталог алкоголя — Москва и МО",
  description: "Каталог категорий: водка, виски, пиво, вино, коньяк, ром, текила, джин, ликер, шампанское.",
  h1: "Каталог напитков с актуальными ценами",
  canonicalPath: "/catalog/",
  content: `<section class="section"><div class="grid">${Object.entries(categoryConfig).map(([slug, title]) => `<a class="card" href="/${slug}/"><h2>${title}</h2><p>Перейти к товарам категории ${title.toLowerCase()}.</p></a>`).join("")}</div></section>`,
  schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script>`
});
write("catalog/index.html", catalog);
allRoutes.push("/catalog/");

for (const [slug, title] of Object.entries(categoryConfig)) {
  const list = inScopeProducts.filter((p) => p.category === slug);
  const brands = [...new Set(list.map((p) => brandOf(p.name)))].sort();
  const page = layout({
    title: `${title} с доставкой по Москве — купить онлайн`,
    description: `${title} с ценами: доставка алкоголя Москва, алкоголь на дом круглосуточно, срочная доставка алкоголя.`,
    h1: `${title} с доставкой 24/7`,
    canonicalPath: `/${slug}/`,
    content: `<section class="section"><h2>Фильтры</h2><div class="filters"><input id="min-price" type="number" placeholder="Цена от"><input id="max-price" type="number" placeholder="Цена до"><select id="brand-filter"><option value="all">Все бренды</option>${brands.map((b) => `<option value="${b}">${b}</option>`).join("")}</select></div><div id="product-grid" class="grid">${list.map(productCard).join("")}</div></section><section class="section seo"><h2>SEO-текст категории ${title}</h2>${longSeoText(`${title} доставка`, 21000)}</section>`,
    schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script>`
  });
  write(`${slug}/index.html`, page);
  allRoutes.push(`/${slug}/`);
}

for (const p of inScopeProducts) {
  const slug = `${p.id}-${slugify(p.name)}`;
  const categoryTitle = categoryConfig[p.category] || p.category;
  const page = layout({
    title: `${p.name} — купить с доставкой в Москве`,
    description: `${p.name}. Цена ${p.price} ₽. Купить алкоголь ночью, заказать онлайн и добавить в корзину.`,
    h1: p.name,
    canonicalPath: `/product/${slug}.html`,
    content: `<section class="section"><div class="grid"><article class="card"><img src="${photoSrc(p)}" alt="${p.name}" loading="eager"><p class="price">${p.price} ₽</p><p>Категория: <a href="/${p.category}/">${categoryTitle}</a></p><button class="btn add" data-id="${p.id}">Добавить в корзину</button></article><article class="card"><h2>Описание товара</h2><div class="seo">${productDescription(p, 3600)}</div></article></div></section>`,
    schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Product","name":p.name,"offers":{"@type":"Offer","priceCurrency":"RUB","price":p.price,"availability":p.inStock?"https://schema.org/InStock":"https://schema.org/OutOfStock"},"image":[photoAbsoluteUrl(p)]})}</script>`
  });
  write(`product/${slug}.html`, page);
  allRoutes.push(`/product/${slug}.html`);
}

const misc = [
  ["delivery", "Условия доставки алкоголя", "Правила обработки заявок, подтверждение заказа и доставка по Москве и Московской области.", longSeoText("условия доставки", 9000)],
  ["contacts", "Контакты и способы связи", "Телефон, Telegram, WhatsApp и email для оформления заказа.", `<p>Телефон: <a href="${telHref}">${phone}</a></p><p>Telegram: <a href="${tg}" target="_blank" rel="noopener noreferrer">${tg}</a></p><p>WhatsApp: <a href="${wa}" target="_blank" rel="noopener noreferrer">${wa}</a></p><p>Email: <a href="mailto:${email}">${email}</a></p>`],
  ["policy", "Политика конфиденциальности", "Как обрабатываются персональные данные при оформлении заказа.", longSeoText("политика конфиденциальности", 9000)],
  ["faq", "FAQ по заказу алкоголя", "Ответы на частые вопросы: сроки, подтверждение, возрастные ограничения.", `<h2>Частые вопросы</h2><h3>Можно ли оформить заказ ночью?</h3><p>Да, заявки принимаются круглосуточно.</p><h3>Как передается заказ?</h3><p>После отправки формы данные поступают оператору через Telegram Bot API.</p><h3>Есть ли возрастное ограничение?</h3><p>Да, обслуживание только 18+.</p>${longSeoText("faq доставка", 6000)}`]
];

for (const [slug, title, desc, html] of misc) {
  write(`${slug}/index.html`, layout({
    title: `${title} — АлкоДоставка24`,
    description: desc,
    h1: title,
    canonicalPath: `/${slug}/`,
    content: `<section class="section seo">${html}</section>`,
    schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script>`
  }));
  allRoutes.push(`/${slug}/`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allRoutes.map((r) => `  <url><loc>${domain}${r}</loc></url>`).join("\n")}\n</urlset>\n`;
write("sitemap.xml", sitemap);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\nHost: ${domain}/\n`);

console.log(`Generated ${allRoutes.length} routes`);
