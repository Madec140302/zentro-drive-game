// ============================================================
// ZENTRO V.1 - MAIN.JS
// Version propre et autonome
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    worldSize: 2400,
    roadWidth: 14,
    maxTraffic: 10,
    treeCount: 260,
    buildingCount: 70,

    maxPixelRatio: 1.35,

    playerWalkSpeed: 7,
    playerRunSpeed: 11,

    carMaxSpeed: 52,
    carAcceleration: 28,
    carBrake: 42,
    carReverseSpeed: 16,

    cameraDistance: 9,
    cameraHeight: 5,

    dayLength: 240,

    fuelMax: 100,

    saveKey: "zentro-save-v1"
};

// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fc7f5);

scene.fog = new THREE.Fog(
    0x8fc7f5,
    120,
    900
);

// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1200
);

camera.position.set(0, 5, 10);

// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.domElement.style.position = "fixed";
renderer.domElement.style.left = "0";
renderer.domElement.style.top = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";

document.body.appendChild(renderer.domElement);

// ============================================================
// CLOCK
// ============================================================

const clock = new THREE.Clock();

let elapsed = 0;

// ============================================================
// GAME STATE
// ============================================================

const state = {
    mode: "character",

    paused: false,

    money: 2500,
    xp: 0,
    level: 1,

    fuel: 100,

    speed: 0,
    rpm: 900,

    steering: 0,

    throttle: 0,
    brake: 0,

    headlights: false,

    mapOpen: false,

    garageOpen: false,

    missionActive: false,

    missionProgress: 0,

    missionReward: 0,

    dayTime: 0.25,

    weather: "clear",

    cameraShake: 0,

    wanted: 0
};

// ============================================================
// INPUT
// ============================================================

const keys = {};

window.addEventListener("keydown", (event) => {

    keys[event.code] = true;

    if (
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space"
        ].includes(event.code)
    ) {
        event.preventDefault();
    }

    if (event.code === "KeyE") {
        toggleVehicle();
    }

    if (event.code === "KeyM") {
        state.mapOpen = !state.mapOpen;
        largeMap.style.display = state.mapOpen ? "flex" : "none";
    }

    if (event.code === "KeyL") {
        state.headlights = !state.headlights;
        updateHeadlights();
    }

    if (event.code === "KeyG") {
        toggleGarage();
    }

    if (event.code === "KeyP") {
        state.paused = !state.paused;
    }

    if (event.code === "KeyK") {
        startDeliveryMission();
    }

    if (event.code === "KeyH") {
        saveGame();
        showMessage("💾 Partie sauvegardée");
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// ============================================================
// UTILITIES
// ============================================================

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function damp(a, b, lambda, dt) {
    return THREE.MathUtils.lerp(
        a,
        b,
        1 - Math.exp(-lambda * dt)
    );
}

function random(min, max) {
    return min + Math.random() * (max - min);
}

function distanceXZ(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;

    return Math.sqrt(
        dx * dx +
        dz * dz
    );
}

// ============================================================
// MATERIALS
// ============================================================

const materials = {

    grass: new THREE.MeshStandardMaterial({
        color: 0x4e8b48,
        roughness: 1
    }),

    road: new THREE.MeshStandardMaterial({
        color: 0x25282c,
        roughness: 0.9
    }),

    sidewalk: new THREE.MeshStandardMaterial({
        color: 0x777b7d,
        roughness: 0.95
    }),

    line: new THREE.MeshBasicMaterial({
        color: 0xf5f5e8
    }),

    building: new THREE.MeshStandardMaterial({
        color: 0xaeb5bd,
        roughness: 0.85
    }),

    buildingDark: new THREE.MeshStandardMaterial({
        color: 0x4d5661,
        roughness: 0.8
    }),

    glass: new THREE.MeshStandardMaterial({
        color: 0x172a3d,
        roughness: 0.15,
        metalness: 0.25
    }),

    tire: new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 1
    }),

    wheelRim: new THREE.MeshStandardMaterial({
        color: 0x9da4aa,
        metalness: 0.8,
        roughness: 0.25
    }),

    treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x65452d
    }),

    treeLeaf: new THREE.MeshStandardMaterial({
        color: 0x286b35,
        roughness: 1
    }),

    character: new THREE.MeshStandardMaterial({
        color: 0x27384c
    }),

    skin: new THREE.MeshStandardMaterial({
        color: 0xd49a72
    }),

    shirt: new THREE.MeshStandardMaterial({
        color: 0x202b40
    }),

    carPaint: new THREE.MeshStandardMaterial({
        color: 0x0b4ed1,
        metalness: 0.55,
        roughness: 0.25
    }),

    carPaint2: new THREE.MeshStandardMaterial({
        color: 0x8a1018,
        metalness: 0.55,
        roughness: 0.25
    }),

    white: new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        metalness: 0.25,
        roughness: 0.3
    }),

    black: new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.7
    })
};

// ============================================================
// LIGHTING
// ============================================================

const hemiLight = new THREE.HemisphereLight(
    0xbfe5ff,
    0x38522d,
    1.5
);

scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(
    0xffffff,
    2.1
);

sunLight.position.set(
    180,
    250,
    100
);

sunLight.castShadow = true;

sunLight.shadow.mapSize.set(
    1024,
    1024
);

sunLight.shadow.camera.left = -250;
sunLight.shadow.camera.right = 250;
sunLight.shadow.camera.top = 250;
sunLight.shadow.camera.bottom = -250;

sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 700;

scene.add(sunLight);

scene.add(sunLight.target);

// ============================================================
// WORLD GROUPS
// ============================================================

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const roadGroup = new THREE.Group();
worldGroup.add(roadGroup);

const buildingGroup = new THREE.Group();
worldGroup.add(buildingGroup);

const propGroup = new THREE.Group();
worldGroup.add(propGroup);

const trafficGroup = new THREE.Group();
worldGroup.add(trafficGroup);

// ============================================================
// GROUND
// ============================================================

const groundGeometry = new THREE.PlaneGeometry(
    CONFIG.worldSize,
    CONFIG.worldSize
);

const ground = new THREE.Mesh(
    groundGeometry,
    materials.grass
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

worldGroup.add(ground);

// ============================================================
// BOX CREATOR
// ============================================================

function createBox(
    width,
    height,
    depth,
    material,
    x,
    y,
    z,
    parent = worldGroup
) {

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        material
    );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}

