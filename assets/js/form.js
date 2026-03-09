// form.js - Enhanced Form Handler with State-City Logic, OTP, DynamoDB & Meritto

/* ============================================================================
   GLOBAL STATE
============================================================================ */

let formState = {
  statesCitiesData: null,
  coursesData: null,
  isSubmitting: false,
  leadId: null
};

/* ============================================================================
   INITIALIZATION
============================================================================ */

async function initializeForm() {
  console.log('Initializing form...');

  try {
    // Wait for all required data
    await Promise.all([
      loadStatesCitiesData(),
      loadCoursesData()
    ]);

    // Populate form dropdowns
    populateStates();
    populateDepartments();

    // Attach event listeners
    attachFormEventListeners();

    console.log('✓ Form initialized successfully');
  } catch (error) {
    console.error('Form initialization error:', error);
    showErrorNotification('Failed to initialize form. Please refresh the page.');
  }
}

/**
 * Load states-cities data from JSON
 */
async function loadStatesCitiesData() {
  try {
    const response = await fetch('/lp/assets/etc/states-cities.json');
    if (!response.ok) throw new Error('Failed to load states-cities data');
    
    formState.statesCitiesData = await response.json();
    console.log('✓ Loaded states-cities data:', Object.keys(formState.statesCitiesData).length, 'states');
    
    return formState.statesCitiesData;
  } catch (error) {
    console.error('Error loading states-cities:', error);
    
    // Fallback data
    formState.statesCitiesData = {
      "Delhi": ["New Delhi", "Central Delhi"],
      "Uttarakhand": ["Dehradun", "Haridwar"]
    };
    
    return formState.statesCitiesData;
  }
}

/**
 * Wait for courses data (loaded from course-mapping.json)
 */
async function loadCoursesData() {
  try {
    const response = await fetch('/lp/assets/etc/course-mapping.json');
    if (!response.ok) throw new Error('Failed to load course mapping');
    
    const courses = await response.json();
    formState.coursesData = courses;
    console.log('✓ Loaded course mapping:', courses.length, 'courses');
    
    return courses;
  } catch (error) {
    console.error('Error loading course mapping:', error);
    
    // Fallback data
    formState.coursesData = [
      {title: 'MBA', level: 'PG', department: 'Management'},
      {title: 'MBA with specialization in Finance', level: 'PG', department: 'Management'},
      {title: 'MBA with specialization in Marketing', level: 'PG', department: 'Management'}
    ];
    
    return formState.coursesData;
  }
}

/**
 * Wait for courses data to be loaded
 */
function waitForCoursesData() {
  // Since we're loading it ourselves, just return the load promise
  return loadCoursesData();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForm);
} else {
  initializeForm();
}

/* ============================================================================
   FORM POPULATION
============================================================================ */

/**
 * Populate States dropdown
 */
function populateStates() {
  const stateSelect = document.getElementById('state');
  if (!stateSelect || !formState.statesCitiesData) return;

  // Get sorted states
  const states = Object.keys(formState.statesCitiesData).sort();

  stateSelect.innerHTML = '';

  // Add placeholder
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select State *';
  placeholder.disabled = true;
  placeholder.selected = true;
  stateSelect.appendChild(placeholder);

  // Add states
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });

  console.log(`✓ Populated ${states.length} states`);
}

/**
 * Populate Cities based on selected state
 */
function populateCities(stateName) {
  const citySelect = document.getElementById('city');
  if (!citySelect || !formState.statesCitiesData) return;

  const cities = formState.statesCitiesData[stateName] || [];

  citySelect.innerHTML = '';

  // Add placeholder
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = cities.length > 0 ? 'Select City *' : 'No cities available';
  placeholder.disabled = true;
  placeholder.selected = true;
  citySelect.appendChild(placeholder);

  // Add cities
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });

  // Enable/disable based on availability
  citySelect.disabled = cities.length === 0;

  console.log(`✓ Populated ${cities.length} cities for ${stateName}`);
}

