<?php
/**
 * Contact form API — JSON in/out, validation, honeypot, log + optional mail
 *
 * Setup (optional): copy config.example.php to config.local.php and set CONTACT_TO_EMAIL
 * Messages are always appended to data/contact_log.jsonl (ensure data/ is writable)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

$name = isset($data['name']) ? trim((string) $data['name']) : '';
$email = isset($data['email']) ? trim((string) $data['email']) : '';
$message = isset($data['message']) ? trim((string) $data['message']) : '';

if ($name === '' || strlen($name) > 120) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid name.']);
    exit;
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

if ($message === '' || strlen($message) < 10 || strlen($message) > 8000) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Message should be between 10 and 8000 characters.']);
    exit;
}

$toEmail = '';
$configPath = __DIR__ . '/config.local.php';
if (is_file($configPath)) {
    $cfg = require $configPath;
    if (is_array($cfg) && !empty($cfg['CONTACT_TO_EMAIL'])) {
        $toEmail = (string) $cfg['CONTACT_TO_EMAIL'];
    }
}

$logDir = dirname(__DIR__) . '/data';
$logFile = $logDir . '/contact_log.jsonl';

if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}

$entry = [
    'ts' => gmdate('c'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'name' => $name,
    'email' => $email,
    'message' => $message,
];

$line = json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n";
$written = @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);

if ($written === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server could not store message. Please email directly.',
    ]);
    exit;
}

$mailOk = false;
if ($toEmail !== '') {
    $subject = '[Portfolio] Message from ' . $name;
    $body = "Name: {$name}\nEmail: {$email}\n\n" . $message . "\n";
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/plain; charset=utf-8',
        'From: Portfolio <noreply@localhost>',
        'Reply-To: ' . $email,
    ];
    $mailOk = @mail($toEmail, $subject, $body, implode("\r\n", $headers));
}

echo json_encode([
    'success' => true,
    'message' => $mailOk
        ? 'Message sent successfully.'
        : 'Message received. I will reply soon.',
]);
