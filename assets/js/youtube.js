/* ================== Lazy YouTube Embeds with Blur Fade-Out + Shrinking Play Button + Iframe Scale-Up + Responsive 16:9 ================== */
document.addEventListener("DOMContentLoaded", () => {
  const ytElements = document.querySelectorAll(".youtube-lazy");

  ytElements.forEach((el) => {
    const videoId = el.dataset.id;

    // Create wrapper for preview (thumbnail + play button)
    const previewWrapper = document.createElement("div");
    previewWrapper.className =
      "absolute inset-0 w-full h-full transition-all duration-500 opacity-100";

    // Thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    thumbnail.alt = "YouTube video preview";
    thumbnail.loading = "lazy";
    thumbnail.className =
      "w-full h-full object-cover rounded-lg transform transition-transform duration-500 group-hover:scale-110";

    // Play button
    const playBtn = document.createElement("div");
    playBtn.className =
      "absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all duration-500";
    playBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           class="w-16 h-16 text-white drop-shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:animate-pulse" 
           fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 22v-20l18 10-18 10z"/>
      </svg>
    `;

    // Build preview
    previewWrapper.appendChild(thumbnail);
    previewWrapper.appendChild(playBtn);

    // Container styles
    el.classList.add("relative", "cursor-pointer", "overflow-hidden", "group");
    el.appendChild(previewWrapper);

    // Ensure responsive ratio
    el.classList.add("aspect-video"); // Tailwind 16:9 utility

    // On click → fade out preview (with blur + shrink play button), fade in iframe
    el.addEventListener("click", () => {
      // Blur + fade-out preview
      previewWrapper.classList.remove("opacity-100");
      previewWrapper.classList.add("opacity-0", "blur-sm");

      // Shrink play button
      playBtn.classList.add("scale-0");

      // Wait for transition to finish
      setTimeout(() => {
        el.innerHTML = ""; // Clear preview

        // Responsive wrapper
        const iframeWrapper = document.createElement("div");
        iframeWrapper.className = "relative w-full h-full";

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.frameBorder = "0";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        // ✅ Start scaled-down & hidden, then animate
        iframe.className =
          "absolute top-0 left-0 w-full h-full rounded-lg opacity-0 scale-95 transition-all duration-500";

        iframeWrapper.appendChild(iframe);
        el.appendChild(iframeWrapper);

        // Fade + scale in when loaded
        iframe.addEventListener("load", () => {
          requestAnimationFrame(() => {
            iframe.classList.add("opacity-100", "scale-100");
          });
        });
      }, 500); // match fade-out duration
    });
  });
});
