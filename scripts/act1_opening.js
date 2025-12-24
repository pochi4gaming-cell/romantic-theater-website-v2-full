// act1_opening.js
export function initAct1(opts = {}) {
  const startBtn = document.querySelector(opts.startButtonSelector || '#startBtn');
  const title = document.querySelector('#act-1 .title');
  const subtitle = document.querySelector('#act-1 .subtitle');

  // --- Intro animations when Act I loads ---
  fadeIn(title, 400);
  fadeIn(subtitle, 900);
  pulseButton(startBtn);

  // --- Start button behavior ---
  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;

    // little sparkle burst
    sparkleBurst(startBtn);

    // curtain shake before opening
    shakeCurtains();

    // Open curtain right after shake (250ms)
    setTimeout(() => {
      const curtain = document.getElementById('curtain-overlay');
      const left = document.querySelector('.curtain.left');
      const right = document.querySelector('.curtain.right');
      
      if (curtain) {
        // Make sure inline styles are cleared so CSS can work
        if (left) {
          left.style.transform = "";
          left.style.transition = "";
        }
        if (right) {
          right.style.transform = "";
          right.style.transition = "";
        }
        // Add the class to open curtains
        curtain.classList.add('curtain-open');
      }
    }, 250);

    setTimeout(() => {
      if (opts.onStart) opts.onStart();
    }, 500);
  });
}


// ---------- Animation Helpers ----------

function fadeIn(el, delay = 0) {
  if (!el) return;
  el.style.opacity = 0;
  el.style.transform = "translateY(12px)";
  setTimeout(() => {
    el.style.transition = "all 0.8s ease";
    el.style.opacity = 1;
    el.style.transform = "translateY(0)";
  }, delay);
}

function pulseButton(btn) {
  btn.style.animation = "pulse-btn 1.8s ease-in-out infinite";
}

function shakeCurtains() {
  const left = document.querySelector('.curtain.left');
  const right = document.querySelector('.curtain.right');

  if (!left || !right) return;

  [left, right].forEach(c => {
    c.style.transition = "transform 0.2s";
    c.style.transform += " translateY(-4px)";
    setTimeout(() => {
      // Reset transform to allow CSS to take over
      c.style.transform = "";
      c.style.transition = "";
    }, 200);
  });
}

function sparkleBurst(originEl) {
  const rect = originEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.textContent = ['✨','💖','🌟'][Math.floor(Math.random() * 3)];
    p.style.position = "fixed";
    p.style.left = centerX + "px";
    p.style.top = centerY + "px";
    p.style.fontSize = (10 + Math.random() * 14) + "px";
    p.style.transition = "all 0.9s ease-out";
    document.body.appendChild(p);

    // animate outward
    setTimeout(() => {
      p.style.transform = `translate(${Math.random()*120-60}px, ${Math.random()*-100}px) rotate(${Math.random()*180}deg)`;
      p.style.opacity = 0;
    }, 10);

    // remove
    setTimeout(() => p.remove(), 1000);
  }
}
