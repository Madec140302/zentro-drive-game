import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// ZENTRO V.4 — REALISTIC GRAPHICS
// ============================================================


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fb8d8);

scene.fog = new THREE.Fog(
    0x8fb8d8,
    120,
    650
);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(
    0,
    5,
    10
);


// ============================================================
// RENDERER — REALISTIC GRAPHICS
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

// Realistic color management
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Cinematic tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

// Realistic soft shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    3.0
);

sun.position.set(
    100,
    150,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -180;
sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180;
sun.shadow.camera.bottom = -180;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 500;

sun.shadow.bias = -0.0002;

scene.add(sun);


const hemiLight = new THREE.HemisphereLight(
    0xcfe8ff,
    0x6d7d57,
    1.4
);

scene.add(hemiLight);


const ambient = new THREE.AmbientLight(
    0xffffff,
    0.25
);

scene.add(ambient);


// ============================================================
// GROUND
// ============================================================

const groundGeometry =
    new THREE.PlaneGeometry(
        1200,
        1200
    );

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4f7d3f,
        roughness: 0.95,
        metalness: 0
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// ============================================================
// ROAD MATERIAL
// ============================================================

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x292b2e,
        roughness: 0.92,
        metalness: 0.02
    });

const roadLineMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xf4f1df,
        roughness: 0.8
    });


// ============================================================
// ROAD FUNCTION
// ============================================================

function createRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            0.08,
            length
        );

    const road =
        new THREE.Mesh(
            geometry,
            roadMaterial
        );

    road.position.set(
        x,
        0.04,
        z
    );

    road.rotation.y =
        rotation;

    road.receiveShadow = true;

    scene.add(road);


    // Center lines

    const lineGeometry =
        new THREE.BoxGeometry(
            0.12,
            0.09,
            length
        );

    const line =
        new THREE.Mesh(
            lineGeometry,
            roadLineMaterial
        );

    line.position.set(
        x,
        0.10,
        z
    );

    line.rotation.y =
        rotation;

    scene.add(line);
}


// ============================================================
// MAIN ROADS
// ============================================================

createRoad(
    0,
    0,
    16,
    600,
    0
);

createRoad(
    0,
    0,
    16,
    600,
    Math.PI / 2
);

createRoad(
    -90,
    0,
    12,
    500,
    0
);

createRoad(
    90,
    0,
    12,
    500,
    0
);

createRoad(
    0,
    -100,
    12,
    500,
    Math.PI / 2
);

createRoad(
    0,
    100,
    12,
    500,
    Math.PI / 2
);


// ============================================================
// SIDEWALKS
// ============================================================

const sidewalkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.85
    });


function createSidewalk(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            0.16,
            length
        );

    const sidewalk =
        new THREE.Mesh(
            geometry,
            sidewalkMaterial
        );

    sidewalk.position.set(
        x,
        0.08,
        z
    );

    sidewalk.rotation.y =
        rotation;

    sidewalk.receiveShadow = true;

    scene.add(sidewalk);
}


createSidewalk(
    -10,
    0,
    2,
    600
);

createSidewalk(
    10,
    0,
    2,
    600
);

createSidewalk(
    0,
    -10,
    2,
    600,
    Math.PI / 2
);

createSidewalk(
    0,
    10,
    2,
    600,
    Math.PI / 2
);


// ============================================================
// BUILDINGS
// ============================================================

function createBuilding(
    x,
    z,
    width,
    depth,
    height,
    color
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.82,
            metalness: 0
        });

    const building =
        new THREE.Mesh(
            geometry,
            material
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    scene.add(building);


    // Roof

    const roofGeometry =
        new THREE.BoxGeometry(
            width + 0.2,
            0.25,
            depth + 0.2
        );

    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9
        });

    const roof =
        new THREE.Mesh(
            roofGeometry,
            roofMaterial
        );

    roof.position.set(
        x,
        height + 0.12,
        z
    );

    roof.castShadow = true;

    scene.add(roof);
}


createBuilding(
    -45,
    -40,
    24,
    20,
    25,
    0xb9b0a4
);

createBuilding(
    -80,
    -60,
    20,
    25,
    32,
    0x9caaa9
);

