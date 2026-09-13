import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b9e8);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshBasicMaterial({
    color: 0x1565ff
});

const cube = new THREE.Mesh(
    geometry,
    material
);

scene.add(cube);

function animate(time) {

    cube.rotation.x = time * 0.001;
    cube.rotation.y = time * 0.001;

    renderer.render(
        scene,
        camera
    );
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
