function toggleFAQ(button) {
  const content = button.nextElementSibling;
  const isCollapsed = content.classList.contains("max-h-0");

  // Close all
  document.querySelectorAll(".faq-content").forEach(div => {
    div.classList.add("max-h-0");
    div.classList.remove("max-h-96", "py-4");
  });
  document.querySelectorAll("section .space-y-4 button span").forEach(span => {
    span.textContent = "+";
  });

  // Open selected
  if (isCollapsed) {
    content.classList.remove("max-h-0");
    content.classList.add("max-h-96", "py-4");
    button.querySelector("span").textContent = "−";
  }
}

document.querySelectorAll(".faq-toggle").forEach(btn => {
  btn.addEventListener("click", () => toggleFAQ(btn));
});
