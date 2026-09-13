import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// ZENTRO V.1
// ÉTAPE 2A — MONDE + PERSONNAGE
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b9e8);


// =====================================================
// CAMÉRA
// =====================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 4, 8);


// =====================================================
// RENDERER
// =====================================================

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


// =====================================================
// LUMIÈRES
// =====================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(30, 50, 20);

scene.add(sun);

const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    1.5
);

scene.add(ambient);


// =====================================================
// SOL
// =====================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
        color: 0x3f7d45
    })
);

ground.rotation.x = -Math.PI / 2;

scene.add(ground);


// =====================================================
// ROUTE
// =====================================================

const road = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.15, 100),
    new THREE.MeshStandardMaterial({
        color: 0x292929
    })
);

road.position.y = 0.08;

scene.add(road);


// =====================================================
// LIGNES DE ROUTE
// =====================================================

const lineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

for (let z = -45; z < 50; z += 10) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.25,
            0.03,
            4
        ),
        lineMaterial
    );

    line.position.set(
        0,
        0.18,
        z
    );

    scene.add(line);
}


// =====================================================
// BÂTIMENTS
// =====================================================

function createBuilding(
    x,
    z,
    width,
    height,
    depth,
    color
) {

    const building = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        new THREE.MeshStandardMaterial({
            color: color
        })
    );

    building.position.set(
        x,
        height / 2,
        z
    );

    scene.add(building);
}


// gauche
createBuilding(
    -15,
    -15,
    8,
    12,
    10,
    0x777777
);

createBuilding(
    -15,
    10,
    8,
    8,
    10,
    0x888888
);


// droite
createBuilding(
    15,
    -5,
    8,
    18,
    10,
    0x666666
);

createBuilding(
    15,
    25,
    8,
    14,
    10,
    0x777777
);


// =====================================================
// PERSONNAGE PROVISOIRE
// =====================================================

const player = new THREE.Group();


// CORPS
const body = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.8,
        1.4,
        0.45
    ),
    new THREE.MeshStandardMaterial({
        color: 0x1565ff
    })
);

body.position.y = 1;

player.add(body);


// TÊTE
const head = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.32,
        20,
        20
    ),
    new THREE.MeshStandardMaterial({
        color: 0xffc49b
    })
);

head.position.y = 1.95;

player.add(head);


// JAMBES
const legMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x222222
    });

const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.28,
        0.75,
        0.35
    ),
    legMaterial
);

leftLeg.position.set(
    -0.2,
    0.35,
    0
);

player.add(leftLeg);


const rightLeg = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.28,
        0.75,
        0.35
    ),
    legMaterial
);

rightLeg.position.set(
    0.2,
    0.35,
    0
);

player.add(rightLeg);


// BRAS
const armMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1565ff
    });

const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.25,
        1.1,
        0.25
    ),
    armMaterial
);

leftArm.position.set(
    -0.58,
    1,
    0
);

player.add(leftArm);


const rightArm = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.25,
        1.1,
        0.25
    ),
    armMaterial
);

rightArm.position.set(
    0.58,
    1,
    0
);

player.add(rightArm);


// POSITION
player.position.set(
    0,
    0,
    20
);

scene.add(player);


// =====================================================
// CAMÉRA SUR LE PERSONNAGE
// =====================================================

camera.lookAt(
    player.position.x,
    player.position.y + 1,
    player.position.z
);


// =====================================================
// REDIMENSIONNEMENT
// =====================================================

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


// =====================================================
// BOUCLE
// =====================================================

function animate() {

    renderer.render(
        scene,
        camera
    );
}

renderer.setAnimationLoop(
    animate
);
