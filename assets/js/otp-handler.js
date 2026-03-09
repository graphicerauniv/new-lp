// otp-handler.js - OTP Verification UI and Logic

/* ============================================================================
   STATE MANAGEMENT
============================================================================ */

let otpState = {
  sent: false,
  verified: false,
  phone: null,
  attempts: 0,
  maxAttempts: 3,
  resendTimer: null,
  resendCountdown: 30
};

/* ============================================================================
   OTP MODAL UI
============================================================================ */

/**
 * Show OTP modal
 */
function showOTPModal(phone) {
  // Remove existing modal if any
  const existingModal = document.getElementById('otpModal');
  if (existingModal) existingModal.remove();

  otpState.phone = phone;
  otpState.sent = true;

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'otpModal';
  modal.className = 'fixed inset-0 flex items-center justify-center';
  modal.style.cssText = 'z-index: 99999 !important; position: fixed !important; background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" style="position: relative; z-index: 100000;">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-800">Verify Phone Number</h3>
        <button id="closeOtpModal" class="text-gray-400 hover:text-gray-600 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-6">
        Enter the 6-digit OTP sent to 
        <span class="font-semibold text-gray-800">+91 ${formatPhoneDisplay(phone)}</span>
      </p>

      <!-- OTP Input -->
      <div class="mb-6">
        <div class="flex gap-2 justify-center mb-2">
          <input type="text" maxlength="1" class="otp-digit w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" data-index="0" />
          <input type="text" maxlength="1" class="otp-digit w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" data-index="1" />
          <input type="text" maxlength="1" class="otp-digit w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" data-index="2" />
          <input type="text" maxlength="1" class="otp-digit w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" data-index="3" />
          <input type="text" maxlength="1" class="otp-digit w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" data-index="4" />
          <input type="text" maxlength="1" class="otp-digit w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" data-index="5" />
        </div>
        <p id="otpError" class="text-red-500 text-xs mt-2 hidden"></p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          id="verifyOtpBtn" 
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg py-3 font-semibold shadow-md transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify OTP
        </button>

        <div class="flex items-center justify-center gap-2 text-sm">
          <span class="text-gray-600">Didn't receive OTP?</span>
          <button 
            id="resendOtpBtn" 
            class="text-blue-600 font-semibold hover:text-blue-700 transition disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled
          >
            Resend <span id="resendTimer">(30s)</span>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-4 p-3 bg-blue-50 rounded-lg">
        <p class="text-xs text-blue-800">
          <strong>Note:</strong> OTP is valid for 2 minutes. Please check your SMS inbox.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Initialize OTP inputs
  initializeOTPInputs();

  // Attach event listeners
  attachOTPModalListeners();

  // Start resend countdown
  startResendCountdown();

  // Focus first input
  const firstInput = modal.querySelector('.otp-digit[data-index="0"]');
  if (firstInput) firstInput.focus();
}

/**
 * Initialize OTP input behavior
 */
function initializeOTPInputs() {
  const inputs = document.querySelectorAll('.otp-digit');

  inputs.forEach((input, index) => {
    // Only allow numbers
    input.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '');
      e.target.value = value;

      // Auto-focus next input
      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Auto-verify when all 6 digits entered
      if (index === 5 && value) {
        setTimeout(() => {
          const otp = getOTPValue();
          if (otp.length === 6) {
            handleVerifyOTP();
          }
        }, 100);
      }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }

      // Handle Enter key
      if (e.key === 'Enter') {
        handleVerifyOTP();
      }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
      
      if (pastedData.length === 6) {
        pastedData.split('').forEach((digit, i) => {
          if (inputs[i]) inputs[i].value = digit;
        });
        inputs[5].focus();
      }
    });
  });
}

/**
 * Attach modal event listeners
 */
function attachOTPModalListeners() {
  // Verify button
  document.getElementById('verifyOtpBtn')?.addEventListener('click', handleVerifyOTP);

  // Resend button
  document.getElementById('resendOtpBtn')?.addEventListener('click', handleResendOTP);

  // Close button
  document.getElementById('closeOtpModal')?.addEventListener('click', () => {
    document.getElementById('otpModal')?.remove();
  });

  // Close on outside click
  document.getElementById('otpModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'otpModal') {
      document.getElementById('otpModal')?.remove();
    }
  });
}

/**
 * Get OTP value from inputs
 */
function getOTPValue() {
  const inputs = document.querySelectorAll('.otp-digit');
  return Array.from(inputs).map(input => input.value).join('');
}

/**
 * Clear OTP inputs
 */
function clearOTPInputs() {
  document.querySelectorAll('.otp-digit').forEach(input => {
    input.value = '';
  });
  document.querySelector('.otp-digit[data-index="0"]')?.focus();
}

/**
 * Show OTP error
 */
function showOTPError(message) {
  const errorEl = document.getElementById('otpError');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    
    // Shake animation
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(input => {
      input.classList.add('border-red-500');
    });

    setTimeout(() => {
      inputs.forEach(input => {
        input.classList.remove('border-red-500');
      });
    }, 2000);
  }
}

/**
 * Format phone for display
 */
function formatPhoneDisplay(phone) {
  return `${phone.slice(0, 3)} *** ${phone.slice(-3)}`;
}

/* ============================================================================
   OTP ACTIONS
============================================================================ */

/**
 * Handle verify OTP
 */
