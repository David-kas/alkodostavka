/**
 * Хранилище каталога: data/catalog.json + пересборка catalog.html
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
export const CATALOG_JSON = path.join(ROOT, 'data', 'catalog.json');
export const CATALOG_HTML = path.join(ROOT, 'catalog.html');
export const IMAGES_DIR = path.join(ROOT, 'images');

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

export function verifyAdminToken(authHeader) {
  const password = getAdminPassword();
  if (!password) return { ok: false, code: 'ADMIN_NOT_CONFIGURED' };
  const token = String(authHeader || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token !== password) return { ok: false, code: 'UNAUTHORIZED' };
  return { ok: true };
}

export function makeProductId(name) {
  const base = String(name || 'product')
    .toLowerCase()
    .replace(/[«»"']/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const hash = crypto.createHash('md5').update(String(name)).digest('hex').slice(0, 6);
  return `${base}-${hash}`;
}

export function readCatalog() {
  if (!fs.existsSync(CATALOG_JSON)) {
    return { version: 1, updatedAt: new Date().toISOString(), products: [] };
  }
  const data = JSON.parse(fs.readFileSync(CATALOG_JSON, 'utf8'));
  if (!Array.isArray(data.products)) data.products = [];
  return data;
}

export function writeCatalog(data) {
  fs.mkdirSync(path.dirname(CATALOG_JSON), { recursive: true });
  data.updatedAt = new Date().toISOString();
  data.version = (data.version || 0) + 1;
  fs.writeFileSync(CATALOG_JSON, JSON.stringify(data, null, 2), 'utf8');
  renderCatalogHtml(data.products);
  return data;
}

export function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('ru-RU') + ' ₽';
}

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function productCardHtml(p) {
  const inStock = p.inStock !== false;
  const stockClass = inStock ? '' : ' product-card--out-of-stock';
  const stockAttr = inStock ? 'true' : 'false';
  const overlay = inStock ? '' : '\n                        <span class="product-stock-overlay" aria-hidden="true">Нет в наличии</span>';
  const imgSrc = escapeHtml(p.image || 'images/placeholder.jpg');
  const alt = escapeHtml(p.alt || p.name);
  const name = escapeHtml(p.name);
  const desc = escapeHtml(p.desc || 'Доставка по Москве 24/7.');
  const price = formatPrice(p.price);
  const cat = escapeHtml(p.category || 'strong');
  const id = escapeHtml(p.id || makeProductId(p.name));

  return `                <div class="product-card${stockClass}" data-category="${cat}" data-product-id="${id}" data-in-stock="${stockAttr}">
                    <div class="product-image image-wrap" data-watermark>
                        <img loading="lazy" decoding="async" src="${imgSrc}" alt="${alt}">${overlay}
                    </div>
                    <h3>${name}</h3>
                    <p class="product-desc">${desc}</p>
                    <span class="product-price">${price}</span>
                </div>`;
}

export function renderCatalogHtml(products) {
  if (!fs.existsSync(CATALOG_HTML)) return;
  let html = fs.readFileSync(CATALOG_HTML, 'utf8');
  const gridOpen = '<div class="catalog-grid">';
  const start = html.indexOf(gridOpen);
  if (start === -1) return;

  const gridStart = start + gridOpen.length;
  const gridEnd = html.indexOf('\n            </div>\n\n            <!-- SEO-текст каталога', gridStart);
  if (gridEnd === -1) {
    const alt = html.indexOf('<!-- SEO-текст каталога', gridStart);
    if (alt === -1) return;
    const closeDiv = html.lastIndexOf('</div>', alt);
    if (closeDiv <= gridStart) return;
    const cards = products.map(productCardHtml).join('\n');
    html = html.slice(0, gridStart) + '\n' + cards + '\n            ' + html.slice(closeDiv);
    fs.writeFileSync(CATALOG_HTML, html, 'utf8');
    return;
  }

  const cards = products.map(productCardHtml).join('\n');
  html = html.slice(0, gridStart) + '\n' + cards + html.slice(gridEnd);
  fs.writeFileSync(CATALOG_HTML, html, 'utf8');
}

export function parseProductsFromHtml(html) {
  const products = [];
  const re =
    /<div class="product-card([^"]*)"[^>]*data-category="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="product-card"|<\/div>\s*\n\s*<\/div>\s*\n\s*<!-- SEO)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const extraClass = m[1];
    const category = m[2];
    const block = m[3];
    const h3 = block.match(/<h3>([^<]+)<\/h3>/);
    const price = block.match(/class="product-price"[^>]*>([^<]+)</);
    const img = block.match(/src="([^"]+)"/);
    const alt = block.match(/alt="([^"]*)"/);
    const desc = block.match(/class="product-desc"[^>]*>([^<]*)</);
    if (!h3 || !price) continue;
    const name = h3[1].trim();
    const priceNum = parseInt(String(price[1]).replace(/\D/g, ''), 10) || 0;
    const inStock = !extraClass.includes('out-of-stock') && !block.includes('product-stock-overlay');
    products.push({
      id: makeProductId(name),
      name,
      category,
      price: priceNum,
      image: img ? img[1] : '',
      alt: alt ? alt[1] : name,
      desc: desc ? desc[1].trim() : '',
      inStock,
    });
  }
  return products;
}
