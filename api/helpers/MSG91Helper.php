<?php
/**
 * MSG91 Helper Class
 * Handles OTP sending via MSG91 API
 */

if (!defined('GEU_LP_SYSTEM')) {
    define('GEU_LP_SYSTEM', true);
}

require_once __DIR__ . '/../../config/config.php';

class MSG91Helper {
    
    private $authKey;
    private $templateId;
    private $apiUrl;
    private $enabled;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->authKey = MSG91_AUTH_KEY;
        $this->templateId = MSG91_TEMPLATE_ID;
        $this->apiUrl = MSG91_API_URL;
        $this->enabled = MSG91_ENABLED;
    }
    
    /**
     * Send OTP via MSG91
     */
    public function sendOTP($mobile, $otpCode) {
        // If MSG91 is disabled, return success (for testing)
        if (!$this->enabled) {
            $this->logInfo("MSG91 disabled. OTP would be: {$otpCode}");
            return [
                'success' => true,
                'message' => 'OTP sent (test mode)',
                'otp' => DEBUG_MODE ? $otpCode : null
            ];
        }
        
        try {
            // Format mobile number (add country code if not present)
            $formattedMobile = $this->formatMobileNumber($mobile);
            
            // Prepare API payload
            $payload = [
                'template_id' => $this->templateId,
                'recipients' => [
                    [
                        'mobiles' => $formattedMobile,
                        'OTP' => $otpCode,
                        'Validity' => (string)OTP_EXPIRY_MINUTES
                    ]
                ]
            ];
            
            // Make API request
            $response = $this->makeRequest($payload);
            
            if ($response['success']) {
                $this->logInfo("OTP sent successfully to {$mobile}");
                return [
                    'success' => true,
                    'message' => 'OTP sent successfully',
                    'request_id' => $response['request_id'] ?? null
                ];
            } else {
                $this->logError("Failed to send OTP to {$mobile}: " . $response['error']);
                return [
                    'success' => false,
                    'error' => $response['error']
                ];
            }
            
        } catch (Exception $e) {
            $this->logError('MSG91 Send OTP Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to send OTP'
            ];
        }
    }
    
    /**
     * Format mobile number for MSG91 (add 91 prefix)
     */
    private function formatMobileNumber($mobile) {
        // Remove any spaces, dashes, or special characters
        $mobile = preg_replace('/[^0-9]/', '', $mobile);
        
        // Add country code if not present
        if (strlen($mobile) === 10) {
            return '91' . $mobile;
        }
        
        // If already has country code, return as is
        if (strlen($mobile) === 12 && substr($mobile, 0, 2) === '91') {
            return $mobile;
        }
        
        // Default: assume it needs 91
        return '91' . $mobile;
    }
    
    /**
     * Make HTTP request to MSG91 API
     */
    private function makeRequest($payload) {
        try {
            $ch = curl_init($this->apiUrl);
            
            $headers = [
                'accept: application/json',
                'authkey: ' . $this->authKey,
                'content-type: application/json'
            ];
            
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($curlError) {
                return [
                    'success' => false,
                    'error' => 'Connection error: ' . $curlError
                ];
            }
            
            $responseData = json_decode($response, true);
            
            // MSG91 returns 200 for success
            if ($httpCode === 200) {
                return [
                    'success' => true,
                    'request_id' => $responseData['request_id'] ?? null,
                    'response' => $responseData
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $responseData['message'] ?? 'Unknown error',
                    'response' => $responseData
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Generate OTP code
     */
    public function generateOTP() {
        $length = OTP_LENGTH;
        $otp = '';
        
        for ($i = 0; $i < $length; $i++) {
            $otp .= random_int(0, 9);
        }
        
        return $otp;
    }
    
    /**
     * Log info
     */
    private function logInfo($message) {
        if (DEBUG_MODE) {
            $logFile = getLogFilePath('msg91');
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "[{$timestamp}] INFO: {$message}\n";
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        }
    }
    
    /**
     * Log error
     */
    private function logError($message) {
        if (LOG_ERRORS) {
            $logFile = getLogFilePath('msg91');
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "[{$timestamp}] ERROR: {$message}\n";
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        }
    }
}

?>
