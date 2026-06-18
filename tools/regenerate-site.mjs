import fs from "node:fs";
import path from "node:path";
import {
  extraDistrictPages,
  extraBlogPosts,
  categoryScenarios,
  categoryPairings
} from "./seo-content.mjs";
import { categoryProfile, districtLocal } from "./brand-content.mjs";

const ROOT = process.cwd();
const DOMAIN = "https://alkodostavka24.vercel.app";
const BRAND = "ALKODOSTAVKA";
const BRAND_TAGLINE = "Delivery · Москва и МО";
const BLOG_NAME = "ALKODOSTAVKA Journal";
const PHONE_RAW = "+79997863967";
const PHONE_FORMATTED = "+7 (999) 786-39-67";
const TELEGRAM_LINK = "https://t.me/alkotaxi_bot";

/** Отзывы для trust-блока (без переспама ключей). */
const customerReviews = [
  { name: "Алексей", place: "ЦАО", text: "Заказал виски к ужину — оператор в Telegram ответил за пару минут, курьер приехал в согласованное окно." },
  { name: "Марина", place: "Химки", text: "Удобно, что видно наличие в каталоге. Подобрали замену, когда одной позиции не было — без лишних звонков." },
  { name: "Дмитрий", place: "ЗАО", text: "Оформлял с телефона: корзина, адрес, комментарий к подъезду. Всё прозрачно по цене до подтверждения." },
  { name: "Елена", place: "Мытищи", text: "Брали игристое и вино к празднику — помогли с объёмом на гостей. Доставили вечером, как и договаривались." }
];

/** Подборки напитков на главной. */
const curatedPicks = [
  { title: "К вечеру дома", desc: "Вино, лёгкое пиво, вермут", href: "/vino.html", slug: "vino" },
  { title: "К столу с друзьями", desc: "Виски, ром, закуски", href: "/viski.html", slug: "viski" },
  { title: "Праздник", desc: "Игристое и шампанское", href: "/shampanskoe.html", slug: "shampanskoe" },
  { title: "Подарок", desc: "Коньяк и премиальные позиции", href: "/konyak.html", slug: "konyak" }
];

/** Популярные виски на главной — фиксированный список с SEO alt. */
const homeFeaturedWhisky = [
  {
    id: 30,
    alt: "Jack Daniels доставка алкоголя Москва",
    blurb: "Бурбон 0,7 л — узнаваемый вкус к вечеру или в подарок."
  },
  {
    id: 34,
    alt: "Jameson виски с доставкой на дом",
    blurb: "Ирландский купаж, мягкий профиль — удобный формат 0,7 л."
  },
  {
    id: 23,
    alt: "Ballantine's заказать с доставкой Москва",
    blurb: "Шотландский купаж литром — хватит на компанию за столом."
  },
  {
    id: 36,
    alt: "Johnnie Walker доставка круглосуточно",
    blurb: "Red Label 0,7 л — ровный купаж, который многие берут «на каждый день»."
  },
  {
    id: 33,
    alt: "Виски с доставкой по Москве",
    blurb: "William Lawson's 1,0 л — доступная цена и привычный вкус."
  }
];

const categoryMeta = {
  vermut: { name: "Вермут", type: "вермут", intro: "Аперитивы и классические вермуты — для коктейлей и спокойной подачи к столу." },
  vino: { name: "Вино", type: "вино", intro: "Красное и белое, сухое и полусладкое — подберите бутылку под ужин или вечер с друзьями." },
  viski: { name: "Виски", type: "виски", intro: "Солодовые купажи и моносортовые позиции для домашней подачи и подарка." },
  vodka: { name: "Водка", type: "водка", intro: "Базовые и премиальные водки — универсальный выбор к закускам и для смешивания." },
  dzhin: { name: "Джин", type: "джин", intro: "London Dry и ароматные джины для тоника и классических рецептов." },
  konyak: { name: "Коньяк", type: "коньяк", intro: "Коньяк и бренди разной выдержки — для спокойного формата после еды." },
  liker: { name: "Ликер", type: "ликер", intro: "Сладкие и травяные ликёры — к десерту, в кофе или в коктейлях." },
  pivo: { name: "Пиво", type: "пиво", intro: "Лагеры и эли в удобной упаковке — для компании и непринуждённого формата." },
  rom: { name: "Ром", type: "ром", intro: "Светлый и тёмный ром — для коктейлей и неспешной подачи небольшими порциями." },
  sigarety: { name: "Сигареты и товары", type: "сопутствующие товары", intro: "Табачная продукция и сопутствующие позиции к основному заказу." },
  tekila: { name: "Текила", type: "текила", intro: "Агавовые напитки для шотов и освежающих коктейлей." },
  shampanskoe: { name: "Шампанское", type: "игристое вино", intro: "Игристое и шампанское — для праздника или лёгкого начала вечера." }
};

/** Упрощённое главное меню: категории — через каталог и главную. */
function primaryNav() {
  return `<a href="/catalog.html">Каталог</a><a href="/blog/">Journal</a><a href="/dostavka-alkogolya-moskva.html">Зоны</a><a href="/oplata-i-dostavka.html">Оплата</a><a href="/kontakty.html">Контакты</a>`;
}

function logoHtml() {
  return `<span class="logo-mark" aria-hidden="true">A</span><span class="logo-text"><strong>${BRAND}</strong><span>${BRAND_TAGLINE}</span></span>`;
}

function buildReviewsBlock() {
  const cards = customerReviews
    .map(
      (r) => `<article class="review-card glass-card">
      <p class="review-text">«${escapeHtml(r.text)}»</p>
      <p class="review-meta"><strong>${escapeHtml(r.name)}</strong> · ${escapeHtml(r.place)}</p>
    </article>`
    )
    .join("");
  return `<section class="section-panel reviews-panel">
    ${sectionHead(`Отзывы о ${BRAND}`, "Реальные сценарии заказа — без шаблонных фраз.")}
    <div class="reviews-grid">${cards}</div>
  </section>`;
}

function buildCuratedPicksBlock() {
  const items = curatedPicks
    .map(
      (p) => `<a class="pick-card glass-card" href="${p.href}">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <span class="pick-link">Смотреть →</span>
    </a>`
    )
    .join("");
  return `<section class="section-panel">
    ${sectionHead("Подборки напитков", `Короткие идеи от ${BRAND} — откройте раздел и добавьте в корзину.`)}
    <div class="picks-grid">${items}</div>
  </section>`;
}

function extractVolume(name) {
  const m = /([\d.,]+\s*(?:л|литра|литр))/i.exec(name);
  return m ? m[1] : "—";
}

function productPictureHtml(product, alt, loading = "lazy") {
  const jpg = product.image || `/photo/${product.id}.jpg`;
  const webp = `/photo/${product.id}.webp`;
  const webpFs = path.join(ROOT, "photo", `${product.id}.webp`);
  const altEsc = escapeHtml(alt);
  if (fs.existsSync(webpFs)) {
    return `<picture><source srcset="${webp}" type="image/webp"><img src="${jpg}" alt="${altEsc}" loading="${loading}" decoding="async" width="440" height="330"></picture>`;
  }
  return `<img src="${jpg}" alt="${altEsc}" loading="${loading}" decoding="async" width="440" height="330">`;
}

function buildHomeFeaturedWhiskyBlock(products) {
  const cards = homeFeaturedWhisky
    .map((cfg) => {
      const p = products.find((x) => x.id === cfg.id);
      if (!p || p.inStock === false) return "";
      const href = `/products/product-${p.id}.html`;
      const vol = extractVolume(p.name);
      const stock = p.inStock !== false;
      const img = productPictureHtml(p, cfg.alt, "lazy");
      const actions = stock
        ? `<button type="button" class="btn btn-primary featured-card__btn add-to-cart" data-id="${p.id}">В корзину</button><a class="btn btn-outline featured-card__btn" href="${href}">Подробнее</a>`
        : `<a class="btn btn-outline featured-card__btn" href="${href}">Смотреть</a>`;
      return `<article class="featured-card glass-card">
      <a class="featured-card__media" href="${href}">${img}</a>
      <p class="card-cat">Виски</p>
      <h3 class="featured-card__title"><a href="${href}">${escapeHtml(p.name)}</a></h3>
      <p class="featured-card__desc">${escapeHtml(cfg.blurb)}</p>
      <p class="card-vol">${escapeHtml(vol)}</p>
      <p class="featured-card__price">${p.price} ₽</p>
      <div class="featured-card__actions">${actions}</div>
    </article>`;
    })
    .filter(Boolean)
    .join("");
  if (!cards) return "";
  return `<section class="section-panel featured-products" aria-labelledby="featured-whisky-heading">
    <div class="section-head">
      <h2 id="featured-whisky-heading">Популярные товары</h2>
      <p class="section-lead">Виски, которые чаще всего заказывают — цены и наличие в карточке. <a href="/viski.html">Весь раздел «Виски»</a></p>
    </div>
    <div class="featured-grid">${cards}</div>
  </section>`;
}

function buildHomeSeoAccordion() {
  return `<section class="section-panel seo-accordion-panel">
    <details class="seo-accordion">
      <summary class="seo-accordion__trigger">
        <span class="seo-accordion__label">Подробнее о сервисе</span>
        <span class="seo-accordion__chevron" aria-hidden="true"></span>
      </summary>
      <div class="seo-accordion__body prose-section">
        <h2>О нашем сервисе</h2>
        <p>${BRAND} — это удобная <strong>доставка алкоголя</strong> в Москве: каталог с ценами, корзина на сайте и поддержка в Telegram. Мы не усложняем заказ лишними шагами — адрес, состав и время согласуем с вами до выезда курьера.</p>
        <p>На сайте легко подобрать напитки к ужину, празднику или спокойному вечеру дома. Понятные категории, поиск и мобильная версия помогают оформить заявку за пару минут — с телефона это особенно заметно.</p>

        <h3>Заказать алкоголь на дом</h3>
        <p>Если нужен <strong>алкоголь с доставкой</strong> без долгих звонков, откройте <a href="/catalog.html">каталог</a>, добавьте позиции в корзину или отправьте список в <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a>. Оператор уточнит подъезд, домофон и способ оплаты — см. также <a href="/oplata-i-dostavka.html">оплату и доставку</a>.</p>

        <h3>Доставка алкоголя Москва и область</h3>
        <p>Работаем по городу и ближнему Подмосковью: ЦАО, округа, Химки, Мытищи, Балашиха, Одинцово и другие адреса — подробнее на странице <a href="/dostavka-alkogolya-moskva.html">зон доставки</a>. <strong>Доставка алкоголя на дом</strong> согласуется по времени: вечером и ночью интервал может отличаться от дневного, мы предупредим заранее.</p>

        <h3>Круглосуточная доставка алкоголя</h3>
        <p>Заявки принимаем без выходных. Когда важна <strong>доставка алкоголя круглосуточно</strong>, лучше сразу указать желаемое окно в комментарии и продублировать заказ в мессенджере — так оператор быстрее подтвердит состав. Телефон: <a href="tel:${PHONE_RAW}">${PHONE_FORMATTED}</a>.</p>

        <h3>Виски с доставкой и другие категории</h3>
        <p>В каталоге — вино, водка, игристое, коньяк, ром, ликёры. Для любителей крепкого есть раздел <a href="/viski.html">«Виски»</a>: скотч, бурбон и купажи. <strong>Доставка виски</strong> оформляется так же, как и остальных позиций — цена видна в карточке до подтверждения.</p>

        <h3>Почему нам доверяют</h3>
        <p>Мы делаем сервис прозрачным: актуальные цены, замена при отсутствии позиции, передача только 18+. Если вы ищете «<strong>алкоголь Москва</strong>» с нормальной поддержкой — напишите или позвоните, поможем с выбором марки и объёма без навязчивых формулировок.</p>
      </div>
    </details>
  </section>`;
}

function homeFeaturedItemListJson(products) {
  const items = homeFeaturedWhisky
    .map((cfg, idx) => {
      const p = products.find((x) => x.id === cfg.id);
      if (!p || p.inStock === false) return null;
      return {
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: p.name,
          image: `${DOMAIN}${p.image}`,
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
            url: `${DOMAIN}/products/product-${p.id}.html`
          }
        }
      };
    })
    .filter(Boolean);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Популярные виски",
    itemListElement: items
  };
}

function buildTelegramCtaBlock() {
  return `<section class="tg-cta glass-panel">
    <div class="tg-cta-inner">
      <div class="tg-cta-copy">
        <p class="tg-cta-eyebrow">${BRAND} · поддержка</p>
        <h2>Быстрый заказ в Telegram</h2>
        <p>Отправьте список, адрес и желаемое время — оператор подтвердит состав и ответит в течение нескольких минут.</p>
        <ul class="tg-cta-list">
          <li>Помощь с выбором марки</li>
          <li>Вечерняя доставка по согласованию</li>
          <li>Москва и ближнее Подмосковье</li>
        </ul>
      </div>
      <div class="tg-cta-actions">
        <a class="btn btn-secondary btn-lg" href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Написать в Telegram</a>
        <a class="btn btn-outline btn-lg" href="tel:${PHONE_RAW}">${PHONE_FORMATTED}</a>
      </div>
    </div>
  </section>`;
}

function categoryChipsHtml(limit = 20) {
  return Object.entries(categoryMeta)
    .slice(0, limit)
    .map(([slug, meta]) => `<a class="chip" href="/${slug}.html">${meta.name}</a>`)
    .join("");
}

function footerGridHtml() {
  return `<div class="container footer-grid">
      <div><h3>${BRAND}</h3><p>Сервис доставки напитков по Москве и области. Каталог на сайте, заказ в Telegram и по телефону.</p></div>
      <div><h3>Связь</h3><p><a href="tel:${PHONE_RAW}">${PHONE_FORMATTED}</a><br><a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a></p></div>
      <div><h3>По Москве</h3><p><a href="/dostavka-alkogolya-moskva.html">По городу</a><br><a href="/dostavka-alkogolya-cao.html">ЦАО</a> · <a href="/dostavka-arbat.html">Арбат</a> · <a href="/dostavka-alkogolya-zao.html">ЗАО</a><br><a href="/dostavka-khimki.html">Химки</a> · <a href="/dostavka-mytishchi.html">Мытищи</a> · <a href="/dostavka-balashiha.html">Балашиха</a> · <a href="/dostavka-odintsovo.html">Одинцово</a><br><a href="/blog/">Journal</a></p></div>
      <div><h3>Документы</h3><p><a href="/privacy.html">Политика конфиденциальности</a><br><a href="/terms.html">Условия использования</a><br><a href="/age-restriction.html">Ограничение 18+</a><br><a href="/delivery-policy.html">Политика доставки</a></p></div>
    </div>`;
}

const OG_IMAGE = `${DOMAIN}/photo/1.jpg`;

const STATIC_SEO_FILES = [
  "dostavka-alkogolya-moskva.html",
  "dostavka-alkogolya-24.html",
  "alkogol-na-dom.html",
  "dostavka-alkogolya-mo.html",
  "oplata-i-dostavka.html",
  "kontakty.html"
];
const LEGAL_FILES = ["privacy.html", "terms.html", "age-restriction.html", "delivery-policy.html"];

