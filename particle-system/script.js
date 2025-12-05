// --- 1. CONFIGURATION & STATE ---
        const CONFIG = {
            particleCount: 15000,
            baseColor: 0x4aaaff,
            particleSize: 0.15,
            lerpSpeed: 0.08, // How fast particles move to target
            interactionStrength: 1.0
        };

        const STATE = {
            targetShape: 'sphere',
            handDistance: 0, // 0 to 1 normalized
            handOpenness: 0, // 0 (closed) to 1 (open)
            handsDetected: false,
            time: 0
        };

        // --- 2. THREE.JS SETUP ---
        const scene = new THREE.Scene();
        // Fog for depth
        scene.fog = new THREE.FogExp2(0x050505, 0.02);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // --- 3. PARTICLE ENGINE ---
        
        // Geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const targets = new Float32Array(CONFIG.particleCount * 3);
        const randoms = new Float32Array(CONFIG.particleCount); // For twinkle/noise
        
        // Initialize random positions
        for (let i = 0; i < CONFIG.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            randoms[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('target', new THREE.BufferAttribute(targets, 3));
        
        // Material
        // Using a texture for nicer particles
        // Create an inline canvas texture instead of loading an external image to avoid CORS
        const sprite = (function(){
            const size = 64;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Draw a soft disc gradient
            const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.15, 'rgba(255,255,255,0.95)');
            grad.addColorStop(0.45, 'rgba(255,255,255,0.45)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.fillStyle = grad;
            ctx.fillRect(0,0,size,size);

            return new THREE.CanvasTexture(canvas);
        })();
        const material = new THREE.PointsMaterial({
            color: CONFIG.baseColor,
            size: CONFIG.particleSize,
            map: sprite,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // --- 4. SHAPE GENERATORS (Procedural Math) ---
        
        function generateSphere(i) {
            const phi = Math.acos(-1 + (2 * i) / CONFIG.particleCount);
            const theta = Math.sqrt(CONFIG.particleCount * Math.PI) * phi;
            const r = 8;
            return {
                x: r * Math.cos(theta) * Math.sin(phi),
                y: r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(phi)
            };
        }

        function generateHeart(i) {
            // Heart formula
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            // Distribute points somewhat evenly? Better to use rejection sampling or parametric surface
            // Simple parametric heart
            const t = Math.random() * Math.PI * 2;
            const u = Math.random() * Math.PI; // slice
            
            // 3D Heart approximation
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            const z = (Math.random() - 0.5) * 4; // Thickness
            
            // Add some volume
            const scale = 0.5;
            return { x: x * scale, y: y * scale, z: z };
        }

        function generateFlower(i) {
            // Phyllotaxis 3D
            const spread = 0.5;
            const angle = 137.5 * (Math.PI / 180);
            const r = spread * Math.sqrt(i);
            const theta = i * angle;
            
            // Flower petal curvature
            const z = Math.sin(r * 0.5) * 5;
            
            return {
                x: r * Math.cos(theta),
                y: r * Math.sin(theta),
                z: z - 5 // Center it
            };
        }

        function generateSaturn(i) {
            // 70% Ring, 30% Planet
            const isPlanet = i < CONFIG.particleCount * 0.3;
            
            if (isPlanet) {
                // Sphere
                const phi = Math.acos(-1 + (2 * i) / (CONFIG.particleCount * 0.3));
                const theta = Math.sqrt((CONFIG.particleCount*0.3) * Math.PI) * phi;
                const r = 5;
                return {
                    x: r * Math.cos(theta) * Math.sin(phi),
                    y: r * Math.sin(theta) * Math.sin(phi),
                    z: r * Math.cos(phi)
                };
            } else {
                // Rings
                const angle = Math.random() * Math.PI * 2;
                const radius = 8 + Math.random() * 8; // 8 to 16
                return {
                    x: radius * Math.cos(angle),
                    y: (Math.random() - 0.5) * 0.5, // Thin disk
                    z: radius * Math.sin(angle)
                };
            }
        }

        function generateStatue(i) {
            // Procedural "Meditating Figure" (approximated with primitives)
            const r = Math.random();
            let x, y, z;
            
            if (r < 0.25) {
                // Head (Sphere)
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const rad = 2.5;
                x = rad * Math.sin(theta) * Math.cos(phi);
                y = rad * Math.sin(theta) * Math.sin(phi) + 5; // Lifted up
                z = rad * Math.cos(theta);
            } else if (r < 0.6) {
                // Body (Cylinder/Egg)
                const theta = Math.random() * Math.PI * 2;
                const h = (Math.random() - 0.5) * 6;
                const rad = 3.5 * (1 - Math.abs(h)/7); // Tapered
                x = rad * Math.cos(theta);
                y = h;
                z = rad * Math.sin(theta);
            } else {
                // Legs (Torus segment / Base)
                const theta = Math.random() * Math.PI * 2;
                const rad = 4 + Math.random() * 3;
                x = rad * Math.cos(theta);
                y = -3.5 + (Math.random() * 1.5);
                z = rad * Math.sin(theta);
            }
            return { x, y, z };
        }

        function generateFireworks(i) {
            // Sphere but exploded outward
            // We actually calculate this dynamically in the update loop, 
            // but for a target shape, we can set a huge sphere
            const phi = Math.random() * Math.PI * 2;
            const costheta = Math.random() * 2 - 1;
            const u = Math.random();

            const theta = Math.acos(costheta);
            const r = 25 * Math.cbrt(u); // Uniform sphere

            return {
                x: r * Math.sin(theta) * Math.cos(phi),
                y: r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(theta)
            };
        }

        function calculateTargets(shapeType) {
            const tempVec = new THREE.Vector3();
            for (let i = 0; i < CONFIG.particleCount; i++) {
                let pos;
                switch(shapeType) {
                    case 'heart': pos = generateHeart(i); break;
                    case 'flower': pos = generateFlower(i); break;
                    case 'saturn': pos = generateSaturn(i); break;
                    case 'statue': pos = generateStatue(i); break;
                    case 'fireworks': pos = generateFireworks(i); break;
                    default: pos = generateSphere(i); break;
                }
                
                // Add some noise to targets for organic feel
                targets[i * 3] = pos.x;
                targets[i * 3 + 1] = pos.y;
                targets[i * 3 + 2] = pos.z;
            }
        }

        // Initialize with default
        calculateTargets('sphere');

        // UI Functions
        window.setShape = (shape) => {
            STATE.targetShape = shape;
            calculateTargets(shape);
            
            // Update active button state
            document.querySelectorAll('.btn-template').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
        };

        // Color Picker
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            material.color.set(e.target.value);
            CONFIG.baseColor = material.color.getHex();
        });

        // --- 5. ANIMATION LOOP ---

        function animate() {
            requestAnimationFrame(animate);
            STATE.time += 0.01;

            const positionsAttr = geometry.attributes.position;
            const positionsArr = positionsAttr.array;
            
            // Interaction Factors
            // 1. Scale: Based on hand distance. Normal is 1.0.
            // If handDistance > 0.5 (far apart), scale up. If < 0.2, scale down.
            let targetScale = 1.0;
            if (STATE.handsDetected) {
                targetScale = 0.5 + (STATE.handDistance * 2.0); // Map 0..1 to 0.5..2.5
            }
            
            // 2. Explosion/Scatter: Based on Hand Openness.
            // If hands are open (1.0), particles are loose. If fists (0.0), particles are tight.
            let chaosFactor = 0.05; // Base noise
            if (STATE.handsDetected) {
                // High openness = High chaos (Explode)
                // Low openness = Tight formation
                chaosFactor = STATE.handOpenness * 0.5; 
            }
            
            // Update Particles
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                // 1. Get Target Position
                let tx = targets[ix];
                let ty = targets[iy];
                let tz = targets[iz];

                // 2. Apply Interaction Scale
                tx *= targetScale;
                ty *= targetScale;
                tz *= targetScale;

                // 3. Apply Noise/Chaos (Respiration effect + Hand Openness)
                const noise = Math.sin(STATE.time + randoms[i] * 10) * chaosFactor;
                tx += tx * noise;
                ty += ty * noise;
                tz += tz * noise;

                // 4. Lerp Current to Target
                positionsArr[ix] += (tx - positionsArr[ix]) * CONFIG.lerpSpeed;
                positionsArr[iy] += (ty - positionsArr[iy]) * CONFIG.lerpSpeed;
                positionsArr[iz] += (tz - positionsArr[iz]) * CONFIG.lerpSpeed;
            }

            positionsAttr.needsUpdate = true;
            
            // Rotate the whole system slowly
            particles.rotation.y += 0.002;
            // Also rotate based on hands? optional.

            renderer.render(scene, camera);
        }

        animate();

        // --- 6. MEDIAPIPE HANDS SETUP ---
        
        const videoElement = document.getElementById('video-input');
        const statusText = document.getElementById('status-text');
        const loadingOverlay = document.getElementById('loading-overlay');

        function onResults(results) {
            loadingOverlay.style.display = 'none';

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                STATE.handsDetected = true;
                statusText.innerText = "● Hands Detected";
                statusText.className = "text-green-500 animate-pulse";

                const landmarks1 = results.multiHandLandmarks[0];
                const landmarks2 = results.multiHandLandmarks.length > 1 ? results.multiHandLandmarks[1] : null;

                // 1. Calculate Hand Openness (0.0 to 1.0)
                // Measure distance from wrist(0) to index_tip(8)
                // Need to normalize somewhat. A closed fist has index tip close to wrist.
                // An open hand has index tip far from wrist.
                
                let openness1 = getHandOpenness(landmarks1);
                let openness2 = landmarks2 ? getHandOpenness(landmarks2) : openness1;
                
                STATE.handOpenness = (openness1 + openness2) / (landmarks2 ? 2 : 1);

                // 2. Calculate Distance Between Hands (if 2 hands)
                if (landmarks2) {
                    // Use wrist positions (index 0)
                    const dx = landmarks1[0].x - landmarks2[0].x;
                    const dy = landmarks1[0].y - landmarks2[0].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    STATE.handDistance = dist; // Roughly 0.1 (touching) to 0.8 (screen width apart)
                } else {
                    // Default if one hand
                    STATE.handDistance = 0.3; 
                }

            } else {
                STATE.handsDetected = false;
                statusText.innerText = "● Waiting for hands...";
                statusText.className = "text-yellow-500";
                
                // Reset state slowly
                STATE.handOpenness = STATE.handOpenness * 0.95;
                STATE.handDistance = 0.3;
            }
        }

        function getHandOpenness(landmarks) {
            // Wrist is 0. Middle Finger Tip is 12. MCP is 9.
            // Ratio of (Wrist->Tip) / (Wrist->MCP) is roughly 2.0 for open, 1.0 for closed.
            
            const wrist = landmarks[0];
            const tip = landmarks[12]; // Middle finger tip
            const mcp = landmarks[9];  // Middle finger knuckle

            const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
            const distMcp = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
            
            // Ratio usually 1.8+ for open, ~1.0 or less for closed
            let ratio = distTip / (distMcp || 0.001); 
            
            // Normalize: 1.0 -> 0.0, 2.0 -> 1.0
            let openness = (ratio - 0.8) / 1.2;
            return Math.max(0, Math.min(1, openness));
        }

        const hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);

        const cameraUtils = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: 640,
            height: 480
        });

        cameraUtils.start();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Initialize Icons
        lucide.createIcons();