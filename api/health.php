<?php
/**
 * Health Check Endpoint for ALB
 * Returns 200 if system is healthy, 503 if not
 */

header('Content-Type: application/json');

$health = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'php_version' => PHP_VERSION,
    'services' => []
];

// Check AWS SDK
if (file_exists('/var/www/vendor_global/vendor/autoload.php')) {
    $health['services']['aws_sdk'] = 'ok';
} else {
    $health['services']['aws_sdk'] = 'missing';
    $health['status'] = 'unhealthy';
}

// Check logs directory is writable
if (is_writable(__DIR__ . '/logs')) {
    $health['services']['logs'] = 'ok';
} else {
    $health['services']['logs'] = 'not_writable';
}

// Check config file exists
if (file_exists(__DIR__ . '/../config/config.php')) {
    $health['services']['config'] = 'ok';
} else {
    $health['services']['config'] = 'missing';
    $health['status'] = 'unhealthy';
}

// Return appropriate status code
http_response_code($health['status'] === 'healthy' ? 200 : 503);
echo json_encode($health, JSON_PRETTY_PRINT);
