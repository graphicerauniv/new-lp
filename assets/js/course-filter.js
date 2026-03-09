// course-filter.js - Dynamic Course Filtering System

class CourseFilter {
  constructor(options = {}) {
    this.pageType = options.pageType || 'general'; // 'general', 'department', 'course'
    this.department = options.department || null; // e.g., 'Management', 'Design'
    this.coursePrefix = options.coursePrefix || null; // e.g., 'MBA', 'B.Tech'
    this.coursesData = [];
    this.filteredCourses = [];
    this.swiper = null; // Swiper instance
    
    this.init();
  }
  
  async init() {
    await this.loadCourses();
    this.setupUI();
    this.attachEventListeners();
    this.filterCourses();
  }
  
  async loadCourses() {
    try {
      // Load from the new courses.json file
      const response = await fetch('/lp/assets/etc/courses.json');
      const data = await response.json();
      
      // Data is already a flat array of courses
      this.coursesData = data;
      
    } catch (error) {
    }
  }
  
  setupUI() {
    const filterContainer = document.getElementById('courseFilterContainer');
    if (!filterContainer) return;
    
    let html = '<div class="max-w-7xl mx-auto px-6">';
    html += '<div class="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-12">';
    
    // Desktop: Single line layout, Mobile: Multi-line
    html += '<div class="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">';
    
    // Search field (takes up more space on desktop)
    html += `
      <div class="md:col-span-5">
        <input 
          type="text" 
          id="courseSearch" 
          placeholder="Search courses by name or keyword..." 
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400 transition-all"
        />
      </div>
    `;
    
    // Level and Department filters (only for general page)
    if (this.pageType === 'general') {
      html += `
        <div class="md:col-span-3">
          <select id="levelFilter" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition-all">
            <option value="">Select Level</option>
            <option value="UG">Undergraduate</option>
            <option value="PG">Postgraduate</option>
            <option value="Diploma">Diploma</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
      `;
      
      html += `
        <div class="md:col-span-3">
          <select id="departmentFilter" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition-all">
            <option value="">Select Department</option>
            <option value="Aerospace Engineering">Aerospace Engineering</option>
            <option value="Allied Sciences">Allied Sciences</option>
            <option value="Biosciences">Biosciences</option>
            <option value="Biotechnology">Biotechnology</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Commerce">Commerce</option>
            <option value="Computer Application">Computer Application</option>
            <option value="Computer Science Engineering">Computer Science Engineering</option>
            <option value="Design">Design</option>
            <option value="Earth Sciences">Earth Sciences</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
            <option value="Food Science & Technology">Food Science & Technology</option>
            <option value="Hospitality Management">Hospitality Management</option>
            <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
            <option value="Law">Law</option>
            <option value="Management">Management</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Nursing">Nursing</option>
            <option value="Paramedical">Paramedical</option>
          </select>
        </div>
      `;
      
      html += `
        <div class="md:col-span-1">
          <button 
            id="clearFilters" 
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-yellow-600 transition-all duration-300 text-sm shadow-md hover:shadow-lg"
          >
            Clear
          </button>
        </div>
      `;
    } else {
      // For department-specific pages, show search + level filter
      html += `
        <div class="md:col-span-4">
          <select id="levelFilter" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition-all">
            <option value="">Select Level</option>
            <option value="UG">Undergraduate</option>
            <option value="PG">Postgraduate</option>
            <option value="Diploma">Diploma</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
      `;
      
      html += `
        <div class="md:col-span-3">
          <button 
            id="clearFilters" 
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-yellow-600 transition-all duration-300 text-sm shadow-md hover:shadow-lg"
          >
            Clear
          </button>
        </div>
      `;
    }
    
    html += '</div></div></div>';
    
    // Results container
    html += `
      <div class="max-w-7xl mx-auto px-6 mt-8">
        <!-- Swiper Container -->
        <div class="swiper courseSwiper" id="courseSwiperContainer">
          <div class="swiper-wrapper" id="courseResults">
            <!-- Course cards will be inserted here -->
          </div>
        </div>
        
        <div id="noResults" class="hidden mt-8 text-center py-12">
          <p class="text-lg text-gray-500">No courses found matching your search input criteria.</p>
        </div>
      </div>
      
      <style>
        /* Swiper customization */
        .courseSwiper {
          padding: 40px 0;
        }
        
        /* Grid layout for cards in each slide */
        .swiper-slide {
          height: auto !important;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: minmax(auto, 1fr);
          gap: 32px;
        }
        
        /* Course cards - prevent stretching */
        .course-card {
          display: flex;
          flex-direction: column;
          align-self: start;
        }
        
        @media (max-width: 768px) {
          .swiper-slide {
            grid-template-columns: 1fr;
            grid-auto-rows: auto;
            gap: 24px;
          }
          
          .courseSwiper {
            padding: 20px 0;
          }
        }
        
        /* Expanded card animation */
        .expanded-content {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
      </style>
    `;
    
    filterContainer.innerHTML = html;
  }
  
