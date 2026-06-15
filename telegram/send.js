// Централизованные настройки Telegram (используются серверными API-роутами Vercel).
// Приоритет: process.env → значения ниже.

export const BOT_TOKEN = '8427344243:AAFiXfheHb9HmRa2K5MwJR4o7fjXzGRIPa4';
export const CHAT_ID = '562345561';

export function getTelegramCredentials() {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.CHAT_ID ||
    CHAT_ID;

  console.log('BOT TOKEN:', token ? 'FOUND' : 'NOT FOUND');
  console.log('CHAT ID:', chatId ? 'FOUND' : 'NOT FOUND');

  return { token, chatId };
}

export async function sendTelegramMessage(text, options = {}) {
  const { token, chatId } = getTelegramCredentials();

  if (!token || !chatId) {
    return {
      ok: false,
      error: 'Сервер не настроен. Задайте BOT_TOKEN и CHAT_ID',
    };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: String(text),
    disable_web_page_preview: true,
  };

  if (options.parseMode) {
    payload.parse_mode = options.parseMode;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      return { ok: true, data };
    }

    console.error('Telegram API error:', data);
    return {
      ok: false,
      error: data.description || 'Telegram API error',
    };
  } catch (error) {
    console.error('Telegram send error:', error);
    return {
      ok: false,
      error: error.message || 'Network error',
    };
  }
}
