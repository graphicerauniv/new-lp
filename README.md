# GEU MBA Landing Page - Production Package

## 🎯 Complete Production-Ready Package

This package contains everything you need to deploy the GEU MBA Landing Page on a fresh server.

---

## 📦 What's Included

### **Core Application:**
- ✅ Complete frontend (HTML, CSS, JS)
- ✅ Backend API (PHP)
- ✅ OTP verification system
- ✅ DynamoDB integration
- ✅ Meritto CRM integration
- ✅ Complete UTM tracking

### **Configuration:**
- ✅ Composer configuration
- ✅ Apache virtual host config
- ✅ AWS SDK setup
- ✅ API configurations

### **Documentation:**
- ✅ Complete deployment guide
- ✅ Installation scripts
- ✅ Testing procedures
- ✅ Troubleshooting guide

---

## 🚀 Quick Start (Fresh Server)

### **Option 1: Automated Installation**

```bash
# 1. Upload this package to server
scp -r lp-production ubuntu@your-server:/tmp/

# 2. SSH to server
ssh ubuntu@your-server

# 3. Run installation script
cd /tmp/lp-production
sudo bash install.sh

# 4. Upload application files
sudo cp -r * /var/www/html/lp/

# 5. Set permissions
sudo chown -R www-data:www-data /var/www/html/lp
sudo chmod -R 755 /var/www/html/lp

# 6. Configure API keys
sudo nano /var/www/html/lp/config/config.php

# 7. Test
curl http://localhost/lp/mba/
```

---

### **Option 2: Manual Installation**

See `DEPLOYMENT-GUIDE.md` for detailed step-by-step instructions.

---

## 📁 Package Structure

```
lp-production/
├── README.md                 ← You are here
├── DEPLOYMENT-GUIDE.md       ← Detailed deployment instructions
├── install.sh                ← Automated installation script
├── composer.json             ← Composer configuration
├── api/
│   ├── save-lead.php        ← Production lead API
│   ├── send-otp.php         ← OTP sending
│   ├── verify-otp.php       ← OTP verification
│   └── helpers/             ← Helper classes
├── assets/
│   ├── css/                 ← Stylesheets
│   ├── js/                  ← JavaScript files
│   └── images/              ← Images
├── config/
│   └── config.php           ← Configuration file
├── mba/
│   ├── index.html           ← Main landing page
│   └── thankyou.html        ← Thank you page
└── vendor/                  ← (Created by Composer)
```

---

## ⚙️ Server Requirements

- **OS:** Ubuntu 20.04+
- **PHP:** 8.0+
- **Web Server:** Apache or Nginx
- **AWS:** IAM with DynamoDB access
- **External APIs:** MSG91, Meritto

---

## 🔧 Configuration Needed

After installation, update these:

### **1. AWS Credentials**
```bash
# Use IAM role (recommended)
# OR add to /etc/environment:
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### **2. API Keys in config/config.php**
```php
define('MSG91_AUTH_KEY', 'your_msg91_key');
define('MSG91_TEMPLATE_ID', 'your_template_id');
define('MERITTO_ACCESS_KEY', 'your_meritto_access_key');
define('MERITTO_SECRET_KEY', 'your_meritto_secret_key');
```

### **3. DynamoDB Tables**
Create these tables (see DEPLOYMENT-GUIDE.md):
- `lp_app_leads`
- `lp_app_otp`
- `lp_app_otp_attempts`

---

## ✅ Testing

After deployment:

### **Test 1: Page Loads**
```bash
curl http://your-domain/lp/mba/
# Should return HTML
```

### **Test 2: OTP API**
```bash
curl -X POST "http://your-domain/lp/api/send-otp.php" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

### **Test 3: Lead Submission**
```bash
curl -X POST "http://your-domain/lp/api/save-lead.php" \
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

---

## 📊 Features

- ✅ **OTP Verification:** Phone number verification via MSG91
- ✅ **DynamoDB Storage:** All leads stored in AWS DynamoDB
- ✅ **Meritto Integration:** Automatic CRM synchronization
- ✅ **UTM Tracking:** Complete campaign tracking
- ✅ **Rate Limiting:** OTP abuse prevention
- ✅ **Error Logging:** Comprehensive error tracking
- ✅ **Mobile Responsive:** Works on all devices
- ✅ **Fast Loading:** Optimized assets

---

## 🔒 Security Features

- ✅ CORS headers configured
- ✅ Input validation and sanitization
- ✅ Rate limiting on OTP
- ✅ Error logging (not displayed to users)
- ✅ Secure API key storage
- ✅ AWS IAM role support

---

## 📈 Data Flow

```
User fills form
     ↓
OTP verification (MSG91)
     ↓
Form submission
     ↓
┌─────────────┬──────────────┐
│  DynamoDB   │   Meritto    │
│  (Storage)  │   (CRM)      │
└─────────────┴──────────────┘
     ↓
Thank you page
```

---

## 🆘 Support Files

- `DEPLOYMENT-GUIDE.md` - Complete deployment instructions
- `install.sh` - Automated installation script
- `composer.json` - Dependency management
- `config/config.php` - All configurations in one place

---

## 📝 Quick Checklist

- [ ] Server prepared (PHP, Apache, Composer)
- [ ] AWS SDK installed globally
- [ ] DynamoDB tables created
- [ ] API keys configured
- [ ] Files uploaded and permissions set
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Tests passing

---

## 🎯 Deployment Time

- **Automated:** ~15 minutes
- **Manual:** ~30 minutes

---

## 📧 What Gets Saved

### **DynamoDB (lp_app_leads):**
- Personal info (name, email, phone)
- Location (state, city)
- Course selection (department, course)
- **Complete UTM tracking** (source, medium, campaign, term, content)
- **Click IDs** (gclid, fbclid)
- Device info (browser, OS, IP)
- Timestamps

### **Meritto CRM:**
- Lead data with verification status
- UTM parameters
- Stage: "New" / "Not Called"

---

## 🚀 Ready to Deploy!

1. Read `DEPLOYMENT-GUIDE.md`
2. Run `install.sh` on server
3. Upload files
4. Configure API keys
5. Test and go live!

**All files are production-ready and tested!** ✅
