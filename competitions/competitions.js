console.log("Atomic Competitions - Math Orbit & Scroll Engine");

const competitions = [
    {
        name: "Robo Soccer",
        category: "Robotics",
        overview: "Build an autonomous robot that scores goals against opponents on a miniature football field. Test your engineering and strategy.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🤖"
    },
    {
        name: "Maze Solver",
        category: "Robotics",
        overview: "Design a robot that navigates a complex maze autonomously in the shortest time. Speed, precision, and smart algorithms win.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🧩"
    },
    {
        name: "CAD Modeling",
        category: "Design",
        overview: "Showcase your design prowess by creating precise 3D models using CAD software. Judged on accuracy, complexity, and creativity.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "📐"
    },
    {
        name: "Drone Hurdle",
        category: "Aerial",
        overview: "Pilot your drone through a series of timed aerial obstacles. Steady hands and sharp reflexes decide the winner.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🚁"
    },
    {
        name: "Rocket Launching",
        category: "Aerospace",
        overview: "Engineer and launch a model rocket to a precise altitude target. Points awarded for accuracy, stability, and recovery.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🚀"
    },
    {
        name: "CP Individual",
        category: "Coding",
        overview: "Solo competitive programming contest — solve algorithmic challenges under time pressure. Rated for speed and efficiency.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "💻"
    },
    {
        name: "CP Team",
        category: "Coding",
        overview: "Team-based competitive programming where strategy and collaboration meet algorithmic problem solving.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🤝"
    },
    {
        name: "Bug Bash",
        category: "Coding",
        overview: "Hunt and fix bugs hidden inside complex codebases. The fastest debugger with clean solutions wins.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🐛"
    },
    {
        name: "Codestorm",
        category: "Coding",
        overview: "A rapid-fire coding marathon with multiple rounds of increasing difficulty. Only the sharpest coders survive.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🌪️"
    },
    {
        name: "Free Fire",
        category: "Esports",
        overview: "Squad-based battle royale tournament. Coordinate with your team, outlast your enemies, and claim the Booyah.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🎮"
    },
    {
        name: "BGMI",
        category: "Esports",
        overview: "India's premier mobile battle royale. Squads compete in classic mode for the ultimate chicken dinner.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🔫"
    },
    {
        name: "Smash Karts",
        category: "Esports",
        overview: "High-speed kart racing with weapons and chaos. Navigate the arena, smash rivals, and finish first.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🏎️"
    },
    {
        name: "Valorant",
        category: "Esports",
        overview: "5v5 tactical shooter with unique agents. Teamwork, precision aim, and game sense are your weapons.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🎯"
    },
    {
        name: "Shark Tank",
        category: "Business",
        overview: "Pitch your startup idea to a panel of judges. Get grilled on financials, market fit, and vision. Make them invest.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🦈"
    },
    {
        name: "Photography",
        category: "Creative",
        overview: "Capture the theme of the fest through your lens. Judged on composition, lighting, emotion, and technical skill.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "📸"
    },
    {
        name: "Cinematography",
        category: "Creative",
        overview: "Create a short film or cinematic reel on a given theme. Storytelling, editing, and cinematographic technique are all scored.",
        rulebook: "#",
        prize: "₹20,000",
        emoji: "🎬"
    }
];

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
// Resize handled by debounce handler below
resizeBgCanvas();

// --- SETUP MATH ORBITS ---
const orbitContainer = document.getElementById('orbit-container');
const scene = document.getElementById('scene');
const nucleus = document.getElementById('nucleus');
const gridContainer = document.getElementById('grid-container');

const ITEM_SIZE = 14; // 14px width/height

let itemsGroupA = [];
let itemsGroupB = [];

for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.className = 'orbit-item electron-dot';
    orbitContainer.appendChild(el);
    itemsGroupA.push(el);
}

for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.className = 'orbit-item electron-dot';
    orbitContainer.appendChild(el);
    itemsGroupB.push(el);
}