// ============================================================
// ROADS
// ============================================================

const roadPositions = [
    { x: 0, z: 0, w: 2400, d: 14, horizontal: true },
    { x: 0, z: 0, w: 14, d: 2400, horizontal: false },

    { x: 0, z: 350, w: 1800, d: 14, horizontal: true },
    { x: 0, z: -350, w: 1800, d: 14, horizontal: true },

    { x: 350, z: 0, w: 14, d: 1800, horizontal: false },
    { x: -350, z: 0, w: 14, d: 1800, horizontal: false },

    { x: 700, z: 0, w: 14, d: 1500, horizontal: false },
    { x: -700, z: 0, w: 14, d: 1500, horizontal: false }
];

for (const road of roadPositions) {

    createBox(
        road.w,
        0.08,
        road.d,
        materials.road,
        road.x,
        0.04,
        road.z,
        roadGroup
    );

    const lineLength = road.horizontal
        ? road.w
        : road.d;

    const lineCount = Math.floor(
        lineLength / 24
    );

    for (let i = 0; i < lineCount; i++) {

        const offset =
            -lineLength / 2 +
            i * 24 +
            12;

        if (road.horizontal) {

            createBox(
                10,
                0.02,
                0.18,
                materials.line,
                road.x + offset,
                0.11,
                road.z,
                roadGroup
            );

        } else {

            createBox(
                0.18,
                0.02,
                10,
                materials.line,
                road.x,
                0.11,
                road.z + offset,
                roadGroup
            );
        }
    }

    // trottoirs
    if (road.horizontal) {

        createBox(
            road.w,
            0.16,
            2,
            materials.sidewalk,
            road.x,
            0.08,
            road.z + 9,
            roadGroup
        );

        createBox(
            road.w,
            0.16,
            2,
            materials.sidewalk,
            road.x,
            0.08,
            road.z - 9,
            roadGroup
        );

    } else {

        createBox(
            2,
            0.16,
            road.d,
            materials.sidewalk,
            road.x + 9,
            0.08,
            road.z,
            roadGroup
        );

        createBox(
            2,
            0.16,
            road.d,
            materials.sidewalk,
            road.x - 9,
            0.08,
            road.z,
            roadGroup
        );
    }
}

// ============================================================
// BUILDINGS
// ============================================================

function createBuilding(x, z) {

    const width = random(16, 30);
    const depth = random(16, 30);
    const height = random(12, 45);

    const material =
        Math.random() > 0.5
            ? materials.building
            : materials.buildingDark;

    const building = createBox(
        width,
        height,
        depth,
        material,
        x,
        height / 2,
        z,
        buildingGroup
    );

    building.userData.isBuilding = true;

    // toit
    createBox(
        width * 1.02,
        0.5,
        depth * 1.02,
        materials.black,
        x,
        height + 0.25,
        z,
        buildingGroup
    );
}

let buildingsCreated = 0;

while (buildingsCreated < CONFIG.buildingCount) {

    const x = random(
        -1050,
        1050
    );

    const z = random(
        -1050,
        1050
    );

    const nearRoad =
        Math.abs(x) < 25 ||
        Math.abs(z) < 25 ||
        Math.abs(x - 350) < 25 ||
        Math.abs(x + 350) < 25 ||
        Math.abs(z - 350) < 25 ||
        Math.abs(z + 350) < 25;

    if (nearRoad) continue;

    createBuilding(x, z);

    buildingsCreated++;
}

// ============================================================
// TREES - INSTANCED MESH
// ============================================================

function createTrees() {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.25,
            0.35,
            3,
            7
        );

    const leafGeometry =
        new THREE.SphereGeometry(
            1.8,
            8,
            6
        );

    const trunks = new THREE.InstancedMesh(
        trunkGeometry,
        materials.treeTrunk,
        CONFIG.treeCount
    );

    const leaves = new THREE.InstancedMesh(
        leafGeometry,
        materials.treeLeaf,
        CONFIG.treeCount
    );

    const matrix = new THREE.Matrix4();

    let count = 0;

    while (count < CONFIG.treeCount) {

        const x = random(
            -1100,
            1100
        );

        const z = random(
            -1100,
            1100
        );

        if (
            Math.abs(x) < 35 ||
            Math.abs(z) < 35
        ) {
            continue;
        }

        const scale = random(
            0.7,
            1.25
        );

        matrix.compose(
            new THREE.Vector3(
                x,
                1.5,
                z
            ),
            new THREE.Quaternion(),
            new THREE.Vector3(
                scale,
                scale,
                scale
            )
        );

        trunks.setMatrixAt(
            count,
            matrix
        );

        matrix.compose(
            new THREE.Vector3(
                x,
                4,
                z
            ),
            new THREE.Quaternion(),
            new THREE.Vector3(
                scale,
                scale,
                scale
            )
        );

        leaves.setMatrixAt(
            count,
            matrix
        );

        count++;
    }

    trunks.instanceMatrix.needsUpdate = true;
    leaves.instanceMatrix.needsUpdate = true;

    trunks.castShadow = true;
    trunks.receiveShadow = true;

    leaves.castShadow = true;
    leaves.receiveShadow = true;

    propGroup.add(trunks);
    propGroup.add(leaves);
}

createTrees();

// ============================================================
// CHARACTER
// ============================================================

const character = new THREE.Group();

character.position.set(
    0,
    0,
    18
);

scene.add(character);

const characterBody = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.8,
        1.4,
        0.45
    ),
    materials.shirt
);

characterBody.position.y = 1.25;

characterBody.castShadow = true;

character.add(characterBody);

const characterHead = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.34,
        12,
        10
    ),
    materials.skin
);

characterHead.position.y = 2.25;

characterHead.castShadow = true;

character.add(characterHead);

const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.22,
        1.15,
        0.22
    ),
    materials.shirt
);

leftArm.position.set(
    -0.58,
    1.35,
    0
);

leftArm.castShadow = true;

character.add(leftArm);

const rightArm = leftArm.clone();

rightArm.position.x = 0.58;

character.add(rightArm);

const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.28,
        1.1,
        0.28
    ),
    materials.character
);

leftLeg.position.set(
    -0.22,
    0.35,
    0
);

