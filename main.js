import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// ZENTRO V.3 — OPEN WORLD
// PERSONNAGE + VOITURE + CONDUITE
// =====================================================


// =====================================================
// SCÈNE
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b9e8);

scene.fog = new THREE.Fog(
    0x87b9e8,
    100,
    420
);


// =====================================================
// CAMÉRA
// =====================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    700
);


// =====================================================
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(1);

renderer.shadowMap.enabled = false;

document.body.appendChild(
    renderer.domElement
);


// =====================================================
// LUMIÈRES
// =====================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
);

sun.position.set(
    100,
    150,
    80
);

scene.add(sun);


const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x426044,
    1.5
);

scene.add(ambient);


// =====================================================
// MATÉRIAUX
// =====================================================

const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x3f8145,
        roughness: 1
    });


const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x242424,
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
// SOL
// =====================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
        600,
        600
    ),
    grassMaterial
);

ground.rotation.x = -Math.PI / 2;

ground.position.y = -0.02;

scene.add(ground);


// =====================================================
// ROUTES
// =====================================================

function createRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const road = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            0.16,
            length
        ),
        roadMaterial
    );

    road.position.set(
        x,
        0.05,
        z
    );

    road.rotation.y = rotation;

    scene.add(road);


    // Ligne centrale

    const count =
        Math.floor(length / 10);

    for (
        let i = -count / 2;
        i < count / 2;
        i++
    ) {

        const line =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.22,
                    0.035,
                    4
                ),
                whiteMaterial
            );

        if (rotation === 0) {

            line.position.set(
                x,
                0.15,
                z + i * 10
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


// Grande avenue nord-sud
createRoad(
    0,
    0,
    16,
    420
);


// Avenue est-ouest
createRoad(
    0,
    0,
    16,
    420,
    Math.PI / 2
);


// Deuxième avenue
createRoad(
    80,
    0,
    14,
    420
);


// Route vers campagne
createRoad(
    -95,
    0,
    12,
    420
);


// Routes secondaires
createRoad(
    0,
    80,
    10,
    220,
    Math.PI / 2
);

createRoad(
    0,
    -80,
    10,
    220,
    Math.PI / 2
);

createRoad(
    110,
    0,
    10,
    250,
    Math.PI / 2
);


// =====================================================
// BORDURES ROUTIÈRES
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

    if (rotation === 0) {

        const leftCurb =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    0.25,
                    180
                ),
                curbMaterial
            );

        leftCurb.position.set(
            x - 7.2,
            0.12,
            z
        );

        scene.add(leftCurb);


        const rightCurb =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    0.25,
                    180
                ),
                curbMaterial
            );

        rightCurb.position.set(
            x + 7.2,
            0.12,
            z
        );

        scene.add(rightCurb);


        for (
            let i = -count;
            i <= count;
            i++
        ) {

            const line =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.22,
                        0.025,
                        4
                    ),
                    whiteMaterial
                );

            line.position.set(
                x,
                0.15,
                z + i * 10
            );

            scene.add(line);
        }

    } else {

        const leftCurb =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    180,
                    0.25,
                    0.35
                ),
                curbMaterial
            );

        leftCurb.position.set(
            x,
            0.12,
            z - 7.2
        );

        scene.add(leftCurb);


        const rightCurb =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    180,
                    0.25,
                    0.35
                ),
                curbMaterial
            );

        rightCurb.position.set(
            x,
            0.12,
            z + 7.2
        );

        scene.add(rightCurb);


        for (
            let i = -count;
            i <= count;
            i++
        ) {

            const line =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        4,
                        0.025,
                        0.22
                    ),
                    whiteMaterial
                );

            line.position.set(
                x + i * 10,
                0.15,
                z
            );

            scene.add(line);
        }
    }
}


createRoadLine(
    0,
    0
);