  attachEventListeners() {
    const searchInput = document.getElementById('courseSearch');
    const levelFilter = document.getElementById('levelFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const clearBtn = document.getElementById('clearFilters');
    
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterCourses());
    }
    
    if (levelFilter) {
      levelFilter.addEventListener('change', () => this.filterCourses());
    }
    
    if (departmentFilter) {
      departmentFilter.addEventListener('change', () => this.filterCourses());
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFilters());
    }
  }
  
  filterCourses() {
    const searchTerm = document.getElementById('courseSearch')?.value.toLowerCase() || '';
    const levelFilter = document.getElementById('levelFilter')?.value || '';
    const departmentFilter = document.getElementById('departmentFilter')?.value || '';
    
    this.filteredCourses = this.coursesData.filter(course => {
      // Search in title and description
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm) ||
        (course.description && course.description.toLowerCase().includes(searchTerm));
      
      // Filter by level
      const matchesLevel = !levelFilter || course.level === levelFilter;
      
      // Filter by department (for general page)
      let matchesDepartment = true;
      if (this.pageType === 'general' && departmentFilter) {
        matchesDepartment = course.department === departmentFilter;
      } else if (this.pageType === 'department' && this.department) {
        // For department pages, filter by department
        matchesDepartment = course.department === this.department;
      }
      
      // Filter by course prefix/keyword (for department pages like MBA)
      let matchesCourseKeyword = true;
      if (this.pageType === 'department' && this.department === 'Management') {
        // MBA page: Only show courses with "MBA" in title
        matchesCourseKeyword = course.title.toUpperCase().includes('MBA');
      } else if (this.pageType === 'course' && this.coursePrefix) {
        // Course-specific pages
        matchesCourseKeyword = course.title.startsWith(this.coursePrefix);
      }
      
      return matchesSearch && matchesLevel && matchesDepartment && matchesCourseKeyword;
    });
    
    this.renderCourses();
  }
  
  renderCourses() {
    const resultsContainer = document.getElementById('courseResults');
    const swiperContainer = document.getElementById('courseSwiperContainer');
    const noResults = document.getElementById('noResults');
    
    if (!resultsContainer) return;
    
    if (this.filteredCourses.length === 0) {
      // Destroy existing swiper if any
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }
      
      // Clear content
      resultsContainer.innerHTML = '';
      
      // Hide entire Swiper container, show no results message
      swiperContainer?.classList.add('hidden');
      noResults?.classList.remove('hidden');
      return;
    }
    
    // Show Swiper container, hide no results message
    swiperContainer?.classList.remove('hidden');
    noResults?.classList.add('hidden');
    
    // Group courses into slides (6 per slide for desktop: 2 rows x 3 cols)
    const isMobile = window.innerWidth < 768;
    const cardsPerSlide = isMobile ? 2 : 6;
    const slides = [];
    
    for (let i = 0; i < this.filteredCourses.length; i += cardsPerSlide) {
      const slideCards = this.filteredCourses.slice(i, i + cardsPerSlide);
      slides.push(slideCards);
    }
    
    // Build slides
    resultsContainer.innerHTML = slides.map((slideCards, slideIndex) => {
      const cardsHTML = slideCards.map((course, cardIndex) => {
        const globalIndex = (slideIndex * cardsPerSlide) + cardIndex;
        return `
          <div class="course-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200" 
               id="card-${globalIndex}" 
               data-expanded="false">
            <!-- Course Title -->
            <h3 class="text-xl font-bold text-blue-700 mb-3">${course.title}</h3>
            
            <!-- Department, Level, Duration -->
            <p class="text-sm text-gray-500 mb-5">
              ${course.department} • ${course.level || 'PG'} • ${course.duration || '2 Years'}
            </p>
            
            <!-- Bullets (always visible, first 3) -->
            ${course.bullets && course.bullets.length > 0 ? `
              <ul class="mb-6 space-y-2.5">
                ${course.bullets.slice(0, 3).map(bullet => `
                  <li class="flex items-start gap-2 text-sm text-gray-700">
                    <span class="text-gray-900 font-bold mt-0.5">•</span>
                    <span>${bullet}</span>
                  </li>
                `).join('')}
              </ul>
            ` : ''}
            
            <!-- Expanded Content (hidden by default) -->
            <div class="expanded-content hidden" id="expanded-${globalIndex}">
              <!-- Full Description -->
              ${course.description ? `
                <div class="mb-4 pt-4 border-t border-gray-200">
                  <p class="text-sm text-gray-700 leading-relaxed">
                    ${course.description}
                  </p>
                </div>
              ` : ''}
              
              <!-- Apply Now Button (shown only when expanded) -->
              <button 
                class="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 mb-3"
                onclick="selectCourse('${course.title.replace(/'/g, "\\'")}', '${course.department.replace(/'/g, "\\'")}')"
              >
                Apply Now
              </button>
              
              <!-- Collapse Button -->
              <button 
                class="text-blue-600 hover:text-blue-800 text-sm font-semibold py-2 flex items-center gap-1"
                onclick="toggleCard(${globalIndex})"
              >
                Collapse ▲
              </button>
            </div>
            
            <!-- Read More Button (shown when collapsed) -->
            <button 
              class="read-more-btn text-blue-600 hover:text-blue-800 text-sm font-semibold py-2 flex items-center gap-1 mt-2"
              onclick="toggleCard(${globalIndex})"
              id="readmore-${globalIndex}"
            >
              Read More ▼
            </button>
          </div>
        `;
      }).join('');
      
      return `<div class="swiper-slide">${cardsHTML}</div>`;
    }).join('');
    
    // Initialize Swiper after rendering
    this.initSwiper();
  }
  
  initSwiper() {
    // Destroy existing swiper if any
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
    
    // Wait for DOM update
    setTimeout(() => {
      this.swiper = new Swiper('.courseSwiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        autoplay: {
          delay: 5000,
          disableOnInteraction: true, // Pause when user interacts
        },
        loop: true,
        speed: 800,
      });
    }, 100);
  }
  
  clearFilters() {
    const searchInput = document.getElementById('courseSearch');
    const levelFilter = document.getElementById('levelFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    
    if (searchInput) searchInput.value = '';
    if (levelFilter) levelFilter.value = '';
    if (departmentFilter) departmentFilter.value = '';
    
    this.filterCourses();
  }
}

