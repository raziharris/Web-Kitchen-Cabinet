const productSeries = {
  kitchen: {
    title: "Kitchen Cabinet",
    question: "Which Kitchen Cabinet would you like to configure?",
    models: [
      { group: "Straight Models", name: "Kitchen Cabinet", price: 6200, spec1: "10 ft", spec1Label: "Starting length", spec2: "21 days", spec2Label: "Fabrication time", spec3: "Wall + base", spec3Label: "Storage", layout: "Straight", material: "Melamine", tone: "#b99262" },
      { group: "L-shape Models", name: "Kitchen Cabinet L", price: 7800, spec1: "12 ft", spec1Label: "Starting length", spec2: "28 days", spec2Label: "Fabrication time", spec3: "Corner set", spec3Label: "Storage", layout: "L-shape", material: "Plywood", tone: "#ece8dc" },
      { group: "Island Models", name: "Kitchen Island Cabinet", price: 9200, spec1: "14 ft", spec1Label: "Starting length", spec2: "32 days", spec2Label: "Fabrication time", spec3: "Island + wall", spec3Label: "Storage", layout: "Island", material: "Plywood", tone: "#74533b" },
    ],
  },
  wardrobe: {
    title: "Wardrobe",
    question: "Which Wardrobe would you like to configure?",
    models: [
      { group: "Sliding Door Models", name: "Sliding Wardrobe", price: 5600, spec1: "8 ft", spec1Label: "Starting width", spec2: "24 days", spec2Label: "Fabrication time", spec3: "Hanger + drawer", spec3Label: "Storage", layout: "Sliding", material: "Melamine", tone: "#8b8d84" },
      { group: "Built-in Models", name: "Full Height Wardrobe", price: 7600, spec1: "10 ft", spec1Label: "Starting width", spec2: "30 days", spec2Label: "Fabrication time", spec3: "Full wall", spec3Label: "Storage", layout: "Built-in", material: "Plywood", tone: "#6e503a" },
    ],
  },
  island: {
    title: "Island Table",
    question: "Which Island Table would you like to configure?",
    models: [
      { group: "Island Models", name: "Compact Island Table", price: 4200, spec1: "4 ft", spec1Label: "Starting length", spec2: "18 days", spec2Label: "Fabrication time", spec3: "Drawer base", spec3Label: "Storage", layout: "Island", material: "Plywood", tone: "#74533b" },
      { group: "Counter Models", name: "Dining Island Counter", price: 6800, spec1: "7 ft", spec1Label: "Starting length", spec2: "26 days", spec2Label: "Fabrication time", spec3: "Seating side", spec3Label: "Feature", layout: "Counter", material: "Solid Wood", tone: "#b99262" },
    ],
  },
  "tv-console": {
    title: "TV Console",
    question: "Which TV Console would you like to configure?",
    models: [
      { group: "Low Console Models", name: "Low TV Console", price: 3200, spec1: "8 ft", spec1Label: "Starting length", spec2: "14 days", spec2Label: "Fabrication time", spec3: "Cable ready", spec3Label: "Feature", layout: "Low cabinet", material: "Melamine", tone: "#353535" },
      { group: "Feature Wall Models", name: "Feature Wall Console", price: 9400, spec1: "12 ft", spec1Label: "Starting length", spec2: "35 days", spec2Label: "Fabrication time", spec3: "Display wall", spec3Label: "Feature", layout: "Built-in", material: "Solid Wood", tone: "#6e503a" },
    ],
  },
  living: {
    title: "Living Cabinet",
    question: "Which Living Cabinet would you like to configure?",
    models: [
      { group: "Storage Models", name: "Living Storage Cabinet", price: 4000, spec1: "6 ft", spec1Label: "Starting length", spec2: "18 days", spec2Label: "Fabrication time", spec3: "Display + storage", spec3Label: "Feature", layout: "Built-in", material: "Melamine", tone: "#8b8d84" },
      { group: "Display Models", name: "Display Living Cabinet", price: 6200, spec1: "10 ft", spec1Label: "Starting length", spec2: "26 days", spec2Label: "Fabrication time", spec3: "Open shelves", spec3Label: "Feature", layout: "Display", material: "Plywood", tone: "#6e503a" },
    ],
  },
};

const pathnameParts = window.location.pathname.split("/").filter(Boolean);
const slug = pathnameParts[pathnameParts.length - 1] || "kitchen";
const currentSeries = productSeries[slug] || productSeries.kitchen;
const overviewTitle = document.querySelector("#overviewTitle");
const overviewSubtitle = document.querySelector("#overviewSubtitle");
const modelSections = document.querySelector("#modelSections");
const resultCount = document.querySelector("#resultCount");
const mobileSearchInput = document.querySelector("#mobileSearchInput");
const resetFilters = document.querySelector("#resetFilters");
const filterToggle = document.querySelector("#filterToggle");
const filters = document.querySelector(".filters");
const layoutFilters = document.querySelector("#layoutFilters");
const materialFilters = document.querySelector("#materialFilters");
const themeToggle = document.querySelector("#themeToggle");
const quoteButton = document.querySelector(".quote-button");

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