createRoadLine(
    0,
    0,
    Math.PI / 2
);


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

    const sidewalk =
        new THREE.Mesh(
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


createSidewalk(
    -9,
    0,
    2,
    420
);

createSidewalk(
    9,
    0,
    2,
    420
);

createSidewalk(
    0,
    -9,
    2,
    420,
    Math.PI / 2
);

createSidewalk(
    0,
    9,
    2,
    420,
    Math.PI / 2
);


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
    width,
    height,
    depth,
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
                roughness: 0.9
            })
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    scene.add(building);


    const roof =
        new THREE.Mesh(
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


// Quartier gauche
createBuilding(
    -25,
    -25,
    15,
    18,
    15,
    buildingColors[0]
);

createBuilding(
    -45,
    -25,
    15,
    25,
    15,
    buildingColors[1]
);

createBuilding(
    -25,
    -50,
    18,
    13,
    15,
    buildingColors[2]
);

createBuilding(
    -48,
    -52,
    15,
    20,
    15,
    buildingColors[3]
);


// Quartier droit
createBuilding(
    25,
    25,
    16,
    22,
    16,
    buildingColors[1]
);

createBuilding(
    48,
    25,
    15,
    17,
    15,
    buildingColors[2]
);

createBuilding(
    25,
    50,
    18,
    28,
    15,
    buildingColors[0]
);

createBuilding(
    50,
    52,
    15,
    20,
    15,
    buildingColors[4]
);


// Quartier nord
createBuilding(
    -35,
    90,
    16,
    15,
    16,
    buildingColors[3]
);

createBuilding(
    35,
    90,
    18,
    24,
    18,
    buildingColors[0]
);


// Quartier sud
createBuilding(
    -35,
    -90,
    18,
    16,
    18,
    buildingColors[2]
);

createBuilding(
    35,
    -90,
    16,
    20,
    16,
    buildingColors[1]
);


// =====================================================
// MAISONS
// =====================================================

function createHouse(
    x,
    z,
    scale = 1
) {

    const house =
        new THREE.Group();


    const base =
        new THREE.Mesh(
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


    const roof =
        new THREE.Mesh(
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


createHouse(
    -115,
    -40,
    1.1
);

createHouse(
    -135,
    -10,
    0.9
);

createHouse(
    -110,
    35,
    1
);

createHouse(
    -140,
    70,
    1.15
);

createHouse(
    135,
    -45,
    1
);

createHouse(
    145,
    10,
    0.9
);

createHouse(
    135,
    55,
    1.2
);


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


const trunks =
    new THREE.InstancedMesh(
        trunkGeometry,
        trunkMaterial,
        treeCount
    );


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


const crowns =
    new THREE.InstancedMesh(
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

    if (
        treeIndex >= treeCount
    ) {
        return;
    }


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


// Campagne gauche
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


// Campagne droite
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

    const field =
        new THREE.Mesh(
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


createField(
    -160,
    -100,
    80,
    100
);

createField(
    -160,
    100,
    80,
    100
);

createField(
    170,
    -100,
    60,
    100
);

createField(
    170,
    100,
    60,
    100
);


// =====================================================
// FEUX DE CIRCULATION
// =====================================================

function createTrafficLight(
    x,
    z
) {

    const group =
        new THREE.Group();


    const pole =
        new THREE.Mesh(
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


    const box =
        new THREE.Mesh(
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


    const red =
        new THREE.Mesh(
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


    const orange =
        new THREE.Mesh(
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


    const green =
        new THREE.Mesh(
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


createTrafficLight(
    -9,
    -9
);

createTrafficLight(
    9,
    -9
);

createTrafficLight(
    -9,
    9
);

createTrafficLight(
    9,
    9
);


// =====================================================
// PERSONNAGE
// =====================================================

const player =
    new THREE.Group();


player.position.set(
    0,
    0,
    20
);


const playerMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x315fbd
    });


const skinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xf0b58c
    });


// Corps
const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.8,
            1.1,
            0.45
        ),
        playerMaterial
    );

body.position.y = 1;

player.add(body);


// Tête
const head =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.32,
            12,
            12
        ),
        skinMaterial
    );

head.position.y = 1.95;

player.add(head);


// Jambes
const legMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x202b45
    });


const leftLeg =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.28,
            0.85,
            0.3
        ),
        legMaterial
    );

leftLeg.position.set(
    -0.22,
    0.35,
    0
);