leftLeg.castShadow = true;

character.add(leftLeg);

const rightLeg = leftLeg.clone();

rightLeg.position.x = 0.22;

character.add(rightLeg);

// ============================================================
// CAR
// ============================================================

function createCar(
    paint = materials.carPaint
) {

    const car = new THREE.Group();

    car.userData.speed = 0;
    car.userData.steering = 0;

    // châssis
    const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.1,
            0.45,
            4.4
        ),
        paint
    );

    chassis.position.y = 0.85;

    chassis.castShadow = true;

    car.add(chassis);

    // capot
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.0,
            0.35,
            1.25
        ),
        paint
    );

    hood.position.set(
        0,
        1.08,
        -1.35
    );

    hood.castShadow = true;

    car.add(hood);

    // toit
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.65,
            0.55,
            1.85
        ),
        paint
    );

    roof.position.set(
        0,
        1.45,
        0.35
    );

    roof.castShadow = true;

    car.add(roof);

    // vitres
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.5,
            0.38,
            0.08
        ),
        materials.glass
    );

    windshield.position.set(
        0,
        1.46,
        -0.57
    );

    windshield.rotation.x =
        THREE.MathUtils.degToRad(-8);

    car.add(windshield);

    const rearGlass = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.5,
            0.38,
            0.08
        ),
        materials.glass
    );

    rearGlass.position.set(
        0,
        1.46,
        1.27
    );

    rearGlass.rotation.x =
        THREE.MathUtils.degToRad(8);

    car.add(rearGlass);

    // pare-chocs
    createBox(
        2.05,
        0.28,
        0.25,
        materials.black,
        0,
        0.75,
        -2.18,
        car
    );

    createBox(
        2.05,
        0.28,
        0.25,
        materials.black,
        0,
        0.75,
        2.18,
        car
    );

    // roues
    const wheels = [];

    function makeWheel(
        x,
        z,
        front = false
    ) {

        const steeringGroup =
            new THREE.Group();

        steeringGroup.position.set(
            x,
            0.62,
            z
        );

        const wheelGroup =
            new THREE.Group();

        // Axe correct :
        // le cylindre est tourné pour que
        // son axe soit transversal au véhicule.
        wheelGroup.rotation.z =
            Math.PI / 2;

        steeringGroup.add(
            wheelGroup
        );

        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.46,
                0.46,
                0.28,
                16
            ),
            materials.tire
        );

        tire.castShadow = true;

        wheelGroup.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.22,
                0.22,
                0.30,
                12
            ),
            materials.wheelRim
        );

        wheelGroup.add(rim);

        car.add(steeringGroup);

        wheels.push({
            steeringGroup,
            wheelGroup,
            front
        });
    }

    makeWheel(
        -1.05,
        -1.45,
        true
    );

    makeWheel(
        1.05,
        -1.45,
        true
    );

    makeWheel(
        -1.05,
        1.45,
        false
    );

    makeWheel(
        1.05,
        1.45,
        false
    );

    car.userData.wheels = wheels;

    // phares
    const headlightMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

    for (const x of [-0.68, 0.68]) {

        const light = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.42,
                0.22,
                0.08
            ),
            headlightMaterial
        );

        light.position.set(
            x,
            1.02,
            -2.22
        );

        car.add(light);
    }

    // feux arrière
    const rearLightMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff2020
        });

    for (const x of [-0.68, 0.68]) {

        const light = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.42,
                0.22,
                0.08
            ),
            rearLightMaterial
        );

        light.position.set(
            x,
            1.02,
            2.22
        );

        car.add(light);
    }

    // échappements
    for (const x of [-0.62, 0.62]) {

        const exhaust = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.08,
                0.08,
                0.25,
                10
            ),
            materials.black
        );

        exhaust.rotation.x =
            Math.PI / 2;

        exhaust.position.set(
            x,
            0.72,
            2.3
        );

        car.add(exhaust);
    }

    // feux avant réels
    const leftHeadlight =
        new THREE.SpotLight(
            0xffffff,
            0,
            45,
            Math.PI / 7,
            0.45,
            1.4
        );

    leftHeadlight.position.set(
        -0.65,
        1.0,
        -2
    );

    leftHeadlight.target.position.set(
        -0.65,
        0,
        -25
    );

    car.add(leftHeadlight);
    car.add(leftHeadlight.target);

    const rightHeadlight =
        new THREE.SpotLight(
            0xffffff,
            0,
            45,
            Math.PI / 7,
            0.45,
            1.4
        );

    rightHeadlight.position.set(
        0.65,
        1.0,
        -2
    );

    rightHeadlight.target.position.set(
        0.65,
        0,
        -25
    );

    car.add(rightHeadlight);
    car.add(rightHeadlight.target);

    car.userData.headlights = [
        leftHeadlight,
        rightHeadlight
    ];

    return car;
}

const playerCar = createCar();

playerCar.position.set(
    0,
    0,
    0
);

scene.add(playerCar);

// ============================================================
// TRAFFIC
// ============================================================

const trafficCars = [];

const trafficColors = [
    0xd92323,
    0xffffff,
    0x202020,
    0xffa500,
    0x19a3d1
];

function spawnTrafficCar(index) {

    const car =
        createCar(
            new THREE.MeshStandardMaterial({
                color:
                    trafficColors[
                        index %
                        trafficColors.length
                    ],
                metalness: 0.45,
                roughness: 0.3
            })
        );

    const lane =
        index % 2 === 0
            ? 4
            : -4;

    const horizontal =
        index % 2 === 0;

    if (horizontal) {

        car.position.set(
            random(-800, 800),
            0,
            lane
        );

        car.rotation.y =
            Math.PI / 2;

    } else {

        car.position.set(
            lane,
            0,
            random(-800, 800)
        );

        car.rotation.y = 0;
    }

    car.userData.trafficSpeed =
        random(8, 17);

    car.userData.horizontal =
        horizontal;

    trafficGroup.add(car);

    trafficCars.push(car);
}

for (
    let i = 0;
    i < CONFIG.maxTraffic;
    i++
) {
    spawnTrafficCar(i);
}

// ============================================================
// TRAFFIC LIGHTS
// ============================================================

