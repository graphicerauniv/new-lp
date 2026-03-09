<?php
/**
 * Meritto CRM Helper Class
 * Handles lead synchronization with Meritto (NoPaperForms) CRM
 */

if (!defined('GEU_LP_SYSTEM')) {
    define('GEU_LP_SYSTEM', true);
}

require_once __DIR__ . '/../../config/config.php';

class MerittoHelper {
    
    private $apiUrl;
    private $accessKey;
    private $secretKey;
    private $enabled;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->apiUrl = MERITTO_API_URL;
        $this->accessKey = MERITTO_ACCESS_KEY;
        $this->secretKey = MERITTO_SECRET_KEY;
        $this->enabled = MERITTO_ENABLED;
    }
    
    /**
     * Sync lead to Meritto CRM
     */
    public function syncLead($leadData) {
        if (!$this->enabled) {
            $this->logInfo('Meritto sync disabled');
            return [
                'success' => true,
                'message' => 'Meritto sync disabled',
                'lead_id' => null
            ];
        }
        
        try {
            // Prepare payload according to Meritto API format
            $payload = $this->preparePayload($leadData);
            
            // Make API request
            $response = $this->makeRequest($payload);
            
            if ($response['success']) {
                $this->logInfo("Lead synced successfully: {$leadData['email']}");
                return [
                    'success' => true,
                    'message' => 'Lead synced to Meritto',
                    'lead_id' => $response['lead_id'] ?? null,
                    'response' => $response['data']
                ];
            } else {
                $this->logError("Failed to sync lead {$leadData['email']}: " . $response['error']);
                return [
                    'success' => false,
                    'error' => $response['error'],
                    'response' => $response['data']
                ];
            }
            
        } catch (Exception $e) {
            $this->logError('Meritto Sync Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to sync lead'
            ];
        }
    }
    
    /**
     * Prepare payload for Meritto API
     */
    private function preparePayload($leadData) {
        // Determine course level (UG/PG) from course-mapping.json
        $courseLevel = 'UG'; // Default to UG
        $courseMappingFile = __DIR__ . '/../../assets/etc/course-mapping.json';
        
        if (file_exists($courseMappingFile) && !empty($leadData['course'])) {
            $coursesData = json_decode(file_get_contents($courseMappingFile), true);
            if ($coursesData) {
                foreach ($coursesData as $courseData) {
                    if (isset($courseData['title']) && $courseData['title'] === $leadData['course']) {
                        $courseLevel = strtoupper($courseData['level'] ?? 'UG');
                        break;
                    }
                }
            }
        }
        
        // Build payload according to Meritto format
        // Note: specialization field NOT sent to Meritto
        $payload = [
            'name' => $leadData['full_name'],
            'mobile' => $leadData['mobile'],
            'email' => $leadData['email'],
            'lead_stage' => MERITTO_DEFAULT_LEAD_STAGE,
            'sub_stage' => MERITTO_DEFAULT_SUB_STAGE,
            'search_criteria' => MERITTO_SEARCH_CRITERIA,
            'course' => $courseLevel, // Dynamic UG/PG based on selected course
            'campus' => $leadData['department'],
            // 'specialization' => NOT SENT - removed from Meritto payload
            'source' => $this->getSource($leadData),
            'mobile_verification_status' => true, // OTP verified
            'email_verification_status' => false,
            'country_dial_code' => '+91',
            'state' => $leadData['state'],
            'city' => $leadData['city'],
            'medium' => $this->getMedium($leadData),
            'campaign' => $this->getCampaign($leadData)
        ];
        
        // Add custom fields if available
        if (!empty($leadData['utm_term'])) {
            $payload['utm_term'] = $leadData['utm_term'];
        }
        
        if (!empty($leadData['utm_content'])) {
            $payload['utm_content'] = $leadData['utm_content'];
        }
        
        if (!empty($leadData['gclid'])) {
            $payload['gclid'] = $leadData['gclid'];
        }
        
        if (!empty($leadData['fbclid'])) {
            $payload['fbclid'] = $leadData['fbclid'];
        }
        
        return $payload;
    }
    
    /**
     * Get source from lead data
     */
    private function getSource($leadData) {
        // Use page_source or default
        if (!empty($leadData['page_source'])) {
            // Extract page name from URL (e.g., /lp/mba/ -> GEU-MBA-LP-2026)
            if (preg_match('/\/lp\/([^\/]+)/', $leadData['page_source'], $matches)) {
                $page = strtoupper($matches[1]);
                return "GEU-{$page}-LP-2026";
            }
        }
        
        return MERITTO_DEFAULT_SOURCE;
    }
    
    /**
     * Get medium from UTM data
     */
    private function getMedium($leadData) {
        if (!empty($leadData['utm_medium'])) {
            return $leadData['utm_medium'];
        }
        
        // Try to detect from utm_source
        if (!empty($leadData['utm_source'])) {
            $source = strtolower($leadData['utm_source']);
            if (strpos($source, 'google') !== false) return 'cpc';
            if (strpos($source, 'facebook') !== false) return 'social';
            if (strpos($source, 'instagram') !== false) return 'social';
        }
        
        return MERITTO_DEFAULT_MEDIUM;
    }
    
    /**
     * Get campaign from UTM data
     */
    private function getCampaign($leadData) {
        if (!empty($leadData['utm_campaign'])) {
            return $leadData['utm_campaign'];
        }
        
        return MERITTO_DEFAULT_CAMPAIGN;
    }
    
    /**
     * Make HTTP request to Meritto API
     */
    private function makeRequest($payload) {
        try {
            $ch = curl_init($this->apiUrl);
            
            $headers = [
                'Content-Type: application/json',
                'secret-key: ' . $this->secretKey,
                'access-key: ' . $this->accessKey
            ];
            
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($curlError) {
                return [
                    'success' => false,
                    'error' => 'Connection error: ' . $curlError,
                    'data' => null
                ];
            }
            
            $responseData = json_decode($response, true);
            
            // Log full response in debug mode
            if (DEBUG_MODE) {
                $this->logInfo("Meritto Response: " . json_encode($responseData));
            }
            
            // Meritto returns 200 for success
            if ($httpCode === 200 || $httpCode === 201) {
                return [
                    'success' => true,
                    'lead_id' => $responseData['id'] ?? $responseData['lead_id'] ?? null,
                    'data' => $responseData
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $responseData['message'] ?? 'Unknown error',
                    'data' => $responseData
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null
            ];
        }
    }
    
    /**
     * Async sync (queue for background processing)
     * TODO: Implement with SQS or Redis queue
     */
    public function syncLeadAsync($leadData) {
        // For now, just call sync directly
        // In production, push to queue and process via worker
        return $this->syncLead($leadData);
    }
    
    /**
     * Log info
     */
    private function logInfo($message) {
        if (DEBUG_MODE) {
            $logFile = getLogFilePath('meritto');
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
            $logFile = getLogFilePath('meritto');
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "[{$timestamp}] ERROR: {$message}\n";
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        }
    }
}

?>
