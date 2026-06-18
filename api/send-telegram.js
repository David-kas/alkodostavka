import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadTelegramConfig() {
  let token = process.env.TELEGRAM_BOT_TOKEN || "";
  let chatId = process.env.TELEGRAM_CHAT_ID || "";

  if (token && chatId) {
    return { token, chatId };
  }

  try {
    const configPath = join(process.cwd(), "config", "telegram.json");
    const raw = readFileSync(configPath, "utf8");
    const json = JSON.parse(raw);
    token = token || String(json.TELEGRAM_BOT_TOKEN || "");
    chatId = chatId || String(json.TELEGRAM_CHAT_ID || "");
  } catch {
    // config file is optional when env vars are set
  }

  return { token, chatId };
}

function buildMessage(body) {
  if (body?.message) {
    return String(body.message).trim();
  }

  const { name, phone, comment, source = "Сайт" } = body || {};
  if (!name || !phone) {
    return "";
  }

  return (
    `Новая заявка с сайта АлкоДоставка 24\n\n` +
    `Имя: ${name}\n` +
    `Телефон: ${phone}\n` +
    `Комментарий: ${comment || "—"}\n` +
    `Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}\n` +
    `Источник: ${source}`
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { token, chatId } = loadTelegramConfig();
  if (!token || !chatId) {
    return res.status(500).json({
      success: false,
      error: "Не настроены TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return res.status(400).json({ success: false, error: "Некорректный JSON" });
    }
  }

  const message = buildMessage(body);
  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      return res.status(502).json({
        success: false,
        error: data.description || "Telegram API error",
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
