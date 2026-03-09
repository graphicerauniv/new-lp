# OTP Configuration - Timing Settings

## ✅ Current Configuration (All Correct!)

### **OTP Validity: 2 Minutes (120 seconds)**

All settings are correctly configured for **2 minutes**.

---

## 📋 Configuration Files

### **1. config/config.php** (Line 43)
```php
define('OTP_EXPIRY_MINUTES', 2); // ✅ 2 minutes
```

### **2. api/helpers/DynamoDBHelper.php** (Line 175)
```php
$expiresAt = time() + (OTP_EXPIRY_MINUTES * 60);
// Calculation: time() + (2 * 60) = current_time + 120 seconds ✅
```

### **3. api/send-otp.php** (Line 143)
```php
'expires_in' => OTP_EXPIRY_MINUTES * 60 // Returns 120 seconds ✅
```

### **4. assets/js/otp-handler.js** (Line 92)
```javascript
// User-facing message
"OTP is valid for 2 minutes" ✅
```

---

## 🔄 OTP Flow Timeline

```
Time 0s:
  ↓ User clicks "Verify"
  ↓ send-otp.php sends OTP
  ↓ OTP saved with expires_at = current_time + 120 seconds

Time 0-30s:
  ↓ User can verify
  ↓ Resend button disabled (30s countdown)

Time 30s:
  ↓ Resend button enabled
  ↓ User can request new OTP

Time 120s (2 minutes):
  ↓ OTP EXPIRES
  ↓ verify-otp.php checks: time() > expires_at
  ↓ Returns error: "OTP has expired"

Time > 120s:
  ↓ User must request new OTP
```

---

## ⏱️ Related Settings

### **Resend Countdown:**
```javascript
// otp-handler.js (Line 14)
resendCountdown: 30 // 30 seconds before user can resend
```

### **Max Resend Attempts:**
```php
// config.php (Line 44)
define('OTP_MAX_RESEND_SAME', 3); // Can resend same OTP 3 times
```

### **Max OTP Per Day:**
```php
// config.php (Line 45)
define('OTP_MAX_PER_DAY', 10); // Max 10 OTPs per mobile per day
```

### **Max Verification Attempts:**
```php
// config.php (Line 46)
define('OTP_MAX_VERIFY_ATTEMPTS', 3); // 3 wrong attempts = OTP locked
```

---

## 🧪 Test OTP Expiry

### **Test 1: Valid OTP (Within 2 minutes)**
```bash
# Send OTP
curl -X POST http://localhost/lp/api/send-otp.php \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# Response:
{
  "success": true,
  "expires_in": 120  # ✅ 2 minutes
}

# Wait 30 seconds, verify
curl -X POST http://localhost/lp/api/verify-otp.php \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210", "otp":"123456"}'

# Should work! ✅
```

### **Test 2: Expired OTP (After 2 minutes)**
```bash
# Send OTP
curl -X POST http://localhost/lp/api/send-otp.php \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# Wait 121 seconds (over 2 minutes)
sleep 121

# Try to verify
curl -X POST http://localhost/lp/api/verify-otp.php \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210", "otp":"123456"}'

# Response:
{
  "success": false,
  "error": "OTP has expired"  # ✅ Correct!
}
```

---

## 📊 Verification Logic

**verify-otp.php checks:**
```php
// 1. Does OTP exist?
if (!$otpData) {
    return error("No OTP found");
}

// 2. Is it expired?
if (time() > $otpData['expires_at']) {
    return error("OTP has expired"); // ✅ After 120 seconds
}

// 3. Is it already verified?
if ($otpData['verified']) {
    return error("OTP already used");
}

// 4. Too many attempts?
if ($otpData['verify_attempts'] >= OTP_MAX_VERIFY_ATTEMPTS) {
    return error("Too many attempts");
}

// 5. Does OTP match?
if ($otpData['otp_code'] !== $otpCode) {
    return error("Invalid OTP");
}

// All checks passed ✅
```

---

## 🎯 Summary

| Setting | Value | Location | Status |
|---------|-------|----------|--------|
| OTP Validity | 2 minutes (120s) | config.php | ✅ Correct |
| Calculation | time() + 120 | DynamoDBHelper.php | ✅ Correct |
| API Response | expires_in: 120 | send-otp.php | ✅ Correct |
| User Message | "2 minutes" | otp-handler.js | ✅ Correct |
| Resend Delay | 30 seconds | otp-handler.js | ✅ Correct |

---

## ✅ Conclusion

**All OTP timing is correctly set to 2 minutes!** 

No changes needed. The system:
- ✅ Stores expiry correctly (current_time + 120 seconds)
- ✅ Validates expiry correctly (time() > expires_at)
- ✅ Shows correct message to users ("2 minutes")
- ✅ Returns correct API response (expires_in: 120)

Everything is working as expected! 🎉
