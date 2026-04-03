// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const TOTAL_FRAMES = 301;
const frames = [];

// Control mode: 'mouse' | 'scroll'
let controlMode = 'mouse';

// Scroll progress (0–1), interpolated smoothly
let scrollProgress = 0;
let targetScrollProgress = 0;

// ─────────────────────────────────────────────
//  p5.js LIFECYCLE
// ─────────────────────────────────────────────
function preload() {
    for (let i = 1; i <= TOTAL_FRAMES; i += 1) {
        const numFrames = String(i).padStart(4, '0');
        frames.push(loadImage(`frames/frame_${numFrames}.webp`));
    }
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('principal');
    canvas.class('sequence-canvas');
    noSmooth();
    initScrollMode();
    initToggle();
}

function draw() {
    background(0);

    let progres;

    if (controlMode === 'scroll') {
        // Smooth lerp toward target scroll progress
        scrollProgress = lerp(scrollProgress, targetScrollProgress, 0.12);
        progres = scrollProgress;
    } else {
        // Mouse / touch position
        const pointerX = touches.length > 0 ? touches[0].x : mouseX;
        const pointerY = touches.length > 0 ? touches[0].y : mouseY;
        const normalizedX = pointerX / width;
        const normalizedY = pointerY / height;
        progres = (normalizedX + normalizedY) / 2;
    }

    // Clamp
    progres = constrain(progres, 0, 1);

    let frameIndex = Math.floor(progres * (TOTAL_FRAMES - 1));
    frameIndex = constrain(frameIndex, 0, TOTAL_FRAMES - 1);

    const frame = frames[frameIndex];
    if (frame) {
        const imageRatio = frame.width / frame.height;
        const viewportRatio = width / height;

        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (imageRatio > viewportRatio) {
            drawWidth  = width;
            drawHeight = drawWidth / imageRatio;
            offsetY    = (height - drawHeight) * 0.5;
        } else {
            drawHeight = height;
            drawWidth  = drawHeight * imageRatio;
            offsetX    = (width - drawWidth) * 0.5;
        }

        image(frame, offsetX, offsetY, drawWidth, drawHeight);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ─────────────────────────────────────────────
//  SCROLL MODE
// ─────────────────────────────────────────────
function initScrollMode() {
    const scrollTrack    = document.getElementById('scroll-track');
    const scrollIndicator = document.getElementById('scroll-indicator');

    scrollTrack.addEventListener('scroll', () => {
        if (controlMode !== 'scroll') return;

        const maxScroll = scrollTrack.scrollHeight - scrollTrack.clientHeight;
        targetScrollProgress = maxScroll > 0
            ? scrollTrack.scrollTop / maxScroll
            : 0;

        // Update progress bar
        scrollIndicator.style.height = (targetScrollProgress * 100) + '%';
    });
}

function activateScrollMode() {
    controlMode = 'scroll';
    document.getElementById('scroll-track').classList.add('active');
    document.getElementById('scroll-indicator').classList.add('visible');
    // Reset scroll position to match current frame state
    const scrollTrack = document.getElementById('scroll-track');
    const maxScroll = scrollTrack.scrollHeight - scrollTrack.clientHeight;
    scrollTrack.scrollTop = targetScrollProgress * maxScroll;
}

function activateMouseMode() {
    controlMode = 'mouse';
    document.getElementById('scroll-track').classList.remove('active');
    document.getElementById('scroll-indicator').classList.remove('visible');
}

// ─────────────────────────────────────────────
//  TOGGLE SWITCH
// ─────────────────────────────────────────────
function initToggle() {
    const pill        = document.getElementById('toggle-pill');
    const labelMouse  = document.getElementById('label-mouse');
    const labelScroll = document.getElementById('label-scroll');

    function toggle() {
        if (controlMode === 'mouse') {
            activateScrollMode();
            pill.classList.add('scroll-active');
            pill.setAttribute('aria-checked', 'true');
            labelMouse.classList.remove('active');
            labelScroll.classList.add('active');
        } else {
            activateMouseMode();
            pill.classList.remove('scroll-active');
            pill.setAttribute('aria-checked', 'false');
            labelMouse.classList.add('active');
            labelScroll.classList.remove('active');
        }
    }

    pill.addEventListener('click', toggle);
    labelMouse.addEventListener('click', () => { if (controlMode !== 'mouse')  toggle(); });
    labelScroll.addEventListener('click', () => { if (controlMode !== 'scroll') toggle(); });

    // Keyboard accessibility
    pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
}
