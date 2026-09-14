import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// ZENTRO V.2 - VERSION OPTIMISÉE
// PERSONNAGE + VOITURE + CONDUITE
// ZENTRO V.3 — OPEN WORLD
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b9e8);

scene.fog = new THREE.Fog(
    0x87b9e8,
    70,
    180
);
scene.background = new THREE.Color(0x86b8e8);
scene.fog = new THREE.Fog(0x86b8e8, 100, 420);

// =====================================================
// CAMÉRA
// CAMERA
// =====================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    500
    700
);

// =====================================================
// RENDERER OPTIMISÉ
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({
@@ -40,159 +34,227 @@ renderer.setSize(
    window.innerHeight
);

// Pixel ratio fixe = beaucoup moins de pixels à calculer
renderer.setPixelRatio(1);

// Pas d'ombres dynamiques
renderer.shadowMap.enabled = false;

document.body.appendChild(
    renderer.domElement
);
document.body.appendChild(renderer.domElement);

// =====================================================
// LUMIÈRES
// LIGHTS
// =====================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
);

sun.position.set(
    30,
    50,
    20
);

sun.position.set(100, 150, 80);
scene.add(sun);

const ambient =
    new THREE.HemisphereLight(
        0xffffff,
        0x445544,
        1.4
    );
const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x426044,
    1.5
);

scene.add(ambient);

// =====================================================
// SOL
// MATERIALS
// =====================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
        300,
        300
    ),
const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x3f7d45,
        color: 0x3f8145,
        roughness: 1
    })
);
    });

scene.add(ground);
const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x252525,
        roughness: 1
    });

const sidewalkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 1
    });

const whiteMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

const yellowMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xf5d547
    });

// =====================================================
// ROUTE
// SOL
// =====================================================

const road = new THREE.Mesh(
    new THREE.BoxGeometry(
        14,
        0.18,
        180
    ),
    new THREE.MeshStandardMaterial({
        color: 0x242424,
        roughness: 1
    })
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    grassMaterial
);

road.position.y = 0.08;
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;

scene.add(road);
scene.add(ground);

// =====================================================
// LIGNES ROUTE
// ROUTES
// =====================================================

const lineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

for (
    let z = -85;
    z < 90;
    z += 10
function createRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const line = new THREE.Mesh(
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.22,
            0.035,
            4
            width,
            0.16,
            length
        ),
        lineMaterial
        roadMaterial
    );

    line.position.set(
        0,
        0.19,
    road.position.set(
        x,
        0.05,
        z
    );

    scene.add(line);
    road.rotation.y = rotation;

    scene.add(road);
}

// Grande avenue nord-sud
createRoad(0, 0, 16, 420);

// Avenue est-ouest
createRoad(0, 0, 16, 420, Math.PI / 2);

// Deuxième avenue
createRoad(80, 0, 14, 420);

// Route vers campagne
createRoad(-95, 0, 12, 420);

// Routes secondaires
createRoad(0, 80, 10, 220, Math.PI / 2);
createRoad(0, -80, 10, 220, Math.PI / 2);
createRoad(110, 0, 10, 250, Math.PI / 2);

// =====================================================
// BORDURES
// LIGNES ROUTIÈRES
// =====================================================

const curbMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xaaaaaa
    });
function createRoadLine(
    x,
    z,
    rotation = 0,
    count = 20
) {

const leftCurb = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.35,
        0.25,
        180
    ),
    curbMaterial
);
    for (let i = -count; i <= count; i++) {

leftCurb.position.set(
    -7.2,
    0.12,
    0
);
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.22,
                0.025,
                4
            ),
            whiteMaterial
        );

scene.add(leftCurb);
        if (rotation === 0) {

const rightCurb = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.35,
        0.25,
        180
    ),
    curbMaterial
);
            line.position.set(
                x,
                0.15,
                z + i * 10
            );

rightCurb.position.set(
    7.2,
    0.12,
    0
);
        } else {

            line.position.set(
                x + i * 10,
                0.15,
                z
            );

            line.rotation.y =
                Math.PI / 2;
        }

        scene.add(line);
    }
}

createRoadLine(0, 0);
createRoadLine(0, 0, Math.PI / 2);

// =====================================================
// TROTTOIRS
// =====================================================

function createSidewalk(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            0.22,
            length
        ),
        sidewalkMaterial
    );

    sidewalk.position.set(
        x,
        0.11,
        z
    );

    sidewalk.rotation.y =
        rotation;

    scene.add(sidewalk);
}