async function handleVerifyOTP() {
  const otp = getOTPValue();

  if (otp.length !== 6) {
    showOTPError('Please enter complete 6-digit OTP');
    return;
  }

  // Check max attempts
  if (otpState.attempts >= otpState.maxAttempts) {
    showOTPError('Maximum verification attempts exceeded. Please request a new OTP.');
    return;
  }

  otpState.attempts++;

  // Show loading state
  const verifyBtn = document.getElementById('verifyOtpBtn');
  const originalText = verifyBtn?.textContent;
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
  }

  try {
    // Call API
    const response = await window.APIHandler.verifyOTP(otpState.phone, otp);

    if (response.success) {
      // Success!
      otpState.verified = true;
      
      // Show success state
      document.getElementById('otpModal')?.remove();
      
      // Mark phone as verified in form
      markPhoneAsVerified(otpState.phone);
      
      // Show success message (commented out - using subtle badge instead)
      // showSuccessNotification('Phone number verified successfully!');
      
    } else {
      // Failed verification
      showOTPError(response.error || 'Invalid OTP. Please try again.');
      clearOTPInputs();
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    showOTPError('Verification failed. Please try again.');
    clearOTPInputs();
  } finally {
    // Restore button
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.textContent = originalText;
    }
  }
}

/**
 * Handle resend OTP
 */
async function handleResendOTP() {
  const resendBtn = document.getElementById('resendOtpBtn');
  const originalText = resendBtn?.textContent;

  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
  }

  try {
    const response = await window.APIHandler.sendOTP(otpState.phone);

    if (response.success) {
      // Reset state
      otpState.attempts = 0;
      clearOTPInputs();
      
      // Show success
      showSuccessNotification('OTP resent successfully!');
      
      // Restart countdown
      startResendCountdown();
    } else {
      showOTPError('Failed to resend OTP. Please try again.');
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    showOTPError('Failed to resend OTP. Please try again.');
  } finally {
    if (resendBtn) {
      resendBtn.textContent = originalText;
    }
  }
}

/**
 * Start resend countdown timer
 */
function startResendCountdown() {
  const resendBtn = document.getElementById('resendOtpBtn');
  const timerSpan = document.getElementById('resendTimer');
  
  let countdown = otpState.resendCountdown;
  
  if (resendBtn) resendBtn.disabled = true;

  const timer = setInterval(() => {
    countdown--;
    
    if (timerSpan) {
      timerSpan.textContent = `(${countdown}s)`;
    }

    if (countdown <= 0) {
      clearInterval(timer);
      if (resendBtn) {
        resendBtn.disabled = false;
      }
      if (timerSpan) {
        timerSpan.textContent = '';
      }
    }
  }, 1000);

  otpState.resendTimer = timer;
}

/**
 * Mark phone as verified in the form
 */
function markPhoneAsVerified(phone) {
  const phoneInput = document.getElementById('phone');
  const verifyBtn = document.getElementById('verifyPhoneBtn');
  const verifiedBadge = document.getElementById('phone-verified');
  
  if (phoneInput) {
    phoneInput.classList.remove('border-gray-300');
    phoneInput.classList.add('border-green-500', 'bg-green-50');
    phoneInput.disabled = true;
  }
  
  // Update verify button
  if (verifyBtn) {
    verifyBtn.textContent = 'Verified ✓';
    verifyBtn.disabled = true;
    verifyBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    verifyBtn.classList.add('bg-green-600');
  }
  
  // Don't show our badge - backend shows its own
  // if (verifiedBadge) {
  //   verifiedBadge.classList.remove('hidden');
  // }
}

/**
 * Show success notification
 */
function showSuccessNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] animate-slide-in';
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span class="font-semibold">${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ============================================================================
   PUBLIC API
============================================================================ */

window.OTPHandler = {
  showModal: showOTPModal,
  isVerified: () => otpState.verified,
  getPhone: () => otpState.phone,
  reset: () => {
    otpState = {
      sent: false,
      verified: false,
      phone: null,
      attempts: 0,
      maxAttempts: 3,
      resendTimer: null,
      resendCountdown: 30
    };
  }
};

console.log('✓ OTP Handler loaded successfully');

/* ============================================================================
   MAKE BACKEND VERIFIED TEXT GREEN
============================================================================ */

// Watch for any "Verified" text appearing and make it green
function makeVerifiedTextGreen() {
  const phoneField = document.getElementById('phone');
  if (!phoneField) return;
  
  // Find any sibling elements with "Verified" text
  let nextElement = phoneField.nextElementSibling;
  while (nextElement) {
    if (nextElement.textContent && nextElement.textContent.includes('Verified')) {
      nextElement.style.color = '#16a34a'; // Green
      nextElement.style.fontWeight = '600';
      nextElement.classList.remove('text-white');
      nextElement.classList.add('text-green-600');
    }
    nextElement = nextElement.nextElementSibling;
  }
  
  // Also check parent's children
  const parent = phoneField.parentElement;
  if (parent) {
    const allElements = parent.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.textContent && el.textContent.trim() === 'Verified ✓') {
        el.style.color = '#16a34a';
        el.style.fontWeight = '600';
        el.classList.remove('text-white');
        el.classList.add('text-green-600');
      }
    });
  }
}

// Call this after marking phone as verified
const originalMarkPhoneAsVerified = markPhoneAsVerified;
markPhoneAsVerified = function(phone) {
  originalMarkPhoneAsVerified(phone);
  setTimeout(makeVerifiedTextGreen, 100);
  setTimeout(makeVerifiedTextGreen, 500); // Try again in case it appeared late
};

