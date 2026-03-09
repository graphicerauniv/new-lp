# Correct Installation Commands - PHP 8.4

# DON'T use comments in apt install - it breaks!
# Use clean commands like this:

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install PHP 8.4 and extensions (no PPA needed if PHP 8.4 is available)
sudo apt install -y php-fpm php-cli php-curl php-mbstring php-xml php-zip

# 3. Verify PHP version
php -v

# 4. Install Composer
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

# 5. Install Apache
sudo apt install -y apache2 libapache2-mod-php

# 6. Enable Apache modules
sudo a2enmod rewrite ssl headers proxy_fcgi setenvif
sudo a2enconf php8.4-fpm
sudo systemctl restart apache2

# 7. Install AWS SDK globally
sudo mkdir -p /var/www/vendor_global
cd /var/www/vendor_global

sudo bash -c 'cat > composer.json' << 'EOF'
{
    "require": {
        "aws/aws-sdk-php": "^3.0"
    }
}
EOF

sudo composer install --no-dev --optimize-autoloader
sudo chown -R www-data:www-data /var/www/vendor_global
sudo chmod -R 755 /var/www/vendor_global

# 8. Create project directory
sudo mkdir -p /var/www/html/lp/api/logs
sudo mkdir -p /var/www/html/lp/config
sudo chown -R www-data:www-data /var/www/html/lp

# 9. Verify installation
echo "Checking PHP..."
php -v
echo ""
echo "Checking extensions..."
php -m | grep -E 'curl|mbstring|xml|zip|json'
echo ""
echo "✓ Installation complete!"