// autour de la grande avenue
createSidewalk(-9, 0, 2, 420);
createSidewalk(9, 0, 2, 420);

scene.add(rightCurb);
createSidewalk(0, -9, 2, 420, Math.PI / 2);
createSidewalk(0, 9, 2, 420, Math.PI / 2);

// =====================================================
// BÂTIMENTS
// =====================================================

const buildingColors = [
    0x737373,
    0x8b8b8b,
    0x666666,
    0x969696,
    0x5e6970
];

function createBuilding(
    x,
    z,
@@ -202,18 +264,17 @@ function createBuilding(
    color
) {

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 1
            })
        );
    const building = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        new THREE.MeshStandardMaterial({
            color,
            roughness: 0.9
        })
    );

    building.position.set(
        x,
@@ -222,62 +283,407 @@ function createBuilding(
    );

    scene.add(building);

    // toit
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            width * 1.03,
            0.15,
            depth * 1.03
        ),
        new THREE.MeshStandardMaterial({
            color: 0x303030
        })
    );

    roof.position.set(
        x,
        height + 0.08,
        z
    );

    scene.add(roof);
}

createBuilding(
    -17,
    -20,
    10,
    14,
    12,
    0x777777
);
// quartier gauche
createBuilding(-25, -25, 15, 18, 15, buildingColors[0]);
createBuilding(-45, -25, 15, 25, 15, buildingColors[1]);
createBuilding(-25, -50, 18, 13, 15, buildingColors[2]);
createBuilding(-48, -52, 15, 20, 15, buildingColors[3]);

createBuilding(
    -18,
    10,
    10,
    9,
    12,
    0x8b8b8b
);
// quartier droit
createBuilding(25, 25, 16, 22, 16, buildingColors[1]);
createBuilding(48, 25, 15, 17, 15, buildingColors[2]);
createBuilding(25, 50, 18, 28, 15, buildingColors[0]);
createBuilding(50, 52, 15, 20, 15, buildingColors[4]);

createBuilding(
    18,
    -15,
    10,
    18,
    12,
    0x686868
);
// quartier nord
createBuilding(-35, 90, 16, 15, 16, buildingColors[3]);
createBuilding(35, 90, 18, 24, 18, buildingColors[0]);

createBuilding(
    18,
    18,
    10,
    13,
    12,
    0x777777
);
// quartier sud
createBuilding(-35, -90, 18, 16, 18, buildingColors[2]);
createBuilding(35, -90, 16, 20, 16, buildingColors[1]);

// =====================================================
// MAISONS
// =====================================================

function createHouse(
    x,
    z,
    scale = 1
) {

    const house = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(
            9 * scale,
            4 * scale,
            7 * scale
        ),
        new THREE.MeshStandardMaterial({
            color: 0xc9c0ad
        })
    );

    base.position.y =
        2 * scale;

    house.add(base);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(
            6 * scale,
            3 * scale,
            4
        ),
        new THREE.MeshStandardMaterial({
            color: 0x673d32
        })
    );

    roof.position.y =
        5.5 * scale;

createBuilding(
    -20,
    42,
    12,
    16,
    12,
    0x707070
    roof.rotation.y =
        Math.PI / 4;

    house.add(roof);

    house.position.set(
        x,
        0,
        z
    );

    scene.add(house);
}

createHouse(-115, -40, 1.1);
createHouse(-135, -10, 0.9);
createHouse(-110, 35, 1);
createHouse(-140, 70, 1.15);

createHouse(135, -45, 1);
createHouse(145, 10, 0.9);
createHouse(135, 55, 1.2);

// =====================================================
// ARBRES OPTIMISÉS
// =====================================================

const treeCount = 250;

const trunkGeometry =
    new THREE.CylinderGeometry(
        0.22,
        0.32,
        2.2,
        6
    );

const trunkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x70452d
    });

const trunks = new THREE.InstancedMesh(
    trunkGeometry,
    trunkMaterial,
    treeCount
);

createBuilding(
    20,
    48,
    12,
    20,
    12,
    0x626262
const crownGeometry =
    new THREE.ConeGeometry(
        1.8,
        4.2,
        7
    );

const crownMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x236b32
    });

const crowns = new THREE.InstancedMesh(
    crownGeometry,
    crownMaterial,
    treeCount
);

const dummy =
    new THREE.Object3D();

