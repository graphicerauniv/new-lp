#!/bin/bash
# Test OTP with detailed error reporting

echo "=========================================="
echo "Testing OTP with Error Display"
echo "=========================================="
echo ""

# Create a test script that shows errors
cat > /tmp/test-otp.php << 'EOF'
<?php
// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "Starting OTP test...\n\n";

// Test 1: Check if config file can be loaded
echo "1. Loading config file...\n";
define('GEU_LP_SYSTEM', true);
try {
    require_once '/var/www/html/lp/config/config.php';
    echo "   ✓ Config loaded\n\n";
} catch (Exception $e) {
    echo "   ✗ Config error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Check if helpers can be loaded
echo "2. Loading helper classes...\n";
try {
    require_once '/var/www/html/lp/api/helpers/DynamoDBHelper.php';
    echo "   ✓ DynamoDBHelper loaded\n";
    
    require_once '/var/www/html/lp/api/helpers/MSG91Helper.php';
    echo "   ✓ MSG91Helper loaded\n\n";
} catch (Exception $e) {
    echo "   ✗ Helper error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 3: Try to instantiate helpers
echo "3. Creating helper instances...\n";
try {
    $db = new DynamoDBHelper();
    echo "   ✓ DynamoDBHelper instantiated\n";
    
    $msg91 = new MSG91Helper();
    echo "   ✓ MSG91Helper instantiated\n\n";
} catch (Exception $e) {
    echo "   ✗ Instantiation error: " . $e->getMessage() . "\n";
    echo "   Stack trace:\n";
    echo $e->getTraceAsString() . "\n\n";
    exit(1);
}

// Test 4: Check AWS SDK
echo "4. Checking AWS SDK...\n";
if (file_exists('/var/www/vendor_global/vendor/autoload.php')) {
    try {
        require_once '/var/www/vendor_global/vendor/autoload.php';
        echo "   ✓ AWS SDK autoload exists\n";
        
        if (class_exists('Aws\DynamoDb\DynamoDbClient')) {
            echo "   ✓ DynamoDB client class available\n\n";
        } else {
            echo "   ✗ DynamoDB client class not found\n\n";
        }
    } catch (Exception $e) {
        echo "   ✗ AWS SDK error: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "   ✗ AWS SDK not installed at /var/www/vendor_global/vendor/autoload.php\n\n";
}

// Test 5: Simulate OTP request
echo "5. Simulating OTP request...\n";
$testMobile = '9876543210';
echo "   Mobile: $testMobile\n";

try {
    // This will test if the actual OTP logic works
    echo "   Testing rate limit check...\n";
    $rateLimit = $db->checkOTPRateLimit($testMobile);
    echo "   ✓ Rate limit check completed\n";
    print_r($rateLimit);
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    echo "   Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n========================================\n";
echo "Test complete\n";
echo "========================================\n";
EOF

# Run the test
echo "Running PHP test script..."
echo ""
php /tmp/test-otp.php
echo ""

# Also check if send-otp.php can execute directly
echo "=========================================="
echo "Direct OTP Endpoint Test"
echo "=========================================="
echo ""

php -r "
error_reporting(E_ALL);
ini_set('display_errors', 1);
\$_SERVER['REQUEST_METHOD'] = 'POST';
\$_SERVER['CONTENT_TYPE'] = 'application/json';
file_put_contents('php://input', json_encode(['mobile' => '9876543210']));
include '/var/www/html/lp/api/send-otp.php';
" 2>&1

echo ""
echo "=========================================="
echo "Done"
echo "=========================================="

# Cleanup
rm -f /tmp/test-otp.php
