<?php
/**
 * DynamoDB Helper Class
 * Handles all DynamoDB operations for the landing page system
 */

if (!defined('GEU_LP_SYSTEM')) {
    define('GEU_LP_SYSTEM', true);
}

require_once __DIR__ . '/../../config/config.php';
require_once '/var/www/vendor_global/vendor/autoload.php';

use Aws\DynamoDb\DynamoDbClient;
use Aws\DynamoDb\Exception\DynamoDbException;
use Aws\Exception\AwsException;

class DynamoDBHelper {
    
    private $client;
    private $region;
    
    /**
     * Constructor - Initialize DynamoDB client
     */
    public function __construct() {
        $this->region = AWS_REGION;
        
        try {
            $config = [
                'region' => $this->region,
                'version' => 'latest'
            ];
            
            // Use IAM role credentials (recommended for EC2)
            // If you need to use access keys, uncomment below:
            // if (defined('AWS_ACCESS_KEY') && defined('AWS_SECRET_KEY')) {
            //     $config['credentials'] = [
            //         'key' => AWS_ACCESS_KEY,
            //         'secret' => AWS_SECRET_KEY
            //     ];
            // }
            
            $this->client = new DynamoDbClient($config);
            
        } catch (AwsException $e) {
            $this->logError('DynamoDB Client Initialization Failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }
    
    /**
     * Save lead to DynamoDB
     */
    public function saveLead($leadData) {
        try {
            $item = [
                'lead_id' => ['S' => $leadData['lead_id']],
                'mobile' => ['S' => $leadData['mobile']],
                'email' => ['S' => $leadData['email']],
                'full_name' => ['S' => $leadData['full_name']],
                'state' => ['S' => $leadData['state']],
                'city' => ['S' => $leadData['city']],
                'department' => ['S' => $leadData['department']],
                'course' => ['S' => $leadData['course']],
                'consent' => ['BOOL' => $leadData['consent']],
                
                // UTM & Tracking
                'utm_source' => ['S' => $leadData['utm_source'] ?? ''],
                'utm_medium' => ['S' => $leadData['utm_medium'] ?? ''],
                'utm_campaign' => ['S' => $leadData['utm_campaign'] ?? ''],
                'utm_term' => ['S' => $leadData['utm_term'] ?? ''],
                'utm_content' => ['S' => $leadData['utm_content'] ?? ''],
                'gclid' => ['S' => $leadData['gclid'] ?? ''],
                'fbclid' => ['S' => $leadData['fbclid'] ?? ''],
                'msclkid' => ['S' => $leadData['msclkid'] ?? ''],
                'page_source' => ['S' => $leadData['page_source'] ?? ''],
                'referrer' => ['S' => $leadData['referrer'] ?? ''],
                'landing_page' => ['S' => $leadData['landing_page'] ?? ''],
                
                // Metadata
                'ip_address' => ['S' => $leadData['ip_address'] ?? ''],
                'user_agent' => ['S' => $leadData['user_agent'] ?? ''],
                
                // Status
                'meritto_sync_status' => ['S' => 'pending'],
                'meritto_lead_id' => ['S' => ''],
                'meritto_response' => ['S' => ''],
                
                // Timestamps
                'created_at' => ['S' => getCurrentTimestamp()],
                'updated_at' => ['S' => getCurrentTimestamp()],
                'ttl' => ['N' => (string)getTTL(90)] // 90 days retention
            ];
            
            $result = $this->client->putItem([
                'TableName' => DYNAMODB_LEADS_TABLE,
                'Item' => $item
            ]);
            
            return [
                'success' => true,
                'lead_id' => $leadData['lead_id']
            ];
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB Save Lead Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to save lead'
            ];
        }
    }
    
    /**
     * Update lead with Meritto sync status
     */
    public function updateMerittoStatus($leadId, $status, $merittoLeadId = '', $response = '') {
        try {
            $this->client->updateItem([
                'TableName' => DYNAMODB_LEADS_TABLE,
                'Key' => [
                    'lead_id' => ['S' => $leadId]
                ],
                'UpdateExpression' => 'SET meritto_sync_status = :status, meritto_lead_id = :mid, meritto_response = :response, updated_at = :updated',
                'ExpressionAttributeValues' => [
                    ':status' => ['S' => $status],
                    ':mid' => ['S' => $merittoLeadId],
                    ':response' => ['S' => $response],
                    ':updated' => ['S' => getCurrentTimestamp()]
                ]
            ]);
            
            return true;
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB Update Meritto Status Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check if lead exists by email or mobile
     */
    public function checkDuplicateLead($email, $mobile) {
        try {
            // Check by email using GSI (you need to create GSI on email field)
            // For now, we'll scan (not recommended for production with large data)
            // TODO: Create GSI on email and mobile fields for better performance
            
            $result = $this->client->scan([
                'TableName' => DYNAMODB_LEADS_TABLE,
                'FilterExpression' => 'email = :email OR mobile = :mobile',
                'ExpressionAttributeValues' => [
                    ':email' => ['S' => $email],
                    ':mobile' => ['S' => $mobile]
                ],
                'Limit' => 1
            ]);
            
            return !empty($result['Items']);
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB Check Duplicate Error: ' . $e->getMessage());
            return false; // Allow save if check fails
        }
    }
    
    /**
     * Save OTP to DynamoDB
     */
    public function saveOTP($mobile, $otpCode, $attemptCount = 1) {
        try {
            $otpId = 'OTP-' . date('Ymd') . '-' . bin2hex(random_bytes(6));
            $expiresAt = time() + (OTP_EXPIRY_MINUTES * 60);
            
            $item = [
                'mobile' => ['S' => $mobile],
                'otp_id' => ['S' => $otpId],
                'otp_code' => ['S' => $otpCode],
                'otp_type' => ['S' => $attemptCount > 1 ? 'resend' : 'new'],
                'attempt_count' => ['N' => (string)$attemptCount],
                'verified' => ['BOOL' => false],
                'verify_attempts' => ['N' => '0'],
                'expires_at' => ['N' => (string)$expiresAt],
                'created_at' => ['S' => getCurrentTimestamp()],
                'ttl' => ['N' => (string)($expiresAt + 3600)] // Delete 1 hour after expiry
            ];
            
            $this->client->putItem([
                'TableName' => DYNAMODB_OTP_TABLE,
                'Item' => $item
            ]);
            
            return [
                'success' => true,
                'otp_id' => $otpId,
                'expires_at' => $expiresAt
            ];
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB Save OTP Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to save OTP'
            ];
        }
    }
    
    /**
     * Get latest OTP for mobile
     */
    public function getLatestOTP($mobile) {
        try {
            $result = $this->client->query([
                'TableName' => DYNAMODB_OTP_TABLE,
                'KeyConditionExpression' => 'mobile = :mobile',
                'ExpressionAttributeValues' => [
                    ':mobile' => ['S' => $mobile]
                ],
                'ScanIndexForward' => false, // Sort descending
                'Limit' => 1
            ]);
            
            if (empty($result['Items'])) {
                return null;
            }
            
            $item = $result['Items'][0];
            
            return [
                'otp_id' => $item['otp_id']['S'],
                'otp_code' => $item['otp_code']['S'],
                'attempt_count' => (int)$item['attempt_count']['N'],
                'verified' => $item['verified']['BOOL'],
                'verify_attempts' => (int)$item['verify_attempts']['N'],
                'expires_at' => (int)$item['expires_at']['N']
            ];
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB Get OTP Error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Verify OTP
     */
    public function verifyOTP($mobile, $otpCode) {
        try {
            // Get all recent OTPs for this mobile
            $result = $this->client->query([
                'TableName' => DYNAMODB_OTP_TABLE,
                'KeyConditionExpression' => 'mobile = :mobile',
                'ExpressionAttributeValues' => [
                    ':mobile' => ['S' => $mobile]
                ],
                'ScanIndexForward' => false, // Most recent first
                'Limit' => 10 // Get last 10 OTPs to find valid one
            ]);
            
            if (empty($result['Items'])) {
                return [
                    'success' => false,
                    'error' => 'no_otp_found'
                ];
            }
            
            // Find the first unverified and non-expired OTP
            $otpData = null;
            $currentTime = time();
            
            foreach ($result['Items'] as $item) {
                $isVerified = $item['verified']['BOOL'];
                $expiresAt = (int)$item['expires_at']['N'];
                
                // Skip if already verified or expired
                if ($isVerified || $currentTime > $expiresAt) {
                    continue;
                }
                
                // Found a valid OTP
                $otpData = [
                    'otp_id' => $item['otp_id']['S'],
                    'otp_code' => $item['otp_code']['S'],
                    'verified' => $isVerified,
                    'verify_attempts' => (int)$item['verify_attempts']['N'],
                    'expires_at' => $expiresAt
                ];
                break;
            }
            
            // If no valid OTP found, check why
            if (!$otpData) {
                $mostRecent = $result['Items'][0];
                $mostRecentVerified = $mostRecent['verified']['BOOL'];
                $mostRecentExpired = $currentTime > (int)$mostRecent['expires_at']['N'];
                
                if ($mostRecentVerified) {
                    return [
                        'success' => false,
                        'error' => 'already_verified'
                    ];
                } else if ($mostRecentExpired) {
                    return [
                        'success' => false,
                        'error' => 'expired'
                    ];
                }
                
                return [
                    'success' => false,
                    'error' => 'no_otp_found'
                ];
            }
            
            // Check max verify attempts
            if ($otpData['verify_attempts'] >= OTP_MAX_VERIFY_ATTEMPTS) {
                return [
                    'success' => false,
                    'error' => 'max_attempts'
                ];
            }
            
            // Increment verify attempts
            $this->client->updateItem([
                'TableName' => DYNAMODB_OTP_TABLE,
                'Key' => [
                    'mobile' => ['S' => $mobile],
                    'otp_id' => ['S' => $otpData['otp_id']]
                ],
                'UpdateExpression' => 'SET verify_attempts = verify_attempts + :inc',
                'ExpressionAttributeValues' => [
                    ':inc' => ['N' => '1']
                ]
            ]);
            
            // Check OTP code
            if ($otpData['otp_code'] !== $otpCode) {
                $remainingAttempts = OTP_MAX_VERIFY_ATTEMPTS - ($otpData['verify_attempts'] + 1);
                return [
                    'success' => false,
                    'error' => 'invalid_otp',
                    'remaining_attempts' => max(0, $remainingAttempts)
                ];
            }
            
            // Mark as verified
            $this->client->updateItem([
                'TableName' => DYNAMODB_OTP_TABLE,
                'Key' => [
                    'mobile' => ['S' => $mobile],
                    'otp_id' => ['S' => $otpData['otp_id']]
                ],
                'UpdateExpression' => 'SET verified = :verified',
                'ExpressionAttributeValues' => [
                    ':verified' => ['BOOL' => true]
                ]
            ]);
            
            return [
                'success' => true,
                'message' => 'verified'
            ];
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB Verify OTP Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'verification_failed'
            ];
        }
    }
    
    /**
     * Check OTP rate limit (daily limit)
     */
    public function checkOTPRateLimit($mobile) {
        try {
            $date = date('Y-m-d');
            
            // Query OTPs sent today
            $result = $this->client->query([
                'TableName' => DYNAMODB_OTP_TABLE,
                'KeyConditionExpression' => 'mobile = :mobile',
                'FilterExpression' => 'begins_with(created_at, :date)',
                'ExpressionAttributeValues' => [
                    ':mobile' => ['S' => $mobile],
                    ':date' => ['S' => $date]
                ]
            ]);
            
            $count = $result['Count'];
            
            return [
                'allowed' => $count < OTP_MAX_PER_DAY,
                'count' => $count,
                'limit' => OTP_MAX_PER_DAY
            ];
            
        } catch (DynamoDbException $e) {
            $this->logError('DynamoDB OTP Rate Limit Check Error: ' . $e->getMessage());
            return ['allowed' => true]; // Allow if check fails
        }
    }
    
    /**
     * Check if mobile is verified
     */
    public function isMobileVerified($mobile) {
        try {
            $otpData = $this->getLatestOTP($mobile);
            return $otpData && $otpData['verified'];
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Log error to file
     */
    private function logError($message) {
        if (LOG_ERRORS) {
            $logFile = getLogFilePath('dynamodb');
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "[{$timestamp}] ERROR: {$message}\n";
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        }
    }
    
    /**
     * Log info to file
     */
    public function logInfo($message) {
        if (DEBUG_MODE) {
            $logFile = getLogFilePath('general');
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "[{$timestamp}] INFO: {$message}\n";
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        }
    }
}

?>
