// page-enhancements.js - Key Highlights, Accreditations, Video Previews

class PageEnhancements {
  constructor() {
    this.init();
  }
  
  async init() {
    await this.loadKeyHighlights();
    await this.loadAccreditations();
    this.setupVideoHoverPreviews();
    this.updateContent();
  }
  
  async loadKeyHighlights() {
    try {
      const response = await fetch('/lp/assets/etc/key-highlights.json');
      const data = await response.json();
      this.renderKeyHighlights(data.highlights);
    } catch (error) {
    }
  }
  
  renderKeyHighlights(highlights) {
    const container = document.getElementById('keyHighlightsContainer');
    if (!container) return;
    
    // Create Swiper container with max-width wrapper
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="swiper keyHighlightsSwiper">
          <div class="swiper-wrapper"></div>
          <div class="swiper-pagination mt-8"></div>
        </div>
      </div>
    `;
    
    const swiperWrapper = container.querySelector('.swiper-wrapper');
    
    // Add slides with redesigned cards
    highlights.forEach((highlight, index) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <div class="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col highlight-card" data-card-id="${index}">
          <!-- Image Section - 4:3 ratio for better balance -->
          <div class="relative w-full overflow-hidden flex-shrink-0" style="padding-top: 66.67%;">
            <img 
              src="${highlight.image}" 
              alt="${highlight.title}"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onerror="this.style.display='none'; this.parentElement.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-blue-700')"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <!-- Content Section -->
          <div class="p-6 flex flex-col flex-1">
            <!-- Title -->
            <h3 class="text-lg font-bold text-blue-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
              ${highlight.title}
            </h3>
            
            <!-- Description with collapse/expand -->
            <div class="description-wrapper mb-4 flex-1">
              <p class="text-gray-600 text-sm leading-relaxed description-text line-clamp-3">
                ${highlight.description}
              </p>
            </div>
            
            <!-- Read More Button - Always visible -->
            <div class="mt-auto pt-3 border-t border-gray-200">
              <button class="read-more-btn inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-all">
                <span class="btn-text">Read More</span>
                <svg class="w-4 h-4 ml-2 transition-transform duration-300 chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      swiperWrapper.appendChild(slide);
    });
    
    // Initialize Swiper
    const swiper = new Swiper('.keyHighlightsSwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: highlights.length > 3,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
    
    // Add Read More toggle functionality
    this.setupReadMoreButtons(swiper);
  }
  
  setupReadMoreButtons(swiper) {
    document.querySelectorAll('.highlight-card').forEach(card => {
      const readMoreBtn = card.querySelector('.read-more-btn');
      const description = card.querySelector('.description-text');
      const btnText = card.querySelector('.btn-text');
      const chevronIcon = card.querySelector('.chevron-icon');
      
      if (!readMoreBtn || !description) return;
      
      readMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isExpanded = card.classList.contains('expanded');
        
        // Close all other cards
        document.querySelectorAll('.highlight-card').forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.classList.remove('expanded');
            otherCard.querySelector('.description-text')?.classList.add('line-clamp-3');
            otherCard.querySelector('.btn-text').textContent = 'Read More';
            otherCard.querySelector('.chevron-icon').style.transform = 'rotate(0deg)';
          }
        });
        
        // Toggle current card
        if (isExpanded) {
          // Collapse
          card.classList.remove('expanded');
          description.classList.add('line-clamp-3');
          btnText.textContent = 'Read More';
          chevronIcon.style.transform = 'rotate(0deg)';
          
          // Resume autoplay
          if (swiper?.autoplay) {
            swiper.autoplay.start();
          }
        } else {
          // Expand
          card.classList.add('expanded');
          description.classList.remove('line-clamp-3');
          btnText.textContent = 'Read Less';
          chevronIcon.style.transform = 'rotate(180deg)';
          
          // Pause autoplay when expanded
          if (swiper?.autoplay) {
            swiper.autoplay.stop();
          }
        }
      });
    });
  }
  
  async loadAccreditations() {
    try {
      const response = await fetch('/lp/assets/etc/accreditations.json');
      const data = await response.json();
      this.renderAccreditations(data.accreditations);
    } catch (error) {
    }
  }
  
  renderAccreditations(accreditations) {
    const container = document.getElementById('accreditationsContainer');
    if (!container) return;
    
    // Create Swiper container with max-width wrapper
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="swiper accreditationsSwiper">
          <div class="swiper-wrapper"></div>
          <div class="swiper-pagination mt-8"></div>
        </div>
      </div>
    `;
    
    const swiperWrapper = container.querySelector('.swiper-wrapper');
    
    // Add slides with redesigned cards
    accreditations.forEach(accreditation => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <div class="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col" style="height: 450px;">
          <!-- Logo Section - Larger area for better logo display -->
          <div class="flex items-center justify-center p-10 flex-shrink-0" style="height: 240px;">
            <div class="w-36 h-36 flex items-center justify-center">
              <img 
                src="${accreditation.logo}" 
                alt="${accreditation.title}"
                class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg\\'>${accreditation.title.substring(0, 2)}</div>'"
              />
            </div>
          </div>
          
          <!-- Content Section -->
          <div class="px-6 pb-6 pt-4 flex flex-col flex-1 text-center border-t border-gray-100">
            <!-- Title -->
            <h3 class="text-base font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
              ${accreditation.title}
            </h3>
            
            <!-- Description -->
            <p class="text-gray-600 text-sm leading-relaxed">
              ${accreditation.description}
            </p>
          </div>
        </div>
      `;
      swiperWrapper.appendChild(slide);
    });
    
    // Initialize Swiper - NO NAVIGATION ARROWS
    new Swiper('.accreditationsSwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: accreditations.length > 3,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
  }
  
  setupVideoHoverPreviews() {
    // Handle regular video tags with data-video-preview attribute
    const videoContainers = document.querySelectorAll('[data-video-preview]');
    
    videoContainers.forEach(container => {
      const video = container.querySelector('video');
      if (!video) return;
      
      // Pause by default
      video.pause();
      video.currentTime = 0;
      video.muted = true; // Mute for autoplay
      
      // Play on hover
      container.addEventListener('mouseenter', () => {
      });
      
      // Pause and reset on leave
      container.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
      
      // Add visual indicator
      const playIcon = document.createElement('div');
      playIcon.className = 'absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 pointer-events-none';
      playIcon.innerHTML = `
        <svg class="w-20 h-20 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      container.appendChild(playIcon);
      
      // Hide play icon on hover
      container.addEventListener('mouseenter', () => {
        playIcon.style.opacity = '0';
      });
      
      container.addEventListener('mouseleave', () => {
        playIcon.style.opacity = '1';
      });
    });
    
