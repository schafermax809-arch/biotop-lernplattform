import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};
http
  .createServer(async (req, res) => {
    try {
      const u = new URL(req.url, "http://localhost");
      const relative = decodeURIComponent(u.pathname);
      let file = path.resolve(root, "." + relative);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Datei nicht gefunden");
    }
  })
  .listen(Number(process.env.PORT) || 4173, "127.0.0.1", () =>
    console.log("Biotop: http://127.0.0.1:4173"),
  );
