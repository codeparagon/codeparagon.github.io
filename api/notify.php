<?php
/**
 * Gmail SMTP notifier for the proposal page.
 * Password stays on the server. Do not put smtp-config.php in a public repo.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configFile = __DIR__ . '/smtp-config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'SMTP is not configured'));
    exit;
}

$SMTP = require $configFile;

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data) || !$data) {
    $data = $_GET;
}

$key = isset($data['key']) ? (string) $data['key'] : '';
$event = isset($data['event']) ? strtolower((string) $data['event']) : '';
$title = isset($data['title']) ? (string) $data['title'] : 'Proposal update';
$message = isset($data['message']) ? (string) $data['message'] : $event;

if ($key !== $SMTP['access_key'] || !in_array($event, array('yes', 'no'), true)) {
    http_response_code(403);
    echo json_encode(array('ok' => false));
    exit;
}

$when = date('d M Y, h:i A');
$subject = $title;
$body = $message . "\n\nTime: " . $when . "\nEvent: " . $event;

try {
    smtp_send($SMTP, $SMTP['to'], $subject, $body);
    echo json_encode(array('ok' => true));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'send failed'));
}

function smtp_send($SMTP, $to, $subject, $body)
{
    $errno = 0;
    $errstr = '';
    $fp = stream_socket_client(
        'tcp://smtp.gmail.com:587',
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT
    );
    if (!$fp) {
        throw new Exception('connect failed');
    }

    smtp_expect($fp, 220);
    smtp_cmd($fp, 'EHLO localhost', 250);
    smtp_cmd($fp, 'STARTTLS', 220);
    if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new Exception('tls failed');
    }
    smtp_cmd($fp, 'EHLO localhost', 250);
    smtp_cmd($fp, 'AUTH LOGIN', 334);
    smtp_cmd($fp, base64_encode($SMTP['user']), 334);
    smtp_cmd($fp, base64_encode($SMTP['pass']), 235);
    smtp_cmd($fp, 'MAIL FROM:<' . $SMTP['user'] . '>', 250);
    smtp_cmd($fp, 'RCPT TO:<' . $to . '>', 250);
    smtp_cmd($fp, 'DATA', 354);

    $headers = 'From: ' . $SMTP['user'] . "\r\n";
    $headers .= 'To: ' . $to . "\r\n";
    $headers .= 'Subject: ' . $subject . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $payload = $headers . "\r\n" . $body . "\r\n.";
    smtp_cmd($fp, $payload, 250);
    smtp_cmd($fp, 'QUIT', 221);
    fclose($fp);
}

function smtp_cmd($fp, $line, $expect)
{
    fwrite($fp, $line . "\r\n");
    smtp_expect($fp, $expect);
}

function smtp_expect($fp, $code)
{
    $reply = '';
    while (!feof($fp)) {
        $line = fgets($fp, 512);
        if ($line === false) {
            break;
        }
        $reply .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    if (strpos($reply, (string) $code) !== 0) {
        throw new Exception('smtp ' . $code . ' missing');
    }
}
