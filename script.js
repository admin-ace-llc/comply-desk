// script.js
// Simple UX helpers for Comply-Desk homepage
// - Converts "Generate" buttons into free outline previews
// - Prevents users from hitting generate.html before purchase
// - Leaves Stripe "Purchase" links untouched

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
        const url = new URL(link.href);
        const productSlug = url.searchParams.get("product");
        showKitPreview(productSlug);
      } catch (e) {
        // If something goes wrong, just show a generic message
        showGenericPreview();
      }
    });
  });
}

/**
 * Show a kit-specific preview based on the product slug
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
        "Templates in ready-to-edit Word format"
      ]
    },
    "web-data-bundle": {
      name: "Web & Data Compliance Bundle",
      bullets: [
        "ADA website accessibility statement",
        "WCAG-style website checklist",
        "Privacy policy tailored to small businesses",
        "Cookie / tracking disclosure language",
        "Internal data-handling & retention notes"
      ]
    },
    "people-contractor-bundle": {
      name: "People & Contractor Compliance Bundle",
      bullets: [
        "Employee handbook structure & key clauses",
        "Code of conduct & anti-harassment language",
        "Contractor onboarding checklist",
        "1099 agreement outline & expectations",
        "Attendance, leave & remote work sections"
      ]
    },
    "safety-essentials-bundle": {
      name: "Safety Essentials Bundle (OSHA + Safety SOPs)",
      bullets: [
        "Company safety policy & responsibilities",
        "Incident reporting & investigation outline",
        "Hazard communication & PPE sections",
        "Daily / weekly inspection checklist outline",
        "Worker acknowledgement & training logs"
      ]
    },
    "ada-website-kit": {
      name: "ADA Website Compliance Kit",
      bullets: [
        "ADA / accessibility commitment statement",
        "Website accessibility checklist outline",
        "Remediation & escalation process",
        "Accommodation request response template",
        "Contact & feedback language"
      ]
    },
    "emergency-preparedness-kit": {
      name: "Emergency Preparedness & Response Kit",
      bullets: [
        "Emergency roles & responsibilities",
        "Fire, medical & natural disaster response",
        "Evacuation & shelter-in-place procedures",
        "Communication plans & contact trees",
        "Post-incident review checklist"
      ]
    },
    "workplace-safety-sops": {
      name: "Workplace Safety SOPs Kit",
      bullets: [
        "Safe work procedures for key tasks",
        "Equipment & PPE use guidelines",
        "Reporting and near-miss documentation",
        "Inspection & maintenance checklists",
        "Training and refresher tracking outline"
      ]
    },
    "employee-handbook-kit": {
      name: "Employee Handbook & Policy Kit",
      bullets: [
        "Welcome & culture statement outline",
        "Employment, hours & pay sections",
        "Benefits, leave & time-off policies",
        "Code of conduct & discipline",
        "Anti-harassment & equal opportunity"
      ]
    },
    "contractor-onboarding-kit": {
      name: "Contractor / 1099 Compliance & Onboarding Kit",
      bullets: [
        "Contractor role & scope outline",
        "Payment terms & invoicing notes",
        "Independence & compliance clauses",
        "Onboarding checklist & documentation",
        "Safety / confidentiality expectations"
      ]
    },
    "privacy-data-consent-kit": {
      name: "Privacy, Data & Consent Policy Kit",
      bullets: [
        "Personal data categories & purposes",
        "Legal bases / consent language",
        "Data retention & deletion summary",
        "Cookie / tracking disclosure outline",
        "Individual rights & contact routes"
      ]
    },
    "osha-essentials-kit": {
      name: "OSHA Compliance Essentials Kit",
      bullets: [
        "OSHA-focused safety policy overview",
        "Roles & responsibilities structure",
        "Hazard & incident reporting sections",
        "Training, PPE & documentation notes",
        "Inspection & corrective action outline"
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
    "To get the full, ready-to-edit Word document, use the Purchase button for this kit. After payment you'll be taken to a short form to customize and download your pack."
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
