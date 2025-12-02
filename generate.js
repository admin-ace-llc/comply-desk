// generate.js

document.addEventListener("DOMContentLoaded", () => {
  initGeneratePage().catch((err) => {
    console.error(err);
    alert(
      "Something went wrong loading the generator. Please go back to the main site and try again."
    );
    window.location.href = "/#kits";
  });
});

async function initGeneratePage() {
  const params = new URLSearchParams(window.location.search);
  const productSlug = params.get("product");
  const isPaid = params.get("paid") === "1";

  if (!productSlug) {
    window.location.href = "/#kits";
    return;
  }

  const productName = getProductName(productSlug);

  const titleEl = document.getElementById("kitTitle");
  const subtitleEl = document.getElementById("kitSubtitle");

  if (titleEl) {
    titleEl.textContent = `Generate your ${productName}`;
  }

  if (subtitleEl) {
    if (isPaid) {
      subtitleEl.textContent =
        "Thank you for your purchase. Please answer a few questions so we can prepare your Word document.";
    } else {
      subtitleEl.textContent =
        "You can generate a preview kit here, but we recommend purchasing first to receive the full document.";
    }
  }

  const form = document.getElementById("kitForm");
  if (!form) return;

  form.addEventListener("submit", (event) =>
    handleGenerateSubmit(event, { productSlug, productName, isPaid })
  );
}

function getProductName(slug) {
  const map = {
    "full-library": "Full Comply-Desk Compliance Library",
    "web-data-bundle": "Web & Data Compliance Bundle",
    "people-contractor-bundle": "People & Contractor Compliance Bundle",
    "safety-essentials-bundle": "Safety Essentials Bundle",
    "ada-website-kit": "ADA Website Compliance Kit",
    "emergency-preparedness-kit": "Emergency Preparedness & Response Kit",
    "workplace-safety-sops": "Workplace Safety SOPs Kit",
    "employee-handbook-kit": "Employee Handbook & Policy Kit",
    "contractor-onboarding-kit": "Contractor / 1099 Compliance & Onboarding Kit",
    "privacy-data-consent-kit": "Privacy, Data & Consent Policy Kit",
    "osha-essentials-kit": "OSHA Compliance Essentials Kit"
  };
  return map[slug] || "Comply-Desk kit";
}

async function handleGenerateSubmit(event, ctx) {
  event.preventDefault();

  const { productSlug, productName, isPaid } = ctx;
  const form = event.target;
  const btn = document.getElementById("generateBtn");

  const businessName = form.businessName.value.trim();
  const industry = form.industry.value.trim();
  const state = form.state.value.trim();
  const employees = form.employees.value.trim();
  const risks = form.risks.value.trim();

  if (!businessName || !industry || !state) {
    alert("Please fill in business name, industry and state/region before generating.");
    return;
  }

  const originalText = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Generating your kit...";
  }

  try {
    const payload = {
      productSlug,
      productName,
      businessName,
      industry,
      state,
      employees,
      risks,
      mode: isPaid ? "full" : "preview"
    };

    const res = await fetch("/.netlify/functions/generateKit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Generation failed");
    }

    const data = await res.json();
    if (data && data.docxBase64 && data.filename) {
      triggerDocxDownload(data.docxBase64, data.filename);
    } else {
      console.error("Unexpected response from generateKit:", data);
      alert(
        "Your kit was generated but a download was not returned. Please email enquiries@comply-desk.com with your order details."
      );
    }
  } catch (err) {
    console.error(err);
    alert(
      "Sorry, something went wrong generating your kit. Please try again, or contact enquiries@comply-desk.com."
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

function triggerDocxDownload(base64Data, filename) {
  const byteChars = atob(base64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "comply-desk-kit.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