/**
 * Populate Departments dropdown
 */
function populateDepartments() {
  const deptSelect = document.getElementById('department');
  if (!deptSelect || !formState.coursesData) return;

  // Check if this is a department-specific page (CSE, Design, Law, etc.)
  const courseFilter = document.getElementById('courseFilterContainer');
  const pageType = courseFilter?.getAttribute('data-page-type');
  const preDepartment = courseFilter?.getAttribute('data-department');
  
  // If department-specific page, keep the pre-selected value and skip repopulation
  if (pageType === 'department' && preDepartment) {
    console.log(`✓ Department page detected: ${preDepartment} (keeping pre-selected value)`);
    // Ensure the select has the correct value set
    if (deptSelect.options.length > 0 && !deptSelect.value) {
      deptSelect.value = preDepartment;
    }
    return; // Don't repopulate, keep existing HTML
  }

  // For general admission pages, populate all departments
  const departments = Array.from(
    new Set(
      formState.coursesData
        .map(c => c.department?.trim())
        .filter(Boolean)
    )
  ).sort();

  deptSelect.innerHTML = '';

  // Add placeholder
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select Department *';
  placeholder.disabled = true;
  placeholder.selected = true;
  deptSelect.appendChild(placeholder);

  // Add departments
  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept;
    option.textContent = dept;
    deptSelect.appendChild(option);
  });

  console.log(`✓ Populated ${departments.length} departments`);
}

/**
 * Populate Courses based on selected department
 */
function populateCourses(departmentName) {
  const courseSelect = document.getElementById('course');
  if (!courseSelect || !formState.coursesData) return;

  // Determine if this is a PG-only page (MBA, MCA, etc.)
  const isPGPage = window.location.pathname.toLowerCase().includes('/mba/');
  
  let courses = Array.from(
    new Set(
      formState.coursesData
        .filter(c => {
          // Match department
          const deptMatch = c.department?.trim().toLowerCase() === departmentName.toLowerCase();
          
          // If MBA page, exclude UG courses (BBA, etc.)
          if (isPGPage && deptMatch) {
            const title = c.title?.toLowerCase() || '';
            const level = c.level?.toLowerCase() || '';
            
            // Exclude BBA and other UG courses
            if (title.startsWith('bba') || level === 'ug' || level === 'undergraduate') {
              return false;
            }
          }
          
          return deptMatch;
        })
        .map(c => c.title)
    )
  ).sort((a, b) => a.localeCompare(b));

  courseSelect.innerHTML = '';

  // Add placeholder
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = courses.length ? 'Select Course *' : 'Select Department first';
  placeholder.disabled = true;
  placeholder.selected = true;
  courseSelect.appendChild(placeholder);

  // Add courses
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course;
    option.textContent = course;
    courseSelect.appendChild(option);
  });

  courseSelect.disabled = courses.length === 0;

  console.log(`✓ Populated ${courses.length} courses for ${departmentName}` + (isPGPage ? ' (PG only)' : ''));
}

/* ============================================================================
   EVENT LISTENERS
============================================================================ */

function attachFormEventListeners() {
  const form = document.getElementById('admissionForm');
  const stateSelect = document.getElementById('state');
  const deptSelect = document.getElementById('department');
  const phoneInput = document.getElementById('phone');

  // State change -> populate cities
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      const stateName = e.target.value;
      if (stateName) {
        populateCities(stateName);
      }
    });
  }

  // Department change -> populate courses
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      const dept = e.target.value;
      if (dept) {
        populateCourses(dept);
      }
    });
  }

  // Phone input -> only allow digits and trigger OTP
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      // Only allow digits
      const value = e.target.value.replace(/\D/g, '');
      e.target.value = value;

      // Enable/disable verify button based on length
      const verifyBtn = document.getElementById('verifyPhoneBtn');
      if (verifyBtn) {
        verifyBtn.disabled = value.length !== 10 || window.OTPHandler?.isVerified();
        
        // Update button appearance based on verification status
        if (window.OTPHandler?.isVerified()) {
          verifyBtn.textContent = 'Verified ✓';
          verifyBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
          verifyBtn.classList.add('bg-green-600');
        } else if (value.length === 10) {
          verifyBtn.textContent = 'Verify';
          verifyBtn.classList.remove('bg-green-600');
          verifyBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        } else {
          verifyBtn.textContent = 'Verify';
        }
      }
    });
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
    console.log('✓ Form submit event listener attached to form:', form.id);
  } else {
    console.error('❌ Form element not found - submit listener not attached!');
  }
}

