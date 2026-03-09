/* ================== Centralized Animate on Scroll ================== */

/**
 * Intersection Observer for fade-in animations
 */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

/**
 * Auto-animate elements that use [data-animate] or specific classes
 */
function initAnimations() {
  // Animate elements with data-animate
  document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));

  // Animate stat cards, recruiters, success stories
  document.querySelectorAll(".stat-card, .animate-on-scroll").forEach(el => observer.observe(el));
}

/**
 * Basic scroll-based reveal (for opacity + translate-y transitions)
 * This ensures compatibility if some elements don’t use observer
 */
document.addEventListener("scroll", () => {
  document.querySelectorAll("[data-animate]").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50 && !el.classList.contains("animated")) {
      el.classList.add("animated", "opacity-100", "translate-y-0");
    }
  });
});

/* Run after DOM is ready */
document.addEventListener("DOMContentLoaded", initAnimations);