/** Локальные страницы: округа Москвы, районы и города МО — уникальные тексты без переспама. */
const districtPages = [
  {
    file: "dostavka-alkogolya-cao.html",
    breadcrumb: "ЦАО",
    title: `${BRAND} — ЦАО, центр Москвы`,
    description: "Заказ напитков в Центральный округ: адрес, подъезд, время. Каталог и Telegram, 18+.",
    h1: "Привоз в Центральный округ (ЦАО)",
    intro: "Центр Москвы — плотная застройка, вечерние события и непростая парковка. Закладывайте запас по времени и сразу укажите подъезд, домофон и ориентир для курьера.",
    sections: [
      ["Что написать в заказе", "Улица, дом, подъезд, этаж. Если домофон не работает — отметьте это. Для офисов добавьте проходную и часы работы охраны."],
      ["Вечер и выходные", "По пятницам и перед праздниками маршруты длиннее. Оформите заказ заранее или укажите окно «не раньше / не позже» в комментарии."]
    ],
    faq: [
      ["Чем центр отличается по времени?", "Узкие улицы и парковка вечером могут добавить минуты — оператор назовёт реалистичный интервал после адреса."],
      ["Можно ли встретить у входа в театр?", "Укажите время «к началу» и продублируйте в Telegram — согласуем точку у входа или у парковки."]
    ],
    chips: ["/catalog.html", "/dostavka-alkogolya-moskva.html"]
  },
  {
    file: "dostavka-alkogolya-svao.html",
    breadcrumb: "СВАО",
    title: `${BRAND} — СВАО`,
    description: "Северо-Восточный округ: как заказать, время в пути, срочные заявки. Каталог на сайте, 18+.",
    h1: "Привоз в СВАО",
    intro: "Северо-Восточный округ сочетает спальные кварталы и магистрали у МКАД. Утром и вечером «час пик» может удлинить путь — ориентир по минутам дадим после подтверждения адреса.",
    sections: [
      ["Передача заказа", "Часто удобнее встретить курьера у подъезда или у парковки двора — напишите ориентир. Если навигатор путает новостройку, опишите, что видно у въезда."],
      ["Срочно", "Позвоните и продублируйте состав в Telegram — так оператор быстрее подхватит заявку без лишних уточнений."]
    ],
    faq: [
      ["СВАО — только спальные районы?", "Есть адреса у кольца и развязок; время зависит от улицы и часа."],
      ["Адрес за МКАД в стороне СВАО?", "Если это уже город МО — смотрите страницы Химок, Мытищ или общий раздел по области."]
    ],
    chips: ["/catalog.html", "/kontakty.html"]
  },
  {
    file: "dostavka-alkogolya-yuvao.html",
    breadcrumb: "ЮВАО",
    title: `${BRAND} — ЮВАО`,
    description: "Юго-Восточный округ Москвы: сценарии заказа, ночь, выходные. Оформление онлайн, 18+.",
    h1: "Привоз в ЮВАО",
    intro: "Юго-Восточный округ — от промзон до жилых массивов. Расстояние и пробки на ТТК/МКАД сильнее всего влияют на время; после адреса озвучим прогноз.",
    sections: [
      ["Типичные ситуации", "Вечер у друзей — соберите корзину заранее. После работы — напишите желаемый час первой строкой комментария."],
      ["Праздники", "В праздничные дни спрос выше; не откладывайте на последний час и продублируйте заказ в Telegram."]
    ],
    faq: [
      ["Ночью быстрее?", "После полуночи на дорогах иногда свободнее, но логистика зависит от удалённости — оператор скажет по минутам."],
      ["До квартиры или до подъезда?", "По умолчанию — безопасная выдача у подъезда; другой формат согласуем с оператором."]
    ],
    chips: ["/oplata-i-dostavka.html", "/catalog.html"]
  },
  {
    file: "dostavka-alkogolya-zao.html",
    breadcrumb: "ЗАО",
    title: `${BRAND} — ЗАО`,
    description: "Западный округ Москвы: Раменки, Кунцево, Солнцево. Заказ через каталог и Telegram, 18+.",
    h1: "Привоз в Западный округ (ЗАО)",
    intro: "ЗАО — длинные магистрали и разные по плотности районы. Укажите ближайшее метро или ориентир — так курьеру проще найти адрес с первого заезда.",
    sections: [
      ["Парковка и дворы", "Во дворах бывают шлагбаумы — код или схема проезда лучше сразу в комментарии."],
      ["К новому дому", "Если ЖК недавно сдан, опишите корпус и сторону двора: навигаторы иногда ведут на соседний въезд."]
    ],
    faq: [
      ["Работаете ли к Сколково и деловым кластерам?", "Зависит от точного адреса — напишите улицу и время, ответим по маршруту."],
      ["Можно ли заказать к определённому часу?", "Да, укажите окно в комментарии; оператор подтвердит реалистичность."]
    ],
    chips: ["/catalog.html", "/dostavka-alkogolya-moskva.html"]
  },
  {
    file: "dostavka-alkogolya-sao.html",
    breadcrumb: "САО",
    title: `${BRAND} — САО`,
    description: "Северный округ: Войковский, Беговой, Ховрино. Привоз по согласованию, каталог на сайте, 18+.",
    h1: "Привоз в Северный округ (САО)",
    intro: "Север Москвы — развязки у Ленинградки и Симферопольского шоссе. В часы пик закладывайте запас; точное время согласуем после адреса.",
    sections: [
      ["Ночной заказ", "Заявки принимаем круглосуточно; ночью интервал может отличаться от дневного — это нормально для города."],
      ["Состав заказа", "Соберите корзину на сайте — в карточках видно наличие; список можно продублировать в Telegram."]
    ],
    faq: [
      ["САО и СВАО — в чём разница по времени?", "Зависит от конкретной улицы, а не от аббревиатуры округа — оператор ориентируется по маршруту."],
      ["Есть ли минимальная сумма?", "Уточняйте при подтверждении заказа по телефону или в мессенджере."]
    ],
    chips: ["/catalog.html", "/kontakty.html"]
  },
  {
    file: "dostavka-alkogolya-yuao.html",
    breadcrumb: "ЮАО",
    title: `${BRAND} — ЮАО`,
    description: "Южный округ Москвы: Чертаново, Нагорный, Даниловский. Заказ онлайн, 18+.",
    h1: "Привоз в Южный округ (ЮАО)",
    intro: "ЮАО тянется вдоль южных магистралей. Для адресов у МКАД укажите, с какой стороны кольца удобнее встреча — это экономит время курьера.",
    sections: [
      ["Дом и дача в черте города", "Если объект в границах Москвы — оформляйте как обычный городской заказ с полным адресом."],
      ["Компания", "На несколько человек удобнее сразу разнести позиции по категориям в каталоге — вино, пиво, крепкое — и отправить одной корзиной."]
    ],
    faq: [
      ["ЮАО и ЮВАО — это одно?", "Нет, это разные округа; время считаем от вашего точного адреса."],
      ["Как оплатить?", "Способ согласуем при подтверждении — см. страницу «Оплата и доставка»."]
    ],
    chips: ["/oplata-i-dostavka.html", "/catalog.html"]
  },
  {
    file: "dostavka-arbat.html",
    breadcrumb: "Арбат",
    title: `${BRAND} — Арбат`,
    description: "Заказ напитков в район Арбата: пешеходные зоны, парковка, время встречи. Каталог, 18+.",
    h1: "Привоз на Арбат и в центр",
    intro: "Район Арбата — пешеходные улицы, ограничения для машин и высокий трафик вечером. Укажите точный подъезд, домофон и удобную точку встречи — не всегда получится подъехать к парадной двери.",
    sections: [
      ["Как встретить курьера", "Иногда проще выйти к главному входу или согласовать место у двора с проездом — опишите в комментарии."],
      ["Гости и мероприятия", "Соберите корзину заранее; для вечера в пятницу лучше не откладывать заказ на последний час."]
    ],
    faq: [
      ["Доставляете ли в отели на Арбате?", "Да, если есть понятный адрес и контакт получателя; уточните стойку или номер в комментарии."],
      ["Сколько ждать?", "Зависит от загрузки и парковки — ориентир дадим при подтверждении."]
    ],
    chips: ["/dostavka-alkogolya-cao.html", "/catalog.html"]
  },
  {
    file: "dostavka-khimki.html",
    breadcrumb: "Химки",
    title: `${BRAND} — Химки`,
    description: "Химки и ближние кварталы: уточните адрес у оператора. Каталог, Telegram, 18+.",
    h1: "Привоз в Химки",
    intro: "Химки — крупный город в ближнем Подмосковье с разной удалённостью от МКАД. Напишите улицу, корпус и желаемое время — ответим, доступен ли адрес в текущий день.",
    sections: [
      ["Как ускорить согласование", "Укажите ориентир: шоссе, ЖК, удалённость от МКАД. Продублируйте состав в Telegram."],
      ["Новостройки", "Если дом новый, опишите, как проехать к въезду — навигатор не всегда знает все корпуса."]
    ],
    faq: [
      ["Вся Химки или только у МКАД?", "Зона зависит от маршрута — оператор скажет по вашему адресу."],
      ["Время как в Москве?", "Может отличаться из‑за расстояния; ориентир по минутам — при подтверждении."]
    ],
    chips: ["/dostavka-alkogolya-mo.html", "/catalog.html"]
  },
  {
    file: "dostavka-mytishchi.html",
    breadcrumb: "Мытищи",
    title: `${BRAND} — Мытищи`,
    description: "Мытищи: заказ напитков с уточнением адреса. Каталог на сайте, приём без выходных, 18+.",
    h1: "Привоз в Мытищи",
    intro: "Мытищи — плотная застройка и активные магистрали. Для точного расчёта времени нужен полный адрес с подъездом; в пиковые часы закладывайте запас.",
    sections: [
      ["Частный дом и квартира", "Для домов укажите номер участка или калитку; для квартир — этаж и домофон."],
      ["Праздники", "Перед праздниками лучше оформить заказ заранее — спрос на доставку в МО выше."]
    ],
    faq: [
      ["Можно ли заказать только напитки без Москвы?", "Да, если адрес в зоне — оформляйте с указанием «Мытищи» в адресе."],
      ["Что если адрес не обслуживается?", "Оператор предложит ближайший вариант или попросит уточнить соседний населённый пункт."]
    ],
    chips: ["/dostavka-alkogolya-mo.html", "/kontakty.html"]
  },
  ...extraDistrictPages
];

const DISTRICT_FILES = districtPages.map((d) => d.file);

/** Статьи блога: информационный контент без коммерческого переспама. */
const blogPosts = [
  {
    slug: "kak-vybrat-viski",
    title: "Как выбрать виски для дома",
    description: "С чего начать знакомство с виски: купаж, моносолод, бурбон и скотч — короткий гид без лишней теории.",
    date: "2026-05-10",
    readMin: 5,
    sections: [
      ["С чего начать", "Если пьёте виски редко, возьмите привычный купаж средней цены и объём 0,5–0,7 л. Так проще сравнить вкус с тем, что пробовали в баре."],
      ["Купаж и моносолод", "Купаж — смесь солодов из разных винокурен, вкус обычно ровнее. Моносолод (single malt) выразительнее: больше характера региона и дистиллерии."],
      ["Скотч и бурбон", "Шотландский виски чаще сушёватый и торфяный в профиле. Бурбон — из кукурузы и нового американского дуба, обычно мягче и слаще."],
      ["Подача дома", "Небольшой бокал или пара кубиков льда — дело вкуса. Сильно не согревайте бутылку в руках; к закускам подойдут сыр, орехи, нейтральные снеки."]
    ],
    related: ["viski", "viski"]
  },
  {
    slug: "vidy-shampanskogo",
    title: "Виды шампанского и игристого",
    description: "Брют, экстра-брют, полусухое: чем отличаются подписи на этикетке и что выбрать к столу.",
    date: "2026-05-12",
    readMin: 4,
    sections: [
      ["Не только «шампанское»", "В быту так называют любое игристое, но по-строгому шампанское — только из региона Шампань во Франции. Остальное — игристые вина по технологии."],
      ["Сухость на этикетке", "Brut и Extra Brut — с минимальной сладостью, универсальны к закускам. Demi-sec и полусладкие — мягче, часто к десерту."],
      ["Как подавать", "Охладите бутылку (6–8 °C для большинства игристых), открывайте аккуратно, без встряхивания. Бокалы — узкие и высокие, чтобы пузырьки дольше держались."]
    ],
    related: ["shampanskoe", "vino"]
  },
  {
    slug: "podbor-napitkov-na-meropriyatie",
    title: "Подбор напитков на мероприятие",
    description: "Сколько бутылок на гостей, что взять кроме крепкого и как не ошибиться с объёмом.",
    date: "2026-05-14",
    readMin: 6,
    sections: [
      ["Посчитайте гостей", "На вечеринку из 8–10 человек часто хватает 2–3 бутылок вина, пива по 1–2 на человека и одной крепкой позиции «на стол» — если гости пьют разное."],
      ["Разнообразие лучше запаса", "Лучше два стиля вина (сухое белое + лёгкое красное), чем пять одинаковых бутылок. Добавьте безалкогольное и воду — это снижает риск перебора."],
      ["Заказ заранее", "Оформите корзину за несколько часов до начала и укажите желаемое окно в комментарии. В праздники не откладывайте на последние 30 минут."]
    ],
    related: ["pivo", "vino"]
  },
  {
    slug: "napitki-v-podarok",
    title: "Напитки в подарок: что выбрать",
    description: "Виски, коньяк, игристое — как подобрать бутылку, если не знаете вкус получателя.",
    date: "2026-05-16",
    readMin: 5,
    sections: [
      ["Универсальные варианты", "Узнаваемая марка в классическом 0,7 л — безопаснее экзотики. Для консервативного получателя — спокойный купаж виски или коньяк VS/VSOP."],
      ["Игристое к событию", "Брют подходит к поздравлению без привязки к сладости торта. Красивая этикетка важна, но не заменяет охлаждение и аккуратное вручение."],
      ["Упаковка и доставка", "Закажите с запасом по времени; передайте бутылку вертикально, без тряски. В комментарии можно попросить не звонить заранее — если это сюрприз."]
    ],
    related: ["konyak", "shampanskoe"]
  },
  {
    slug: "burbon-i-skotch",
    title: "Чем бурбон отличается от скотча",
    description: "Сырьё, выдержка и вкус: простое сравнение двух популярных стилей виски.",
    date: "2026-05-18",
    readMin: 4,
    sections: [
      ["География", "Скотч делают в Шотландии, бурбон — в США (часто Кентукки). Это разные законы и традиции, не «лучше/хуже»."],
      ["Сырьё", "Бурбон содержит не менее 51% кукурузы в солодовой смеси — отсюда сладковатый профиль. Скотч — в основном ячменный солод, вкус суше и сложнее."],
      ["Что попробовать первым", "Для мягкого старта — бурбон на льду или в Old Fashioned. Скотч-купаж — ровный вариант «на чистую» небольшими порциями."]
    ],
    related: ["viski", "viski"]
  },
  ...extraBlogPosts
];

