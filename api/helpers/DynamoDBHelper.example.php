<?php
/**
 * DynamoDB Helper - Example Template
 * 
 * This is an EXAMPLE of what your DynamoDBHelper.php should look like.
 * Update your actual helper to match this structure.
 */

class DynamoDBHelper {
    
    private $client;
    private $tableName;
    
    public function __construct() {
        // Initialize AWS DynamoDB client
        // TODO: Add your AWS credentials and region
        
        $this->tableName = 'geu_leads'; // Your table name
        
        // Example using AWS SDK:
        // require 'vendor/autoload.php';
        // $this->client = new Aws\DynamoDb\DynamoDbClient([
        //     'region' => 'ap-south-1',
        //     'version' => 'latest',
        //     'credentials' => [
        //         'key' => 'YOUR_AWS_KEY',
        //         'secret' => 'YOUR_AWS_SECRET'
        //     ]
        // ]);
    }
    
    /**
     * Save lead to DynamoDB
     * 
     * @param array $leadData - Complete lead data from form
     * @return array - Success response
     * @throws Exception on failure
     */
    public function saveLead($leadData) {
        try {
            // Prepare item for DynamoDB
            $item = [
                'leadId' => ['S' => $leadData['leadId']],
                'name' => ['S' => $leadData['name']],
                'email' => ['S' => $leadData['email']],
                'phone' => ['S' => $leadData['phone']],
                'state' => ['S' => $leadData['state'] ?? ''],
                'city' => ['S' => $leadData['city'] ?? ''],
                'department' => ['S' => $leadData['department'] ?? ''],
                'course' => ['S' => $leadData['course'] ?? ''],
                
                // UTM Parameters
                'source' => ['S' => $leadData['source'] ?? 'Direct'],
                'medium' => ['S' => $leadData['medium'] ?? 'None'],
                'campaign' => ['S' => $leadData['campaign'] ?? ''],
                'term' => ['S' => $leadData['term'] ?? ''],
                'content' => ['S' => $leadData['content'] ?? ''],
                'gclid' => ['S' => $leadData['gclid'] ?? ''],
                'fbclid' => ['S' => $leadData['fbclid'] ?? ''],
                
                // Metadata
                'referrer' => ['S' => $leadData['referrer'] ?? ''],
                'landing_page' => ['S' => $leadData['landing_page'] ?? ''],
                'userAgent' => ['S' => $leadData['userAgent'] ?? ''],
                'timestamp' => ['S' => $leadData['timestamp'] ?? date('c')],
                'consent' => ['BOOL' => $leadData['consent'] ?? false],
                'status' => ['S' => $leadData['status'] ?? 'new'],
                'createdAt' => ['S' => $leadData['createdAt'] ?? date('c')],
                'updatedAt' => ['S' => $leadData['updatedAt'] ?? date('c')]
            ];
            
            // TODO: Replace this with actual DynamoDB PutItem call
            // Example:
            // $result = $this->client->putItem([
            //     'TableName' => $this->tableName,
            //     'Item' => $item
            // ]);
            
            // For now, simulate success
            $result = [
                'success' => true,
                'leadId' => $leadData['leadId']
            ];
            
            return $result;
            
        } catch (Exception $e) {
            throw new Exception("DynamoDB save failed: " . $e->getMessage());
        }
    }
}
