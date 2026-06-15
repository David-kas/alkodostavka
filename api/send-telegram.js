import { sendTelegramMessage } from '../telegram/send.js';

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

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const result = await sendTelegramMessage(message);

  if (result.ok) {
    return res.status(200).json({ success: true });
  }

  return res.status(500).json({
    success: false,
    error: result.error || 'Telegram error',
  });
}