let treeIndex = 0;

function addTree(
    x,
    z,
    scale
) {

    if (treeIndex >= treeCount)
        return;

    dummy.position.set(
        x,
        1.1 * scale,
        z
    );

    dummy.scale.set(
        scale,
        scale,
        scale
    );

    dummy.rotation.y =
        Math.random() * Math.PI;

    dummy.updateMatrix();

    trunks.setMatrixAt(
        treeIndex,
        dummy.matrix
    );

    dummy.position.y =
        3.6 * scale;

    dummy.updateMatrix();

    crowns.setMatrixAt(
        treeIndex,
        dummy.matrix
    );

    treeIndex++;
}

// campagne gauche
for (
    let i = 0;
    i < 130;
    i++
) {

    const x =
        -170 +
        Math.random() * 100;

    const z =
        -170 +
        Math.random() * 340;

    addTree(
        x,
        z,
        0.8 +
        Math.random() * 0.7
    );
}

// campagne droite
for (
    let i = 0;
    i < 120;
    i++
) {

    const x =
        170 +
        Math.random() * 70;

    const z =
        -170 +
        Math.random() * 340;

    addTree(
        x,
        z,
        0.8 +
        Math.random() * 0.7
    );
}

trunks.instanceMatrix.needsUpdate = true;
crowns.instanceMatrix.needsUpdate = true;

scene.add(trunks);
scene.add(crowns);

// =====================================================
// CHAMPS
// =====================================================

function createField(
    x,
    z,
    width,
    depth
) {

    const field = new THREE.Mesh(
        new THREE.PlaneGeometry(
            width,
            depth
        ),
        new THREE.MeshStandardMaterial({
            color: 0x6e9942,
            roughness: 1
        })
    );

    field.rotation.x =
        -Math.PI / 2;

    field.position.set(
        x,
        0.01,
        z
    );

    scene.add(field);
}

createField(-160, -100, 80, 100);
createField(-160, 100, 80, 100);
createField(170, -100, 60, 100);
createField(170, 100, 60, 100);

// =====================================================
// FEUX DE CIRCULATION
// =====================================================

function createTrafficLight(
    x,
    z
) {

    const group =
        new THREE.Group();

    const pole = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.18,
            5,
            0.18
        ),
        new THREE.MeshStandardMaterial({
            color: 0x222222
        })
    );

    pole.position.y = 2.5;
    group.add(pole);

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.65,
            1.8,
            0.45
        ),
        new THREE.MeshStandardMaterial({
            color: 0x171717
        })
    );

    box.position.y = 4.5;
    group.add(box);

    const red = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.16,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff2020
        })
    );

    red.position.set(
        0,
        4.95,
        0.24
    );

    group.add(red);

    const orange = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.16,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xffa500
        })
    );

    orange.position.set(
        0,
        4.5,
        0.24
    );

    group.add(orange);

    const green = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.16,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0x20dd50
        })
    );

    green.position.set(
        0,
        4.05,
        0.24
    );

    group.add(green);

    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);
}

createTrafficLight(-9, -9);
createTrafficLight(9, -9);
createTrafficLight(-9, 9);
createTrafficLight(9, 9);

// =====================================================
// PERSONNAGE
// =====================================================
@@ -297,7 +703,6 @@ const body = new THREE.Mesh(
);

body.position.y = 1;

player.add(body);

const head = new THREE.Mesh(
@@ -312,7 +717,6 @@ const head = new THREE.Mesh(
);

head.position.y = 1.95;

player.add(head);

const legMaterial =
@@ -408,12 +812,7 @@ scene.add(player);
const car =
    new THREE.Group();

car.name =
    "ZentroCar";

// =====================================================
// CARROSSERIE
// =====================================================
car.name = "ZentroCar";

const carBodyMaterial =
    new THREE.MeshStandardMaterial({
@@ -432,13 +831,9 @@ const carBody = new THREE.Mesh(
);

carBody.position.y = 0.85;

car.add(carBody);

// =====================================================
// CAPOT
// =====================================================

// capot
const hood = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.9,
@@ -456,26 +851,19 @@ hood.position.set(

car.add(hood);

// =====================================================
// CABINE
// =====================================================

const cabinMaterial =
// cabine
const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.55,
        0.85,
        2.65
    ),
    new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.3,
        roughness: 0.25
    });

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.55,
            0.85,
            2.65
        ),
        cabinMaterial
    );
    })
);

