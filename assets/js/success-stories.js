/* ================== Success Stories Slider ================== */
const placementSlider = document.getElementById("placementSlider");
let slideIndex = 0,
  totalSlides = 0,
  autoScrollInterval;

/* Auto-scroll */
function getCardWidth() {
  const firstCard = placementSlider?.querySelector("div");
  if (!firstCard) return placementSlider.clientWidth;
  const style = getComputedStyle(firstCard);
  const marginRight = parseInt(style.marginRight) || 0;
  return firstCard.offsetWidth + marginRight;
}

function startPlacementScroll() {
  stopPlacementScroll(); // avoid duplicates
  autoScrollInterval = setInterval(() => {
    const cardWidth = getCardWidth();
    if (slideIndex >= totalSlides - 1) {
      slideIndex = 0;
      placementSlider.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slideIndex++;
      placementSlider.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  }, 5000);
}
function stopPlacementScroll() {
  clearInterval(autoScrollInterval);
}

/* Load Success Stories JSON */
fetch("/lp/assets/etc/success-stories.json") // ✅ use relative path
  .then((res) => res.json())
  .then((data) => {
    if (!placementSlider) return;

    const stories = data.successStories || [];

    stories.forEach((story) => {
      const card = document.createElement("div");
      card.className =
        "flex-shrink-0 min-w-[80%] sm:min-w-[45%] md:min-w-[28%] snap-start bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition opacity-0 translate-y-6";

      card.innerHTML = `
        <img src="${story.image.replace(/^\/+/, '')}" alt="${story.alt}" 
             loading="lazy" class="block w-full h-64 sm:h-72 md:h-80 object-cover">
      `;

      placementSlider.appendChild(card);

      // Fade in
      setTimeout(() => {
        card.classList.add("fade-in-up");
      }, 100);
    });

    totalSlides = placementSlider.children.length;
    startPlacementScroll();
  })
  .catch((err) => {
    if (placementSlider) {
      placementSlider.innerHTML =
        `<p class="text-red-600">Failed to load success stories.</p>`;
    }
  });

/* Drag-to-scroll support */
let isDown = false;
let startX;
let scrollLeft;

placementSlider.addEventListener("mousedown", (e) => {
  isDown = true;
  placementSlider.classList.add("cursor-grabbing");
  startX = e.pageX - placementSlider.offsetLeft;
  scrollLeft = placementSlider.scrollLeft;
});
placementSlider.addEventListener("mouseleave", () => {
  isDown = false;
  placementSlider.classList.remove("cursor-grabbing");
});
placementSlider.addEventListener("mouseup", () => {
  isDown = false;
  placementSlider.classList.remove("cursor-grabbing");
});
placementSlider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - placementSlider.offsetLeft;
  const walk = (x - startX) * 2; // scroll speed
  placementSlider.scrollLeft = scrollLeft - walk;
});
