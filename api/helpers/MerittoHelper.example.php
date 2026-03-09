<?php
/**
 * Meritto Helper - Example Template
 * 
 * This is an EXAMPLE of what your MerittoHelper.php should look like.
 * Update your actual helper to match this structure.
 */

class MerittoHelper {
    
    private $apiUrl;
    private $apiKey;
    
    public function __construct() {
        // TODO: Add your Meritto API credentials
        $this->apiUrl = 'https://api.meritto.com/v1/leads'; // Example URL
        $this->apiKey = 'YOUR_MERITTO_API_KEY';
    }
    
    /**
     * Submit lead to Meritto CRM
     * 
     * @param array $leadData - Complete lead data from form
     * @return array - Success response
     * @throws Exception on failure
     */
    public function submitLead($leadData) {
        try {
            // Transform data to Meritto format
            $merittoData = [
                'firstName' => $this->getFirstName($leadData['name']),
                'lastName' => $this->getLastName($leadData['name']),
                'email' => $leadData['email'],
                'mobile' => $leadData['phone'],
                'state' => $leadData['state'] ?? '',
                'city' => $leadData['city'] ?? '',
                'program' => $leadData['department'] ?? '',
                'course' => $leadData['course'] ?? '',
                
                // UTM Parameters
                'source' => $leadData['source'] ?? 'Direct',
                'medium' => $leadData['medium'] ?? 'None',
                'campaign' => $leadData['campaign'] ?? '',
                'term' => $leadData['term'] ?? '',
                'content' => $leadData['content'] ?? '',
                'gclid' => $leadData['gclid'] ?? '',
                'fbclid' => $leadData['fbclid'] ?? '',
                
                // Additional fields
                'referrer' => $leadData['referrer'] ?? '',
                'landingPage' => $leadData['landing_page'] ?? '',
                'consent' => $leadData['consent'] ?? false,
                'timestamp' => $leadData['timestamp'] ?? date('c')
            ];
            
            // TODO: Replace this with actual Meritto API call
            // Example:
            // $ch = curl_init($this->apiUrl);
            // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            // curl_setopt($ch, CURLOPT_POST, true);
            // curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($merittoData));
            // curl_setopt($ch, CURLOPT_HTTPHEADER, [
            //     'Content-Type: application/json',
            //     'Authorization: Bearer ' . $this->apiKey
            // ]);
            // $response = curl_exec($ch);
            // $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            // curl_close($ch);
            //
            // if ($httpCode !== 200) {
            //     throw new Exception("Meritto API error: " . $response);
            // }
            //
            // return json_decode($response, true);
            
            // For now, simulate success
            return [
                'success' => true,
                'leadId' => $leadData['leadId'],
                'merittoId' => 'MER-' . time()
            ];
            
        } catch (Exception $e) {
            throw new Exception("Meritto submission failed: " . $e->getMessage());
        }
    }
    
    /**
     * Extract first name from full name
     */
    private function getFirstName($fullName) {
        $parts = explode(' ', trim($fullName));
        return $parts[0] ?? $fullName;
    }
    
    /**
     * Extract last name from full name
     */
    private function getLastName($fullName) {
        $parts = explode(' ', trim($fullName));
        return count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '-';
    }
}
