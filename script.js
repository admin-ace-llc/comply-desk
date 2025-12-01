// script.js — Comply-Desk Homepage Logic
// Loads products.json and builds the product cards dynamically

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("product-grid");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  try {
    const res = await fetch("products.json");
    if (!res.ok) {
      throw new Error("Could not load product list");
    }

    const products = await res.json();
    window.__COMPLY_DESK_PRODUCTS__ = products;

    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-header">
          <span class="card-badge">${p.badge || "Compliance Kit"}</span>
        </div>

        <div class="card-title">${p.name}</div>

        <div class="card-price">$${p.price}</div>

        <div class="card-body">${p.description}</div>

        <div class="card-actions">
          <a href="${p.checkoutUrl}" target="_blank" class="btn primary">Purchase</a>
          <a href="generate.html?product=${p.slug}" class="btn secondary">Generate</a>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.innerHTML =
        "<p>Unable to load compliance kits. Please refresh the page or try again later.</p>";
    }
  }
});