function createTrafficLight(
    x,
    z
) {

    const pole = createBox(
        0.15,
        5,
        0.15,
        materials.black,
        x,
        2.5,
        z,
        propGroup
    );

    const housing = createBox(
        0.45,
        1.5,
        0.4,
        materials.black,
        x,
        4.5,
        z,
        propGroup
    );

    const red = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.13,
            10,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff2020
        })
    );

    red.position.set(
        x,
        4.9,
        z - 0.21
    );

    propGroup.add(red);

    const yellow = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.13,
            10,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xffc400
        })
    );

    yellow.position.set(
        x,
        4.5,
        z - 0.21
    );

    propGroup.add(yellow);

    const green = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.13,
            10,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0x20d84b
        })
    );

    green.position.set(
        x,
        4.1,
        z - 0.21
    );

    propGroup.add(green);

    return {
        pole,
        housing,
        red,
        yellow,
        green
    };
}

const trafficLights = [
    createTrafficLight(8, 8),
    createTrafficLight(-8, -8),
    createTrafficLight(358, 358),
    createTrafficLight(-358, -358)
];

// ============================================================
// MISSION MARKERS
// ============================================================

const missionMarkers = [];

function createMissionMarker(
    x,
    z,
    color = 0xffc400
) {

    const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(
            2,
            2,
            0.15,
            24
        ),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8
        })
    );

    marker.position.set(
        x,
        0.12,
        z
    );

    scene.add(marker);

    missionMarkers.push(marker);

    return marker;
}

const deliveryMarker =
    createMissionMarker(
        180,
        180,
        0xffc400
    );

deliveryMarker.visible = false;

// ============================================================
// GARAGE
// ============================================================

const garageMarker =
    createMissionMarker(
        -180,
        -180,
        0x21a8ff
    );

garageMarker.visible = true;

// ============================================================
// HUD
// ============================================================

const hud = document.createElement("div");

hud.style.position = "fixed";
hud.style.left = "20px";
hud.style.top = "20px";
hud.style.color = "white";
hud.style.fontFamily = "Arial, sans-serif";
hud.style.fontSize = "16px";
hud.style.lineHeight = "1.6";
hud.style.textShadow =
    "0 2px 5px rgba(0,0,0,.8)";
hud.style.zIndex = "20";
hud.style.pointerEvents = "none";

document.body.appendChild(hud);

// ============================================================
// MESSAGE
// ============================================================

const message = document.createElement("div");

message.style.position = "fixed";
message.style.left = "50%";
message.style.top = "18%";
message.style.transform =
    "translateX(-50%)";

message.style.padding =
    "12px 22px";

message.style.background =
    "rgba(0,0,0,.72)";

message.style.color = "white";

message.style.borderRadius =
    "12px";

message.style.fontFamily =
    "Arial, sans-serif";

message.style.fontSize =
    "18px";

message.style.zIndex = "50";

message.style.display = "none";

document.body.appendChild(message);

let messageTimer = 0;

function showMessage(text) {

    message.textContent = text;

    message.style.display = "block";

    messageTimer = 2.5;
}

// ============================================================
// MINI MAP
// ============================================================

const minimap =
    document.createElement("canvas");

minimap.width = 220;
minimap.height = 220;

minimap.style.position = "fixed";
minimap.style.right = "20px";
minimap.style.top = "20px";
minimap.style.width = "220px";
minimap.style.height = "220px";
minimap.style.borderRadius = "16px";
minimap.style.border =
    "2px solid rgba(255,255,255,.6)";
minimap.style.background =
    "rgba(20,30,35,.78)";
minimap.style.zIndex = "20";

document.body.appendChild(minimap);

const mapCtx =
    minimap.getContext("2d");

function drawMinimap() {

    const w = minimap.width;
    const h = minimap.height;

    mapCtx.clearRect(
        0,
        0,
        w,
        h
    );

    mapCtx.fillStyle =
        "#26382d";

    mapCtx.fillRect(
        0,
        0,
        w,
        h
    );

    const scale = 0.075;

    // routes principales
    mapCtx.strokeStyle =
        "#666b70";

    mapCtx.lineWidth = 5;

    for (const road of roadPositions) {

        mapCtx.beginPath();

        if (road.horizontal) {

            const x1 =
                w / 2 +
                (-road.w / 2) * scale;

            const x2 =
                w / 2 +
                (road.w / 2) * scale;

            const y =
                h / 2 +
                road.z * scale;

            mapCtx.moveTo(
                x1,
                y
            );

            mapCtx.lineTo(
                x2,
                y
            );

        } else {

            const x =
                w / 2 +
                road.x * scale;

            const y1 =
                h / 2 +
                (-road.d / 2) * scale;

            const y2 =
                h / 2 +
                (road.d / 2) * scale;

            mapCtx.moveTo(
                x,
                y1
            );

            mapCtx.lineTo(
                x,
                y2
            );
        }

        mapCtx.stroke();
    }

    // trafic
    for (const car of trafficCars) {

        const x =
            w / 2 +
            car.position.x * scale;

        const y =
            h / 2 +
            car.position.z * scale;

        if (
            x < 0 ||
            x > w ||
            y < 0 ||
            y > h
        ) continue;

        mapCtx.fillStyle =
            "#ff4545";

        mapCtx.beginPath();

        mapCtx.arc(
            x,
            y,
            3,
            0,
            Math.PI * 2
        );

        mapCtx.fill();
    }

    // mission
    if (state.missionActive) {

        const x =
            w / 2 +
            deliveryMarker.position.x *
            scale;

        const y =
            h / 2 +
            deliveryMarker.position.z *
            scale;

        mapCtx.fillStyle =
            "#ffd400";

        mapCtx.beginPath();

        mapCtx.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
        );

        mapCtx.fill();
    }

    // joueur
    const px =
        w / 2 +
        playerCar.position.x *
        scale;

    const pz =
        h / 2 +
        playerCar.position.z *
        scale;

    mapCtx.save();

    mapCtx.translate(
        px,
        pz
    );

    mapCtx.rotate(
        -playerCar.rotation.y
    );

    mapCtx.fillStyle =
        "#42a5ff";

    mapCtx.beginPath();

    mapCtx.moveTo(
        0,
        -8
    );

    mapCtx.lineTo(
        5,
        6
    );

    mapCtx.lineTo(
        -5,
        6
    );

    mapCtx.closePath();

    mapCtx.fill();

    mapCtx.restore();
}

