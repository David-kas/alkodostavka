import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'telegram.json');

let fileConfig = {};
try {
  fileConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch {
  fileConfig = {};
}

export const BOT_TOKEN = fileConfig.TELEGRAM_BOT_TOKEN || '';
export const CHAT_ID = fileConfig.TELEGRAM_CHAT_ID || '';

export function getTelegramCredentials() {
  const token =
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    process.env.BOT_TOKEN?.trim() ||
    fileConfig.TELEGRAM_BOT_TOKEN ||
    BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID?.trim() ||
    process.env.CHAT_ID?.trim() ||
    fileConfig.TELEGRAM_CHAT_ID ||
    CHAT_ID;

  return { token: token || '', chatId: chatId || '' };
}

function sanitizeForTelegram(text) {
  if (text == null || text === '') return '—';
  return String(text).replace(/[\u0000-\u001F\\]/g, ' ').slice(0, 2000);
}

export function buildOrderMessage({ name, phone, comment, source, orderType, pageUrl }) {
  const safeName = sanitizeForTelegram(name);
  const safePhone = sanitizeForTelegram(phone);
  const safeComment = sanitizeForTelegram(comment);
  const safeSource = sanitizeForTelegram(source);
  const safeType = sanitizeForTelegram(orderType || 'Заявка');
  const safePage = sanitizeForTelegram(pageUrl);

  let message =
    `📩 ${safeType} — АЛКОдоставка\n\n` +
    `👤 Имя: ${safeName}\n` +
    `📞 Телефон: ${safePhone}\n` +
    `💬 Комментарий: ${safeComment}\n` +
    `🕐 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}\n` +
    `📍 Источник: ${safeSource}`;

  if (pageUrl) {
    message += `\nСтраница: ${safePage}`;
  }

  return message;
}

export async function sendTelegramMessage(text) {
  const { token, chatId } = getTelegramCredentials();

  if (!token || !chatId) {
    return {
      ok: false,
      error: 'Telegram не настроен: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID',
      code: 'TELEGRAM_NOT_CONFIGURED',
    };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const data = await response.json();
  if (data.ok) {
    return { ok: true };
  }
  return { ok: false, error: data.description || 'Telegram API error', code: 'TELEGRAM_API' };
}