player.add(leftLeg);


const rightLeg =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.28,
            0.85,
            0.3
        ),
        legMaterial
    );

rightLeg.position.set(
    0.22,
    0.35,
    0
);

player.add(rightLeg);


// Bras
const leftArm =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.22,
            0.85,
            0.22
        ),
        playerMaterial
    );

leftArm.position.set(
    -0.58,
    1.05,
    0
);

player.add(leftArm);


const rightArm =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.22,
            0.85,
            0.22
        ),
        playerMaterial
    );

rightArm.position.set(
    0.58,
    1.05,
    0
);

player.add(rightArm);


scene.add(player);


// =====================================================
// VOITURE
// =====================================================

const car =
    new THREE.Group();

car.name =
    "ZentroCar";

car.position.set(
    4,
    0,
    10
);


// =====================================================
// CARROSSERIE
// =====================================================

const carBodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1769d2,
        metalness: 0.35,
        roughness: 0.25
    });


const carBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.2,
            0.85,
            4.8
        ),
        carBodyMaterial
    );

carBody.position.y =
    0.85;

car.add(carBody);


// =====================================================
// CAPOT
// =====================================================

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.9,
            0.3,
            1.25
        ),
        carBodyMaterial
    );

hood.position.set(
    0,
    1.2,
    1.65
);

car.add(hood);


// =====================================================
// CABINE
// =====================================================

const cabinMaterial =
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

cabin.position.set(
    0,
    1.55,
    -0.2
);

car.add(cabin);


// =====================================================
// VITRE AVANT
// =====================================================

const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101b29,
        metalness: 0.1,
        roughness: 0.15,
        transparent: true,
        opacity: 0.85
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

windshield.position.set(
    0,
    1.68,
    1.05
);

windshield.rotation.x =
    -0.2;

car.add(windshield);


// =====================================================
// VITRE ARRIÈRE
// =====================================================

const rearWindow =
    new THREE.Mesh(
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

const wheelGeometry =
    new THREE.CylinderGeometry(
        0.52,
        0.52,
        0.38,
        16
    );


const tireMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 1
    });


const rimMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
    });


function createWheel(
    x,
    z
) {

    const steering =
        new THREE.Group();

    steering.position.set(
        x,
        0.55,
        z
    );


    const wheel =
        new THREE.Group();


    steering.add(wheel);


    const tire =
        new THREE.Mesh(
            wheelGeometry,
            tireMaterial
        );


    // Axe horizontal
    tire.rotation.z =
        Math.PI / 2;

    wheel.add(tire);


    const rim =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.27,
                0.27,
                0.39,
                12
            ),
            rimMaterial
        );


    rim.rotation.z =
        Math.PI / 2;

    wheel.add(rim);


    car.add(steering);


    return {
        steering,
        wheel
    };
}


const frontLeftWheel =
    createWheel(
        -1.72,
        1.55
    );


const frontRightWheel =
    createWheel(
        1.72,
        1.55
    );


const rearLeftWheel =
    createWheel(
        -1.72,
        -1.55
    );


const rearRightWheel =
    createWheel(
        1.72,
        -1.55
    );


// =====================================================
// PHARES
// =====================================================

const headlightMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffee
    });


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

    light.position.set(
        x,
        1.05,
        2.43
    );

    car.add(light);
}


createHeadlight(
    -0.85
);

createHeadlight(
    0.85
);


// =====================================================
// PHARES RÉELS
// =====================================================

function createSpotLight(x) {

    const light =
        new THREE.SpotLight(
            0xffffff,
            2.5,
            25,
            Math.PI / 7,
            0.5,
            1
        );

    light.position.set(
        x,
        1.1,
        2.75
    );


    light.target.position.set(
        x,
        0,
        15
    );


    car.add(light);

    car.add(
        light.target
    );
}


createSpotLight(
    -0.85
);

createSpotLight(
    0.85
);


// =====================================================
// FEUX ARRIÈRE
// =====================================================

const rearLightMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xff2020
    });


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

    light.position.set(
        x,
        1.05,
        -2.43
    );

    car.add(light);
}


