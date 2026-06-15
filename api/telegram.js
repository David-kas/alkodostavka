import { sendTelegramMessage } from '../telegram/send.js';

function sanitizeForTelegram(text) {
  if (text == null || text === '') return '—';
  return String(text).replace(/[\u0000-\u001F\\]/g, ' ').slice(0, 2000);
}

function parseBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body || '{}');
    } catch {
      return null;
    }
  }
  return body || {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req.body);
  if (!body) {
    return res.status(400).json({ error: 'Некорректный JSON' });
  }

  const { name, phone, comment, source = 'Сайт' } = body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Имя и телефон обязательны' });
  }

  const safeName = sanitizeForTelegram(name);
  const safePhone = sanitizeForTelegram(phone);
  const safeComment = sanitizeForTelegram(comment);
  const safeSource = sanitizeForTelegram(source);

  const message =
    `Новая заявка с сайта АлкоДоставка 24\n\n` +
    `Имя: ${safeName}\n` +
    `Телефон: ${safePhone}\n` +
    `Комментарий: ${safeComment}\n` +
    `Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}\n` +
    `Источник: ${safeSource}`;

  const result = await sendTelegramMessage(message);

  if (result.ok) {
    return res.status(200).json({ success: true });
  }

  const status = result.error?.includes('не настроен') ? 500 : 500;
  return res.status(status).json({ error: result.error || 'Telegram API error' });
}