createBuilding(
    45,
    -45,
    25,
    22,
    28,
    0xd0b79d
);

createBuilding(
    70,
    -75,
    18,
    25,
    22,
    0xa9b2bd
);

createBuilding(
    -55,
    55,
    25,
    25,
    30,
    0xb7a58e
);

createBuilding(
    55,
    55,
    22,
    25,
    26,
    0xc2c2b8
);


// ============================================================
// HOUSES
// ============================================================

function createHouse(
    x,
    z
) {

    const bodyGeometry =
        new THREE.BoxGeometry(
            14,
            7,
            12
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd6c4a8,
            roughness: 0.85
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.set(
        x,
        3.5,
        z
    );

    body.castShadow = true;
    body.receiveShadow = true;

    scene.add(body);


    const roofGeometry =
        new THREE.ConeGeometry(
            10,
            6,
            4
        );

    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x713f32,
            roughness: 0.9
        });

    const roof =
        new THREE.Mesh(
            roofGeometry,
            roofMaterial
        );

    roof.position.set(
        x,
        10,
        z
    );

    roof.rotation.y =
        Math.PI / 4;

    roof.castShadow = true;

    scene.add(roof);
}


createHouse(
    -130,
    -40
);

createHouse(
    -155,
    -70
);

createHouse(
    135,
    -45
);

createHouse(
    155,
    -80
);

createHouse(
    -130,
    80
);

createHouse(
    140,
    80
);


// ============================================================
// TREES
// ============================================================

const treeCount = 250;

const trunkGeometry =
    new THREE.CylinderGeometry(
        0.35,
        0.55,
        4,
        8
    );

const trunkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x62452d,
        roughness: 0.95
    });


const leavesGeometry =
    new THREE.SphereGeometry(
        2.7,
        8,
        8
    );

const leavesMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x3f7035,
        roughness: 0.9
    });


const trunks =
    new THREE.InstancedMesh(
        trunkGeometry,
        trunkMaterial,
        treeCount
    );

const leaves =
    new THREE.InstancedMesh(
        leavesGeometry,
        leavesMaterial,
        treeCount
    );


trunks.castShadow = true;
trunks.receiveShadow = true;

leaves.castShadow = true;
leaves.receiveShadow = true;


const dummy =
    new THREE.Object3D();


for (
    let i = 0;
    i < treeCount;
    i++
) {

    let x;
    let z;

    do {

        x =
            (Math.random() - 0.5) *
            500;

        z =
            (Math.random() - 0.5) *
            500;

    } while (
        Math.abs(x) < 35 &&
        Math.abs(z) < 35
    );


    const scale =
        0.7 +
        Math.random() * 0.8;


    dummy.position.set(
        x,
        2,
        z
    );

    dummy.scale.set(
        scale,
        scale,
        scale
    );

    dummy.updateMatrix();

    trunks.setMatrixAt(
        i,
        dummy.matrix
    );


    dummy.position.set(
        x,
        5.5 * scale,
        z
    );

    dummy.scale.set(
        scale,
        scale,
        scale
    );

    dummy.updateMatrix();

    leaves.setMatrixAt(
        i,
        dummy.matrix
    );
}


scene.add(trunks);
scene.add(leaves);


// ============================================================
// FIELDS
// ============================================================

function createField(
    x,
    z,
    width,
    depth
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            0.03,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x789447,
            roughness: 1
        });

    const field =
        new THREE.Mesh(
            geometry,
            material
        );

    field.position.set(
        x,
        0.015,
        z
    );

    field.receiveShadow = true;

    scene.add(field);
}


createField(
    -180,
    180,
    180,
    120
);

createField(
    180,
    180,
    180,
    120
);

createField(
    -180,
    -180,
    180,
    120
);

createField(
    180,
    -180,
    180,
    120
);


// ============================================================
// TRAFFIC LIGHTS
// ============================================================

