// script.js
// Simple helper for smooth scrolling to in-page sections (e.g., #sample-ada)

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href === "#") return;

  const targetId = href.slice(1);
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  event.preventDefault();
  targetEl.scrollIntoView({ behavior: "smooth" });
});
