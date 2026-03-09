# Apache Configuration for ALB Setup
# ALB (443 HTTPS) → EC2 (80 HTTP)

## Apache Virtual Host Configuration

Create file: `/etc/apache2/sites-available/lp.conf`

```apache
<VirtualHost *:80>
    ServerName lp.geuni.in
    ServerAlias www.lp.geuni.in
    
    DocumentRoot /var/www/html/lp
    
    # Trust ALB headers for HTTPS detection
    SetEnvIf X-Forwarded-Proto https HTTPS=on
    
    <Directory /var/www/html/lp>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle frontend routing
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            
            # Don't rewrite API or assets
            RewriteCond %{REQUEST_URI} !^/api/
            RewriteCond %{REQUEST_URI} !^/assets/
            RewriteCond %{REQUEST_URI} !^/mba/
            
            # If file doesn't exist, serve index.html
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>
    
    # API directory - no rewrite, direct access
    <Directory /var/www/html/lp/api>
        Options -Indexes
        AllowOverride None
        Require all granted
        
        # PHP-FPM configuration
        <FilesMatch \.php$>
            SetHandler "proxy:unix:/run/php/php-fpm.sock|fcgi://localhost"
        </FilesMatch>
    </Directory>
    
    # Assets directory
    <Directory /var/www/html/lp/assets>
        Options -Indexes
        AllowOverride None
        Require all granted
        
        # Cache static assets
        <IfModule mod_expires.c>
            ExpiresActive On
            ExpiresByType image/jpg "access plus 1 year"
            ExpiresByType image/jpeg "access plus 1 year"
            ExpiresByType image/gif "access plus 1 year"
            ExpiresByType image/png "access plus 1 year"
            ExpiresByType image/webp "access plus 1 year"
            ExpiresByType text/css "access plus 1 month"
            ExpiresByType application/javascript "access plus 1 month"
        </IfModule>
    </Directory>
    
    # Security headers
    <IfModule mod_headers.c>
        # Remove server signature
        Header always unset Server
        Header always unset X-Powered-By
        
        # Security headers
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-XSS-Protection "1; mode=block"
        
        # Since ALB handles HTTPS, we trust it
        Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
    </IfModule>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/lp-error.log
    CustomLog ${APACHE_LOG_DIR}/lp-access.log combined
    
    # Log real client IP from ALB
    LogFormat "%{X-Forwarded-For}i %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" alb
    CustomLog ${APACHE_LOG_DIR}/lp-alb.log alb
</VirtualHost>
```

---

## Enable Configuration

```bash
# Enable required modules
sudo a2enmod rewrite headers expires proxy_fcgi setenvif

# Enable PHP-FPM
sudo a2enconf php8.4-fpm

# Disable default site
sudo a2dissite 000-default

# Enable our site
sudo a2ensite lp.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## ALB Target Group Settings

### Health Check:
- **Protocol:** HTTP
- **Port:** 80
- **Path:** `/mba/index.html` or `/api/health.php`
- **Success codes:** 200
- **Interval:** 30 seconds
- **Timeout:** 5 seconds
- **Healthy threshold:** 2
- **Unhealthy threshold:** 2

### Listener Rules:
- **ALB Listener:** HTTPS (443) with SSL certificate
- **Target Group:** HTTP (80)
- **Stickiness:** Not needed (stateless API)

---

## Security Group Configuration

### EC2 Security Group:
```
Inbound Rules:
- HTTP (80) from ALB Security Group
- SSH (22) from your IP (for management)

Outbound Rules:
- All traffic (for AWS SDK, Meritto, MSG91)
```

### ALB Security Group:
```
Inbound Rules:
- HTTPS (443) from 0.0.0.0/0 (internet)
- HTTP (80) from 0.0.0.0/0 (optional redirect)

Outbound Rules:
- HTTP (80) to EC2 Security Group
```

---

## PHP Configuration for ALB

Update `/var/www/html/lp/api/save-lead.php` to get real IP:

```php
// Already handled in our code!
function getClientIP() {
    // ALB sends real IP in X-Forwarded-For
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        foreach ($ips as $ip) {
            $ip = trim($ip);
            if (filter_var($ip, FILTER_VALIDATE_IP, 
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '';
}
```

✅ This is already in your save-lead.php!

---

## Test Configuration

### 1. Test from EC2:
```bash
curl http://localhost/lp/mba/
# Should return HTML

curl http://localhost/lp/api/send-otp.php -X POST \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'
# Should return JSON
```

### 2. Test from ALB:
```bash
curl https://lp.geuni.in/lp/mba/
# Should return HTML over HTTPS

curl https://lp.geuni.in/lp/api/send-otp.php -X POST \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'
# Should return JSON
```

### 3. Check Headers:
```bash
curl -I https://lp.geuni.in/lp/mba/
# Should show security headers
```

---

## Optional: Health Check Endpoint

Create `/var/www/html/lp/api/health.php`:

```php
<?php
header('Content-Type: application/json');

$health = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'php_version' => PHP_VERSION,
    'services' => []
];

// Check AWS SDK
if (file_exists('/var/www/vendor_global/vendor/autoload.php')) {
    $health['services']['aws_sdk'] = 'ok';
} else {
    $health['services']['aws_sdk'] = 'missing';
    $health['status'] = 'unhealthy';
}

// Check logs directory
if (is_writable(__DIR__ . '/logs')) {
    $health['services']['logs'] = 'ok';
} else {
    $health['services']['logs'] = 'not_writable';
}

http_response_code($health['status'] === 'healthy' ? 200 : 503);
echo json_encode($health);
```

Use this for ALB health checks!

---

## Environment Variables for ALB

Add to `/etc/environment`:

```bash
AWS_REGION=ap-south-1
# If not using IAM role, add:
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
```

Reload:
```bash
sudo systemctl restart apache2
```

---

## CORS Configuration (Already Handled)

Your save-lead.php already has:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
```

✅ Perfect for ALB!

---

## Monitoring

### CloudWatch Logs (Optional):
```bash
sudo apt install -y awslogs
```

Configure to send Apache logs to CloudWatch.

### Apache Logs:
```bash
# Real-time monitoring
sudo tail -f /var/log/apache2/lp-access.log
sudo tail -f /var/log/apache2/lp-alb.log
sudo tail -f /var/log/apache2/lp-error.log

# Application logs
sudo tail -f /var/www/html/lp/api/logs/save-lead-errors.log
```

---

## Summary

✅ ALB handles HTTPS (443) with SSL certificate
✅ EC2 runs HTTP (80) - no SSL needed on EC2
✅ Apache trusts X-Forwarded-For from ALB
✅ Security headers added
✅ Real client IP captured correctly
✅ Health check endpoint ready
✅ Proper logging configured

**Your setup is production-ready!** 🚀
