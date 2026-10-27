"use strict";
/* SortRight — zero-dependency static server.
 * Run: npm start   (or: node server.js)   → http://localhost:4317
 * Serves public/ and src/ so the page can load the shared classifier.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 4317;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") {
    // Redirect (not silent rewrite) so the browser's base URL becomes
    // /public/ and the page's relative links (styles.css, app.js,
    // ../src/classifier.js) resolve correctly. Query string preserved
    // so deep links like /?item=pizza+box keep working.
    const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    res.writeHead(302, { Location: "/public/index.html" + qs });
    return res.end();
  }
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`SortRight running at http://localhost:${PORT}`));
