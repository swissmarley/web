let scene, camera, renderer, earth, clouds, atmosphere, directionalLight, nightLightsGlow;
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        function init() {
            // Scene setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 3;

            renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true 
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            document.body.appendChild(renderer.domElement);

            // Texture Loader
            const textureLoader = new THREE.TextureLoader();
            const earthTexture = textureLoader.load('assets/8081_earthmap4k.jpg');
            const bumpTexture = textureLoader.load('assets/8081_earthbump4k.jpg');
            const nightLightsTexture = textureLoader.load('assets/8081_earthlights4k.jpg');
            const cloudsTexture = textureLoader.load('assets/8k_earth_clouds.jpg');

            // Create Earth
            const earthGeometry = new THREE.SphereGeometry(1, 128, 128);
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: earthTexture,
                bumpMap: bumpTexture,
                bumpScale: 0.05,
                specular: new THREE.Color('grey'),
                shininess: 15,
                emissive: new THREE.Color(0x444444),
                emissiveMap: nightLightsTexture
            });
            earth = new THREE.Mesh(earthGeometry, earthMaterial);
            scene.add(earth);

            // Create Clouds
            const cloudsGeometry = new THREE.SphereGeometry(1.01, 128, 128);
            const cloudsMaterial = new THREE.MeshPhongMaterial({
                map: cloudsTexture,
                transparent: true,
                opacity: 0.8,
                depthWrite: false
            });
            clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
            scene.add(clouds);

            // Atmospheric Glow Effect
            const atmosphereGeometry = new THREE.SphereGeometry(1.1, 64, 64);
            const atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vertexNormal;
                    void main() {
                        vertexNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vertexNormal;
                    void main() {
                        float intensity = pow(0.6 - dot(vertexNormal, vec3(0, 0, 1.0)), 3.0);
                        gl_FragColor = vec4(0.1, 0.4, 1.0, 0.5) * intensity;
                    }
                `,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            scene.add(atmosphere);

            // Night Lights Glow Effect
            const nightLightsGlowGeometry = new THREE.SphereGeometry(1.01, 128, 128);
            const nightLightsGlowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: nightLightsTexture }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D texture;
                    varying vec2 vUv;
                    void main() {
                        vec4 texColor = texture2D(texture, vUv);
                        vec3 glow = texColor.rgb * 2.0; // Increase the glow effect
                        gl_FragColor = vec4(glow, texColor.a * 1.0); // Adjust alpha for glow
                    }
                `,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            nightLightsGlow = new THREE.Mesh(nightLightsGlowGeometry, nightLightsGlowMaterial);
            scene.add(nightLightsGlow);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404080, 2.0);
            scene.add(ambientLight);

            directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 3, 5);
            scene.add(directionalLight);

            setupMouseInteraction();

            setupButtonControls();

            animate();

            window.addEventListener('resize', onWindowResize);
        }

        function setupMouseInteraction() {
            renderer.domElement.addEventListener('mousedown', onMouseDown);
            renderer.domElement.addEventListener('mousemove', onMouseMove);
            renderer.domElement.addEventListener('mouseup', onMouseUp);
            renderer.domElement.addEventListener('wheel', onMouseWheel);
        }

        function setupButtonControls() {
            document.getElementById('rotateLeftBtn').addEventListener('click', () => {
                earth.rotation.y += 0.2;
                clouds.rotation.y += 0.2;
            });

            document.getElementById('rotateRightBtn').addEventListener('click', () => {
                earth.rotation.y -= 0.2;
                clouds.rotation.y -= 0.2;
            });

            document.getElementById('zoomInBtn').addEventListener('click', () => {
                camera.position.z = Math.max(1.5, camera.position.z - 0.2);
            });

            document.getElementById('zoomOutBtn').addEventListener('click', () => {
                camera.position.z = Math.min(5, camera.position.z + 0.2);
            });
        }

        function onMouseDown(e) {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }

        function onMouseMove(e) {
            if (!isDragging) return;
            
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            earth.rotation.y += deltaMove.x * 0.01;
            earth.rotation.x += deltaMove.y * 0.01;
            clouds.rotation.y += deltaMove.x * 0.01;
            clouds.rotation.x += deltaMove.y * 0.01;

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }

        function onMouseUp() {
            isDragging = false;
        }

        function onMouseWheel(e) {
            camera.position.z = Math.max(1.5, Math.min(5, camera.position.z + e.deltaY * 0.01));
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            earth.rotation.y += 0.001;
            clouds.rotation.y += 0.001;

            const time = Date.now() * 0.0002;
            directionalLight.position.x = Math.sin(time) * 5;
            directionalLight.position.z = Math.cos(time) * 5;

            renderer.render(scene, camera);
        }

        init();