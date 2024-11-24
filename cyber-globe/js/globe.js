class Globe {
    constructor(container) {
        this.container = container;
        this.mouseX = 0;
        this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.GLOBE_RADIUS = 200;
        this.pointColors = [
            new THREE.Color('#4CC3FF'),
            new THREE.Color('#4CC3FF'),
            new THREE.Color('#6773E7'),
            new THREE.Color('#38B8F2')
        ];
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 500;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const loader = new THREE.TextureLoader();
        loader.load('assets/8081_earthlights4k.jpg', (texture) => {
            this.createGlobe(texture);
            this.createHalo();
            this.createDots();
            this.routeManager = new RouteManager(this.scene);
        });

        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.animate();
    }

    createGlobe(texture) {
        const geometry = new THREE.SphereGeometry(this.GLOBE_RADIUS, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            color: 0x632de9,
            transparent: true,
            opacity: 0.95,
            shininess: 0.3
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(5, 2, 5);
        this.scene.add(light);

        const ambient = new THREE.AmbientLight(0x999999);
        this.scene.add(ambient);
    }

    createHalo() {
        const geometry = new THREE.SphereGeometry(this.GLOBE_RADIUS + 15, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader: Shaders.halo.vertex,
            fragmentShader: Shaders.halo.fragment,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const halo = new THREE.Mesh(geometry, material);
        halo.scale.multiplyScalar(1.2);
        halo.rotateX(Math.PI * 0.03);
        halo.rotateY(Math.PI * 0.03);
        this.scene.add(halo);
    }

    createDots() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        const numDots = 500;

        for (let i = 0; i < numDots; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.acos((Math.random() * 2) - 1);
            
            const x = this.GLOBE_RADIUS * Math.sin(theta) * Math.cos(phi);
            const y = this.GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
            const z = this.GLOBE_RADIUS * Math.cos(theta);

            positions.push(x, y, z);

            const colorIndex = Math.floor(Math.random() * this.pointColors.length);
            const color = this.pointColors[colorIndex];
            colors.push(color.r, color.g, color.b);

            sizes.push(Math.random() * 1 + 1);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: false,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    }

    addRoutes() {
        pullRequestData.routes.forEach(route => {
            this.routeManager.addRoute(route);
        });

        setInterval(() => {
            const randomRoute = pullRequestData.routes[
                Math.floor(Math.random() * pullRequestData.routes.length)
            ];
            this.routeManager.addRoute({...randomRoute});
        }, 500);
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX) * 0.05;
        this.mouseY = (event.clientY - this.windowHalfY) * 0.05;
    }

    onWindowResize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        if (this.globe) {
            this.globe.rotation.y += 0.001;
        }
        if (this.points) {
            this.points.rotation.y += 0.001;
        }

        if (this.routeManager) {
            this.routeManager.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}