import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// ZENTRO V.3 — OPEN WORLD
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x86b8e8);
scene.fog = new THREE.Fog(0x86b8e8, 100, 420);

// =====================================================
// CAMERA
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

document.body.appendChild(renderer.domElement);

// =====================================================
// LIGHTS
// =====================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
);

sun.position.set(100, 150, 80);
scene.add(sun);

const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x426044,
    1.5
);

scene.add(ambient);

// =====================================================
// MATERIALS
// =====================================================

const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x3f8145,
        roughness: 1
    });

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
// SOL
// =====================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
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
// LIGNES ROUTIÈRES
// =====================================================

function createRoadLine(
    x,
    z,
    rotation = 0,
    count = 20
) {

    for (let i = -count; i <= count; i++) {

        const line = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.22,
                0.025,
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
            color,
            roughness: 0.9
        })
    );

    building.position.set(
        x,
        height / 2,
        z
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

// quartier gauche
createBuilding(-25, -25, 15, 18, 15, buildingColors[0]);
createBuilding(-45, -25, 15, 25, 15, buildingColors[1]);
createBuilding(-25, -50, 18, 13, 15, buildingColors[2]);
createBuilding(-48, -52, 15, 20, 15, buildingColors[3]);

// quartier droit
createBuilding(25, 25, 16, 22, 16, buildingColors[1]);
createBuilding(48, 25, 15, 17, 15, buildingColors[2]);
createBuilding(25, 50, 18, 28, 15, buildingColors[0]);
createBuilding(50, 52, 15, 20, 15, buildingColors[4]);

// quartier nord
createBuilding(-35, 90, 16, 15, 16, buildingColors[3]);
createBuilding(35, 90, 18, 24, 18, buildingColors[0]);

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

const player =
    new THREE.Group();

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

const head = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.32,
        12,
        12
    ),
    new THREE.MeshStandardMaterial({
        color: 0xffc49b
    })
);

head.position.y = 1.95;
player.add(head);

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

player.position.set(
    0,
    0,
    20
);

scene.add(player);

// =====================================================
// VOITURE
// =====================================================

const car =
    new THREE.Group();

car.name = "ZentroCar";

const carBodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1565ff,
        metalness: 0.5,
        roughness: 0.3
    });

const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.25,
        0.7,
        5.5
    ),
    carBodyMaterial
);

carBody.position.y = 0.85;
car.add(carBody);

// capot
const hood = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.9,
        0.25,
        1.6
    ),
    carBodyMaterial
);

hood.position.set(
    0,
    1.25,
    1.75
);

car.add(hood);

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
    })
);

cabin.position.set(
    0,
    1.65,
    -0.25
);

car.add(cabin);

// vitres
const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101b29,
        roughness: 0.15
    });

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

windshield.rotation.x = -0.2;
car.add(windshield);

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

rearWindow.rotation.x = 0.2;
car.add(rearWindow);

// =====================================================
// ROUES
// =====================================================

const wheelGeometry =
    new THREE.CylinderGeometry(
        0.5,
        0.5,
        0.34,
        16
    );

const tireMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010
    });

const rimMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xbfc7d1,
        metalness: 0.8,
        roughness: 0.2
    });

function createWheel(x, z) {

    const steering =
        new THREE.Group();

    steering.position.set(
        x,
        0.55,
        z
    );

    car.add(steering);

    const wheel =
        new THREE.Group();

    steering.add(wheel);

    const tire = new THREE.Mesh(
        wheelGeometry,
        tireMaterial
    );

    tire.rotation.z =
        Math.PI / 2;

    wheel.add(tire);

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

    wheel.add(rim);

    return {
        steering,
        wheel
    };
}

const frontLeftWheel =
    createWheel(-1.72, 1.75);

const frontRightWheel =
    createWheel(1.72, 1.75);

const rearLeftWheel =
    createWheel(-1.72, -1.75);

const rearRightWheel =
    createWheel(1.72, -1.75);

// =====================================================
// PHARES
// =====================================================

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2
    });

function createHeadlight(x) {

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
        1.12,
        2.78
    );

    car.add(light);
}

