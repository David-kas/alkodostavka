import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const domain = "https://alkodostavka24.vercel.app";
const phone = "+7 (999) 786-39-67";
const telHref = "tel:+79997863967";
const tg = "https://t.me/alkotaxi_bot";
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

function paragraphsHtml(lines) {
  return lines.map((t) => `<p>${t}</p>`).join("\n");
}

const categoryTales = {
  vodka: [
    "Водка — про холодный стакан, чистый вкус и неспешную закуску: кто-то любит классическую пару с селёдкой и луком, кто-то — лёгкие закуски, чтобы не перебить аромат.",
    "У разных марок разный характер: где-то мягче «вход», где-то ощущается сухость и длинное послевкусие. Объём бутылки тоже решает — на двоих часто берут стандарт 0,7, на компанию смотрят в сторону литра.",
    "Если вы собираете домашний бар, водка — та база, из которой потом складываются простые коктейли или честные порции «на стол» без лишней театральности.",
  ],
  viski: [
    "Виски умеет быть тёплым вечерним спутником: в стакане раскрываются дым, карамель, сухофрукты или пряности — в зависимости от того, сколько лет бутылка провела в бочке.",
    "Кто-то пьёт со льдом, кто-то добавляет каплю воды, чтобы «разбудить» букет. Не бойтесь пробовать: хороший виски редко спорит с тихой музыкой и разговором не спеша.",
    "В каталоге можно подобрать бутылку и к подарку, и к личной полке — ориентируйтесь на привычный стиль: торфовый, сладкий, деликатно-цитрусовый.",
  ],
  pivo: [
    "Пиво — самый демократичный герой вечера: лагер освежает после дня, а более плотные сорта хороши к мясу, сыру или просто к разговору на кухне.",
    "Светлое и тёмное, фильтрованное и нефильтрованное — выбор часто зависит от сезона и настроения: летом тянет на лёгкое, зимой — на что-то с выраженным солодом.",
    "Если гости уже в пути, несколько разных форматов в корзине спасают ситуацию: каждый найдёт свой стакан.",
  ],
  vino: [
    "Вино любят за историю в бокале: красное может быть ягодным или «с сушёной вишней», белое — кисловатым и минеральным или мягким, как спелая груша.",
    "Не обязательно знать все термины: достаточно помнить, что к жирной еде чаще тянет на танины красного, к рыбе и салатам — на белое и розе.",
    "Бутылка вина превращает обычную пятницу в маленький праздник — особенно если заранее слегка охладить белое или игристое.",
  ],
  konyak: [
    "Коньяк ассоциируется с медленным кругом: бокал греет ладонь, аромат тянется табаком, сухофруктами и орехом. Его часто оставляют «на потом» в хорошем смысле — на тихий час после ужина.",
    "Классический сценарий — небольшой бокал, вода рядом и неспешный разговор. Коньяк не любит спешки: раскрывается, когда к нему возвращаются маленькими глотками.",
    "Если вы выбираете в подарок, выигрывают узнаваемые имена и аккуратная упаковка; для себя можно искать баланс цены и привычного вкуса.",
  ],
  rom: [
    "Ром привозит в гостиную отголосок Карибов: сладковатый профиль, часто ваниль и тростник, иногда дым — в зависимости от выдержки и региона.",
    "Его пьют чистым, с колой или в простых коктейлях; для домашней вечеринки ром часто оказывается самым недооценённым «универсалом».",
    "Хороший ром не обязан быть «огненным» — многие позиции мягкие и дружелюбные даже тем, кто к крепкому относится осторожно.",
  ],
  tekila: [
    "Текила — про голубую агаву, солнце и резкий, честный характер: благородная текила пахнет землёй и цитрусом, а не только спиртовым тоном.",
    "Её подают ритуально с солью и лаймом или спокойно из маленькой рюмки, как бренди — если бутылка достойная.",
    "В нашем разделе можно найти и то, что украсит полку, и то, что подойдёт к шумной компании — смотрите по крепости и привычному бренду.",
  ],
  dzhin: [
    "Джин строится вокруг можжевельника: отсюда «хвойная» свежесть, к которой производители добавляют кориандр, цитрус, пряности — получается букет, похожий на аромат трав после дождя.",
    "С тоником он превращается в классику, в сухом мартини — в более строгий вариант. Дома джин часто держат именно как базу для простых, но эффектных коктейлей.",
    "Если вы новичок, начните с проверенных марок с мягкой горчинкой — так проще поймать свой идеальный баланс с тоником.",
  ],
  liker: [
    "Ликёры — про десерт и уют: кофейные, сливочные, цитрусовые, травяные; их наливают после еды, добавляют в кофе или кофейные коктейли.",
    "Небольшой объём и сладость делают их удобными для «последнего бокала» — когда уже не хочется крепкого, но хочется праздничной точки.",
    "В каталоге можно подобрать бутылку под конкретный вкус: шоколад, апельсин, травы — ориентируйтесь на то, что обычно нравится вам или адресату подарка.",
  ],
  shampanskoe: [
    "Игристое будит ассоциации со щелчком пробки и смехом: оно уместно и в большом празднике, и в том случае, когда «просто хочется пузырьков» в четверг.",
    "Брют суше, полусладкое мягче по ощущению — если сомневаетесь, подумайте, будет ли рядом еда или только бокалы и разговор.",
    "Холодное шампанское держит настроение: не забудьте охладить бутылку заранее, чтобы пузырьки звучали чище.",
  ],
  vermut: [
    "Вермут — ароматный, травяной, чуть сладковатый; его любят в аперитивах и в классических миксах, где нужен характер без лишней крепости.",
    "Белый вермут часто уходит в сухие и «светлые» коктейли, красный — в более насыщенные и горьковатые сочетания.",
    "Дома бутылка вермута превращает бар в чуть более «европейский»: хватит тоника, льда и дольки цитруса.",
  ],
  sigarety: [
    "Сопутствующие товары в заказе — про привычный набор к вечеру. Смотрите карточки и цены, добавляйте в корзину вместе с напитками, если это уместно именно вам.",
    "Напоминаем: курение вредит здоровью. Алкоголь — только с 18 лет, в меру и ответственно.",
    "Если не уверены в составе корзины, лучше уточнить у оператора перед отправкой заявки.",
  ],
};

