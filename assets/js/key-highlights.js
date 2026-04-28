/* ================== Key Highlights Read More ================== */
function toggleReadMore(id) {
  const text = document.getElementById(`text${id}`);
  const btn = document.getElementById(`toggleBtn${id}`);
  const icon = document.getElementById(`icon${id}`);
  
  if (text.classList.contains('expanded')) {
    // Collapse
    text.classList.remove('expanded');
    text.style.maxHeight = '5rem'; // 20 = max-h-20 (5rem)
    btn.textContent = 'Read More';
    icon.style.transform = 'rotate(0deg)';
  } else {
    // Expand
    text.classList.add('expanded');
    text.style.maxHeight = 'none';
    btn.textContent = 'Read Less';
    icon.style.transform = 'rotate(180deg)';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set initial state for all text elements
  for (let i = 1; i <= 3; i++) {
    const text = document.getElementById(`text${i}`);
    if (text) {
      text.style.maxHeight = '5rem';
    }
  }
});

/* ================== Key Highlights Swiper ================== */
document.addEventListener('DOMContentLoaded', () => {
  new Swiper('.keyHighlightsSwiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640:  { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
  });
});


