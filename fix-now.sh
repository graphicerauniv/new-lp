#!/bin/bash
# Quick Fix Script - Apache Config and Permissions

echo "Fixing Apache configuration and permissions..."
echo ""

# Fix logs directory permissions
echo "1. Fixing logs directory..."
sudo mkdir -p /var/www/html/lp/api/logs
sudo chown -R www-data:www-data /var/www/html/lp/api/logs
sudo chmod -R 755 /var/www/html/lp/api/logs
echo "✓ Logs directory fixed"

# Copy corrected Apache config
echo ""
echo "2. Installing Apache configuration..."
sudo cp /var/www/html/lp/apache-config/lp.conf /etc/apache2/sites-available/
echo "✓ Apache config copied"

# Enable required modules
echo ""
echo "3. Enabling Apache modules..."
sudo a2enmod rewrite headers proxy_fcgi setenvif
echo "✓ Modules enabled"

# Enable PHP-FPM
echo ""
echo "4. Enabling PHP-FPM..."
if [ -f /etc/apache2/conf-available/php8.4-fpm.conf ]; then
    sudo a2enconf php8.4-fpm
elif [ -f /etc/apache2/conf-available/php-fpm.conf ]; then
    sudo a2enconf php-fpm
fi
echo "✓ PHP-FPM enabled"

# Enable site
echo ""
echo "5. Enabling site..."
sudo a2ensite lp.conf
sudo a2dissite 000-default.conf 2>/dev/null || true
echo "✓ Site enabled"

# Test configuration
echo ""
echo "6. Testing Apache configuration..."
if sudo apache2ctl configtest; then
    echo "✓ Configuration valid"
else
    echo "✗ Configuration error"
    exit 1
fi

# Reload Apache
echo ""
echo "7. Reloading Apache..."
sudo systemctl reload apache2
echo "✓ Apache reloaded"

# Test endpoints
echo ""
echo "=========================================="
echo "Testing endpoints..."
echo "=========================================="
echo ""

echo "Health check:"
curl -s http://localhost/lp/api/health.php | jq '.' || curl http://localhost/lp/api/health.php
echo ""

echo ""
echo "Main page:"
curl -s -I http://localhost/lp/mba/ | head -5
echo ""

echo ""
echo "=========================================="
echo "✓ Configuration complete!"
echo "=========================================="
echo ""
echo "URLs:"
echo "  http://localhost/lp/mba/"
echo "  http://localhost/lp/api/health.php"
echo ""