/** Уникальные title/description по категориям (без шаблонного «купить с доставкой»). */
const categoryPageMeta = {
  vermut: { title: `Вермут — аперитивы в каталоге | ${BRAND}`, description: "Вермут для коктейлей и аперитива: цены, наличие, корзина. Привоз по Москве и МО, 18+." },
  vino: { title: `Вино — красное и белое в каталоге | ${BRAND}`, description: "Вино к ужину и празднику: сухое, полусладкое, регионы. Заказ онлайн, доставка по городу, 18+." },
  viski: { title: `Виски — купажи и моносолод | ${BRAND}`, description: "Виски для дома и подарка: скотч, бурбон, купажи. Каталог с ценами, заказ в Telegram, 18+." },
  vodka: { title: `Водка — базовые и премиальные марки | ${BRAND}`, description: "Водка в каталоге: объёмы 0,5–1 л, известные бренды. Оформление на сайте, привоз по Москве, 18+." },
  dzhin: { title: `Джин — London Dry и ароматные | ${BRAND}`, description: "Джин для тоника и коктейлей: ассортимент, цены, корзина. Доставка по Москве и области, 18+." },
  konyak: { title: `Коньяк и бренди — выдержка VS–XO | ${BRAND}`, description: "Коньяк к столу и в подарок: VS, VSOP, XO в названии. Заказ онлайн, только 18+." },
  liker: { title: `Ликёры — сладкие и травяные | ${BRAND}`, description: "Ликёры к десерту и в коктейли: каталог, фильтр, корзина. Привоз по Москве, 18+." },
  pivo: { title: `Пиво — лагер и эль в каталоге | ${BRAND}`, description: "Пиво для компании: банки и бутылки, разные стили. Заказ с доставкой по Москве, 18+." },
  rom: { title: `Ром — светлый и тёмный | ${BRAND}`, description: "Ром для коктейлей и спокойной подачи: ассортимент и цены в каталоге. Москва и МО, 18+." },
  sigarety: { title: `Сигареты и сопутствующие товары | ${BRAND}`, description: "Табачные и сопутствующие позиции к заказу напитков. Наличие в карточках, 18+." },
  tekila: { title: `Текила — агавовые напитки | ${BRAND}`, description: "Текила для шотов и коктейлей: объёмы и марки в каталоге. Заказ онлайн, 18+." },
  shampanskoe: { title: `Шампанское и игристое | ${BRAND}`, description: "Игристое к празднику: брют, полусухое, подарочные форматы. Каталог и доставка, 18+." }
};

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function imgPictureTag(src, alt, attrs = "") {
  const altEsc = escapeHtml(alt);
  const diskPath = path.join(ROOT, src.replace(/^\//, ""));
  const webpPath = diskPath.replace(/\.jpe?g$/i, ".webp");
  const baseAttrs = `${attrs} alt="${altEsc}" decoding="async"`.trim();
  if (!fs.existsSync(webpPath)) return `<img src="${src}" ${baseAttrs}>`;
  const webpUrl = src.replace(/\.jpe?g$/i, ".webp");
  return `<picture><source type="image/webp" srcset="${webpUrl}"><img src="${src}" ${baseAttrs}></picture>`;
}

/** Упрощённое извлечение бренда из названия карточки (второе «слово» после типа товара). */
function extractProductBrand(name) {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (w.length < 2) return "";
  let i = 1;
  const stop = /^[\d.,]+$/;
  const parts = [];
  while (i < w.length && parts.length < 2) {
    const t = w[i];
    if (stop.test(t)) break;
    if (/^(л|литра|литр)$/i.test(t)) break;
    parts.push(t);
    i++;
  }
  return parts.join(" ") || w[1] || "";
}

function extractPopularBrands(products, slug, limit = 10) {
  const counts = new Map();
  for (const p of products) {
    if (slug && p.category !== slug) continue;
    const b = extractProductBrand(p.name);
    if (!b || b.length < 2) continue;
    const key = b.toUpperCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k.charAt(0) + k.slice(1).toLowerCase());
}

function sectionHead(title, lead = "") {
  const leadHtml = lead
    ? `<p class="section-lead">${escapeHtml(lead)}</p>`
    : "";
  return `<div class="section-head"><h2>${escapeHtml(title)}</h2>${leadHtml}</div>`;
}

function buildPopularBrandsBlock(products) {
  const brands = extractPopularBrands(products, null, 16);
  if (!brands.length) return "";
  const chips = brands.map((b) => `<span class="brand-chip">${escapeHtml(b)}</span>`).join("");
  return `<section class="section-panel brands-panel">
    ${sectionHead("Популярные бренды", `Марки, которые чаще заказывают в ${BRAND} — актуальное наличие в карточках.`)}
    <div class="brand-row">${chips}</div>
    <p class="section-note"><a href="/catalog.html">Открыть каталог</a> · уточнить наличие в <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a></p>
  </section>`;
}

function guaranteesStrip() {
  return `<section class="guarantees-strip">
    <div class="guarantee-item"><strong>18+</strong><span>Только совершеннолетним</span></div>
    <div class="guarantee-item"><strong>Оригинал</strong><span>Марка на этикетке</span></div>
    <div class="guarantee-item"><strong>Поддержка</strong><span>Telegram и телефон</span></div>
    <div class="guarantee-item"><strong>Прозрачно</strong><span>Цены в карточках</span></div>
  </section>`;
}

function categoryCtaBlock(slug) {
  const p = categoryProfile[slug];
  if (!p?.cta) {
    return `<section class="cat-cta glass-panel"><h2>Заказ в ${BRAND}</h2><p>Добавьте позиции в корзину или напишите в <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a>.</p><a class="btn btn-primary" href="/catalog.html">Каталог</a></section>`;
  }
  return `<section class="cat-cta glass-panel">
    <h2>${escapeHtml(p.cta.title)}</h2>
    <p>${escapeHtml(p.cta.lead)}</p>
    <div class="cat-cta-actions">
      <a class="btn btn-primary" href="/${slug}.html#product-grid">Смотреть наличие</a>
      <a class="btn btn-secondary" href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Спросить в Telegram</a>
    </div>
  </section>`;
}

function relatedCategoriesBlock(slug, categoryMeta) {
  const rel = categoryProfile[slug]?.related || [];
  if (!rel.length) return "";
  const chips = rel
    .map((s) => {
      const m = categoryMeta[s];
      return m ? `<a class="chip" href="/${s}.html">${escapeHtml(m.name)}</a>` : "";
    })
    .filter(Boolean)
    .join("");
  return `<section class="related-cats section-panel"><h2>Похожие разделы</h2><div class="quick-links">${chips}<a class="chip" href="/blog/">${BLOG_NAME}</a></div></section>`;
}

function buildJournalHomeBlock(posts, limit = 4) {
  const cards = posts
    .slice(0, limit)
    .map(
      (p) => `<article class="journal-card glass-card">
      <p class="blog-meta">${escapeHtml(p.date)} · ~${p.readMin} мин</p>
      <h3><a href="/blog/${p.slug}.html">${escapeHtml(p.title)}</a></h3>
      <p>${escapeHtml(p.description)}</p>
      <a class="pick-link" href="/blog/${p.slug}.html">Читать в Journal →</a>
    </article>`
    )
    .join("");
  return `<section class="section-panel journal-home">
    <div class="section-head"><h2>${BLOG_NAME}</h2><p class="section-lead">Гайды от ${BRAND} — без переспама, с пользой.</p></div>
    <div class="journal-grid">${cards}</div>
    <p class="section-note"><a href="/blog/">Все статьи</a></p>
  </section>`;
}

function categoryExtrasBlock(slug) {
  const scen = categoryScenarios[slug];
  const pair = categoryPairings[slug];
  let html = "";
  if (scen) {
    const items = scen.items
      .map(([t, d]) => `<li><strong>${escapeHtml(t)}:</strong> ${escapeHtml(d)}</li>`)
      .join("");
    html += `<section class="cat-scenarios"><h2>${escapeHtml(scen.h2)}</h2><ul class="cat-list">${items}</ul></section>`;
  }
  if (pair?.length) {
    html += `<section class="cat-pairings"><h2>Сочетания</h2><p class="pair-chips">${pair.map((x) => `<span class="chip chip-muted">${escapeHtml(x)}</span>`).join("")}</p></section>`;
  }
  return html;
}

/** Уникальные информационные блоки по категориям (не шаблон). */
const categoryRichSections = {
  vermut: {
    h2: "Вермут: аперитив и база для коктейлей",
    blocks: [
      ["Стили", "Красный вермут — для негрони и манхэттена; белый — легче, чаще в мартини. Смотрите крепость и сладость в описании карточки."],
      ["Подача", "Охладите бутылку; лёд и долька цитруса — простой домашний формат без лишней суеты."],
      ["К столу", "Сыры, оливки, лёгкие закуски — вермут не перебивает вкус, если не наливать слишком крупные порции."]
    ]
  },
  vino: {
    h2: "Как выбрать вино",
    blocks: [
      ["Цвет и сладость", "Красное — к мясу и сырам; белое — к рыбе и салатам. Сухое универсальнее; полусладкое — если гости не любят кислотность."],
      ["Температура", "Белое — прохладнее (10–12 °C), красное — комнатная прохлада, не «с печки». После доставки дайте бутылке постоять."],
      ["Сочетания", "Лёгкое сухое — к пасте; насыщенное красное — к стейку. Если сомневаетесь, возьмите знакомый регион из названия."]
    ]
  },
  viski: {
    h2: "Виски: скотч, бурбон, купаж",
    blocks: [
      ["Стили", "Шотландский купаж — ровный вкус; бурбон — слаще и мягче; моносолод — выразительнее, для ценителей."],
      ["Крепость", "Обычно 40–43°; смотрите объём в названии — 0,7 л для компании, 0,5 л для пробы."],
      ["Подача", "Небольшой бокал или со льдом; к закускам — сыр, орехи, нейтральные снеки без острого соуса."]
    ]
  },
  vodka: {
    h2: "Водка: базовые и премиальные позиции",
    blocks: [
      ["Выбор", "Нейтральный профиль — к столу и закускам; премиальные марки — если важен бренд на подарок."],
      ["Объём", "0,5 л на двоих-троих; 0,7–1 л на компанию. Литраж всегда в названии карточки."],
      ["Смешивание", "Для коктейлей берите классический вариант без яркой ароматики — так проще балансировать с соком и тоником."]
    ]
  },
  dzhin: {
    h2: "Джин и домашний бар",
    blocks: [
      ["Профиль", "London Dry — сухой, для тоника; ароматные джины — с цитрусом или травами, для авторских миксов."],
      ["Набор к заказу", "Тоник, лёд, лайм — база джин-тоника; можно добавить воду без газа отдельной позицией в корзине."],
      ["Подача", "Охлаждённый бокал; не заливайте льдом до краёв — аромат теряется."]
    ]
  },
  konyak: {
    h2: "Коньяк: выдержка и подача",
    blocks: [
      ["Маркировка", "VS — моложе по выдержке; VSOP и XO — глубже вкус. Для подарка смотрят на узнаваемую марку и упаковку."],
      ["Когда пить", "После основных блюд, небольшими порциями; широкий бокал помогает раскрыть аромат."],
      ["Подарок", "Классический 0,7 л; если не уверены в вкусе получателя — средняя ценовая категория без экстремальной крепости."]
    ]
  },
  liker: {
    h2: "Ликёры: сладость и сценарии",
    blocks: [
      ["Типы", "Сливочные — к кофе и десерту; травяные — в коктейли; фруктовые — как дижестив небольшими порциями."],
      ["Дозировка", "Сахар и аромат сильные — лучше меньше, чем перелить; в смеси с колой или соком добавляйте постепенно."],
      ["Хранение", "После вскрытия — прохладное место; срок на бутылке смотрите на этикетке в карточке товара."]
    ]
  },
  pivo: {
    h2: "Пиво: лагер, эль, форматы",
    blocks: [
      ["Стили", "Лагер — ровный и питкий; эль и IPA — ярче по хмелю; смотрите описание на карточке."],
      ["Упаковка", "Банки удобны на пикник; бутылки — если нужен «барный» формат дома."],
      ["К компании", "Считайте 1–2 единицы на человека плюс вода без газа; охладите перед подачей."]
    ]
  },
  rom: {
    h2: "Ром: светлый и тёмный",
    blocks: [
      ["Разница", "Светлый — для мохито и дайкири; тёмный — с карамельными нотами, чаще пьют медленно."],
      ["Коктейли", "Кола, сок, сироп — ром прощает простые рецепты; крепость проверяйте в названии."],
      ["Подача", "Небольшие порции; со льдом — если любите разбавление, без — если важен чистый профиль."]
    ]
  },
  sigarety: {
    h2: "Сопутствующие товары к заказу",
    blocks: [
      ["Наличие", "Статус в карточке обновляется по складу — если позиции нет, выберите аналог или спросите в Telegram."],
      ["Оформление", "Можно добавить к корзине с напитками одним заказом — укажите домофон и этаж в комментарии."],
      ["Возраст", "Табачная продукция — только совершеннолетним; документ могут попросить при передаче."]
    ]
  },
  tekila: {
    h2: "Текила: шоты и коктейли",
    blocks: [
      ["Классификация", "Blanco — ярче; reposado и añejo — мягче за счёт выдержки. Смотрите подпись на бутылке в каталоге."],
      ["С чем пить", "Соль и лайм — классика; в коктейлях — сок и газировка, без перебора с сахаром."],
      ["Ответственность", "Крепкий напиток — небольшие порции; не смешивайте слишком много разных крепких в один вечер."]
    ]
  },
  shampanskoe: {
    h2: "Игристое и шампанское",
    blocks: [
      ["Сладость", "Брют — к закускам; полусухое и полусладкое — если гости любят мягче; к торту — не всегда нужно самое сладкое."],
      ["Охлаждение", "6–8 °C для большинства игристых; не встряхивайте бутылку до подачи."],
      ["Праздник", "Закажите заранее и укажите окно времени — в праздничные дни маршруты плотнее."]
    ]
  }
};

function categoryRichBlock(slug, meta, products) {
  const profile = categoryRichSections[slug];
  if (!profile) return "";
  const brands = extractPopularBrands(products, slug, 10);
  const brandsP =
    brands.length > 0
      ? `<p class="cat-brands">Часто выбирают: ${escapeHtml(brands.slice(0, 7).join(", "))}${brands.length > 7 ? " и другие" : ""} — по факту наличия.</p>`
      : "";
  const list = profile.blocks
    .map(([h3, text]) => `<h3>${escapeHtml(h3)}</h3><p>${escapeHtml(text)}</p>`)
    .join("");
  return `<section class="seo-text cat-rich"><h2>${escapeHtml(profile.h2)}</h2>${list}${brandsP}</section>`;
}

function extractProducts() {
  const sourcePath = path.join(ROOT, "products.js");
  const src = fs.readFileSync(sourcePath, "utf8");
  const m = src.match(/const\s+products\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error("Не удалось извлечь products из products.js");
  const arr = Function(`"use strict"; return (${m[1]});`)();
  return arr;
}

function ensureDirs() {
  ["assets", "assets/css", "assets/js", "pages", "products", "api", "blog"].forEach((dir) => {
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
  });
}

function buildDistrictLocalBlock(file) {
  const loc = districtLocal[file];
  if (!loc) return "";
  const popular = loc.popular.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
  return `<section class="district-local glass-panel">
    <h2>Зона ${BRAND}</h2>
    <p><strong>Ориентир по времени:</strong> ${escapeHtml(loc.eta)}</p>
    <p><strong>Улицы и кварталы:</strong> ${escapeHtml(loc.areas)}</p>
    <h3>Популярные заказы</h3>
    <ul class="cat-list">${popular}</ul>
    <p class="district-tip"><strong>Совет:</strong> ${escapeHtml(loc.tip)}</p>
  </section>`;
}

function districtPageContent(d) {
  const sectionsHtml = d.sections
    .map(([h2, p]) => `<h2>${escapeHtml(h2)}</h2><p>${escapeHtml(p)}</p>`)
    .join("");
  const faqHtml = d.faq
    .map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`)
    .join("");
  const chipsHtml = d.chips
    .map((href) => {
      const label =
        href === "/catalog.html"
          ? "Каталог"
          : href === "/kontakty.html"
            ? "Связь"
          : href === "/oplata-i-dostavka.html"
            ? "Условия"
          : href.includes("moskva")
            ? "Вся Москва"
          : href.includes("mo")
            ? "Подмосковье"
          : "Подробнее";
      return `<a class="chip" href="${href}">${label}</a>`;
    })
    .join(" ");
  const localBlock = buildDistrictLocalBlock(d.file);
  return `<nav class="breadcrumbs"><a href="/">Главная</a> / <a href="/dostavka-alkogolya-moskva.html">Зоны</a> / <span>${escapeHtml(d.breadcrumb)}</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">${escapeHtml(d.h1)}</h1>
      <p>${escapeHtml(d.intro)}</p>
      ${localBlock}
      ${sectionsHtml}
      <p class="quick-links">${chipsHtml}</p>
    </article>
    <section class="cat-cta glass-panel district-cta">
      <h2>${BRAND} · ${escapeHtml(d.breadcrumb)}</h2>
      <p>Каталог с ценами или список в Telegram — время согласуем после полного адреса.</p>
      <div class="cat-cta-actions">
        <a class="btn btn-primary" href="/catalog.html">Каталог</a>
        <a class="btn btn-secondary" href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a>
      </div>
    </section>
    <section class="faq"><h2>Вопросы · ${escapeHtml(d.breadcrumb)}</h2>${faqHtml}</section>`;
}

function writeDistrictPages() {
  districtPages.forEach((d) => {
    const url = `${DOMAIN}/${d.file}`;
    fs.writeFileSync(
      path.join(ROOT, d.file),
      pageTemplate({
        title: d.title,
        description: d.description,
        canonical: url,
        content: districtPageContent(d),
        jsonLd: baseJsonLd([
          breadcrumbJson([
            { name: "Главная", url: `${DOMAIN}/` },
            { name: "Зоны", url: `${DOMAIN}/dostavka-alkogolya-moskva.html` },
            { name: d.breadcrumb, url }
          ]),
          ...(d.faq.length ? [faqPageFromPairs(d.faq)] : [])
        ]),
        pageType: "static"
      })
    );
  });
}

function blogRelatedArticlesBlock(currentSlug, posts, limit = 3) {
  const others = posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
  if (!others.length) return "";
  const cards = others
    .map(
      (p) => `<article class="journal-card glass-card journal-card--compact">
      <h3><a href="/blog/${p.slug}.html">${escapeHtml(p.title)}</a></h3>
      <p>${escapeHtml(p.description)}</p>
    </article>`
    )
    .join("");
  return `<section class="related-cats section-panel"><h2>Ещё в Journal</h2><div class="journal-grid journal-grid--related">${cards}</div></section>`;
}

function blogArticleContent(post, allPosts = blogPosts) {
  const body = post.sections.map(([h2, p]) => `<h2>${escapeHtml(h2)}</h2><p>${escapeHtml(p)}</p>`).join("");
  const rel = [...new Set(post.related || [])]
    .map((slug) => {
      const m = categoryMeta[slug];
      return m ? `<a class="chip" href="/${slug}.html">${escapeHtml(m.name)}</a>` : "";
    })
    .filter(Boolean)
    .join(" ");
  const relatedArticles = blogRelatedArticlesBlock(post.slug, allPosts);
  return `<nav class="breadcrumbs"><a href="/">Главная</a> / <a href="/blog/">${BLOG_NAME}</a> / <span>${escapeHtml(post.title)}</span></nav>
    <article class="extra prose-section blog-article">
      <p class="blog-meta">${escapeHtml(post.date)} · ~${post.readMin} мин чтения</p>
      <h1 class="page-h1">${escapeHtml(post.title)}</h1>
      ${body}
      <h2>Оформить заказ в ${BRAND}</h2>
      <p>Выберите напитки в <a href="/catalog.html">каталоге</a> или напишите в <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a> — оператор подтвердит наличие и время. ${PHONE_FORMATTED}.</p>
      ${rel ? `<section class="blog-related"><h3>Разделы каталога</h3><div class="quick-links">${rel}</div></section>` : ""}
    </article>
    ${relatedArticles}
    ${buildTelegramCtaBlock()}`;
}

function writeBlogPages() {
  const listHtml = blogPosts
    .map(
      (p) => `<article class="blog-card">
      <p class="blog-meta">${escapeHtml(p.date)} · ~${p.readMin} мин</p>
      <h2><a href="/blog/${p.slug}.html">${escapeHtml(p.title)}</a></h2>
      <p>${escapeHtml(p.description)}</p>
      <a class="chip" href="/blog/${p.slug}.html">Читать</a>
    </article>`
    )
    .join("");
  const indexContent = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>${BLOG_NAME}</span></nav>
    <h1 class="page-h1">${BLOG_NAME}</h1>
    <p class="section-lead" style="margin:-8px 0 20px">Экспертные гайды от ${BRAND}: как выбрать напиток, что заказать к столу или в подарок — без переспама и шаблонов.</p>
    <div class="blog-list">${listHtml}</div>
    <p style="margin-top:20px"><a class="chip" href="/catalog.html">Перейти в каталог</a></p>`;

  fs.writeFileSync(
    path.join(ROOT, "blog", "index.html"),
    pageTemplate({
      title: `${BLOG_NAME} | ${BRAND}`,
      description: "Гайды по виски, игристому, подбору на праздник и подарок. Полезные статьи от ALKODOSTAVKA.",
      canonical: `${DOMAIN}/blog/`,
      content: indexContent,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: BLOG_NAME, url: `${DOMAIN}/blog/` }
        ])
      ]),
      pageType: "static"
    })
  );

  blogPosts.forEach((post) => {
    const url = `${DOMAIN}/blog/${post.slug}.html`;
    fs.writeFileSync(
      path.join(ROOT, "blog", `${post.slug}.html`),
      pageTemplate({
        title: `${post.title} | ${BLOG_NAME}`,
        description: post.description,
        canonical: url,
        content: blogArticleContent(post),
        jsonLd: baseJsonLd([
          breadcrumbJson([
            { name: "Главная", url: `${DOMAIN}/` },
            { name: BLOG_NAME, url: `${DOMAIN}/blog/` },
            { name: post.title, url }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { "@type": "Organization", name: BRAND },
            publisher: { "@type": "Organization", name: BRAND },
            mainEntityOfPage: url
          }
        ]),
        pageType: "static"
      })
    );
  });
}

