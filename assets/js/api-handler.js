// api-handler.js - Centralized API Handler
// Handles all external API calls: OTP, DynamoDB, Meritto

/* ============================================================================
   CONFIGURATION
============================================================================ */

const API_CONFIG = {
  OTP_SEND_URL: '/lp/api/send-otp.php',
  OTP_VERIFY_URL: '/lp/api/verify-otp.php',
  DYNAMODB_SAVE_URL: '/lp/api/save-lead.php',
  MERITTO_SUBMIT_URL: '/lp/api/save-lead.php', // Using same endpoint for now
  TIMEOUT: 30000 // 30 seconds
};

/* ============================================================================
   UTILITY FUNCTIONS
============================================================================ */

/**
 * Make HTTP request with timeout
 */
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    // Get response text first, then parse
    const responseText = await response.text();
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If not JSON, use text as-is
      responseData = responseText;
    }

    if (!response.ok) {
      // Log the actual error from PHP
      console.error(`[API] ${response.status} Response:`, responseData);
      
      // If PHP returned an error message, use it
      const errorMsg = responseData?.error || responseData?.message || responseData;
      throw new Error(`HTTP ${response.status}: ${errorMsg}`);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
}

/**
 * Retry logic for failed requests
 */
async function retryRequest(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`Retry ${i + 1}/${maxRetries} after error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

/* ============================================================================
   OTP SERVICES
============================================================================ */

/**
 * Send OTP to phone number
 * @param {string} phone - 10 digit phone number
 * @returns {Promise<Object>} Response with success status
 */
async function sendOTP(phone) {
  console.log(`[API] Sending OTP to ${phone}`);
  
  try {
    const response = await makeRequest(API_CONFIG.OTP_SEND_URL, {
      method: 'POST',
      body: JSON.stringify({ mobile: phone })  // Changed from "phone" to "mobile"
    });

    console.log('[API] OTP sent successfully', response);
    return {
      success: true,
      message: 'OTP sent successfully',
      data: response
    };
  } catch (error) {
    console.error('[API] Send OTP error:', error);
    
    // Try to get more details from the error
    if (error.response) {
      console.error('[API] Error response:', error.response);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify OTP
 * @param {string} phone - 10 digit phone number
 * @param {string} otp - 6 digit OTP
 * @returns {Promise<Object>} Response with verification status
 */
async function verifyOTP(phone, otp) {
  console.log(`[API] Verifying OTP for ${phone}`);
  
  try {
    const response = await makeRequest(API_CONFIG.OTP_VERIFY_URL, {
      method: 'POST',
      body: JSON.stringify({ mobile: phone, otp })  // Changed "phone" to "mobile"
    });

    console.log('[API] OTP verified successfully');
    return {
      success: true,
      message: 'OTP verified successfully',
      data: response
    };
  } catch (error) {
    console.error('[API] Verify OTP error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/* ============================================================================
   DYNAMODB SERVICE
============================================================================ */

/**
 * Save lead data to DynamoDB
 * @param {Object} leadData - Lead information
 * @returns {Promise<Object>} Response with lead ID
 */
async function saveToDynamoDB(leadData) {
  console.log('[API] Saving lead to DynamoDB');
  console.log('[API] DynamoDB URL:', API_CONFIG.DYNAMODB_SAVE_URL);
  
  try {
    // Add metadata
    const payload = {
      ...leadData,
      leadId: generateLeadId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'new'
    };

    console.log('[API] Payload being sent:', payload);

    const response = await retryRequest(
      () => makeRequest(API_CONFIG.DYNAMODB_SAVE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      3 // Retry up to 3 times
    );

    console.log('[API] DynamoDB raw response:', response);
    console.log('[API] Lead saved to DynamoDB successfully:', response.leadId);
    
    return {
      success: true,
      leadId: response.leadId || payload.leadId,
      data: response
    };
  } catch (error) {
    console.error('[API] DynamoDB save error:', error);
    console.error('[API] Error details:', error.message);
    
    // Even if DynamoDB fails, we can continue with Meritto
    // Log the error but don't block the flow
    return {
      success: false,
      error: error.message,
      leadId: generateLeadId() // Fallback ID
    };
  }
}

/* ============================================================================
   MERITTO SERVICE
============================================================================ */

/**
 * Submit lead to Meritto CRM
 * @param {Object} leadData - Lead information
 * @returns {Promise<Object>} Response from Meritto
 */
async function sendToMeritto(leadData) {
  console.log('[API] Submitting to Meritto');
  
  try {
    // Transform data to Meritto format
    const merittoPayload = transformToMerittoFormat(leadData);

    const response = await retryRequest(
      () => makeRequest(API_CONFIG.MERITTO_SUBMIT_URL, {
        method: 'POST',
        body: JSON.stringify(merittoPayload)
      }),
      3 // Retry up to 3 times
    );

    console.log('[API] Lead submitted to Meritto successfully');
    return {
      success: true,
      message: 'Lead submitted to Meritto',
      data: response
    };
  } catch (error) {
    console.error('[API] Meritto submission error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Transform lead data to Meritto CRM format
 */
function transformToMerittoFormat(leadData) {
  return {
    firstName: leadData.name.split(' ')[0] || leadData.name,
    lastName: leadData.name.split(' ').slice(1).join(' ') || '-',
    email: leadData.email,
    mobile: leadData.phone,
    state: leadData.state,
    city: leadData.city,
    program: leadData.department,
    course: leadData.course,
    source: leadData.source || 'Direct',
    medium: leadData.medium || 'None',
    campaign: leadData.campaign || 'MBA Landing Page',
    term: leadData.term || '',
    content: leadData.content || '',
    gclid: leadData.gclid || '',
    fbclid: leadData.fbclid || '',
    referrer: leadData.referrer || 'Direct',
    landing_page: leadData.landing_page || '',
    consent: leadData.consent,
    timestamp: leadData.timestamp || new Date().toISOString()
  };
}

/* ============================================================================
   UTILITY FUNCTIONS
============================================================================ */

/**
 * Generate unique lead ID
 */
function generateLeadId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `LEAD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

/**
 * Validate email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================================
   EXPORT API HANDLER
============================================================================ */

window.APIHandler = {
  // OTP Services
  sendOTP,
  verifyOTP,
  
  // Database Services
  saveToDynamoDB,
  sendToMeritto,
  
  // Utilities
  isValidPhone,
  isValidEmail,
  generateLeadId
};

console.log('✓ API Handler loaded successfully');

/* ============================================================================
   ALTERNATIVE FORMATS (for debugging)
============================================================================ */

// If your PHP expects different field names, try these:

/**
 * Send OTP - Alternative format with mobile field
 */
async function sendOTPAlt1(phone) {
  return await makeRequest(API_CONFIG.OTP_SEND_URL, {
    method: 'POST',
    body: JSON.stringify({ mobile: phone })
  });
}

/**
 * Send OTP - Alternative format with phoneNumber field
 */
async function sendOTPAlt2(phone) {
  return await makeRequest(API_CONFIG.OTP_SEND_URL, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: phone })
  });
}

/**
 * Send OTP - Alternative format with +91 prefix
 */
async function sendOTPAlt3(phone) {
  return await makeRequest(API_CONFIG.OTP_SEND_URL, {
    method: 'POST',
    body: JSON.stringify({ phone: `+91${phone}` })
  });
}

// Export alternatives for testing
window.testOTPFormats = {
  format1: sendOTPAlt1,
  format2: sendOTPAlt2,
  format3: sendOTPAlt3
};