function uniqueValues(key) {
  return [...new Set(currentSeries.models.map((model) => model[key]))];
}

function renderCheckboxes(container, name, values) {
  container.replaceChildren();
  values.forEach((value) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="${name}" value="${value}" checked> ${value}`;
    container.append(label);
  });
}

function checkedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function selectedBudget() {
  return document.querySelector('input[name="budget"]:checked')?.value || "all";
}

function currentSearch() {
  return `${mobileSearchInput.value}`.trim().toLowerCase();
}

function matchesFilters(model) {
  const query = currentSearch();
  const layouts = checkedValues("layout");
  const materials = checkedValues("material");
  const budget = selectedBudget();

  return (!query || `${model.name} ${model.layout} ${model.material}`.toLowerCase().includes(query))
    && layouts.includes(model.layout)
    && materials.includes(model.material)
    && (budget === "all" || model.price <= Number(budget));
}

function modelCard(model) {
  const card = document.createElement("article");
  card.className = "model-card";
  card.dataset.layout = model.layout.includes("Island") || model.layout.includes("Counter") ? "Island" : model.layout.includes("Built") ? "Built-in" : "Straight";
  card.style.setProperty("--cabinet-tone", model.tone);
  card.innerHTML = `
    <div class="model-image">
      <img src="/assets/cabinet-showroom.png" alt="${model.name} preview">
      <span class="model-badge">${currentSeries.title}</span>
      <button class="favorite-button" type="button" aria-label="Save ${model.name}">♡</button>
      <div class="cabinet-render" aria-hidden="true"><div class="cabinet-shape"></div></div>
    </div>
    <div class="model-body">
      <div class="model-title-row">
        <div>
          <h3>${model.name}</h3>
          <p class="model-price">From <strong>${money(model.price)}</strong> incl. basic site measurement</p>
        </div>
      </div>
      <div class="spec-grid">
        <div class="spec"><strong>${model.spec1}</strong><span>${model.spec1Label}</span></div>
        <div class="spec"><strong>${model.spec2}</strong><span>${model.spec2Label}</span></div>
        <div class="spec"><strong>${model.spec3}</strong><span>${model.spec3Label}</span></div>
      </div>
      <p class="model-meta">${model.material} - ${model.layout}</p>
      <div class="model-actions">
        <a class="outline-button" href="/configure/${slug}/${encodeURIComponent(model.name)}">Technical data</a>
        <a class="primary-action" href="/configure/${slug}/${encodeURIComponent(model.name)}">Configure This Model <span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  `;
  return card;
}

function renderModels() {
  modelSections.replaceChildren();
  const visible = currentSeries.models.filter(matchesFilters);
  const groups = [...new Set(visible.map((model) => model.group))];

  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "model-section";
    section.innerHTML = `<h2>${group}</h2><div class="model-grid"></div>`;
    const grid = section.querySelector(".model-grid");
    visible.filter((model) => model.group === group).forEach((model) => grid.append(modelCard(model)));
    modelSections.append(section);
  });

  resultCount.textContent = `${visible.length} model${visible.length === 1 ? "" : "s"}`;
}

function syncSearch(source, target) {
  renderModels();
}

function resetAllFilters() {
  document.querySelectorAll('input[name="layout"], input[name="material"]').forEach((input) => {
    input.checked = true;
  });
  document.querySelector('input[name="budget"][value="all"]').checked = true;
  mobileSearchInput.value = "";
  renderModels();
}

overviewTitle.textContent = currentSeries.question;
overviewSubtitle.textContent = `Design your dream ${currentSeries.title.toLowerCase()} with your style, space and budget.`;
document.title = `${currentSeries.title} | Cabinet Booking Studio`;
if (quoteButton) {
  quoteButton.href = `/configure/${slug}/${encodeURIComponent(currentSeries.models[0].name)}`;
}
renderCheckboxes(layoutFilters, "layout", uniqueValues("layout"));
renderCheckboxes(materialFilters, "material", uniqueValues("material"));

document.querySelectorAll('input[name="layout"], input[name="material"], input[name="budget"]').forEach((input) => {
  input.addEventListener("change", renderModels);
});

mobileSearchInput.addEventListener("input", () => syncSearch(mobileSearchInput));
resetFilters.addEventListener("click", resetAllFilters);
document.querySelectorAll("[data-reset-group]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(`input[name="${button.dataset.resetGroup}"]`).forEach((input) => {
      input.checked = true;
    });
    renderModels();
  });
});
filterToggle.addEventListener("click", () => filters.classList.toggle("open"));
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

setTheme(localStorage.getItem("cabinetStudioTheme") || "light");
renderModels();