createHeadlight(-0.85);
createHeadlight(0.85);

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
    car.add(light.target);
}

createSpotLight(-0.85);
createSpotLight(0.85);

// =====================================================
// FEUX ARRIÈRE
// =====================================================

const rearLightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff1010,
        emissive: 0xff0000,
        emissiveIntensity: 1.5
    });

function createRearLight(x) {

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
        1.05,
        -2.78
    );

    car.add(light);
}

createRearLight(-0.85);
createRearLight(0.85);

// =====================================================
// RÉTROVISEURS
// =====================================================

function createMirror(x) {

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
        1.55,
        0.65
    );

    car.add(mirror);
}

createMirror(-1.48);
createMirror(1.48);

// =====================================================
// PARE-CHOCS
// =====================================================

const bumperMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010
    });

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
    0.55,
    2.72
);

car.add(frontBumper);

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
    0.55,
    -2.72
);

car.add(rearBumper);

// =====================================================
// ÉCHAPPEMENTS
// =====================================================

function createExhaust(x) {

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

    exhaust.position.set(
        x,
        0.55,
        -2.85
    );

    car.add(exhaust);
}

createExhaust(-0.65);
createExhaust(0.65);

// =====================================================
// AILERON
// =====================================================

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
    1.35,
    -2.45
);

car.add(spoiler);

// =====================================================
// POSITION VOITURE
// =====================================================

car.position.set(
    4,
    0,
    10
);

scene.add(car);

// =====================================================
// CONTRÔLES
// =====================================================

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

        if (
            [
                "z",
                "q",
                "s",
                "d",
                "w",
                "a",
                "e",
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright"
            ].includes(key)
        ) {
            event.preventDefault();
        }
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
// PARAMÈTRES
// =====================================================

const playerSpeed = 5;
const playerTurnSpeed = 2.8;

const carAcceleration = 10;
const carMaxSpeed = 20;
const carReverseSpeed = 8;
const carTurnSpeed = 1.9;
const carFriction = 6;

let carSpeed = 0;
let driving = false;
let walkTime = 0;

const clock =
    new THREE.Clock();

const cameraPosition =
    new THREE.Vector3();

const cameraTarget =
    new THREE.Vector3();

// =====================================================
// PERSONNAGE
// =====================================================

function animateCharacter(
    moving,
    delta
) {

    if (moving) {

        walkTime += delta * 10;

        const swing =
            Math.sin(walkTime) * 0.65;

        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        leftArm.rotation.x =
            -swing * 0.7;

        rightArm.rotation.x =
            swing * 0.7;

    } else {

        leftLeg.rotation.x =
            THREE.MathUtils.lerp(
                leftLeg.rotation.x,
                0,
                0.15
            );

        rightLeg.rotation.x =
            THREE.MathUtils.lerp(
                rightLeg.rotation.x,
                0,
                0.15
            );

        leftArm.rotation.x =
            THREE.MathUtils.lerp(
                leftArm.rotation.x,
                0,
                0.15
            );

        rightArm.rotation.x =
            THREE.MathUtils.lerp(
                rightArm.rotation.x,
                0,
                0.15
            );
    }
}

// =====================================================
// ROUES
// =====================================================

function rotateWheels(amount) {

    frontLeftWheel.wheel.rotation.x += amount;
    frontRightWheel.wheel.rotation.x += amount;
    rearLeftWheel.wheel.rotation.x += amount;
    rearRightWheel.wheel.rotation.x += amount;
}

function steerWheels(steering) {

    const maxAngle =
        THREE.MathUtils.degToRad(27);

    const target =
        steering * maxAngle;

    frontLeftWheel.steering.rotation.y =
        THREE.MathUtils.lerp(
            frontLeftWheel.steering.rotation.y,
            target,
            0.15
        );

    frontRightWheel.steering.rotation.y =
        THREE.MathUtils.lerp(
            frontRightWheel.steering.rotation.y,
            target,
            0.15
        );
}

// =====================================================
// ENTRÉE / SORTIE
// =====================================================

