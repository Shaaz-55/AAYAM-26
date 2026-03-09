console.log("Atomic Competitions - Math Orbit & Scroll Engine");

// --- BACKGROUND GRAIN ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
function resizeBgCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    drawGrain();
}
function drawGrain() {
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    const imgData = bgCtx.createImageData(w, h);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.random() * 255;
        imgData.data[i] = val;
        imgData.data[i + 1] = val;
        imgData.data[i + 2] = val;
        imgData.data[i + 3] = Math.random() * 10;
    }
    bgCtx.putImageData(imgData, 0, 0);
}
window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();

// --- SETUP MATH ORBITS ---
const orbitContainer = document.getElementById('orbit-container');
const scene = document.getElementById('scene');
const nucleus = document.getElementById('nucleus');
const gridContainer = document.getElementById('grid-container');

const IMG_SRC = "doggy.png"; // Fix 3: One source of truth for images
const ITEM_SIZE = 60; // 60px width/height

let itemsGroupA = [];
let itemsGroupB = [];

for (let i = 0; i < 8; i++) {
    const el = document.createElement('img');
    el.src = IMG_SRC;
    el.className = 'orbit-item';
    orbitContainer.appendChild(el);
    itemsGroupA.push(el);
}

for (let i = 0; i < 8; i++) {
    const el = document.createElement('img');
    el.src = IMG_SRC;
    el.className = 'orbit-item';
    orbitContainer.appendChild(el);
    itemsGroupB.push(el);
}

// ---- ORBITAL CONFIGURATION ----
const rings = [
    {
        items: itemsGroupA,
        rx: 320,
        ry: 95,
        tiltDeg: 45,
        speed: 0.024,
        direction: 1,
        baseAngle: 0
    },
    {
        items: itemsGroupB,
        rx: 320,
        ry: 95,
        tiltDeg: -45,
        speed: 0.024,
        direction: -1,
        baseAngle: 0
    }
];

let globalSpeedMultiplier = 1;
let orbitActive = true;
let orbitRAF;
let allOrbitingElements = [...itemsGroupA, ...itemsGroupB];

let targetGlowIntensity = 0;
let currentGlowIntensity = 0;

