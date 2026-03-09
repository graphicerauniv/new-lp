// utm-handler.js - UTM Parameter Capture and Storage
// FIXED VERSION - Auto-detects page from URL path

/* ============================================================================
   UTM PARAMETER HANDLER
============================================================================ */

/**
 * Get UTM parameters from URL
 */
function getUTMParameters() {
  const params = new URLSearchParams(window.location.search);
  
  // Auto-detect page from URL path if not provided via URL parameter
  let autoPage = '';
  const pathname = window.location.pathname.toLowerCase();
  
  // Extract page identifier from path (e.g., /lp/cse/ -> cse)
  if (pathname.includes('/lp/')) {
    const parts = pathname.split('/').filter(Boolean);
    const lpIndex = parts.indexOf('lp');
    if (lpIndex >= 0 && parts.length > lpIndex + 1) {
      autoPage = parts[lpIndex + 1]; // e.g., 'cse', 'mba', 'design'
    }
  }
  
    pathname: pathname,
    autoDetected: autoPage,
    urlParam: params.get('utm_page') || params.get('page') || 'none'
  });
  
  return {
    utm_source: params.get('utm_source') || params.get('source') || 'Direct',
    utm_medium: params.get('utm_medium') || params.get('medium') || 'None',
    utm_campaign: params.get('utm_campaign') || params.get('campaign') || 'Landing Page',
    utm_term: params.get('utm_term') || params.get('term') || '',
    utm_content: params.get('utm_content') || params.get('content') || '',
    utm_page: params.get('utm_page') || params.get('page') || autoPage, // AUTO-DETECTS from URL path!
    gclid: params.get('gclid') || '', // Google Ads Click ID
    fbclid: params.get('fbclid') || '', // Facebook Click ID
    referrer: document.referrer || 'Direct',
    landing_page: window.location.href,
    timestamp: new Date().toISOString()
  };
}

/**
 * Store UTM parameters in sessionStorage for later use
 */
function storeUTMParameters() {
  const utmParams = getUTMParameters();
  
  try {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  } catch (error) {
  }
  
  return utmParams;
}

/**
 * Get stored UTM parameters or capture fresh ones
 */
function getStoredUTMParameters() {
  try {
    const stored = sessionStorage.getItem('utm_params');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
  }
  
  // If not stored, capture and store fresh
  return storeUTMParameters();
}

/**
 * Format UTM parameters for API submission
 */
function formatUTMForAPI() {
  const utm = getStoredUTMParameters();
  
  return {
    source: utm.utm_source,
    medium: utm.utm_medium,
    campaign: utm.utm_campaign,
    term: utm.utm_term,
    content: utm.utm_content,
    page: utm.utm_page, // Page identifier (auto-detected or from URL param)
    gclid: utm.gclid,
    fbclid: utm.fbclid,
    referrer: utm.referrer,
    landing_page: utm.landing_page
  };
}

// Auto-capture UTM parameters on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', storeUTMParameters);
} else {
  storeUTMParameters();
}

// Export for use in other scripts
window.UTMHandler = {
  get: getUTMParameters,
  getStored: getStoredUTMParameters,
  formatForAPI: formatUTMForAPI,
  store: storeUTMParameters
};

