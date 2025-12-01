// generate.js — Comply-Desk
// Handles questionnaire, OpenAI call via Netlify, outline display, and Word (.docx) download.

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productSlug = params.get("product") || "";

  const titleEl = document.getElementById("gen-title");
  const subtitleEl = document.getElementById("gen-subtitle");
  const questionnaire = document.getElementById("questionnaire");
  const submitBtn = document.getElementById("gen-submit");
  const results = document.getElementById("results");
  const resultsBody = document.getElementById("results-body");
  const downloadDocxBtn = document.getElementById("download-docx");

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Load products injected from script.js
  const products = window.__COMPLY_DESK_PRODUCTS__ || [];
  const product = products.find((p) => p.slug === productSlug);

  if (product && titleEl) {
    titleEl.textContent = `Generate your ${product.name}`;
  }

  if (product && subtitleEl) {
    subtitleEl.textContent =
      "After purchasing this kit via Stripe on Comply-Desk, use this page to generate a structured outline and a downloadable Word document you can edit.";
  }

  let currentDocxBase64 = null;
  let currentFilename = "comply-desk-kit.docx";

  // ---------------------------
  // HANDLE FORM SUBMISSION
  // ---------------------------

  if (questionnaire) {
    questionnaire.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!product) {
        alert("Unknown product. Please return to the main site and pick a kit.");
        return;
      }

      const businessName = document.getElementById("business-name").value.trim();
      const industry = document.getElementById("industry").value.trim();
      const state = document.getElementById("state").value.trim();
      const employees = document.getElementById("employees").value.trim();
      const risks = document.getElementById("risks").value.trim();

      if (!businessName || !industry || !state || !employees) {
        alert("Please fill in all required fields.");
        return;
      }

      submitBtn.classList.add("loading");
      submitBtn.textContent = "Generating your compliance kit...";
      results.classList.add("hidden");
      resultsBody.innerHTML = "";
      currentDocxBase64 = null;

      try {
        const res = await fetch("/.netlify/functions/generateKit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productSlug,
            productName: product.name,
            businessName,
            industry,
            state,
            employees,
            risks,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Request failed");
        }

        const data = await res.json();
        renderResults(data);

        currentDocxBase64 = data.docxBase64 || null;
        currentFilename = data.filename || `comply-desk-${productSlug}.docx`;

        results.classList.remove("hidden");
        submitBtn.textContent = "Generate my kit outline & Word file";
      } catch (err) {
        console.error(err);
        resultsBody.innerHTML =
          "<p>Sorry, something went wrong. Please try again in a moment.</p>";
        results.classList.remove("hidden");
        submitBtn.textContent = "Generate my kit outline & Word file";
      } finally {
        submitBtn.classList.remove("loading");
      }
    });
  }

  // ---------------------------
  // HANDLE DOCX DOWNLOAD
  // ---------------------------

  if (downloadDocxBtn) {
    downloadDocxBtn.addEventListener("click", () => {
      if (!currentDocxBase64) {
        alert("Please generate your kit first.");
        return;
      }

      try {
        const byteCharacters = atob(currentDocxBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = currentFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert("Could not download the Word file. Please try again.");
      }
    });
  }

  // ---------------------------
  // RENDER RESULTS (OUTLINE)
  // ---------------------------

  function renderResults(plan) {
    if (!plan) {
      resultsBody.innerHTML = "<p>No content returned.</p>";
      return;
    }

    const parts = [];

    if (plan.summary) {
      parts.push(`<p><strong>Summary:</strong> ${escapeHtml(plan.summary)}</p>`);
    }

    if (Array.isArray(plan.sections)) {
      plan.sections.forEach((section) => {
        if (section.title) {
          parts.push(`<h3>${escapeHtml(section.title)}</h3>`);
        }
        if (section.description) {
          parts.push(`<p>${escapeHtml(section.description)}</p>`);
        }
        if (Array.isArray(section.items)) {
          parts.push("<ul>");
          section.items.forEach((item) => {
            parts.push(`<li>${escapeHtml(item)}</li>`);
          });
          parts.push("</ul>");
        }
      });
    }

    if (plan.implementation) {
      parts.push("<h3>Implementation plan</h3>");
      parts.push(`<p>${escapeHtml(plan.implementation)}</p>`);
    }

    if (plan.notes || plan.disclaimer) {
      parts.push("<h3>Notes & disclaimer</h3>");
      parts.push("<ul>");
      if (plan.notes) {
        parts.push(`<li>${escapeHtml(plan.notes)}</li>`);
      }
      if (plan.disclaimer) {
        parts.push(`<li>${escapeHtml(plan.disclaimer)}</li>`);
      }
      parts.push("</ul>");
    }

    resultsBody.innerHTML = parts.join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
