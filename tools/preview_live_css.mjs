import fs from 'node:fs';
import path from 'node:path';

const endpoint = process.argv[2] || 'http://127.0.0.1:9223';
const targetUrl = process.argv[3] || 'https://tkddls8848.cafe24.com/';
const outputPath = process.argv[4] || path.resolve('preview-live-css.png');
const cssPaths = process.argv.slice(5);
const viewportWidth = Number(process.env.PREVIEW_WIDTH || 1920);
const viewportHeight = Number(process.env.PREVIEW_HEIGHT || 1080);
const css = cssPaths.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(targetUrl)}`, { method: 'PUT' }).then((r) => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const handlers = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) handlers.reject(new Error(message.error.message));
  else handlers.resolve(message.result);
});

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: targetUrl });
await new Promise((resolve) => setTimeout(resolve, 4000));
await send('Runtime.evaluate', {
  expression: `(() => { const style = document.createElement('style'); style.id = 'codex-local-preview'; style.textContent = ${JSON.stringify(css)}; document.head.appendChild(style); })()`,
});
await new Promise((resolve) => setTimeout(resolve, 1000));

const metrics = await send('Runtime.evaluate', {
  expression: `(() => ['#header.mn-site-header', '#header.mn-site-header .top_nav_box', '#header.mn-site-header .logo_area', '#header.mn-site-header .mn-desktop-nav', '#header.mn-site-header .top_mypage', '.mn-hero__copy'].map(selector => { const e = document.querySelector(selector); const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { selector, x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom, display:s.display, color:s.color, background:s.backgroundColor }; }))()`,
  returnByValue: true,
});
console.log(JSON.stringify(metrics.result.value, null, 2));

const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync(outputPath, Buffer.from(screenshot.data, 'base64'));
socket.close();