    // Handle YouTube videos with youtube-lazy class
    const youtubeVideos = document.querySelectorAll('.youtube-lazy');
    
    youtubeVideos.forEach(container => {
      const videoId = container.getAttribute('data-id');
      if (!videoId) return;
      
      let iframe = null;
      let isLoaded = false;
      
      // Load YouTube iframe on hover
      container.addEventListener('mouseenter', () => {
        if (!isLoaded) {
          // Create iframe
          iframe = document.createElement('iframe');
          iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`);
          iframe.setAttribute('frameborder', '0');
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          iframe.className = 'absolute inset-0 w-full h-full';
          
          // Clear existing content and add iframe
          container.innerHTML = '';
          container.appendChild(iframe);
          isLoaded = true;
        }
      });
      
      // Stop video on mouse leave
      container.addEventListener('mouseleave', () => {
        if (iframe && isLoaded) {
          // Reload iframe to stop video
          const videoId = container.getAttribute('data-id');
          iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`);
          
          // Reset after a moment
          setTimeout(() => {
            container.innerHTML = `
              <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                <div class="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
                  <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Video thumbnail" class="w-full h-full object-cover" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"/>
            `;
            isLoaded = false;
            iframe = null;
          }, 100);
        }
      });
      
      // Add initial thumbnail
      if (!container.querySelector('img')) {
        container.innerHTML = `
          <div class="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all duration-300 z-10">
            <div class="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Video thumbnail" class="w-full h-full object-cover" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'"/>
        `;
      }
    });
  }
  
  updateContent() {
    // Update "Admissions '25" to "Admissions '26"
    document.querySelectorAll('body *').forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        const text = el.textContent;
        if (text.includes("Admissions '25") || text.includes("Admissions 2026")) {
          el.textContent = text
            .replace(/Admissions '25/g, "Admissions '26")
            .replace(/Admissions 2026/g, "Admissions 2026");
        }
        
        // Update NIRF ranking
        if (text.includes("52 amongst top universities") || text.includes("Ranked 52")) {
          el.textContent = text
            .replace(/52 amongst top universities/g, "48 amongst top universities")
            .replace(/Ranked 52/g, "Ranked 48");
        }
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new PageEnhancements();
});