function createTrafficLight(
    x,
    z
) {

    const poleGeometry =
        new THREE.CylinderGeometry(
            0.12,
            0.12,
            5,
            8
        );

    const poleMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.5
        });

    const pole =
        new THREE.Mesh(
            poleGeometry,
            poleMaterial
        );

    pole.position.set(
        x,
        2.5,
        z
    );

    pole.castShadow = true;

    scene.add(pole);


    const boxGeometry =
        new THREE.BoxGeometry(
            0.65,
            1.7,
            0.45
        );

    const boxMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.7
        });

    const box =
        new THREE.Mesh(
            boxGeometry,
            boxMaterial
        );

    box.position.set(
        x,
        4.8,
        z
    );

    box.castShadow = true;

    scene.add(box);


    const colors = [
        0xff2222,
        0xffcc22,
        0x22dd44
    ];

    colors.forEach(
        (color, index) => {

            const lightGeometry =
                new THREE.SphereGeometry(
                    0.16,
                    12,
                    12
                );

            const lightMaterial =
                new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity:
                        index === 2 ? 1.5 : 0.2
                });

            const light =
                new THREE.Mesh(
                    lightGeometry,
                    lightMaterial
                );

            light.position.set(
                x,
                5.25 - index * 0.45,
                z - 0.25
            );

            scene.add(light);
        }
    );
}


createTrafficLight(
    9,
    9
);

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


// ============================================================
// CHARACTER
// ============================================================

const player =
    new THREE.Group();

player.position.set(
    0,
    0,
    20
);

scene.add(player);


// Body

const bodyGeometry =
    new THREE.BoxGeometry(
        0.8,
        1.4,
        0.45
    );

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1769aa,
        roughness: 0.75
    });

const playerBody =
    new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

playerBody.position.y =
    1.5;

playerBody.castShadow = true;

player.add(playerBody);


// Head

const headGeometry =
    new THREE.SphereGeometry(
        0.35,
        20,
        20
    );

const headMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xe0a27c,
        roughness: 0.75
    });

const head =
    new THREE.Mesh(
        headGeometry,
        headMaterial
    );

head.position.y =
    2.5;

head.castShadow = true;

player.add(head);


// Arms

const armGeometry =
    new THREE.BoxGeometry(
        0.22,
        1.15,
        0.22
    );

const armMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1769aa,
        roughness: 0.75
    });


const leftArm =
    new THREE.Mesh(
        armGeometry,
        armMaterial
    );

leftArm.position.set(
    -0.58,
    1.55,
    0
);

leftArm.castShadow = true;

player.add(leftArm);


const rightArm =
    new THREE.Mesh(
        armGeometry,
        armMaterial
    );

rightArm.position.set(
    0.58,
    1.55,
    0
);

rightArm.castShadow = true;

player.add(rightArm);


// Legs

const legGeometry =
    new THREE.BoxGeometry(
        0.25,
        1.15,
        0.28
    );

const legMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x20242a,
        roughness: 0.9
    });


const leftLeg =
    new THREE.Mesh(
        legGeometry,
        legMaterial
    );

leftLeg.position.set(
    -0.22,
    0.55,
    0
);

leftLeg.castShadow = true;

player.add(leftLeg);


const rightLeg =
    new THREE.Mesh(
        legGeometry,
        legMaterial
    );

rightLeg.position.set(
    0.22,
    0.55,
    0
);

rightLeg.castShadow = true;

player.add(rightLeg);


// ============================================================
// CAR
// ============================================================

const car =
    new THREE.Group();

car.position.set(
    0,
    0,
    0
);

scene.add(car);


// Car body

const carBodyGeometry =
    new THREE.BoxGeometry(
        3.6,
        0.75,
        7
    );

const carPaint =
    new THREE.MeshPhysicalMaterial({
        color: 0x1769ff,
        metalness: 0.75,
        roughness: 0.25,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08
    });

const carBody =
    new THREE.Mesh(
        carBodyGeometry,
        carPaint
    );

carBody.position.y =
    1.0;

carBody.castShadow = true;
carBody.receiveShadow = true;

car.add(carBody);


// ============================================================
// CAR CABIN
// ============================================================

const cabinGeometry =
    new THREE.BoxGeometry(
        2.9,
        1.2,
        3.5
    );

