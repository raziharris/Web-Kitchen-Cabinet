const basePrices = {
  kitchen: 6200,
  wardrobe: 5600,
  island: 4200,
  "tv-console": 3200,
  living: 4000,
};

const colors = [
  { name: "Oak", value: "#b99262" },
  { name: "White", value: "#ece8dc" },
  { name: "Charcoal", value: "#353535" },
  { name: "Walnut", value: "#74533b" },
  { name: "Sage", value: "#7f907e" },
  { name: "Grey", value: "#8b8d84" },
];

const parts = window.location.pathname.split("/").filter(Boolean);
const slug = parts[1] || "kitchen";
const modelName = decodeURIComponent(parts[2] || "Kitchen Cabinet");
let selectedColor = colors[0];

const themeToggle = document.querySelector("#themeToggle");
const backLink = document.querySelector("#backLink");
const configTitle = document.querySelector("#configTitle");
const configDescription = document.querySelector("#configDescription");
const materialSelect = document.querySelector("#materialSelect");
const finishSelect = document.querySelector("#finishSelect");
const lengthInput = document.querySelector("#lengthInput");
const dateInput = document.querySelector("#dateInput");
const notesInput = document.querySelector("#notesInput");
const colorOptions = document.querySelector("#colorOptions");
const estimateText = document.querySelector("#estimateText");
const createEnquiry = document.querySelector("#createEnquiry");
const copySummary = document.querySelector("#copySummary");

function money(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("cabinetStudioTheme", theme);
  themeToggle.textContent = theme === "dark" ? "Day" : "Dark";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to day mode" : "Switch to dark mode");
}

function estimate() {
  const base = basePrices[slug] || 6200;
  const materialRate = Number(materialSelect.options[materialSelect.selectedIndex].dataset.rate);
  const finishRate = Number(finishSelect.options[finishSelect.selectedIndex].dataset.rate);
  const length = Number(lengthInput.value) || 10;
  const lengthRate = Math.max(0.7, length / 10);
  return Math.round((base * materialRate * finishRate * lengthRate) / 50) * 50;
}

function updateEstimate() {
  document.documentElement.style.setProperty("--cabinet-tone", selectedColor.value);
  estimateText.textContent = money(estimate());
}

function renderColors() {
  colorOptions.replaceChildren();
  colors.forEach((color) => {
    const button = document.createElement("button");
    button.className = `color-button${color.name === selectedColor.name ? " active" : ""}`;
    button.type = "button";
    button.style.setProperty("--swatch", color.value);
    button.textContent = color.name;
    button.addEventListener("click", () => {
      selectedColor = color;
      renderColors();
      updateEstimate();
    });
    colorOptions.append(button);
  });
}

function enquiryText() {
  return [
    "Hi, I want to book a site visit for custom cabinet work.",
    "",
    `Model: ${modelName}`,
    `Material: ${materialSelect.value}`,
    `Finishing: ${finishSelect.value}`,
    `Color: ${selectedColor.name}`,
    `Length: ${lengthInput.value} ft`,
    `Preferred site visit: ${dateInput.value || "To confirm"}`,
    `Estimated from: ${money(estimate())}`,
    "",
    `Notes: ${notesInput.value.trim() || "-"}`,
  ].join("\n");
}

function orderPayload() {
  return {
    model: modelName,
    material: materialSelect.value,
    finishing: finishSelect.value,
    color: selectedColor.name,
    length: lengthInput.value,
    siteVisit: dateInput.value,
    estimate: money(estimate()),
    notes: notesInput.value.trim(),
  };
}

async function copyEnquiry() {
  await navigator.clipboard.writeText(enquiryText());
  copySummary.textContent = "Copied";
  window.setTimeout(() => {
    copySummary.textContent = "Copy Summary";
  }, 1400);
}

function safePdfName() {
  const safeModel = modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `booking-enquiry-${safeModel || "cabinet"}.pdf`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBrowserPdf() {
  const jsPdf = window.jspdf?.jsPDF;

  if (!jsPdf) {
    throw new Error("PDF library is not ready. Please check your internet connection and try again.");
  }

  const order = orderPayload();
  const doc = new jsPdf({ unit: "pt", format: "a4" });
  const left = 48;
  let y = 54;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(184, 134, 53);
  doc.setFontSize(11);
  doc.text("CABINET STUDIO", left, y);

  y += 34;
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(28);
  doc.text("Booking Enquiry Summary", left, y);

  y += 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(88, 88, 88);
  doc.text("Customer configuration for review before technical site measurement and final quotation.", left, y);

  y += 38;
  const rows = [
    ["Model", order.model],
    ["Material", order.material],
    ["Finishing", order.finishing],
    ["Color", order.color],
    ["Length", `${order.length} ft`],
    ["Preferred site visit", order.siteVisit || "To confirm"],
    ["Estimated from", order.estimate],
  ];

  rows.forEach(([label, value]) => {
    doc.setDrawColor(220, 215, 205);
    doc.roundedRect(left, y, 500, 42, 6, 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.setFontSize(9);
    doc.text(label, left + 14, y + 16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 17, 17);
    doc.setFontSize(13);
    doc.text(String(value || "-"), left + 14, y + 32);
    y += 52;
  });

  y += 12;
  doc.setFillColor(7, 16, 29);
  doc.roundedRect(left, y, 500, 56, 8, 8, "F");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(11);
  doc.text("Estimated starting price", left + 18, y + 34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(order.estimate, left + 360, y + 35);

  y += 88;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(15);
  doc.text("Client Notes", left, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(55, 55, 55);
  const notes = doc.splitTextToSize(order.notes || "-", 500);
  doc.text(notes, left, y);

  y = 760;
  doc.setDrawColor(220, 215, 205);
  doc.line(left, y, 548, y);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Final price is confirmed after technical site visit and measurement.", left, y + 18);

  doc.save(safePdfName());
}

async function downloadOrderPdf() {
  const originalText = createEnquiry.textContent;
  createEnquiry.disabled = true;
  createEnquiry.textContent = "Generating PDF...";

  try {
    const response = await fetch("/api/order-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload()),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Could not generate PDF." }));
      throw new Error(error.error || "Could not generate PDF.");
    }

    const blob = await response.blob();
    downloadBlob(blob, safePdfName());
    createEnquiry.textContent = "PDF Downloaded";
    window.setTimeout(() => {
      createEnquiry.textContent = originalText;
    }, 1600);
  } catch (error) {
    try {
      downloadBrowserPdf();
      createEnquiry.textContent = "PDF Downloaded";
      window.setTimeout(() => {
        createEnquiry.textContent = originalText;
      }, 1600);
    } catch (browserError) {
      createEnquiry.textContent = "PDF Failed";
      alert(browserError.message || error.message);
      window.setTimeout(() => {
        createEnquiry.textContent = originalText;
      }, 1800);
    }
  } finally {
    createEnquiry.disabled = false;
  }
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

[materialSelect, finishSelect, lengthInput, dateInput, notesInput].forEach((input) => {
  input.addEventListener("input", updateEstimate);
});

copySummary.addEventListener("click", copyEnquiry);
createEnquiry.addEventListener("click", downloadOrderPdf);

backLink.href = `/model-start/${slug}`;
configTitle.textContent = `Configure ${modelName}`;
configDescription.textContent = "Choose material, finishing, color and a preferred site visit date. Final quotation is confirmed after technical measurement.";
document.title = `${modelName} | Cabinet Booking Studio`;

setTheme(localStorage.getItem("cabinetStudioTheme") || "light");
renderColors();
updateEstimate();