// ============================================================
// LARGE MAP
// ============================================================

const largeMap =
    document.createElement("div");

largeMap.style.position = "fixed";
largeMap.style.left = "0";
largeMap.style.top = "0";
largeMap.style.width = "100%";
largeMap.style.height = "100%";
largeMap.style.background =
    "rgba(10,18,20,.94)";
largeMap.style.zIndex = "40";
largeMap.style.display = "none";
largeMap.style.alignItems = "center";
largeMap.style.justifyContent = "center";

const largeMapCanvas =
    document.createElement("canvas");

largeMapCanvas.width = 900;
largeMapCanvas.height = 650;

largeMapCanvas.style.width =
    "min(90vw,900px)";

largeMapCanvas.style.height =
    "min(75vh,650px)";

largeMapCanvas.style.border =
    "2px solid white";

largeMap.appendChild(
    largeMapCanvas
);

document.body.appendChild(
    largeMap
);

const largeMapCtx =
    largeMapCanvas.getContext("2d");

function drawLargeMap() {

    const w = largeMapCanvas.width;
    const h = largeMapCanvas.height;

    largeMapCtx.fillStyle =
        "#26382d";

    largeMapCtx.fillRect(
        0,
        0,
        w,
        h
    );

    const scale = 0.28;

    largeMapCtx.strokeStyle =
        "#676d72";

    largeMapCtx.lineWidth = 10;

    for (const road of roadPositions) {

        largeMapCtx.beginPath();

        if (road.horizontal) {

            const x1 =
                w / 2 -
                road.w * scale / 2;

            const x2 =
                w / 2 +
                road.w * scale / 2;

            const y =
                h / 2 +
                road.z * scale;

            largeMapCtx.moveTo(
                x1,
                y
            );

            largeMapCtx.lineTo(
                x2,
                y
            );

        } else {

            const x =
                w / 2 +
                road.x * scale;

            const y1 =
                h / 2 -
                road.d * scale / 2;

            const y2 =
                h / 2 +
                road.d * scale / 2;

            largeMapCtx.moveTo(
                x,
                y1
            );

            largeMapCtx.lineTo(
                x,
                y2
            );
        }

        largeMapCtx.stroke();
    }

    // garage
    largeMapCtx.fillStyle =
        "#20a9ff";

    largeMapCtx.beginPath();

    largeMapCtx.arc(
        w / 2 +
        garageMarker.position.x * scale,
        h / 2 +
        garageMarker.position.z * scale,
        12,
        0,
        Math.PI * 2
    );

    largeMapCtx.fill();

    // mission
    if (state.missionActive) {

        largeMapCtx.fillStyle =
            "#ffd400";

        largeMapCtx.beginPath();

        largeMapCtx.arc(
            w / 2 +
            deliveryMarker.position.x *
            scale,
            h / 2 +
            deliveryMarker.position.z *
            scale,
            12,
            0,
            Math.PI * 2
        );

        largeMapCtx.fill();
    }

    // joueur
    largeMapCtx.fillStyle =
        "#42a5ff";

    largeMapCtx.beginPath();

    largeMapCtx.arc(
        w / 2 +
        playerCar.position.x *
        scale,
        h / 2 +
        playerCar.position.z *
        scale,
        10,
        0,
        Math.PI * 2
    );

    largeMapCtx.fill();
}

// ============================================================
// VEHICLE CONTROL
// ============================================================

function getVehicleInput() {

    let throttle = 0;
    let brake = 0;
    let steering = 0;

    if (
        keys["KeyW"] ||
        keys["ArrowUp"]
    ) {
        throttle = 1;
    }

    if (
        keys["KeyS"] ||
        keys["ArrowDown"]
    ) {
        brake = 1;
    }

    if (
        keys["KeyA"] ||
        keys["ArrowLeft"]
    ) {
        steering = 1;
    }

    if (
        keys["KeyD"] ||
        keys["ArrowRight"]
    ) {
        steering = -1;
    }

    return {
        throttle,
        brake,
        steering
    };
}

function updateVehicle(
    dt
) {

    const input =
        getVehicleInput();

    state.throttle =
        input.throttle;

    state.brake =
        input.brake;

    state.steering =
        damp(
            state.steering,
            input.steering,
            10,
            dt
        );

    let speed =
        playerCar.userData.speed;

    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    forward.applyQuaternion(
        playerCar.quaternion
    );

    if (input.throttle) {

        speed +=
            CONFIG.carAcceleration *
            dt;

    } else {

        speed =
            damp(
                speed,
                0,
                1.6,
                dt
            );
    }

    if (input.brake) {

        speed =
            damp(
                speed,
                0,
                8,
                dt
            );
    }

    speed =
        clamp(
            speed,
            -CONFIG.carReverseSpeed,
            CONFIG.carMaxSpeed
        );

    // direction
    const steeringPower =
        clamp(
            Math.abs(speed) /
            CONFIG.carMaxSpeed,
            0,
            1
        );

    playerCar.rotation.y +=
        state.steering *
        1.7 *
        steeringPower *
        dt *
        (speed >= 0 ? 1 : -1);

    playerCar.position.addScaledVector(
        forward,
        speed * dt
    );

    // monde fermé
    const limit =
        CONFIG.worldSize / 2 - 30;

    playerCar.position.x =
        clamp(
            playerCar.position.x,
            -limit,
            limit
        );

    playerCar.position.z =
        clamp(
            playerCar.position.z,
            -limit,
            limit
        );

    // roues
    const wheels =
        playerCar.userData.wheels;

    const wheelRotation =
        speed * dt / 0.46;

    for (const wheel of wheels) {

        if (wheel.front) {

            wheel.steeringGroup.rotation.y =
                state.steering *
                0.45;
        }

        // la roue tourne autour
        // de son axe transversal
        wheel.wheelGroup.rotation.y +=
            wheelRotation;
    }

    // suspension simple
    playerCar.position.y =
        Math.sin(
            elapsed * 12
        ) *
        Math.min(
            Math.abs(speed) / 80,
            0.025
        );

    state.speed =
        Math.abs(speed) * 3.6;

    state.rpm =
        900 +
        state.speed *
        70;

    playerCar.userData.speed =
        speed;

    // carburant
    if (Math.abs(speed) > 2) {

        state.fuel -=
            0.002 *
            Math.abs(speed) *
            dt;
    }

    state.fuel =
        clamp(
            state.fuel,
            0,
            CONFIG.fuelMax
        );

    if (state.fuel <= 0) {

        playerCar.userData.speed =
            damp(
                playerCar.userData.speed,
                0,
                2,
                dt
            );
    }
}

