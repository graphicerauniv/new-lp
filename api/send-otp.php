<?php
/**
 * Send OTP API Endpoint
 * POST /api/send-otp.php
 */

define('GEU_LP_SYSTEM', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/helpers/DynamoDBHelper.php';
require_once __DIR__ . '/helpers/MSG91Helper.php';

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
    
    // Validate mobile number
    $mobile = $input['mobile'] ?? '';
    $page = $input['page'] ?? '';
    
    if (empty($mobile)) {
        throw new Exception('Mobile number is required');
    }
    
    // Validate mobile format (10 digits, starting with 6-9)
    if (!preg_match('/^[6-9]\d{9}$/', $mobile)) {
        throw new Exception('Invalid mobile number format');
    }
    
    // Check if OTP is disabled for this page
    if (isOtpDisabled($page)) {
        // Return success without sending OTP (for testing)
        $_SESSION['otp_verified_' . $mobile] = true;
        echo json_encode([
            'success' => true,
            'message' => 'OTP disabled for this page',
            'otp' => DEBUG_MODE ? '123456' : null
        ]);
        exit;
    }
    
    // Initialize helpers
    $db = new DynamoDBHelper();
    $msg91 = new MSG91Helper();
    
    // Check rate limit
    $rateLimit = $db->checkOTPRateLimit($mobile);
    if (!$rateLimit['allowed']) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'rate_limit',
            'message' => getConfig('api_messages')['otp_rate_limit']
        ]);
        exit;
    }
    
    // Get latest OTP to check if we should resend or generate new
    $existingOTP = $db->getLatestOTP($mobile);
    
    $otpCode = null;
    $attemptCount = 1;
    $isResend = false;
    
    if ($existingOTP && !$existingOTP['verified']) {
        // Check if OTP is still valid
        if (time() < $existingOTP['expires_at']) {
            // OTP still valid
            if ($existingOTP['attempt_count'] < OTP_MAX_RESEND_SAME) {
                // Resend same OTP
                $otpCode = $existingOTP['otp_code'];
                $attemptCount = $existingOTP['attempt_count'] + 1;
                $isResend = true;
            } else {
                // Generate new OTP after max resends
                $otpCode = $msg91->generateOTP();
                $attemptCount = 1;
            }
        } else {
            // OTP expired, generate new
            $otpCode = $msg91->generateOTP();
            $attemptCount = 1;
        }
    } else {
        // No existing OTP or already verified, generate new
        $otpCode = $msg91->generateOTP();
        $attemptCount = 1;
    }
    
    // Save OTP to database
    $saveResult = $db->saveOTP($mobile, $otpCode, $attemptCount);
    
    if (!$saveResult['success']) {
        throw new Exception('Failed to save OTP');
    }
    
    // Send OTP via MSG91
    $sendResult = $msg91->sendOTP($mobile, $otpCode);
    
    if (!$sendResult['success']) {
        throw new Exception('Failed to send OTP');
    }
    
    // Store in session for verification
    $_SESSION['otp_mobile'] = $mobile;
    $_SESSION['otp_expires'] = $saveResult['expires_at'];
    
    // Log successful OTP send
    $db->logInfo("OTP sent to {$mobile}, attempt {$attemptCount}");
    
    // Return success
    echo json_encode([
        'success' => true,
        'message' => getConfig('api_messages')['otp_sent'],
        'expires_in' => OTP_EXPIRY_MINUTES * 60, // seconds
        'can_resend' => $attemptCount < OTP_MAX_RESEND_SAME,
        'attempt_count' => $attemptCount,
        'is_resend' => $isResend,
        'otp' => DEBUG_MODE ? $otpCode : null // Only in debug mode
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
        $logMessage = "[{$timestamp}] Send OTP Error: {$e->getMessage()}\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }
}

?>
