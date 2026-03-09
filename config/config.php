<?php
/**
 * GEU Landing Page System Configuration
 * Version: 2.0
 * Last Updated: 2025-12-30
 */

// Prevent direct access
if (!defined('GEU_LP_SYSTEM')) {
    die('Direct access not permitted');
}

// ============================================================================
// ENVIRONMENT SETTINGS
// ============================================================================
define('ENVIRONMENT', 'production'); // development, staging, production
define('DEBUG_MODE', false); // Set to false in production
define('LOG_ERRORS', true);

// ============================================================================
// AWS DYNAMODB SETTINGS
// ============================================================================
define('AWS_REGION', 'ap-south-1'); // Mumbai region
define('DYNAMODB_LEADS_TABLE', 'lp_app_leads');
define('DYNAMODB_OTP_TABLE', 'lp_app_otp');
define('DYNAMODB_OTP_ATTEMPTS_TABLE', 'lp_app_otp_attempts');

// AWS credentials will be fetched from IAM role (recommended)
// If you need to set credentials manually, uncomment below:
// define('AWS_ACCESS_KEY', 'your-access-key');
// define('AWS_SECRET_KEY', 'your-secret-key');

// ============================================================================
// MSG91 OTP SETTINGS
// ============================================================================
define('MSG91_ENABLED', true);
define('MSG91_AUTH_KEY', '454533AoxJbdjTq3Yv69299126P1');
define('MSG91_TEMPLATE_ID', '68a2fd8ce1c21e540a610be7');
define('MSG91_API_URL', 'https://control.msg91.com/api/v5/flow');

// OTP Configuration
define('OTP_LENGTH', 6);
define('OTP_EXPIRY_MINUTES', 2);
define('OTP_MAX_RESEND_SAME', 3); // Max times to resend same OTP
define('OTP_MAX_PER_DAY', 10); // Max OTPs per mobile per day
define('OTP_MAX_VERIFY_ATTEMPTS', 3); // Max verification attempts per OTP

// OTP Disable Feature (for testing or specific campaigns)
define('OTP_DISABLE_ALL', false); // Set true to disable OTP globally
define('OTP_DISABLED_PAGES', []); // e.g., ['mba', 'btech'] to disable for specific pages

// ============================================================================
// MERITTO CRM SETTINGS
// ============================================================================
define('MERITTO_ENABLED', true);
define('MERITTO_API_URL', 'https://api.nopaperforms.io/lead/v1/createOrUpdate');
define('MERITTO_ACCESS_KEY', 'dccc277169bf4df39112e1423bab6454');
define('MERITTO_SECRET_KEY', '45c20f12941b42a1a662b7f1613e8db6');
define('MERITTO_DEFAULT_SOURCE', 'GEU-LP-2026');
define('MERITTO_DEFAULT_MEDIUM', 'google');
define('MERITTO_DEFAULT_CAMPAIGN', 'GEU_S_MBA_2026');
define('MERITTO_SYNC_ASYNC', false); // Set true to use queue (implement later)

// Lead Stage Settings
define('MERITTO_DEFAULT_LEAD_STAGE', 'New');
define('MERITTO_DEFAULT_SUB_STAGE', 'Not Called');
define('MERITTO_SEARCH_CRITERIA', 'email'); // email or mobile

// ============================================================================
// FORM VALIDATION SETTINGS
// ============================================================================
$FORM_VALIDATION = [
    'full_name' => [
        'required' => true,
        'pattern' => '/^[a-zA-Z\s]+$/',
        'min_length' => 2,
        'max_length' => 100,
        'error_message' => 'Name should contain only letters and spaces'
    ],
    'email' => [
        'required' => true,
        'pattern' => '/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
        'error_message' => 'Please enter a valid email address'
    ],
    'mobile' => [
        'required' => true,
        'pattern' => '/^[6-9]\d{9}$/',
        'length' => 10,
        'error_message' => 'Please enter a valid 10-digit mobile number'
    ],
    'state' => [
        'required' => true,
        'error_message' => 'Please select your state'
    ],
    'city' => [
        'required' => true,
        'error_message' => 'Please select your city'
    ],
    'department' => [
        'required' => true,
        'error_message' => 'Please select a department'
    ],
    'course' => [
        'required' => true,
        'error_message' => 'Please select a course'
    ],
    'consent' => [
        'required' => true,
        'error_message' => 'Please accept the terms to proceed'
    ]
];

// ============================================================================
// RATE LIMITING SETTINGS
// ============================================================================
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_MAX_REQUESTS', 5); // Max requests per IP per minute
define('RATE_LIMIT_WINDOW', 60); // Time window in seconds

// ============================================================================
// SECURITY SETTINGS
// ============================================================================
define('ALLOWED_ORIGINS', [
    'https://geu.ac.in',
    'https://www.geu.ac.in',
    'http://localhost:8000' // Remove in production
]);

