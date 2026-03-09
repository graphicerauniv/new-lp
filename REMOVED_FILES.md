# Removed Files Summary

## Date: January 13, 2026

Since the landing pages are now using the NPF/Meritto form widget, the following API-related files and directories have been removed:

## Directories Removed

### 1. `/api/` Directory
- `api/health.php`
- `api/save-lead.php`
- `api/save-lead.php.backup`
- `api/send-otp.php`
- `api/verify-otp.php`
- `api/helpers/DynamoDBHelper.php`
- `api/helpers/DynamoDBHelper.example.php`
- `api/helpers/MerittoHelper.php`
- `api/helpers/MerittoHelper.example.php`
- `api/helpers/MSG91Helper.php`
- `api/logs/save-lead-errors.log`

### 2. `/config/` Directory
- `config/config.php`
- `config/.htaccess`
- `config/data/courses.json`
- `config/data/state-city.json`

## JavaScript Files Removed

From `/assets/js/`:
- `api-handler.js` - API request handler
- `form.js` - Custom form submission logic
- `form-new.js` - New form handler
- `otp-handler.js` - OTP verification handler
- `utm-handler.js` - UTM parameter tracking
- `form.js.backup` - Backup file
- `form.js.bak_readme2` - Backup file

## HTML Updates

Script tags referencing the removed JavaScript files were removed from:
- `admissions2026/index.html`
- `admissions2026/index-backup.html`
- `design/index.html`
- `mba/index.html`
- `mba/index-backup.html`
- `law/index.html`
- `cse/index.html`
- `engineering/index.html`

### Removed Script Tags:
```html
<script defer src="/lp/assets/js/api-handler.js"></script>
<script defer src="/lp/assets/js/otp-handler.js"></script>
<script defer src="/lp/assets/js/form.js"></script>
<script defer src="/lp/assets/js/utm-handler.js"></script>
<!-- Form handler (depends on courses.js, api-handler.js, otp-handler.js) -->
```

## Current Form Integration

All landing pages now use the **NPF/Meritto form widget** with the following configuration:

```javascript
var npf_d='https://apply.geu.ac.in';
var npf_c='6861';
var npf_m='1';
```

Widget HTML:
```html
<div class="npf_wgts" data-height="560px" data-w="cfeba00db1c68a1bcb17f6659bbe6a71"></div>
```

Widget Script:
```html
<script type="text/javascript">
    var s=document.createElement("script");
    s.type="text/javascript";
    s.async=true;
    s.src="https://widgets.in4.nopaperforms.com/emwgts.js";
    document.body.appendChild(s);
</script>
```

## Benefits

✅ **Simplified Architecture**: No backend API required
✅ **Reduced Maintenance**: Meritto handles form submissions
✅ **Better Integration**: Direct connection to Meritto CRM
✅ **No Dependencies**: Removed PHP, DynamoDB, MSG91 dependencies
✅ **Smaller Package**: Reduced file size by removing unnecessary code

## Code Cleanup

### Backup and Unnecessary Files Removed
All backup, temporary, and development documentation files have been removed:

**JavaScript Backup Files (13 files):**
- `assets/js/carousel-drag.js.bak_wrap`
- `assets/js/courses.js.bak_imgcheck`
- `assets/js/courses.js.bak_readme`
- `assets/js/courses.js.bak_readme2`
- `assets/js/animations.js.bak_wrap`
- `assets/js/success-stories.js.bak_wrap`
- `assets/js/key-highlights.js.bak_fix`
- `assets/js/key-highlights.js.bak_readme`
- `assets/js/key-highlights.js.bak_readme2`
- `assets/js/key-highlights.js.bak_wrap`
- `assets/js/sliders.js.bak_wrap`
- `assets/js/fixes.js.bak_wrap`

**CSS Backup Files (2 files):**
- `assets/css/layout-fixes.css.bak_nirf_cards`
- `assets/css/layout-fixes.css.bak_visual_tweak`

**HTML Backup Files (3 files):**
- `mba/index.html.backup`
- `mba/index-backup.html`
- `admissions2026/index-backup.html`

**Documentation Files (5 files):**
- `admissions2026/README.md`
- `cse/README.md`
- `design/README.md`
- `engineering/README.md`
- `law/README.md`

**Total backup/unnecessary files removed:** 22 files

### Console Statements Removed
All `console.log`, `console.error`, `console.warn`, `console.debug`, and `console.info` statements have been removed from:
- All JavaScript files in `/assets/js/`
- All inline JavaScript in HTML files

**Files cleaned:**
- `assets/js/course-filter.js` - 2 console.log statements
- `assets/js/page-enhancements.js` - 1 console.log statement
- `assets/js/utm-handler.js` - 3 console.log statements
- `mba/index.html` - 7 console statements
- `cse/index.html` - 1 console.log statement
- `law/index.html` - 1 console.log statement
- `design/index.html` - 1 console.log statement

**Total console statements removed:** 16

## Notes

- Course data and city/state data in `config/data/` were also removed since the NPF widget handles field population
- All form validation and submission is now handled by the Meritto widget
- OTP verification is managed by Meritto's system
- All debug console statements removed for production-ready code
