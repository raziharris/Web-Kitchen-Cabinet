const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const port = Number(process.env.PORT || 5173);
const root = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function findChrome() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function collectJsonBody(request, callback) {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      request.destroy();
    }
  });

  request.on("end", () => {
    try {
      callback(null, JSON.parse(body || "{}"));
    } catch (error) {
      callback(error);
    }
  });
}

function orderHtml(order) {
  const rows = [
    ["Model", order.model],
    ["Material", order.material],
    ["Finishing", order.finishing],
    ["Color", order.color],
    ["Length", `${order.length} ft`],
    ["Preferred site visit", order.siteVisit || "To confirm"],
    ["Estimated from", order.estimate],
  ];

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      @page { size: A4; margin: 18mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #111; font-family: "Segoe UI", Arial, sans-serif; }
      .brand { color: #b88635; font-size: 12px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; }
      h1 { margin: 10px 0 6px; font-family: Georgia, "Times New Roman", serif; font-size: 36px; line-height: 1.05; }
      p { margin: 0; color: #555; line-height: 1.5; }
      .hero { padding-bottom: 20px; border-bottom: 2px solid #111; }
      .meta { margin-top: 10px; color: #777; font-size: 12px; }
      .grid { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .card { border: 1px solid #ddd7cd; border-radius: 10px; padding: 14px; background: #fbfaf7; }
      .card span { display: block; margin-bottom: 5px; color: #777; font-size: 12px; }
      .card strong { display: block; font-size: 17px; }
      .estimate { margin-top: 20px; padding: 18px; border-radius: 10px; background: #111; color: #fff; display: flex; justify-content: space-between; align-items: center; }
      .estimate span { color: #ddd; }
      .estimate strong { font-size: 26px; }
      .notes { margin-top: 22px; }
      .notes h2 { margin: 0 0 8px; font-size: 18px; }
      .notes div { min-height: 90px; padding: 14px; border: 1px solid #ddd7cd; border-radius: 10px; color: #333; line-height: 1.5; white-space: pre-wrap; }
      .footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #ddd7cd; color: #777; font-size: 12px; }
    </style>
  </head>
  <body>
    <section class="hero">
      <div class="brand">Cabinet Studio</div>
      <h1>Booking Enquiry Summary</h1>
      <p>Customer configuration for review before technical site measurement and final quotation.</p>
      <div class="meta">Generated ${escapeHtml(new Date().toLocaleString("en-MY"))}</div>
    </section>

    <section class="grid">
      ${rows.map(([label, value]) => `<div class="card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
    </section>

    <section class="estimate">
      <span>Estimated starting price</span>
      <strong>${escapeHtml(order.estimate)}</strong>
    </section>

    <section class="notes">
      <h2>Client Notes</h2>
      <div>${escapeHtml(order.notes || "-")}</div>
    </section>

    <section class="footer">
      This estimate is for enquiry and review only. Final price is confirmed after technical site visit and measurement.
    </section>
  </body>
</html>`;
}

const server = http.createServer((request, response) => {
  if (request.url?.startsWith("/api/order-pdf")) {
    if (request.method !== "POST") {
      response.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    collectJsonBody(request, (parseError, order) => {
      if (parseError) {
        response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
        return;
      }

      const chrome = findChrome();
      if (!chrome) {
        response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ ok: false, error: "Chrome or Edge was not found for PDF generation." }));
        return;
      }

      const outputDir = path.join(root, "orders");
      fs.mkdirSync(outputDir, { recursive: true });

      const safeModel = String(order.model || "cabinet").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const htmlPath = path.join(outputDir, `order-${safeModel}-${stamp}.html`);
      const pdfPath = path.join(outputDir, `order-${safeModel}-${stamp}.pdf`);

      fs.writeFileSync(htmlPath, orderHtml(order), "utf8");

      execFile(
        chrome,
        [
          "--headless",
          "--disable-gpu",
          `--print-to-pdf=${pdfPath}`,
          "--print-to-pdf-no-header",
          `file:///${htmlPath.replace(/\\/g, "/")}`,
        ],
        { timeout: 30000 },
        (error) => {
          if (error) {
            response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ ok: false, error: error.message }));
            return;
          }

          fs.readFile(pdfPath, (readError, content) => {
            if (readError) {
              response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
              response.end(JSON.stringify({ ok: false, error: "PDF was not created." }));
              return;
            }

            response.writeHead(200, {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${path.basename(pdfPath)}"`,
              "Cache-Control": "no-store",
            });
            response.end(content);
          });
        }
      );
    });
    return;
  }

  if (request.url?.startsWith("/api/restart-server")) {
    if (request.method !== "POST") {
      response.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    const restartFile = path.join(root, ".nodemon-restart");
    fs.writeFile(restartFile, String(Date.now()), (error) => {
      response.writeHead(error ? 500 : 200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify({ ok: !error, restarted: !error }));
    });
    return;
  }

  const pathname = (request.url || "/").split("?")[0];
  const samplePages = new Set(["/inspiration", "/materials", "/about-us", "/resources"]);
  const requestPath = pathname === "/"
    ? "/index.html"
    : pathname.startsWith("/model-start/")
      ? "/product.html"
      : pathname.startsWith("/configure/")
        ? "/configure.html"
        : samplePages.has(pathname)
          ? "/sample.html"
          : pathname;
  const filePath = path.normalize(path.join(root, requestPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Cabinet Booking Studio is running at http://localhost:${port}`);
});
