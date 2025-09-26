export async function ensureSW() {
  if ('serviceWorker' in navigator) {
    try {
      // use relative path to ensure same-origin SW fetch and catch failures
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.error('Service worker registration failed:', err);
      return null;
    }
  }
  throw new Error('Service worker not supported');
}

export async function startSession(source, name) {
  const res = await fetch(`/api/start?source=${encodeURIComponent(source)}${name ? `&name=${encodeURIComponent(name)}` : ''}`, {
    method: 'POST'
  });
  return res.json();
}

export async function redeemKey(key) {
  const res = await fetch(`/api/redeem?key=${encodeURIComponent(key)}`);
  return res.json();
}

export const LINKVERTISE_URL = 'https://68d718bef81d730008545254--astounding-pudding-e5287b.netlify.app/key';

// Home page wiring
if (document.getElementById('getKeyBtn')) {
  (async () => {
    await ensureSW();
    const btn = document.getElementById('getKeyBtn');
    const nameEl = document.getElementById('nameInput');

    btn.addEventListener('click', () => {
      const name = nameEl.value.trim();
      // Go to key system page; name is optional and unused beyond demo
      const url = new URL(location.origin + '/key-system.html');
      if (name) url.searchParams.set('name', name);
      location.href = url.toString();
    });

    const back = document.getElementById('backHome');
    back.addEventListener('click', (e) => {
      e.preventDefault();
      history.length > 1 ? history.back() : null;
    });
  })();
}

if (document.getElementById('linkvertiseDirect')) {
  (async () => {
    await ensureSW();
    document.getElementById('linkvertiseDirect').addEventListener('click', async () => {
      // Open the configured LINKVERTISE_URL in a new tab/window.
      // Edit LINKVERTISE_URL above to change where this button goes.
      window.open(LINKVERTISE_URL, '_blank', 'noopener');
    });
    const back = document.getElementById('backHome');
    back.addEventListener('click', (e) => { e.preventDefault(); history.length > 1 && history.back(); });
  })();
}

(function dots() {
  const c = document.getElementById('dots');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, dpr = window.devicePixelRatio || 1, dots = [];
  const reset = () => { w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; };
  const spawn = () => ({ x: Math.random()*w, y: -Math.random()*h, r: (4+Math.random()*10)*dpr, v: (250+Math.random()*300)/60*dpr, b: 6*dpr, a: 0.08+Math.random()*0.08 });
  const init = () => { dots = Array.from({length: Math.min(120, Math.floor(innerWidth/8))}, spawn); };
  const step = (t) => {
    ctx.clearRect(0,0,w,h);
    for (let i=0;i<dots.length;i++) {
      const p = dots[i];
      p.y += p.v;
      if (p.y - p.r > h) dots[i] = spawn();
      ctx.save(); ctx.filter = `blur(${p.b}px)`; ctx.globalAlpha = p.a; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
    requestAnimationFrame(step);
  };
  reset(); init(); addEventListener('resize', () => { reset(); init(); });
  requestAnimationFrame(step);
})();