function legalBlock() {
  return `<div class="legal-banner"><p><strong>18+</strong> Чрезмерное употребление алкоголя вредит здоровью. Заказы принимаются только от совершеннолетних пользователей. При получении может потребоваться подтверждение возраста.</p></div>`;
}

function baseJsonLd(extra = []) {
  const base = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND,
      url: `${DOMAIN}/`
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND,
      description: "Заказ напитков по Москве и области: каталог на сайте, корзина, подтверждение по телефону или в Telegram.",
      url: `${DOMAIN}/`,
      telephone: PHONE_RAW,
      sameAs: [TELEGRAM_LINK]
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${DOMAIN}/#localbusiness`,
      name: BRAND,
      description: "Приём заказов на доставку напитков по Москве и ближайшему Подмосковью. Связь по телефону и в Telegram.",
      telephone: PHONE_RAW,
      image: OG_IMAGE,
      priceRange: "₽₽",
      address: { "@type": "PostalAddress", addressLocality: "Москва", addressRegion: "Москва", addressCountry: "RU" },
      areaServed: [{ "@type": "City", name: "Москва" }, { "@type": "AdministrativeArea", name: "Московская область" }],
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      },
      url: `${DOMAIN}/`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: String(customerReviews.length),
        bestRating: "5"
      }
    }
  ];
  return [...base, ...extra];
}

function pageTemplate({
  title,
  description,
  canonical,
  content,
  jsonLd,
  bodyClass = "",
  pageType = "",
  pageCategory = "",
  pageProduct = "",
  robots = ""
}) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : ""}
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="${BRAND}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${OG_IMAGE}">
  <meta name="theme-color" content="#0a0e18">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="${bodyClass}" data-page="${pageType}" data-category="${pageCategory}" data-product="${pageProduct}">
  <header class="header">
    <div class="container header-inner">
      <a href="/" class="logo">${logoHtml()}</a>
      <nav class="desktop-nav">${primaryNav()}</nav>
      <div class="header-aside">
        <a href="tel:${PHONE_RAW}" class="header-tel">${PHONE_FORMATTED}</a>
        <a href="tel:${PHONE_RAW}" class="header-call-btn" aria-label="Позвонить" title="Позвонить">
          <svg class="header-call-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
        <button class="menu-btn" type="button" aria-label="Открыть меню">Меню</button>
      </div>
    </div>
    <nav class="mobile-nav">${primaryNav()}</nav>
  </header>
  <main class="container">
    ${content}
  </main>
  <footer class="footer">
    ${footerGridHtml()}
    ${legalBlock()}
  </footer>
  <div class="desktop-floats" aria-hidden="false">
  <a href="tel:${PHONE_RAW}" class="floating-call" aria-label="Позвонить">Позвонить</a>
  <a href="${TELEGRAM_LINK}" class="floating-tg" target="_blank" rel="noopener">Telegram</a>
  <button class="floating-cart js-cart-open" type="button">Корзина <span class="cart-badge">0</span></button>
  </div>
  <nav class="sticky-cta" aria-label="Быстрые действия">
    <a href="tel:${PHONE_RAW}" class="sticky-cta__btn sticky-cta__call"><span class="sticky-cta__label">Звонок</span></a>
    <a href="${TELEGRAM_LINK}" class="sticky-cta__btn sticky-cta__tg" target="_blank" rel="noopener"><span class="sticky-cta__label">Telegram</span></a>
    <button type="button" class="sticky-cta__btn sticky-cta__cart js-cart-open"><span class="sticky-cta__label">Корзина</span> <span class="cart-badge">0</span></button>
  </nav>
  <section class="cart-drawer" id="cart-drawer" aria-hidden="true">
    <div class="cart-head"><h2>Корзина</h2><button type="button" class="js-cart-close">×</button></div>
    <div id="cart-items"></div>
    <div id="cart-total" class="cart-total-line">Итого: 0 ₽</div>
    <p class="cart-hint">Можно уточнить заказ в Telegram — оператор подтвердит состав и время.</p>
    <a class="cart-tg-link" href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Открыть Telegram</a>
    <form id="checkout-form" class="checkout">
      <input required name="name" placeholder="Имя" autocomplete="name">
      <input required name="phone" placeholder="Телефон" autocomplete="tel">
      <input required name="address" placeholder="Адрес доставки" autocomplete="street-address">
      <textarea name="comment" placeholder="Комментарий (подъезд, домофон)"></textarea>
      <button type="submit">Отправить заказ</button>
    </form>
  </section>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script defer src="/assets/js/products.js"></script>
  <script defer src="/assets/js/cart.js"></script>
  <script defer src="/assets/js/main.js"></script>
</body>
</html>`;
}

/** Пары вопрос–ответ для FAQ категории (и schema.org). */
function getCategoryFaqPairs(slug) {
  const faq = {
    vermut: [
      ["Чем вермут отличается от вина в заказе?", "Вермут — ароматизированный винный напиток со специями и травами; по подаче чаще охлаждают и смешивают с тоником или соком."],
      ["Как быстро собрать корзину в разделе?", "Введите часть названия в поиске строки выше списка, отсортируйте по цене и добавьте позицию в корзину."]
    ],
    vino: [
      ["Как понять сухое или сладкое вино по карточке?", "Ориентируйтесь на подпись в названии (сухое, полусухое, полусладкое) и стиль региона — это быстрее, чем гадать по фото."],
      ["Какая температура подачи?", "Белое — прохладнее (10–12 °C), красное — без перегрева; после доставки дайте бутылке постоять."],
      ["К чему подобрать красное и белое?", "Красное — к мясу и сырам; белое — к рыбе и салатам. Если сомневаетесь — возьмите знакомый регион из названия."],
      ["Можно ли заказать несколько бутылок разных марок?", "Да: добавляйте позиции по одной, количество меняется в корзине перед отправкой заявки."]
    ],
    viski: [
      ["С чего начать, если виски покупаю редко?", "Возьмите привычный купаж средней цены и объём 0,5–0,7 л — так проще сравнить с тем, что пробовали раньше."],
      ["Нужен ли лёд домой?", "Если пьёте со льдом, уточните в комментарии — курьер не возит лёд отдельно, но вы заранее подготовите форму."],
      ["Что делать, если бутылки нет в наличии?", "Отфильтруйте категорию по цене и возьмите соседнюю позицию или напишите — предложим близкий профиль."],
      ["Можно ли заказать к праздничному столу заранее?", "Да: соберите корзину и укажите желаемое окно в комментарии или продублируйте в Telegram."]
    ],
    vodka: [
      ["Как не ошибиться с объёмом?", "Смотрите литраж в названии: для компании часто берут 1 л, для спокойного вечера — 0,5 л."],
      ["Что заказать вместе с водкой на ночь?", "Воду без газа и закуску добавьте отдельными позициями — одним заказом удобнее получить всё разом."],
      ["Подходит ли водка только для коктейлей?", "Можно и чистой небольшими порциями; для смешивания берите нейтральный профиль по описанию на карточке."],
      ["Как ускорить ночной заказ?", "Сформируйте корзину на сайте и отправьте адрес в Telegram — оператор быстрее подхватит состав."]
    ],
    dzhin: [
      ["Что заказать вместе с джином для дома?", "Тоник и лёд — базовый набор; лайм или огурцы можно указать в комментарии к адресу, если нужно передать курьеру."],
      ["Подойдёт ли джин только для коктейлей?", "Можно и чистым небольшими порциями; смотрите крепость и стиль на карточке товара."]
    ],
    konyak: [
      ["Чем отличаются позиции по выдержке в названии?", "Чаще дольше выдержка — глубже тело и послевкусие; для знакомства можно начать со средней ступени."],
      ["Как подать дома без специальных бокалов?", "Подойдёт невысокий широкий бокал или маленькая рюмка — главное не греть бутылку в ладонях."],
      ["Можно ли заказать к подарку?", "Выберите узнаваемую марку и проверьте объём на карточке; к открытке это отношения не имеет — стиль подарка решайте сами."],
      ["Что указать для доставки в офис?", "Время после работы и проходную — иногда нужен пропуск; это лучше написать сразу в комментарии."]
    ],
    liker: [
      ["Ликёр сладкий — как понять по описанию?", "Ориентируйтесь на стиль (сливочный, травяной, кофейный) и смотрите объём бутылки в названии карточки."],
      ["Можно ли смешивать ликёр с другими напитками?", "Да, но добавляйте постепенно: ликёры дают сахар и аромат, это меняет баланс коктейля."]
    ],
    pivo: [
      ["Как понять, горькое будет или нет?", "По стилю в названию: лагер обычно ровнее, IPA и эль — выраженнее хмель."],
      ["Сколько заказать на компанию из 4 человек?", "Ориентируйтесь на 1–2 банки на человека и добавьте безалкогольное, если кто-то за рулём или не пьёт."],
      ["Можно ли заказать разные марки в одной корзине?", "Да — добавляйте позиции по одной; корзина покажет сумму до отправки."],
      ["Что на новый год или большую компанию?", "Смешайте лагер и что-то более ароматное — так проще угодить разным вкусам."]
    ],
    rom: [
      ["Чем светлый ром отличается от тёмного в практическом заказе?", "Светлый чаще уходит в коктейли, тёмный — с насыщенной сладостью; смотрите подпись на карточке."],
      ["Можно ли заказать ром не на вечеринку, а «на потом»?", "Да, но храните как обычную крепкую продукцию и соблюдайте меру при употреблении."]
    ],
    sigarety: [
      ["Как понять, что позиция актуальна?", "В карточке указано наличие — если статус «нет», выберите другую строку или спросите оператора."],
      ["Можно ли заказать только табачную позицию без алкоголя?", "Если карточка доступна и есть кнопка «В корзину», да — оформление такое же."],
      ["Что написать курьеру про домофон?", "Код и этаж — в комментарии к адресу; так меньше уточняющих звонков."],
      ["Есть ли ограничения по возрасту?", "Табачная продукция — только совершеннолетним; документ могут попросить при передаче."]
    ],
    tekila: [
      ["Текила крепкая — как планировать порции?", "Начните с малого объёма и пейте ответственно; для компании удобнее набор маленьких форматов из каталога."],
      ["Что указать в комментарии к заказу?", "Подъезд, домофон и пожелания по времени — это ускорит передачу без лишних звонков."]
    ],
    shampanskoe: [
      ["Брют или полусладкое — что заказать?", "К солёным закускам чаще брют или сухое; к десерту — смотрите подпись «полусладкое» в названии."],
      ["Как не испортить игристое после доставки?", "Дайте бутылке остыть в холодильнике; открывайте аккуратно, без тряски."],
      ["Заказ к дате или событию — как успеть?", "Оформите заранее и укажите окно времени в комментарии — так проще попасть в ваш сценарий."],
      ["Можно ли заказать несколько бутылок разных марок?", "Да, корзина суммирует позиции; проверьте объём и охлаждение перед подачей."]
    ]
  };
  const pair = faq[slug] || faq.vodka;
  return [
    ...pair,
    ["Сколько ждать курьера?", "Зависит от района и загрузки — ориентир по минутам даст оператор при подтверждении."],
    ["Как оплатить заказ?", "Способ согласуем при подтверждении; подробности — на странице «Оплата и доставка»."],
    ["Как подтвердить заказ после корзины?", "Заполните форму внизу экрана или напишите в Telegram — оператор свяжется и уточнит детали."]
  ];
}

function categoryFaqBlock(slug, meta) {
  const faqTitle = categoryProfile[slug]?.faqTitle || `Вопросы · ${meta.name}`;
  const body = getCategoryFaqPairs(slug)
    .map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`)
    .join("");
  return `<section class="faq"><h2>${escapeHtml(faqTitle)}</h2>${body}</section>`;
}

function categorySeoText(slug, products) {
  const meta = categoryMeta[slug];
  return `${categoryRichBlock(slug, meta, products)}
  ${categoryExtrasBlock(slug)}
  ${categoryCtaBlock(slug)}
  ${relatedCategoriesBlock(slug, categoryMeta)}
  <section class="seo-text cat-order"><h2>Заказ в ${BRAND}</h2>
  <p>Корзина на сайте или список в <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Telegram</a> — оператор подтвердит наличие и время. 18+, документ при выдаче. <a href="tel:${PHONE_RAW}">${PHONE_FORMATTED}</a>.</p></section>
  ${categoryFaqBlock(slug, meta)}
  ${guaranteesStrip()}`;
}

function categoryVoice(category) {
  const voices = {
    vermut: "Вермут чаще подают охлажденным: как аперитив до еды или в классических миксах с тоником и цитрусом. По вкусу это ароматный винный напиток со специями и травами, поэтому он хорошо «собирает» закуски и не перебивает легкие блюда.",
    vino: "Вино в этой позиции подходит для спокойного ужина и неспешной подачи: важны температура бокала и сочетание с едой. Если в названии указан сорт или регион, ориентируйтесь на них как на основной стиль — сухое, полусухое или полусладкое.",
    viski: "Виски — крепкий солодовый спиртной напиток с выраженным характером: его часто подают нейтральным бокалом или со льдом, а в коктейлях он дает глубину и «тепло». Для домашней подачи удобнее начать с маленького глотка и оценить интенсивность по своему вкусу.",
    vodka: "Водка — нейтральная крепкая база: ее ценят за чистоту профиля и универсальность к закускам. Подача обычно охлажденной порцией небольшими рюмками; в коктейлях напиток работает как «каркас» без лишней сладости.",
    dzhin: "Джин строится вокруг можжевельника и травяного букета, поэтому классически уместен джин-тоник и другие освежающие сочетания. Для дома удобно держать лед и тоник — так раскрывается аромат без перегруза.",
    konyak: "Коньяк — виноградный дистиллят с выдержкой и насыщенной ароматикой: его подают небольшими порциями как дижестив после еды или к «тихому» формату общения. По подаче чаще выбирают широкий бокал, чтобы аромат раскрылся спокойнее.",
    liker: "Ликер — ароматный сладкий напиток: уместен как завершение вечера, к десерту или в коктейлях, где нужна текстура и сахар. Объем в названии помогает понять формат бутылки и «силу» сладости на порцию.",
    pivo: "Пиво — легкий крепости напиток с ячменной основой: удобен для компании, к закускам и в неформальном формате. По названию можно ориентироваться на стиль (лагер, эль и т.п.) и объем упаковки.",
    rom: "Ром получают из сахарного сырья, поэтому в профиле часто ощущается «теплая» сладость и согревающий характер. Подают нейтральным бокалом или в коктейлях; крепость обычно выше, чем у пива, поэтому порции лучше небольшие.",
    sigarety: "В этой категории могут быть табачные изделия и сопутствующие товары (напитки безалкогольные, вода, аксессуары). Если позиция не относится к алкоголю, описание ориентируется на бытовой сценарий использования и удобство заказа вместе с основной корзиной.",
    tekila: "Текила производится из агавы и относится к крепким мексиканским спиртным напиткам: чаще подают шотами или в коктейлях с цитрусом и солью на кромке. Для дома важно не перегреть напиток и пить ответственно небольшими порциями.",
    shampanskoe: "Игристое и шампанское ассоциируются с праздничной подачей и легким стартом вечера: хорошо работают охлажденными, с фруктами и легкими закусками. По стилю ориентируйтесь на подпись в названии — брют, полусухое или сладкое."
  };
  return voices[category] || "Напиток из каталога подходит для разных домашних сценариев: от спокойного вечера до праздничного стола. Выбирайте объем и крепость под формат компании и подачу.";
}