cabin.position.set(
    0,
@@ -485,108 +873,49 @@ cabin.position.set(

car.add(cabin);

// =====================================================
// VITRES
// =====================================================

// vitres
const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101b29,
        metalness: 0.1,
        roughness: 0.15,
        transparent: true,
        opacity: 0.85
        roughness: 0.15
    });

const windshield =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.15,
            0.55,
            0.08
        ),
        glassMaterial
    );
const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.15,
        0.55,
        0.08
    ),
    glassMaterial
);

windshield.position.set(
    0,
    1.68,
    1.05
);

windshield.rotation.x =
    -0.2;

windshield.rotation.x = -0.2;
car.add(windshield);

const rearWindow =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.15,
            0.55,
            0.08
        ),
        glassMaterial
    );
const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.15,
        0.55,
        0.08
    ),
    glassMaterial
);

rearWindow.position.set(
    0,
    1.68,
    -1.55
);

rearWindow.rotation.x =
    0.2;

rearWindow.rotation.x = 0.2;
car.add(rearWindow);

// =====================================================
// VITRES LATÉRALES
// =====================================================

const sideWindowMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101923,
        metalness: 0.2,
        roughness: 0.2
    });

const leftWindow =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.06,
            0.52,
            1.7
        ),
        sideWindowMaterial
    );

leftWindow.position.set(
    -1.29,
    1.67,
    -0.2
);

car.add(leftWindow);

const rightWindow =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.06,
            0.52,
            1.7
        ),
        sideWindowMaterial
    );

rightWindow.position.set(
    1.29,
    1.67,
    -0.2
);

car.add(rightWindow);

// =====================================================
// ROUES
// =====================================================
@@ -601,8 +930,7 @@ const wheelGeometry =

const tireMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 1
        color: 0x101010
    });

const rimMaterial =
@@ -612,10 +940,7 @@ const rimMaterial =
        roughness: 0.2
    });

function createWheel(
    x,
    z
) {
function createWheel(x, z) {

    const steering =
        new THREE.Group();
@@ -633,27 +958,25 @@ function createWheel(

    steering.add(wheel);

    const tire =
        new THREE.Mesh(
            wheelGeometry,
            tireMaterial
        );
    const tire = new THREE.Mesh(
        wheelGeometry,
        tireMaterial
    );

    tire.rotation.z =
        Math.PI / 2;

    wheel.add(tire);

    const rim =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.27,
                0.27,
                0.36,
                12
            ),
            rimMaterial
        );
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.27,
            0.27,
            0.36,
            12
        ),
        rimMaterial
    );

    rim.rotation.z =
        Math.PI / 2;
@@ -667,28 +990,16 @@ function createWheel(
}

const frontLeftWheel =
    createWheel(
        -1.72,
        1.75
    );
    createWheel(-1.72, 1.75);

const frontRightWheel =
    createWheel(
        1.72,
        1.75
    );
    createWheel(1.72, 1.75);

const rearLeftWheel =
    createWheel(
        -1.72,
        -1.75
    );
    createWheel(-1.72, -1.75);

const rearRightWheel =
    createWheel(
        1.72,
        -1.75
    );
    createWheel(1.72, -1.75);

// =====================================================
// PHARES
@@ -703,15 +1014,14 @@ const headlightMaterial =

function createHeadlight(x) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.72,
                0.22,
                0.08
            ),
            headlightMaterial
        );
    const light = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.72,
            0.22,
            0.08
        ),
        headlightMaterial
    );

    light.position.set(
        x,
@@ -729,55 +1039,36 @@ createHeadlight(0.85);
// PHARES RÉELS
// =====================================================

const leftHeadLight =
    new THREE.SpotLight(
        0xffffff,
        2.5,
        25,
        Math.PI / 7,
        0.5,
        1
    );

leftHeadLight.position.set(
    -0.85,
    1.1,
    2.75
);

leftHeadLight.target.position.set(
    -0.85,
    0,
    15
);
function createSpotLight(x) {

car.add(leftHeadLight);
car.add(leftHeadLight.target);
    const light =
        new THREE.SpotLight(
            0xffffff,
            2.5,
            25,
            Math.PI / 7,
            0.5,
            1
        );

const rightHeadLight =
    new THREE.SpotLight(
        0xffffff,
        2.5,
        25,
        Math.PI / 7,
        0.5,
        1
    light.position.set(
        x,
        1.1,
        2.75
    );

rightHeadLight.position.set(
    0.85,
    1.1,
    2.75
);
    light.target.position.set(
        x,
        0,
        15
    );

rightHeadLight.target.position.set(
    0.85,
    0,
    15
);
    car.add(light);
    car.add(light.target);
}

car.add(rightHeadLight);
car.add(rightHeadLight.target);
createSpotLight(-0.85);
createSpotLight(0.85);

// =====================================================
// FEUX ARRIÈRE
@@ -792,15 +1083,14 @@ const rearLightMaterial =

function createRearLight(x) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7,
                0.22,
                0.08
            ),
            rearLightMaterial
        );
    const light = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.7,
            0.22,
            0.08
        ),
        rearLightMaterial
    );

    light.position.set(
        x,
@@ -818,24 +1108,19 @@ createRearLight(0.85);
// RÉTROVISEURS
// =====================================================

const mirrorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.3
    });

