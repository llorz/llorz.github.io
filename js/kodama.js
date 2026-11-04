/** Original small SVG forest spirits, inspired by the Kodama reference.
 * No external assets or dependencies; all motion stops offscreen.
 */
const trail = document.querySelector('.kodama-trail');
if (trail) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const random = (min, max) => min + Math.random() * (max - min);
  let width = trail.clientWidth;
  let pointer = null;
  let visible = false;
  let frame = 0;
  let previous = 0;
  // Deriving width from height guarantees an elongated head for every sample.
  const headStyles = [
    { ratio: [1.1, 1.17], brow: .43, jaw: .41 }, // plump and rounded
    { ratio: [1.22, 1.3], brow: .43, jaw: .4 },  // longer soft oval
    { ratio: [1.13, 1.2], brow: .46, jaw: .44 }, // softly squared
    { ratio: [1.15, 1.23], brow: .4, jaw: .44 }, // fuller lower cheeks
    { ratio: [1.12, 1.22], brow: .46, jaw: .36 } // gently top-heavy
  ];
  const styleOffset = Math.floor(random(0, headStyles.length));
  function sampleHead(index) {
    const style = headStyles[(index + styleOffset) % headStyles.length];
    const height = random(26, 30);
    const width = height / random(...style.ratio);
    const top = 30 - height;
    const left = 20 - width / 2;
    const right = 20 + width / 2;
    const crown = 20 + width * random(-.04, .04);
    const chin = 20 + width * random(-.04, .04);
    const leftCheek = top + height * random(.45, .55);
    const rightCheek = top + height * random(.45, .55);
    const brow = width * (style.brow + random(-.01, .01));
    const jaw = width * (style.jaw + random(-.015, .015));
    // Full cheeks and a broad, softly rounded chin match the gentle reference.
    // Keep asymmetry slight so random samples never become pointed.
    const path = `M${crown} ${top}
      C${crown + brow} ${top} ${right} ${rightCheek - height * .32} ${right} ${rightCheek}
      C${right} ${rightCheek + height * .32} ${chin + jaw} 30 ${chin} 30
      C${chin - jaw} 30 ${left} ${leftCheek + height * .32} ${left} ${leftCheek}
      C${left} ${leftCheek - height * .32} ${crown - brow} ${top} ${crown} ${top}Z`;
    return { path, width, height, top };
  }
  // Move the hands within the continuous outline, keeping shoulders attached.
  function standingTorso(swing = 0) {
    return `M15 28 Q10 30 ${9 - swing * .35} 38
      Q${8 - swing * .35} ${43 + swing} ${11 - swing * .35} ${42 + swing}
      L14 35 Q12 42 17 45 Q21 47 26 43 L26 35
      Q${30 + swing * .35} ${44 - swing} ${32 + swing * .35} ${40 - swing}
      Q32 34 27 29 Q23 26 15 28Z`;
  }
  const spirits = Array.from({ length: 5 }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'kodama-spirit';
    const head = sampleHead(i);
    const eyeY = head.top + head.height * random(.41, .44);
    const eyeGap = head.width * random(.225, .24);
    // Eye size and spacing follow this spirit's head, with bounded asymmetry.
    const eyeWidth = head.width * .1;
    const eyeHeight = head.height * .085;
    const bodyWidth = random(.68, .95);
    const seatedWidth = random(.68, .82);
    const bodyHeight = random(.85, 1.08);
    const eye = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="${eyeWidth * random(.96, 1.04)}" ry="${eyeHeight * random(.96, 1.04)}" transform="rotate(${random(-6, 6)} ${x} ${y})"/>`;
    el.innerHTML = `<svg viewBox="0 0 40 56" focusable="false">
      <ellipse cx="20" cy="54" rx="9" ry="1.2" fill="#6b8972" opacity=".16"/>
      <g class="kodama-posture">
      <g transform="translate(${20 * (1 - bodyWidth)} ${29 * (1 - bodyHeight)}) scale(${bodyWidth} ${bodyHeight})">
      <g class="kodama-limb kodama-skin"><path d="M16 40 C14.5 44 14.5 49 15.5 53.5 Q16.5 55 17.8 53.5 C18.2 50 18.2 46 19 43Z"/></g>
      <g class="kodama-limb kodama-skin"><path d="M22 42 C22 47 22 51 23.5 54 Q25.5 55 26 53 C25.6 49 25 44 25 40Z"/></g>
      <path class="kodama-torso kodama-skin" d="${standingTorso()}"/>
      </g>
      </g>
      <!-- Seated body: knees and feet are drawn in front, below the head. -->
      <g class="kodama-seated" opacity="0">
        <!-- Retain the compact seated design. -->
        <g transform="translate(${20 * (1 - seatedWidth)} ${29 * (1 - bodyHeight)}) scale(${seatedWidth} ${bodyHeight})">
          <path class="kodama-skin" d="M17 32 C14 33 13 37 13 41 C12 44 12 47 14 47 L16 43 Q20 48 24 43 L26 47 C28 47 28 44 27 41 C27 37 26 33 23 32Z"/>
          <path class="kodama-skin" d="M16 43 C13 42 12 45 14 48 Q15 50 15 52 Q17 54 20 52 L19 48 Q20 44 16 43Z"/>
          <path class="kodama-skin" d="M24 43 C27 42 28 45 26 48 Q25 50 25 52 Q23 54 20 52 L21 48 Q20 44 24 43Z"/>
          <path d="M16 36 Q14 41 17 44 M24 36 Q26 41 23 44" fill="none" stroke="#b3c9c7" stroke-width=".8" stroke-linecap="round"/>
        </g>
      </g>
      <g class="kodama-head">
        <path class="kodama-skin" d="${head.path}"/>
        <g class="kodama-face">
          ${eye(20 - eyeGap, eyeY)}
          ${eye(20 + eyeGap, eyeY + head.height * random(-.015, .015))}
          <ellipse cx="${20 + head.width * random(-.025, .025)}" cy="${head.top + head.height * random(.78, .81)}" rx="${head.width * random(.065, .08)}" ry="${head.height * random(.024, .032)}"/>
        </g>
      </g>
    </svg>`;
    trail.append(el);
    return { collisionRadius: head.width * (22 / 40) / 2, sitting: false, restTimer: random(4, 40), companionNear: false, pose: 0, posture: el.querySelector('.kodama-posture'), seated: el.querySelector('.kodama-seated'), el, head: el.querySelector('.kodama-head'), limbs: el.querySelectorAll('.kodama-limb'), torso: el.querySelector('.kodama-torso'), armSwing: random(.7, 1.3), x: width * (.12 + i * .18), direction: i % 2 ? -1 : 1, speed: random(2, 7), cadence: random(3, 6), bob: random(.6, 1.8), stride: random(6, 14), scale: random(.65, 1), phase: random(0, 6), time: random(0, 10), tilt: random(-9, 9) };
  });
  function draw(dt) {
    // Hidden mobile spirits do not take part in encounters.
    const active = spirits.filter(s => s.el.offsetWidth > 0);
    const maxX = Math.max(0, width - 23);
    active.forEach(s => {
      s.near = Boolean(pointer && Math.abs(pointer.x - s.x - 11) < 115);
      // Wake before contact; nearby companions also prevent a new sitting break.
      const companion = active.some(other => other !== s &&
        Math.abs(other.x - s.x) < 9 * (s.scale + other.scale) + 20);
      if (dt > 0 && !reduced.matches) {
        if (companion) {
          // Give each encounter its own delay rather than resetting everyone
          // to the same eight-second countdown on every nearby frame.
          if (s.sitting || !s.companionNear) s.restTimer = random(10, 40);
          s.sitting = false;
        } else {
          s.restTimer -= dt;
          if (s.restTimer <= 0) {
            s.sitting = !s.sitting;
            s.restTimer = s.sitting ? random(4, 12) : random(12, 45);
          }
        }
        s.companionNear = companion;
        // Ease gently between poses, using the same clock as walking.
        s.pose += ((s.sitting ? 1 : 0) - s.pose) * Math.min(1, dt * 6);
      }
      s.moving = !reduced.matches && !s.near && !s.sitting && s.pose < .2;
      if (s.moving) {
        s.time += dt;
        s.x += s.direction * s.speed * dt;
        if (s.x > maxX) { s.x = maxX; s.direction = -1; }
        if (s.x < 0) { s.x = 0; s.direction = 1; }
      }
    });
    if (dt > 0 && !reduced.matches) {
      const ordered = [...active].sort((a, b) => a.x - b.x);
      for (let i = 1; i < ordered.length; i++) {
        const left = ordered[i - 1];
        const right = ordered[i];
        // Turn only at near-contact, using each actual head width at its scale.
        const clearance = left.collisionRadius * left.scale + right.collisionRadius * right.scale + .5;
        const leftVelocity = left.moving ? left.direction * left.speed : 0;
        const rightVelocity = right.moving ? right.direction * right.speed : 0;
        if (right.x - left.x < clearance && leftVelocity > rightVelocity) {
          const overlap = clearance - (right.x - left.x);
          left.x = Math.max(0, left.x - overlap / 2);
          right.x = Math.min(maxX, right.x + overlap / 2);
          // Send them apart. Checking approach velocity prevents repeated flips.
          left.direction = -1;
          right.direction = 1;
        }
      }
    }
    spirits.forEach(s => {
      const near = s.near;
      const moving = s.moving && active.includes(s);
      const step = moving ? Math.sin(s.time * s.cadence + s.phase) : 0;
      const tilt = near && !reduced.matches ? Math.max(-24, Math.min(24, (pointer.x - s.x - 11) * .3)) : s.tilt;
      s.el.classList.toggle('is-curious', Boolean(near));
      s.el.style.transform = `translate(${s.x}px, ${-Math.abs(step) * s.bob}px) scale(${s.scale})`;
      s.posture.setAttribute('opacity', 1 - s.pose);
      s.posture.setAttribute('transform', `translate(0 ${4 * s.pose})`);
      s.seated.setAttribute('opacity', s.pose);
      s.head.setAttribute('transform', `translate(0 ${5 * s.pose}) rotate(${tilt + step * 3} 20 29)`);
      s.torso.setAttribute('d', standingTorso(step * s.armSwing));
      s.limbs.forEach((limb, i) => limb.setAttribute('transform', `rotate(${step * (i ? -s.stride : s.stride)} 20 41)`));
    });
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) return;
    draw(previous ? Math.min((now - previous) / 1000, .05) : 0);
    previous = now;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    draw(0);
    if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(trail);
  new ResizeObserver(() => {
    const nextWidth = trail.clientWidth;
    spirits.forEach(s => { s.x = Math.max(0, Math.min(nextWidth - 23, s.x * nextWidth / (width || 1))); });
    width = nextWidth;
    draw(0);
  }).observe(trail);
  // Listen on the footer so decoration never intercepts clicks or touch scrolling.
  const footer = trail.closest('footer');
  footer.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const rect = trail.getBoundingClientRect();
    pointer = e.clientY >= rect.top - 30 && e.clientY <= rect.bottom + 20 ? { x: e.clientX - rect.left } : null;
    if (reduced.matches) draw(0);
  });
  footer.addEventListener('pointerleave', () => { pointer = null; draw(0); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  draw(0);
}