const orderClosingLines = [
  "Мы работаем в Москве и по области: оформите заявку через корзину или позвоните — оператор поможет собрать заказ и уточнить детали.",
  "Цены в карточках ориентировочные для витрины; итог и наличие конкретных позиций проще всего подтвердить при звонке или в переписке.",
  "Пейте ответственно, не садитесь за руль в состоянии опьянения и помните про возраст 18+.",
];

function homeEditorialHtml() {
  const lines = [
    "Иногда вечер просится к столу сам: город за окном шумит, а вам хочется простого — выбрать бутылку без очередей и лишних разговоров в магазине.",
    "В каталоге собраны водка и виски, вино и пиво, крепкий бренди и лёгкие аперитивы — можно собрать сет под ужин, праздник или тихую пятницу вдвоём.",
    "Мы делаем ставку на понятность: видно цену, категорию и можно сразу положить товар в корзину. Остальное — вопрос пары минут на звонок или сообщение оператору.",
    "Если вы не уверены, что выбрать, начните с привычного бренда или объёма — так проще не промахнуться с подарком или с «тем самым» вкусом.",
    "Напоминаем: алкоголь — удовольствие для взрослых. Берегите себя и окружающих, не смешивайте разное без меры и планируйте дорогу домой заранее.",
    ...orderClosingLines,
  ];
  return paragraphsHtml(lines);
}

function categoryEditorialHtml(slug) {
  const tale = categoryTales[slug] || [
    "В этом разделе собраны позиции категории — листайте карточки, сравнивайте цены и добавляйте понравившееся в корзину.",
  ];
  return paragraphsHtml([...tale, ...orderClosingLines]);
}

function deliveryEditorialHtml() {
  return paragraphsHtml([
    "Оформив заявку, вы передаёте состав заказа и контакты оператору. Дальше мы связываемся с вами, уточняем адрес, время и нюансы подъезда.",
    "География — Москва и Московская область; точные условия и интервал лучше согласовать в момент подтверждения — так меньше недопонимания.",
    "Если что-то из списка временно отсутствует, оператор предложит замену или пересчитает корзину до отправки курьера.",
    "Держите телефон под рукой: быстрый ответ ускоряет сбор заказа и выезд.",
    "Пейте ответственно и помните про возраст 18+ — при получении заказа может понадобиться документ.",
  ]);
}