function createMirror(x) {

    const mirror =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.25,
                0.2,
                0.45
            ),
            mirrorMaterial
        );
    const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.25,
            0.2,
            0.45
        ),
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.5
        })
    );

    mirror.position.set(
        x,
@@ -855,19 +1140,17 @@ createMirror(1.48);

const bumperMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.7
        color: 0x101010
    });

const frontBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.1,
            0.25,
            0.3
        ),
        bumperMaterial
    );
const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.1,
        0.25,
        0.3
    ),
    bumperMaterial
);

frontBumper.position.set(
    0,
@@ -877,15 +1160,14 @@ frontBumper.position.set(

car.add(frontBumper);

const rearBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.1,
            0.25,
            0.3
        ),
        bumperMaterial
    );
const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.1,
        0.25,
        0.3
    ),
    bumperMaterial
);

rearBumper.position.set(
    0,
@@ -899,25 +1181,20 @@ car.add(rearBumper);
// ÉCHAPPEMENTS
// =====================================================

const exhaustMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.7,
        roughness: 0.3
    });

function createExhaust(x) {

    const exhaust =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12,
                0.12,
                0.35,
                12
            ),
            exhaustMaterial
        );
    const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.12,
            0.12,
            0.35,
            12
        ),
        new THREE.MeshStandardMaterial({
            color: 0x555555,
            metalness: 0.7
        })
    );

    exhaust.rotation.x =
        Math.PI / 2;
@@ -938,15 +1215,14 @@ createExhaust(0.65);
// AILERON
// =====================================================

const spoiler =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.5,
            0.12,
            0.3
        ),
        carBodyMaterial
    );
const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.5,
        0.12,
        0.3
    ),
    carBodyMaterial
);