/**
 * Handle phone number completion
 */
async function handlePhoneComplete(phone) {
  try {
    // Send OTP
    const response = await window.APIHandler.sendOTP(phone);

    if (response.success) {
      // Show OTP modal
      window.OTPHandler.showModal(phone);
    } else {
      console.error('Failed to send OTP:', response.error);
      showErrorNotification('Failed to send OTP. Please try again.');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    showErrorNotification('Error sending OTP. Please check your connection.');
  }
}

/* ============================================================================
   FORM VALIDATION
============================================================================ */

function validateForm(formData) {
  const errors = [];

  // Name validation
  const name = formData.get('name')?.trim();
  if (!name || name.length < 3 || !/^[a-zA-Z\s]+$/.test(name)) {
    errors.push({
      field: 'name',
      message: 'Enter valid name (min 3 letters, alphabets only)'
    });
  }

  // Email validation
  const email = formData.get('email')?.trim();
  if (!email || !window.APIHandler.isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Enter valid email address'
    });
  }

  // Phone validation
  const phoneInput = document.getElementById('phone');
  const phone = phoneInput?.value?.trim() || formData.get('phone')?.trim();
  
  if (!phone || !window.APIHandler.isValidPhone(phone)) {
    errors.push({
      field: 'phone',
      message: 'Enter valid 10-digit phone number'
    });
  }

  // OTP verification check (skip if phone is already verified/disabled)
  if (!window.OTPHandler?.isVerified() && !phoneInput?.disabled) {
    errors.push({
      field: 'phone',
      message: 'Please verify your phone number with OTP'
    });
  }

  // State validation
  if (!formData.get('state')) {
    errors.push({
      field: 'state',
      message: 'Please select a state'
    });
  }

  // City validation
  if (!formData.get('city')) {
    errors.push({
      field: 'city',
      message: 'Please select a city'
    });
  }

  // Department validation
  if (!formData.get('department')) {
    errors.push({
      field: 'department',
      message: 'Please select a department'
    });
  }

  // Course validation
  if (!formData.get('course')) {
    errors.push({
      field: 'course',
      message: 'Please select a course'
    });
  }

  // Consent validation
  if (!formData.get('consent')) {
    errors.push({
      field: 'consent',
      message: 'You must agree to the terms'
    });
  }

  return errors;
}

/**
 * Show validation errors
 */
