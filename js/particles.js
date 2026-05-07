export function initParticles(canvas) {
  if (!canvas) {
    return { destroy: () => {} };
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return { destroy: () => {} };
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { destroy: () => {} };
  }

  let width = window.innerWidth;
  let height = window.innerHeight;
  let raf = null;
  const particles = [];

  function targetCount() {
    return width < 768 ? 40 : 100;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const count = targetCount();
    if (particles.length > count) {
      particles.length = count;
    }

    while (particles.length < count) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: random(-0.18, 0.18),
        vy: random(-0.18, 0.18),
        r: random(0.8, 1.8),
        c: Math.random() > 0.5 ? "rgba(108,99,255,0.4)" : "rgba(0,245,255,0.3)"
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) {
        p.vx *= -1;
      }
      if (p.y < 0 || p.y > height) {
        p.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 110) {
          const alpha = (1 - distance / 110) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(120, 130, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    }
  };
}
