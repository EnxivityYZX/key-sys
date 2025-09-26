const DB_NAME = 'keysystem';
const DB_VERSION = 1;
const SESSIONS = 'sessions';
const KEYS = 'keys';
const DAY_MS = 24 * 60 * 60 * 1000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SESSIONS)) db.createObjectStore(SESSIONS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(KEYS)) db.createObjectStore(KEYS, { keyPath: 'key_text' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(store, mode, fn) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const res = fn(s);
    t.oncomplete = () => resolve(res);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

function uuid() {
  const a = new Uint8Array(16);
  self.crypto.getRandomValues(a);
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const b = [...a].map((v,i)=> (i===4||i===6||i===8||i===10?'-':'') + v.toString(16).padStart(2,'0')).join('');
  return b;
}

function genKey(len = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr = new Uint32Array(len);
  self.crypto.getRandomValues(arr);
  let out = '';
  for (let i=0;i<len;i++) out += chars[arr[i] % chars.length];
  return out;
}

async function put(store, obj) {
  return tx(store, 'readwrite', (s) => s.put(obj));
}

async function get(store, key) {
  return new Promise(async (resolve, reject) => {
    const db = await idb();
    const t = db.transaction(store, 'readonly');
    const s = t.objectStore(store);
    const req = s.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function createSession(source, name) {
  const id = uuid();
  const now = Date.now();
  const session = { id, source, name: name || null, created_at: now, status: 'started' };
  await put(SESSIONS, session);
  return session;
}

async function completeSession(sessionId) {
  const s = await get(SESSIONS, sessionId);
  if (!s || s.status === 'completed') return { ok: false, reason: 'invalid' };
  s.status = 'completed';
  await put(SESSIONS, s);

  const key_text = genKey(10);
  const now = Date.now();
  const rec = { key_text, created_at: now, expires_at: now + DAY_MS, source: s.source || 'unknown' };
  await put(KEYS, rec);
  return { ok: true, key: rec };
}

async function checkKey(keyText) {
  const rec = await get(KEYS, keyText);
  if (!rec) return { valid: false };
  const now = Date.now();
  return { valid: now < rec.expires_at, ...rec };
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function redirect(location, status = 302) {
  return new Response(null, { status, headers: { Location: location } });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    if (url.pathname === '/api/start') {
      if (event.request.method !== 'POST') return json({ error: 'POST required' }, 405);
      const source = url.searchParams.get('source') || 'unknown';
      const name = url.searchParams.get('name') || null;
      const session = await createSession(source, name);
      const redirectUrl = `/provider.html?session=${encodeURIComponent(session.id)}&source=${encodeURIComponent(source)}`;
      return json({ session: session.id, redirect: redirectUrl });
    }

    if (url.pathname === '/api/return') {
      const sessionId = url.searchParams.get('session');
      if (!sessionId) return json({ error: 'missing session' }, 400);
      const res = await completeSession(sessionId);
      if (!res.ok) return json({ error: 'invalid session' }, 400);
      const keyPage = `/key.html?key=${encodeURIComponent(res.key.key_text)}`;
      return redirect(keyPage, 302);
    }

    if (url.pathname === '/api/redeem') {
      const key = url.searchParams.get('key');
      if (!key) return json({ error: 'missing key' }, 400);
      const rec = await checkKey(key);
      return json(rec);
    }

    return json({ error: 'not found' }, 404);
  })());
});

