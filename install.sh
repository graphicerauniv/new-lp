#!/bin/bash
# GEU Landing Page - Quick Installation Script
# Run this on a fresh Ubuntu server

set -e

echo "=========================================="
echo "GEU MBA Landing Page - Installation"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/var/www/html/lp"
VENDOR_DIR="/var/www/vendor_global"

# Auto-detect PHP version
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    echo "Detected PHP $PHP_VERSION"
    USE_VERSION_SPECIFIC=false
else
    echo "PHP not installed, will install PHP 8.2"
    PHP_VERSION="8.2"
    USE_VERSION_SPECIFIC=true
fi

echo -e "${YELLOW}This will install:${NC}"
echo "- PHP $PHP_VERSION and required extensions"
echo "- Composer (globally)"
echo "- AWS SDK for PHP (globally)"
echo "- Apache web server"
echo "- Landing page files to $PROJECT_DIR"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled"
    exit 1
fi

# ============================================================================
# STEP 1: Update System
# ============================================================================
echo ""
echo -e "${GREEN}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

# ============================================================================
# STEP 2: Install PHP
# ============================================================================
echo ""
echo -e "${GREEN}Step 2: Installing PHP and extensions...${NC}"

# Try generic packages first (works with PHP 8.4 and modern Ubuntu)
if apt-cache show php-fpm &> /dev/null; then
    echo "Installing PHP using generic packages (php-fpm, php-cli, etc.)"
    apt install -y \
        php-fpm \
        php-cli \
        php-curl \
        php-mbstring \
        php-xml \
        php-zip
else
    # Fallback to version-specific packages
    echo "Installing PHP $PHP_VERSION using version-specific packages"
    
    # Add PHP repository if needed
    add-apt-repository -y ppa:ondrej/php
    apt update
    
    apt install -y \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-zip
fi

echo -e "${GREEN}✓ PHP installed${NC}"

# ============================================================================
# STEP 3: Install Composer
# ============================================================================
echo ""
echo -e "${GREEN}Step 3: Installing Composer...${NC}"

curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

echo -e "${GREEN}✓ Composer installed${NC}"

# ============================================================================
# STEP 4: Install Apache
# ============================================================================
echo ""
echo -e "${GREEN}Step 4: Installing Apache...${NC}"

apt install -y apache2

# Enable required modules
a2enmod rewrite ssl headers

echo -e "${GREEN}✓ Apache installed${NC}"

# ============================================================================
# STEP 5: Install AWS SDK Globally
# ============================================================================
echo ""
echo -e "${GREEN}Step 5: Installing AWS SDK globally...${NC}"

mkdir -p "$VENDOR_DIR"
cd "$VENDOR_DIR"

cat > composer.json <<'COMPOSER'
{
    "require": {
        "aws/aws-sdk-php": "^3.0"
    }
}
COMPOSER

composer install --no-dev --optimize-autoloader

chown -R www-data:www-data "$VENDOR_DIR"
chmod -R 755 "$VENDOR_DIR"

echo -e "${GREEN}✓ AWS SDK installed at $VENDOR_DIR${NC}"

# ============================================================================
# STEP 6: Create Project Directory
# ============================================================================
echo ""
echo -e "${GREEN}Step 6: Creating project directory...${NC}"

mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/api/logs"
mkdir -p "$PROJECT_DIR/config"

chown -R www-data:www-data "$PROJECT_DIR"

echo -e "${GREEN}✓ Project directory created${NC}"

# ============================================================================
# STEP 7: Configure Apache Virtual Host
# ============================================================================
echo ""
echo -e "${GREEN}Step 7: Configuring Apache...${NC}"

cat > /etc/apache2/sites-available/lp.geuni.in.conf <<'VHOST'
<VirtualHost *:80>
    ServerName lp.geuni.in
    ServerAlias www.lp.geuni.in
    
    DocumentRoot /var/www/html/lp
    
    <Directory /var/www/html/lp>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/html/lp/api>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/lp-error.log
    CustomLog ${APACHE_LOG_DIR}/lp-access.log combined
</VirtualHost>
VHOST

a2ensite lp.geuni.in.conf
systemctl reload apache2

echo -e "${GREEN}✓ Apache configured${NC}"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ PHP $PHP_VERSION installed${NC}"
echo -e "${GREEN}✓ Composer installed${NC}"
echo -e "${GREEN}✓ Apache installed and configured${NC}"
echo -e "${GREEN}✓ AWS SDK installed at $VENDOR_DIR${NC}"
echo -e "${GREEN}✓ Project directory: $PROJECT_DIR${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Upload landing page files to: $PROJECT_DIR"
echo ""
echo "2. Configure AWS credentials:"
echo "   - Use IAM role (recommended), OR"
echo "   - Add to /etc/environment:"
echo "     AWS_REGION=ap-south-1"
echo "     AWS_ACCESS_KEY_ID=your_key"
echo "     AWS_SECRET_ACCESS_KEY=your_secret"
echo ""
echo "3. Update config file:"
echo "   nano $PROJECT_DIR/config/config.php"
echo "   - MSG91 API keys"
echo "   - Meritto API keys"
echo ""
echo "4. Create DynamoDB tables (see DEPLOYMENT-GUIDE.md)"
echo ""
echo "5. Test the setup:"
echo "   curl http://localhost/lp/mba/"
echo ""
echo "Installation script completed: $(date)"
echo ""
