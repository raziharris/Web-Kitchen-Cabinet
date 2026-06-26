const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const entries = [
  "index.html",
  "product.html",
  "configure.html",
  "sample.html",
  "styles.css",
  "app.js",
  "product.js",
  "configure.js",
  "sample.js",
  "assets",
  "brochure",
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  const target = path.join(outDir, entry);

  if (!fs.existsSync(source)) {
    continue;
  }

  fs.cpSync(source, target, { recursive: true });
}