function productDescription(product) {
  const meta = categoryMeta[product.category] || { name: "Категория", type: "товар" };
  const volume = /(\d+[.,]?\d*)\s*(л|литра|литр)/i.exec(product.name)?.[0] ?? "см. название";
  const voice = categoryVoice(product.category);
  const stockLine =
    product.inStock === false
      ? "Сейчас позиция недоступна — посмотрите аналог в категории или спросите у оператора о поступлении."
      : "Добавьте в корзину и укажите адрес: заявку обработаем и согласуем время.";
  return `«${product.name}» — ${meta.type}, раздел «${meta.name}». ${product.price} ₽, объём: ${volume}. ${voice} ${stockLine} Оформление в корзине на сайте или в Telegram. 18+, при передаче могут попросить документ.`;
}

function writeAssets(products) {
  const css = `:root{--bg:#070b14;--bg2:#0e1424;--card:rgba(22,30,48,.85);--text:#f4f5f8;--muted:#9aa7c5;--gold:#d4af6a;--gold-dim:#9a7d45;--accent:#1a2844;--glass:rgba(18,26,42,.72);--glass-border:rgba(255,255,255,.08)}
*{box-sizing:border-box}body{margin:0;font-family:"DM Sans",Segoe UI,Arial,sans-serif;background:radial-gradient(1200px 600px at 10% -10%,#1a2540 0%,transparent 55%),radial-gradient(900px 500px at 100% 0%,#152238 0%,transparent 50%),linear-gradient(180deg,var(--bg),#050810 50%,#0a101c);color:var(--text);line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:var(--gold);text-decoration:none}.container{width:min(1180px,94%);margin:0 auto}
.header{position:sticky;top:0;background:rgba(7,11,20,.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--glass-border);z-index:50}
.header-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:nowrap;gap:8px;padding:12px 0}
.logo{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:#fff}
.logo-mark{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;background:linear-gradient(145deg,var(--gold),var(--gold-dim));color:#1a1508;font-weight:800;font-size:1.1rem;letter-spacing:-.02em;box-shadow:0 4px 20px rgba(212,175,106,.25)}
.logo-text{display:flex;flex-direction:column;line-height:1.15}
.logo-text strong{font-size:.95rem;font-weight:700;letter-spacing:.06em}
.logo-text span{font-size:.65rem;color:var(--muted);font-weight:500;letter-spacing:.02em}
.header-aside{display:flex;align-items:center;gap:10px;margin-left:auto}
.header-tel{color:#e8edf7;font-weight:700;font-size:.92rem;white-space:nowrap}
.header-call-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:linear-gradient(145deg,#2a6b4a,#1d4a33);color:#fff;border:1px solid #3d8f62;box-shadow:0 4px 14px rgba(0,0,0,.35);transition:transform .15s ease,filter .15s}
.header-call-btn:hover{filter:brightness(1.08);transform:scale(1.04)}
.header-call-icon{display:block}
.desktop-nav{display:none;gap:14px;flex-wrap:wrap;align-items:center;flex:1;justify-content:center;min-width:0;font-size:.92rem;font-weight:600}
.menu-btn{border:1px solid var(--gold);background:transparent;color:var(--gold);padding:8px 12px;border-radius:10px;font-size:.88rem;font-weight:600}
.mobile-nav{display:none;gap:10px;flex-wrap:wrap;padding:0 0 14px}.mobile-nav.open{display:flex}
.page-h1,.product-h1{font-size:clamp(1.45rem,4vw,2.35rem);margin:12px 0 18px;line-height:1.2}
.hero{padding:22px;background:var(--glass);border:1px solid var(--glass-border);border-radius:20px;backdrop-filter:blur(12px)}
.hero-home{padding:clamp(24px,5vw,40px)}
.hero-premium{position:relative;overflow:hidden}
.hero-premium::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 70% 0%,rgba(212,175,106,.12),transparent 60%);pointer-events:none}
.hero-note{margin:16px 0 0;font-size:.88rem;color:var(--muted)}
.hero-note a{color:var(--gold)}
.glass-panel{background:var(--glass);border:1px solid var(--glass-border);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.glass-card{background:rgba(15,22,36,.65);border:1px solid var(--glass-border);backdrop-filter:blur(8px);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
.glass-card:hover{transform:translateY(-2px);border-color:rgba(212,175,106,.35);box-shadow:0 12px 32px rgba(0,0,0,.25)}
.hero-eyebrow{color:var(--gold);font-weight:700;font-size:.82rem;letter-spacing:.04em;text-transform:uppercase;margin:0 0 10px}
.hero-title{font-size:clamp(1.75rem,5vw,2.75rem);margin:0 0 14px;line-height:1.15;font-weight:800}
.hero-lead{font-size:1.05rem;color:#e8edf7;line-height:1.55;margin:0 0 20px;max-width:52rem}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 20px;border-radius:12px;font-weight:700;font-size:.95rem;border:2px solid transparent;transition:transform .15s ease,box-shadow .15s ease,filter .15s}
.btn:active{transform:scale(.98)}.btn-primary{background:var(--gold);color:#1a1508;border-color:#c9a85e}.btn-primary:hover{filter:brightness(1.06);box-shadow:0 8px 24px rgba(214,181,108,.25)}
.btn-secondary{background:#209bd8;color:#fff;border-color:#3cb3ec}.btn-secondary:hover{filter:brightness(1.06)}
.btn-outline{background:transparent;color:#e8edf7;border-color:#4a5f8f}.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.hero p{color:#e8edf7}.hero-links,.quick-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.chip{background:#1c2740;border:1px solid #31405f;border-radius:999px;padding:9px 14px;color:#dce6fa;font-size:.88rem;transition:background .15s,border-color .15s}.chip:hover{border-color:var(--gold)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin:20px 0}
.step-card{background:#121a2d;border:1px solid #2a3a5f;border-radius:14px;padding:16px}
.step-num{display:inline-flex;width:32px;height:32px;border-radius:50%;background:var(--gold);color:#1a1508;font-weight:800;align-items:center;justify-content:center;margin-bottom:10px;font-size:.9rem}
.step-card h3{margin:0 0 8px;font-size:1.05rem}.step-card p{margin:0;color:#d4ddf2;line-height:1.5;font-size:.92rem}
.popular-cats .quick-links{margin-top:12px}
.zones-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:12px}
.zone-card{background:#151f36;border:1px solid #2f4070;border-radius:14px;padding:16px}.zone-card h3{margin:0 0 8px;font-size:1.05rem}.zone-card p{margin:0;color:#d4ddf2;line-height:1.55;font-size:.92rem}
.age-block{border-left:4px solid #c45c5c;background:#1a1520;padding:16px 18px;border-radius:12px;margin:20px 0}
.age-block h2{margin:0 0 10px;font-size:1.15rem}.age-block p{margin:0;color:#f0e6e6;line-height:1.55;font-size:.93rem}
.toolbar{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:18px 0}.toolbar input,.toolbar select{background:#111a2c;color:#fff;border:1px solid #2a3656;padding:12px;border-radius:10px;font-size:.95rem}
.catalog-intro{margin:18px 0}.cat-desc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.cat-desc-card{background:#121a2d;border:1px solid #2a3a5f;border-radius:14px;padding:14px}
.cat-desc-card h3{margin:0 0 6px;font-size:1rem}.cat-desc-card p{margin:0;color:#d4ddf2;font-size:.88rem;line-height:1.45}
.cat-desc-card a{font-weight:700}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin:20px 0}
.card{background:var(--card);border:1px solid #2d3a59;border-radius:16px;padding:14px;display:flex;flex-direction:column;transition:transform .18s ease,border-color .18s,box-shadow .18s}
.card:hover{transform:translateY(-3px);border-color:#4a5f90;box-shadow:0 12px 28px rgba(0,0,0,.28)}
.card-cat{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:#9aa7c5;margin:6px 0 4px;font-weight:700}
.card-brand{font-size:.8rem;color:#b8c4dc;margin:-4px 0 6px;font-weight:600}
.card-vol{font-size:.83rem;color:#9aa7c5;margin:0 0 6px}
.card h3{font-size:.92rem;line-height:1.35;margin:0 0 6px;font-weight:650}
.card h3 a{color:#fff}.card h3 a:hover{color:var(--gold)}
.card img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px}.stock{font-size:.83rem;color:#7df58f}.stock.out{color:#ff9f9f}.price{font-size:1.25rem;font-weight:700;margin:6px 0}
.card .add-to-cart{margin-top:auto;background:var(--gold);border:0;color:#1f1f1f;font-weight:700;padding:12px 14px;border-radius:11px;cursor:pointer;font-size:.95rem;min-height:46px}
.extra>img,.product-detail picture{display:block;width:100%;max-width:420px;margin:0 auto 12px}
.product-detail picture img,.extra>img{height:auto;max-height:420px;object-fit:contain;border-radius:12px;background:#0f1628}
.breadcrumbs{font-size:.9rem;color:var(--muted);margin:10px 0 8px}.breadcrumbs a{color:#d0def8}
.seo-text,.faq,.extra{background:#121a2d;border:1px solid #2a3a5f;padding:20px;border-radius:14px;margin:20px 0}.seo-text p{color:#d4ddf2;line-height:1.6}
.prose-section h2{font-size:1.25rem;margin:22px 0 10px}.prose-section h3{font-size:1.08rem;margin:18px 0 8px}.prose-section p{color:#d4ddf2;line-height:1.65;margin:0 0 12px;font-size:.95rem}
.faq details{border-top:1px solid #2f3d5d;padding:10px 0}.faq summary{cursor:pointer;font-weight:600}
.footer{margin-top:40px;padding:28px 0;background:#070b14;border-top:1px solid #293754}.footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;font-size:.92rem}
.legal-banner{background:#1b1111;color:#ffdfdf;border:1px solid #5a3131;border-radius:12px;padding:12px 14px;font-size:.82rem;margin:16px auto 0;max-width:min(1180px,94%);line-height:1.45}
.desktop-floats{display:contents}
.floating-call,.floating-tg,.floating-cart{position:fixed;right:12px;border-radius:999px;padding:12px 16px;font-weight:700;z-index:60;font-size:.88rem;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .15s ease}
.floating-call:hover,.floating-tg:hover,.floating-cart:hover{transform:translateY(-2px)}
.floating-call{bottom:156px;background:#1d3c70;color:#fff}.floating-tg{bottom:104px;background:#209bd8;color:#fff}.floating-cart{bottom:52px;background:var(--gold);color:#2b220f;border:0;cursor:pointer}
.sticky-cta{display:none;position:fixed;bottom:0;left:0;right:0;z-index:65;gap:8px;padding:10px 12px;padding-bottom:max(10px,env(safe-area-inset-bottom));background:rgba(7,11,20,.94);backdrop-filter:blur(12px);border-top:1px solid #26314d;box-shadow:0 -8px 32px rgba(0,0,0,.35)}
.sticky-cta__btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:52px;padding:8px 6px;border-radius:12px;font-weight:700;font-size:.78rem;line-height:1.2;text-align:center;border:none;cursor:pointer;color:#fff;text-decoration:none}
.sticky-cta__cart{color:#1a1508!important;background:var(--gold)!important}
.sticky-cta__call{background:#1d3c70}.sticky-cta__tg{background:#209bd8}
.cat-rich{border-top:1px solid #2f4070;margin-top:14px;padding-top:14px}
.cat-rich h3{font-size:1rem;margin:16px 0 6px;color:#e8edf7}
.cat-brands{font-size:.9rem;color:#a5adbf;margin-top:12px}
.cat-order{margin-top:0}
.trust-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:12px}
.trust-card{background:#151f36;border:1px solid #2f4070;border-radius:12px;padding:14px}
.trust-card h3{margin:0 0 8px;font-size:1rem}
.trust-card p{margin:0;color:#d4ddf2;font-size:.9rem;line-height:1.5}
.trust-icon{display:block;color:var(--gold);font-size:.75rem;margin-bottom:8px}
.section-panel{background:#121a2d;border:1px solid #2a3a5f;border-radius:16px;padding:clamp(18px,3vw,24px);margin:20px 0}
.section-head h2{margin:0 0 8px;font-size:clamp(1.15rem,3vw,1.35rem)}
.section-lead{color:#a5adbf;margin:0 0 16px;font-size:.93rem;line-height:1.5;max-width:42rem}
.brand-row{display:flex;flex-wrap:wrap;gap:8px}
.brand-chip{background:#1a2438;border:1px solid #334a75;border-radius:8px;padding:6px 12px;font-size:.82rem;color:#c8d4ec;font-weight:600}
.section-note{margin:14px 0 0;font-size:.88rem;color:#9aa7c5}
.zones-grid--compact{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
.zone-card--link{display:block;text-decoration:none;color:inherit;transition:border-color .15s,transform .15s}
.zone-card--link:hover{border-color:var(--gold);transform:translateY(-2px)}
.zone-card--link h3{color:#fff;margin:0 0 6px}
.contact-strip{background:linear-gradient(120deg,#151f36,#1a2a48);border:1px solid #2f4070;border-radius:16px;padding:20px;margin:24px 0}
.contact-strip-inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
.contact-strip h2{margin:0 0 6px;font-size:1.1rem}
.contact-strip p{margin:0;color:#d4ddf2;font-size:.95rem}
.info-list{margin:0;padding-left:1.2rem;color:#d4ddf2;line-height:1.65;font-size:.95rem}
.info-list li{margin-bottom:8px}
.grid--compact{gap:12px}
.faq--in-panel{margin:0;background:transparent;border:0;padding:0}
.cat-scenarios,.cat-pairings{background:#151f36;border:1px solid #2f4070;border-radius:14px;padding:18px;margin:16px 0}
.cat-list{margin:0;padding-left:1.2rem;color:#d4ddf2;line-height:1.6;font-size:.93rem}
.cat-list li{margin-bottom:8px}
.chip-muted{opacity:.9;font-size:.85rem}
.pair-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.trust-grid--6{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
.reviews-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.review-card{padding:16px}
.review-text{margin:0 0 12px;color:#e8edf7;font-size:.93rem;line-height:1.55;font-style:italic}
.review-meta{margin:0;font-size:.85rem;color:var(--muted)}
.picks-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.pick-card{display:block;padding:16px;text-decoration:none;color:inherit}
.pick-card h3{margin:0 0 8px;font-size:1rem;color:#fff}
.pick-card p{margin:0 0 10px;color:var(--muted);font-size:.88rem}
.pick-link{font-size:.82rem;color:var(--gold);font-weight:600}
.tg-cta{margin:28px 0;padding:clamp(20px,4vw,28px);border-radius:20px}
.tg-cta-inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.tg-cta-eyebrow{margin:0 0 6px;color:var(--gold);font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.tg-cta h2{margin:0 0 10px;font-size:clamp(1.2rem,3vw,1.5rem)}
.tg-cta-copy p{margin:0;color:#d4ddf2;font-size:.95rem;line-height:1.55;max-width:36rem}
.tg-cta-list{margin:12px 0 0;padding-left:1.1rem;color:#c8d4ec;font-size:.9rem;line-height:1.6}
.tg-cta-actions{display:flex;flex-wrap:wrap;gap:10px}
.btn-lg{min-height:52px;padding:14px 24px;font-size:1rem}
.card img{min-height:120px;background:#0f1628}
.card{backdrop-filter:blur(6px)}
.section-panel{backdrop-filter:blur(8px)}
@media(prefers-reduced-motion:no-preference){.btn,.card,.zone-card--link,.pick-card{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}}
.blog-list{display:grid;gap:16px;margin:16px 0}
.blog-card{background:#151f36;border:1px solid #2f4070;border-radius:14px;padding:18px}
.blog-card h2{margin:8px 0 10px;font-size:1.15rem}
.blog-card h2 a{color:#fff}
.blog-card p{margin:0 0 12px;color:#d4ddf2;line-height:1.55;font-size:.93rem}
.blog-meta{font-size:.82rem;color:#9aa7c5;margin:0 0 6px}
.blog-article .blog-meta{margin-bottom:12px}
.blog-related{margin-top:16px}
.blog-related h3{font-size:1rem;margin:0 0 10px}
.guarantees-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:20px 0;padding:16px;background:rgba(18,26,45,.85);border:1px solid #2a3a5f;border-radius:14px}
.guarantee-item{text-align:center;padding:8px}
.guarantee-item strong{display:block;color:var(--gold);font-size:.95rem;margin-bottom:4px}
.guarantee-item span{font-size:.8rem;color:#a5adbf}
.journal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.journal-card{padding:16px}
.journal-card h3{margin:0 0 8px;font-size:1rem}
.journal-card h3 a{color:#fff}
.journal-card--compact p{font-size:.88rem;margin:0}
.journal-grid--related{margin-top:12px}
.district-local{margin:18px 0;padding:18px}
.district-tip{margin:12px 0 0;color:#c8d4ec;font-size:.9rem}
.district-cta{margin:20px 0}
.cat-cta{margin:18px 0;padding:18px}
.cat-cta h2{margin:0 0 8px;font-size:1.1rem}
.cat-cta p{margin:0 0 14px;color:#d4ddf2;font-size:.93rem}
.cat-cta-actions{display:flex;flex-wrap:wrap;gap:10px}
.related-cats{margin:16px 0}
.glass-panel{background:rgba(18,26,45,.72);border:1px solid #2f4070;border-radius:16px;backdrop-filter:blur(10px)}
.featured-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:4px}
.featured-card{display:flex;flex-direction:column;padding:16px;border-radius:18px;box-shadow:0 8px 28px rgba(0,0,0,.22)}
.featured-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.32)}
.featured-card__media{display:block;border-radius:12px;overflow:hidden;margin-bottom:10px}
.featured-card__media img,.featured-card__media picture img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#0f1628}
.featured-card__title{font-size:.95rem;line-height:1.35;margin:0 0 8px}
.featured-card__title a{color:#fff}
.featured-card__desc{margin:0 0 8px;color:#c8d4ec;font-size:.88rem;line-height:1.5}
.featured-card__price{font-size:1.3rem;font-weight:800;margin:4px 0 12px;color:var(--gold)}
.featured-card__actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto}
.featured-card__btn{flex:1 1 auto;min-height:44px;padding:10px 14px;font-size:.88rem}
.seo-accordion-panel{padding:0;overflow:hidden}
.seo-accordion{border:0;margin:0;background:transparent}
.seo-accordion__trigger{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:clamp(18px,3vw,24px);cursor:pointer;font-weight:700;font-size:1.05rem;color:#fff;list-style:none}
.seo-accordion__trigger::-webkit-details-marker{display:none}
.seo-accordion__label{color:var(--gold)}
.seo-accordion__chevron{width:10px;height:10px;border-right:2px solid var(--gold);border-bottom:2px solid var(--gold);transform:rotate(45deg);transition:transform .28s ease;margin-right:4px;flex-shrink:0}
.seo-accordion[open] .seo-accordion__chevron{transform:rotate(-135deg);margin-top:6px}
.seo-accordion__body{padding:0 clamp(18px,3vw,24px) clamp(20px,3vw,28px);border-top:1px solid rgba(255,255,255,.06);animation:seoAccordionIn .35s ease}
@keyframes seoAccordionIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.seo-accordion__body h2{margin-top:0;font-size:1.2rem}
.seo-accordion__body h3{font-size:1.05rem;margin:20px 0 10px;color:#e8edf7}
.seo-accordion__body p{font-size:.94rem}
.hero-brand{margin:-6px 0 12px;font-size:1rem;color:var(--muted);font-weight:600}
@media(max-width:719px){.desktop-floats{display:none!important}.sticky-cta{display:flex}body{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))}}
@media(max-width:720px){.featured-grid{grid-template-columns:1fr}.featured-card__actions .btn{flex:1 1 100%}}
@media(min-width:720px){.sticky-cta{display:none!important}body{padding-bottom:96px}}
.cart-drawer{position:fixed;top:0;right:-420px;width:min(420px,100%);height:100vh;background:#0f1628;border-left:1px solid #2d3b5e;z-index:80;padding:16px;transition:right .28s ease;overflow-y:auto;-webkit-overflow-scrolling:touch}
.cart-drawer.open{right:0}.cart-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.cart-total-line{font-size:1.2rem;font-weight:800;margin:12px 0 8px}.cart-hint{font-size:.82rem;color:#a5adbf;line-height:1.4;margin:0 0 10px}
.cart-tg-link{display:block;text-align:center;background:#209bd8;color:#fff;font-weight:700;padding:12px;border-radius:11px;margin-bottom:14px}
.cart-line{border:1px solid #2d3b5e;border-radius:12px;padding:12px;margin-bottom:10px;background:#11192d}
.cart-line h3{font-size:.88rem;margin:0 0 6px;line-height:1.3}.cart-line-meta{font-size:.85rem;color:#a5adbf;margin:0 0 10px}
.cart-line-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.cart-qty{min-width:44px;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #3d5280;background:#1a2744;color:#fff;font-size:1.1rem;font-weight:700;cursor:pointer}
.cart-remove{font-size:.82rem;color:#ff9f9f;background:transparent;border:0;cursor:pointer;text-decoration:underline;padding:4px}
.checkout input,.checkout textarea,.checkout button{width:100%;margin:6px 0;padding:12px;border-radius:10px;border:1px solid #2d3c60;font-size:.95rem}
.checkout input,.checkout textarea{background:#11192d;color:#fff}.checkout button{background:var(--gold);color:#1c1914;font-weight:700;border:0;min-height:48px;cursor:pointer}
@media(max-width:520px){.header-tel{font-size:.72rem;max-width:38vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hero-actions .btn{flex:1 1 100%;justify-content:center}}
@media(min-width:980px){.desktop-nav{display:flex}.menu-btn,.mobile-nav{display:none}.header-aside{margin-left:0;gap:12px}}
@media(max-width:720px){.toolbar{grid-template-columns:1fr}.legal-banner{font-size:.74rem}.grid{grid-template-columns:1fr;gap:12px}.card img{aspect-ratio:auto;height:clamp(150px,45vw,220px);object-fit:contain;background:#0f1628}body[data-page="product"] .extra>img{max-width:100%;height:clamp(180px,55vw,300px);max-height:none}}
`;
  fs.writeFileSync(path.join(ROOT, "assets/css/style.css"), css);

  const jsProducts = `window.PRODUCTS=${JSON.stringify(products)};\nwindow.CATEGORY_META=${JSON.stringify(categoryMeta)};`;
  fs.writeFileSync(path.join(ROOT, "assets/js/products.js"), jsProducts);

  const jsCart = `(()=>{const K="cart";const state=JSON.parse(localStorage.getItem(K)||"[]");const drawer=()=>document.getElementById("cart-drawer");
const save=()=>{localStorage.setItem(K,JSON.stringify(state));document.querySelectorAll(".cart-badge").forEach(el=>el.textContent=state.reduce((a,i)=>a+i.quantity,0));render();};
window.addToCart=(id)=>{const p=(window.PRODUCTS||[]).find(x=>x.id===id);if(!p||p.inStock===false)return;const ex=state.find(x=>x.id===id);if(ex)ex.quantity++;else state.push({...p,quantity:1});save();};
window.removeFromCart=(id)=>{const i=state.findIndex(x=>x.id===id);if(i>-1)state.splice(i,1);save();};
window.changeQty=(id,v)=>{const it=state.find(x=>x.id===id);if(!it)return;it.quantity=Math.max(1,it.quantity+v);save();};
function render(){const box=document.getElementById("cart-items");const total=document.getElementById("cart-total");if(!box||!total)return;if(!state.length){box.innerHTML="<p>Корзина пуста</p>";total.textContent="Итого: 0 ₽";return;}
let sum=0;box.innerHTML=state.map(i=>{sum+=i.price*i.quantity;return '<div class="cart-line"><h3>'+i.name+'</h3><p class="cart-line-meta">'+i.price+' ₽ × '+i.quantity+' = '+(i.price*i.quantity)+' ₽</p><div class="cart-line-actions"><button type="button" class="cart-qty" onclick="changeQty('+i.id+',-1)" aria-label="Меньше">−</button><button type="button" class="cart-qty" onclick="changeQty('+i.id+',1)" aria-label="Больше">+</button><button type="button" class="cart-remove" onclick="removeFromCart('+i.id+')">Удалить</button></div></div>';}).join("");
total.textContent='Итого: '+sum+' ₽';}
async function sendOrder(e){e.preventDefault();if(!state.length){alert("Корзина пуста");return;}const f=e.target;const fd=new FormData(f);
const sum=state.reduce((a,i)=>a+i.price*i.quantity,0);const items=state.map(i=>'- '+i.name+' x '+i.quantity+' = '+(i.price*i.quantity)+' ₽').join('\\n');
const dt=new Date().toLocaleString("ru-RU");const msg=['Новый заказ','', 'Товары:',items,'','Сумма: '+sum+' ₽','Имя: '+fd.get("name"),'Телефон: '+fd.get("phone"),'Адрес: '+fd.get("address"),'Комментарий: '+(fd.get("comment")||'нет'),'Дата: '+dt].join('\\n');
try{const r=await fetch("/send-telegram.php",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})});const text=await r.text();let j=null;try{j=text?JSON.parse(text):null;}catch(_){j=null;}
if(!j){try{await navigator.clipboard.writeText(msg);}catch(_){}
alert("Сервер не вернул JSON-ответ (на Live Server PHP обычно не выполняется — заказ до Telegram не доходит). Текст заказа скопирован в буфер: вставьте в Telegram. На хостинге с работающим send-telegram.php кнопка «Отправить заказ» будет работать сама.");return;}
if(j.success){alert("Заказ отправлен в Telegram");state.splice(0,state.length);f.reset();save();if(drawer())drawer().classList.remove("open");}else{alert("Не удалось отправить заказ: "+(j.error||"неизвестная ошибка"));}}
catch(err){alert("Ошибка отправки заказа: "+(err&&err.message?err.message:"network error"));}}
document.addEventListener("click",(e)=>{if(e.target.closest(".js-cart-open"))drawer()?.classList.add("open");if(e.target.closest(".js-cart-close"))drawer()?.classList.remove("open");if(e.target.matches(".add-to-cart"))addToCart(Number(e.target.dataset.id));});
document.addEventListener("submit",(e)=>{if(e.target.id==="checkout-form")sendOrder(e)});save();})();`;

  const jsMain = `(()=>{const body=document.body;const page=body.dataset.page;const category=body.dataset.category;const productId=Number(body.dataset.product||0);
const all=window.PRODUCTS||[];const navBtn=document.querySelector(".menu-btn");const nav=document.querySelector(".mobile-nav");if(navBtn&&nav)navBtn.addEventListener("click",()=>nav.classList.toggle("open"));
const RV_KEY="recentProducts";
function vol(n){var m=n.match(/[\\d.,]+\\s*(?:л|литра|литр)/i);return m?m[0]:'—';}
function catLab(c){var M=window.CATEGORY_META||{};return (M[c]&&M[c].name)||'Товар';}
function brandGuess(p){var w=p.name.trim().split(/\\s+/);if(w.length<2)return '';var parts=[];for(var i=1;i<w.length&&parts.length<2;i++){var t=w[i];if(/^[\\d.,]+/.test(t))break;if(/^(л|литра|литр)$/i.test(t))break;parts.push(t);}return parts.join(' ')||'';}
function imgAlt(p){var b=brandGuess(p);var bits=[catLab(p.category)];if(b)bits.push(b);bits.push(vol(p.name));return bits.filter(Boolean).join(', ');}
function productImg(p,loading){var jpg=p.image;var webp=jpg.replace(/\\.jpg$/i,'.webp');var alt=imgAlt(p).replace(/"/g,'&quot;');return '<picture><source srcset="'+webp+'" type="image/webp"><img src="'+jpg+'" alt="'+alt+'" loading="'+(loading||'lazy')+'" decoding="async" width="440" height="330"></picture>';}
function card(p){var stock=p.inStock!==false;var cn=catLab(p.category);var v=vol(p.name);var br=brandGuess(p);var brandHtml=(br&&br.length)?'<p class="card-brand">'+br+'</p>':'';
return '<article class="card"><a href="/products/product-'+p.id+'.html">'+productImg(p,'lazy')+'</a><p class="card-cat">'+cn+'</p>'+brandHtml+'<h3><a href="/products/product-'+p.id+'.html">'+p.name+'</a></h3><p class="card-vol">'+v+'</p><p class="price">'+p.price+' ₽</p><p class="stock '+(stock?'':'out')+'">'+(stock?'В наличии':'Нет в наличии')+'</p>'+(stock?'<button type="button" class="add-to-cart" data-id="'+p.id+'">В корзину</button>':'')+'</article>';}
function renderList(list){var grid=document.getElementById("product-grid");if(grid)grid.innerHTML=list.map(card).join("");}
function shuffle(list){var a=list.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pushRecent(id){try{var a=JSON.parse(localStorage.getItem(RV_KEY)||'[]');a=a.filter(function(x){return x!==id;});a.unshift(id);localStorage.setItem(RV_KEY,JSON.stringify(a.slice(0,10)));}catch(e){}}
function renderRecent(gridId,wrapId){var grid=document.getElementById(gridId);var wrap=document.getElementById(wrapId);if(!grid)return;var ids=JSON.parse(localStorage.getItem(RV_KEY)||'[]');var items=[];for(var i=0;i<ids.length;i++){var pr=all.find(function(x){return x.id===ids[i];});if(pr&&pr.id!==productId)items.push(pr);if(items.length>=8)break;}if(!items.length){if(wrap)wrap.hidden=true;return;}grid.innerHTML=items.map(card).join("");if(wrap)wrap.hidden=false;}
if(page==="product")pushRecent(productId);
if(page==="home"){var alcohol=all.filter(function(x){return x.inStock!==false&&x.category!=="sigarety";});var ph=document.getElementById("popular-home-grid");if(ph)ph.innerHTML=shuffle(alcohol).slice(0,8).map(card).join("");renderRecent("recent-grid","recent-wrap");}
if(page==="catalog"){var alc=all.filter(function(x){return x.inStock!==false;});var pc=document.getElementById("popular-catalog-grid");if(pc)pc.innerHTML=shuffle(alc).slice(0,6).map(card).join("");renderRecent("recent-catalog-grid","recent-wrap-catalog");var list=all.slice();renderList(list);var q=document.getElementById("search");var s=document.getElementById("sort");var c=document.getElementById("cat-filter");var apply=function(){var r=list.slice();var v=(q&&q.value)?q.value.toLowerCase():"";if(v)r=r.filter(function(i){return i.name.toLowerCase().indexOf(v)!==-1;});if(c&&c.value)r=r.filter(function(i){return i.category===c.value;});if(s&&s.value==="asc")r.sort(function(a,b){return a.price-b.price;});if(s&&s.value==="desc")r.sort(function(a,b){return b.price-a.price;});renderList(r);};[q,s,c].forEach(function(el){if(el)el.addEventListener("input",apply);});}
if(page==="category"){var list=all.filter(function(x){return x.category===category;});renderList(list);var q=document.getElementById("search");var s=document.getElementById("sort");var apply=function(){var r=list.slice();var v=(q&&q.value)?q.value.toLowerCase():"";if(v)r=r.filter(function(i){return i.name.toLowerCase().indexOf(v)!==-1;});if(s&&s.value==="asc")r.sort(function(a,b){return a.price-b.price;});if(s&&s.value==="desc")r.sort(function(a,b){return b.price-a.price;});renderList(r);};[q,s].forEach(function(el){if(el)el.addEventListener("input",apply);});}
if(page==="product"){var p=all.find(function(x){return x.id===productId;});var block=document.getElementById("related-products");if(p&&block){block.innerHTML=all.filter(function(x){return x.category===p.category&&x.id!==p.id;}).slice(0,4).map(card).join("");}}
})();`;
  fs.writeFileSync(path.join(ROOT, "assets/js/cart.js"), jsCart);
  fs.writeFileSync(path.join(ROOT, "assets/js/main.js"), jsMain);
}

