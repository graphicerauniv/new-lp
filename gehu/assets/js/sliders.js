/* ================== Netflix-Style Slider System ================== */

// Function to add Netflix-style navigation to any slider
function makeNetflixSlider(sliderId, parentSelector = null) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  
  const sliderParent = parentSelector ? slider.closest(parentSelector) : slider.parentElement;
  if (!sliderParent) return;
  
  // Make parent relative and add group class
  sliderParent.classList.add('relative', 'group');
  
  // Create navigation arrows
  const prevArrow = document.createElement('button');
  prevArrow.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>';
  prevArrow.className = 'absolute left-0 top-0 bottom-0 w-16 bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all duration-300 z-10 flex items-center justify-center';
  
  const nextArrow = document.createElement('button');
  nextArrow.innerHTML = '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>';
  nextArrow.className = 'absolute right-0 top-0 bottom-0 w-16 bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all duration-300 z-10 flex items-center justify-center';
  
  sliderParent.appendChild(prevArrow);
  sliderParent.appendChild(nextArrow);
  
  function getSlideWidth() {
    const firstSlide = slider.querySelector(':scope > *');
    if (!firstSlide) return 300;
    const style = getComputedStyle(firstSlide);
    const marginRight = parseInt(style.marginRight) || 0;
    return firstSlide.offsetWidth + marginRight;
  }
  
  prevArrow.addEventListener('click', (e) => {
    e.preventDefault();
    slider.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
  });
  
  nextArrow.addEventListener('click', (e) => {
    e.preventDefault();
    slider.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
  });
  
  let isDragging = false;
  let startX, scrollLeft;
  
  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.style.cursor = 'grabbing';
  });
  
  slider.addEventListener('mouseleave', () => {
    isDragging = false;
    slider.style.cursor = 'grab';
  });
  
  slider.addEventListener('mouseup', () => {
    isDragging = false;
    slider.style.cursor = 'grab';
  });
  
  slider.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
}

// Initialize Netflix-style sliders
document.addEventListener('DOMContentLoaded', () => {
  makeNetflixSlider('lifeVideoSlider');
});
