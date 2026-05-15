#!/usr/bin/env node
/**
 * Serves dist-local over HTTP and opens the browser (fallback when file:// fails).
 */
import { spawn } from "node:child_process";
import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "dist-local");
const port = Number(process.env.PORT) || 4174;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const path = req.url?.split("?")[0] ?? "/";
  const file = path === "/" ? join(root, "index.html") : join(root, path.replace(/^\//, ""));

  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}/`;
  console.log(`Local preview: ${url}`);
  console.log(`Serving: ${root}`);
  const open =
    process.platform === "darwin" ? ["open", url] : process.platform === "win32" ? ["cmd", "/c", "start", url] : ["xdg-open", url];
  spawn(open[0], open.slice(1), { stdio: "ignore", detached: true }).unref();
});