function policyEditorialHtml() {
  return paragraphsHtml([
    "Когда вы оставляете имя и телефон в форме заказа, мы используем эти данные, чтобы связаться с вами и подтвердить детали доставки.",
    "Мы не продаём контакты третьим лицам и не рассылаем рекламу без вашего запроса. Данные хранятся ровно столько, сколько нужно для обработки заявки.",
    "Если хотите уточнить, что именно сохранилось, или попросить удалить контакт после заказа — напишите или позвоните, мы ответим по существу.",
  ]);
}

function faqExtraHtml() {
  return paragraphsHtml([
    "Заказ ночью отличается от дневного только тем, что город спокойнее — смысл тот же: соберите корзину, оставьте телефон и дождитесь звонка.",
    "Если передумали по части позиций, лучше сказать об этом до подтверждения — так проще пересчитать сумму без сюрпризов.",
    "Курьер ориентируется на то, что вы написали в заявке; если подъезд с кодом или отдельный вход, продублируйте это оператору.",
    "При спорных ситуациях спокойный звонок решает больше, чем переписка вслепую — мы на связи.",
  ]);
}

function productDescription(product) {
  const categoryName = categoryConfig[product.category] || product.category;
  const brand = brandOf(product.name);
  const stock = product.inStock
    ? "Позиция отмечена как доступная — точное наличие можно быстро подтвердить у оператора перед выездом."
    : "Сейчас позиция может быть недоступна; загляните позже или спросите у оператора о сроках поступления.";
  const tale = (categoryTales[product.category] && categoryTales[product.category][0]) || `«${categoryName}» — отдельная история вкуса; эта бутылка вписывается в общую картину раздела.`;
  return `<p><strong>${product.name}</strong> — ${tale}</p>
<p>Категория: «${categoryName}». ${stock}</p>
<p>Ориентир по марке: ${brand}. Если вы уже пробовали что-то из этой линейки, новая бутылка часто попадает в ожидаемый стиль — мягче, крепче, с другим послевкусием.</p>
<p>Цена на витрине: <strong>${product.price} ₽</strong>. Итог по корзине пересчитывается перед отправкой заявки.</p>
<p>Добавьте товар в корзину и оставьте телефон — так мы быстрее согласуем состав и время. Только 18+, будьте внимательны к дозе и не садитесь за руль после алкоголя.</p>`;
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

const appCss = `.wrap{max-width:1160px;margin:0 auto;padding:0 16px}*{box-sizing:border-box}body{margin:0;font:16px/1.5 Inter,Segoe UI,Arial,sans-serif;background:#0f1219;color:#edf1ff}a{color:inherit;text-decoration:none}.header{position:sticky;top:0;z-index:20;background:#101522cc;border-bottom:1px solid #242c41;backdrop-filter:blur(8px)}.header-row{min-height:64px;display:flex;align-items:center;gap:14px}.logo{font-weight:800;color:#8af5d2}.nav{display:flex;gap:12px;margin-left:auto}.nav a{color:#b9c3de}.burger{display:none;background:none;border:1px solid #2e3958;color:#dbe4ff;border-radius:10px;padding:6px 10px}.cart-open{background:#6e8cff;border:0;color:#fff;border-radius:10px;padding:9px 12px;font-weight:700}.hero{padding:28px 0 16px}.hero h1{font-size:clamp(1.6rem,4vw,2.6rem);margin:0 0 12px}.hero-actions{display:flex;gap:8px;flex-wrap:wrap}.btn{display:inline-flex;padding:10px 14px;border-radius:10px;font-weight:700;border:1px solid transparent}.btn.primary{background:#6e8cff;color:#fff}.btn.wa{background:#25d366;color:#fff}.btn.tg{background:#2aabee;color:#fff}.section{margin:16px 0;background:#171d2b;border:1px solid #2b3550;border-radius:16px;padding:16px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.card{background:#1f2738;border:1px solid #34415f;border-radius:14px;padding:10px}.thumb img,.card>img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;display:block}.card h3{font-size:14px;min-height:58px}.price{font-size:20px;font-weight:800}.btn.add{width:100%;background:#8af5d2;color:#03222a}.prose p{margin:0 0 12px;color:#c9d2ea}.popular-note{margin-top:0;margin-bottom:12px;color:#aeb9d9;font-size:14px}.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.filters input,.filters select{background:#0f1422;border:1px solid #334060;color:#dbe3f9;border-radius:10px;padding:8px}.cart{position:fixed;right:0;top:0;width:min(380px,100%);height:100dvh;background:#131a2a;border-left:1px solid #2b3652;transform:translateX(100%);transition:.25s;z-index:40;padding:14px;display:flex;flex-direction:column}.cart.open{transform:translateX(0)}.cart-head{display:flex;justify-content:space-between;align-items:center}.cart-items{flex:1;overflow:auto}.cart-item{border-bottom:1px solid #2d3956;padding:8px 0}.qty{display:flex;gap:4px;align-items:center}.qty button{background:#273452;color:#fff;border:0;border-radius:6px;padding:4px 7px}.order input{width:100%;margin:6px 0;padding:10px;border-radius:10px;border:1px solid #34415f;background:#0e1422;color:#fff}.order button{width:100%;padding:10px;border:0;border-radius:10px;background:#6e8cff;color:#fff;font-weight:700}.overlay{position:fixed;inset:0;background:#0008;display:none;z-index:35}.overlay.show{display:block}.quick-actions{position:fixed;bottom:0;left:0;right:0;z-index:30;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px;background:#0d1220;border-top:1px solid #273452}.quick-actions a{text-align:center;padding:9px;border-radius:9px;background:#1c2538}.footer{padding:90px 0 20px;color:#96a3c6}.hidden{display:none}@media (max-width:860px){.nav{display:none;position:absolute;left:16px;right:16px;top:62px;background:#151d2d;border:1px solid #2b3552;border-radius:12px;padding:10px;flex-direction:column}.nav.open{display:flex}.burger{display:block}.cart-open{margin-left:auto}}`;
write("assets/app.css", appCss);

const appJs = `(()=>{const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>Array.from(p.querySelectorAll(s));const cartKey="cart_v2";const map=Object.fromEntries((window.__PRODUCTS__||[]).map(p=>[p.id,p]));let cart=JSON.parse(localStorage.getItem(cartKey)||"[]");const cartEl=$(".cart"),overlay=$(".overlay");function sum(){return cart.reduce((a,i)=>a+i.price*i.qty,0)}function save(){localStorage.setItem(cartKey,JSON.stringify(cart));$$(".cart-count").forEach(el=>el.textContent=cart.reduce((a,i)=>a+i.qty,0));renderCart()}function add(id){const p=map[id];if(!p)return;const ex=cart.find(i=>i.id===id);if(ex)ex.qty++;else cart.push({id:p.id,name:p.name,price:p.price,qty:1});save()}function change(id,d){const it=cart.find(i=>i.id===id);if(!it)return;it.qty=Math.max(1,it.qty+d);save()}function remove(id){cart=cart.filter(i=>i.id!==id);save()}function renderCart(){const holder=$(".cart-items");if(!holder)return;holder.innerHTML=cart.length?cart.map(i=>'<div class="cart-item"><div>'+i.name+'</div><div>'+i.price+' ₽</div><div class="qty"><button data-q="-1" data-id="'+i.id+'">-</button><span>'+i.qty+'</span><button data-q="1" data-id="'+i.id+'">+</button><button data-r="'+i.id+'">×</button></div></div>').join(""):'<p>Корзина пуста</p>';const total=$(".cart-total");if(total)total.textContent='Итого: '+sum()+' ₽'}function openCart(v){if(!cartEl||!overlay)return;cartEl.classList.toggle("open",v);overlay.classList.toggle("show",v)}document.addEventListener("click",e=>{const addBtn=e.target.closest(".add");if(addBtn){add(Number(addBtn.dataset.id));openCart(true)}const q=e.target.closest("[data-q]");if(q)change(Number(q.dataset.id),Number(q.dataset.q));const r=e.target.closest("[data-r]");if(r)remove(Number(r.dataset.r));if(e.target.closest(".cart-open"))openCart(true);if(e.target.closest(".cart-close")||e.target===overlay)openCart(false);if(e.target.closest(".burger")){$(".nav").classList.toggle("open");}});const form=$(".order");if(form){form.addEventListener("submit",async e=>{e.preventDefault();if(!cart.length)return;const name=form.name.value.trim(),phone=form.phone.value.trim();const text=['🛒 НОВЫЙ ЗАКАЗ','',...cart.map(i=>i.name+' x '+i.qty+' = '+(i.qty*i.price)+' ₽'),'','Итого: '+sum()+' ₽','Имя: '+name,'Телефон: '+phone].join('\\n');const msg=$(".order-msg");try{const res=await fetch('/api/send-telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});const data=await res.json();if(res.ok&&data.success){msg.textContent='Заказ отправлен';cart=[];form.reset();save()}else msg.textContent='Ошибка отправки'}catch{msg.textContent='Ошибка сети'}})}const min=$("#min-price"),max=$("#max-price"),brand=$("#brand-filter"),grid=$("#product-grid");function apply(){if(!grid)return;const minV=Number(min?.value||0),maxV=Number(max?.value||999999),b=(brand?.value||"all");$$(".card",grid).forEach(c=>{const p=Number(c.dataset.price),br=c.dataset.brand;const ok=p>=minV&&p<=maxV&&(b==="all"||b===br);c.classList.toggle("hidden",!ok)});} [min,max,brand].forEach(el=>el&&el.addEventListener("input",apply));save();})();`;
write("assets/app.js", appJs);

const homePopularJs = `(() => {
  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }
  function slugify(value) {
    return value.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 70);
  }
  function brandOf(name) {
    const cleaned = name.replace(/[^\\p{L}\\p{N}\\s]/gu, " ").trim();
    return cleaned.split(/\\s+/).slice(0, 2).join(" ");
  }
  function photoSrc(p) {
    const raw = p && p.image ? String(p.image) : "";
    const rel = raw ? raw.replace(/^\\//, "") : "photo/" + p.id + ".jpg";
    return "/" + rel;
  }
  function pickPopular(pool, count) {
    const byCat = {};
    for (const p of pool) {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    }
    for (const c of Object.keys(byCat)) byCat[c] = shuffle(byCat[c]);
    const cats = shuffle(Object.keys(byCat));
    const out = [];
    let round = 0;
    while (out.length < count) {
      let added = false;
      for (const cat of cats) {
        if (out.length >= count) break;
        const list = byCat[cat];
        if (list[round]) {
          out.push(list[round]);
          added = true;
        }
      }
      if (!added) break;
      round++;
    }
    if (out.length < count) {
      const ids = new Set(out.map(function (p) { return p.id; }));
      const rest = shuffle(pool.filter(function (p) { return !ids.has(p.id); }));
      for (let i = 0; i < rest.length && out.length < count; i++) out.push(rest[i]);
    }
    return shuffle(out);
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function card(p) {
    var slug = p.id + "-" + slugify(p.name);
    var img = esc(photoSrc(p));
    var b = esc(brandOf(p.name));
    var name = esc(p.name);
    return '<article class="card" data-brand="' + b + '" data-price="' + p.price + '"><a href="/product/' + slug + '.html" class="thumb"><img loading="lazy" decoding="async" src="' + img + '" alt="' + name + '"></a><h3><a href="/product/' + slug + '.html">' + name + '</a></h3><p class="price">' + p.price + ' ₽</p><button type="button" class="btn add" data-id="' + p.id + '">Добавить в корзину</button></article>';
  }
  function run() {
    var el = document.getElementById("popular-grid");
    var all = window.__PRODUCTS__ || [];
    if (!el || !all.length) return;
    var pool = all.filter(function (p) { return p.inStock; });
    if (!pool.length) return;
    el.innerHTML = pickPopular(pool, 16).map(card).join("");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();`;
write("assets/home-popular.js", homePopularJs);

const allRoutes = [];

const inScopeProducts = products.filter((p) => Object.keys(categoryConfig).includes(p.category));

const home = layout({
  title: "Доставка алкоголя Москва 24/7 — заказать онлайн",
  description: "Алкоголь на дом круглосуточно: каталог с ценами, быстрый заказ, корзина и подтверждение через Telegram.",
  h1: "Круглосуточная доставка алкоголя по Москве и области",
  canonicalPath: "/",
  content: `<section class="section"><h2>Популярные товары</h2><p class="popular-note">Случайная подборка из разных категорий — обновляется при каждом заходе на страницу.</p><div id="popular-grid" class="grid"></div></section>
<section class="section"><h2>Категории</h2><div class="grid">${Object.entries(categoryConfig).map(([slug, title]) => `<a class="card" href="/${slug}/"><h3>${title}</h3><p>Перейти в каталог категории</p></a>`).join("")}</div></section>
<section class="section"><h2>О доставке и напитках</h2><div class="prose">${homeEditorialHtml()}</div></section>`,
  schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script><script src="/assets/home-popular.js"></script><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":"АлкоДоставка24","url":domain,"telephone":"+7-999-786-39-67","sameAs":[tg,wa]})}</script>`
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
    content: `<section class="section"><h2>Фильтры</h2><div class="filters"><input id="min-price" type="number" placeholder="Цена от"><input id="max-price" type="number" placeholder="Цена до"><select id="brand-filter"><option value="all">Все бренды</option>${brands.map((b) => `<option value="${b}">${b}</option>`).join("")}</select></div><div id="product-grid" class="grid">${list.map(productCard).join("")}</div></section><section class="section"><h2>${title} — коротко о категории</h2><div class="prose">${categoryEditorialHtml(slug)}</div></section>`,
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
    content: `<section class="section"><div class="grid"><article class="card"><img src="${photoSrc(p)}" alt="${p.name}" loading="eager"><p class="price">${p.price} ₽</p><p>Категория: <a href="/${p.category}/">${categoryTitle}</a></p><button class="btn add" data-id="${p.id}">Добавить в корзину</button></article><article class="card"><h2>О товаре</h2><div class="prose">${productDescription(p)}</div></article></div></section>`,
    schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Product","name":p.name,"offers":{"@type":"Offer","priceCurrency":"RUB","price":p.price,"availability":p.inStock?"https://schema.org/InStock":"https://schema.org/OutOfStock"},"image":[photoAbsoluteUrl(p)]})}</script>`
  });
  write(`product/${slug}.html`, page);
  allRoutes.push(`/product/${slug}.html`);
}