function breadcrumbJson(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function faqPageFromPairs(pairs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map(([q, t]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: t }
    }))
  };
}

function createPages(products) {
  const homeFaqPairs = [
    ["Сколько едет курьер?", "Зависит от района и загрузки. Ориентир по минутам назовём после адреса — в пиковые часы закладывайте запас."],
    ["Какие районы обслуживаете?", "Москва и ближнее Подмосковье: ЦАО, округа, Химки, Мытищи, Балашиха, Одинцово и другие — уточните адрес у оператора."],
    ["Как оформить заказ?", "Каталог и корзина на сайте или список в Telegram с адресом и телефоном. Оператор подтвердит состав и время."],
    ["Можно ли заказать ночью?", "Заявки принимаем без выходных. Ночной интервал может отличаться от дневного — согласуем до подтверждения."],
    ["Как связаться быстрее?", `Телефон ${PHONE_FORMATTED} или Telegram — приложите состав и подъезд, чтобы меньше уточнять.`],
    ["Нужен ли документ при получении?", "Передаём только 18+. Курьер может попросить паспорт или другой документ с датой рождения."],
    ["Что если позиции нет в наличии?", "Статус виден в карточке. Подберём аналог из того же раздела или подскажем по поступлению."],
    ["Как оплатить?", "Способ согласуем при подтверждении — см. страницу «Оплата и доставка»."]
  ];
  const homeFaqHtml = `<section class="faq" id="faq"><h2>Частые вопросы</h2>${homeFaqPairs
    .map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`)
    .join("")}</section>`;

  const popularCatSlugs = ["vodka", "vino", "viski", "shampanskoe", "pivo", "konyak"];
  const popularCatsBlock = `<section class="section-panel popular-cats">${sectionHead("Популярные категории", "Вино, крепкое, пиво и игристое — цены в карточках.")}<div class="quick-links">${popularCatSlugs
    .map((s) => {
      const m = categoryMeta[s];
      return `<a class="chip" href="/${s}.html">${m.name}</a>`;
    })
    .join("")}<a class="chip" href="/catalog.html">Весь каталог</a></div></section>`;

  const homeBrands = buildPopularBrandsBlock(products);
  const homeFeatured = buildHomeFeaturedWhiskyBlock(products);
  const homeSeoAccordion = buildHomeSeoAccordion();
  const homeReviews = buildReviewsBlock();
  const homeJournal = buildJournalHomeBlock(blogPosts, 4);
  const homeTgCta = buildTelegramCtaBlock();
  const homeContent = `<section class="hero hero-home hero-premium glass-panel">
    <p class="hero-eyebrow">${BRAND} · ${BRAND_TAGLINE}</p>
    <h1 class="hero-title">Доставка алкоголя в Москве</h1>
    <p class="hero-brand">${BRAND} — алкоголь с доставкой на дом</p>
    <p class="hero-lead">Каталог с ценами, заказ в корзине или в Telegram. Принимаем заявки круглосуточно — время курьера согласуем после адреса.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="/catalog.html">Открыть каталог</a>
      <a class="btn btn-secondary btn-lg" href="${TELEGRAM_LINK}" target="_blank" rel="noopener">Заказ в Telegram</a>
    </div>
    <p class="hero-note"><a href="tel:${PHONE_RAW}">${PHONE_FORMATTED}</a> · приём заявок без выходных</p>
  </section>

  ${popularCatsBlock}
  ${homeFeatured}
  ${homeBrands}

  <section class="section-panel trust-block">
    ${sectionHead(`Почему выбирают ${BRAND}`)}
    <div class="trust-grid trust-grid--6">
      <div class="trust-card glass-card"><span class="trust-icon" aria-hidden="true">◆</span><h3>Ассортимент</h3><p>Вино, крепкое, пиво, игристое — цены в карточках.</p></div>
      <div class="trust-card glass-card"><span class="trust-icon" aria-hidden="true">◆</span><h3>Популярные бренды</h3><p>Марки из каталога; замену подберём при отсутствии позиции.</p></div>
      <div class="trust-card glass-card"><span class="trust-icon" aria-hidden="true">◆</span><h3>Telegram</h3><p>Поддержка и заказ списком — быстрый ответ оператора.</p></div>
      <div class="trust-card glass-card"><span class="trust-icon" aria-hidden="true">◆</span><h3>Москва и МО</h3><p>ЦАО, округа, Химки, Мытищи, Балашиха, Одинцово и другие адреса.</p></div>
      <div class="trust-card glass-card"><span class="trust-icon" aria-hidden="true">◆</span><h3>Вечерняя доставка</h3><p>Работаем по согласованию вечером и ночью — интервал уточним заранее.</p></div>
      <div class="trust-card glass-card"><span class="trust-icon" aria-hidden="true">◆</span><h3>Подбор напитков</h3><p>Поможем с выбором марки и объёма — по телефону или в мессенджере.</p></div>
    </div>
  </section>

  ${guaranteesStrip()}

  <section class="section-panel">
    ${sectionHead("Москва и Подмосковье", "Укажите подъезд и домофон — так курьеру проще с первого раза.")}
    <div class="zones-grid zones-grid--compact">
      <a class="zone-card zone-card--link" href="/dostavka-alkogolya-moskva.html"><h3>Вся Москва</h3><p>Условия и сроки</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-alkogolya-cao.html"><h3>ЦАО</h3><p>Центр</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-arbat.html"><h3>Арбат</h3><p>Центральные улицы</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-alkogolya-zao.html"><h3>ЗАО</h3><p>Запад</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-khimki.html"><h3>Химки</h3><p>МО</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-mytishchi.html"><h3>Мытищи</h3><p>МО</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-balashiha.html"><h3>Балашиха</h3><p>МО</p></a>
      <a class="zone-card zone-card--link" href="/dostavka-odintsovo.html"><h3>Одинцово</h3><p>МО</p></a>
    </div>
  </section>

  <section class="section-panel">
    ${sectionHead("Как оформить заказ")}
    <div class="steps">
      <div class="step-card"><span class="step-num">1</span><h3>Каталог</h3><p>Выберите позиции — видны цена и наличие.</p></div>
      <div class="step-card"><span class="step-num">2</span><h3>Заявка</h3><p>Корзина на сайте или список в Telegram с адресом.</p></div>
      <div class="step-card"><span class="step-num">3</span><h3>Связь</h3><p>Оператор уточнит состав, подъезд и оплату.</p></div>
      <div class="step-card"><span class="step-num">4</span><h3>Получение</h3><p>Только 18+; документ могут попросить при выдаче.</p></div>
    </div>
  </section>

  ${homeReviews}

  ${homeSeoAccordion}

  <section class="section-panel faq-panel">${homeFaqHtml.replace('class="faq"', 'class="faq faq--in-panel"')}</section>

  ${homeJournal}

  ${homeTgCta}

  <section class="extra" id="recent-wrap" hidden><h2>Недавно смотрели</h2><div id="recent-grid" class="grid grid--compact"></div></section>
