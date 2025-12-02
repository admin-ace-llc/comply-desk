// generate.js
// Handles kit generation page logic for Comply-Desk
// - Reads ?product=<slug>&paid=1 from URL
// - Looks up product in products.json
// - Soft-checks if user came from Stripe (paid flag)
// - Calls Netlify function to generate outline + Word file

document.addEventListener("DOMContentLoaded", () => {
  initGeneratePage().catch((err) => {
    console.error(err);
    alert(
      "Something went wrong loading this page. Please return to the main site and try again."
    );
    window.location.href = "/#kits";
  });
});

async function initGeneratePage() {
  const params = new URLSearchParams(window.location.search);
  const productSlug = params.get("product");
  const isPaid = params.get("paid") === "1";

  if (!productSlug) {
    // No product specified – send them back to the kits list
    window.location.href = "/#kits";
    return;
  }

  // Load product catalog
  const products = await loadProducts();
  const product = products.find((p) => p.slug === productSlug);

  if (!product) {
    // Unknown product – redirect instead of scary error
    window.location.href = "/#kits";
    return;
  }

  // Update page UI with product info if elements exist
  const productTitleEl = document.getElementById("productTitle");
  if (productTitleEl) {
    productTitleEl.textContent = product.name || "Your compliance kit";
  }

  const productBadgeEl = document.getElementById("productBadge");
  if (productBadgeEl && product.badge) {
    productBadgeEl.textContent = product.badge;
    productBadgeEl.style.display = "inline-block";
  }

  const paidNoticeEl = document.getElementById("paidNotice");
  if (paidNoticeEl) {
    if (isPaid) {
      paidNoticeEl.textContent =
        "Payment confirmed. Please share a few details so we can tailor your kit and generate your Word document.";
    } else {
      paidNoticeEl.textContent =
        "If you haven’t completed payment yet, please go back to the kits page and use the Purchase button. You can still generate and review a preview outline here.";
    }
  }

  // Hook up the Generate button
  const generateBtn = document.getElementById("generateBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", () =>
      handleGenerateClick({ product, productSlug, isPaid })
    );
  }
}

async function loadProducts() {
  const res = await fetch("/products.json", { cache: "no-cache" });
  if (!res.ok) {
    throw new Error("Unable to load product catalog.");
  }
  return res.json();
}

async function handleGenerateClick({ product, productSlug, isPaid }) {
  const businessNameInput = document.getElementById("businessName");
  const industryInput = document.getElementById("industry");
  const stateInput = document.getElementById("state");
  const employeesInput = document.getElementById("employees");
  const risksInput = document.getElementById("risks");

  const businessName = (businessNameInput && businessNameInput.value || "").trim();
  const industry = (industryInput && industryInput.value || "").trim();
  const state = (stateInput && stateInput.value || "").trim();
  const employees = (employeesInput && employeesInput.value || "").trim();
  const risks = (risksInput && risksInput.value || "").trim();

  if (!businessName || !industry || !state) {
    alert("Please fill in at least business name, industry, and state.");
    return;
  }

  // Soft paid check: warn but allow proceeding
  if (!isPaid) {
    const proceed = confirm(
      "It looks like you didn't arrive from a payment confirmation link.\n\n" +
        "You can still generate and review a preview outline, but to receive the full Word document " +
        "you should first complete payment via the Purchase button on the kits page.\n\n" +
        "Do you want to continue and generate a preview now?"
    );
    if (!proceed) return;
  }

  const generateBtn = document.getElementById("generateBtn");
  const originalText = generateBtn ? generateBtn.textContent : "";
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating your kit...";
  }

  try {
    const payload = {
      productSlug,
      productName: product.name,
      businessName,
      industry,
      state,
      employees,
      risks
    };

    const res = await fetch("/.netlify/functions/generateKit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Generation failed.");
    }

    const data = await res.json();
    renderOutlineToPage(data);

    if (data.docxBase64 && data.filename) {
      triggerDocxDownload(data.docxBase64, data.filename);
    } else if (isPaid) {
      // If they paid, we expect a download; warn them if missing
      alert(
        "Your outline was generated, but the Word download was unavailable. " +
          "Please contact support so we can send your document manually."
      );
    }
  } catch (err) {
    console.error(err);
    alert(
      "Sorry, something went wrong generating your kit. Please try again in a moment."
    );
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.textContent =
        originalText || "Generate my kit outline & Word file";
    }
  }
}

// Render structured outline into the page (if container exists)
function renderOutlineToPage(plan) {
  const container = document.getElementById("outlineContainer");
  if (!container) return;

  container.innerHTML = "";

  if (plan.summary) {
    const summaryHeading = document.createElement("h3");
    summaryHeading.textContent = "Summary";
    container.appendChild(summaryHeading);

    const summaryP = document.createElement("p");
    summaryP.textContent = plan.summary;
    container.appendChild(summaryP);
  }

  if (Array.isArray(plan.sections)) {
    plan.sections.forEach((section) => {
      const h = document.createElement("h4");
      h.textContent = section.title || "Section";
      container.appendChild(h);

      if (section.description) {
        const p = document.createElement("p");
        p.textContent = section.description;
        container.appendChild(p);
      }

      if (Array.isArray(section.items) && section.items.length) {
        const ul = document.createElement("ul");
        section.items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        container.appendChild(ul);
      }
    });
  }

  if (plan.implementation) {
    const h = document.createElement("h4");
    h.textContent = "Implementation plan";
    container.appendChild(h);

    const p = document.createElement("p");
    p.textContent = plan.implementation;
    container.appendChild(p);
  }

  if (plan.notes || plan.disclaimer) {
    const h = document.createElement("h4");
    h.textContent = "Notes & disclaimer";
    container.appendChild(h);

    if (plan.notes) {
      const p1 = document.createElement("p");
      p1.textContent = plan.notes;
      container.appendChild(p1);
    }
    if (plan.disclaimer) {
      const p2 = document.createElement("p");
      p2.textContent = plan.disclaimer;
      container.appendChild(p2);
    }
  }
}

// Trigger download of the .docx file returned from the backend
function triggerDocxDownload(base64Data, filename) {
  const byteChars = atob(base64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
