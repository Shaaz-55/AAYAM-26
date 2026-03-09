console.log("Atomic Competitions - Math Orbit Engine");

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

// --- LIGHTNING CANVAS ---
const lightningCanvas = document.getElementById('lightning-canvas');
const lCtx = lightningCanvas.getContext('2d');
function resizeLightningCanvas() {
    lightningCanvas.width = window.innerWidth;
    lightningCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeLightningCanvas);
resizeLightningCanvas();

let lightningActive = false;
let lightningFrame;
function drawLightning(x1, y1, x2, y2) {
    const segments = 10;
    lCtx.beginPath();
    lCtx.moveTo(x1, y1);

    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    for (let i = 1; i <= segments; i++) {
        let targetX = x1 + dx * i;
        let targetY = y1 + dy * i;
        if (i < segments) {
            targetX += (Math.random() - 0.5) * 40;
            targetY += (Math.random() - 0.5) * 40;
        }
        lCtx.lineTo(targetX, targetY);
    }

    lCtx.strokeStyle = Math.random() > 0.5 ? '#ffffff' : '#c8e8ff';
    lCtx.lineWidth = Math.random() * 2 + 1;
    lCtx.shadowBlur = 10;
    lCtx.shadowColor = '#b0c8ff';
    lCtx.stroke();
}
function lightningLoop() {
    if (!lightningActive) {
        lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
        return;
    }
    lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Draw bolts from center to random nodes
    const numBolts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numBolts; i++) {
        if (orbitingItems.length > 0) {
            const rNode = orbitingItems[Math.floor(Math.random() * orbitingItems.length)];
            // approximate screen pos
            const tarX = cx + rNode.x;
            const tarY = cy + rNode.y;
            drawLightning(cx, cy, tarX, tarY);
        }
    }

    // Flicker flash
    if (Math.random() > 0.8) {
        document.body.classList.add('flash');
    } else {
        document.body.classList.remove('flash');
    }

    setTimeout(() => {
        if (lightningActive) lightningFrame = requestAnimationFrame(lightningLoop);
    }, 50);
}

// --- SETUP MATH ORBITS ---
const orbitsContainer = document.getElementById('orbits-container');
const scene = document.getElementById('scene');
const nucleus = document.getElementById('nucleus');
const gridContainer = document.getElementById('grid-container');

const TOTAL_IMAGES = 16;
const imgSource = "doggy.png";

let orbitingItems = []; // state for math loop

// We have 16 images. Let's make 2 intersecting elliptical paths.
// Path 1: 8 images, Path 2: 8 images (different tilt)
for (let i = 0; i < TOTAL_IMAGES; i++) {
    const el = document.createElement('img');
    el.src = imgSource;
    el.className = 'math-orbiter';
    orbitsContainer.appendChild(el);

    // Determine path assignment (0 or 1)
    const ringIndex = i < 8 ? 0 : 1;
    const itemsInRing = 8;
    const indexInRing = i % itemsInRing;

    orbitingItems.push({
        el: el,
        theta: (Math.PI * 2 / itemsInRing) * indexInRing, // evenly spaced
        baseSpeed: 0.005 + (Math.random() * 0.001), // gentle variation
        ringIndex: ringIndex,
        x: 0,
        y: 0
    });
}

// Central parameters
let globalSpeedMultiplier = 1;
let orbitActive = true;

// The main 3D illusion loop
function animateOrbits() {
    if (!orbitActive) return;

    // Use responsive radii
    const rxBase = Math.min(window.innerWidth * 0.35, 400);
    const ryBase = rxBase * 0.3; // Squashed vertically for 3D

    orbitingItems.forEach(item => {
        // Update angle
        item.theta += item.baseSpeed * globalSpeedMultiplier;

        let rx = rxBase;
        let ry = ryBase;

        let x = rx * Math.cos(item.theta);
        let y = ry * Math.sin(item.theta);

        // Ring 1 is tilted one way, Ring 2 tilted mathematically
        // We can simulate an angled ellipse by applying a 2D rotation matrix to the x/y plane
        const tiltAngle = item.ringIndex === 0 ? 0.4 : -0.4; // radians

        const rotatedX = x * Math.cos(tiltAngle) - y * Math.sin(tiltAngle);
        const rotatedY = x * Math.sin(tiltAngle) + y * Math.cos(tiltAngle);

        // Depth simulation from original sine wave before tilt (y axis acts as depth)
        // sin(theta) goes from -1 (back) to +1 (front)
        const depth = Math.sin(item.theta);

        const scale = 0.65 + 0.35 * ((depth + 1) / 2); // 0.65 back, 1.0 front
        const opacity = 0.5 + 0.5 * ((depth + 1) / 2); // 0.5 back, 1.0 front
        const zIndex = Math.round(depth * 10) + 100;   // Nucleus is naturally at z-index 100, so items pass behind and in front (-10 to 10 relative)

        // Save absolute relative for lightning
        item.x = rotatedX;
        item.y = rotatedY;

        item.el.style.transform = `translate(${rotatedX}px, ${rotatedY}px) scale(${scale})`;
        item.el.style.opacity = opacity;
        item.el.style.zIndex = zIndex; // Above or below nucleus dynamically
    });

    requestAnimationFrame(animateOrbits);
}

