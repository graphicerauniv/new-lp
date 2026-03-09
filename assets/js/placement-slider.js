// Infinite Placement Slider
(function() {
  const placementSliderContainer = document.getElementById('placementStoriesSlider');
  if (!placementSliderContainer) return;

  const department = placementSliderContainer.dataset.department || 'mba';
  const jsonFile = `/lp/assets/etc/${department}-placements.json`;

  fetch(jsonFile)
    .then(response => response.json())
    .then(placements => {
      renderPlacementSlider(placements);
    })
    .catch(error => {
    });

  function renderPlacementSlider(placements) {
    // Triple the cards for infinite loop
    const duplicatedPlacements = [...placements, ...placements, ...placements];
    
    const sliderHTML = `
      <div class="overflow-hidden">
        <div class="flex transition-transform duration-500 ease-linear" id="placementSlider">
          ${duplicatedPlacements.map(placement => createPlacementCard(placement)).join('')}
        </div>
      </div>
    `;
    placementSliderContainer.innerHTML = sliderHTML;
    initializeSlider(placements.length);
  }

  function createPlacementCard(placement) {
    return `
      <div class="w-full md:w-1/3 flex-shrink-0 px-4">
        <div class="bg-gradient-to-b from-yellow-50 to-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-200">
          <div class="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
          
          <div class="relative pt-8 pb-4 px-8">
            <div class="absolute top-8 right-8 w-32 h-32 bg-yellow-400 rounded-full opacity-40 blur-2xl"></div>
            <img src="${placement.image}" alt="${placement.name}" class="relative z-10 w-full max-w-[280px] h-auto mx-auto object-contain" loading="lazy" decoding="async" />
          </div>
          
          <div class="px-6 pb-6 text-center bg-white">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">${placement.name}</h3>
            <p class="text-sm text-gray-600 mb-6">
              <span class="font-bold text-gray-900">${placement.course}</span> | Batch <span class="font-bold">${placement.batch}</span>
            </p>
            
            <div class="mb-6 flex items-center justify-center h-20 p-4">
              <img src="${placement.companyLogo}" alt="${placement.company}" class="max-h-16 max-w-full object-contain" loading="lazy" decoding="async" />
            </div>
            
            <div class="border-t-2 border-gray-200 pt-4">
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Package</p>
              <p class="text-3xl md:text-4xl font-black text-blue-600">₹${placement.package}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initializeSlider(originalCount) {
    const slider = document.getElementById('placementSlider');
    if (!slider) return;
    
    let currentIndex = originalCount;
    const cardsPerView = window.innerWidth >= 768 ? 3 : 1;
    let animationId;
    
    function updateSlider(instant = false) {
      const cardWidth = 100 / cardsPerView;
      const translateX = currentIndex * cardWidth;
      slider.style.transition = instant ? 'none' : 'transform 0.5s ease-linear';
      slider.style.transform = `translateX(-${translateX}%)`;
    }
    
    function autoScroll() {
      currentIndex++;
      
      if (currentIndex >= originalCount * 2) {
        updateSlider(false);
        setTimeout(() => {
          currentIndex = originalCount;
          updateSlider(true);
        }, 500);
      } else {
        updateSlider(false);
      }
      
      animationId = setTimeout(autoScroll, 3000);
    }
    
    updateSlider(true);
    autoScroll();
    
    slider.addEventListener('mouseenter', () => clearTimeout(animationId));
    slider.addEventListener('mouseleave', () => autoScroll());
  }
})();
