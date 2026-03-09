# DynamoDB Tables Configuration

## 📊 TABLES BEING USED

Based on your existing configuration (`/config/config.php`):

### **1. OTP Table**
```
Table Name: lp_app_otp
Purpose: Store OTP codes for phone verification
Region: ap-south-1 (Mumbai)
```

**Primary Key:**
- `mobile` (String) - Phone number

**Attributes:**
- otp_code (String) - 6-digit OTP
- created_at (Number) - Timestamp when created
- expires_at (Number) - Timestamp when expires (2 minutes)
- verified (Boolean) - Whether OTP was verified
- attempt_count (Number) - Number of times resent
- page (String) - Which page requested (mba, btech, etc.)

**Used By:**
- `send-otp.php` → Saves OTP via `$db->saveOTP()`
- `verify-otp.php` → Checks OTP via `$db->getLatestOTP()`

---

### **2. OTP Attempts Table**
```
Table Name: lp_app_otp_attempts
Purpose: Track rate limiting for OTP requests
Region: ap-south-1 (Mumbai)
```

**Primary Key:**
- `mobile` (String) - Phone number

**Attributes:**
- date (String) - Date (YYYY-MM-DD)
- count (Number) - Number of OTPs sent today
- last_request (Number) - Timestamp of last request

**Used By:**
- `send-otp.php` → Checks rate limit via `$db->checkOTPRateLimit()`

---

### **3. Leads Table**
```
Table Name: lp_app_leads
Purpose: Store all form submissions (lead data)
Region: ap-south-1 (Mumbai)
```

**Primary Key:**
- `leadId` (String) - Unique lead identifier (LEAD-1767188595918-ABC123)

**Attributes:**
- name (String)
- email (String)
- phone (String)
- state (String)
- city (String)
- department (String)
- course (String)
- source (String) - UTM source
- medium (String) - UTM medium
- campaign (String) - UTM campaign
- term (String) - UTM term
- content (String) - UTM content
- gclid (String) - Google Ads Click ID
- fbclid (String) - Facebook Ads Click ID
- referrer (String)
- landing_page (String)
- userAgent (String)
- timestamp (String)
- consent (Boolean)
- status (String) - "new", "contacted", etc.
- createdAt (String) - ISO timestamp
- updatedAt (String) - ISO timestamp

**Used By:**
- `save-lead.php` → Saves lead via `$db->saveLead()`

---

## 📁 Configuration Location

All table names are defined in:
```
/config/config.php
```

```php
// Lines 24-26
define('DYNAMODB_LEADS_TABLE', 'lp_app_leads');
define('DYNAMODB_OTP_TABLE', 'lp_app_otp');
define('DYNAMODB_OTP_ATTEMPTS_TABLE', 'lp_app_otp_attempts');
```

---

## 🔧 AWS Configuration

**Region:** `ap-south-1` (Mumbai, India)

**Credentials:** IAM Role (recommended) or manual:
```php
// Uncomment in config.php if not using IAM role:
define('AWS_ACCESS_KEY', 'your-access-key');
define('AWS_SECRET_KEY', 'your-secret-key');
```

---

## ✅ Table Summary

| Table Name | Purpose | Primary Key | Used For |
|------------|---------|-------------|----------|
| `lp_app_leads` | Lead Data | leadId | Form submissions with UTM tracking |
| `lp_app_otp` | OTP Codes | mobile | Phone verification |
| `lp_app_otp_attempts` | Rate Limiting | mobile | Prevent OTP abuse |

---

## 🧪 Verify Tables Exist

Run this command to check if tables exist:

```bash
aws dynamodb list-tables --region ap-south-1
```

Expected output should include:
```json
{
  "TableNames": [
    "lp_app_leads",
    "lp_app_otp",
    "lp_app_otp_attempts"
  ]
}
```

---

## 🔍 Check Table Details

### Check Leads Table:
```bash
aws dynamodb describe-table --table-name lp_app_leads --region ap-south-1
```

### Check OTP Table:
```bash
aws dynamodb describe-table --table-name lp_app_otp --region ap-south-1
```

### Check Attempts Table:
```bash
aws dynamodb describe-table --table-name lp_app_otp_attempts --region ap-south-1
```

---

## 📊 Data Flow

### OTP Verification Flow:
```
1. User enters phone → Frontend calls /api/send-otp.php
2. send-otp.php checks: lp_app_otp_attempts (rate limit)
3. send-otp.php saves: lp_app_otp (OTP code)
4. User enters OTP → Frontend calls /api/verify-otp.php
5. verify-otp.php checks: lp_app_otp (validate code)
6. verify-otp.php updates: lp_app_otp (mark verified)
```

### Lead Submission Flow:
```
1. User submits form → Frontend calls /api/save-lead.php
2. save-lead.php saves: lp_app_leads (complete data)
3. save-lead.php calls: Meritto API (CRM sync)
4. Returns success → Redirects to thank you page
```

---

## 🎯 Key Points

1. **OTP Data:** Stored in `lp_app_otp` table
2. **Lead Data:** Stored in `lp_app_leads` table
3. **Rate Limiting:** Tracked in `lp_app_otp_attempts` table
4. **All tables** use the same AWS region: `ap-south-1`
5. **Configuration** is centralized in `/config/config.php`

---

## ⚠️ Important Notes

- OTP expires after **2 minutes** (defined in config)
- Max **10 OTPs per day** per mobile number
- Max **3 verification attempts** per OTP
- Lead data includes **full UTM tracking**
- All timestamps in **ISO 8601 format**

---

## 🚀 No Changes Needed!

Your existing configuration is already correct. The tables are:
- ✅ Already defined in config.php
- ✅ Already used by DynamoDB helper
- ✅ Already integrated with OTP and lead flows

**Just deploy and it will work with your existing tables!**