// Function to toggle card expand/collapse
function toggleCard(index) {
  const card = document.getElementById(`card-${index}`);
  const expandedContent = document.getElementById(`expanded-${index}`);
  const readMoreBtn = document.getElementById(`readmore-${index}`);
  
  if (!card || !expandedContent || !readMoreBtn) return;
  
  const isExpanded = card.dataset.expanded === 'true';
  
  // Get swiper instance from window
  const swiperInstance = document.querySelector('.courseSwiper')?.swiper;
  
  if (isExpanded) {
    // Collapse this card
    expandedContent.classList.add('hidden');
    readMoreBtn.classList.remove('hidden');
    card.dataset.expanded = 'false';
    card.classList.remove('ring-2', 'ring-blue-500');
    
    // Resume autoplay
    if (swiperInstance && swiperInstance.autoplay) {
      swiperInstance.autoplay.start();
    }
  } else {
    // Pause autoplay when expanding
    if (swiperInstance && swiperInstance.autoplay) {
      swiperInstance.autoplay.stop();
    }
    
    // Collapse all other cards first
    document.querySelectorAll('.course-card[data-expanded="true"]').forEach(otherCard => {
      const otherIndex = otherCard.id.replace('card-', '');
      const otherExpanded = document.getElementById(`expanded-${otherIndex}`);
      const otherReadMore = document.getElementById(`readmore-${otherIndex}`);
      
      if (otherExpanded && otherReadMore) {
        otherExpanded.classList.add('hidden');
        otherReadMore.classList.remove('hidden');
        otherCard.dataset.expanded = 'false';
        otherCard.classList.remove('ring-2', 'ring-blue-500');
      }
    });
    
    // Expand this card
    expandedContent.classList.remove('hidden');
    readMoreBtn.classList.add('hidden');
    card.dataset.expanded = 'true';
    card.classList.add('ring-2', 'ring-blue-500');
    
    // Scroll card into view
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

// Function to select a course and scroll to form
function selectCourse(courseTitle, department) {
  // Pre-fill form
  const deptSelect = document.getElementById('department');
  const courseSelect = document.getElementById('course');
  
  if (deptSelect) {
    deptSelect.value = department;
    deptSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
      if (courseSelect) {
        for (let option of courseSelect.options) {
          if (option.text === courseTitle) {
            option.selected = true;
            break;
          }
        }
      }
      
      // Scroll to form
      const formContainer = document.getElementById('formContainer');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight form briefly
        formContainer.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          formContainer.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
        }, 2000);
      }
    }, 500);
  }
}

// Initialize based on page type
document.addEventListener('DOMContentLoaded', function() {
  const filterContainer = document.getElementById('courseFilterContainer');
  if (!filterContainer) return;
  
  // Determine page type from data attribute or URL
  const pageType = filterContainer.dataset.pageType || 'general';
  const department = filterContainer.dataset.department || null;
  const coursePrefix = filterContainer.dataset.coursePrefix || null;
  
  new CourseFilter({
    pageType,
    department,
    coursePrefix
  });
});
