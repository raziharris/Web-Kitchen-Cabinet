const series = [
  {
    id: "kitchen",
    label: "Kitchen",
    name: "Kitchen Cabinet",
    description: "A complete kitchen cabinet system for dry kitchen, wet kitchen and apartment layouts.",
    bodyType: "Straight, L-shape, Island",
    size: "6 - 20 ft",
    material: "Melamine, Plywood",
    basePrice: 6200,
    shape: "standard",
    tone: "#b99262",
  },
  {
    id: "wardrobe",
    label: "Storage",
    name: "Wardrobe",
    description: "Built-in storage for bedrooms, walk-in wardrobe spaces and full-height wall systems.",
    bodyType: "Sliding, Swing, Built-in",
    size: "5 - 16 ft",
    material: "Melamine, Fluted",
    basePrice: 5600,
    shape: "built-in",
    tone: "#8b8d84",
  },
  {
    id: "tv-console",
    label: "Entertainment",
    name: "TV Cabinet",
    description: "Custom TV cabinets that combine functionality with modern design to elevate your living space.",
    bodyType: "Wall-mounted, Floor-standing",
    size: "4 - 12 ft",
    material: "Melamine, Plywood",
    basePrice: 4800,
    shape: "standard",
    tone: "#74533b",
  },
  {
    id: "living",
    label: "Living",
    name: "Living Cabinet",
    description: "Stylish storage solutions for your living room, hallway and multi-purpose spaces.",
    bodyType: "Storage, Display, Multi-purpose",
    size: "3 - 12 ft",
    material: "Melamine, Plywood",
    basePrice: 4000,
    shape: "built-in",
    tone: "#353535",
  },
];

const seriesList = document.querySelector("#seriesList");
const themeToggle = document.querySelector("#themeToggle");

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

function seriesCard(item) {
  const card = document.createElement("article");
  card.className = "series-card";
  card.dataset.shape = item.shape;
  card.style.setProperty("--series-tone", item.tone);
  card.innerHTML = `
    <div class="series-visual">
      <img src="assets/cabinet-showroom.png" alt="${item.name} preview">
      <span class="energy-tag">${item.label}</span>
      <div class="series-render" aria-hidden="true"><div class="cabinet-shape"></div></div>
    </div>
    <div class="series-content">
      <div class="series-copy">
        <h2>${item.name}</h2>
        <p>${item.description}</p>
      </div>
      <div class="spec-list">
        <div class="spec"><strong>${item.bodyType}</strong><span>Product type</span></div>
        <div class="spec"><strong>${item.size}</strong><span>Typical size</span></div>
        <div class="spec"><strong>${item.material}</strong><span>Material options</span></div>
      </div>
      <p class="label">From ${money(item.basePrice)} incl. basic site measurement</p>
      <div class="series-actions">
        <a class="primary-action" href="/model-start/${item.id}">Configure your ${item.name}</a>
      </div>
    </div>
  `;
  return card;
}

function renderSeries() {
  seriesList.replaceChildren();
  series.forEach((item) => seriesList.append(seriesCard(item)));
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

setTheme(localStorage.getItem("cabinetStudioTheme") || "light");
renderSeries();
