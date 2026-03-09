#!/bin/bash
# Quick Apache Configuration for ALB Setup

set -e

echo "=========================================="
echo "Configuring Apache for ALB"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo"
    exit 1
fi

# Enable required Apache modules
echo "Enabling Apache modules..."
a2enmod rewrite headers expires proxy_fcgi setenvif

# Enable PHP-FPM
echo "Enabling PHP-FPM..."
if [ -f /etc/apache2/conf-available/php8.4-fpm.conf ]; then
    a2enconf php8.4-fpm
elif [ -f /etc/apache2/conf-available/php-fpm.conf ]; then
    a2enconf php-fpm
fi

# Copy virtual host configuration
echo "Installing virtual host configuration..."
if [ -f apache-config/lp.conf ]; then
    cp apache-config/lp.conf /etc/apache2/sites-available/
else
    echo "Error: apache-config/lp.conf not found"
    exit 1
fi

# Disable default site
echo "Disabling default site..."
a2dissite 000-default || true

# Enable our site
echo "Enabling lp.conf..."
a2ensite lp.conf

# Test Apache configuration
echo ""
echo "Testing Apache configuration..."
if apache2ctl configtest; then
    echo "✓ Configuration is valid"
else
    echo "✗ Configuration has errors"
    exit 1
fi

# Reload Apache
echo ""
echo "Reloading Apache..."
systemctl reload apache2

# Check if Apache is running
if systemctl is-active --quiet apache2; then
    echo "✓ Apache is running"
else
    echo "✗ Apache is not running"
    systemctl status apache2
    exit 1
fi

echo ""
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "Apache is configured for ALB setup:"
echo "  - Listening on port 80"
echo "  - Trusts X-Forwarded-Proto from ALB"
echo "  - Security headers enabled"
echo "  - Real client IP logging from X-Forwarded-For"
echo ""
echo "Test locally:"
echo "  curl http://localhost/lp/mba/"
echo "  curl http://localhost/lp/api/health.php"
echo ""
echo "Configure ALB:"
echo "  - Target Group: HTTP:80"
echo "  - Health Check: /lp/api/health.php"
echo "  - Listener: HTTPS:443"
echo ""
