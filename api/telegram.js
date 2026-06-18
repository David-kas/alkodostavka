import {
  buildOrderMessage,
  getTelegramCredentials,
  sendTelegramMessage,
} from '../telegram/send.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { token, chatId } = getTelegramCredentials();
    return res.status(200).json({
      ok: Boolean(token && chatId),
      configured: Boolean(token && chatId),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'Некорректный JSON', code: 'INVALID_JSON' });
    }
  }

  const { name, phone, comment, source = 'Сайт', orderType = 'Заявка', pageUrl } = body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Имя и телефон обязательны', code: 'VALIDATION' });
  }

  const result = await sendTelegramMessage(
    buildOrderMessage({
      name,
      phone,
      comment,
      source,
      orderType,
      pageUrl: pageUrl || req.headers.referer || '',
    }),
  );

  if (result.ok) {
    return res.status(200).json({ success: true });
  }

  const status = result.code === 'TELEGRAM_NOT_CONFIGURED' ? 503 : 502;
  return res.status(status).json({
    error: result.error,
    code: result.code || 'TELEGRAM_ERROR',
  });
}