// Start loop
animateOrbits();


// --- INTERACTION & 4-PHASE SEQUENCE ---

let sequenceState = 'idle';

nucleus.addEventListener('click', () => {
    if (sequenceState !== 'idle') return;
    executeBurstSequence();
});

function executeBurstSequence() {
    sequenceState = 'running';

    // Step 1: Acceleration Phase (0 - 700ms)
    globalSpeedMultiplier = 5; // Speed up dramatically instantly
    nucleus.classList.add('accelerated');

    // Step 2: Lightning Phase (400ms - 1100ms)
    setTimeout(() => {
        lightningActive = true;
        lightningLoop();
    }, 400);

    // Step 3: Burst & Scatter (1100ms - 1600ms)
    setTimeout(() => {
        lightningActive = false;
        cancelAnimationFrame(lightningFrame);
        document.body.classList.remove('flash');

        orbitActive = false; // Stop elliptical math loop

        // Setup Grid underlying structure (hidden for now)
        gridContainer.style.display = 'grid'; // Need it in DOM to calculate targets
        gridContainer.innerHTML = '';
        const targetCells = [];

        for (let i = 0; i < TOTAL_IMAGES; i++) {
            const d = document.createElement('div');
            d.className = 'card';
            d.innerHTML = `<img src="${imgSource}" alt="Competition" /><div class="card-label">AAYAM '26</div>`;
            gridContainer.appendChild(d);
            targetCells.push(d);
        }

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        // Physics flyout
        orbitingItems.forEach((item, index) => {
            // Screen coords
            const startX = cx + item.x;
            const startY = cy + item.y;

            // Get target cell coords
            const targetRect = targetCells[index].getBoundingClientRect();
            // Centered target relative to window
            const targetX = targetRect.left + targetRect.width / 2;
            const targetY = targetRect.top + targetRect.height / 2;

            // Render a flyout item
            const fly = document.createElement('img');
            fly.src = imgSource;
            fly.className = 'flyout-item';

            // Ensure flyout item starts centered exactly on the relative startX/Y
            // We'll set absolute top/left to 0 and use transform exclusively.
            fly.style.top = '0px';
            fly.style.left = '0px';
            document.body.appendChild(fly);

            let currentX = startX;
            let currentY = startY;

            // Velocity vector pointing from center -> target grid cell
            const dirX = targetX - cx;
            const dirY = targetY - cy;

            // Initial Velocity
            let velX = dirX * 0.15;
            let velY = dirY * 0.15;

            let blur = 6;

            function flyStep() {
                // Easing deceleration (velocity *= 0.88 each frame)
                velX *= 0.88;
                velY *= 0.88;

                currentX += velX;
                currentY += velY;

                blur *= 0.88; // fade blur

                fly.style.transform = `translate(${currentX}px, ${currentY}px)`;
                fly.style.filter = `blur(${Math.max(0, Math.floor(blur))}px)`;

                // Stop when velocity is very low
                if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
                    requestAnimationFrame(flyStep);
                } else {
                    // Snap exactly to target cell center to avoid any sub-pixel drift
                    fly.style.transform = `translate(${targetX}px, ${targetY}px)`;
                }
            }
            requestAnimationFrame(flyStep);

            // Hide the original math orbiter
            item.el.style.display = 'none';
        });

    }, 1100);

    // Step 4: 4x4 Grid Display (1600ms onwards)
    setTimeout(() => {
        // Hide entire atom scene permanently
        scene.style.display = 'none';

        // Remove any lingering flyout clones
        document.querySelectorAll('.flyout-item').forEach(f => f.remove());

        // Staggered Pop-in
        const cards = document.querySelectorAll('.competition-grid .card');
        cards.forEach((card, i) => {
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, i * 50); // 50ms stagger
        });

    }, 1600);
}
