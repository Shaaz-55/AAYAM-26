console.log("Atomic Competitions - Grid Burst Initialized");

// --- 1. Background Grain ---
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
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;     // R
        data[i + 1] = val;   // G
        data[i + 2] = val;   // B
        data[i + 3] = Math.random() * 10; // Alpha
    }
    bgCtx.putImageData(imgData, 0, 0);
}

window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();


// --- 2. Setup 16 Images on Orbits ---
const orbitsContainer = document.getElementById('orbits-container');
const gridContainer = document.getElementById('grid-container');
const nucleus = document.getElementById('nucleus');
const scene = document.getElementById('scene');
const resetBtn = document.getElementById('reset-btn');

const TOTAL_IMAGES = 16;
const IMAGES_PER_RING = 8;
const NUM_RINGS = 2; // 2 rings of 8 = 16

const imgSource = "doggy.png";

// Generate Orbital Rings and Images
let orbitingImages = []; // Stores references for the animation
for (let r = 0; r < NUM_RINGS; r++) {
    const orbit = document.createElement('div');
    orbit.className = 'orbit';

    // Ring 1: tilted forward. Ring 2: tilted backward.
    const rotX = r === 0 ? '70deg' : '110deg';
    const rotY = r === 0 ? '20deg' : '-20deg';
    const duration = r === 0 ? '15s' : '18s';

    orbit.style.setProperty('--rotation-x', rotX);
    orbit.style.setProperty('--rotation-y', rotY);

    const orbitInner = document.createElement('div');
    orbitInner.className = 'orbit-inner';
    orbitInner.style.setProperty('--duration', duration);

    for (let i = 0; i < IMAGES_PER_RING; i++) {
        const angle = (i / IMAGES_PER_RING) * 360;

        const wrapper = document.createElement('div');
        wrapper.className = 'orbiting-img-wrapper';
        wrapper.style.setProperty('--duration', duration);
        wrapper.style.setProperty('--rotation-x', rotX);
        wrapper.style.setProperty('--rotation-y', rotY);
        // Position on the edge of the circle
        wrapper.style.transform = `translate(-50%, -50%) rotateZ(${angle}deg) translateY(calc(var(--orbit-size) / -2))`;

        // Counter-spin container to keep image upright
        const counterSpin = document.createElement('div');
        counterSpin.style.width = '100%';
        counterSpin.style.height = '100%';
        counterSpin.style.transformStyle = 'preserve-3d';
        counterSpin.style.animation = `counter-spin var(--duration) linear infinite normal`;
        // Start counter spin offset to match current angle so it points up
        counterSpin.style.animationDelay = `calc(var(--duration) * -${i / IMAGES_PER_RING})`;

        const img = document.createElement('img');
        img.src = imgSource;
        img.className = 'orbiting-img';

        orbitingImages.push(img);

        counterSpin.appendChild(img);
        wrapper.appendChild(counterSpin);
        orbitInner.appendChild(wrapper);
    }

    orbit.appendChild(orbitInner);
    orbitsContainer.appendChild(orbit);
}

// Generate the 16 Grid targets
for (let i = 0; i < TOTAL_IMAGES; i++) {
    const item = document.createElement('div');
    item.className = 'grid-item';
    const gridImg = document.createElement('img');
    gridImg.src = imgSource;
    item.appendChild(gridImg);
    gridContainer.appendChild(item);
}


// --- 3. The Sequence (Accelerate -> Grid Burst) ---

let state = 'idle'; // idle, bursting, grid

nucleus.addEventListener('click', () => {
    if (state !== 'idle') return;
    triggerBurstSequence();
});

resetBtn.addEventListener('click', () => {
    if (state !== 'grid') return;
    resetToIdle();
});

function triggerBurstSequence() {
    state = 'bursting';

    // 1. Accelerate
    document.documentElement.style.setProperty('--global-speed-scale', '0.15'); // Faster (multiplier)
    nucleus.classList.add('accelerated');
    document.querySelectorAll('.orbit').forEach(o => o.classList.add('accelerated'));

    // 2. Burst after a short wind-up build-up
    setTimeout(() => {
        // Prepare grid (unhide container, but keep items hidden for now)
        gridContainer.classList.remove('hidden');
        scene.style.opacity = '0'; // Hide the atom scene visually right away
        scene.style.transition = 'opacity 0.2s';

        const gridItems = document.querySelectorAll('.grid-item');

        // Map each orbiting image to a grid target and fly a clone there
        orbitingImages.forEach((orbitImg, index) => {
            const startRect = orbitImg.getBoundingClientRect();
            const targetCell = gridItems[index];
            const endRect = targetCell.getBoundingClientRect();

            // Create a flying clone
            const clone = document.createElement('img');
            clone.src = imgSource;
            clone.className = 'flying-clone';
            document.body.appendChild(clone);

            // Animate mathematically
            const anim = clone.animate([
                {
                    left: `${startRect.left}px`,
                    top: `${startRect.top}px`,
                    width: `${startRect.width}px`,
                    height: `${startRect.height}px`,
                    transform: `rotate(${Math.random() * 45 - 22.5}deg) scale(1)`
                },
                {
                    left: `${endRect.left}px`,
                    top: `${endRect.top}px`,
                    width: `${endRect.width}px`,
                    height: `${endRect.height}px`,
                    transform: `rotate(0deg) scale(1)`
                }
            ], {
                duration: 800 + (Math.random() * 300), // Slightly random arrival times
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // easeOutExpo
                fill: 'forwards'
            });

            anim.onfinish = () => {
                clone.remove();
                targetCell.style.opacity = '1'; // Show actual grid item
            };
        });

        // Show Reset button after the longest animation finishes
        setTimeout(() => {
            state = 'grid';
            resetBtn.classList.remove('hidden');
        }, 1200);

    }, 1000); // 1-second windup
}

function resetToIdle() {
    state = 'idle';
    resetBtn.classList.add('hidden');

    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => item.style.opacity = '0'); // Hide grid items
    gridContainer.classList.add('hidden'); // Hide grid layout entirely

    // Restore scene
    document.documentElement.style.setProperty('--global-speed-scale', '1');
    nucleus.classList.remove('accelerated');
    document.querySelectorAll('.orbit').forEach(o => o.classList.remove('accelerated'));

    scene.style.opacity = '1';

    // Quick pop-in animation for atom
    scene.animate([
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // easeOutExpo
        fill: 'forwards'
    });
}