// ============================================================
// CHARACTER CONTROL
// ============================================================

let walkTime = 0;

function updateCharacter(
    dt
) {

    if (state.mode !== "character") {

        character.visible = false;

        return;
    }

    character.visible = true;

    let x = 0;
    let z = 0;

    if (
        keys["KeyW"] ||
        keys["ArrowUp"]
    ) {
        z -= 1;
    }

    if (
        keys["KeyS"] ||
        keys["ArrowDown"]
    ) {
        z += 1;
    }

    if (
        keys["KeyA"] ||
        keys["ArrowLeft"]
    ) {
        x -= 1;
    }

    if (
        keys["KeyD"] ||
        keys["ArrowRight"]
    ) {
        x += 1;
    }

    const length =
        Math.sqrt(
            x * x +
            z * z
        );

    if (length > 0) {

        x /= length;
        z /= length;

        const speed =
            keys["ShiftLeft"] ||
            keys["ShiftRight"]
                ? CONFIG.playerRunSpeed
                : CONFIG.playerWalkSpeed;

        character.position.x +=
            x * speed * dt;

        character.position.z +=
            z * speed * dt;

        character.rotation.y =
            Math.atan2(
                x,
                z
            );

        walkTime +=
            dt * speed;

        const swing =
            Math.sin(
                walkTime * 5
            ) * 0.5;

        leftLeg.rotation.x =
            swing;

        rightLeg.rotation.x =
            -swing;

        leftArm.rotation.x =
            -swing;

        rightArm.rotation.x =
            swing;

    } else {

        leftLeg.rotation.x =
            damp(
                leftLeg.rotation.x,
                0,
                10,
                dt
            );

        rightLeg.rotation.x =
            damp(
                rightLeg.rotation.x,
                0,
                10,
                dt
            );

        leftArm.rotation.x =
            damp(
                leftArm.rotation.x,
                0,
                10,
                dt
            );

        rightArm.rotation.x =
            damp(
                rightArm.rotation.x,
                0,
                10,
                dt
            );
    }

    const limit =
        CONFIG.worldSize / 2 - 20;

    character.position.x =
        clamp(
            character.position.x,
            -limit,
            limit
        );

    character.position.z =
        clamp(
            character.position.z,
            -limit,
            limit
        );
}

// ============================================================
// ENTER / EXIT VEHICLE
// ============================================================

function toggleVehicle() {

    if (state.mode === "character") {

        const distance =
            distanceXZ(
                character.position,
                playerCar.position
            );

        if (distance < 5) {

            state.mode = "vehicle";

            character.visible = false;

            showMessage(
                "🚗 Tu es maintenant dans la voiture"
            );

        } else {

            showMessage(
                "Approche-toi de la voiture"
            );
        }

    } else {

        state.mode = "character";

        character.position.copy(
            playerCar.position
        );

        character.position.x += 3;

        character.position.y = 0;

        character.visible = true;

        showMessage(
            "🚪 Tu es sorti de la voiture"
        );
    }
}

// ============================================================
// TRAFFIC UPDATE
// ============================================================

function updateTraffic(dt) {

    for (const car of trafficCars) {

        const speed =
            car.userData.trafficSpeed;

        if (car.userData.horizontal) {

            car.position.x +=
                speed * dt;

            if (car.position.x > 900) {
                car.position.x = -900;
            }

        } else {

            car.position.z +=
                speed * dt;

            if (car.position.z > 900) {
                car.position.z = -900;
            }
        }

        const wheels =
            car.userData.wheels;

        for (const wheel of wheels) {

            wheel.wheelGroup.rotation.y +=
                speed * dt / 0.46;
        }
    }
}

// ============================================================
// CAMERA
// ============================================================

const cameraTarget =
    new THREE.Vector3();

const cameraDesired =
    new THREE.Vector3();

function updateCamera(dt) {

    if (state.mode === "vehicle") {

        const behind =
            new THREE.Vector3(
                0,
                4.6,
                9
            );

        behind.applyQuaternion(
            playerCar.quaternion
        );

        cameraDesired.copy(
            playerCar.position
        ).add(
            behind
        );

        cameraTarget.copy(
            playerCar.position
        );

        cameraTarget.y += 1.2;

    } else {

        const behind =
            new THREE.Vector3(
                0,
                3.8,
                6
            );

        behind.applyQuaternion(
            character.quaternion
        );

        cameraDesired.copy(
            character.position
        ).add(
            behind
        );

        cameraTarget.copy(
            character.position
        );

        cameraTarget.y += 1.5;
    }

    camera.position.lerp(
        cameraDesired,
        1 -
        Math.exp(-8 * dt)
    );

    camera.lookAt(
        cameraTarget
    );
}

// ============================================================
// HEADLIGHTS
// ============================================================

function updateHeadlights() {

    const lights =
        playerCar.userData.headlights;

    for (const light of lights) {

        light.intensity =
            state.headlights
                ? 4
                : 0;
    }
}

// ============================================================
// DAY / NIGHT
// ============================================================

function updateDayNight(dt) {

    state.dayTime +=
        dt /
        CONFIG.dayLength;

    if (state.dayTime > 1) {
        state.dayTime = 0;
    }

    const angle =
        state.dayTime *
        Math.PI *
        2;

    const sunX =
        Math.cos(angle) *
        300;

    const sunY =
        Math.sin(angle) *
        300;

    sunLight.position.set(
        sunX,
        Math.max(30, sunY),
        100
    );

    const daylight =
        clamp(
            Math.sin(angle) * 0.5 + 0.5,
            0.08,
            1
        );

    sunLight.intensity =
        0.4 +
        daylight * 1.8;

    hemiLight.intensity =
        0.4 +
        daylight * 1.1;

    const sky =
        new THREE.Color();

    sky.setHSL(
        0.56,
        0.45,
        0.35 +
        daylight * 0.25
    );

    scene.background.copy(
        sky
    );

    scene.fog.color.copy(
        sky
    );

    state.headlights =
        daylight < 0.25;

    updateHeadlights();
}