// ---- ORBITAL CONFIGURATION ----
function getOrbitRadii() {
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    return {
        rx: minDim * 0.38,   // 38% of the smaller viewport dimension
        ry: minDim * 0.11    // 11% — keeps the squashed ellipse ratio
    };
}

let { rx, ry } = getOrbitRadii();

const rings = [
    {
        items: itemsGroupA,
        rx,
        ry,
        tiltDeg: 45,
        speed: 0.024,
        direction: 1,
        baseAngle: 0
    },
    {
        items: itemsGroupB,
        rx,
        ry,
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

    // Use current ring rx/ry instead of hardcoded 640/190
    const rw = rings[0].rx * 2;
    const rh = rings[0].ry * 2;

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

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeBgCanvas();
        const newRadii = getOrbitRadii();
        rings[0].rx = rings[1].rx = newRadii.rx;
        rings[0].ry = rings[1].ry = newRadii.ry;
        positionRingLines();
    }, 100);
});
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

    prebuildGrid(); // ✅ ADDED — builds grid cards invisibly before scatter starts

    // Step B: After 600ms, scatter items to grid positions
    setTimeout(() => {
        scatterToGrid();
    }, 600);
}

function prebuildGrid() {
    const grid = document.getElementById('grid-container');
    grid.innerHTML = '';

    competitions.forEach((comp) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.transform = 'scale(0)';
        card.style.opacity = '0';
        card.innerHTML = `
          <div class="card-inner">
            <div class="card-emoji">${comp.emoji || '✨'}</div>
            <span class="card-category">${comp.category}</span>
            <h1 class="card-title">${comp.name}</h1>
            <p class="card-overview">${comp.overview}</p>
            <div class="card-footer">
              <div class="card-meta">
                <a href="${comp.rulebook}" class="rulebook-link" target="_blank">📄 Rulebook</a>
                <h4 class="card-prize">Prize: ${comp.prize}</h4>
              </div>
              <a href="#" class="register-btn">Register</a>
            </div>
          </div>
        `;
        grid.appendChild(card);
    });

    // Grid is built but invisible — display:grid so layout is computed
    grid.style.display = 'grid';
    grid.style.opacity = '0';
    grid.style.position = 'relative';
    grid.style.transform = 'none';
    grid.style.top = 'auto';
    grid.style.left = 'auto';
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
    // ✅ ADDED: Hide atom scene immediately when dots start flying
    const sceneEl = document.getElementById('scene');
    if (sceneEl) sceneEl.style.display = 'none';

    const ringA = document.getElementById('ring-line-a');
    const ringB = document.getElementById('ring-line-b');
    if (ringA) ringA.style.display = 'none';
    if (ringB) ringB.style.display = 'none';

    const scrollTrackEl = document.getElementById('scroll-track');
    if (scrollTrackEl) scrollTrackEl.style.display = 'none';

    // Stop the rAF orbit loop
    orbitActive = false;
    cancelAnimationFrame(orbitRAF);

    // RESET SCROLL TO TOP FIRST so viewport Y = document Y
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
    // Hide orbit container (scatter animation is fully done by now)
    const oc = document.getElementById('orbit-container');
    if (oc) oc.style.display = 'none';

    // Switch body to scroll mode — lock for 1 frame to prevent mobile jump
    document.body.classList.add('grid-active');
    document.body.style.overflowY = 'hidden';
    requestAnimationFrame(() => {
        document.body.style.overflowY = 'auto';
        document.body.style.overflowX = 'hidden';
    });

    // Fade the pre-built grid in (it exists at opacity:0 from prebuildGrid)
    const grid = document.getElementById('grid-container');
    grid.style.transition = 'opacity 0.2s ease';
    grid.getBoundingClientRect(); // force reflow so CSS transition triggers
    grid.style.opacity = '1';

    // Pop cards in with stagger — starts at 0ms (no 80ms dead gap)
    const cards = grid.querySelectorAll('.card');
    cards.forEach((card, i) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, i * 50);
    });
}
