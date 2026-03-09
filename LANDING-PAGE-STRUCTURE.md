# Landing Page Structure Guide

## Directory Structure

```
/lp/
├── assets/                    # SHARED across all landing pages
│   ├── css/                   # Shared CSS (swiper, styles, etc.)
│   ├── js/                    # Shared JS (form.js, api-handler.js, utm-handler.js, etc.)
│   ├── etc/                   # Shared data (course-mapping.json, states-cities.json)
│   └── img/                   # Shared images
│       └── main/              # Logo, seal, common images
│
├── api/                       # API endpoints (shared by all pages)
│   ├── send-otp.php
│   ├── verify-otp.php
│   ├── save-lead.php
│   ├── health.php
│   └── helpers/               # Helper classes
│
├── mba/                       # MBA-specific landing page
│   ├── index.html
│   ├── thankyou.html
│   └── assets/                # MBA page-specific assets only
│       ├── css/               # MBA-specific styles
│       ├── js/                # MBA-specific scripts (if any)
│       └── img/               # MBA-specific images
│
├── admissions2026/            # General admissions landing page
│   ├── index.html
│   ├── thankyou.html
│   └── assets/                # Admissions page-specific assets only
│       ├── css/               # Admissions-specific styles
│       ├── js/                # Admissions-specific scripts (if any)
│       └── img/               # Admissions-specific images
│
└── [future-pages]/            # Add more landing pages as needed
    ├── index.html
    ├── thankyou.html
    └── assets/                # Page-specific assets only
```

## Asset Loading Strategy

### In HTML files (mba/index.html, admissions2026/index.html, etc.):

```html
<!-- Shared assets (load from /lp/assets/) -->
<link href="/lp/assets/css/swiper-bundle.min.css" rel="stylesheet"/>
<link href="/lp/assets/css/styles.css" rel="stylesheet"/>
<script src="/lp/assets/js/utm-handler.js"></script>
<script src="/lp/assets/js/api-handler.js"></script>
<script src="/lp/assets/js/otp-handler.js"></script>
<script src="/lp/assets/js/form.js"></script>

<!-- Page-specific assets (load from current directory) -->
<link href="assets/css/mba-custom.css" rel="stylesheet"/>
<script src="assets/js/mba-custom.js"></script>
```

## Meritto Source Mapping

Based on department selected in the form:

| Department | Source |
|-----------|--------|
| Management | GEU-MBA-LP-2026 |
| Computer Science | GEU-CSE-LP-2026 |
| Engineering (General) | GEU-ENGG-LP-2026 |
| Design | GEU-DESIGN-LP-2026 |
| Law | GEU-LAW-LP-2026 |
| Commerce | GEU-COMMERCE-LP-2026 |
| Science | GEU-SCIENCE-LP-2026 |
| Arts & Humanities | GEU-ARTS-LP-2026 |
| Health Sciences | GEU-HEALTH-LP-2026 |

### For admissions2026 pages:
If `utm_content` contains "admissions2026", the source becomes:
- `GEU-MBA-ADMISSIONS2026-2026`
- `GEU-ENGG-ADMISSIONS2026-2026`
- etc.

## Creating a New Landing Page

1. **Create directory:**
   ```bash
   mkdir -p /var/www/html/lp/my-new-page/assets/{css,js,img}
   ```

2. **Copy base files:**
   ```bash
   cp /var/www/html/lp/mba/index.html /var/www/html/lp/my-new-page/
   cp /var/www/html/lp/mba/thankyou.html /var/www/html/lp/my-new-page/
   ```

3. **Update HTML paths:**
   - Shared assets: `/lp/assets/...`
   - Page assets: `assets/...` (relative)

4. **Customize:**
   - Edit `index.html` for content
   - Add custom CSS in `assets/css/`
   - Add custom JS in `assets/js/` (if needed)
   - Add images in `assets/img/`

5. **Test:**
   ```
   https://lp.geuni.in/lp/my-new-page/
   ```

## Benefits of This Structure

✅ **Shared code** - Update once, applies to all pages
✅ **Easy maintenance** - Common fixes in one place
✅ **Fast loading** - Shared assets cached across pages
✅ **Customization** - Each page can have unique styles/scripts
✅ **Scalable** - Add unlimited landing pages
✅ **Auto source** - Meritto source auto-detected by department

## What to Put Where

### /lp/assets/ (Shared):
- Form handling logic
- API communication
- OTP functionality
- UTM tracking
- Course/state data
- Common styles
- Logo, seal, brand images

### /lp/[page]/assets/ (Page-specific):
- Hero images unique to this page
- Custom colors/themes
- Page-specific animations
- Custom form fields (if different)
- Testimonials/content images

## Example URLs

```
MBA Page:
https://lp.geuni.in/lp/mba/

Admissions 2026 Page:
https://lp.geuni.in/lp/admissions2026/

Future Engineering Page:
https://lp.geuni.in/lp/engineering/

All share:
- /lp/assets/ (common files)
- /lp/api/ (backend)
```
