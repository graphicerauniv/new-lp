# Simple Installation for PHP 8.4 (Already Installed)

Since you already have PHP 8.4.16, just install the extensions and tools:

## One-Line Installation

```bash
sudo apt update && sudo apt install -y php-fpm php-cli php-curl php-mbstring php-xml php-zip apache2 libapache2-mod-php && curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer && sudo a2enmod rewrite ssl headers && sudo mkdir -p /var/www/vendor_global && cd /var/www/vendor_global && echo '{"require":{"aws/aws-sdk-php":"^3.0"}}' | sudo tee composer.json && sudo composer install --no-dev && sudo chown -R www-data:www-data /var/www/vendor_global && sudo mkdir -p /var/www/html/lp/api/logs && sudo chown -R www-data:www-data /var/www/html/lp && echo "✓ Done!"
```

## Or Step-by-Step

```bash
# 1. Install PHP extensions
sudo apt update
sudo apt install -y php-fpm php-cli php-curl php-mbstring php-xml php-zip

# 2. Install Apache
sudo apt install -y apache2 libapache2-mod-php

# 3. Install Composer
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

# 4. Enable Apache modules
sudo a2enmod rewrite ssl headers

# 5. Install AWS SDK
sudo mkdir -p /var/www/vendor_global
cd /var/www/vendor_global
echo '{"require":{"aws/aws-sdk-php":"^3.0"}}' | sudo tee composer.json
sudo composer install --no-dev --optimize-autoloader

# 6. Set permissions
sudo chown -R www-data:www-data /var/www/vendor_global

# 7. Create project directory
sudo mkdir -p /var/www/html/lp/api/logs
sudo chown -R www-data:www-data /var/www/html/lp

# Done!
echo "✓ Installation complete!"
```

## Verify

```bash
php -v
# Should show: PHP 8.4.16

php -m | grep -E 'curl|mbstring|xml|zip'
# Should show all 4 extensions

composer --version
# Should show Composer version
```

## What This Installs

- ✅ php-fpm (FastCGI)
- ✅ php-cli (Command line)
- ✅ php-curl (HTTP requests)
- ✅ php-mbstring (String handling)
- ✅ php-xml (XML parsing)
- ✅ php-zip (Zip files)
- ✅ Apache web server
- ✅ Composer
- ✅ AWS SDK for PHP

**Total time:** 2-3 minutes

## Notes

- PHP 8.4 is newer than 8.2 - even better!
- Generic package names (php-fpm not php8.4-fpm) are cleaner
- All our code works with PHP 8.0+ so 8.4 is perfect