const cabinMaterial =
    new THREE.MeshPhysicalMaterial({
        color: 0x111827,
        metalness: 0.15,
        roughness: 0.12,
        clearcoat: 0.7
    });

const cabin =
    new THREE.Mesh(
        cabinGeometry,
        cabinMaterial
    );

cabin.position.set(
    0,
    1.65,
    -0.25
);

cabin.castShadow = true;

car.add(cabin);


// ============================================================
// WINDOWS
// ============================================================

const windshieldMaterial =
    new THREE.MeshPhysicalMaterial({
        color: 0x17202b,
        metalness: 0.1,
        roughness: 0.08,
        transmission: 0.35,
        transparent: true,
        opacity: 0.75,
        clearcoat: 1
    });


const windshieldGeometry =
    new THREE.BoxGeometry(
        2.65,
        0.75,
        0.08
    );


const windshield =
    new THREE.Mesh(
        windshieldGeometry,
        windshieldMaterial
    );

windshield.position.set(
    0,
    1.8,
    -2.0
);

windshield.rotation.x =
    -0.12;

car.add(windshield);


// Rear window

const rearWindow =
    new THREE.Mesh(
        windshieldGeometry,
        windshieldMaterial
    );

rearWindow.position.set(
    0,
    1.8,
    1.55
);

rearWindow.rotation.x =
    0.12;

car.add(rearWindow);


// ============================================================
// WHEELS
// ============================================================

const wheelGeometry =
    new THREE.CylinderGeometry(
        0.65,
        0.65,
        0.45,
        24
    );

const tireMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.95,
        metalness: 0
    });


const rimGeometry =
    new THREE.CylinderGeometry(
        0.34,
        0.34,
        0.47,
        20
    );

const rimMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb7bcc5,
        roughness: 0.28,
        metalness: 0.85
    });


const wheels = [];

function createWheel(
    x,
    z
) {

    const wheel =
        new THREE.Group();

    wheel.position.set(
        x,
        0.65,
        z
    );

    wheel.rotation.z =
        Math.PI / 2;

    const tire =
        new THREE.Mesh(
            wheelGeometry,
            tireMaterial
        );

    tire.castShadow = true;

    wheel.add(tire);


    const rim =
        new THREE.Mesh(
            rimGeometry,
            rimMaterial
        );

    rim.castShadow = true;

    wheel.add(rim);

    car.add(wheel);

    wheels.push(wheel);

    return wheel;
}


const frontLeft =
    createWheel(
        -1.9,
        -2.25
    );

const frontRight =
    createWheel(
        1.9,
        -2.25
    );

const rearLeft =
    createWheel(
        -1.9,
        2.25
    );

const rearRight =
    createWheel(
        1.9,
        2.25
    );


// ============================================================
// HEADLIGHTS
// ============================================================

const headlightGeometry =
    new THREE.BoxGeometry(
        0.8,
        0.3,
        0.12
    );

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 3
    });


const headlightLeft =
    new THREE.Mesh(
        headlightGeometry,
        headlightMaterial
    );

headlightLeft.position.set(
    -1.1,
    1.15,
    -3.52
);

car.add(headlightLeft);


const headlightRight =
    headlightLeft.clone();

headlightRight.position.x =
    1.1;

car.add(headlightRight);


// ============================================================
// TAIL LIGHTS
// ============================================================

const tailGeometry =
    new THREE.BoxGeometry(
        0.85,
        0.3,
        0.12
    );

const tailMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xaa0000,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });


const tailLeft =
    new THREE.Mesh(
        tailGeometry,
        tailMaterial
    );

tailLeft.position.set(
    -1.1,
    1.15,
    3.52
);

car.add(tailLeft);


const tailRight =
    tailLeft.clone();

tailRight.position.x =
    1.1;

car.add(tailRight);


// ============================================================
// MIRRORS
// ============================================================

const mirrorGeometry =
    new THREE.BoxGeometry(
        0.25,
        0.25,
        0.5
    );

const mirrorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.3
    });


const mirrorLeft =
    new THREE.Mesh(
        mirrorGeometry,
        mirrorMaterial
    );

mirrorLeft.position.set(
    -1.7,
    1.65,
    -1.0
);

mirrorLeft.castShadow = true;

