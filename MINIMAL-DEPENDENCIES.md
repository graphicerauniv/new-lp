# Minimal Dependencies - DynamoDB Only

## Why These Extensions Only?

Since we're using **DynamoDB** (not MySQL), we only need:

### **Required PHP Extensions:**

| Extension | Purpose |
|-----------|---------|
| php8.2-fpm | PHP FastCGI Process Manager (web server) |
| php8.2-cli | PHP Command Line Interface |
| php8.2-curl | HTTP requests (Meritto API, MSG91 API) |
| php8.2-mbstring | String handling (international characters) |
| php8.2-xml | XML parsing (AWS SDK responses) |
| php8.2-zip | Zip file handling (Composer) |

### **NOT Needed:**
- ❌ php8.2-json - Built into PHP 8.2 core
- ❌ php8.2-mysql - Using DynamoDB (NoSQL), not MySQL
- ❌ php8.2-pgsql - Not using PostgreSQL
- ❌ php8.2-sqlite - Not using SQLite

---

## Installation Command

```bash
sudo apt install -y \
    php8.2-fpm \
    php8.2-cli \
    php8.2-curl \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-zip
```

That's it! No database extensions needed.

---

## What We Use Instead of MySQL

| Traditional | Our Stack |
|-------------|-----------|
| MySQL/PostgreSQL | **AWS DynamoDB** |
| PDO/MySQLi | **AWS SDK for PHP** |
| SQL Queries | **DynamoDB API calls** |
| Database Server | **AWS Managed Service** |

---

## Data Storage Architecture

```
Frontend Form
     ↓
API (save-lead.php)
     ↓
┌──────────────────┬──────────────────┐
│                  │                  │
│   AWS DynamoDB   │   Meritto CRM   │
│   (NoSQL Cloud)  │   (HTTP API)    │
│                  │                  │
│   Via AWS SDK    │   Via cURL      │
└──────────────────┴──────────────────┘
```

**No traditional database needed!**

---

## Why This is Better

✅ **Serverless** - No database server to maintain
✅ **Scalable** - Auto-scales with traffic
✅ **Fast** - Single-digit millisecond latency
✅ **Reliable** - AWS manages backups/replication
✅ **Cost-effective** - Pay per request
✅ **No tuning** - No query optimization needed

---

## Verify Installation

After installing PHP extensions:

```bash
# Check PHP version
php -v
# Should show: PHP 8.2.x

# Check required extensions
php -m | grep -E 'curl|mbstring|xml|zip'
# Should show all four

# Check json is built-in
php -r "echo json_encode(['test' => 'works']);"
# Should output: {"test":"works"}
```

---

## If You Already Installed MySQL

No problem! It won't interfere. But you can remove it to save resources:

```bash
sudo apt remove php8.2-mysql
sudo apt autoremove
```

---

**Summary:** Only 6 PHP extensions needed for DynamoDB-based application!
