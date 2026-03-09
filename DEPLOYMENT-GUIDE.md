# GEU MBA Landing Page - Production Deployment Guide

## 📦 Package Contents

This is a **complete production-ready** package for a fresh server.

---

## 🖥️ Server Requirements

### **Minimum Requirements:**
- **OS:** Ubuntu 20.04 LTS or higher
- **PHP:** 8.0 or higher
- **Web Server:** Apache 2.4 or Nginx
- **Memory:** 512MB RAM minimum
- **Disk:** 500MB free space

### **Required PHP Extensions:**
```bash
php-fpm
php-cli
php-curl
php-mbstring
php-xml
php-zip
```

**Note:** We use DynamoDB (NoSQL), not MySQL

### **AWS Requirements:**
- AWS IAM credentials with DynamoDB access
- DynamoDB tables created (see below)

### **External APIs:**
- MSG91 account (for OTP)
- Meritto/NoPaperForms account (for CRM)

---

## 🚀 Fresh Server Installation

### **Step 1: Prepare Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2 and required extensions
sudo apt install -y php8.2-fpm php8.2-cli php8.2-curl \
                    php8.2-mbstring php8.2-xml php8.2-zip

# Install Composer globally
curl -sS https://getcomposer.org/installer | sudo php -- \
     --install-dir=/usr/local/bin --filename=composer

# Install web server (Apache example)
sudo apt install -y apache2

# Enable required Apache modules
sudo a2enmod rewrite ssl headers
```

---

### **Step 2: Install AWS SDK Globally**

```bash
# Create global vendor directory
sudo mkdir -p /var/www/vendor_global
cd /var/www/vendor_global

# Install AWS SDK
sudo composer require aws/aws-sdk-php

# Set permissions
sudo chown -R www-data:www-data /var/www/vendor_global
sudo chmod -R 755 /var/www/vendor_global
```

---

### **Step 3: Upload Landing Page Files**

```bash
# Create project directory
sudo mkdir -p /var/www/html/lp
cd /var/www/html/lp

# Upload all files from this package
# (Use FTP, SCP, or Git)

# Set ownership
sudo chown -R www-data:www-data /var/www/html/lp

# Set permissions
find /var/www/html/lp -type d -exec chmod 755 {} \;
find /var/www/html/lp -type f -exec chmod 644 {} \;

# Make logs directory writable
sudo mkdir -p /var/www/html/lp/api/logs
sudo chmod 755 /var/www/html/lp/api/logs
```

---

### **Step 4: Configure Apache**

Create virtual host file:
```bash
sudo nano /etc/apache2/sites-available/lp.geuni.in.conf
```

Add this configuration:
```apache
<VirtualHost *:80>
    ServerName lp.geuni.in
    ServerAlias www.lp.geuni.in
    
    DocumentRoot /var/www/html/lp
    
    <Directory /var/www/html/lp>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # API directory
    <Directory /var/www/html/lp/api>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/lp-error.log
    CustomLog ${APACHE_LOG_DIR}/lp-access.log combined
    
    # PHP settings
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
</VirtualHost>
```

Enable site and reload:
```bash
sudo a2ensite lp.geuni.in.conf
sudo systemctl reload apache2
```

---

### **Step 5: Configure AWS Credentials**

**Option 1: IAM Role (Recommended for EC2)**
```bash
# Attach IAM role to EC2 instance with DynamoDB permissions
# No code changes needed!
```

**Option 2: Environment Variables**
```bash
sudo nano /etc/environment
```

Add:
```bash
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

Reload:
```bash
sudo systemctl restart apache2
```

---

### **Step 6: Create DynamoDB Tables**

```bash
# Install AWS CLI
sudo apt install -y awscli

# Configure AWS CLI
aws configure
```

Create tables:
```bash
# Leads table
aws dynamodb create-table \
    --table-name lp_app_leads \
    --attribute-definitions AttributeName=lead_id,AttributeType=S \
    --key-schema AttributeName=lead_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region ap-south-1

# OTP table
aws dynamodb create-table \
    --table-name lp_app_otp \
    --attribute-definitions AttributeName=mobile,AttributeType=S \
    --key-schema AttributeName=mobile,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region ap-south-1

# OTP attempts table
aws dynamodb create-table \
    --table-name lp_app_otp_attempts \
    --attribute-definitions AttributeName=mobile,AttributeType=S \
    --key-schema AttributeName=mobile,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region ap-south-1
```

---

### **Step 7: Configure API Keys**

Edit configuration file:
```bash
nano /var/www/html/lp/config/config.php
```