car.add(mirrorLeft);


const mirrorRight =
    mirrorLeft.clone();

mirrorRight.position.x =
    1.7;

car.add(mirrorRight);


// ============================================================
// BUMPERS
// ============================================================

const bumperGeometry =
    new THREE.BoxGeometry(
        3.4,
        0.3,
        0.25
    );

const bumperMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.6,
        metalness: 0.35
    });


const frontBumper =
    new THREE.Mesh(
        bumperGeometry,
        bumperMaterial
    );

frontBumper.position.set(
    0,
    0.65,
    -3.55
);

car.add(frontBumper);


const rearBumper =
    frontBumper.clone();

rearBumper.position.z =
    3.55;

car.add(rearBumper);


// ============================================================
// SPOILER
// ============================================================

const spoilerGeometry =
    new THREE.BoxGeometry(
        3.2,
        0.18,
        0.45
    );

const spoilerMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.4,
        metalness: 0.4
    });


const spoiler =
    new THREE.Mesh(
        spoilerGeometry,
        spoilerMaterial
    );

spoiler.position.set(
    0,
    2.05,
    3.0
);

spoiler.castShadow = true;

car.add(spoiler);


// ============================================================
// EXHAUSTS
// ============================================================

const exhaustGeometry =
    new THREE.CylinderGeometry(
        0.12,
        0.12,
        0.35,
        12
    );

const exhaustMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.25
    });


const exhaustLeft =
    new THREE.Mesh(
        exhaustGeometry,
        exhaustMaterial
    );

exhaustLeft.rotation.x =
    Math.PI / 2;

exhaustLeft.position.set(
    -0.9,
    0.65,
    3.7
);

car.add(exhaustLeft);


const exhaustRight =
    exhaustLeft.clone();

exhaustRight.position.x =
    0.9;

car.add(exhaustRight);


