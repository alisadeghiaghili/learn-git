/** Light confetti burst for level solve. */

export function burstConfetti(): void {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const g: CanvasRenderingContext2D = ctx;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  g.scale(dpr, dpr);

  const colors = ['#8B5CF6', '#2DD4BF', '#F59E0B', '#60A5FA', '#34D399', '#A3E635'];
  const parts = Array.from({ length: 80 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: window.innerHeight / 2,
    vx: (Math.random() - 0.5) * 10,
    vy: Math.random() * -12 - 4,
    w: 4 + Math.random() * 6,
    h: 3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
  }));

  const start = performance.now();
  const life = 1400;

  function frame(now: number) {
    const t = now - start;
    if (t > life) {
      canvas.remove();
      return;
    }
    g.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rot += p.vr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.color;
      g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
