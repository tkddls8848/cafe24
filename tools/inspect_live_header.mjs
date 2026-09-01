const endpoint = process.argv[2] || 'http://127.0.0.1:9223';
const targetUrl = process.argv[3] || 'https://tkddls8848.cafe24.com/';

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
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false,
});
await send('Page.navigate', { url: targetUrl });
await new Promise((resolve) => setTimeout(resolve, 4500));

const expression = `(() => {
  const selectors = [
    '#header.mn-site-header',
    '#header.mn-site-header .inner',
    '#header.mn-site-header .top_nav_box',
    '#header.mn-site-header .logo_area',
    '#header.mn-site-header .mn-desktop-nav',
    '#header.mn-site-header .top_mypage',
    '.mn-hero',
    '.mn-hero__copy'
  ];
  return selectors.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return { selector, missing: true };
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      selector,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
      display: style.display,
      position: style.position,
      order: style.order,
      gridArea: style.gridArea,
      gridTemplateColumns: style.gridTemplateColumns,
      color: style.color,
      background: style.backgroundColor,
      transform: style.transform,
      margin: style.margin,
      padding: style.padding
    };
  });
})()`;

const result = await send('Runtime.evaluate', { expression, returnByValue: true });
console.log(JSON.stringify(result.result.value, null, 2));
socket.close();
