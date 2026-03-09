#!/bin/bash
# Find PHP Error Logs

echo "=========================================="
echo "Finding PHP Error Logs"
echo "=========================================="
echo ""

# Check PHP-FPM log location
echo "1. PHP-FPM Error Log:"
PHP_LOG=$(php -r "echo ini_get('error_log');")
if [ -n "$PHP_LOG" ] && [ -f "$PHP_LOG" ]; then
    echo "   Location: $PHP_LOG"
    echo "   Last 20 lines:"
    sudo tail -20 "$PHP_LOG"
else
    echo "   Checking common locations..."
    
    COMMON_LOGS=(
        "/var/log/php8.4-fpm.log"
        "/var/log/php-fpm.log"
        "/var/log/php/error.log"
        "/var/log/php8.4/error.log"
    )
    
    for log in "${COMMON_LOGS[@]}"; do
        if [ -f "$log" ]; then
            echo "   Found: $log"
            echo "   Last 20 lines:"
            sudo tail -20 "$log"
            break
        fi
    done
fi

echo ""
echo "2. Apache Error Log (PHP errors):"
sudo tail -30 /var/log/apache2/error.log | grep -i "php\|fatal\|error" || echo "   No PHP errors found"

echo ""
echo "3. Check PHP Configuration:"
php -i | grep -E "error_log|display_errors|log_errors"

echo ""
echo "=========================================="
echo ""
