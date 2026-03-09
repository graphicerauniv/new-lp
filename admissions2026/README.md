# Admissions 2026 Landing Page

This is a general admissions landing page for 2026.

## Structure

```
/lp/admissions2026/
├── index.html         - Main landing page (copied from MBA)
├── thankyou.html      - Thank you page
└── assets/            - Page-specific assets
    ├── css/           - Custom styles for this page
    ├── js/            - Custom scripts (if needed)
    └── img/           - Page-specific images
```
"Aaaaa"

## Shared Assets

Common assets are loaded from `/lp/assets/`:
- `/lp/assets/js/` - Shared JavaScript (form.js, api-handler.js, etc.)
- `/lp/assets/css/` - Shared CSS
- `/lp/assets/etc/` - Shared data (course-mapping.json, states-cities.json)
- `/lp/assets/img/main/` - Shared images (logo, seal, etc.)

## Meritto Source

Forms from this page will use source: `GEU-*-ADMISSIONS2026-2026`
- Management: `GEU-MBA-ADMISSIONS2026-2026`
- Engineering: `GEU-ENGG-ADMISSIONS2026-2026`
- Design: `GEU-DESIGN-ADMISSIONS2026-2026`
- etc.

## Customization

To customize this page:
1. Edit `index.html` for content
2. Add custom CSS in `assets/css/`
3. Add custom images in `assets/img/`
4. Shared functionality stays in `/lp/assets/`

## API Endpoints

Uses the same API endpoints as other pages:
- `/lp/api/send-otp.php`
- `/lp/api/verify-otp.php`
- `/lp/api/save-lead.php`

The source is auto-detected based on department selected.