define('SESSION_LIFETIME', 3600); // 1 hour
define('CSRF_TOKEN_ENABLED', true);
define('IP_TRACKING_ENABLED', true);

// ============================================================================
// CONVERSION TRACKING SETTINGS
// ============================================================================
$CONVERSION_TRACKING = [
    'google_ads' => [
        'enabled' => true,
        'conversion_id' => '', // Add your conversion ID
        'conversion_label' => '' // Add your conversion label
    ],
    'facebook_pixel' => [
        'enabled' => true,
        'pixel_id' => '' // Add your pixel ID
    ],
    'google_analytics' => [
        'enabled' => true,
        'measurement_id' => '' // Add your GA4 measurement ID
    ],
    'gtm' => [
        'enabled' => false,
        'container_id' => '' // Add your GTM container ID
    ]
];

// ============================================================================
// FILE PATHS
// ============================================================================
// Deployment: /var/www/html/lp/
define('BASE_PATH', '/var/www/html/lp');
define('CONFIG_PATH', BASE_PATH . '/config');
define('LOGS_PATH', BASE_PATH . '/logs');
define('VENDOR_PATH', BASE_PATH . '/vendor');
define('DATA_PATH', CONFIG_PATH . '/data');

// ============================================================================
// API RESPONSE SETTINGS
// ============================================================================
define('API_VERSION', '2.0');
define('API_RESPONSE_FORMAT', 'json');

// Success/Error Messages
$API_MESSAGES = [
    'otp_sent' => 'OTP sent successfully to your mobile number',
    'otp_verified' => 'Mobile number verified successfully',
    'otp_expired' => 'OTP has expired. Please request a new one',
    'otp_invalid' => 'Invalid OTP. Please try again',
    'otp_max_attempts' => 'Maximum verification attempts exceeded. Please request a new OTP',
    'otp_rate_limit' => 'Too many OTP requests. Please try again later',
    'lead_saved' => 'Thank you! Your enquiry has been submitted successfully',
    'lead_duplicate' => 'A lead with this email/mobile already exists',
    'validation_error' => 'Please check all fields and try again',
    'server_error' => 'Something went wrong. Please try again',
    'phone_not_verified' => 'Please verify your mobile number first',
    'invalid_request' => 'Invalid request'
];

// ============================================================================
// EMAIL SETTINGS (for admin notifications)
// ============================================================================
define('ADMIN_EMAIL_ENABLED', true);
define('ADMIN_EMAIL', 'admissions@geu.ac.in');
define('ADMIN_EMAIL_SUBJECT', 'New Lead Submission - GEU Landing Page');
define('USER_CONFIRMATION_EMAIL', true);

// ============================================================================
// LOGGING SETTINGS
// ============================================================================
define('LOG_LEVEL', 'info'); // debug, info, warning, error
define('LOG_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('LOG_ROTATION', true);
define('LOG_RETENTION_DAYS', 30);

// ============================================================================
// DEPARTMENT & COURSE MAPPINGS (for Meritto)
// ============================================================================
$DEPARTMENT_COURSE_MAPPING = [
    'Management' => 'PG',
    'Computer Science and Engineering' => 'UG',
    'Mechanical Engineering' => 'UG',
    'Civil Engineering' => 'UG',
    'Law' => 'UG',
    'Design' => 'UG'
];

// ============================================================================
// UTM PARAMETER SETTINGS
// ============================================================================
$UTM_PARAMETERS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
    'msclkid'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get configuration value
 */
function getConfig($key, $default = null) {
    global $FORM_VALIDATION, $CONVERSION_TRACKING, $API_MESSAGES, $DEPARTMENT_COURSE_MAPPING, $UTM_PARAMETERS;
    
    $configs = [
        'form_validation' => $FORM_VALIDATION,
        'conversion_tracking' => $CONVERSION_TRACKING,
        'api_messages' => $API_MESSAGES,
        'department_course_mapping' => $DEPARTMENT_COURSE_MAPPING,
        'utm_parameters' => $UTM_PARAMETERS
    ];
    
    return isset($configs[$key]) ? $configs[$key] : $default;
}

/**
 * Check if OTP is disabled for current page
 */
function isOtpDisabled($page = '') {
    if (OTP_DISABLE_ALL) {
        return true;
    }
    
    if (!empty($page) && in_array($page, OTP_DISABLED_PAGES)) {
        return true;
    }
    
    return false;
}

/**
 * Get log file path
 */
function getLogFilePath($type = 'general') {
    $date = date('Y-m-d');
    return LOGS_PATH . "/{$type}_{$date}.log";
}

/**
 * Get current timestamp in ISO 8601 format
 */
function getCurrentTimestamp() {
    return gmdate('Y-m-d\TH:i:s\Z');
}

/**
 * Get TTL timestamp (for DynamoDB)
 */
function getTTL($days = 30) {
    return time() + ($days * 24 * 60 * 60);
}

?>
