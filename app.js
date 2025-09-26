export const LINKVERTISE_URL = 'https://link-center.net/1401533/EfTevELAULeU';

window.addEventListener('load', () => {
    localStorage.removeItem('linkvertiseDone'); // reset flag on page load
});

if (document.getElementById('linkvertiseDirect')) {
    document.getElementById('linkvertiseDirect').addEventListener('click', () => {
        localStorage.setItem('linkvertiseDone', 'true'); // set flag
        window.open(LINKVERTISE_URL, '_blank', 'noopener');
    });

    const back = document.getElementById('backHome');
    if (back) back.addEventListener('click', (e) => { e.preventDefault(); history.length > 1 && history.back(); });
}

if (document.getElementById('getKeyBtn')) {
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

        location.href = location.origin + '/key'; // redirect to your second page
    });

    const back = document.getElementById('backHome');
    if (back) back.addEventListener('click', (e) => { e.preventDefault(); history.length > 1 && history.back(); });
}

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
