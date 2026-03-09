document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("recruitersGrid");

  fetch("/lp/assets/etc/recruiters.json")
    .then(res => res.json())
    .then(recruiters => {
      recruiters.forEach(r => {
        const div = document.createElement("div");
        div.className =
          "flex justify-center items-center bg-white rounded-xl shadow hover:shadow-lg p-4 transition transform hover:scale-105";

        div.innerHTML = `
          <img src="${r.logo}" alt="${r.name}" class="max-h-12 object-contain grayscale hover:grayscale-0 transition duration-300"  loading="lazy"
     decoding="async">
        `;

        grid.appendChild(div);
      });
    })
    .catch(err => {
      grid.innerHTML = `<p class="text-red-600 col-span-full">Failed to load recruiters.</p>`;
    });
});
