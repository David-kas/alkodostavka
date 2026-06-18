<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '{}', true);
if (!is_array($payload)) {
    $payload = [];
}

$message = isset($payload['message']) ? trim((string)$payload['message']) : '';

if ($message === '' && !empty($payload['name']) && !empty($payload['phone'])) {
    $name = trim((string)$payload['name']);
    $phone = trim((string)$payload['phone']);
    $comment = isset($payload['comment']) ? trim((string)$payload['comment']) : '';
    $source = isset($payload['source']) ? trim((string)$payload['source']) : 'Сайт';
    $message =
        "Новая заявка с сайта АлкоДоставка 24\n\n" .
        "Имя: {$name}\n" .
        "Телефон: {$phone}\n" .
        "Комментарий: " . ($comment !== '' ? $comment : '—') . "\n" .
        'Время: ' . date('d.m.Y H:i') . "\n" .
        "Источник: {$source}";
}

if ($message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Message is required'], JSON_UNESCAPED_UNICODE);
    exit;
}

[$token, $chatId] = loadTelegramConfig();

if ($token === '' || $chatId === '') {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Не настроены TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$telegramUrl = 'https://api.telegram.org/bot' . $token . '/sendMessage';
$telegramPayload = json_encode(
    [
        'chat_id' => $chatId,
        'text' => $message,
        'disable_web_page_preview' => true,
    ],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);

$ch = curl_init($telegramUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $telegramPayload,
    CURLOPT_TIMEOUT => 15,
]);

$telegramResponse = curl_exec($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($telegramResponse === false || $curlError !== '') {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Telegram request failed: ' . $curlError], JSON_UNESCAPED_UNICODE);
    exit;
}

$decoded = json_decode($telegramResponse, true);
if ($httpCode < 200 || $httpCode >= 300 || !is_array($decoded) || empty($decoded['ok'])) {
    $description = is_array($decoded) && isset($decoded['description']) ? (string)$decoded['description'] : 'Telegram API error';
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => $description], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);

function loadTelegramConfig(): array
{
    $token = trim((string)(getenv('TELEGRAM_BOT_TOKEN') ?: ''));
    $chatId = trim((string)(getenv('TELEGRAM_CHAT_ID') ?: ''));

    if ($token !== '' && $chatId !== '') {
        return [$token, $chatId];
    }

    $envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';
    if (is_file($envPath) && is_readable($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines !== false) {
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                $parts = explode('=', $line, 2);
                if (count($parts) !== 2) {
                    continue;
                }
                $key = trim($parts[0]);
                $value = trim($parts[1], " \t\n\r\0\x0B\"'");
                if ($key === 'TELEGRAM_BOT_TOKEN' && $token === '') {
                    $token = $value;
                }
                if ($key === 'TELEGRAM_CHAT_ID' && $chatId === '') {
                    $chatId = $value;
                }
            }
        }
    }

    if ($token !== '' && $chatId !== '') {
        return [$token, $chatId];
    }

    $jsonPath = __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'telegram.json';
    if (is_file($jsonPath) && is_readable($jsonPath)) {
        $json = json_decode((string)file_get_contents($jsonPath), true);
        if (is_array($json)) {
            if ($token === '' && !empty($json['TELEGRAM_BOT_TOKEN'])) {
                $token = trim((string)$json['TELEGRAM_BOT_TOKEN']);
            }
            if ($chatId === '' && !empty($json['TELEGRAM_CHAT_ID'])) {
                $chatId = trim((string)$json['TELEGRAM_CHAT_ID']);
            }
        }
    }

    return [$token, $chatId];
}
