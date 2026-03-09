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
      waitForCoursesData()
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
    const response = await fetch('/assets/etc/states-cities.json');
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
 * Wait for courses data (loaded by courses.js)
 */
function waitForCoursesData() {
  return new Promise((resolve) => {
    function check() {
      if (typeof coursesData !== 'undefined' && coursesData.length > 0) {
        formState.coursesData = coursesData;
        console.log('✓ Courses data available:', coursesData.length, 'courses');
        resolve(coursesData);
      } else {
        setTimeout(check, 100);
      }
    }
    check();
  });
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

  const courses = Array.from(
    new Set(
      formState.coursesData
        .filter(c => c.department?.trim().toLowerCase() === departmentName.toLowerCase())
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

  console.log(`✓ Populated ${courses.length} courses for ${departmentName}`);
}

/* ============================================================================
   EVENT LISTENERS
============================================================================ */

function attachFormEventListeners() {
  const form = document.getElementById('admissionForm');
  const stateSelect = document.getElementById('state');
  const deptSelect = document.getElementById('department');
  const phoneInput = document.getElementById('phone');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const citySelect = document.getElementById('city');
  const courseSelect = document.getElementById('course');
  const consentCheckbox = document.getElementById('consent');

  // Name input -> hide error on valid input
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      const errorEl = document.getElementById('error-name');
      
      if (value.length >= 3 && /^[a-zA-Z\s]+$/.test(value)) {
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // Email input -> hide error on valid input
  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      const errorEl = document.getElementById('error-email');
      
      if (window.APIHandler?.isValidEmail(value)) {
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // Phone input -> only allow digits, trigger OTP, and hide error on valid input
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      // Only allow digits
      const value = e.target.value.replace(/\D/g, '');
      e.target.value = value;

      // Hide error if valid length
      const errorEl = document.getElementById('error-phone');
      if (value.length === 10) {
        if (errorEl) errorEl.classList.add('hidden');
      }

      // Auto-trigger OTP when 10 digits entered
      if (value.length === 10 && !window.OTPHandler?.isVerified()) {
        handlePhoneComplete(value);
      }
    });
  }

  // State change -> populate cities and hide error
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      const stateName = e.target.value;
      const errorEl = document.getElementById('error-state');
      
      if (stateName) {
        populateCities(stateName);
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // City change -> hide error
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      const cityName = e.target.value;
      const errorEl = document.getElementById('error-city');
      
      if (cityName) {
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // Department change -> populate courses and hide error
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      const dept = e.target.value;
      const errorEl = document.getElementById('error-department');
      
      if (dept) {
        populateCourses(dept);
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // Course change -> hide error
  if (courseSelect) {
    courseSelect.addEventListener('change', (e) => {
      const course = e.target.value;
      const errorEl = document.getElementById('error-course');
      
      if (course) {
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // Consent checkbox -> hide error
  if (consentCheckbox) {
    consentCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const errorEl = document.getElementById('error-consent');
      
      if (isChecked) {
        if (errorEl) errorEl.classList.add('hidden');
      }
    });
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
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
  const phone = formData.get('phone')?.trim();
  if (!phone || !window.APIHandler.isValidPhone(phone)) {
    errors.push({
      field: 'phone',
      message: 'Enter valid 10-digit phone number'
    });
  }

  // OTP verification check
  if (!window.OTPHandler?.isVerified()) {
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

  if (formState.isSubmitting) return;

  const form = e.target;
  const formData = new FormData(form);

  // Validate form
  const errors = validateForm(formData);
  if (errors.length > 0) {
    showValidationErrors(errors);
    return;
  }

  // Prepare lead data
  const leadData = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    phone: formData.get('phone').trim(),
    state: formData.get('state'),
    city: formData.get('city'),
    department: formData.get('department'),
    course: formData.get('course'),
    consent: formData.get('consent') === 'on',
    timestamp: new Date().toISOString(),
    source: window.location.href,
    userAgent: navigator.userAgent,
    referrer: document.referrer || 'direct'
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
    console.log('Saving to DynamoDB...');
    const dynamoResponse = await window.APIHandler.saveToDynamoDB(leadData);
    
    if (dynamoResponse.success) {
      formState.leadId = dynamoResponse.leadId;
      console.log('✓ Saved to DynamoDB:', formState.leadId);
    } else {
      console.warn('DynamoDB save failed:', dynamoResponse.error);
      // Continue with Meritto even if DynamoDB fails
    }

    // Send to Meritto
    console.log('Sending to Meritto...');
    const merittoResponse = await window.APIHandler.sendToMeritto(leadData);
    
    if (merittoResponse.success) {
      console.log('✓ Sent to Meritto successfully');
    } else {
      console.warn('Meritto submission failed:', merittoResponse.error);
    }

    // Success! Redirect to thank you page
    const leadId = formState.leadId || Date.now().toString();
    window.location.href = `/mba/thankyou.html?id=${leadId}`;

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
