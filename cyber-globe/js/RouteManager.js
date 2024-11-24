class RouteManager {
    constructor(scene) {
        this.scene = scene;
        this.routes = new Map();
        this.colors = {
            path: new THREE.Color('#ff69b4'),
            start: new THREE.Color('#00ff00'),
            end: new THREE.Color('#ff0000')
        };
    }

    latLongToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    createCurve(start, end) {
        const startVec = this.latLongToVector3(start.lat, start.lng, 200);
        const endVec = this.latLongToVector3(end.lat, end.lng, 200);
        
        const distance = startVec.distanceTo(endVec);
        const mid = startVec.clone().lerp(endVec, 0.5);
        const midLength = mid.length();
        mid.normalize();
        mid.multiplyScalar(midLength + distance * 0.5);

        const curve = new THREE.QuadraticBezierCurve3(
            startVec,
            mid,
            endVec
        );

        return curve;
    }

    addRoute(routeData) {
        const curve = this.createCurve(routeData.from, routeData.to);
        const geometry = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: this.colors.path,
            transparent: true,
            opacity: 0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.currentOpacity = 1;
        mesh.userData.targetOpacity = 1;
        
        this.scene.add(mesh);
        this.routes.set(mesh.uuid, mesh);
    }

    update() {
        this.routes.forEach((route, uuid) => {
            const delta = (route.userData.targetOpacity - route.userData.currentOpacity) * 0.05;
            route.userData.currentOpacity += delta;
            route.material.opacity = route.userData.currentOpacity;

            if (route.userData.currentOpacity >= route.userData.targetOpacity) {
                route.userData.targetOpacity = 0;
            }

            if (route.userData.currentOpacity < 0.01 && route.userData.targetOpacity === 0) {
                this.scene.remove(route);
                this.routes.delete(uuid);
            }
        });
    }
}