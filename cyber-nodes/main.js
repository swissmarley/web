import WindowManager from './WindowManager.js';

const canvas = document.getElementById('projector');
const ctx = canvas.getContext('2d');

const windowManager = new WindowManager();

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- CONFIGURATION ---
const CONFIG = {
    starCount: 300,        // 3D Background density
    starSpeed: 2,          // Travel speed
    fov: 300,              // Field of View (Depth)
    coreColor: '#00f7ff',  // Cyan Core
    beamColor: '#bc13fe',  // Magenta Beam
};

// --- STATE MANAGEMENT ---
let currentText = "";
let lastTypingTime = 0;
let shockwaves = []; // Array of active mouse ripples

// --- 3D MATH HELPER ---
// Projects a 3D point (x,y,z) onto the 2D Canvas
function project3D(x, y, z, centerX, centerY) {
    const scale = CONFIG.fov / (CONFIG.fov + z);
    const x2d = (x * scale) + centerX;
    const y2d = (y * scale) + centerY;
    return { x: x2d, y: y2d, scale: scale };
}

// --- CLASS: 3D STAR (Background) ---
class Star {
    constructor() {
        this.reset();
        // Start at random z to fill screen immediately
        this.z = Math.random() * 2000; 
    }
    
    reset() {
        this.x = (Math.random() - 0.5) * 2000; // Wide spread
        this.y = (Math.random() - 0.5) * 2000;
        this.z = 2000; // Start far away
        this.size = Math.random();
    }

    update(speed) {
        this.z -= speed;
        if(this.z < 1) this.reset();
    }

    draw(ctx, centerX, centerY) {
        const point = project3D(this.x, this.y, this.z, centerX, centerY);
        const alpha = (2000 - this.z) / 2000; // Fade in as it gets closer
        
        ctx.fillStyle = `rgba(200, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, this.size * point.scale * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- CLASS: SHOCKWAVE (Mouse Interaction) ---
class Shockwave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.opacity = 1;
    }
    update() {
        this.radius += 5;
        this.opacity -= 0.02;
    }
    draw(ctx) {
        if(this.opacity <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Initialize Stars
const stars = Array.from({ length: CONFIG.starCount }, () => new Star());

// --- INPUT LISTENERS ---
// 1. Typing Logic
window.addEventListener('keydown', (e) => {
    if(e.key.length === 1) {
        currentText = e.key; // Store only last char for simplicity in this demo
        lastTypingTime = Date.now();
        // Send this text to WindowManager so others see it
        windowManager.updateShape({ text: currentText, time: Date.now() });
    }
});

// 2. Mouse Logic
window.addEventListener('mousedown', (e) => {
    shockwaves.push(new Shockwave(e.clientX, e.clientY));
    // Send "pulse" metadata (optional expansion)
});

// --- RENDER LOOP ---
function render() {
    const t = Date.now() / 1000;
    
    // 1. CLEAR SCREEN (Deep Space with slight trail)
    ctx.fillStyle = 'rgba(2, 2, 5, 0.4)'; // Higher alpha = less trail, cleaner look
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. UPDATE & DRAW BACKGROUND (3D Tunnel)
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    
    stars.forEach(star => {
        star.update(CONFIG.starSpeed);
        star.draw(ctx, midX, midY);
    });

    // 3. PROCESS SHOCKWAVES
    shockwaves.forEach((sw, i) => {
        sw.update();
        sw.draw(ctx);
        if(sw.opacity <= 0) shockwaves.splice(i, 1);
    });

    // 4. WINDOW MANAGEMENT
    const windows = windowManager.getWindows();
    const me = windowManager.getThisWindowData();
    
    if (!me) { requestAnimationFrame(render); return; }

    // Update my state periodically to clear text after a while
    if(Date.now() - lastTypingTime > 1000 && me.shape.meta?.text) {
         windowManager.updateShape({ text: "" }); // Clear text
    }

    ctx.globalCompositeOperation = 'screen'; // Additive blending for glow

    // 5. DRAW NODES & CONNECTIONS
    windows.forEach(win => {
        // Calculate Relative Positions
        const relativeX = win.shape.x - me.shape.x;
        const relativeY = win.shape.y - me.shape.y;
        const centerX = relativeX + (win.shape.w / 2);
        const centerY = relativeY + (win.shape.h / 2);

        // A. Draw CORE (The Window Center)
        // Pulsing animation
        const pulse = Math.sin(t * 3) * 5;
        
        // Outer Glow
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60);
        grad.addColorStop(0, CONFIG.coreColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI*2);
        ctx.fill();

        // Inner Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 + pulse, 0, Math.PI*2);
        ctx.fill();

        // B. DISPLAY TYPED TEXT
        if (win.shape.meta && win.shape.meta.text) {
            ctx.font = "bold 60px Rajdhani";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(win.shape.meta.text.toUpperCase(), centerX, centerY - 80);
            
            // Draw a box around it
            ctx.strokeStyle = CONFIG.coreColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(centerX - 30, centerY - 130, 60, 60);
        }

        // C. DRAW CONNECTION (Vibrating Energy Beam)
        if (win.id !== me.id) {
            const myCenterX = me.shape.w / 2;
            const myCenterY = me.shape.h / 2;
            const dist = Math.hypot(centerX - myCenterX, centerY - myCenterY);

            // 1. The Core Beam (Straight)
            const beamGrad = ctx.createLinearGradient(myCenterX, myCenterY, centerX, centerY);
            beamGrad.addColorStop(0, CONFIG.coreColor);
            beamGrad.addColorStop(0.5, CONFIG.beamColor);
            beamGrad.addColorStop(1, CONFIG.coreColor);
            
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(myCenterX, myCenterY);
            ctx.lineTo(centerX, centerY);
            ctx.stroke();

            // 2. The Sine Wave Energy (Vibrating)
            // We calculate points along the line and displace them using Sine
            ctx.beginPath();
            ctx.moveTo(myCenterX, myCenterY);
            
            const steps = dist / 5; // Resolution
            const angle = Math.atan2(centerY - myCenterY, centerX - myCenterX);
            const perpAngle = angle + Math.PI / 2; // 90 degrees to line

            for(let i=0; i <= steps; i++) {
                const ratio = i / steps;
                // Linear position
                const lx = myCenterX + (centerX - myCenterX) * ratio;
                const ly = myCenterY + (centerY - myCenterY) * ratio;
                
                // Vibration physics: Highest in middle, zero at ends
                const vibrationAmp = Math.sin(ratio * Math.PI) * 20; 
                // Frequency based on time
                const displacement = Math.sin((ratio * 10) - (t * 10)) * vibrationAmp;

                const dx = Math.cos(perpAngle) * displacement;
                const dy = Math.sin(perpAngle) * displacement;

                ctx.lineTo(lx + dx, ly + dy);
            }
            
            ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // 3. Floating Particles along the beam
            const particlePos = (t % 1); // 0 to 1
            const particleX = myCenterX + (centerX - myCenterX) * particlePos;
            const particleY = myCenterY + (centerY - myCenterY) * particlePos;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 5, 0, Math.PI*2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
}

requestAnimationFrame(render);