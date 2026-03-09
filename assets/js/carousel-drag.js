/* ================== Reusable Drag-to-Scroll with Momentum + Auto-Snap ================== */
function enableDragScroll(selector, slideSelector = null) {
  const slider = document.querySelector(selector);
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let velocity = 0;
  let momentumID;

  // Stop momentum if dragging again
  function stopMomentum() {
    cancelAnimationFrame(momentumID);
    velocity = 0;
  }

  // Snap to nearest slide
  function snapToSlide() {
    if (!slideSelector) return; // skip if no slide selector provided
    const slides = slider.querySelectorAll(slideSelector);
    if (!slides.length) return;

    const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).marginRight || 0);
    const index = Math.round(slider.scrollLeft / slideWidth);
    const targetScroll = index * slideWidth;

    slider.scrollTo({ left: targetScroll, behavior: "smooth" });
  }

  // Apply momentum after release
  function applyMomentum() {
    if (Math.abs(velocity) > 0.1) {
      slider.scrollLeft -= velocity;
      velocity *= 0.95; // friction
      momentumID = requestAnimationFrame(applyMomentum);
    } else {
      snapToSlide();
    }
  }

  // Mouse Down
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("cursor-grabbing");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    stopMomentum();
  });

  // Mouse Up / Leave
  ["mouseleave", "mouseup"].forEach((event) => {
    slider.addEventListener(event, () => {
      if (isDown) {
        isDown = false;
        slider.classList.remove("cursor-grabbing");
        applyMomentum();
      }
    });
  });

  // Mouse Move
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    const prevScroll = slider.scrollLeft;
    slider.scrollLeft = scrollLeft - walk;
    velocity = slider.scrollLeft - prevScroll;
  });

  // Touch Support
  let touchStartX = 0;
  let touchScrollLeft = 0;

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = slider.scrollLeft;
    stopMomentum();
  });

  slider.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX;
    const walk = (x - touchStartX) * 1.5;
    const prevScroll = slider.scrollLeft;
    slider.scrollLeft = touchScrollLeft - walk;
    velocity = slider.scrollLeft - prevScroll;
  });

  slider.addEventListener("touchend", () => {
    applyMomentum();
  });
}

/* ================== Initialize ================== */
document.addEventListener("DOMContentLoaded", () => {
  enableDragScroll("#lifeVideoSlider", ".youtube-lazy");   // 🎥 Video Carousel
  enableDragScroll("#placementSlider", "div");             // 🏆 Success Stories
});