function showValidationErrors(errors) {
  // Clear previous errors
  document.querySelectorAll('[id^="error-"]').forEach(el => {
    el.classList.add('hidden');
  });

  // Show new errors
  errors.forEach(error => {
    const errorEl = document.getElementById(`error-${error.field}`);
    if (errorEl) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    }
  });

  // Focus first error field
  if (errors.length > 0) {
    const firstField = document.getElementById(errors[0].field);
    if (firstField) {
      firstField.focus();
      firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/* ============================================================================
   FORM SUBMISSION
============================================================================ */

async function handleFormSubmit(e) {
  e.preventDefault();
  
  console.log('=== FORM SUBMIT TRIGGERED ===');
  console.log('isSubmitting:', formState.isSubmitting);

  if (formState.isSubmitting) {
    console.log('Already submitting, returning');
    return;
  }

  const form = e.target;
  
  // Temporarily enable disabled fields to include in FormData
  const phoneInput = document.getElementById('phone');
  const courseInput = document.getElementById('course');
  const deptInput = document.getElementById('department');
  
  console.log('Field states before enable:', {
    phone: phoneInput?.disabled,
    course: courseInput?.disabled,
    department: deptInput?.disabled
  });
  
  const wasPhoneDisabled = phoneInput?.disabled;
  const wasCourseDisabled = courseInput?.disabled;
  const wasDeptDisabled = deptInput?.disabled;
  
  if (wasPhoneDisabled && phoneInput) phoneInput.disabled = false;
  if (wasCourseDisabled && courseInput) courseInput.disabled = false;
  if (wasDeptDisabled && deptInput) deptInput.disabled = false;
  
  const formData = new FormData(form);
  
  console.log('Form data collected:', {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    state: formData.get('state'),
    city: formData.get('city'),
    department: formData.get('department'),
    course: formData.get('course'),
    consent: formData.get('consent')
  });
  
  console.log('Department field details:', {
    exists: !!deptInput,
    value: deptInput?.value,
    selectedIndex: deptInput?.selectedIndex,
    options: deptInput?.options?.length,
    formDataValue: formData.get('department'),
    isEmpty: !formData.get('department')
  });
  
  // Re-disable fields if they were disabled
  if (wasPhoneDisabled && phoneInput) phoneInput.disabled = true;
  if (wasCourseDisabled && courseInput) courseInput.disabled = true;
  if (wasDeptDisabled && deptInput) deptInput.disabled = true;

  // Validate form
  const errors = validateForm(formData);
  console.log('Validation errors:', errors);
  
  if (errors.length > 0) {
    console.error('VALIDATION FAILED:', errors);
    showValidationErrors(errors);
    return;
  }
  
  console.log('✓ Validation passed, proceeding with submission...');

  // Prepare lead data
  const utmParams = window.UTMHandler ? window.UTMHandler.formatForAPI() : {};
  
  const leadData = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    phone: formData.get('phone')?.trim() || phoneInput?.value?.trim(),
    state: formData.get('state'),
    city: formData.get('city'),
    department: formData.get('department'),
    course: formData.get('course'),
    consent: formData.get('consent') === 'on',
    timestamp: new Date().toISOString(),
    source: utmParams.source || 'Direct',
    medium: utmParams.medium || 'None',
    campaign: utmParams.campaign || 'MBA Landing Page',
    term: utmParams.term || '',
    content: utmParams.content || '',
    page: utmParams.page || '', // Page identifier (e.g., admissions2026)
    gclid: utmParams.gclid || '',
    fbclid: utmParams.fbclid || '',
    referrer: utmParams.referrer || document.referrer || 'Direct',
    landing_page: utmParams.landing_page || window.location.href,
    userAgent: navigator.userAgent
  };

  // Show loading state
  formState.isSubmitting = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn?.textContent;
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin inline-block h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Submitting...
    `;
  }

  try {
    // Save to DynamoDB
    console.log('=== SAVING TO DYNAMODB ===');
    console.log('Lead Data:', leadData);
    console.log('API URL:', window.APIHandler ? 'Available' : 'NOT AVAILABLE');
    
    // Save lead (this handles both DynamoDB AND Meritto in one call)
    console.log('=== SAVING LEAD (DynamoDB + Meritto) ===');
    const saveResponse = await window.APIHandler.saveToDynamoDB(leadData);
    
    console.log('Save Response:', saveResponse);
    
    if (saveResponse.success) {
      formState.leadId = saveResponse.leadId;
      console.log('✓ Lead saved successfully:', formState.leadId);
      
      // Check individual service results (they're in saveResponse.data.details)
      const details = saveResponse.data?.details;
      if (details) {
        if (details.dynamodb?.success) {
          console.log('  ✓ DynamoDB: SUCCESS');
        } else {
          console.warn('  ⚠ DynamoDB: FAILED -', details.dynamodb?.error);
        }
        
        if (details.meritto?.success) {
          console.log('  ✓ Meritto: SUCCESS');
        } else {
          console.warn('  ⚠ Meritto: FAILED -', details.meritto?.error);
        }
      } else {
        // Fallback: if no details, check the raw response
        console.log('  Response details:', saveResponse.data);
      }
    } else {
      console.error('❌ Lead save failed:', saveResponse.error);
      console.error('Full response:', saveResponse);
    }

    // Success! Redirect to thank you page
    const leadId = formState.leadId || Date.now().toString();
    
    // Get current page directory (e.g., /lp/mba/ or /lp/admissions2026/)
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean); // Remove empty strings
    
    // Build thank you page path based on current directory
    let thankyouPath = '/lp/mba/thankyou.html'; // Default fallback
    
    if (pathParts.length >= 2 && pathParts[0] === 'lp') {
      // If we're in /lp/something/, use that directory's thankyou.html
      thankyouPath = `/lp/${pathParts[1]}/thankyou.html`;
    }
    
    // Get all UTM parameters to pass along
    const utmParams = window.UTMHandler ? window.UTMHandler.formatForAPI() : {};
    
    // Build query string with lead ID and all UTM parameters
    const queryParams = new URLSearchParams({
      id: leadId,
      utm_source: utmParams.source || '',
      utm_medium: utmParams.medium || '',
      utm_campaign: utmParams.campaign || '',
      utm_term: utmParams.term || '',
      utm_content: utmParams.content || '',
      utm_page: utmParams.page || '',
      gclid: utmParams.gclid || '',
      fbclid: utmParams.fbclid || ''
    });
    
    // Remove empty parameters
    const finalParams = new URLSearchParams();
    for (const [key, value] of queryParams) {
      if (value) {
        finalParams.append(key, value);
      }
    }
    
    const redirectUrl = `${thankyouPath}?${finalParams.toString()}`;
    console.log('Redirecting to:', redirectUrl);
    
    window.location.href = redirectUrl;

  } catch (error) {
    console.error('Form submission error:', error);
    showErrorNotification('Error submitting form. Please try again.');

    // Restore button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }

    formState.isSubmitting = false;
  }
}

/* ============================================================================
   NOTIFICATIONS
============================================================================ */

function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000]';
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span class="font-semibold">${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/* ============================================================================
   EXPORT
============================================================================ */

window.FormHandler = {
  getLeadId: () => formState.leadId,
  isSubmitting: () => formState.isSubmitting
};

console.log('✓ Form handler loaded successfully');

/* ============================================================================
   GLOBAL FUNCTION FOR VERIFY BUTTON
============================================================================ */

// Called when user clicks "Verify" button
window.triggerOTPVerification = async function() {
  const phoneInput = document.getElementById('phone');
  const verifyBtn = document.getElementById('verifyPhoneBtn');
  
  if (!phoneInput || !verifyBtn) return;
  
  const phone = phoneInput.value.trim();
  
  if (phone.length !== 10) {
    showErrorNotification('Please enter a valid 10-digit phone number');
    return;
  }
  
  // Disable button and show loading
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = `
    <svg class="animate-spin h-3 w-3 inline-block" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Sending...
  `;
  
  try {
    // Send OTP
    const response = await window.APIHandler.sendOTP(phone);
    
    if (response.success) {
      // Show OTP modal
      window.OTPHandler.showModal(phone);
      
      // Reset button
      verifyBtn.textContent = 'Verify';
      verifyBtn.disabled = false;
    } else {
      console.error('Failed to send OTP:', response.error);
      showErrorNotification('Failed to send OTP. Please try again.');
      verifyBtn.textContent = 'Verify';
      verifyBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    showErrorNotification('Error sending OTP. Please check your connection.');
    verifyBtn.textContent = 'Verify';
    verifyBtn.disabled = false;
  }
};
