// script.js
// Homepage helper for Comply-Desk
// - Converts "Preview outline" links pointing to generate.html into free outline previews
// - Does NOT modify layout or render cards (all kits are static HTML)

document.addEventListener("DOMContentLoaded", () => {
  attachGeneratePreviewHandlers();
});

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