// ============================================================
// CONTROLS
// ============================================================

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = true;

        if (
            event.key.toLowerCase() === "e"
        ) {

            toggleVehicle();
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


// ============================================================
// GAME STATE
// ============================================================

let inCar = false;

let carSpeed = 0;

let playerSpeed = 7;

let playerTurnSpeed = 2.2;

let carMaxSpeed = 20;

let carReverseSpeed = 8;

let carAcceleration = 10;

let carFriction = 6;

let carTurnSpeed = 1.9;


// ============================================================
// ENTER / EXIT CAR
// ============================================================

function toggleVehicle() {

    if (!inCar) {

        const distance =
            player.position.distanceTo(
                car.position
            );

        if (distance < 5) {

            inCar = true;

            player.visible = false;
        }

    } else {

        inCar = false;

        player.visible = true;

        const exitPosition =
            new THREE.Vector3(
                4,
                0,
                0
            );

        exitPosition.applyQuaternion(
            car.quaternion
        );

        player.position.copy(
            car.position
        ).add(
            exitPosition
        );

        player.rotation.y =
            car.rotation.y;

        carSpeed = 0;
    }
}


// ============================================================
// CAMERA VARIABLES
// ============================================================

const cameraPosition =
    new THREE.Vector3();

const cameraTarget =
    new THREE.Vector3();


// ============================================================
// CAR CAMERA
// ============================================================

function updateCarCamera() {

    const offset =
        new THREE.Vector3(
            0,
            4.5,
            -8
        );

    offset.applyQuaternion(
        car.quaternion
    );

    cameraPosition.copy(
        car.position
    ).add(
        offset
    );

    camera.position.lerp(
        cameraPosition,
        0.10
    );

    cameraTarget.set(
        car.position.x,
        car.position.y + 1.1,
        car.position.z
    );

    camera.lookAt(
        cameraTarget
    );
}


// ============================================================
// PLAYER CAMERA
// ============================================================

function updatePlayerCamera() {

    const offset =
        new THREE.Vector3(
            0,
            4,
            6
        );

    offset.applyQuaternion(
        player.quaternion
    );

    cameraPosition.copy(
        player.position
    ).add(
        offset
    );

    camera.position.lerp(
        cameraPosition,
        0.12
    );

    cameraTarget.set(
        player.position.x,
        player.position.y + 1.4,
        player.position.z
    );

    camera.lookAt(
        cameraTarget
    );
}


// ============================================================
// CLOCK
// ============================================================

const clock =
    new THREE.Clock();


// ============================================================
// ANIMATION
// ============================================================

let walkTime = 0;


function animate() {

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    // ========================================================
    // PLAYER
    // ========================================================

    if (!inCar) {

        let moving = false;


        // Forward

        if (
            keys["z"] ||
            keys["w"] ||
            keys["arrowup"]
        ) {

            player.translateZ(
                -playerSpeed * delta
            );

            moving = true;
        }


        // Reverse

        if (
            keys["s"] ||
            keys["arrowdown"]
        ) {

            player.translateZ(
                playerSpeed * delta
            );

            moving = true;
        }


        // Q = LEFT

        if (
            keys["q"] ||
            keys["a"] ||
            keys["arrowleft"]
        ) {

            player.rotation.y +=
                playerTurnSpeed *
                delta;
        }


        // D = RIGHT

        if (
            keys["d"] ||
            keys["arrowright"]
        ) {

            player.rotation.y -=
                playerTurnSpeed *
                delta;
        }


        // Walking animation

        if (moving) {

            walkTime +=
                delta * 9;

            leftArm.rotation.x =
                Math.sin(
                    walkTime
                ) * 0.45;

            rightArm.rotation.x =
                -Math.sin(
                    walkTime
                ) * 0.45;

            leftLeg.rotation.x =
                -Math.sin(
                    walkTime
                ) * 0.5;

            rightLeg.rotation.x =
                Math.sin(
                    walkTime
                ) * 0.5;

        } else {

            leftArm.rotation.x *=
                0.85;

            rightArm.rotation.x *=
                0.85;

            leftLeg.rotation.x *=
                0.85;

            rightLeg.rotation.x *=
                0.85;
        }


        updatePlayerCamera();
    }


    // ========================================================
    // CAR
    // ========================================================

    if (inCar) {

        let accelerating = false;


        // Forward

        if (
            keys["z"] ||
            keys["w"] ||
            keys["arrowup"]
        ) {

            carSpeed +=
                carAcceleration *
                delta;

            accelerating = true;
        }


        // Reverse

        if (
            keys["s"] ||
            keys["arrowdown"]
        ) {

            carSpeed -=
                carAcceleration *
                delta;
        }


        // Friction

        if (!accelerating) {

            if (carSpeed > 0) {

                carSpeed -=
                    carFriction *
                    delta;

                if (carSpeed < 0) {
                    carSpeed = 0;
                }

            } else if (
                carSpeed < 0
            ) {

                carSpeed +=
                    carFriction *
                    delta;

                if (carSpeed > 0) {
                    carSpeed = 0;
                }
            }
        }


        // Limit speed

        carSpeed =
            THREE.MathUtils.clamp(
                carSpeed,
                -carReverseSpeed,
                carMaxSpeed
            );


        // Steering

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


        if (
            Math.abs(carSpeed) > 0.1
        ) {

            const direction =
                carSpeed >= 0
                    ? 1
                    : -1;

            car.rotation.y +=
                steering *
                carTurnSpeed *
                delta *
                direction *
                Math.min(
                    Math.abs(carSpeed) /
                    8,
                    1
                );
        }


        // Move car

        car.translateZ(
            -carSpeed * delta
        );


        // Front wheel steering visual

        const wheelSteering =
            steering * 0.45;

        frontLeft.rotation.y =
            wheelSteering;

        frontRight.rotation.y =
            wheelSteering;


        // Wheel rotation

        const wheelRotation =
            carSpeed *
            delta /
            0.65;

        wheels.forEach(
            (wheel) => {

                wheel.children[0].rotation.x +=
                    wheelRotation;

                wheel.children[1].rotation.x +=
                    wheelRotation;
            }
        );


        updateCarCamera();
    }


    // ========================================================
    // RENDER
    // ========================================================

    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// RESIZE
// ============================================================

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

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );
    }
);


// ============================================================
// START
// ============================================================

renderer.setAnimationLoop(
    animate
);