`;

  const homeLdExtra = homeFeaturedItemListJson(products);
  const homeLd = baseJsonLd(
    [
      breadcrumbJson([{ name: "Главная", url: `${DOMAIN}/` }]),
      faqPageFromPairs(homeFaqPairs),
      homeLdExtra
    ].filter(Boolean)
  );
  fs.writeFileSync(
    path.join(ROOT, "index.html"),
    pageTemplate({
      title: `Доставка алкоголя в Москве круглосуточно — ${BRAND}`,
      description:
        "Доставка алкоголя на дом по Москве и МО: виски, вино, водка, игристое. Заказ в каталоге или Telegram, цены в карточках. 18+.".slice(
          0,
          158
        ),
      canonical: `${DOMAIN}/`,
      content: homeContent,
      jsonLd: homeLd,
      pageType: "home"
    })
  );

  Object.entries(categoryMeta).forEach(([slug, meta]) => {
    const pageMeta = categoryPageMeta[slug] || {
      title: `${meta.name} — каталог | ${BRAND}`,
      description: `${meta.name}: цены и наличие в каталоге. Заказ онлайн, привоз по Москве и МО, 18+.`
    };
    const content = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>${escapeHtml(meta.name)}</span></nav>
      <h1 class="page-h1">${escapeHtml(meta.name)}</h1>
      <p style="color:#a5adbf;margin:-8px 0 14px;font-size:.95rem;max-width:46rem">${escapeHtml(meta.intro)}</p>
      <section class="toolbar"><input id="search" placeholder="Поиск по категории" aria-label="Поиск по категории"><select id="sort" aria-label="Сортировка"><option value="">Сортировка</option><option value="asc">Цена по возрастанию</option><option value="desc">Цена по убыванию</option></select><input value="${escapeHtml(meta.name)}" disabled aria-hidden="true"></section>
      <div id="product-grid" class="grid"></div>
      ${categorySeoText(slug, products)}`;
    const ld = baseJsonLd([
      breadcrumbJson([
        { name: "Главная", url: `${DOMAIN}/` },
        { name: meta.name, url: `${DOMAIN}/${slug}.html` }
      ]),
      faqPageFromPairs(getCategoryFaqPairs(slug))
    ]);
    fs.writeFileSync(
      path.join(ROOT, `${slug}.html`),
      pageTemplate({
        title: pageMeta.title,
        description: pageMeta.description,
        canonical: `${DOMAIN}/${slug}.html`,
        content,
        jsonLd: ld,
        pageType: "category",
        pageCategory: slug
      })
    );
  });

  const catDescGrid = Object.entries(categoryMeta)
    .map(
      ([slug, meta]) =>
        `<div class="cat-desc-card"><h3><a href="/${slug}.html">${escapeHtml(meta.name)}</a></h3><p>${escapeHtml(meta.intro)}</p></div>`
    )
    .join("");

  const pageOplata = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Оплата и доставка</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Оплата и доставка</h1>
      <h2>Как оформляется заказ</h2>
      <p>Выберите позиции в <a href="/catalog.html">каталоге</a>, добавьте их в корзину и отправьте форму с контактами и адресом. Заявку обрабатывает оператор: он подтверждает состав, время и условия передачи.</p>
      <h2>Оплата</h2>
      <p>Способ и порядок оплаты согласуются при подтверждении заказа — зависит от формата доставки и актуальных правил сервиса. Если нужен чек или особые условия, сообщите об этом в комментарии к заказу или в Telegram.</p>
      <h2>Передача заказа и получение</h2>
      <p>Передайте точный адрес, подъезд и домофон. Курьер везёт заказ до указанной точки; при необходимости заранее согласуйте место встречи. Если вы не можете принять заказ лично, уточните у оператора, можно ли передать другому совершеннолетнему получателю.</p>
      <h2>Возраст 18+ и проверка документов</h2>
      <p>Алкогольная продукция передаётся только совершеннолетним. При выдаче может потребоваться документ с фото и датой рождения. Без подтверждения возраста заказ не передаём — это условие закона и внутренних правил сервиса.</p>
      <h2>Сроки обработки заявки</h2>
      <p>Обращение по телефону или в Telegram обрабатывается по очереди в порядке поступления. При высокой загрузке ответ может занять несколько минут — повторный звонок или сообщение ускорят связь. После подтверждения заказа изменения лучше вносить как можно раньше.</p>
      <p style="margin-top:18px"><a class="chip" href="/delivery-policy.html">Политика доставки</a> <a class="chip" href="/kontakty.html">Контакты</a></p>
    </article>`;

  const moskvaFaqPairs = [
    ["Можно ли заказать в центр поздним вечером?", "Приём заявок без выходных. Конкретное время зависит от маршрута — оператор скажет реалистичный интервал после уточнения адреса."],
    ["Можно ли заказать только одну бутылку?", "Да, если позиция есть в каталоге и доступна к добавлению в корзину. Минимальный состав лучше уточнить при подтверждении."],
    ["Что указать в адресе, если домофон сломан?", "Напишите это в комментарии и продублируйте в Telegram: оператор согласует встречу у подъезда или другую точку."],
    ["Доставляете ли внутрь дома или только до двери?", "Формат передачи согласуется при подтверждении. По умолчанию ориентируемся на безопасную выдачу у входа или по правилам дома."]
  ];

  const pageMoskva = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Доставка по Москве</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Привоз напитков по Москве</h1>
      <p>Сервис ориентирован на жителей столицы: от центральных районов до спальных окружений. Маршрут и время зависят от пробок, загрузки и вашего адреса — после оформления заявки оператор озвучит ориентир по минутам.</p>
      <h2>Районы и ориентиры</h2>
      <p>Подробнее по округам: <a href="/dostavka-alkogolya-cao.html">ЦАО</a>, <a href="/dostavka-arbat.html">Арбат</a>, <a href="/dostavka-alkogolya-zao.html">ЗАО</a>, <a href="/dostavka-alkogolya-sao.html">САО</a>, <a href="/dostavka-alkogolya-svao.html">СВАО</a>, <a href="/dostavka-alkogolya-yuvao.html">ЮВАО</a>, <a href="/dostavka-alkogolya-yuao.html">ЮАО</a>. Подмосковье: <a href="/dostavka-khimki.html">Химки</a>, <a href="/dostavka-mytishchi.html">Мытищи</a>, <a href="/dostavka-balashiha.html">Балашиха</a>, <a href="/dostavka-odintsovo.html">Одинцово</a>.</p>
      <h2>Сценарии заказа</h2>
      <p><strong>Дом или офис.</strong> Укажите этаж и домофон. <strong>Вечер с друзьями.</strong> Соберите корзину заранее и отправьте форму — так проще согласовать время. <strong>Срочно.</strong> Позвоните по ${PHONE_FORMATTED} и продублируйте состав в Telegram.</p>
      <h2>Вечер и ночь</h2>
      <p>Заявки принимаем без выходных. Ночью время в пути может отличаться из‑за трафика и загрузки — оператор честно проговорит ожидание до подтверждения.</p>
      <p><a class="chip" href="/catalog.html">Каталог</a> <a class="chip" href="/oplata-i-dostavka.html">Оплата</a> <a class="chip" href="/kontakty.html">Связь</a></p>
    </article>
    <section class="faq"><h2>Вопросы о доставке по Москве</h2>${moskvaFaqPairs
      .map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`)
      .join("")}</section>`;

  const pageKontakty = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Контакты</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Контакты</h1>
      <h2>Как с нами связаться</h2>
      <p><strong>Телефон:</strong> <a href="tel:${PHONE_RAW}">${PHONE_FORMATTED}</a> — для срочных вопросов и уточнения заказа.</p>
      <p><strong>Telegram:</strong> <a href="${TELEGRAM_LINK}" target="_blank" rel="noopener">написать в бот / чат</a> — удобно отправить состав корзины, адрес и время.</p>
      <h2>График</h2>
      <p>Приём обращений по телефону и в мессенджере — круглосуточно. Если линия занята, напишите в Telegram: так часто быстрее получить ответ при пиковой загрузке.</p>
      <h2>Как быстрее получить ответ</h2>
      <p>Сразу укажите район, желаемое время и список позиций из каталога — оператору проще ответить без уточняющих сообщений. При проблемах с сайтом приложите скрин или опишите, на каком шаге возникла ошибка.</p>
      <p><a class="chip" href="/catalog.html">Каталог</a> <a class="chip" href="/oplata-i-dostavka.html">Условия</a></p>
    </article>`;

  const page24 = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Приём без выходных</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Приём заказов в любое время</h1>
      <p>Заявки можно оставить в любое время суток: каталог и корзина доступны без выходных. Оператор подключается по очереди — в часы пик ответ может занять чуть больше времени.</p>
      <h2>Как не терять время ночью</h2>
      <p>Сформируйте корзину на сайте и отправьте форму с полным адресом. Дублируйте сообщение в Telegram — так проще согласовать маршрут, если голосовая линия занята.</p>
      <h2>Важно помнить</h2>
      <p>Алкоголь получает только совершеннолетний. Шум в жилых домах регулируется правилами проживания — уважайте соседей.</p>
      <p><a class="chip" href="/catalog.html">В каталог</a> <a class="chip" href="/dostavka-alkogolya-moskva.html">По Москве</a></p>
    </article>`;

  const pageNaDom = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Привоз на дом</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Напитки с привозом на дом</h1>
      <p>Закажите напитки без поездки в магазин: выберите позиции онлайн, укажите адрес и время передачи. Удобно для домашних встреч, когда хочется сфокусироваться на гостях, а не на дороге.</p>
      <h2>Что учесть в заказе</h2>
      <p>Проверьте состав корзины до отправки: объём и количество бутылок, необходимость воды или безалкогольных напитков к столу. В комментарии можно указать пожелания по звонку перед приездом.</p>
      <h2>Получение</h2>
      <p>При вручении заказа держите телефон включённым — курьер может уточнить подъезд. Документ для проверки возраста держите под рукой.</p>
      <p><a class="chip" href="/catalog.html">Смотреть каталог</a></p>
    </article>`;

  const pageMo = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Доставка по МО</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Привоз в Подмосковье</h1>
      <p>В ближнем Подмосковье доставка возможна не во все адреса и не всегда в те же сроки, что по Москве внутри МКАД. Напишите населённый пункт, желаемое время и состав заказа — оператор ответит по доступности.</p>
      <h2>Как ускорить согласование</h2>
      <p>Укажите ориентир: город, район, шоссе, удалённость от МКАД. Если нужен заказ к определённому часу, сообщите заранее — так проще встроить маршрут.</p>
      <p>Города: <a href="/dostavka-khimki.html">Химки</a>, <a href="/dostavka-mytishchi.html">Мытищи</a>, <a href="/dostavka-balashiha.html">Балашиха</a>, <a href="/dostavka-odintsovo.html">Одинцово</a>, <a href="/dostavka-krasnogorsk.html">Красногорск</a>, <a href="/dostavka-lyubertsy.html">Люберцы</a>.</p>
      <p><a class="chip" href="/kontakty.html">Связаться</a> <a class="chip" href="/catalog.html">Каталог</a></p>
    </article>`;

  const pagePrivacy = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Политика конфиденциальности</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Политика конфиденциальности</h1>
      <p>Мы обрабатываем только те данные, которые вы указываете при заказе: имя, телефон, адрес и комментарий. Они нужны для связи с вами и передачи заказа курьеру.</p>
      <p>Данные не используются для рассылок без вашего согласия. Передача третьим лицам возможна только в объёме, необходимом для выполнения заказа (например, курьерской службе) или по требованию закона.</p>
      <p>Используя сайт и форму заказа, вы подтверждаете ознакомление с этой политикой. Актуальная версия размещена по адресу ${DOMAIN}/privacy.html.</p>
    </article>`;

  const pageTerms = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Условия использования</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Условия использования сайта</h1>
      <p>Сайт предназначен для лиц старше 18 лет. Информация о товарах и ценах носит справочный характер; актуальность наличия и стоимости подтверждается при оформлении заказа.</p>
      <p>Пользователь несёт ответственность за достоверность указанных контактов и адреса. Сервис вправе отказать в передаче заказа при отсутствии подтверждения возраста или при нарушении правил передачи алкоголя.</p>
    </article>`;

  const pageAge = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Ограничение 18+</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Возрастное ограничение 18+</h1>
      <p>Продажа и доставка алкоголя осуществляются только совершеннолетним гражданам в соответствии с законодательством РФ. Заказы от лиц младше 18 лет не принимаются.</p>
      <p>При получении заказа может потребоваться документ, удостоверяющий возраст. Без подтверждения совершеннолетия алкогольная продукция не передаётся, средства возвращаются по правилам согласования с оператором.</p>
      <p>Чрезмерное употребление алкоголя вредит здоровью.</p>
    </article>`;

  const pageDeliveryPol = `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Политика доставки</span></nav>
    <article class="extra prose-section"><h1 class="page-h1">Политика доставки</h1>
      <p>Доставка выполняется по согласованному адресу и временному интервалу. Точное время зависит от маршрута, погоды и загрузки — оператор сообщает ориентир при подтверждении.</p>
      <p>Если получатель недоступен по телефону или не может принять заказ в оговорённый период, возможна пересогласовка. Повторная попытка или отмена решаются с оператором индивидуально.</p>
      <p>Зона доставки — Москва и часть Московской области по предварительному согласованию.</p>
    </article>`;

  fs.writeFileSync(
    path.join(ROOT, "oplata-i-dostavka.html"),
    pageTemplate({
      title: `Оплата и доставка — условия | ${BRAND}`,
      description:
        "Как оплатить, получить заказ и подтвердить возраст 18+. Сроки обработки заявок по Москве и области.",
      canonical: `${DOMAIN}/oplata-i-dostavka.html`,
      content: pageOplata,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Оплата и доставка", url: `${DOMAIN}/oplata-i-dostavka.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "dostavka-alkogolya-moskva.html"),
    pageTemplate({
      title: `Привоз по Москве — районы и сроки | ${BRAND}`,
      description:
        "Как заказать напитки по округам Москвы: адрес, время курьера, ночные заявки. Каталог и Telegram.",
      canonical: `${DOMAIN}/dostavka-alkogolya-moskva.html`,
      content: pageMoskva,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Доставка по Москве", url: `${DOMAIN}/dostavka-alkogolya-moskva.html` }
        ]),
        faqPageFromPairs(moskvaFaqPairs)
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "kontakty.html"),
    pageTemplate({
      title: `Контакты — телефон и Telegram | ${BRAND}`,
      description: `Телефон ${PHONE_FORMATTED}, Telegram. Как быстрее получить ответ оператора.`,
      canonical: `${DOMAIN}/kontakty.html`,
      content: pageKontakty,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Контакты", url: `${DOMAIN}/kontakty.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "dostavka-alkogolya-24.html"),
    pageTemplate({
      title: `Заказ напитков ночью | ${BRAND}`,
      description: "Приём заявок без выходных: каталог, корзина, Telegram. Время привоза согласуем после адреса.",
      canonical: `${DOMAIN}/dostavka-alkogolya-moskva.html`,
      content: page24,
      robots: "noindex, follow",
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Приём без выходных", url: `${DOMAIN}/dostavka-alkogolya-24.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "alkogol-na-dom.html"),
    pageTemplate({
      title: `Напитки с привозом на дом | ${BRAND}`,
      description: "Заказ без поездки в магазин: каталог, корзина, привоз по Москве и области. 18+.",
      canonical: `${DOMAIN}/dostavka-alkogolya-moskva.html`,
      content: pageNaDom,
      robots: "noindex, follow",
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Привоз на дом", url: `${DOMAIN}/alkogol-na-dom.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "dostavka-alkogolya-mo.html"),
    pageTemplate({
      title: `Привоз в Подмосковье (МО) | ${BRAND}`,
      description: "Химки, Мытищи, Балашиха, Одинцово и другие города МО — уточните адрес у оператора. Каталог онлайн.",
      canonical: `${DOMAIN}/dostavka-alkogolya-mo.html`,
      content: pageMo,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Доставка по МО", url: `${DOMAIN}/dostavka-alkogolya-mo.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "privacy.html"),
    pageTemplate({
      title: `Политика конфиденциальности | ${BRAND}`,
      description: `Как обрабатываются персональные данные при заказе на сайте ${BRAND}.`,
      canonical: `${DOMAIN}/privacy.html`,
      content: pagePrivacy,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Конфиденциальность", url: `${DOMAIN}/privacy.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "terms.html"),
    pageTemplate({
      title: `Условия использования сайта | ${BRAND}`,
      description: "Правила использования сайта и оформления заказов. Ограничение 18+.",
      canonical: `${DOMAIN}/terms.html`,
      content: pageTerms,
      jsonLd: baseJsonLd([
        breadcrumbJson([{ name: "Главная", url: `${DOMAIN}/` }, { name: "Условия", url: `${DOMAIN}/terms.html` }])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "age-restriction.html"),
    pageTemplate({
      title: `Ограничение 18+ и проверка возраста | ${BRAND}`,
      description: "Продажа и доставка алкоголя только совершеннолетним. Отказ в передаче без подтверждения возраста.",
      canonical: `${DOMAIN}/age-restriction.html`,
      content: pageAge,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "18+", url: `${DOMAIN}/age-restriction.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  fs.writeFileSync(
    path.join(ROOT, "delivery-policy.html"),
    pageTemplate({
      title: `Политика доставки | ${BRAND}`,
      description: "Условия доставки по Москве и Московской области: время, зона, передача заказа.",
      canonical: `${DOMAIN}/delivery-policy.html`,
      content: pageDeliveryPol,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Политика доставки", url: `${DOMAIN}/delivery-policy.html` }
        ])
      ]),
      pageType: "static"
    })
  );

  writeDistrictPages();
  writeBlogPages();

  const categoryOptions = Object.entries(categoryMeta)
    .map(([slug, meta]) => `<option value="${slug}">${escapeHtml(meta.name)}</option>`)
    .join("");

  fs.writeFileSync(
    path.join(ROOT, "catalog.html"),
    pageTemplate({
      title: `Каталог напитков — цены и фильтр | ${BRAND}`,
      description:
        "Каталог с поиском и фильтром по разделам. Доставка по Москве и области — только совершеннолетним.",
      canonical: `${DOMAIN}/catalog.html`,
      content: `<nav class="breadcrumbs"><a href="/">Главная</a> / <span>Каталог</span></nav>
      <h1 class="page-h1">Каталог</h1>
      <p style="color:#a5adbf;margin:-8px 0 16px;font-size:.95rem;max-width:42rem">Поиск по названию и фильтр по категории. Карточки показывают объём и цену — добавляйте в корзину и отправляйте заявку.</p>
      <section class="catalog-intro"><h2 style="font-size:1.15rem;margin:0 0 12px">Категории</h2><div class="cat-desc-grid">${catDescGrid}</div></section>
      <section class="extra"><h2>Сейчас выбирают</h2><div id="popular-catalog-grid" class="grid"></div></section>
      <section class="extra" id="recent-wrap-catalog" hidden><h2>Недавно смотрели</h2><div id="recent-catalog-grid" class="grid"></div></section>
      <section class="toolbar"><input id="search" placeholder="Поиск по каталогу" aria-label="Поиск по каталогу"><select id="sort" aria-label="Сортировка по цене"><option value="">Сортировка</option><option value="asc">Цена по возрастанию</option><option value="desc">Цена по убыванию</option></select><select id="cat-filter" aria-label="Фильтр по категории"><option value="">Все категории</option>${categoryOptions}</select></section>
      <div id="product-grid" class="grid"></div>`,
      jsonLd: baseJsonLd([
        breadcrumbJson([
          { name: "Главная", url: `${DOMAIN}/` },
          { name: "Каталог", url: `${DOMAIN}/catalog.html` }
        ])
      ]),
      pageType: "catalog"
    })
  );

  products.forEach((p) => {
    const meta = categoryMeta[p.category] || { name: "Категория", type: "товар" };
    const desc = productDescription(p);
    const brandName = extractProductBrand(p.name);
    const volStr = /(\d+[.,]?\d*)\s*(л|литра|литр)/i.exec(p.name)?.[0] || "уточняется в названии";
    const imgAltMain = [meta.name, brandName || null, volStr].filter(Boolean).join(", ");
    const mainPic = imgPictureTag(
      p.image,
      imgAltMain,
      `class="product-photo" loading="eager" fetchpriority="high" width="420" height="420"`
    );
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      image: `${DOMAIN}${p.image}`,
      description: desc,
      category: meta.name,
      offers: {
        "@type": "Offer",
        priceCurrency: "RUB",
        price: p.price,
        availability: p.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        url: `${DOMAIN}/products/product-${p.id}.html`
      }
    };
    if (brandName && brandName.length >= 2) {
      productSchema.brand = { "@type": "Brand", name: brandName };
    }
    const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    const content = `<nav class="breadcrumbs"><a href="/">Главная</a> / <a href="/${p.category}.html">${escapeHtml(meta.name)}</a> / <span>${escapeHtml(p.name)}</span></nav>
      <article class="extra product-detail">
      <h1 class="product-h1">${escapeHtml(p.name)}</h1>
      <p class="card-cat" style="margin-top:-6px">${escapeHtml(meta.name)}</p>
      ${mainPic}
      <p class="price">${p.price} ₽</p>
      <p class="stock ${p.inStock === false ? "out" : ""}">${p.inStock === false ? "Нет в наличии" : "В наличии"}</p>
      ${p.inStock === false ? "" : `<button type="button" class="add-to-cart" data-id="${p.id}">В корзину</button>`}
      <h2>Описание</h2><p>${escapeHtml(desc)}</p>
      <h2>Характеристики</h2><ul><li>Категория: ${escapeHtml(meta.name)}</li>${brandName ? `<li>Бренд: ${escapeHtml(brandName)}</li>` : ""}<li>Тип: ${escapeHtml(meta.type)}</li><li>Объём: ${escapeHtml(volStr)}</li></ul>
      </article>
      <section class="extra"><h2>Похожие товары</h2><div id="related-products" class="grid">${related
        .map((r) => {
          const rMeta = categoryMeta[r.category] || { name: "" };
          const rBrand = extractProductBrand(r.name);
          const rAlt = [rMeta.name, rBrand || null].filter(Boolean).join(", ") || r.name;
          const rImg = imgPictureTag(r.image, rAlt, `loading="lazy" decoding="async"`);
          return `<article class="card"><a href="/products/product-${r.id}.html">${rImg}</a><p class="card-cat">${escapeHtml(rMeta.name)}</p>${rBrand ? `<p class="card-brand">${escapeHtml(rBrand)}</p>` : ""}<h3><a href="/products/product-${r.id}.html">${escapeHtml(r.name)}</a></h3><p class="card-vol">${escapeHtml(/(\d+[.,]?\d*)\s*(л|литра|литр)/i.exec(r.name)?.[0] || "—")}</p><p class="price">${r.price} ₽</p><a class="chip" href="/products/product-${r.id}.html">К карточке</a></article>`;
        })
        .join("")}</div><p><a class="chip" href="/${p.category}.html">Все товары категории «${escapeHtml(meta.name)}»</a></p></section>`;
    const ld = baseJsonLd([
      breadcrumbJson([
        { name: "Главная", url: `${DOMAIN}/` },
        { name: meta.name, url: `${DOMAIN}/${p.category}.html` },
        { name: p.name, url: `${DOMAIN}/products/product-${p.id}.html` }
      ]),
      productSchema
    ]);
    fs.writeFileSync(
      path.join(ROOT, "products", `product-${p.id}.html`),
      pageTemplate({
        title: `${p.name} — ${p.price} ₽ · ${BRAND}`.slice(0, 65),
        description: `${meta.name}, ${p.price} ₽. Оформление за пару минут в каталоге, по телефону или в Telegram. Доставка по Москве и МО — только 18+.`.slice(0, 158),
        canonical: `${DOMAIN}/products/product-${p.id}.html`,
        content,
        jsonLd: ld,
        pageType: "product",
        pageProduct: String(p.id)
      })
    );
  });
}

function writeInfra(products) {
  const urls = [
    `${DOMAIN}/`,
    ...Object.keys(categoryMeta).map((c) => `${DOMAIN}/${c}.html`),
    ...STATIC_SEO_FILES.map((f) => `${DOMAIN}/${f}`),
    ...DISTRICT_FILES.map((f) => `${DOMAIN}/${f}`),
    ...LEGAL_FILES.map((f) => `${DOMAIN}/${f}`),
    `${DOMAIN}/catalog.html`,
    `${DOMAIN}/blog/`,
    ...blogPosts.map((p) => `${DOMAIN}/blog/${p.slug}.html`),
    ...products.map((p) => `${DOMAIN}/products/product-${p.id}.html`)
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join("")}</urlset>`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml\nHost: alkodostavka24.vercel.app\n`);
  fs.writeFileSync(path.join(ROOT, "manifest.json"), JSON.stringify({
    name: "ALKODOSTAVKA",
    short_name: "ALKODOSTAVKA",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    icons: []
  }, null, 2));
}

function writeApi() {
  const apiCode = `export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ success: false, error: "Telegram env vars are not configured" });
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ success: false, error: "Message is required" });
  try {
    const resp = await fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) return res.status(502).json({ success: false, error: data.description || "Telegram API error" });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}`;
  fs.writeFileSync(path.join(ROOT, "api", "send-telegram.js"), apiCode);
}

async function ensureWebpImages(products) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("sharp не установлен — WebP не созданы, используйте: npm install sharp");
    return;
  }
  const photoDir = path.join(ROOT, "photo");
  const ids = new Set([
    ...products.map((p) => p.id),
    ...homeFeaturedWhisky.map((c) => c.id)
  ]);
  for (const id of ids) {
    const jpg = path.join(photoDir, `${id}.jpg`);
    const webp = path.join(photoDir, `${id}.webp`);
    if (!fs.existsSync(jpg)) continue;
    try {
      const jpgStat = fs.statSync(jpg);
      if (!fs.existsSync(webp) || fs.statSync(webp).mtimeMs < jpgStat.mtimeMs) {
        await sharp(jpg).webp({ quality: 82 }).toFile(webp);
      }
    } catch (err) {
      console.warn(`WebP ${id}:`, err.message);
    }
  }
}

async function main() {
  ensureDirs();
  const products = extractProducts();
  await ensureWebpImages(products);
  writeAssets(products);
  createPages(products);
  writeInfra(products);
  writeApi();
}

main();