// ============================================================
// MISSIONS
// ============================================================

function startDeliveryMission() {

    if (state.missionActive) {

        showMessage(
            "📦 Mission déjà active"
        );

        return;
    }

    state.missionActive = true;

    state.missionProgress = 0;

    state.missionReward = 750;

    deliveryMarker.visible = true;

    showMessage(
        "📦 Livraison : rends-toi au marqueur jaune"
    );
}

function updateMission() {

    if (!state.missionActive) {
        return;
    }

    const distance =
        distanceXZ(
            playerCar.position,
            deliveryMarker.position
        );

    state.missionProgress =
        clamp(
            1 -
            distance / 600,
            0,
            1
        );

    if (distance < 12) {

        state.missionActive = false;

        deliveryMarker.visible = false;

        state.money +=
            state.missionReward;

        state.xp += 100;

        checkLevel();

        showMessage(
            "✅ Livraison réussie ! +750 €"
        );

        saveGame();
    }
}

// ============================================================
// XP / LEVEL
// ============================================================

function checkLevel() {

    const needed =
        state.level * 500;

    while (
        state.xp >= needed
    ) {

        state.xp -= needed;

        state.level++;

        state.money += 1000;

        showMessage(
            `🏆 Niveau ${state.level} ! +1000 €`
        );
    }
}

// ============================================================
// GARAGE
// ============================================================

function toggleGarage() {

    const distance =
        distanceXZ(
            playerCar.position,
            garageMarker.position
        );

    if (distance > 20) {

        showMessage(
            "🔧 Approche-toi du garage bleu"
        );

        return;
    }

    state.garageOpen =
        !state.garageOpen;

    garagePanel.style.display =
        state.garageOpen
            ? "block"
            : "none";
}

// ============================================================
// GARAGE UI
// ============================================================

const garagePanel =
    document.createElement("div");

garagePanel.style.position = "fixed";
garagePanel.style.left = "50%";
garagePanel.style.top = "50%";
garagePanel.style.transform =
    "translate(-50%,-50%)";

garagePanel.style.width = "330px";

garagePanel.style.padding =
    "25px";

garagePanel.style.background =
    "rgba(15,20,28,.96)";

garagePanel.style.border =
    "2px solid #42a5ff";

garagePanel.style.borderRadius =
    "18px";

garagePanel.style.color = "white";

garagePanel.style.fontFamily =
    "Arial";

garagePanel.style.zIndex = "60";

garagePanel.style.display = "none";

garagePanel.innerHTML = `
    <h2 style="margin-top:0">🔧 GARAGE ZENTRO</h2>

    <p>Améliorations gratuites pour cette V.1 :</p>

    <button id="garageRepair"
        style="width:100%;padding:12px;margin:5px 0">
        ⛽ Ravitaillement
    </button>

    <button id="garagePaint"
        style="width:100%;padding:12px;margin:5px 0">
        🎨 Changer la couleur
    </button>

    <button id="garageClose"
        style="width:100%;padding:12px;margin:5px 0">
        Fermer
    </button>
`;

document.body.appendChild(
    garagePanel
);

document
    .getElementById("garageRepair")
    .addEventListener(
        "click",
        () => {

            state.fuel =
                CONFIG.fuelMax;

            showMessage(
                "⛽ Réservoir rempli"
            );
        }
    );

document
    .getElementById("garagePaint")
    .addEventListener(
        "click",
        () => {

            playerCar.traverse(
                object => {

                    if (
                        object.isMesh &&
                        object.material ===
                        materials.carPaint
                    ) {

                        object.material =
                            materials.carPaint2;
                    }
                }
            );

            showMessage(
                "🎨 Nouvelle couleur appliquée"
            );
        }
    );

document
    .getElementById("garageClose")
    .addEventListener(
        "click",
        () => {

            state.garageOpen =
                false;

            garagePanel.style.display =
                "none";
        }
    );

// ============================================================
// SAVE
// ============================================================

function saveGame() {

    const save = {

        money: state.money,

        xp: state.xp,

        level: state.level,

        fuel: state.fuel,

        position: {
            x: playerCar.position.x,
            z: playerCar.position.z
        },

        dayTime: state.dayTime
    };

    localStorage.setItem(
        CONFIG.saveKey,
        JSON.stringify(save)
    );
}

function loadGame() {

    const raw =
        localStorage.getItem(
            CONFIG.saveKey
        );

    if (!raw) {
        return;
    }

    try {

        const save =
            JSON.parse(raw);

        state.money =
            save.money ??
            state.money;

        state.xp =
            save.xp ??
            state.xp;

        state.level =
            save.level ??
            state.level;

        state.fuel =
            save.fuel ??
            state.fuel;

        state.dayTime =
            save.dayTime ??
            state.dayTime;

        if (save.position) {

            playerCar.position.x =
                save.position.x;

            playerCar.position.z =
                save.position.z;
        }

    } catch (error) {

        console.warn(
            "Sauvegarde invalide",
            error
        );
    }
}

loadGame();

// ============================================================
// CONTROLS PANEL
// ============================================================

const controls =
    document.createElement("div");

controls.style.position = "fixed";
controls.style.left = "20px";
controls.style.bottom = "20px";
controls.style.padding = "12px 16px";
controls.style.background =
    "rgba(0,0,0,.55)";
controls.style.borderRadius = "12px";
controls.style.color = "white";
controls.style.fontFamily = "Arial";
controls.style.fontSize = "13px";
controls.style.zIndex = "20";

controls.innerHTML = `
    <b>ZENTRO</b><br>
    ZQSD / flèches : déplacer<br>
    E : entrer / sortir<br>
    K : mission livraison<br>
    G : garage<br>
    M : grande carte<br>
    L : phares<br>
    H : sauvegarder
`;

document.body.appendChild(
    controls
);

// ============================================================
// TOUCH CONTROLS
// ============================================================