spoiler.position.set(
    0,
@@ -1033,18 +1309,14 @@ let walkTime = 0;
const clock =
    new THREE.Clock();

// =====================================================
// CAMÉRA
// =====================================================

const cameraPosition =
    new THREE.Vector3();

const cameraTarget =
    new THREE.Vector3();

// =====================================================
// ANIMATION PERSONNAGE
// PERSONNAGE
// =====================================================

function animateCharacter(
@@ -1054,19 +1326,13 @@ function animateCharacter(

    if (moving) {

        walkTime +=
            delta * 10;
        walkTime += delta * 10;

        const swing =
            Math.sin(
                walkTime
            ) * 0.65;
            Math.sin(walkTime) * 0.65;

        leftLeg.rotation.x =
            swing;

        rightLeg.rotation.x =
            -swing;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        leftArm.rotation.x =
            -swing * 0.7;
@@ -1118,10 +1384,6 @@ function rotateWheels(amount) {
    rearRightWheel.wheel.rotation.x += amount;
}

// =====================================================
// DIRECTION DES ROUES
// =====================================================

function steerWheels(steering) {

    const maxAngle =
@@ -1146,7 +1408,7 @@ function steerWheels(steering) {
}

// =====================================================
// ENTRER DANS LA VOITURE
// ENTRÉE / SORTIE
// =====================================================

function tryEnterCar() {
@@ -1162,21 +1424,14 @@ function tryEnterCar() {
    ) {

        driving = true;

        player.visible = false;

        carSpeed = 0;
    }
}

// =====================================================
// SORTIR
// =====================================================

function exitCar() {

    driving = false;

    player.visible = true;

    const exitOffset =
@@ -1206,7 +1461,6 @@ function exitCar() {

function driveCar(delta) {

    // ACCÉLÉRATION
    if (
        keys["z"] ||
        keys["w"] ||
@@ -1215,10 +1469,8 @@ function driveCar(delta) {

        carSpeed +=
            carAcceleration * delta;
    }

    // FREIN / MARCHE ARRIÈRE
    else if (
    } else if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
@@ -1237,26 +1489,21 @@ function driveCar(delta) {
                0.7 *
                delta;
        }
    }

    // FRICTION
    else {
    } else {

        if (carSpeed > 0) {

            carSpeed -=
                carFriction * delta;

        } else if (
            carSpeed < 0
        ) {
        } else if (carSpeed < 0) {

            carSpeed +=
                carFriction * delta;
        }
    }

    // LIMITES
    carSpeed =
        THREE.MathUtils.clamp(
            carSpeed,
@@ -1276,23 +1523,20 @@ function driveCar(delta) {
        carSpeed = 0;
    }

    // DIRECTION
    let steering = 0;

    if (
        keys["q"] ||
        keys["a"] ||
        keys["arrowleft"]
    ) {

        steering = 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        steering = -1;
    }

@@ -1319,16 +1563,12 @@ function driveCar(delta) {
            );
    }

    steerWheels(
        steering
    );
    steerWheels(steering);

    // DÉPLACEMENT
    car.translateZ(
        carSpeed * delta
    );

    // ROTATION DES ROUES
    rotateWheels(
        carSpeed *
        delta *
@@ -1337,7 +1577,7 @@ function driveCar(delta) {
}

// =====================================================
// CAMÉRA PERSONNAGE
// CAMERA
// =====================================================

function updatePlayerCamera() {
@@ -1369,10 +1609,6 @@ function updatePlayerCamera() {
    );
}

// =====================================================
// CAMÉRA VOITURE
// =====================================================

function updateCarCamera() {

    const offset =
@@ -1390,11 +1626,6 @@ function updateCarCamera() {
        .copy(car.position)
        .add(offset);

    camera.position.lerp(
        cameraPosition,
        0.10
    );

    cameraTarget.set(
        car.position.x,
        car.position.y + 1.1,
@@ -1403,7 +1634,7 @@ function updateCarCamera() {
}

// =====================================================
// BOUCLE PRINCIPALE
// BOUCLE
// =====================================================

function animate() {
@@ -1414,10 +1645,7 @@ function animate() {
            0.05
        );

    // =================================================
    // E = ENTRER / SORTIR
    // =================================================

    // E
    if (
        keys["e"] &&
        !keys["_ePressed"]
@@ -1426,24 +1654,17 @@ function animate() {
        keys["_ePressed"] = true;

        if (driving) {

            exitCar();

        } else {

            tryEnterCar();
        }
    }

    if (!keys["e"]) {

        keys["_ePressed"] = false;
    }

    // =================================================
    // PERSONNAGE
    // =================================================

    if (!driving) {

        if (
@@ -1453,8 +1674,7 @@ function animate() {
        ) {

            player.rotation.y -=
                playerTurnSpeed *
                delta;
                playerTurnSpeed * delta;
        }

        if (
@@ -1463,8 +1683,7 @@ function animate() {
        ) {

            player.rotation.y +=
                playerTurnSpeed *
                delta;
                playerTurnSpeed * delta;
        }

        let moving = false;
@@ -1476,8 +1695,7 @@ function animate() {
        ) {

            player.translateZ(
                playerSpeed *
                delta
                playerSpeed * delta
            );

            moving = true;
@@ -1489,8 +1707,7 @@ function animate() {
        ) {

            player.translateZ(
                -playerSpeed *
                delta
                -playerSpeed * delta
            );

            moving = true;
@@ -1502,22 +1719,14 @@ function animate() {
        );

        updatePlayerCamera();
    }

    // =================================================
    // VOITURE
    // =================================================

    else {
    } else {

        driveCar(delta);

        updateCarCamera();
    }

    camera.lookAt(
        cameraTarget
    );
    camera.lookAt(cameraTarget);

    renderer.render(
        scene,
@@ -1526,7 +1735,7 @@ function animate() {
}

// =====================================================
// REDIMENSIONNEMENT
// RESIZE
// =====================================================

window.addEventListener(
@@ -1547,7 +1756,7 @@ window.addEventListener(
);

// =====================================================
// DÉMARRAGE
// START
// =====================================================

renderer.setAnimationLoop(
