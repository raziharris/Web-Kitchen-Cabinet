const pages = {
  inspiration: {
    eyebrow: "Ideas and References",
    title: "Inspiration",
    subtitle: "Sample cabinet ideas for kitchens, wardrobes, living rooms, and entertainment spaces.",
    cards: [
      ["Dry Kitchen Concepts", "Clean wall cabinets, island counters, and warm under-cabinet lighting for daily cooking zones."],
      ["Wardrobe Layouts", "Sliding, swing, and full-height wardrobe ideas that keep bedrooms neat and practical."],
      ["Living Storage", "Display shelves, hidden storage, and built-in cabinets for multi-purpose living areas."],
      ["TV Console Ideas", "Wall-mounted and floor-standing console options with cable-ready storage."],
    ],
  },
  materials: {
    eyebrow: "Finishes and Boards",
    title: "Materials",
    subtitle: "A sample guide to cabinet core boards, finishing options, colors, and practical surface choices.",
    cards: [
      ["Melamine Board", "Budget-friendly, easy to maintain, and suitable for many cabinet interiors and doors."],
      ["Plywood", "Stronger board option with better durability for wet kitchen and heavy-use areas."],
      ["Matte Laminate", "A clean, modern finish that reduces glare and gives the cabinet a soft premium feel."],
      ["Wood Veneer", "Natural wood appearance for feature panels, display cabinets, and warm interior themes."],
      ["Color Palette", "Oak, walnut, charcoal, sage, white, and grey options for matching the home style."],
      ["Hardware", "Soft-close hinges, drawer runners, handles, and storage accessories can be selected later."],
    ],
  },
  "about-us": {
    eyebrow: "Our Process",
    title: "About Us",
    subtitle: "Cabinet Studio is a sample booking website for custom cabinet enquiries and technical site visits.",
    cards: [
      ["Design Selection", "Customers choose product type, layout, material, finishing, color, and preferred site visit date."],
      ["Technical Visit", "The team reviews measurements, wall conditions, storage needs, and installation details on site."],
      ["Offline Confirmation", "Final quotation and payment are handled offline after the technical review is complete."],
      ["Built For Enquiries", "This website is focused on product configuration and booking, not online checkout."],
    ],
  },
  resources: {
    eyebrow: "Planning Guides",
    title: "Resources",
    subtitle: "Helpful sample resources customers can read before submitting a cabinet booking enquiry.",
    cards: [
      ["Measurement Checklist", "Prepare wall length, ceiling height, appliance sizes, and rough storage requirements."],
      ["Budget Guide", "Understand starting estimates and why final pricing depends on site measurement."],
      ["Material Care", "Simple cleaning and maintenance tips for melamine, plywood, laminate, and veneer finishes."],
      ["Booking Process", "Select a model, configure your options, create an enquiry, and download the PDF summary."],
    ],
  },
};

const slug = window.location.pathname.split("/").filter(Boolean)[0] || "inspiration";
const page = pages[slug] || pages.inspiration;
const themeToggle = document.querySelector("#themeToggle");

document.title = `${page.title} | Cabinet Studio`;
document.querySelector("#sampleEyebrow").textContent = page.eyebrow;
document.querySelector("#sampleTitle").textContent = page.title;
document.querySelector("#sampleSubtitle").textContent = page.subtitle;

document.querySelector("#sampleCards").innerHTML = page.cards
  .map(([title, description], index) => `
    <article class="sample-card">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h2>${title}</h2>
      <p>${description}</p>
    </article>
  `)
  .join("");

document.querySelectorAll(".product-nav a").forEach((link) => {
  const isActive = link.dataset.nav === slug;
  link.classList.toggle("active", isActive);
  if (isActive) {
    link.setAttribute("aria-current", "page");
  }
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("cabinetStudioTheme", theme);
  themeToggle.textContent = theme === "dark" ? "Day" : "Dark";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to day mode" : "Switch to dark mode");
}

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "day" : "dark");
});

setTheme(localStorage.getItem("cabinetStudioTheme") || "day");
