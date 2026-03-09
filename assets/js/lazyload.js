document.addEventListener("DOMContentLoaded", function () {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          lazyImageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(function (img) {
      lazyImageObserver.observe(img);
    });
  } else {
    // fallback for old browsers
    let lazyLoadThrottle;
    function lazyLoad() {
      if (lazyLoadThrottle) clearTimeout(lazyLoadThrottle);
      lazyLoadThrottle = setTimeout(function () {
        const scrollTop = window.pageYOffset;
        lazyImages.forEach(function (img) {
          if (img.offsetTop < (window.innerHeight + scrollTop + 200)) {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
          }
        });
      }, 200);
    }
    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationChange", lazyLoad);
  }
});