createRearLight(
    -0.85
);

createRearLight(
    0.85
);


// =====================================================
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

    mirror.position.set(
        x,
        1.45,
        0.65
    );

    car.add(mirror);
}


createMirror(
    -1.48
);

createMirror(
    1.48
);


// =====================================================
// PARE-CHOCS
// =====================================================

const bumperMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.7
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

frontBumper.position.set(
    0,
    0.62,
    2.38
);

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

rearBumper.position.set(
    0,
    0.62,
    -2.38
);

car.add(rearBumper);


// =====================================================
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

    exhaust.rotation.x =
        Math.PI / 2;

    exhaust.position.set(
        x,
        0.55,
        -2.58
    );

    car.add(exhaust);
}


createExhaust(
    -0.65
);

createExhaust(
    0.65
);


// =====================================================
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

spoiler.position.set(
    0,
    1.65,
    -2.05
);

car.add(spoiler);


scene.add(car);


// =====================================================
// CONTRÔLES
// =====================================================

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = true;
    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);


// =====================================================
// VARIABLES PERSONNAGE
// =====================================================

const playerSpeed = 7;

const playerTurnSpeed = 2.8;

let walkTime = 0;


// =====================================================
// VARIABLES VOITURE
// =====================================================

let driving = false;

let carSpeed = 0;

const carMaxSpeed = 20;

const carReverseSpeed = 8;

const carAcceleration = 10;

const carFriction = 6;

const carTurnSpeed = 1.9;


// =====================================================
// HORLOGE
// =====================================================

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
// =====================================================

function animateCharacter(
    moving,
    delta
) {

    if (moving) {

        walkTime +=
            delta * 10;

        const swing =
            Math.sin(
                walkTime
            ) * 0.65;


        leftLeg.rotation.x =
            swing;

        rightLeg.rotation.x =
            -swing;


        leftArm.rotation.x =
            -swing * 0.7;

        rightArm.rotation.x =
            swing * 0.7;

    } else {

        leftLeg.rotation.x *=
            0.8;

        rightLeg.rotation.x *=
            0.8;

        leftArm.rotation.x *=
            0.8;

        rightArm.rotation.x *=
            0.8;
    }
}


// =====================================================
// ROTATION DES ROUES
// =====================================================

function rotateWheels(
    amount
) {

    frontLeftWheel.wheel.rotation.x +=
        amount;

    frontRightWheel.wheel.rotation.x +=
        amount;

    rearLeftWheel.wheel.rotation.x +=
        amount;

    rearRightWheel.wheel.rotation.x +=
        amount;
}


// =====================================================
// DIRECTION DES ROUES
// =====================================================

function steerWheels(
    steering
) {

    const maxAngle =
        0.42;

    const angle =
        steering *
        maxAngle;


    frontLeftWheel.steering.rotation.y =
        angle;

    frontRightWheel.steering.rotation.y =
        angle;
}


// =====================================================
// ENTRER DANS LA VOITURE
// =====================================================

function tryEnterCar() {

    const distance =
        player.position.distanceTo(
            car.position
        );


    if (
        distance < 5
    ) {

        driving = true;

        player.visible = false;

        carSpeed = 0;
    }
}


// =====================================================
// SORTIR DE LA VOITURE
// =====================================================

function exitCar() {

    driving = false;

    player.visible = true;


    const exitOffset =
        new THREE.Vector3(
            3,
            0,
            0
        );


    exitOffset.applyQuaternion(
        car.quaternion
    );


    player.position.copy(
        car.position
    );

    player.position.add(
        exitOffset
    );


    player.rotation.y =
        car.rotation.y;
}


// =====================================================
// CONDUITE
// =====================================================