const misc = [
  ["delivery", "Условия доставки алкоголя", "Правила обработки заявок, подтверждение заказа и доставка по Москве и Московской области.", `<div class="prose">${deliveryEditorialHtml()}</div>`],
  ["contacts", "Контакты и способы связи", "Телефон, Telegram, WhatsApp и email для оформления заказа.", `<div class="prose"><p>Телефон: <a href="${telHref}">${phone}</a></p><p>Telegram: <a href="${tg}" target="_blank" rel="noopener noreferrer">${tg}</a></p><p>WhatsApp: <a href="${wa}" target="_blank" rel="noopener noreferrer">${wa}</a></p><p>Email: <a href="mailto:${email}">${email}</a></p></div>`],
  ["policy", "Политика конфиденциальности", "Как обрабатываются персональные данные при оформлении заказа.", `<div class="prose">${policyEditorialHtml()}</div>`],
  ["faq", "Вопросы и ответы", "Ответы на частые вопросы: сроки, подтверждение, возрастные ограничения.", `<h2>Частые вопросы</h2><h3>Можно ли оформить заказ ночью?</h3><p>Да, заявки принимаются круглосуточно.</p><h3>Как передаётся заказ?</h3><p>После отправки формы оператор получает заявку в мессенджер и перезванивает вам для подтверждения.</p><h3>Есть ли возрастное ограничение?</h3><p>Да, обслуживание только для совершеннолетних — 18+.</p><h3>Что делать, если нужно что-то убрать из корзины?</h3><p>Лучше сказать об этом до финального подтверждения — пересчитаем сумму без сюрпризов.</p><div class="prose">${faqExtraHtml()}</div>`]
];

for (const [slug, title, desc, html] of misc) {
  write(`${slug}/index.html`, layout({
    title: `${title} — АлкоДоставка24`,
    description: desc,
    h1: title,
    canonicalPath: `/${slug}/`,
    content: `<section class="section">${html}</section>`,
    schema: `<script>window.__PRODUCTS__=${JSON.stringify(inScopeProducts)};</script>`
  }));
  allRoutes.push(`/${slug}/`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allRoutes.map((r) => `  <url><loc>${domain}${r}</loc></url>`).join("\n")}\n</urlset>\n`;
write("sitemap.xml", sitemap);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\nHost: ${domain}/\n`);

console.log(`Generated ${allRoutes.length} routes`);