function getNucleusCenter() {
    const rect = nucleus.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Run this once on load AND on window resize
function positionRingLines() {
    const { x: cx, y: cy } = getNucleusCenter();

    const ringA = document.getElementById('ring-line-a');
    const ringB = document.getElementById('ring-line-b');

    const rw = 640; // rx * 2
    const rh = 190; // ry * 2

    [ringA, ringB].forEach(ring => {
        if (!ring) return;
        ring.style.position = 'fixed';
        ring.style.width = rw + 'px';
        ring.style.height = rh + 'px';
        ring.style.left = (cx - rw / 2) + 'px';
        ring.style.top = (cy - rh / 2) + 'px';
        ring.style.borderRadius = '50%';
        ring.style.border = '1px solid rgba(255,255,255,0.15)';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '50';
    });

    if (ringA) ringA.style.transform = 'rotate(45deg)';
    if (ringB) ringB.style.transform = 'rotate(-45deg)';
}

window.addEventListener('resize', positionRingLines);
// Give a small delay to ensure CSS has applied layout before measuring nucleus
setTimeout(positionRingLines, 50);

// The main 3D illusion loop
function updateOrbits() {
    if (!orbitActive) return;

    // Smoothly lerp glow toward target (0.08 = smooth easing factor)
    currentGlowIntensity += (targetGlowIntensity - currentGlowIntensity) * 0.08;
    updateNucleusGlow(currentGlowIntensity);

    const { x: cx, y: cy } = getNucleusCenter();

    rings.forEach(ring => {
        ring.items.forEach((item, i) => {
            const angleOffset = (2 * Math.PI / ring.items.length) * i;
            const theta = ring.baseAngle * ring.direction + angleOffset;

            // Raw ellipse position
            const rawX = ring.rx * Math.cos(theta);
            const rawY = ring.ry * Math.sin(theta);

            // Apply tilt rotation to (rawX, rawY)
            const tiltRad = ring.tiltDeg * (Math.PI / 180);
            const x = rawX * Math.cos(tiltRad) - rawY * Math.sin(tiltRad);
            const y = rawX * Math.sin(tiltRad) + rawY * Math.cos(tiltRad);

            // Depth effect
            const depth = Math.sin(theta);  // -1 (back) to +1 (front)
            const scale = 0.55 + 0.45 * ((depth + 1) / 2);

            // Adjust opacity explicitly based on phase or just let it breathe naturally
            const opacity = 0.4 + 0.6 * ((depth + 1) / 2);
            const zIndex = Math.round(depth * 10) + 10;

            // CORRECT: translate from (0,0) top-left of viewport TO the item's final position
            // Subtract half the item's own size
            const finalX = cx + x - (ITEM_SIZE / 2);
            const finalY = cy + y - (ITEM_SIZE / 2);

            item.style.transform = `translate(${finalX}px, ${finalY}px) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.zIndex = zIndex;
        });
        ring.baseAngle += ring.speed * globalSpeedMultiplier;
    });

    orbitRAF = requestAnimationFrame(updateOrbits);
}

// Start loop
updateOrbits();


// --- SCROLL INTERACTION & SEQUENCE ---

let burstTriggered = false;
let scrollProgress = 0;
let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (burstTriggered) return;
    if (scrollTicking) return; // skip if already queued for this frame

    scrollTicking = true;
    requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) { scrollTicking = false; return; }

        scrollProgress = Math.min(scrollTop / maxScroll, 1);

        // Update thin progress bar
        const progressBar = document.getElementById('scroll-progress-bar');
        if (progressBar) {
            progressBar.style.setProperty('--scroll-pct', (scrollProgress * 100) + '%');
        }

        if (scrollProgress < 0.70) {
            globalSpeedMultiplier = 1 + Math.pow(scrollProgress / 0.70, 1.8) * 28;
            targetGlowIntensity = scrollProgress / 0.70;

        } else if (scrollProgress < 0.90) {
            globalSpeedMultiplier = 35;
            targetGlowIntensity = 1;

        } else if (!burstTriggered) {
            burstTriggered = true;
            triggerBurst();
        }

        scrollTicking = false;
    });
});

function updateNucleusGlow(intensity) {
    // intensity: 0 to 1
    const baseGlow = 40;
    const maxGlow = 120;
    const spread = baseGlow + (maxGlow - baseGlow) * intensity;
    nucleus.style.boxShadow = `
        0 0 ${spread}px ${spread * 0.3}px rgba(255,255,255,${0.15 + 0.35 * intensity}),
        0 0 ${spread * 2}px ${spread * 0.6}px rgba(180,200,255,${0.08 + 0.15 * intensity}),
        inset 10px 10px 20px rgba(255, 255, 255, 0.2),
        inset -10px -10px 20px rgba(0, 0, 0, 0.8)
    `;
}

function triggerBurst() {
    // Step A: Keep spinning at max speed for 600ms (visual climax)
    globalSpeedMultiplier = 45;

    // Fade out the entire hint bar
    const hintBar = document.getElementById('scroll-hint-bar');
    if (hintBar) {
        hintBar.style.opacity = '0';
        setTimeout(() => { hintBar.style.display = 'none'; }, 400);
    }

    // Step B: After 600ms, scatter items to grid positions
    setTimeout(() => {
        scatterToGrid();
    }, 600);
}

function computeGridPositions() {
    const cols = 4;
    const rows = 4;
    const gap = 28;
    // We want the grid to match the 1300px max width and center it
    const maxWidth = Math.min(1300, window.innerWidth * 0.92);
    // Left padding to center the 1300px (or 92vw) container
    const sidePadding = (window.innerWidth - maxWidth) / 2;

    const totalWidth = maxWidth;
    const cardWidth = Math.max(0, (totalWidth - gap * (cols - 1)) / cols);
    const cardHeight = cardWidth * (4 / 3); // portrait ratio

    const positions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            positions.push({
                x: sidePadding + c * (cardWidth + gap),
                y: 80 + r * (cardHeight + gap),  // 80px top margin
                width: cardWidth,
                height: cardHeight
            });
        }
    }
    return positions;
}

function scatterToGrid() {
    // Stop the rAF orbit loop
    orbitActive = false;
    cancelAnimationFrame(orbitRAF);

    // RESET SCROLL TO TOP FIRST so viewport Y = document Y (Fix 5)
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Calculate where the 16 grid cells will be
    const gridPositions = computeGridPositions();

    const items = [...document.querySelectorAll('.orbit-item')];

    items.forEach((item, i) => {
        const target = gridPositions[i];

        // Get current position from transform
        const currentRect = item.getBoundingClientRect();
        const startX = currentRect.left;
        const startY = currentRect.top;

        // Reset transform to 0 so we translate directly
        // because we are calculating exact window coordinates.
        // Wait, the item has `position: fixed; top:0; left:0; width:60px`.
        // Translating to target.x, target.y directly works since top/left is 0.

        item.style.transition = `transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                  opacity 0.7s ease,
                                  width 0.7s ease,
                                  height 0.7s ease,
                                  border-radius 0.7s ease`;
        item.style.width = target.width + 'px';
        item.style.height = target.height + 'px';
        item.style.transform = `translate(${target.x}px, ${target.y}px) scale(1)`;
        item.style.opacity = '1';
        item.style.zIndex = '1000';
        item.style.borderRadius = '16px';
        item.style.border = '1px solid rgba(255,255,255,0.2)';
        item.style.pointerEvents = 'auto';
        item.style.overflow = 'hidden';
    });

    // After animation completes, switch to proper scrollable grid
    setTimeout(() => {
        showFinalGrid();
    }, 900);
}

function showFinalGrid() {
    // Hide atom scene completely
    document.getElementById('scene').style.display = 'none';
    document.getElementById('scroll-track').style.display = 'none';
    // DO NOT hide orbit-container here, items are still mid-flight! (Fix 4)

    // Switch body to normal scroll mode
    document.body.classList.add('grid-active');
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';

    // Build and show the grid
    const grid = document.getElementById('grid-container');
    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.transform = 'scale(0)';
        card.innerHTML = `
          <img src="${IMG_SRC}" alt="Competition ${i + 1}" />
          <div class="card-label">Competition ${i + 1}</div>
        `;
        grid.appendChild(card);
    }

    grid.style.display = 'grid';
    // Remove fixed position on grid container to allow normal scrolling
    grid.style.position = 'relative';
    grid.style.transform = 'none';
    grid.style.top = 'auto';
    grid.style.left = 'auto';

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Staggered pop-in
    const cards = grid.querySelectorAll('.card');
    cards.forEach((card, i) => {
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 80 + i * 55);
    });

    // Hide orbit-container AFTER all cards have popped in (Fix 4)
    const totalPopInTime = 80 + 15 * 55 + 500; // last card delay + card transition duration
    setTimeout(() => {
        const oc = document.getElementById('orbit-container');
        if (oc) oc.style.display = 'none';
    }, totalPopInTime);
}