function driveCar(
    delta
) {

    // ACCÉLÉRATION

    if (
        keys["z"] ||
        keys["w"] ||
        keys["arrowup"]
    ) {

        carSpeed +=
            carAcceleration *
            delta;
    }


    // FREIN / MARCHE ARRIÈRE

    else if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        if (
            carSpeed > 0
        ) {

            carSpeed -=
                carAcceleration *
                1.5 *
                delta;

        } else {

            carSpeed -=
                carAcceleration *
                0.7 *
                delta;
        }
    }


    // FRICTION

    else {

        if (
            carSpeed > 0
        ) {

            carSpeed -=
                carFriction *
                delta;

        } else if (
            carSpeed < 0
        ) {

            carSpeed +=
                carFriction *
                delta;
        }
    }


    // Limite vitesse

    carSpeed =
        THREE.MathUtils.clamp(
            carSpeed,
            -carReverseSpeed,
            carMaxSpeed
        );


    // Empêche les petites valeurs
    // de rester bloquées

    if (
        Math.abs(carSpeed) < 0.05
    ) {

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


    steerWheels(
        steering
    );


    // Direction de la voiture

    if (
        Math.abs(carSpeed) > 0.05
    ) {

        const steeringStrength =
            Math.min(
                Math.abs(carSpeed) / carMaxSpeed,
                1
            );


        car.rotation.y +=
            steering *
            carTurnSpeed *
            steeringStrength *
            delta *
            Math.sign(carSpeed);
    }


    // Déplacement

    car.translateZ(
        carSpeed * delta
    );


    // Rotation des roues

    rotateWheels(
        carSpeed *
        delta *
        1.5
    );
}


// =====================================================
// CAMÉRA PERSONNAGE
// =====================================================

function updatePlayerCamera() {

    const offset =
        new THREE.Vector3(
            0,
            5,
            8
        );


    offset.applyQuaternion(
        player.quaternion
    );


    cameraPosition
        .copy(player.position)
        .add(offset);


    camera.position.lerp(
        cameraPosition,
        0.10
    );


    cameraTarget.set(
        player.position.x,
        player.position.y + 1.2,
        player.position.z
    );
}


// =====================================================
// CAMÉRA VOITURE
// =====================================================

function updateCarCamera() {

    const offset =
        new THREE.Vector3(
            0,
            4.5,
            8
        );


    offset.applyQuaternion(
        car.quaternion
    );


    cameraPosition
        .copy(car.position)
        .add(offset);


    camera.position.lerp(
        cameraPosition,
        0.10
    );


    cameraTarget.set(
        car.position.x,
        car.position.y + 1.1,
        car.position.z
    );
}


// =====================================================
// BOUCLE PRINCIPALE
// =====================================================

function animate() {

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    // =================================================
    // E = ENTRER / SORTIR
    // =================================================

    if (
        keys["e"] &&
        !keys["_ePressed"]
    ) {

        keys["_ePressed"] =
            true;


        if (driving) {

            exitCar();

        } else {

            tryEnterCar();
        }
    }


    if (!keys["e"]) {

        keys["_ePressed"] =
            false;
    }


    // =================================================
    // PERSONNAGE
    // =================================================

    if (!driving) {

        let moving = false;


        // Gauche / droite

        if (
            keys["q"] ||
            keys["a"] ||
            keys["arrowleft"]
        ) {

            player.rotation.y -=
                playerTurnSpeed *
                delta;
        }


        if (
            keys["d"] ||
            keys["arrowright"]
        ) {

            player.rotation.y +=
                playerTurnSpeed *
                delta;
        }


        // Avant

        if (
            keys["z"] ||
            keys["w"] ||
            keys["arrowup"]
        ) {

            player.translateZ(
                -playerSpeed *
                delta
            );

            moving = true;
        }


        // Arrière

        if (
            keys["s"] ||
            keys["arrowdown"]
        ) {

            player.translateZ(
                playerSpeed *
                delta
            );

            moving = true;
        }


        animateCharacter(
            moving,
            delta
        );


        updatePlayerCamera();

    } else {

        // =================================================
        // VOITURE
        // =================================================

        driveCar(
            delta
        );

        updateCarCamera();
    }


    // =================================================
    // CAMÉRA
    // =================================================

    camera.lookAt(
        cameraTarget
    );


    // =================================================
    // RENDU
    // =================================================

    renderer.render(
        scene,
        camera
    );
}


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
// DÉMARRAGE
// =====================================================

renderer.setAnimationLoop(
    animate
);
