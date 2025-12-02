// script.js
// Homepage logic for Comply-Desk
// - Renders kits from products.json into the kits grid
// - Converts "Generate" buttons into free outline previews
// - Leaves Stripe "Purchase" links untouched

document.addEventListener("DOMContentLoaded", () => {
  initKitsSection();
});

async function initKitsSection() {
  await renderKitsFromProducts();
  attachGeneratePreviewHandlers();
}

/**
 * Render all kits from products.json into the #kits-grid container.
 * If your index.html already has static cards, make sure the main
 * kits container has id="kits-grid" or adjust the selector below.
 */
async function renderKitsFromProducts() {
  const container = document.getElementById("kits-grid");
  if (!container) {
    // If there is no dynamic container, do nothing – your HTML may already
    // contain hard-coded cards.
    return;
  }

  try {
    const res = await fetch("/products.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load products.json");
    const products = await res.json();

    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "kit-card";

      const badge = product.badge || "";
      const price = product.priceDisplay || (product.price ? `$${product.price}` : "");
      const description = product.shortDescription || product.description || "";
      const stripeUrl = product.stripeUrl || product.purchaseUrl || "#";
      const slug = product.slug;

      card.innerHTML = `
        <div class="kit-card-inner">
          ${badge ? `<div class="kit-badge">${badge}</div>` : ""}
          <h3 class="kit-title">${product.name || "Compliance Kit"}</h3>
          ${price ? `<p class="kit-price">${price}</p>` : ""}
          ${description ? `<p class="kit-description">${description}</p>` : ""}
          <div class="kit-actions">
            <a class="btn btn-primary" href="${stripeUrl}" target="_blank" rel="noopener noreferrer">
              Purchase
            </a>
            ${
              slug
                ? `<a class="btn btn-secondary kit-generate-link" href="/generate.html?product=${encodeURIComponent(
                    slug
                  )}">Preview outline</a>`
                : ""
            }
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error rendering kits from products.json", err);
    // Fallback: leave any existing static content alone
  }
}

/**
 * Attach click handlers to all links that point to generate.html
 * These will now show a free preview instead of navigating away.
 */
function attachGeneratePreviewHandlers() {
  const generateLinks = document.querySelectorAll('a[href*="generate.html"]');

  if (!generateLinks.length) return;

  generateLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      try {
        const url = new URL(link.href, window.location.origin);
        const productSlug = url.searchParams.get("product");
        showKitPreview(productSlug);
      } catch (e) {
        console.error("Error parsing generate link", e);
        showGenericPreview();
      }
    });
  });
}

/**
 * Show a kit-specific preview based on the product slug.
 * This is a lightweight "try before you buy" outline.
 */
function showKitPreview(slug) {
  const previews = {
    "full-library": {
      name: "Full Comply-Desk Compliance Library (All 7 Kits)",
      bullets: [
        "OSHA safety manual & safety SOPs",
        "Employee handbook & HR policies",
        "Contractor / 1099 onboarding pack",
        "ADA website statement & checklist",
        "Privacy, data & consent policies",
        "Emergency response & continuity plans",
        "All templates in ready-to-edit Word format"
      ]
    },
    "web-data-bundle": {
      name: "Web & Data Compliance Bundle",
      bullets: [
        "ADA website accessibility statement",
        "WCAG-style website checklist",
        "Privacy policy for online businesses",
        "Cookie / tracking disclosure language",
        "Internal data-handling & retention notes"
      ]
    },
    "people-contractor-bundle": {
      name: "People & Contractor Compliance Bundle",
      bullets: [
        "Employee handbook core structure",
        "Code of conduct & anti-harassment",
        "Contractor onboarding checklist",
        "1099 agreement outline & expectations",
        "Leave, attendance & remote work sections"
      ]
    },
    "safety-essentials-bundle": {
      name: "Safety Essentials Bundle (OSHA + Safety SOPs)",
      bullets: [
        "Company safety policy outline",
        "Incident reporting & investigation",
        "Hazard communication & PPE sections",
        "Inspection checklist structure",
        "Training & acknowledgement logs"
      ]
    },
    "ada-website-kit": {
      name: "ADA Website Compliance Kit",
      bullets: [
        "Accessibility commitment statement",
        "Website accessibility checklist",
        "Remediation & escalation steps",
        "Accommodation request template",
        "Feedback & contact language"
      ]
    },
    "emergency-preparedness-kit": {
      name: "Emergency Preparedness & Response Kit",
      bullets: [
        "Emergency roles & responsibilities",
        "Fire, medical & disaster response",
        "Evacuation & shelter-in-place plans",
        "Communication trees & contacts",
        "Post-incident review checklist"
      ]
    },
    "workplace-safety-sops": {
      name: "Workplace Safety SOPs Kit",
      bullets: [
        "Safe work procedures outline",
        "PPE & equipment use guidance",
        "Incident / near-miss templates",
        "Inspection & maintenance logs",
        "Training / refresher tracking"
      ]
    },
    "employee-handbook-kit": {
      name: "Employee Handbook & Policy Kit",
      bullets: [
        "Welcome & culture statement",
        "Employment, hours & pay sections",
        "Benefits, leave & PTO policies",
        "Code of conduct & discipline",
        "Anti-harassment & EEO clauses"
      ]
    },
    "contractor-onboarding-kit": {
      name: "Contractor / 1099 Compliance & Onboarding Kit",
      bullets: [
        "Scope of work & expectations",
        "Payment terms & invoicing notes",
        "Independence & compliance clauses",
        "Onboarding checklist & docs",
        "Safety / confidentiality notes"
      ]
    },
    "privacy-data-consent-kit": {
      name: "Privacy, Data & Consent Policy Kit",
      bullets: [
        "Data categories & purposes",
        "Consent / legal basis language",
        "Retention & deletion summary",
        "Cookie / tracking disclosure",
        "Individual rights & contact info"
      ]
    },
    "osha-essentials-kit": {
      name: "OSHA Compliance Essentials Kit",
      bullets: [
        "OSHA-focused safety statement",
        "Roles & responsibilities structure",
        "Hazard & incident reporting",
        "Training, PPE & documentation",
        "Inspection & corrective action"
      ]
    }
  };

  const preview = previews[slug];

  if (!preview) {
    showGenericPreview();
    return;
  }

  const message = [
    `${preview.name}`,
    "",
    "This kit typically includes:",
    ...preview.bullets.map((b) => `• ${b}`),
    "",
    "Use the Purchase button on the kit card to complete payment via Stripe.",
    "After payment, you'll be taken to a short form to customize and download your Word document."
  ].join("\n");

  alert(message);
}

/**
 * Generic fallback preview if we don't recognise the slug.
 */
function showGenericPreview() {
  const message = [
    "Comply-Desk Compliance Kits",
    "",
    "Each kit generates a structured outline plus a ready-to-edit Word document (.docx) for your small business.",
    "",
    "Use the Purchase button on the kit card to pay via Stripe.",
    "After payment you'll answer a few questions and download your customized pack."
  ].join("\n");

  alert(message);
}