function createTouchButton(
    text,
    code,
    left,
    bottom
) {

    const button =
        document.createElement("button");

    button.textContent = text;

    button.style.position = "fixed";
    button.style.left = left;
    button.style.bottom = bottom;

    button.style.width = "62px";
    button.style.height = "62px";

    button.style.borderRadius = "50%";
    button.style.border = "1px solid white";

    button.style.background =
        "rgba(0,0,0,.5)";

    button.style.color = "white";

    button.style.fontSize = "20px";

    button.style.zIndex = "30";

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            keys[code] = true;
        }
    );

    button.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            keys[code] = false;
        }
    );

    button.addEventListener(
        "pointercancel",
        () => {

            keys[code] = false;
        }
    );

    button.addEventListener(
        "pointerleave",
        () => {

            keys[code] = false;
        }
    );

    document.body.appendChild(
        button
    );

    return button;
}

const touchButtons = [];

touchButtons.push(
    createTouchButton(
        "▲",
        "KeyW",
        "85px",
        "95px"
    )
);

touchButtons.push(
    createTouchButton(
        "▼",
        "KeyS",
        "85px",
        "20px"
    )
);

touchButtons.push(
    createTouchButton(
        "◀",
        "KeyA",
        "15px",
        "20px"
    )
);

touchButtons.push(
    createTouchButton(
        "▶",
        "KeyD",
        "155px",
        "20px"
    )
);

const enterTouch =
    createTouchButton(
        "E",
        "KeyE",
        "calc(100% - 85px)",
        "95px"
    );

touchButtons.push(
    enterTouch
);

// ============================================================
// COLLISION SIMPLE
// ============================================================

function keepCharacterAwayFromBuildings() {

    const characterPos =
        character.position;

    for (
        let i = 0;
        i < buildingGroup.children.length;
        i++
    ) {

        const building =
            buildingGroup.children[i];

        if (!building.userData.isBuilding) {
            continue;
        }

        const box =
            new THREE.Box3()
                .setFromObject(
                    building
                );

        const closest =
            box.clampPoint(
                characterPos,
                new THREE.Vector3()
            );

        const distance =
            characterPos.distanceTo(
                closest
            );

        if (distance < 0.7) {

            const direction =
                characterPos
                    .clone()
                    .sub(closest);

            if (
                direction.lengthSq() > 0
            ) {

                direction.normalize();

                character.position.addScaledVector(
                    direction,
                    0.8
                );
            }
        }
    }
}

// ============================================================
// HUD UPDATE
// ============================================================

function updateHUD() {

    const vehicle =
        state.mode === "vehicle";

    const missionText =
        state.missionActive
            ? `<br>📦 Livraison : ${Math.round(
                state.missionProgress * 100
            )}%`
            : "";

    hud.innerHTML = `
        <b style="font-size:22px">
            ZENTRO
        </b>
        <br>
        ${vehicle ? "🚗 CONDUITE" : "🧍 PERSONNAGE"}
        <br>
        💰 ${Math.floor(state.money)} €
        <br>
        ⭐ Niveau ${state.level}
        <br>
        XP : ${Math.floor(state.xp)}
        <br>
        ⛽ ${Math.floor(state.fuel)}%
        ${
            vehicle
                ? `<br>🏎️ ${Math.floor(
                    state.speed
                )} km/h`
                : ""
        }
        ${missionText}
    `;
}

// ============================================================
// MESSAGE TIMER
// ============================================================

function updateMessage(
    dt
) {

    if (
        messageTimer > 0
    ) {

        messageTimer -= dt;

    } else {

        message.style.display =
            "none";
    }
}

// ============================================================
// WEATHER - VERSION LÉGÈRE
// ============================================================

function updateWeather() {

    if (state.weather === "clear") {
        scene.fog.near = 120;
        scene.fog.far = 900;
    }

    if (state.weather === "fog") {
        scene.fog.near = 50;
        scene.fog.far = 450;
    }
}

// ============================================================
// GARAGE / MISSION DETECTION
// ============================================================

function updateInteractions() {

    if (state.mode === "vehicle") {

        const garageDistance =
            distanceXZ(
                playerCar.position,
                garageMarker.position
            );

        if (
            garageDistance < 20 &&
            !state.garageOpen
        ) {

            // aucune action automatique
        }
    }
}

// ============================================================
// PERFORMANCE VISIBILITY
// ============================================================

function updateVisibility() {

    const playerPosition =
        state.mode === "vehicle"
            ? playerCar.position
            : character.position;

    for (
        let i = 0;
        i < buildingGroup.children.length;
        i++
    ) {

        const object =
            buildingGroup.children[i];

        const distance =
            object.position.distanceTo(
                playerPosition
            );

        object.visible =
            distance < 700;
    }
}

// ============================================================
// RESIZE
// ============================================================

function resize() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            CONFIG.maxPixelRatio
        )
    );

    renderer.setSize(
        width,
        height
    );
}

window.addEventListener(
    "resize",
    resize
);

resize();

// ============================================================
// AUTO SAVE
// ============================================================

let saveTimer = 0;

function updateAutoSave(dt) {

    saveTimer += dt;

    if (saveTimer > 20) {

        saveTimer = 0;

        saveGame();
    }
}

// ============================================================
// MAIN UPDATE
// ============================================================

function updateGame(dt) {

    if (state.paused) {
        return;
    }

    elapsed += dt;

    if (
        state.mode === "vehicle"
    ) {

        updateVehicle(dt);

    } else {

        updateCharacter(dt);

        keepCharacterAwayFromBuildings();
    }

    updateTraffic(dt);

    updateCamera(dt);

    updateDayNight(dt);

    updateMission();

    updateInteractions();

    updateVisibility();

    updateAutoSave(dt);

    updateHUD();

    updateMessage(dt);

    drawMinimap();

    if (state.mapOpen) {
        drawLargeMap();
    }
}

// ============================================================
// MAIN LOOP
// ============================================================

function animate() {

    const dt =
        Math.min(
            clock.getDelta(),
            0.05
        );

    updateGame(dt);

    renderer.render(
        scene,
        camera
    );
}

// ============================================================
// INITIALIZATION
// ============================================================

updateHeadlights();

updateWeather();

updateHUD();

drawMinimap();

renderer.setAnimationLoop(
    animate
);

// ============================================================
// INITIAL MESSAGE
// ============================================================

setTimeout(
    () => {

        showMessage(
            "🚗 Bienvenue dans ZENTRO — Approche-toi de la voiture et appuie sur E"
        );

    },
    700
);

console.log(
    "ZENTRO V.1 chargé avec succès."
);
