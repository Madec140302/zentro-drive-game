import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ========================================
// ZENTRO V.1
// Premier prototype 3D
// ========================================


// SCÈNE
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b9e8);


// CAMÉRA
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 4, 8);


// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

document.body.appendChild(renderer.domElement);


// LUMIÈRE
const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(20, 30, 10);

scene.add(sun);


const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    1.5
);

scene.add(ambient);


// SOL
const groundGeometry = new THREE.PlaneGeometry(
    200,
    200
);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f7d45
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;

scene.add(ground);


// PREMIER OBJET 3D
const geometry = new THREE.BoxGeometry(
    2,
    2,
    2
);

const material = new THREE.MeshStandardMaterial({
    color: 0x1565ff,
    metalness: 0.3,
    roughness: 0.4
});

const cube = new THREE.Mesh(
    geometry,
    material
);

scene.add(cube);


// ANIMATION
function animate(time) {

    cube.rotation.y = time * 0.001;

    renderer.render(
        scene,
        camera
    );
}

renderer.setAnimationLoop(
    animate
);


// REDIMENSIONNEMENT
window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
