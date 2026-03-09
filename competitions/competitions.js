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

// --- SETUP MATH ORBITS ---
const orbitsContainer = document.getElementById('orbits-container');
const scene = document.getElementById('scene');
const nucleus = document.getElementById('nucleus');
const gridContainer = document.getElementById('grid-container');

const imgSource = "doggy.png";

let itemsGroupA = [];
let itemsGroupB = [];

for (let i = 0; i < 8; i++) {
    const el = document.createElement('img');
    el.src = imgSource;
    el.className = 'math-orbiter';
    orbitsContainer.appendChild(el);
    itemsGroupA.push(el);
}

for (let i = 0; i < 8; i++) {
    const el = document.createElement('img');
    el.src = imgSource;
    el.className = 'math-orbiter';
    orbitsContainer.appendChild(el);
    itemsGroupB.push(el);
}

// ---- ORBITAL CONFIGURATION ----
const rings = [
    {
        items: itemsGroupA,          // first 8 image elements
        rx: 320,                     // horizontal radius
        ry: 95,                      // vertical radius (squashed = 3D illusion)
        tiltDeg: 45,                 // CSS rotation of the orbital plane
        speed: 0.008,                // radians per frame
        direction: 1,                // 1 = clockwise
        baseAngle: 0
    },
    {
        items: itemsGroupB,          // second 8 image elements
        rx: 320,
        ry: 95,
        tiltDeg: -45,                // opposite tilt
        speed: 0.008,
        direction: -1,               // -1 = counter-clockwise
        baseAngle: 0
    }
];

let globalSpeedMultiplier = 1;
let orbitActive = true;
let allOrbitingElements = [...itemsGroupA, ...itemsGroupB];

// The main 3D illusion loop
function animateOrbits() {
    if (!orbitActive) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

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

            // Depth effect: items at back are smaller and more transparent
            const depth = Math.sin(theta);  // -1 (back) to +1 (front)
            const scale = 0.6 + 0.4 * ((depth + 1) / 2);
            const opacity = 0.45 + 0.55 * ((depth + 1) / 2);
            const zIndex = Math.round(depth * 10) + 10;

            // Center coordinates of the nucleus
            item.style.transform = `translate(${centerX + x}px, ${centerY + y}px) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.zIndex = zIndex;
            item.style.position = 'fixed'; // Must be fixed to stay bound to viewport exactly

            // Save absolute relative position for the flyout calculation later
            item._x = centerX + x;
            item._y = centerY + y;
        });
        ring.baseAngle += ring.speed * globalSpeedMultiplier;
    });

    requestAnimationFrame(animateOrbits);
}

// Start loop
animateOrbits();


// --- INTERACTION & SEQUENCE ---

let sequenceState = 'idle';

nucleus.addEventListener('click', () => {
    if (sequenceState !== 'idle') return;
    executeBurstSequence();
});

function executeBurstSequence() {
    sequenceState = 'running';

    // Step 1: Acceleration Phase (0ms to 700ms)
    globalSpeedMultiplier = 5; // Speed up dramatically instantly
    nucleus.classList.add('accelerated');

    // Step 2: Burst & Scatter (1100ms - 1600ms)
    setTimeout(() => {
        orbitActive = false; // Stop elliptical math loop

        // Setup Grid underlying structure correctly
        gridContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
              <img src="${imgSource}" alt="Competition ${i + 1}" />
              <div class="card-label">Competition ${i + 1}</div>
            `;
            gridContainer.appendChild(card);
        }
        gridContainer.style.display = 'grid'; // Need it briefly rendered to calculate targets

        const targetCells = gridContainer.querySelectorAll('.card');

        // Physics flyout
        allOrbitingElements.forEach((item, index) => {
            // Screen coords exactly where loop left them
            const startX = item._x;
            const startY = item._y;

            // Get target cell coords
            const targetRect = targetCells[index].getBoundingClientRect();
            // Centered target relative to window
            const targetX = targetRect.left + targetRect.width / 2;
            const targetY = targetRect.top + targetRect.height / 2;

            // Render a flyout item for animation
            const fly = document.createElement('img');
            fly.src = imgSource;
            fly.className = 'flyout-item';

            // Adjust to be center transform based
            fly.style.top = '0px';
            fly.style.left = '0px';
            document.body.appendChild(fly);

            let currentX = startX;
            let currentY = startY;

            // Velocity vector pointing from center -> target grid cell
            const dirX = targetX - startX;
            const dirY = targetY - startY;

            // Initial Velocity kick outward
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
            item.style.display = 'none';
        });

    }, 1100);

    // Step 3: 4x4 Grid Display (1600ms onwards)
    setTimeout(() => {
        // Remove any lingering flyout clones
        document.querySelectorAll('.flyout-item').forEach(f => f.remove());

        // Hide entire atom scene permanently
        scene.style.display = 'none';
        document.getElementById('atom-container').style.display = 'none';

        // When showing the grid:
        document.body.classList.add('grid-active');
        document.body.style.overflow = 'auto'; // fallback

        // Scroll to top when grid appears
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Staggered card pop-in
        const cards = document.querySelectorAll('.competition-grid .card');
        cards.forEach((card, i) => {
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 80 + i * 60); // 60ms stagger, starts 80ms after grid render
        });

    }, 1600);
}
