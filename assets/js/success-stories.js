/* ================== Success Stories Slider ================== */
function getSuccessStorySliders() {
  const sliders = Array.from(document.querySelectorAll("[data-success-stories-slider]"));
  if (sliders.length) return sliders;

  // Backward-compat for pages still using #placementSlider
  const legacy = document.getElementById("placementSlider");
  return legacy ? [legacy] : [];
}

function getCardWidth(sliderEl) {
  const firstCard = sliderEl?.querySelector(":scope > div");
  if (!firstCard) return sliderEl.clientWidth;
  const style = getComputedStyle(firstCard);
  const marginRight = parseInt(style.marginRight) || 0;
  return firstCard.offsetWidth + marginRight;
}

function startPlacementScroll(sliderEl) {
  const state = sliderState.get(sliderEl);
  if (!state) return;

  stopPlacementScroll(sliderEl); // avoid duplicates
  state.autoScrollInterval = setInterval(() => {
    const cardWidth = getCardWidth(sliderEl);
    if (state.slideIndex >= state.totalSlides - 1) {
      state.slideIndex = 0;
      sliderEl.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      state.slideIndex++;
      sliderEl.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  }, 5000);
}

function stopPlacementScroll(sliderEl) {
  const state = sliderState.get(sliderEl);
  if (!state) return;
  clearInterval(state.autoScrollInterval);
  state.autoScrollInterval = null;
}

const sliderState = new WeakMap();

/* Load Success Stories JSON */
fetch("/lp/assets/etc/success-stories.json") // ✅ use relative path
  .then((res) => res.json())
  .then((data) => {
    const sliders = getSuccessStorySliders();
    if (!sliders.length) return;

    const stories = data.successStories || [];

    sliders.forEach((sliderEl) => {
      sliderEl.innerHTML = "";
      sliderState.set(sliderEl, { slideIndex: 0, totalSlides: 0, autoScrollInterval: null });

      stories.forEach((story) => {
        const card = document.createElement("div");
        card.className =
          "flex-shrink-0 min-w-[80%] sm:min-w-[45%] md:min-w-[28%] snap-start bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition opacity-0 translate-y-6";

        card.innerHTML = `
          <img src="${story.image.replace(/^\/+/, "")}" alt="${story.alt}" 
               loading="lazy" class="block w-full h-64 sm:h-72 md:h-80 object-cover">
        `;

        sliderEl.appendChild(card);

        setTimeout(() => {
          card.classList.add("fade-in-up");
        }, 100);
      });

      const state = sliderState.get(sliderEl);
      if (state) state.totalSlides = sliderEl.children.length;
      startPlacementScroll(sliderEl);

      // Drag-to-scroll support (per slider)
      let isDown = false;
      let startX;
      let scrollLeft;

      sliderEl.addEventListener("mousedown", (e) => {
        isDown = true;
        sliderEl.classList.add("cursor-grabbing");
        startX = e.pageX - sliderEl.offsetLeft;
        scrollLeft = sliderEl.scrollLeft;
      });

      sliderEl.addEventListener("mouseleave", () => {
        isDown = false;
        sliderEl.classList.remove("cursor-grabbing");
      });

      sliderEl.addEventListener("mouseup", () => {
        isDown = false;
        sliderEl.classList.remove("cursor-grabbing");
      });

      sliderEl.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderEl.offsetLeft;
        const walk = (x - startX) * 2; // scroll speed
        sliderEl.scrollLeft = scrollLeft - walk;
      });
    });
  })
  .catch(() => {
    const sliders = getSuccessStorySliders();
    sliders.forEach((sliderEl) => {
      sliderEl.innerHTML = `<p class="text-red-600">Failed to load success stories.</p>`;
    });
  });