function tryEnterCar() {

    const distance =
        player.position.distanceTo(
            car.position
        );

    if (
        !driving &&
        distance < 4
    ) {

        driving = true;
        player.visible = false;
        carSpeed = 0;
    }
}

function exitCar() {

    driving = false;
    player.visible = true;

    const exitOffset =
        new THREE.Vector3(
            -3,
            0,
            0
        );

    exitOffset.applyQuaternion(
        car.quaternion
    );

    player.position
        .copy(car.position)
        .add(exitOffset);

    player.rotation.y =
        car.rotation.y;

    carSpeed = 0;
}

// =====================================================
// CONDUITE
// =====================================================

function driveCar(delta) {

    if (
        keys["z"] ||
        keys["w"] ||
        keys["arrowup"]
    ) {

        carSpeed +=
            carAcceleration * delta;

    } else if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        if (carSpeed > 0) {

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

    } else {

        if (carSpeed > 0) {

            carSpeed -=
                carFriction * delta;

        } else if (carSpeed < 0) {

            carSpeed +=
                carFriction * delta;
        }
    }

    carSpeed =
        THREE.MathUtils.clamp(
            carSpeed,
            -carReverseSpeed,
            carMaxSpeed
        );

    if (
        Math.abs(carSpeed) < 0.05 &&
        !keys["z"] &&
        !keys["w"] &&
        !keys["s"] &&
        !keys["arrowup"] &&
        !keys["arrowdown"]
    ) {

        carSpeed = 0;
    }

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

    const speedFactor =
        Math.min(
            Math.abs(carSpeed) /
            carMaxSpeed,
            1
        );

    if (
        Math.abs(carSpeed) > 0.2
    ) {

        car.rotation.y +=
            steering *
            carTurnSpeed *
            speedFactor *
            delta *
            (
                carSpeed >= 0
                    ? 1
                    : -1
            );
    }

    steerWheels(steering);

    car.translateZ(
        carSpeed * delta
    );

    rotateWheels(
        carSpeed *
        delta *
        1.8
    );
}

// =====================================================
// CAMERA
// =====================================================

function updatePlayerCamera() {

    const offset =
        new THREE.Vector3(
            0,
            3.5,
            -6
        );

    offset.applyQuaternion(
        player.quaternion
    );

    cameraPosition
        .copy(player.position)
        .add(offset);

    camera.position.lerp(
        cameraPosition,
        0.12
    );

    cameraTarget.set(
        player.position.x,
        player.position.y + 1.2,
        player.position.z
    );
}

function updateCarCamera() {

    const offset =
        new THREE.Vector3(
            0,
            3.5,
            -9
        );

    offset.applyQuaternion(
        car.quaternion
    );

    cameraPosition
        .copy(car.position)
        .add(offset);

    cameraTarget.set(
        car.position.x,
        car.position.y + 1.1,
        car.position.z
    );
}

// =====================================================
// BOUCLE
// =====================================================

function animate() {

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    // E
    if (
        keys["e"] &&
        !keys["_ePressed"]
    ) {

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

    // PERSONNAGE
    if (!driving) {

        if (
            keys["q"] ||
            keys["a"] ||
            keys["arrowleft"]
        ) {

            player.rotation.y -=
                playerTurnSpeed * delta;
        }

        if (
            keys["d"] ||
            keys["arrowright"]
        ) {

            player.rotation.y +=
                playerTurnSpeed * delta;
        }

        let moving = false;

        if (
            keys["z"] ||
            keys["w"] ||
            keys["arrowup"]
        ) {

            player.translateZ(
                playerSpeed * delta
            );

            moving = true;
        }

        if (
            keys["s"] ||
            keys["arrowdown"]
        ) {

            player.translateZ(
                -playerSpeed * delta
            );

            moving = true;
        }

        animateCharacter(
            moving,
            delta
        );

        updatePlayerCamera();

    } else {

        driveCar(delta);
        updateCarCamera();
    }

    camera.lookAt(cameraTarget);

    renderer.render(
        scene,
        camera
    );
}

// =====================================================
// RESIZE
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
// START
// =====================================================

renderer.setAnimationLoop(
    animate
);
