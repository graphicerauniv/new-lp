<?php
/**
 * Verify OTP API Endpoint
 * POST /api/verify-otp.php
 */

define('GEU_LP_SYSTEM', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/helpers/DynamoDBHelper.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Update with your domain in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

// Start session
session_start();

try {
    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid request data');
    }
    
    // Validate inputs
    $mobile = $input['mobile'] ?? '';
    $otp = $input['otp'] ?? '';
    
    if (empty($mobile) || empty($otp)) {
        throw new Exception('Mobile number and OTP are required');
    }
    
    // Validate mobile format
    if (!preg_match('/^[6-9]\d{9}$/', $mobile)) {
        throw new Exception('Invalid mobile number format');
    }
    
    // Validate OTP format
    $expectedLength = OTP_LENGTH;
    if (!preg_match("/^\d{{$expectedLength}}$/", $otp)) {
        throw new Exception("OTP must be {$expectedLength} digits");
    }
    
    // Check session mobile
    if (!isset($_SESSION['otp_mobile']) || $_SESSION['otp_mobile'] !== $mobile) {
        throw new Exception('Invalid session');
    }
    
    // Initialize database helper
    $db = new DynamoDBHelper();
    
    // Verify OTP
    $verifyResult = $db->verifyOTP($mobile, $otp);
    
    if (!$verifyResult['success']) {
        $messages = getConfig('api_messages');
        
        $errorMessages = [
            'no_otp_found' => 'No OTP found for this number',
            'already_verified' => 'This OTP has already been used',
            'expired' => $messages['otp_expired'],
            'max_attempts' => $messages['otp_max_attempts'],
            'invalid_otp' => $messages['otp_invalid']
        ];
        
        $error = $verifyResult['error'];
        $message = $errorMessages[$error] ?? 'Verification failed';
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $error,
            'message' => $message,
            'remaining_attempts' => $verifyResult['remaining_attempts'] ?? null
        ]);
        exit;
    }
    
    // Mark mobile as verified in session
    $_SESSION['otp_verified_' . $mobile] = true;
    $_SESSION['otp_verified_at'] = time();
    
    // Log successful verification
    $db->logInfo("OTP verified successfully for {$mobile}");
    
    // Return success
    echo json_encode([
        'success' => true,
        'message' => getConfig('api_messages')['otp_verified'],
        'verified' => true
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    
    // Log error
    if (LOG_ERRORS) {
        $logFile = getLogFilePath('api_errors');
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] Verify OTP Error: {$e->getMessage()}\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }
}

?>