Update these values:
```php
// MSG91 OTP Settings
define('MSG91_AUTH_KEY', 'your_msg91_key_here');
define('MSG91_TEMPLATE_ID', 'your_template_id_here');

// Meritto CRM Settings
define('MERITTO_ACCESS_KEY', 'dccc277169bf4df39112e1423bab6454');
define('MERITTO_SECRET_KEY', '45c20f12941b42a1a662b7f1613e8db6');

// AWS Settings (if not using IAM role)
// define('AWS_ACCESS_KEY', 'your_aws_key');
// define('AWS_SECRET_KEY', 'your_aws_secret');
```

---

## 🧪 Testing

### **Test 1: Check PHP**
```bash
php -v
# Should show PHP 8.0+
```

### **Test 2: Check AWS SDK**
```bash
php -r "require '/var/www/vendor_global/vendor/autoload.php'; echo 'AWS SDK loaded';"
# Should output: AWS SDK loaded
```

### **Test 3: Test OTP Endpoint**
```bash
curl -X POST "https://lp.geuni.in/lp/api/send-otp.php" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

Expected:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### **Test 4: Test Lead Submission**
```bash
curl -X POST "https://lp.geuni.in/lp/api/save-lead.php" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "phone": "9876543210",
    "state": "Test",
    "city": "Test",
    "department": "Test",
    "course": "Test"
  }'
```

Expected:
```json
{
  "success": true,
  "leadId": "GEU-...",
  "details": {
    "dynamodb": {"success": true},
    "meritto": {"success": true}
  }
}
```

---

## 📁 Directory Structure

```
/var/www/html/lp/
├── api/
│   ├── helpers/
│   │   ├── DynamoDBHelper.php
│   │   ├── MerittoHelper.php
│   │   └── MSG91Helper.php
│   ├── logs/
│   ├── save-lead.php
│   ├── send-otp.php
│   └── verify-otp.php
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── config/
│   └── config.php
├── mba/
│   ├── index.html
│   └── thankyou.html
└── composer.json

/var/www/vendor_global/
└── vendor/
    ├── aws/
    └── autoload.php
```

---

## 🔒 Security Checklist

- [ ] File permissions set correctly (755 dirs, 644 files)
- [ ] API keys stored in config (not in code)
- [ ] AWS credentials via IAM role (not hardcoded)
- [ ] HTTPS enabled with SSL certificate
- [ ] Error logging enabled (display_errors = off)
- [ ] CORS headers configured properly
- [ ] Rate limiting enabled for OTP
- [ ] Logs directory writable but not web-accessible

---

## 🐛 Troubleshooting

### **Issue: AWS SDK not found**
```bash
# Check vendor path
ls -la /var/www/vendor_global/vendor/autoload.php

# If missing, install again
cd /var/www/vendor_global
sudo composer require aws/aws-sdk-php
```

### **Issue: Permission denied errors**
```bash
sudo chown -R www-data:www-data /var/www/html/lp
sudo chmod -R 755 /var/www/html/lp
sudo chmod -R 755 /var/www/html/lp/api/logs
```

### **Issue: DynamoDB connection failed**
```bash
# Test AWS credentials
aws dynamodb list-tables --region ap-south-1

# Check IAM permissions
# Must have: dynamodb:PutItem, dynamodb:GetItem, dynamodb:UpdateItem
```

### **Issue: OTP not sending**
```bash
# Check MSG91 credentials
# Check error logs
tail -50 /var/log/apache2/lp-error.log
```

---

## 📊 Monitoring

### **Check Logs**
```bash
# Apache error log
tail -f /var/log/apache2/lp-error.log

# Application log
tail -f /var/www/html/lp/api/logs/save-lead-errors.log

# PHP-FPM log
tail -f /var/log/php8.2-fpm.log
```

### **Check DynamoDB**
```bash
# Count leads
aws dynamodb scan \
  --table-name lp_app_leads \
  --select COUNT \
  --region ap-south-1

# Get recent leads
aws dynamodb scan \
  --table-name lp_app_leads \
  --limit 5 \
  --region ap-south-1
```

---

## 🎉 Go Live Checklist

- [ ] Server configured and tested
- [ ] AWS SDK installed globally
- [ ] DynamoDB tables created
- [ ] API keys configured
- [ ] SSL certificate installed
- [ ] DNS pointing to server
- [ ] All tests passing
- [ ] Error logging working
- [ ] Backup strategy in place

---

## 🆘 Support

If issues persist:
1. Check `/var/www/html/lp/api/logs/save-lead-errors.log`
2. Check `/var/log/apache2/lp-error.log`
3. Test each component separately
4. Verify AWS credentials and permissions

---

## 📝 Notes

- Default timezone: Asia/Kolkata
- OTP validity: 2 minutes
- Max OTP per day: 10
- Lead table: lp_app_leads
- AWS Region: ap-south-1

---

**Deployment time:** ~30 minutes
**Ready for production!** 🚀
