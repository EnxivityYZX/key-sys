export async function ensureSW() {
  if ('serviceWorker' in navigator) {
    try {
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

export const LINKVERTISE_URL = 'https://link-center.net/1401533/EfTevELAULeU';

// Home page wiring
if (document.getElementById('getKeyBtn')) {
  (async () => {
    await ensureSW();
    const btn = document.getElementById('getKeyBtn');
    const nameEl = document.getElementById('nameInput');
    const keyDisplay = document.getElementById('generatedKey');

    btn.addEventListener('click', () => {
      if (localStorage.getItem('linkvertiseDone') !== 'true') {
        alert('You must complete Linkvertise first!');
        return;
      }

      const name = nameEl?.value.trim() || '';
      const fixedKey = 'G81KP1V22H';
      const displayKey = name ? `${name}-${fixedKey}` : fixedKey;

      if (keyDisplay) keyDisplay.textContent = displayKey;

      // DO NOT redirect — the key is revealed on the same page
    });

    const back = document.getElementById('backHome');
    if (back) back.addEventListener('click', (e) => {
      e.preventDefault();
      history.length > 1 ? history.back() : null;
    });
  })();
}

if (document.getElementById('linkvertiseDirect')) {
  (async () => {
    await ensureSW();
    const linkBtn = document.getElementById('linkvertiseDirect');
    linkBtn.addEventListener('click', (e) => {
      e.preventDefault(); // prevent default navigation
      localStorage.setItem('linkvertiseDone', 'true'); // mark Linkvertise clicked
      window.open(LINKVERTISE_URL, '_blank', 'noopener'); // open in new tab
      alert('Linkvertise opened! Complete it there before getting the key.');
    });

    const back = document.getElementById('backHome');
    if (back) back.addEventListener('click', (e) => { e.preventDefault(); history.length > 1 && history.back(); });
  })();
}

// Background dots animation
(function dots() {
  const c = document.getElementById('dots');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, dpr = window.devicePixelRatio || 1, dots = [];
  const reset = () => { w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; };
  const spawn = () => ({ x: Math.random()*w, y: -Math.random()*h, r: (4+Math.random()*10)*dpr, v: (250+Math.random()*300)/60*dpr, b: 6*dpr, a: 0.08+Math.random()*0.08 });
  const init = () => { dots = Array.from({length: Math.min(120, Math.floor(innerWidth/8))}, spawn); };
  const step = () => {
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
