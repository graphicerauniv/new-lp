#!/bin/bash
# Diagnose OTP Endpoint Issues

echo "=========================================="
echo "OTP Endpoint Diagnostics"
echo "=========================================="
echo ""

# Check if files exist
echo "1. Checking files..."
FILES=(
    "/var/www/html/lp/api/send-otp.php"
    "/var/www/html/lp/config/config.php"
    "/var/www/html/lp/api/helpers/DynamoDBHelper.php"
    "/var/www/html/lp/api/helpers/MSG91Helper.php"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo ""

# Check PHP errors
echo "2. Testing OTP endpoint..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST http://localhost/lp/api/send-otp.php \
    -H "Content-Type: application/json" \
    -d '{"mobile":"9876543210"}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Code: $HTTP_CODE"
echo "Response: $BODY"
echo ""

# Check Apache error log
echo "3. Recent Apache errors:"
sudo tail -20 /var/log/apache2/error.log | grep -A 2 "send-otp"
echo ""

# Check PHP-FPM errors
echo "4. Recent PHP-FPM errors:"
if [ -f /var/log/php8.4-fpm.log ]; then
    sudo tail -20 /var/log/php8.4-fpm.log
elif [ -f /var/log/php-fpm.log ]; then
    sudo tail -20 /var/log/php-fpm.log
else
    echo "  No PHP-FPM log found"
fi
echo ""

# Test PHP syntax
echo "5. Testing PHP syntax..."
php -l /var/www/html/lp/api/send-otp.php
echo ""

# Check file permissions
echo "6. File permissions:"
ls -la /var/www/html/lp/api/send-otp.php
ls -la /var/www/html/lp/config/config.php
echo ""

echo "=========================================="
echo "Diagnostic complete"
echo "=========================================="
