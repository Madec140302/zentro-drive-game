import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/*
 ZENTRO XXL
 Procedural open-world driving game.
 Single-file browser prototype designed for the existing index.html:
 <script type="module" src="./main.js"></script>

 Controls
 --------
 Character: ZQSD / WASD / arrows
 Run: Shift
 Enter/exit car: E
 Handbrake: Space
 Camera: C
 Map: M
 Garage: G
 Pause/menu: Escape
 Horn: H
 Lights: L
 Weather: R
 Save: F5
 Load: F9

 The project intentionally uses procedural geometry so it can run without
 external 3D assets. It is structured as a game framework: world, player,
 vehicles, traffic, missions, economy, garage, weather, UI, save system,
 touch controls, gamepad support and optimization.
*/

const THREE_NS = THREE;
const VERSION = "ZENTRO XXL 1.0";

const CONFIG = {
    worldSize: 900,
    roadGrid: 5,
    roadSpacing: 90,
    cityRadius: 260,
    maxTraffic: 24,
    treeCount: 650,
    pedestrianCount: 70,
    maxDistance: 520,
    shadowMapSize: 2048,
    pixelRatioMax: 2,
    dayLengthSeconds: 900,
    playerSpeed: 7,
    playerRunSpeed: 12,
    carMaxSpeed: 58,
    carAcceleration: 24,
    carBrake: 38,
    carReverseSpeed: 16,
    carTurnSpeed: 1.8,
    trafficSpeed: 18,
    trafficSpawnRadius: 420,
    fuelMax: 100,
    fuelConsumption: 0.014,
    moneyStart: 2500,
    quality: "high"
};

const state = {
    mode: "character",
    paused: false,
    cameraMode: "chase",
    showMap: false,
    showGarage: false,
    showPhotoMode: false,
    lights: false,
    weather: "clear",
    time: 0.35,
    money: CONFIG.moneyStart,
    fuel: CONFIG.fuelMax,
    speed: 0,
    rpm: 850,
    wanted: 0,
    mission: null,
    missionProgress: 0,
    currentCarIndex: 0,
    quality: CONFIG.quality,
    kilometers: 0,
    damage: 0,
    saveVersion: 1
};

const input = {
    keys: {},
    pressed: {},
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    gamepads: [],
    touch: {
        active: false,
        x: 0,
        y: 0,
        steer: 0,
        throttle: 0,
        brake: 0
    }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ca7d8);
scene.fog = new THREE.Fog(0x7ca7d8, 180, CONFIG.maxDistance);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1500
);
camera.position.set(0, 8, 14);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioMax)
);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const world = new THREE.Group();
const cityGroup = new THREE.Group();
const countrysideGroup = new THREE.Group();
const roadGroup = new THREE.Group();
const buildingGroup = new THREE.Group();
const vegetationGroup = new THREE.Group();
const trafficGroup = new THREE.Group();
const pedestrianGroup = new THREE.Group();
const effectsGroup = new THREE.Group();

scene.add(world);
world.add(cityGroup);
world.add(countrysideGroup);
world.add(roadGroup);
world.add(buildingGroup);
world.add(vegetationGroup);
world.add(trafficGroup);
world.add(pedestrianGroup);
world.add(effectsGroup);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
sunLight.position.set(150, 250, 80);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(
    CONFIG.shadowMapSize,
    CONFIG.shadowMapSize
);
sunLight.shadow.camera.left = -350;
sunLight.shadow.camera.right = 350;
sunLight.shadow.camera.top = 350;
sunLight.shadow.camera.bottom = -350;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 700;
scene.add(sunLight);

const ambientLight = new THREE.HemisphereLight(
    0xbfd9ff,
    0x536044,
    1.25
);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x6688cc, 0);
moonLight.position.set(-120, 180, -150);
scene.add(moonLight);

const materials = {};

function mat(name, color, options = {}) {
    if (materials[name]) {
        return materials[name];
    }

    const material = new THREE.MeshStandardMaterial({
        color,
        roughness: options.roughness ?? 0.75,
        metalness: options.metalness ?? 0,
        transparent: options.transparent ?? false,
        opacity: options.opacity ?? 1,
        emissive: options.emissive ?? 0x000000,
        emissiveIntensity: options.emissiveIntensity ?? 0
    });

    materials[name] = material;
    return material;
}

materials.grass = mat("grass", 0x4c713f, {
    roughness: 1
});

materials.road = mat("road", 0x25272a, {
    roughness: 0.92
});

materials.sidewalk = mat("sidewalk", 0x8c8d8a, {
    roughness: 0.95
});

materials.white = mat("white", 0xf2f2f2);
materials.yellow = mat("yellow", 0xf5d142);
materials.red = mat("red", 0xb82c2c);
materials.dark = mat("dark", 0x15171a, {
    roughness: 0.4,
    metalness: 0.2
});

materials.glass = mat("glass", 0x4c7892, {
    roughness: 0.12,
    metalness: 0.15,
    transparent: true,
    opacity: 0.68
});

materials.chrome = mat("chrome", 0xbfc6cc, {
    roughness: 0.18,
    metalness: 0.9
});

materials.tree = mat("tree", 0x315b32, {
    roughness: 1
});

materials.trunk = mat("trunk", 0x5a3925, {
    roughness: 1
});

materials.house = mat("house", 0xc8a67b);
materials.roof = mat("roof", 0x473d3b);
materials.field = mat("field", 0x6c7d38);
materials.water = mat("water", 0x2e7ca4, {
    roughness: 0.15,
    metalness: 0.15,
    transparent: true,
    opacity: 0.84
});

function box(
    width,
    height,
    depth,
    material,
    x = 0,
    y = 0,
    z = 0
) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}

function cylinder(
    radiusTop,
    radiusBottom,
    height,
    material,
    x = 0,
    y = 0,
    z = 0,
    segments = 16
) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            height,
            segments
        ),
        material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}

function createGround() {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(
            CONFIG.worldSize,
            CONFIG.worldSize,
            1,
            1
        ),
        materials.grass
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    countrysideGroup.add(ground);

    const water = new THREE.Mesh(
        new THREE.PlaneGeometry(220, 900),
        materials.water
    );

    water.rotation.x = -Math.PI / 2;
    water.position.set(390, -0.08, 0);
    countrysideGroup.add(water);
}

function createRoad(
    x,
    z,
    width,
    length,
    horizontal = true
) {
    const road = box(
        horizontal ? length : width,
        0.08,
        horizontal ? width : length,
        materials.road,
        x,
        0.04,
        z
    );

    road.receiveShadow = true;
    road.castShadow = false;
    roadGroup.add(road);

    const laneCount = 2;
    const laneWidth = width / laneCount;

    for (let i = 0; i < 2; i++) {
        const line = box(
            horizontal ? length : 0.18,
            0.012,
            horizontal ? 0.18 : length,
            materials.yellow,
            horizontal
                ? x
                : x - width / 2 + laneWidth * (i + 0.5),
            0.1,
            horizontal
                ? z - width / 2 + laneWidth * (i + 0.5)
                : z
        );

        line.castShadow = false;
        line.receiveShadow = false;
        roadGroup.add(line);
    }

    const sidewalkA = box(
        horizontal ? length : 3,
        0.15,
        horizontal ? 3 : length,
        materials.sidewalk,
        horizontal ? x : x - width / 2 - 2,
        0.075,
        horizontal ? z - width / 2 - 2 : z
    );

    const sidewalkB = box(
        horizontal ? length : 3,
        0.15,
        horizontal ? 3 : length,
        materials.sidewalk,
        horizontal ? x : x + width / 2 + 2,
        0.075,
        horizontal ? z + width / 2 + 2 : z
    );

    roadGroup.add(sidewalkA);
    roadGroup.add(sidewalkB);
}

function createHighway() {
    const highway = box(
        900,
        0.16,
        42,
        materials.road,
        0,
        0.08,
        -330
    );

    roadGroup.add(highway);

    for (let x = -430; x < 430; x += 20) {
        const stripe = box(
            10,
            0.02,
            0.35,
            materials.white,
            x,
            0.18,
            -330
        );

        roadGroup.add(stripe);
    }

    for (const z of [-351, -309]) {
        const barrier = box(
            900,
            0.8,
            0.4,
            materials.chrome,
            0,
            0.45,
            z
        );

        roadGroup.add(barrier);
    }
}

function createCityRoadNetwork() {
    for (let i = -2; i <= 2; i++) {
        const p = i * CONFIG.roadSpacing;

        createRoad(
            0,
            p,
            16,
            CONFIG.worldSize,
            true
        );

        createRoad(
            p,
            0,
            16,
            CONFIG.worldSize,
            false
        );
    }

    createHighway();
}

function createBuilding(
    x,
    z,
    width,
    height,
    depth,
    colorMaterial = materials.house
) {
    const group = new THREE.Group();

    const body = box(
        width,
        height,
        depth,
        colorMaterial,
        0,
        height / 2,
        0
    );

    group.add(body);

    const roof = box(
        width + 1,
        0.6,
        depth + 1,
        materials.roof,
        0,
        height + 0.3,
        0
    );

    group.add(roof);

    const floors = Math.max(
        1,
        Math.floor(height / 4)
    );

    for (let floor = 0; floor < floors; floor++) {
        const y = 2 + floor * 4;

        for (
            let wx = -width / 2 + 2;
            wx < width / 2 - 1;
            wx += 3
        ) {
            const windowMesh = box(
                1.1,
                1.5,
                0.08,
                materials.glass,
                wx,
                y,
                depth / 2 + 0.05
            );

            windowMesh.castShadow = false;
            group.add(windowMesh);

            const windowBack = windowMesh.clone();
            windowBack.position.z =
                -depth / 2 - 0.05;
            group.add(windowBack);
        }
    }

    group.position.set(x, 0, z);
    buildingGroup.add(group);
}

function createCity() {
    const buildingMaterials = [
        materials.house,
        mat("building2", 0x8793a0),
        mat("building3", 0xb3b0a4),
        mat("building4", 0x786b62),
        mat("building5", 0x9b7771)
    ];

    for (
        let x = -220;
        x <= 220;
        x += 42
    ) {
        for (
            let z = -220;
            z <= 220;
            z += 42
        ) {
            const nearRoadX =
                Math.abs(
                    x -
                    Math.round(
                        x / CONFIG.roadSpacing
                    ) *
                        CONFIG.roadSpacing
                ) < 12;

            const nearRoadZ =
                Math.abs(
                    z -
                    Math.round(
                        z / CONFIG.roadSpacing
                    ) *
                        CONFIG.roadSpacing
                ) < 12;

            if (nearRoadX || nearRoadZ) {
                continue;
            }

            const height =
                8 +
                Math.random() * 24;

            const width =
                18 +
                Math.random() * 13;

            const depth =
                18 +
                Math.random() * 13;

            createBuilding(
                x + (Math.random() - 0.5) * 8,
                z + (Math.random() - 0.5) * 8,
                width,
                height,
                depth,
                buildingMaterials[
                    Math.floor(
                        Math.random() *
                            buildingMaterials.length
                    )
                ]
            );
        }
    }
}

function createHouse(x, z, scale = 1) {
    const house = new THREE.Group();

    const body = box(
        16 * scale,
        7 * scale,
        12 * scale,
        materials.house,
        0,
        3.5 * scale,
        0
    );

    house.add(body);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(
            11 * scale,
            5 * scale,
            4
        ),
        materials.roof
    );

    roof.rotation.y = Math.PI / 4;
    roof.position.y = 9 * scale;
    roof.castShadow = true;
    house.add(roof);

    const door = box(
        2 * scale,
        3 * scale,
        0.15 * scale,
        materials.dark,
        0,
        1.5 * scale,
        6.08 * scale
    );

    house.add(door);

    for (const side of [-1, 1]) {
        const windowMesh = box(
            2.4 * scale,
            1.7 * scale,
            0.12 * scale,
            materials.glass,
            side * 4 * scale,
            3.5 * scale,
            6.08 * scale
        );

        house.add(windowMesh);
    }

    house.position.set(x, 0, z);
    house.castShadow = true;

    countrysideGroup.add(house);
}

function createCountryside() {
    for (
        let i = 0;
        i < 65;
        i++
    ) {
        const angle =
            Math.random() * Math.PI * 2;

        const radius =
            290 +
            Math.random() * 330;

        const x =
            Math.cos(angle) * radius;

        const z =
            Math.sin(angle) * radius;

        createHouse(
            x,
            z,
            0.75 +
                Math.random() * 0.5
        );
    }

    for (
        let i = 0;
        i < 20;
        i++
    ) {
        const field = box(
            50 + Math.random() * 80,
            0.03,
            50 + Math.random() * 80,
            materials.field,
            -300 +
                Math.random() * 600,
            0.015,
            -250 +
                Math.random() * 550
        );

        countrysideGroup.add(field);
    }
}

function createTrafficLights() {
    const trafficLightMaterial = mat(
        "trafficLight",
        0x16191d
    );

    for (
        let x = -180;
        x <= 180;
        x += CONFIG.roadSpacing
    ) {
        for (
            let z = -180;
            z <= 180;
            z += CONFIG.roadSpacing
        ) {
            if (
                Math.abs(x) <
                    CONFIG.roadSpacing / 2 &&
                Math.abs(z) <
                    CONFIG.roadSpacing / 2
            ) {
                continue;
            }

            const pole = cylinder(
                0.08,
                0.08,
                5,
                trafficLightMaterial,
                x + 9,
                2.5,
                z + 9,
                10
            );

            roadGroup.add(pole);

            const housing = box(
                0.6,
                1.8,
                0.45,
                trafficLightMaterial,
                x + 9,
                5.3,
                z + 9
            );

            roadGroup.add(housing);

            const colors = [
                0xff2525,
                0xffd83d,
                0x34d66a
            ];

            colors.forEach(
                (color, index) => {
                    const lightMaterial =
                        new THREE.MeshStandardMaterial(
                            {
                                color,
                                emissive: color,
                                emissiveIntensity:
                                    index === 2
                                        ? 0.7
                                        : 0.15
                            }
                        );

                    const light = new THREE.Mesh(
                        new THREE.SphereGeometry(
                            0.16,
                            10,
                            10
                        ),
                        lightMaterial
                    );

                    light.position.set(
                        x + 9,
                        5.95 -
                            index * 0.58,
                        z + 9.24
                    );

                    roadGroup.add(light);
                }
            );
        }
    }
}

function createTrees() {
    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.18,
            0.25,
            2.5,
            7
        );

    const crownGeometry =
        new THREE.IcosahedronGeometry(
            1.55,
            1
        );

    const trunkMaterial = materials.trunk;
    const crownMaterial = materials.tree;

    const trunks =
        new THREE.InstancedMesh(
            trunkGeometry,
            trunkMaterial,
            CONFIG.treeCount
        );

    const crowns =
        new THREE.InstancedMesh(
            crownGeometry,
            crownMaterial,
            CONFIG.treeCount
        );

    trunks.castShadow = true;
    trunks.receiveShadow = true;
    crowns.castShadow = true;
    crowns.receiveShadow = true;

    const dummy =
        new THREE.Object3D();

    let created = 0;

    while (
        created <
        CONFIG.treeCount
    ) {
        const x =
            -430 +
            Math.random() * 860;

        const z =
            -430 +
            Math.random() * 860;

        if (
            Math.abs(x) <
                270 &&
            Math.abs(z) <
                270
        ) {
            continue;
        }

        const scale =
            0.75 +
            Math.random() * 1.3;

        dummy.position.set(
            x,
            1.25 * scale,
            z
        );

        dummy.scale.setScalar(
            scale
        );

        dummy.rotation.y =
            Math.random() *
            Math.PI *
            2;

        dummy.updateMatrix();
        trunks.setMatrixAt(
            created,
            dummy.matrix
        );

        dummy.position.y =
            3.2 * scale;

        dummy.scale.setScalar(
            scale
        );

        dummy.updateMatrix();
        crowns.setMatrixAt(
            created,
            dummy.matrix
        );

        created++;
    }

    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;

    vegetationGroup.add(trunks);
    vegetationGroup.add(crowns);
}

function createRoadsideProps() {
    const signMaterial = mat(
        "signMaterial",
        0xeeeeee
    );

    for (
        let x = -400;
        x <= 400;
        x += 45
    ) {
        if (
            Math.abs(x) <
            260
        ) {
            continue;
        }

        const post = cylinder(
            0.07,
            0.07,
            2.4,
            materials.chrome,
            x,
            1.2,
            -285,
            8
        );

        roadGroup.add(post);

        const sign = box(
            1.4,
            0.8,
            0.08,
            signMaterial,
            x,
            2.25,
            -285
        );

        roadGroup.add(sign);
    }
}

function createLandmark() {
    const tower = new THREE.Group();

    const base = cylinder(
        8,
        11,
        8,
        materials.chrome,
        0,
        4,
        330,
        24
    );

    tower.add(base);

    const shaft = cylinder(
        3.5,
        5,
        45,
        materials.glass,
        0,
        30.5,
        330,
        20
    );

    tower.add(shaft);

    const top = cylinder(
        7,
        4,
        4,
        materials.chrome,
        0,
        55,
        330,
        20
    );

    tower.add(top);

    const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(
            1.3,
            16,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0xff3344,
            emissive: 0xff3344,
            emissiveIntensity: 4
        })
    );

    beacon.position.y = 58;
    tower.add(beacon);

    cityGroup.add(tower);
}

function createMountains() {
    const mountainMaterial = mat(
        "mountain",
        0x56605b
    );

    for (
        let i = 0;
        i < 22;
        i++
    ) {
        const angle =
            (i / 22) *
            Math.PI *
            2;

        const radius =
            550 +
            Math.random() *
            80;

        const mountain =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    55 +
                        Math.random() *
                            50,
                    90 +
                        Math.random() *
                            70,
                    7
                ),
                mountainMaterial
            );

        mountain.position.set(
            Math.cos(angle) *
                radius,
            35,
            Math.sin(angle) *
                radius
        );

        mountain.rotation.y =
            Math.random() *
            Math.PI;

        mountain.castShadow = true;
        mountain.receiveShadow = true;

        countrysideGroup.add(
            mountain
        );
    }
}

function createWorld() {
    createGround();
    createCityRoadNetwork();
    createCity();
    createCountryside();
    createTrees();
    createTrafficLights();
    createRoadsideProps();
    createLandmark();
    createMountains();
}

createWorld();

function createCharacter() {
    const character = new THREE.Group();

    const skin = mat(
        "skin",
        0xc98768
    );

    const shirt = mat(
        "shirt",
        0x315a9b
    );

    const pants = mat(
        "pants",
        0x222a38
    );

    const shoes = mat(
        "shoes",
        0x111111
    );

    const torso = box(
        1.05,
        1.5,
        0.6,
        shirt,
        0,
        1.85,
        0
    );

    character.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.43,
            20,
            16
        ),
        skin
    );

    head.position.y = 2.9;
    head.castShadow = true;
    character.add(head);

    const armL = new THREE.Group();
    const armR = new THREE.Group();

    const armMeshL = cylinder(
        0.13,
        0.16,
        1.25,
        shirt,
        0,
        -0.62,
        0,
        12
    );

    const armMeshR =
        armMeshL.clone();

    armL.position.set(
        -0.68,
        2.35,
        0
    );

    armR.position.set(
        0.68,
        2.35,
        0
    );

    armL.rotation.z =
        -0.1;

    armR.rotation.z =
        0.1;

    armL.add(armMeshL);
    armR.add(armMeshR);

    character.add(armL);
    character.add(armR);

    const legL = new THREE.Group();
    const legR = new THREE.Group();

    const legMeshL = cylinder(
        0.16,
        0.19,
        1.35,
        pants,
        0,
        -0.67,
        0,
        12
    );

    const legMeshR =
        legMeshL.clone();

    legL.position.set(
        -0.27,
        1.05,
        0
    );

    legR.position.set(
        0.27,
        1.05,
        0
    );

    legL.add(legMeshL);
    legR.add(legMeshR);

    character.add(legL);
    character.add(legR);

    const footL = box(
        0.3,
        0.16,
        0.65,
        shoes,
        0,
        -0.7,
        0.15
    );

    const footR =
        footL.clone();

    footL.position.set(
        -0.27,
        0.38,
        0.18
    );

    footR.position.set(
        0.27,
        0.38,
        0.18
    );

    character.add(footL);
    character.add(footR);

    character.userData = {
        armL,
        armR,
        legL,
        legR,
        walkTime: 0
    };

    character.position.set(
        0,
        0,
        15
    );

    character.traverse(
        object => {
            if (
                object.isMesh
            ) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        }
    );

    scene.add(character);

    return character;
}

const player = createCharacter();

function createWheel(
    car,
    x,
    z,
    front
) {
    /*
     Correct wheel hierarchy:
     steering group rotates around Y.
     wheel group is rotated so the cylinder axle is across X.
     The wheel itself spins around its local Y.
    */

    const steering =
        new THREE.Group();

    steering.position.set(
        x,
        0.62,
        z
    );

    car.add(steering);

    const wheel =
        new THREE.Group();

    wheel.rotation.z =
        Math.PI / 2;

    steering.add(wheel);

    const tire =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.68,
                0.68,
                0.42,
                24
            ),
            mat(
                "tire",
                0x101112,
                {
                    roughness: 0.88
                }
            )
        );

    tire.castShadow = true;
    tire.receiveShadow = true;

    wheel.add(tire);

    const rim =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.36,
                0.36,
                0.44,
                20
            ),
            materials.chrome
        );

    wheel.add(rim);

    const hub =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.1,
                0.1,
                0.46,
                12
            ),
            materials.dark
        );

    wheel.add(hub);

    return {
        steering,
        wheel,
        tire,
        front
    };
}

function createCar(
    options = {}
) {
    const car =
        new THREE.Group();

    const color =
        options.color ??
        0x2457c6;

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color,
            metalness: 0.62,
            roughness: 0.24
        });

    const body = box(
        4.4,
        0.8,
        8.2,
        bodyMaterial,
        0,
        1.2,
        0
    );

    body.castShadow = true;
    body.receiveShadow = true;
    car.add(body);

    const hood = box(
        4.0,
        0.38,
        2.0,
        bodyMaterial,
        0,
        1.72,
        -2.7
    );

    car.add(hood);

    const roof = box(
        3.5,
        1.15,
        3.4,
        bodyMaterial,
        0,
        2.05,
        0.55
    );

    roof.scale.x = 0.92;
    car.add(roof);

    const windshield =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3.25,
                0.9,
                0.08
            ),
            materials.glass
        );

    windshield.position.set(
        0,
        2.28,
        -1.0
    );

    windshield.rotation.x =
        -0.32;

    car.add(windshield);

    const rearGlass =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3.2,
                0.82,
                0.08
            ),
            materials.glass
        );

    rearGlass.position.set(
        0,
        2.28,
        2.05
    );

    rearGlass.rotation.x =
        0.35;

    car.add(rearGlass);

    const frontBumper = box(
        4.25,
        0.35,
        0.38,
        materials.dark,
        0,
        0.86,
        -4.08
    );

    car.add(frontBumper);

    const rearBumper = box(
        4.25,
        0.35,
        0.38,
        materials.dark,
        0,
        0.86,
        4.08
    );

    car.add(rearBumper);

    const grille = box(
        2.0,
        0.52,
        0.08,
        materials.dark,
        0,
        1.25,
        -4.29
    );

    car.add(grille);

    const headlightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2
        });

    for (
        const x of [-1.45, 1.45]
    ) {
        const headlight =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.9,
                    0.35,
                    0.08
                ),
                headlightMaterial
            );

        headlight.position.set(
            x,
            1.55,
            -4.3
        );

        car.add(headlight);
    }

    const taillightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff2020,
            emissive: 0xff2020,
            emissiveIntensity: 0.7
        });

    for (
        const x of [-1.5, 1.5]
    ) {
        const tail =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.05,
                    0.32,
                    0.08
                ),
                taillightMaterial
            );

        tail.position.set(
            x,
            1.45,
            4.3
        );

        car.add(tail);
    }

    const wheels = [
        createWheel(
            car,
            -2.0,
            -2.75,
            true
        ),
        createWheel(
            car,
            2.0,
            -2.75,
            true
        ),
        createWheel(
            car,
            -2.0,
            2.75,
            false
        ),
        createWheel(
            car,
            2.0,
            2.75,
            false
        )
    ];

    const exhaustL = cylinder(
        0.09,
        0.12,
        0.5,
        materials.chrome,
        -1.3,
        0.7,
        4.28,
        12
    );

    exhaustL.rotation.x =
        Math.PI / 2;

    car.add(exhaustL);

    const exhaustR =
        exhaustL.clone();

    exhaustR.position.x = 1.3;
    car.add(exhaustR);

    const spoiler =
        new THREE.Group();

    spoiler.add(
        box(
            3.2,
            0.16,
            0.35,
            materials.dark,
            0,
            0,
            0
        )
    );

    for (
        const x of [-1.2, 1.2]
    ) {
        spoiler.add(
            box(
                0.12,
                0.65,
                0.12,
                materials.dark,
                x,
                -0.3,
                0
            )
        );
    }

    spoiler.position.set(
        0,
        2.1,
        3.65
    );

    car.add(spoiler);

    const headlights = [];

    for (
        const x of [-1.5, 1.5]
    ) {
        const spot =
            new THREE.SpotLight(
                0xffffff,
                0,
                70,
                Math.PI / 7,
                0.45,
                1.3
            );

        spot.position.set(
            x,
            1.5,
            -4.1
        );

        spot.target.position.set(
            x * 0.8,
            0,
            -35
        );

        car.add(spot);
        car.add(spot.target);

        headlights.push(spot);
    }

    car.userData = {
        wheels,
        headlights,
        speed: 0,
        steering: 0,
        rpm: 850,
        fuel: CONFIG.fuelMax,
        damage: 0,
        maxSpeed:
            options.maxSpeed ??
            CONFIG.carMaxSpeed,
        acceleration:
            options.acceleration ??
            CONFIG.carAcceleration,
        braking:
            options.braking ??
            CONFIG.carBrake,
        turn:
            options.turn ??
            CONFIG.carTurnSpeed,
        name:
            options.name ??
            "Zentro GT",
        value:
            options.value ??
            25000,
        color
    };

    car.traverse(
        object => {
            if (
                object.isMesh
            ) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        }
    );

    return car;
}

const cars = [
    createCar({
        name: "Zentro GT",
        color: 0x2457c6,
        maxSpeed: 58,
        acceleration: 25,
        braking: 42,
        turn: 1.85,
        value: 25000
    }),
    createCar({
        name: "Zentro RS",
        color: 0xc62c38,
        maxSpeed: 68,
        acceleration: 31,
        braking: 46,
        turn: 2.0,
        value: 42000
    }),
    createCar({
        name: "Zentro Sport",
        color: 0x16181b,
        maxSpeed: 76,
        acceleration: 36,
        braking: 50,
        turn: 2.15,
        value: 68000
    })
];

cars.forEach(
    car => {
        car.visible = false;
        scene.add(car);
    }
);

const activeCar =
    cars[state.currentCarIndex];

activeCar.visible = true;
activeCar.position.set(
    8,
    0,
    12
);
activeCar.rotation.y =
    Math.PI;

const trafficCars = [];

function createTrafficCar(
    index
) {
    const colors = [
        0xeeeeee,
        0x202020,
        0x2e9b5d,
        0xd2b12b,
        0x8a3cc7,
        0xb64a31
    ];

    const car =
        createCar({
            name: "Traffic",
            color:
                colors[
                    index %
                        colors.length
                ],
            maxSpeed:
                12 +
                Math.random() *
                    9,
            acceleration: 12,
            braking: 20,
            turn: 1.2,
            value: 10000
        });

    car.scale.setScalar(
        0.8 +
            Math.random() *
                0.18
    );

    car.userData.traffic = true;

    return car;
}

for (
    let i = 0;
    i < CONFIG.maxTraffic;
    i++
) {
    const traffic =
        createTrafficCar(i);

    const horizontal =
        Math.random() > 0.5;

    if (horizontal) {
        traffic.position.set(
            -430 +
                Math.random() *
                    860,
            0,
            Math.round(
                (-2 +
                    Math.floor(
                        Math.random() *
                            5
                    )) *
                    CONFIG.roadSpacing
            )
        );

        traffic.rotation.y =
            Math.random() > 0.5
                ? 0
                : Math.PI;
    } else {
        traffic.position.set(
            Math.round(
                (-2 +
                    Math.floor(
                        Math.random() *
                            5
                    )) *
                    CONFIG.roadSpacing
            ),
            0,
            -430 +
                Math.random() *
                    860
        );

        traffic.rotation.y =
            Math.random() > 0.5
                ? Math.PI / 2
                : -Math.PI / 2;
    }

    trafficGroup.add(
        traffic
    );

    trafficCars.push(
        traffic
    );
}

function createPedestrian() {
    const group =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.28,
                1.05,
                5,
                10
            ),
            mat(
                "pedBody" +
                    Math.random(),
                0x4b6da8
            )
        );

    body.position.y =
        1.05;

    group.add(body);

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.25,
                12,
                10
            ),
            materials.skin
        );

    head.position.y =
        1.85;

    group.add(head);

    group.userData = {
        direction:
            Math.random() *
            Math.PI *
            2,
        speed:
            0.6 +
            Math.random() *
                1.0,
        walkTime:
            Math.random() *
            Math.PI *
            2
    };

    return group;
}

for (
    let i = 0;
    i <
    CONFIG.pedestrianCount;
    i++
) {
    const pedestrian =
        createPedestrian();

    pedestrian.position.set(
        -260 +
            Math.random() *
                520,
        0,
        -260 +
            Math.random() *
                520
    );

    pedestrian.position.x +=
        Math.random() *
            8 -
        4;

    pedestrian.position.z +=
        Math.random() *
            8 -
        4;

    pedestrianGroup.add(
        pedestrian
    );
}

const ui = {
    root: document.createElement(
        "div"
    ),
    speed: document.createElement(
        "div"
    ),
    rpm: document.createElement(
        "div"
    ),
    money: document.createElement(
        "div"
    ),
    fuel: document.createElement(
        "div"
    ),
    mission: document.createElement(
        "div"
    ),
    prompt: document.createElement(
        "div"
    ),
    minimap: document.createElement(
        "canvas"
    ),
    notification:
        document.createElement(
            "div"
        ),
    garage:
        document.createElement(
            "div"
        ),
    menu:
        document.createElement(
            "div"
        ),
    weather:
        document.createElement(
            "div"
        ),
    fps:
        document.createElement(
            "div"
        )
};

ui.root.style.position =
    "fixed";
ui.root.style.inset =
    "0";
ui.root.style.pointerEvents =
    "none";
ui.root.style.fontFamily =
    "Arial, sans-serif";
ui.root.style.color =
    "#fff";
ui.root.style.textShadow =
    "0 2px 4px #000";

document.body.appendChild(
    ui.root
);

function styleText(
    element,
    css
) {
    element.style.cssText =
        css;
    ui.root.appendChild(
        element
    );
}

styleText(
    ui.speed,
    `
        position:absolute;
        right:24px;
        bottom:26px;
        font-size:42px;
        font-weight:800;
    `
);

styleText(
    ui.rpm,
    `
        position:absolute;
        right:27px;
        bottom:76px;
        font-size:14px;
        opacity:.85;
    `
);

styleText(
    ui.money,
    `
        position:absolute;
        right:24px;
        top:22px;
        font-size:19px;
        font-weight:700;
    `
);

styleText(
    ui.fuel,
    `
        position:absolute;
        right:24px;
        top:52px;
        font-size:15px;
    `
);

styleText(
    ui.mission,
    `
        position:absolute;
        left:24px;
        top:24px;
        font-size:16px;
        max-width:330px;
    `
);

styleText(
    ui.prompt,
    `
        position:absolute;
        left:50%;
        bottom:25%;
        transform:translateX(-50%);
        padding:10px 16px;
        border-radius:10px;
        background:rgba(0,0,0,.55);
        font-size:16px;
        display:none;
    `
);

styleText(
    ui.notification,
    `
        position:absolute;
        left:50%;
        top:12%;
        transform:translateX(-50%);
        padding:10px 18px;
        border-radius:10px;
        background:rgba(0,0,0,.65);
        font-size:17px;
        opacity:0;
        transition:opacity .25s;
    `
);

styleText(
    ui.weather,
    `
        position:absolute;
        left:24px;
        bottom:24px;
        font-size:14px;
    `
);

styleText(
    ui.fps,
    `
        position:absolute;
        left:24px;
        top:92px;
        font-size:12px;
        opacity:.55;
    `
);

ui.minimap.width = 220;
ui.minimap.height = 220;
ui.minimap.style.position =
    "absolute";
ui.minimap.style.right =
    "22px";
ui.minimap.style.top =
    "90px";
ui.minimap.style.border =
    "2px solid rgba(255,255,255,.7)";
ui.minimap.style.borderRadius =
    "14px";
ui.minimap.style.background =
    "rgba(0,0,0,.35)";
ui.minimap.style.display =
    "block";
ui.root.appendChild(
    ui.minimap
);

const minimapContext =
    ui.minimap.getContext(
        "2d"
    );

ui.garage.style.position =
    "absolute";
ui.garage.style.left =
    "50%";
ui.garage.style.top =
    "50%";
ui.garage.style.transform =
    "translate(-50%,-50%)";
ui.garage.style.width =
    "520px";
ui.garage.style.maxWidth =
    "90vw";
ui.garage.style.padding =
    "24px";
ui.garage.style.borderRadius =
    "18px";
ui.garage.style.background =
    "rgba(12,14,18,.94)";
ui.garage.style.display =
    "none";
ui.garage.style.pointerEvents =
    "auto";
ui.root.appendChild(
    ui.garage
);

ui.menu.style.position =
    "absolute";
ui.menu.style.left =
    "50%";
ui.menu.style.top =
    "50%";
ui.menu.style.transform =
    "translate(-50%,-50%)";
ui.menu.style.width =
    "500px";
ui.menu.style.maxWidth =
    "90vw";
ui.menu.style.padding =
    "28px";
ui.menu.style.borderRadius =
    "18px";
ui.menu.style.background =
    "rgba(10,12,16,.95)";
ui.menu.style.display =
    "none";
ui.menu.style.pointerEvents =
    "auto";
ui.root.appendChild(
    ui.menu
);

function notify(
    text,
    duration = 2500
) {
    ui.notification.textContent =
        text;

    ui.notification.style.opacity =
        "1";

    clearTimeout(
        notify.timer
    );

    notify.timer =
        setTimeout(
            () => {
                ui.notification.style.opacity =
                    "0";
            },
            duration
        );
}

function updateHUD() {
    const car =
        activeCar;

    const speed =
        Math.abs(
            car.userData.speed
        ) * 3.6;

    ui.speed.textContent =
        `${Math.round(
            speed
        )} km/h`;

    ui.rpm.textContent =
        `RPM ${Math.round(
            car.userData.rpm
        )}`;

    ui.money.textContent =
        `€ ${Math.round(
            state.money
        ).toLocaleString(
            "fr-FR"
        )}`;

    ui.fuel.textContent =
        `⛽ ${Math.max(
            0,
            car.userData.fuel
        ).toFixed(0)}%`;

    ui.weather.textContent =
        `Météo : ${state.weather}`;

    if (
        state.mission
    ) {
        ui.mission.innerHTML =
            `<b>${state.mission.title}</b><br>${state.mission.description}<br>Progression : ${Math.round(
                state.mission.progress
            )}%`;
    } else {
        ui.mission.innerHTML =
            `<b>ZENTRO</b><br>Explore la ville et la campagne.`;
    }
}

function drawMinimap() {
    const ctx =
        minimapContext;

    const w =
        ui.minimap.width;

    const h =
        ui.minimap.height;

    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    ctx.fillStyle =
        "#26372a";

    ctx.fillRect(
        0,
        0,
        w,
        h
    );

    ctx.strokeStyle =
        "#555";

    ctx.lineWidth =
        5;

    const scale =
        w /
        CONFIG.worldSize;

    for (
        let i = -2;
        i <= 2;
        i++
    ) {
        const p =
            w / 2 +
            i *
                CONFIG.roadSpacing *
                scale;

        ctx.beginPath();
        ctx.moveTo(
            0,
            p
        );
        ctx.lineTo(
            w,
            p
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(
            p,
            0
        );
        ctx.lineTo(
            p,
            h
        );
        ctx.stroke();
    }

    ctx.strokeStyle =
        "#e5e5e5";

    ctx.lineWidth =
        3;

    ctx.beginPath();

    ctx.moveTo(
        0,
        h / 2 +
            330 * scale
    );

    ctx.lineTo(
        w,
        h / 2 +
            330 * scale
    );

    ctx.stroke();

    const px =
        w / 2 +
        activeCar.position.x *
            scale;

    const pz =
        h / 2 +
        activeCar.position.z *
            scale;

    ctx.save();

    ctx.translate(
        px,
        pz
    );

    ctx.rotate(
        activeCar.rotation.y
    );

    ctx.fillStyle =
        "#ff3b30";

    ctx.beginPath();

    ctx.moveTo(
        0,
        -7
    );

    ctx.lineTo(
        -5,
        6
    );

    ctx.lineTo(
        5,
        6
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();

    if (
        state.mission
    ) {
        const mx =
            w / 2 +
            state.mission.target.x *
                scale;

        const mz =
            h / 2 +
            state.mission.target.z *
                scale;

        ctx.fillStyle =
            "#ffd60a";

        ctx.beginPath();

        ctx.arc(
            mx,
            mz,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

const missionMarkers =
    new THREE.Group();

scene.add(
    missionMarkers
);

const missionDefinitions = [
    {
        title:
            "Première livraison",
        description:
            "Livrer la voiture au point indiqué.",
        reward: 850,
        target:
            new THREE.Vector3(
                180,
                0,
                -180
            )
    },
    {
        title:
            "Course urbaine",
        description:
            "Atteindre le point de contrôle le plus vite possible.",
        reward: 1200,
        target:
            new THREE.Vector3(
                -180,
                0,
                180
            )
    },
    {
        title:
            "Route côtière",
        description:
            "Rejoindre la côte par l'autoroute.",
        reward: 1800,
        target:
            new THREE.Vector3(
                370,
                0,
                -330
            )
    }
];

function startMission(
    definition
) {
    state.mission = {
        title:
            definition.title,
        description:
            definition.description,
        reward:
            definition.reward,
        target:
            definition.target.clone(),
        progress: 0,
        startedAt:
            performance.now(),
        timeLimit:
            180
    };

    missionMarkers.clear();

    const marker =
        new THREE.Group();

    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                5,
                0.6,
                12,
                32
            ),
            new THREE.MeshStandardMaterial(
                {
                    color: 0xffd60a,
                    emissive: 0xffaa00,
                    emissiveIntensity: 1.8
                }
            )
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y =
        0.8;

    marker.add(ring);

    const beam =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.35,
                0.35,
                10,
                12
            ),
            new THREE.MeshStandardMaterial(
                {
                    color: 0xffd60a,
                    emissive: 0xffaa00,
                    emissiveIntensity: 1.5,
                    transparent: true,
                    opacity: 0.4
                }
            )
        );

    beam.position.y =
        5;

    marker.add(beam);

    marker.position.copy(
        definition.target
    );

    missionMarkers.add(
        marker
    );

    notify(
        `Mission : ${definition.title}`
    );
}

function completeMission() {
    if (
        !state.mission
    ) {
        return;
    }

    state.money +=
        state.mission.reward;

    notify(
        `Mission réussie ! +€${state.mission.reward}`
    );

    state.mission = null;
    missionMarkers.clear();

    saveGame();
}

function failMission() {
    notify(
        "Mission échouée."
    );

    state.mission = null;
    missionMarkers.clear();
}

function updateMission(
    delta
) {
    if (
        !state.mission
    ) {
        return;
    }

    const car =
        activeCar;

    const distance =
        car.position.distanceTo(
            state.mission.target
        );

    const maxDistance =
        500;

    state.mission.progress =
        THREE.MathUtils.clamp(
            (1 -
                distance /
                    maxDistance) *
                100,
            0,
            100
        );

    if (
        distance < 9
    ) {
        completeMission();
        return;
    }

    const elapsed =
        (performance.now() -
            state.mission.startedAt) /
        1000;

    if (
        elapsed >
        state.mission.timeLimit
    ) {
        failMission();
    }

    missionMarkers.rotation.y +=
        delta * 0.8;
}

function createFuelStation(
    x,
    z
) {
    const station =
        new THREE.Group();

    const canopy =
        box(
            22,
            0.7,
            12,
            materials.white,
            0,
            5,
            0
        );

    station.add(canopy);

    const columns = [
        [-9, 2.5, -4],
        [9, 2.5, -4],
        [-9, 2.5, 4],
        [9, 2.5, 4]
    ];

    columns.forEach(
        position => {
            station.add(
                cylinder(
                    0.25,
                    0.25,
                    5,
                    materials.chrome,
                    ...position,
                    12
                )
            );
        }
    );

    for (
        const px of [-5, 0, 5]
    ) {
        const pump =
            box(
                1.4,
                1.8,
                0.9,
                materials.red,
                px,
                0.9,
                0
            );

        station.add(
            pump
        );
    }

    const sign =
        box(
            5,
            4,
            0.4,
            materials.red,
            0,
            7,
            -5
        );

    station.add(sign);

    station.position.set(
        x,
        0,
        z
    );

    countrysideGroup.add(
        station
    );

    return station;
}

const fuelStations = [
    createFuelStation(
        -310,
        -60
    ),
    createFuelStation(
        300,
        70
    ),
    createFuelStation(
        350,
        -300
    )
];

function distanceToNearestFuelStation() {
    let closest =
        Infinity;

    for (
        const station of
            fuelStations
    ) {
        closest =
            Math.min(
                closest,
                activeCar.position.distanceTo(
                    station.position
                )
            );
    }

    return closest;
}

function refuel() {
    if (
        distanceToNearestFuelStation() >
        16
    ) {
        return;
    }

    if (
        state.money <= 0 ||
        activeCar.userData.fuel >=
            CONFIG.fuelMax
    ) {
        return;
    }

    const missing =
        CONFIG.fuelMax -
        activeCar.userData.fuel;

    const price =
        Math.ceil(
            missing * 2
        );

    if (
        state.money <
        price
    ) {
        notify(
            "Pas assez d'argent."
        );
        return;
    }

    state.money -=
        price;

    activeCar.userData.fuel =
        CONFIG.fuelMax;

    notify(
        `Réservoir rempli : -€${price}`
    );
}

const garageData = {
    upgrades: {
        engine: 0,
        brakes: 0,
        handling: 0,
        gearbox: 0
    },
    prices: {
        engine: [
            1200,
            2200,
            3800,
            6000
        ],
        brakes: [
            900,
            1700,
            2900,
            4500
        ],
        handling: [
            1100,
            2100,
            3400,
            5200
        ],
        gearbox: [
            1400,
            2600,
            4300,
            6800
        ]
    }
};

function getUpgradePrice(
    type
) {
    const level =
        garageData.upgrades[
            type
        ];

    const prices =
        garageData.prices[
            type
        ];

    if (
        level >= prices.length
    ) {
        return null;
    }

    return prices[level];
}

function applyUpgrades() {
    const car =
        activeCar;

    car.userData.maxSpeed =
        CONFIG.carMaxSpeed +
        garageData.upgrades.engine *
            6 +
        garageData.upgrades.gearbox *
            3;

    car.userData.acceleration =
        CONFIG.carAcceleration +
        garageData.upgrades.engine *
            4;

    car.userData.braking =
        CONFIG.carBrake +
        garageData.upgrades.brakes *
            5;

    car.userData.turn =
        CONFIG.carTurnSpeed +
        garageData.upgrades.handling *
            0.15;
}

function buyUpgrade(
    type
) {
    const price =
        getUpgradePrice(
            type
        );

    if (
        price === null
    ) {
        notify(
            "Amélioration maximale."
        );
        return;
    }

    if (
        state.money <
        price
    ) {
        notify(
            "Pas assez d'argent."
        );
        return;
    }

    state.money -=
        price;

    garageData.upgrades[
        type
    ]++;

    applyUpgrades();
    updateGarageUI();

    notify(
        `${type} amélioré !`
    );

    saveGame();
}

function updateGarageUI() {
    ui.garage.innerHTML =
        `
        <div style="font-size:28px;font-weight:800;margin-bottom:8px">
            GARAGE ZENTRO
        </div>
        <div style="opacity:.7;margin-bottom:18px">
            ${activeCar.userData.name}
        </div>

        ${garageButton(
            "engine",
            "Moteur"
        )}
        ${garageButton(
            "brakes",
            "Freins"
        )}
        ${garageButton(
            "handling",
            "Tenue de route"
        )}
        ${garageButton(
            "gearbox",
            "Boîte"
        )}

        <button id="garageClose"
            style="
                width:100%;
                margin-top:15px;
                padding:12px;
                border:0;
                border-radius:9px;
                cursor:pointer;
            ">
            Fermer
        </button>
        `;

    document
        .getElementById(
            "garageClose"
        )
        .onclick = () => {
            state.showGarage =
                false;

            ui.garage.style.display =
                "none";
        };

    [
        "engine",
        "brakes",
        "handling",
        "gearbox"
    ].forEach(
        type => {
            const button =
                document.getElementById(
                    `upgrade-${type}`
                );

            if (
                button
            ) {
                button.onclick =
                    () =>
                        buyUpgrade(
                            type
                        );
            }
        }
    );
}

function garageButton(
    type,
    label
) {
    const level =
        garageData.upgrades[
            type
        ];

    const price =
        getUpgradePrice(
            type
        );

    return `
        <button id="upgrade-${type}"
            style="
                width:100%;
                display:flex;
                justify-content:space-between;
                margin:7px 0;
                padding:13px;
                border:0;
                border-radius:9px;
                cursor:pointer;
            ">
            <span>${label}</span>
            <span>
                Niveau ${level}
                ${
                    price === null
                        ? "MAX"
                        : `— €${price}`
                }
            </span>
        </button>
    `;
}

function openGarage() {
    state.showGarage =
        true;

    ui.garage.style.display =
        "block";

    updateGarageUI();
}

function createPauseMenu() {
    ui.menu.innerHTML =
        `
        <div style="font-size:30px;font-weight:800">
            ZENTRO
        </div>

        <div style="margin-top:8px;opacity:.7">
            ${VERSION}
        </div>

        <div style="margin-top:24px;line-height:1.8">
            <b>Commandes</b><br>
            ZQSD / WASD : déplacement<br>
            E : entrer / sortir<br>
            Shift : courir<br>
            Espace : frein à main<br>
            C : caméra<br>
            M : carte<br>
            G : garage<br>
            H : klaxon<br>
            L : phares<br>
            R : météo<br>
            F5 : sauvegarder<br>
            F9 : charger<br>
            Échap : pause
        </div>

        <button id="resumeButton"
            style="
                width:100%;
                margin-top:22px;
                padding:13px;
                border:0;
                border-radius:10px;
                cursor:pointer;
            ">
            Reprendre
        </button>
        `;

    document
        .getElementById(
            "resumeButton"
        )
        .onclick = () => {
            state.paused =
                false;

            ui.menu.style.display =
                "none";
        };
}

createPauseMenu();

function togglePause() {
    state.paused =
        !state.paused;

    ui.menu.style.display =
        state.paused
            ? "block"
            : "none";
}

function saveGame() {
    const data = {
        version:
            state.saveVersion,
        state: {
            mode:
                state.mode,
            cameraMode:
                state.cameraMode,
            money:
                state.money,
            fuel:
                activeCar.userData
                    .fuel,
            kilometers:
                state.kilometers,
            damage:
                activeCar.userData
                    .damage,
            weather:
                state.weather,
            time:
                state.time,
            currentCarIndex:
                state.currentCarIndex,
            carPosition: {
                x:
                    activeCar
                        .position
                        .x,
                y:
                    activeCar
                        .position
                        .y,
                z:
                    activeCar
                        .position
                        .z
            },
            carRotation:
                activeCar.rotation.y
        },
        upgrades:
            garageData.upgrades
    };

    localStorage.setItem(
        "zentro_xxl_save",
        JSON.stringify(data)
    );

    notify(
        "Partie sauvegardée."
    );
}

function loadGame() {
    const raw =
        localStorage.getItem(
            "zentro_xxl_save"
        );

    if (!raw) {
        notify(
            "Aucune sauvegarde."
        );
        return;
    }

    try {
        const data =
            JSON.parse(raw);

        if (
            data.state
        ) {
            state.money =
                data.state.money ??
                state.money;

            state.weather =
                data.state.weather ??
                state.weather;

            state.time =
                data.state.time ??
                state.time;

            state.kilometers =
                data.state
                    .kilometers ??
                0;

            state.currentCarIndex =
                data.state
                    .currentCarIndex ??
                0;

            if (
                data.state
                    .carPosition
            ) {
                activeCar.position.set(
                    data.state
                        .carPosition.x,
                    data.state
                        .carPosition.y,
                    data.state
                        .carPosition.z
                );
            }

            activeCar.rotation.y =
                data.state
                    .carRotation ??
                0;

            activeCar.userData.fuel =
                data.state.fuel ??
                CONFIG.fuelMax;

            activeCar.userData.damage =
                data.state.damage ??
                0;
        }

        if (
            data.upgrades
        ) {
            Object.assign(
                garageData.upgrades,
                data.upgrades
            );
        }

        applyUpgrades();

        notify(
            "Sauvegarde chargée."
        );
    } catch (
        error
    ) {
        console.error(
            error
        );

        notify(
            "Sauvegarde invalide."
        );
    }
}

function switchCar(
    index
) {
    if (
        !cars[index]
    ) {
        return;
    }

    const oldCar =
        activeCar;

    oldCar.visible =
        false;

    state.currentCarIndex =
        index;

    const next =
        cars[index];

    next.visible =
        true;

    next.position.copy(
        oldCar.position
    );

    next.rotation.copy(
        oldCar.rotation
    );

    next.userData.fuel =
        oldCar.userData.fuel;

    next.userData.damage =
        oldCar.userData.damage;

    applyUpgrades();

    notify(
        `Voiture sélectionnée : ${next.userData.name}`
    );
}

function updateTime(
    delta
) {
    state.time +=
        delta /
        CONFIG.dayLengthSeconds;

    if (
        state.time >= 1
    ) {
        state.time -= 1;
    }

    const angle =
        state.time *
        Math.PI *
        2;

    const sunHeight =
        Math.sin(angle);

    sunLight.position.set(
        Math.cos(angle) *
            250,
        Math.max(
            20,
            sunHeight * 300
        ),
        Math.sin(angle) *
            250
    );

    sunLight.intensity =
        THREE.MathUtils.clamp(
            0.35 +
                sunHeight *
                    1.9,
            0.05,
            2.4
        );

    moonLight.intensity =
        THREE.MathUtils.clamp(
            -sunHeight *
                0.7,
            0,
            0.7
        );

    ambientLight.intensity =
        THREE.MathUtils.clamp(
            0.55 +
                sunHeight *
                    0.65,
            0.18,
            1.3
        );

    const day =
        new THREE.Color(
            0x7ca7d8
        );

    const night =
        new THREE.Color(
            0x071020
        );

    const darkness =
        THREE.MathUtils.clamp(
            -sunHeight,
            0,
            1
        );

    scene.background.copy(
        day
    );

    scene.background.lerp(
        night,
        darkness * 0.85
    );

    scene.fog.color.copy(
        scene.background
    );

    activeCar.userData
        .headlights.forEach(
            light => {
                light.intensity =
                    state.lights
                        ? darkness >
                          0.25
                            ? 8
                            : 1.4
                        : 0;
            }
        );
}

const rainGroup =
    new THREE.Group();

scene.add(
    rainGroup
);

let rainParticles =
    null;

function createRain() {
    if (
        rainParticles
    ) {
        rainGroup.remove(
            rainParticles
        );

        rainParticles.geometry.dispose();
        rainParticles.material.dispose();
    }

    if (
        state.weather !==
        "rain"
    ) {
        rainParticles =
            null;

        return;
    }

    const count = 2600;

    const positions =
        new Float32Array(
            count * 3
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {
        positions[
            i * 3
        ] =
            -300 +
            Math.random() *
                600;

        positions[
            i * 3 + 1
        ] =
            Math.random() *
            180;

        positions[
            i * 3 + 2
        ] =
            -300 +
            Math.random() *
                600;
    }

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    const material =
        new THREE.PointsMaterial(
            {
                color: 0xa9c7e5,
                size: 0.12,
                transparent: true,
                opacity: 0.65
            }
        );

    rainParticles =
        new THREE.Points(
            geometry,
            material
        );

    rainGroup.add(
        rainParticles
    );
}

createRain();

function cycleWeather() {
    const weather =
        [
            "clear",
            "rain",
            "cloudy"
        ];

    const index =
        weather.indexOf(
            state.weather
        );

    state.weather =
        weather[
            (index + 1) %
                weather.length
        ];

    if (
        state.weather ===
        "clear"
    ) {
        scene.fog.near =
            180;
        scene.fog.far =
            CONFIG.maxDistance;
    }

    if (
        state.weather ===
        "cloudy"
    ) {
        scene.fog.near =
            120;
        scene.fog.far =
            430;
    }

    if (
        state.weather ===
        "rain"
    ) {
        scene.fog.near =
            90;
        scene.fog.far =
            380;
    }

    createRain();

    notify(
        `Météo : ${state.weather}`
    );
}

function updateRain(
    delta
) {
    if (
        !rainParticles
    ) {
        return;
    }

    const position =
        rainParticles
            .geometry
            .attributes
            .position;

    for (
        let i = 0;
        i <
        position.count;
        i++
    ) {
        let y =
            position.getY(
                i
            );

        y -=
            delta * 55;

        if (
            y < 0
        ) {
            y =
                170;
        }

        position.setY(
            i,
            y
        );
    }

    position.needsUpdate =
        true;

    rainParticles.position.x =
        activeCar.position.x;

    rainParticles.position.z =
        activeCar.position.z;
}

function getAxisInput() {
    let forward = 0;
    let steer = 0;

    if (
        input.keys[
            "z"
        ] ||
        input.keys[
            "w"
        ] ||
        input.keys[
            "ArrowUp"
        ]
    ) {
        forward += 1;
    }

    if (
        input.keys[
            "s"
        ] ||
        input.keys[
            "ArrowDown"
        ]
    ) {
        forward -= 1;
    }

    if (
        input.keys[
            "q"
        ] ||
        input.keys[
            "a"
        ] ||
        input.keys[
            "ArrowLeft"
        ]
    ) {
        steer -= 1;
    }

    if (
        input.keys[
            "d"
        ] ||
        input.keys[
            "ArrowRight"
        ]
    ) {
        steer += 1;
    }

    return {
        forward,
        steer
    };
}

function isKeyDown(
    key
) {
    return !!input.keys[
        key
    ];
}

function consumeKey(
    key
) {
    const value =
        !!input.pressed[
            key
        ];

    delete input.pressed[
        key
    ];

    return value;
}

window.addEventListener(
    "keydown",
    event => {
        if (
            !input.keys[
                event.key
            ]
        ) {
            input.pressed[
                event.key
            ] = true;
        }

        input.keys[
            event.key
        ] = true;

        if (
            event.key ===
            "Escape"
        ) {
            togglePause();
        }

        if (
            event.key ===
            "e"
        ) {
            toggleEnterExit();
        }

        if (
            event.key ===
            "c"
        ) {
            cycleCamera();
        }

        if (
            event.key ===
            "m"
        ) {
            state.showMap =
                !state.showMap;

            ui.minimap.style.display =
                state.showMap
                    ? "block"
                    : "none";
        }

        if (
            event.key ===
            "g"
        ) {
            if (
                state.mode ===
                "car"
            ) {
                openGarage();
            }
        }

        if (
            event.key ===
            "h"
        ) {
            horn();
        }

        if (
            event.key ===
            "l"
        ) {
            state.lights =
                !state.lights;
        }

        if (
            event.key ===
            "r"
        ) {
            cycleWeather();
        }

        if (
            event.key ===
            "F5"
        ) {
            event.preventDefault();
            saveGame();
        }

        if (
            event.key ===
            "F9"
        ) {
            event.preventDefault();
            loadGame();
        }

        if (
            event.key ===
            "f"
        ) {
            refuel();
        }
    }
);

window.addEventListener(
    "keyup",
    event => {
        input.keys[
            event.key
        ] = false;
    }
);

window.addEventListener(
    "blur",
    () => {
        input.keys = {};
    }
);

let cameraYaw = 0;
let cameraPitch =
    THREE.MathUtils.degToRad(
        12
    );

function cycleCamera() {
    const modes = [
        "chase",
        "close",
        "hood"
    ];

    const index =
        modes.indexOf(
            state.cameraMode
        );

    state.cameraMode =
        modes[
            (index + 1) %
                modes.length
        ];

    notify(
        `Caméra : ${state.cameraMode}`
    );
}

function horn() {
    if (
        !audio.started
    ) {
        audio.start();
    }

    audio.horn();
}

const audio = {
    context: null,
    master: null,
    engineOsc: null,
    engineGain: null,
    tireOsc: null,
    tireGain: null,
    started: false,

    start() {
        if (
            this.started
        ) {
            return;
        }

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (
            !AudioContext
        ) {
            return;
        }

        this.context =
            new AudioContext();

        this.master =
            this.context.createGain();

        this.master.gain.value =
            0.16;

        this.master.connect(
            this.context.destination
        );

        this.engineOsc =
            this.context.createOscillator();

        this.engineGain =
            this.context.createGain();

        this.engineOsc.type =
            "sawtooth";

        this.engineGain.gain.value =
            0;

        this.engineOsc.connect(
            this.engineGain
        );

        this.engineGain.connect(
            this.master
        );

        this.engineOsc.start();

        this.tireOsc =
            this.context.createOscillator();

        this.tireGain =
            this.context.createGain();

        this.tireOsc.type =
            "triangle";

        this.tireGain.gain.value =
            0;

        this.tireOsc.connect(
            this.tireGain
        );

        this.tireGain.connect(
            this.master
        );

        this.tireOsc.start();

        this.started = true;
    },

    update() {
        if (
            !this.started
        ) {
            return;
        }

        const speed =
            Math.abs(
                activeCar.userData
                    .speed
            );

        const rpm =
            activeCar.userData
                .rpm;

        this.engineOsc.frequency.value =
            50 +
            rpm *
                0.055;

        this.engineGain.gain.value =
            THREE.MathUtils.clamp(
                0.018 +
                    speed *
                        0.0014,
                0,
                0.08
            );

        this.tireOsc.frequency.value =
            90 +
            speed * 8;

        const slip =
            Math.abs(
                activeCar.userData
                    .steering
            ) *
            speed;

        this.tireGain.gain.value =
            THREE.MathUtils.clamp(
                slip *
                    0.0007,
                0,
                0.025
            );
    },

    horn() {
        if (
            !this.context
        ) {
            return;
        }

        const osc =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        osc.type =
            "square";

        osc.frequency.value =
            430;

        gain.gain.value =
            0.08;

        osc.connect(
            gain
        );

        gain.connect(
            this.master
        );

        osc.start();

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            this.context.currentTime +
                0.4
        );

        osc.stop(
            this.context.currentTime +
                0.4
        );
    }
};

function toggleEnterExit() {
    if (
        state.mode ===
        "car"
    ) {
        exitCar();
    } else {
        tryEnterCar();
    }
}

function tryEnterCar() {
    const distance =
        player.position.distanceTo(
            activeCar.position
        );

    if (
        distance > 6
    ) {
        notify(
            "Approche-toi de la voiture."
        );
        return;
    }

    state.mode =
        "car";

    player.visible =
        false;

    notify(
        "Tu es dans la voiture."
    );

    audio.start();
}

function exitCar() {
    state.mode =
        "character";

    player.visible =
        true;

    const offset =
        new THREE.Vector3(
            3.4,
            0,
            0
        );

    offset.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        activeCar.rotation.y
    );

    player.position.copy(
        activeCar.position
    );

    player.position.add(
        offset
    );

    notify(
        "Tu es sorti de la voiture."
    );
}

function updateCharacter(
    delta
) {
    const axis =
        getAxisInput();

    const speed =
        isKeyDown(
            "Shift"
        )
            ? CONFIG.playerRunSpeed
            : CONFIG.playerSpeed;

    const moving =
        Math.abs(
            axis.forward
        ) +
            Math.abs(
                axis.steer
            ) >
        0;

    if (
        moving
    ) {
        const direction =
            new THREE.Vector3(
                0,
                0,
                -axis.forward
            );

        direction.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            player.rotation.y
        );

        player.position.addScaledVector(
            direction,
            speed * delta
        );

        if (
            Math.abs(
                axis.steer
            ) > 0
        ) {
            player.rotation.y +=
                axis.steer *
                delta *
                2.5;
        }

        player.userData.walkTime +=
            delta *
            (isKeyDown(
                "Shift"
            )
                ? 11
                : 7);
    }

    const walk =
        moving
            ? Math.sin(
                  player.userData
                      .walkTime
              ) *
              0.5
            : 0;

    player.userData.legL.rotation.x =
        walk;

    player.userData.legR.rotation.x =
        -walk;

    player.userData.armL.rotation.x =
        -walk *
        0.7;

    player.userData.armR.rotation.x =
        walk *
        0.7;

    player.position.y =
        0;
}

function updateCar(
    delta
) {
    const car =
        activeCar;

    const axis =
        getAxisInput();

    const throttle =
        axis.forward;

    const steer =
        axis.steer;

    const handbrake =
        isKeyDown(
            " "
        );

    const speed =
        car.userData.speed;

    const forward =
        speed >= 0
            ? 1
            : -1;

    if (
        Math.abs(
            throttle
        ) > 0
    ) {
        const acceleration =
            car.userData.acceleration *
            throttle;

        car.userData.speed +=
            acceleration *
            delta;
    } else {
        car.userData.speed =
            THREE.MathUtils.damp(
                car.userData.speed,
                0,
                1.7,
                delta
            );
    }

    if (
        handbrake
    ) {
        car.userData.speed =
            THREE.MathUtils.damp(
                car.userData.speed,
                0,
                5,
                delta
            );
    }

    const maxForward =
        car.userData.maxSpeed;

    const maxReverse =
        CONFIG.carReverseSpeed;

    car.userData.speed =
        THREE.MathUtils.clamp(
            car.userData.speed,
            -maxReverse,
            maxForward
        );

    car.userData.steering =
        THREE.MathUtils.damp(
            car.userData.steering,
            steer,
            7,
            delta
        );

    const turnFactor =
        THREE.MathUtils.clamp(
            Math.abs(
                car.userData.speed
            ) /
                12,
            0,
            1
        );

    car.rotation.y -=
        car.userData.steering *
        car.userData.turn *
        turnFactor *
        delta *
        forward;

    car.translateZ(
        -car.userData.speed *
            delta
    );

    const wheelRotation =
        car.userData.speed *
        delta *
        1.8;

    car.userData.wheels.forEach(
        wheelData => {
            wheelData.wheel.rotation.y -=
                wheelRotation;

            if (
                wheelData.front
            ) {
                wheelData.steering.rotation.y =
                    car.userData.steering *
                    0.55;
            }
        }
    );

    const targetRpm =
        850 +
        Math.abs(
            car.userData.speed
        ) *
            110;

    car.userData.rpm =
        THREE.MathUtils.damp(
            car.userData.rpm,
            targetRpm,
            5,
            delta
        );

    if (
        state.weather ===
        "rain"
    ) {
        car.userData.speed *=
            1 -
            delta *
                0.15;
    }

    const distance =
        car.position.length();

    if (
        distance >
        CONFIG.worldSize /
            2
    ) {
        car.position.multiplyScalar(
            0.985
        );
    }

    const consumption =
        Math.abs(
            car.userData.speed
        ) *
        CONFIG.fuelConsumption *
        delta;

    car.userData.fuel =
        Math.max(
            0,
            car.userData.fuel -
                consumption
        );

    if (
        car.userData.fuel <=
        0
    ) {
        car.userData.speed =
            THREE.MathUtils.damp(
                car.userData.speed,
                0,
                4,
                delta
            );
    }

    state.speed =
        car.userData.speed;

    state.rpm =
        car.userData.rpm;

    state.fuel =
        car.userData.fuel;

    state.kilometers +=
        Math.abs(
            car.userData.speed
        ) *
        delta /
        1000;
}

function updateTraffic(
    delta
) {
    for (
        const car of
            trafficCars
    ) {
        const speed =
            car.userData.maxSpeed;

        car.translateZ(
            -speed *
                delta
        );

        const distance =
            car.position.distanceTo(
                activeCar.position
            );

        if (
            distance >
            CONFIG.trafficSpawnRadius
        ) {
            respawnTraffic(
                car
            );
        }

        if (
            Math.random() <
            0.002
        ) {
            car.rotation.y +=
                (Math.random() -
                    0.5) *
                0.2;
        }

        car.userData.wheels.forEach(
            wheel => {
                wheel.wheel.rotation.y -=
                    speed *
                    delta *
                    1.5;
            }
        );
    }
}

function respawnTraffic(
    car
) {
    const angle =
        Math.random() *
        Math.PI *
        2;

    const radius =
        220 +
        Math.random() *
            180;

    const x =
        activeCar.position.x +
        Math.cos(angle) *
            radius;

    const z =
        activeCar.position.z +
        Math.sin(angle) *
            radius;

    const horizontal =
        Math.abs(
            Math.sin(angle)
        ) >
        Math.abs(
            Math.cos(angle)
        );

    if (
        horizontal
    ) {
        car.position.set(
            x,
            0,
            Math.round(
                z /
                    CONFIG.roadSpacing
            ) *
                CONFIG.roadSpacing
        );

        car.rotation.y =
            Math.random() >
            0.5
                ? 0
                : Math.PI;
    } else {
        car.position.set(
            Math.round(
                x /
                    CONFIG.roadSpacing
            ) *
                CONFIG.roadSpacing,
            0,
            z
        );

        car.rotation.y =
            Math.random() >
            0.5
                ? Math.PI / 2
                : -Math.PI / 2;
    }
}

function updatePedestrians(
    delta
) {
    for (
        const pedestrian of
            pedestrianGroup
                .children
    ) {
        const data =
            pedestrian.userData;

        data.walkTime +=
            delta * 5;

        pedestrian.rotation.y =
            data.direction;

        pedestrian.translateZ(
            -data.speed *
                delta
        );

        pedestrian.position.y =
            Math.abs(
                Math.sin(
                    data.walkTime
                )
            ) *
            0.025;

        if (
            pedestrian.position.x <
                -320 ||
            pedestrian.position.x >
                320 ||
            pedestrian.position.z <
                -320 ||
            pedestrian.position.z >
                320
        ) {
            pedestrian.position.set(
                -240 +
                    Math.random() *
                        480,
                0,
                -240 +
                    Math.random() *
                        480
            );

            data.direction =
                Math.random() *
                Math.PI *
                2;
        }
    }
}

function updateCamera(
    delta
) {
    const target =
        state.mode ===
        "car"
            ? activeCar
            : player;

    if (
        state.mode ===
        "character"
    ) {
        const desired =
            new THREE.Vector3(
                0,
                4.8,
                7.5
            );

        desired.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            player.rotation.y
        );

        desired.add(
            player.position
        );

        camera.position.lerp(
            desired,
            1 -
                Math.pow(
                    0.001,
                    delta
                )
        );

        const look =
            player.position.clone();

        look.y += 1.5;

        camera.lookAt(
            look
        );

        return;
    }

    let distance =
        13;

    let height =
        5.5;

    if (
        state.cameraMode ===
        "close"
    ) {
        distance =
            8;
        height =
            3.6;
    }

    if (
        state.cameraMode ===
        "hood"
    ) {
        distance =
            3.5;
        height =
            2.5;
    }

    const offset =
        new THREE.Vector3(
            0,
            height,
            distance
        );

    offset.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        activeCar.rotation.y
    );

    const desired =
        activeCar.position.clone();

    desired.add(
        offset
    );

    camera.position.lerp(
        desired,
        1 -
            Math.pow(
                0.0008,
                delta
            )
    );

    const look =
        activeCar.position.clone();

    look.y +=
        state.cameraMode ===
        "hood"
            ? 1.7
            : 1.2;

    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    forward.applyQuaternion(
        activeCar.quaternion
    );

    look.addScaledVector(
        forward,
        5
    );

    camera.lookAt(
        look
    );
}

function updateVisibility() {
    const center =
        activeCar.position;

    buildingGroup.children.forEach(
        object => {
            const distance =
                object.position.distanceTo(
                    center
                );

            object.visible =
                distance <
                CONFIG.maxDistance;
        }
    );

    countrysideGroup.children.forEach(
        object => {
            const distance =
                object.position.distanceTo(
                    center
                );

            if (
                object !==
                    fuelStations[0] &&
                object !==
                    fuelStations[1] &&
                object !==
                    fuelStations[2]
            ) {
                object.visible =
                    distance <
                    CONFIG.maxDistance;
            }
        }
    );
}

let fpsFrames = 0;
let fpsTimer = 0;
let fpsValue = 0;

function updateFPS(
    delta
) {
    fpsFrames++;
    fpsTimer +=
        delta;

    if (
        fpsTimer >=
        0.5
    ) {
        fpsValue =
            Math.round(
                fpsFrames /
                    fpsTimer
            );

        fpsFrames = 0;
        fpsTimer = 0;

        ui.fps.textContent =
            `FPS ${fpsValue} • Draw calls ${renderer.info.render.calls} • Triangles ${renderer.info.render.triangles.toLocaleString()}`;
    }
}

function setQuality(
    quality
) {
    state.quality =
        quality;

    if (
        quality ===
        "low"
    ) {
        renderer.setPixelRatio(
            0.8
        );

        renderer.shadowMap.enabled =
            false;
    }

    if (
        quality ===
        "medium"
    ) {
        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio ||
                    1,
                1.25
            )
        );

        renderer.shadowMap.enabled =
            true;

        sunLight.shadow.mapSize.set(
            1024,
            1024
        );
    }

    if (
        quality ===
        "high"
    ) {
        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio ||
                    1,
                2
            )
        );

        renderer.shadowMap.enabled =
            true;

        sunLight.shadow.mapSize.set(
            2048,
            2048
        );
    }

    notify(
        `Qualité graphique : ${quality}`
    );
}

function createTouchControls() {
    if (
        !("ontouchstart" in
            window)
    ) {
        return;
    }

    const container =
        document.createElement(
            "div"
        );

    container.style.position =
        "fixed";

    container.style.left =
        "20px";

    container.style.bottom =
        "20px";

    container.style.width =
        "150px";

    container.style.height =
        "150px";

    container.style.borderRadius =
        "50%";

    container.style.background =
        "rgba(255,255,255,.12)";

    container.style.pointerEvents =
        "auto";

    document.body.appendChild(
        container
    );

    const knob =
        document.createElement(
            "div"
        );

    knob.style.position =
        "absolute";

    knob.style.left =
        "50%";

    knob.style.top =
        "50%";

    knob.style.width =
        "55px";

    knob.style.height =
        "55px";

    knob.style.transform =
        "translate(-50%,-50%)";

    knob.style.borderRadius =
        "50%";

    knob.style.background =
        "rgba(255,255,255,.45)";

    container.appendChild(
        knob
    );

    function updateTouch(
        event
    ) {
        const rect =
            container.getBoundingClientRect();

        const touch =
            event.touches[0];

        let x =
            touch.clientX -
            (rect.left +
                rect.width /
                    2);

        let y =
            touch.clientY -
            (rect.top +
                rect.height /
                    2);

        const max =
            rect.width /
            2 -
            30;

        const length =
            Math.sqrt(
                x * x +
                    y * y
            );

        if (
            length >
            max
        ) {
            x =
                (x /
                    length) *
                max;

            y =
                (y /
                    length) *
                max;
        }

        knob.style.left =
            `calc(50% + ${x}px)`;

        knob.style.top =
            `calc(50% + ${y}px)`;

        input.touch.active =
            true;

        input.touch.steer =
            THREE.MathUtils.clamp(
                x /
                    max,
                -1,
                1
            );

        input.touch.throttle =
            THREE.MathUtils.clamp(
                -y /
                    max,
                -1,
                1
            );
    }

    container.addEventListener(
        "touchstart",
        event => {
            updateTouch(
                event
            );
        },
        {
            passive: true
        }
    );

    container.addEventListener(
        "touchmove",
        event => {
            updateTouch(
                event
            );
        },
        {
            passive: true
        }
    );

    container.addEventListener(
        "touchend",
        () => {
            input.touch.active =
                false;

            input.touch.steer =
                0;

            input.touch.throttle =
                0;

            knob.style.left =
                "50%";

            knob.style.top =
                "50%";
        }
    );

    const actionButton =
        document.createElement(
            "button"
        );

    actionButton.textContent =
        "E";

    actionButton.style.position =
        "fixed";

    actionButton.style.right =
        "30px";

    actionButton.style.bottom =
        "120px";

    actionButton.style.width =
        "65px";

    actionButton.style.height =
        "65px";

    actionButton.style.border =
        "0";

    actionButton.style.borderRadius =
        "50%";

    actionButton.style.fontSize =
        "22px";

    actionButton.style.pointerEvents =
        "auto";

    document.body.appendChild(
        actionButton
    );

    actionButton.onclick =
        () =>
            toggleEnterExit();

    const brakeButton =
        document.createElement(
            "button"
        );

    brakeButton.textContent =
        "BRAKE";

    brakeButton.style.position =
        "fixed";

    brakeButton.style.right =
        "105px";

    brakeButton.style.bottom =
        "35px";

    brakeButton.style.width =
        "85px";

    brakeButton.style.height =
        "55px";

    brakeButton.style.border =
        "0";

    brakeButton.style.borderRadius =
        "14px";

    brakeButton.style.pointerEvents =
        "auto";

    document.body.appendChild(
        brakeButton
    );

    brakeButton.addEventListener(
        "touchstart",
        () => {
            input.keys[" "] =
                true;
        }
    );

    brakeButton.addEventListener(
        "touchend",
        () => {
            input.keys[" "] =
                false;
        }
    );
}

createTouchControls();

window.addEventListener(
    "pointerdown",
    event => {
        input.mouseDown =
            true;

        input.mouseX =
            event.clientX;

        input.mouseY =
            event.clientY;
    }
);

window.addEventListener(
    "pointerup",
    () => {
        input.mouseDown =
            false;
    }
);

window.addEventListener(
    "pointermove",
    event => {
        if (
            !input.mouseDown
        ) {
            return;
        }

        if (
            state.mode !==
            "car"
        ) {
            return;
        }

        const dx =
            event.clientX -
            input.mouseX;

        const dy =
            event.clientY -
            input.mouseY;

        input.mouseX =
            event.clientX;

        input.mouseY =
            event.clientY;

        cameraYaw -=
            dx * 0.004;

        cameraPitch -=
            dy * 0.002;

        cameraPitch =
            THREE.MathUtils.clamp(
                cameraPitch,
                -0.2,
                0.8
            );
    }
);

function updateGamepad() {
    const pads =
        navigator.getGamepads
            ? navigator.getGamepads()
            : [];

    const pad =
        pads &&
        pads[0];

    if (
        !pad
    ) {
        return;
    }

    const deadzone =
        0.12;

    let steer =
        pad.axes[0] || 0;

    let throttle =
        -(pad.axes[1] || 0);

    if (
        Math.abs(
            steer
        ) <
        deadzone
    ) {
        steer = 0;
    }

    if (
        Math.abs(
            throttle
        ) <
        deadzone
    ) {
        throttle = 0;
    }

    input.touch.steer =
        steer;

    input.touch.throttle =
        throttle;

    if (
        pad.buttons[0]?.pressed
    ) {
        input.keys.e = true;
    } else {
        input.keys.e = false;
    }

    if (
        pad.buttons[1]?.pressed
    ) {
        input.keys[" "] =
            true;
    } else {
        input.keys[" "] =
            false;
    }
}

function getCombinedCarInput() {
    const axis =
        getAxisInput();

    if (
        input.touch.active ||
        Math.abs(
            input.touch.steer
        ) >
            0.05 ||
        Math.abs(
            input.touch.throttle
        ) >
            0.05
    ) {
        return {
            forward:
                input.touch
                    .throttle,
            steer:
                input.touch
                    .steer
        };
    }

    return axis;
}

const originalGetAxisInput =
    getAxisInput;

function getVehicleInput() {
    const keyboard =
        originalGetAxisInput();

    if (
        Math.abs(
            input.touch
                .steer
        ) >
            0.05 ||
        Math.abs(
            input.touch
                .throttle
        ) >
            0.05
    ) {
        return {
            forward:
                input.touch
                    .throttle,
            steer:
                input.touch
                    .steer
        };
    }

    return keyboard;
}

function updateDriving(
    delta
) {
    const axis =
        getVehicleInput();

    const car =
        activeCar;

    const throttle =
        THREE.MathUtils.clamp(
            axis.forward,
            -1,
            1
        );

    const steer =
        THREE.MathUtils.clamp(
            axis.steer,
            -1,
            1
        );

    const handbrake =
        isKeyDown(
            " "
        );

    if (
        Math.abs(
            throttle
        ) >
        0.02
    ) {
        car.userData.speed +=
            car.userData.acceleration *
            throttle *
            delta;
    } else {
        car.userData.speed =
            THREE.MathUtils.damp(
                car.userData.speed,
                0,
                1.5,
                delta
            );
    }

    if (
        handbrake
    ) {
        car.userData.speed =
            THREE.MathUtils.damp(
                car.userData.speed,
                0,
                4.5,
                delta
            );
    }

    car.userData.speed =
        THREE.MathUtils.clamp(
            car.userData.speed,
            -CONFIG.carReverseSpeed,
            car.userData.maxSpeed
        );

    car.userData.steering =
        THREE.MathUtils.damp(
            car.userData.steering,
            steer,
            8,
            delta
        );

    const speedAbs =
        Math.abs(
            car.userData.speed
        );

    const direction =
        car.userData.speed >=
        0
            ? 1
            : -1;

    const turn =
        car.userData.turn *
        car.userData.steering *
        THREE.MathUtils.clamp(
            speedAbs /
                8,
            0,
            1
        ) *
        delta *
        direction;

    car.rotation.y -=
        turn;

    car.translateZ(
        -car.userData.speed *
            delta
    );

    car.userData.wheels.forEach(
        wheelData => {
            wheelData.wheel.rotation.y -=
                car.userData.speed *
                delta *
                1.9;

            if (
                wheelData.front
            ) {
                wheelData.steering.rotation.y =
                    car.userData.steering *
                    0.55;
            }
        }
    );

    car.userData.rpm =
        THREE.MathUtils.damp(
            car.userData.rpm,
            850 +
                speedAbs *
                    105,
            5,
            delta
        );

    car.userData.fuel =
        Math.max(
            0,
            car.userData.fuel -
                speedAbs *
                    0.0008 *
                    delta
        );

    state.kilometers +=
        speedAbs *
        delta /
        1000;
}

function createPhotoModeUI() {
    const photo =
        document.createElement(
            "div"
        );

    photo.style.position =
        "fixed";

    photo.style.left =
        "50%";

    photo.style.top =
        "15px";

    photo.style.transform =
        "translateX(-50%)";

    photo.style.padding =
        "10px 18px";

    photo.style.background =
        "rgba(0,0,0,.65)";

    photo.style.borderRadius =
        "10px";

    photo.style.color =
        "white";

    photo.style.display =
        "none";

    photo.style.pointerEvents =
        "none";

    photo.textContent =
        "MODE PHOTO — C pour changer la caméra — P pour quitter";

    document.body.appendChild(
        photo
    );

    return photo;
}

const photoUI =
    createPhotoModeUI();

window.addEventListener(
    "keydown",
    event => {
        if (
            event.key
                .toLowerCase() ===
            "p"
        ) {
            state.showPhotoMode =
                !state.showPhotoMode;

            photoUI.style.display =
                state.showPhotoMode
                    ? "block"
                    : "none";

            if (
                state.showPhotoMode
            ) {
                renderer.toneMappingExposure =
                    1.25;
            } else {
                renderer.toneMappingExposure =
                    1.05;
            }
        }
    }
);

function updatePhotoMode() {
    if (
        !state.showPhotoMode
    ) {
        return;
    }

    const car =
        activeCar;

    const offset =
        new THREE.Vector3(
            0,
            5.5,
            17
        );

    offset.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        car.rotation.y +
            cameraYaw
    );

    const desired =
        car.position.clone();

    desired.add(
        offset
    );

    camera.position.lerp(
        desired,
        0.06
    );

    const target =
        car.position.clone();

    target.y +=
        1.5;

    camera.lookAt(
        target
    );
}

function updateGame(
    delta
) {
    if (
        state.paused
    ) {
        return;
    }

    updateGamepad();

    if (
        state.mode ===
        "character"
    ) {
        updateCharacter(
            delta
        );
    } else {
        updateDriving(
            delta
        );
    }

    updateTraffic(
        delta
    );

    updatePedestrians(
        delta
    );

    updateMission(
        delta
    );

    updateTime(
        delta
    );

    updateRain(
        delta
    );

    updateCamera(
        delta
    );

    updatePhotoMode();

    updateVisibility();

    updateHUD();

    drawMinimap();

    audio.update();

    updateFPS(
        delta
    );

    const nearFuel =
        distanceToNearestFuelStation() <
        16;

    if (
        nearFuel &&
        state.mode ===
            "car"
    ) {
        ui.prompt.textContent =
            "F — Faire le plein";

        ui.prompt.style.display =
            "block";
    } else {
        const distance =
            player.position.distanceTo(
                activeCar.position
            );

        if (
            state.mode ===
                "character" &&
            distance <
                6
        ) {
            ui.prompt.textContent =
                "E — Entrer dans la voiture";

            ui.prompt.style.display =
                "block";
        } else {
            ui.prompt.style.display =
                "none";
        }
    }
}

function animate() {
    requestAnimationFrame(
        animate
    );

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    updateGame(
        delta
    );

    renderer.render(
        scene,
        camera
    );

    Object.keys(
        input.pressed
    ).forEach(
        key => {
            delete input.pressed[
                key
            ];
        }
    );
}

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
                window.devicePixelRatio ||
                    1,
                state.quality ===
                    "low"
                    ? 0.8
                    : state.quality ===
                        "medium"
                    ? 1.25
                    : 2
            )
        );
    }
);

applyUpgrades();

ui.minimap.style.display =
    "none";

notify(
    "Bienvenue dans ZENTRO XXL 🚗"
);

animate();
/* ============================================================
   ZENTRO XXL — PARTIE 2
   Systèmes supplémentaires : physique, effets, navigation,
   collisions, dégâts, économie, garage, météo et interface.
   ============================================================ */

const physics = {
    gravity: 9.81,
    friction: 0.985,
    rollingResistance: 0.42,
    airResistance: 0.0018,
    suspensionStrength: 18,
    suspensionDamping: 5,
    wheelBase: 5.5,
    trackWidth: 4
};

const vehicleEffects = {
    smoke: [],
    sparks: [],
    exhaust: [],
    skidMarks: []
};

function createSmokeParticle(
    position,
    velocity = new THREE.Vector3()
) {
    const geometry =
        new THREE.SphereGeometry(
            0.12 +
                Math.random() * 0.12,
            8,
            8
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x777777,
            transparent: true,
            opacity: 0.38,
            depthWrite: false
        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.copy(
        position
    );

    mesh.userData = {
        velocity:
            velocity.clone(),
        life: 0.7 +
            Math.random() * 0.7,
        maxLife:
            0.7 +
            Math.random() * 0.7,
        scale:
            0.8 +
            Math.random() * 1.2
    };

    effectsGroup.add(
        mesh
    );

    vehicleEffects.smoke.push(
        mesh
    );
}

function updateSmoke(delta) {
    for (
        let i =
            vehicleEffects
                .smoke.length -
            1;
        i >= 0;
        i--
    ) {
        const particle =
            vehicleEffects.smoke[
                i
            ];

        const data =
            particle.userData;

        data.life -=
            delta;

        particle.position.addScaledVector(
            data.velocity,
            delta
        );

        data.velocity.y +=
            0.6 * delta;

        const ratio =
            Math.max(
                0,
                data.life /
                    data.maxLife
            );

        particle.material.opacity =
            ratio * 0.38;

        particle.scale.setScalar(
            data.scale *
                (1 +
                    (1 -
                        ratio) *
                        2.2)
        );

        if (
            data.life <= 0
        ) {
            effectsGroup.remove(
                particle
            );

            particle.geometry.dispose();
            particle.material.dispose();

            vehicleEffects.smoke.splice(
                i,
                1
            );
        }
    }
}

function spawnTireSmoke() {
    if (
        state.mode !==
        "car"
    ) {
        return;
    }

    const car =
        activeCar;

    const speed =
        Math.abs(
            car.userData.speed
        );

    if (
        speed < 8
    ) {
        return;
    }

    const steering =
        Math.abs(
            car.userData
                .steering
        );

    const handbrake =
        isKeyDown(
            " "
        );

    if (
        steering < 0.25 &&
        !handbrake
    ) {
        return;
    }

    for (
        const wheelData of
            car.userData.wheels
    ) {
        const position =
            new THREE.Vector3();

        wheelData.tire.getWorldPosition(
            position
        );

        const velocity =
            new THREE.Vector3(
                0,
                0.8,
                0
            );

        velocity.x =
            (Math.random() -
                0.5) *
            0.7;

        velocity.z =
            (Math.random() -
                0.5) *
            0.7;

        spawnSmokeParticle(
            position,
            velocity
        );
    }
}

const collision = {
    radius: 2.7,
    buildingPadding: 1.5,
    treePadding: 1.8,
    trafficPadding: 2.8
};

function resolveWorldBounds() {
    const car =
        activeCar;

    const limit =
        CONFIG.worldSize /
        2 -
        12;

    car.position.x =
        THREE.MathUtils.clamp(
            car.position.x,
            -limit,
            limit
        );

    car.position.z =
        THREE.MathUtils.clamp(
            car.position.z,
            -limit,
            limit
        );
}

function distanceXZ(
    a,
    b
) {
    const dx =
        a.x - b.x;

    const dz =
        a.z - b.z;

    return Math.sqrt(
        dx * dx +
            dz * dz
    );
}

function checkBuildingCollision() {
    const car =
        activeCar;

    for (
        const building of
            buildingGroup
                .children
    ) {
        if (
            !building.visible
        ) {
            continue;
        }

        const distance =
            distanceXZ(
                car.position,
                building.position
            );

        if (
            distance <
            collision.radius +
                collision
                    .buildingPadding
        ) {
            const direction =
                car.position.clone()
                    .sub(
                        building.position
                    );

            direction.y = 0;

            if (
                direction.lengthSq() <
                0.001
            ) {
                direction.set(
                    1,
                    0,
                    0
                );
            }

            direction.normalize();

            car.position.addScaledVector(
                direction,
                0.12
            );

            car.userData.speed *=
                0.75;

            car.userData.damage =
                Math.min(
                    100,
                    car.userData
                        .damage +
                        Math.abs(
                            car.userData
                                .speed
                        ) *
                            0.004
                );
        }
    }
}

function checkTrafficCollision() {
    const car =
        activeCar;

    for (
        const other of
            trafficCars
    ) {
        const distance =
            distanceXZ(
                car.position,
                other.position
            );

        if (
            distance <
            collision
                .trafficPadding
        ) {
            const direction =
                car.position.clone()
                    .sub(
                        other.position
                    );

            direction.y = 0;

            if (
                direction.lengthSq() <
                0.001
            ) {
                direction.set(
                    1,
                    0,
                    0
                );
            }

            direction.normalize();

            car.position.addScaledVector(
                direction,
                0.2
            );

            car.userData.speed *=
                -0.25;

            car.userData.damage =
                Math.min(
                    100,
                    car.userData
                        .damage +
                        4
                );

            other.userData.speed *=
                0.8;
        }
    }
}

function updateDamage() {
    const damage =
        activeCar.userData
            .damage;

    if (
        damage < 15
    ) {
        return;
    }

    const ratio =
        damage / 100;

    activeCar.children.forEach(
        object => {
            if (
                object.isMesh &&
                object.material &&
                object.material.color
            ) {
                object.material.color
                    .multiplyScalar(
                        1 -
                            ratio *
                                0.08
                    );
            }
        }
    );
}

function repairCar() {
    if (
        state.mode !==
        "car"
    ) {
        return;
    }

    const distance =
        distanceToNearestGarage();

    if (
        distance > 18
    ) {
        notify(
            "Approche-toi du garage."
        );
        return;
    }

    const damage =
        activeCar.userData
            .damage;

    if (
        damage <= 0
    ) {
        notify(
            "La voiture est déjà en parfait état."
        );
        return;
    }

    const price =
        Math.ceil(
            damage * 12
        );

    if (
        state.money <
        price
    ) {
        notify(
            `Réparation : €${price}`
        );
        return;
    }

    state.money -=
        price;

    activeCar.userData.damage =
        0;

    notify(
        `Voiture réparée : -€${price}`
    );

    saveGame();
}

const garageLocations = [
    new THREE.Vector3(
        120,
        0,
        120
    ),
    new THREE.Vector3(
        -120,
        0,
        -120
    )
];

function createGarageBuilding(
    position
) {
    const garage =
        new THREE.Group();

    const building =
        box(
            24,
            8,
            18,
            mat(
                "garageBuilding",
                0x626a73
            ),
            0,
            4,
            0
        );

    garage.add(
        building
    );

    const door =
        box(
            12,
            6,
            0.3,
            materials.dark,
            0,
            3,
            9.15
        );

    garage.add(
        door
    );

    const sign =
        box(
            15,
            2.2,
            0.25,
            materials.red,
            0,
            8.2,
            9.1
        );

    garage.add(
        sign
    );

    garage.position.copy(
        position
    );

    garage.castShadow =
        true;

    countrysideGroup.add(
        garage
    );
}

garageLocations.forEach(
    createGarageBuilding
);

function distanceToNearestGarage() {
    let closest =
        Infinity;

    for (
        const position of
            garageLocations
    ) {
        closest =
            Math.min(
                closest,
                activeCar.position.distanceTo(
                    position
                )
            );
    }

    return closest;
}

function createNavigationArrow() {
    const group =
        new THREE.Group();

    const arrow =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.65,
                2.1,
                4
            ),
            new THREE.MeshStandardMaterial(
                {
                    color: 0xffd60a,
                    emissive: 0xffaa00,
                    emissiveIntensity: 1.5
                }
            )
        );

    arrow.rotation.x =
        -Math.PI / 2;

    arrow.position.y =
        0.3;

    group.add(
        arrow
    );

    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                1.6,
                0.12,
                8,
                24
            ),
            new THREE.MeshStandardMaterial(
                {
                    color: 0xffd60a,
                    emissive: 0xffaa00,
                    emissiveIntensity: 1
                }
            )
        );

    ring.rotation.x =
        Math.PI / 2;

    group.add(
        ring
    );

    group.visible =
        false;

    scene.add(
        group
    );

    return group;
}

const navigationArrow =
    createNavigationArrow();

function updateNavigation() {
    if (
        !state.mission
    ) {
        navigationArrow.visible =
            false;

        return;
    }

    navigationArrow.visible =
        true;

    const target =
        state.mission
            .target;

    navigationArrow.position.copy(
        activeCar.position
    );

    navigationArrow.position.y =
        0.15;

    const direction =
        target.clone()
            .sub(
                activeCar.position
            );

    direction.y = 0;

    if (
        direction.lengthSq() >
        0.001
    ) {
        navigationArrow.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );
    }

    navigationArrow.position.y =
        0.5 +
        Math.sin(
            performance.now() *
                0.004
        ) *
            0.15;
}

function createMissionBoard() {
    const board =
        new THREE.Group();

    const panel =
        box(
            5,
            3,
            0.3,
            materials.dark,
            0,
            1.8,
            0
        );

    board.add(
        panel
    );

    const top =
        box(
            5.2,
            0.35,
            0.4,
            materials.red,
            0,
            3.45,
            0
        );

    board.add(
        top
    );

    const marker =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                1.1,
                20
            ),
            new THREE.MeshBasicMaterial(
                {
                    color: 0xffd60a
                }
            )
        );

    marker.position.set(
        0,
        2,
        -0.18
    );

    board.add(
        marker
    );

    board.position.set(
        -65,
        0,
        65
    );

    scene.add(
        board
    );

    return board;
}

const missionBoard =
    createMissionBoard();

function startNearestMission() {
    const distance =
        activeCar.position.distanceTo(
            missionBoard.position
        );

    if (
        distance > 12
    ) {
        notify(
            "Approche-toi du tableau de missions."
        );
        return;
    }

    const available =
        missionDefinitions[
            Math.floor(
                Math.random() *
                    missionDefinitions.length
            )
        ];

    startMission(
        available
    );
}

window.addEventListener(
    "keydown",
    event => {
        if (
            event.key
                .toLowerCase() ===
            "n"
        ) {
            startNearestMission();
        }

        if (
            event.key
                .toLowerCase() ===
            "repair"
        ) {
            repairCar();
        }
    }
);

function updateGaragePrompt() {
    if (
        state.mode !==
        "car"
    ) {
        return;
    }

    const distance =
        distanceToNearestGarage();

    if (
        distance < 18
    ) {
        ui.prompt.textContent =
            "G — Garage / F — Réparer";

        ui.prompt.style.display =
            "block";
    }
}

window.addEventListener(
    "keydown",
    event => {
        if (
            event.key
                .toLowerCase() ===
            "f"
        ) {
            if (
                distanceToNearestFuelStation() <
                16
            ) {
                refuel();
            }
        }

        if (
            event.key
                .toLowerCase() ===
            "g"
        ) {
            if (
                distanceToNearestGarage() <
                18
            ) {
                openGarage();
            }
        }
    }
);

function createSpeedLines() {
    const group =
        new THREE.Group();

    const material =
        new THREE.LineBasicMaterial(
            {
                color: 0xffffff,
                transparent: true,
                opacity: 0
            }
        );

    for (
        let i = 0;
        i < 80;
        i++
    ) {
        const points = [
            new THREE.Vector3(
                (Math.random() -
                    0.5) *
                    18,
                (Math.random() -
                    0.5) *
                    9,
                -4
            ),
            new THREE.Vector3(
                (Math.random() -
                    0.5) *
                    28,
                (Math.random() -
                    0.5) *
                    12,
                -16 -
                    Math.random() *
                        25
            )
        ];

        const geometry =
            new THREE.BufferGeometry().setFromPoints(
                points
            );

        const line =
            new THREE.Line(
                geometry,
                material.clone()
            );

        group.add(
            line
        );
    }

    camera.add(
        group
    );

    return group;
}

const speedLines =
    createSpeedLines();

function updateSpeedLines() {
    const speed =
        Math.abs(
            activeCar.userData.speed
        );

    const intensity =
        THREE.MathUtils.clamp(
            (speed - 35) /
                30,
            0,
            1
        );

    speedLines.children.forEach(
        line => {
            line.material.opacity =
                intensity *
                0.22;
        }
    );
}

function createHeadlightGlow() {
    const glowGroup =
        new THREE.Group();

    for (
        const x of [-1.5, 1.5]
    ) {
        const glow =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    0.5,
                    20
                ),
                new THREE.MeshBasicMaterial(
                    {
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.7,
                        depthWrite: false
                    }
                )
            );

        glow.position.set(
            x,
            1.55,
            -4.34
        );

        glow.rotation.y =
            Math.PI;

        glowGroup.add(
            glow
        );
    }

    activeCar.add(
        glowGroup
    );

    return glowGroup;
}

const headlightGlow =
    createHeadlightGlow();

function updateHeadlightGlow() {
    headlightGlow.visible =
        state.lights;
}

const weatherClouds =
    new THREE.Group();

scene.add(
    weatherClouds
);

function createClouds() {
    weatherClouds.clear();

    for (
        let i = 0;
        i < 25;
        i++
    ) {
        const cloud =
            new THREE.Group();

        const material =
            new THREE.MeshStandardMaterial(
                {
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5,
                    depthWrite: false
                }
            );

        for (
            let j = 0;
            j < 4;
            j++
        ) {
            const sphere =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        7 +
                            Math.random() *
                                5,
                        12,
                        8
                    ),
                    material
                );

            sphere.position.set(
                j * 7,
                Math.random() *
                    2,
                Math.random() *
                    5
            );

            cloud.add(
                sphere
            );
        }

        cloud.position.set(
            -450 +
                Math.random() *
                    900,
            120 +
                Math.random() *
                    60,
            -450 +
                Math.random() *
                    900
        );

        cloud.scale.set(
            1.2,
            0.6,
            1
        );

        weatherClouds.add(
            cloud
        );
    }
}

createClouds();

function updateClouds(
    delta
) {
    const visible =
        state.weather ===
        "cloudy" ||
        state.weather ===
        "rain";

    weatherClouds.visible =
        visible;

    if (
        !visible
    ) {
        return;
    }

    weatherClouds.children.forEach(
        cloud => {
            cloud.position.x +=
                delta * 2.5;

            if (
                cloud.position.x >
                500
            ) {
                cloud.position.x =
                    -500;
            }
        }
    );
}

function createWaterAnimation() {
    const waterMaterial =
        materials.water;

    waterMaterial.onBeforeCompile =
        shader => {
            shader.uniforms.time =
                {
                    value: 0
                };

            waterMaterial.userData.shader =
                shader;
        };
}

createWaterAnimation();

function updateWater(
    delta
) {
    const shader =
        materials.water
            .userData
            .shader;

    if (
        shader
    ) {
        shader.uniforms.time.value +=
            delta;
    }
}

function createStreetLamps() {
    const lampGroup =
        new THREE.Group();

    const lampMaterial =
        materials.chrome;

    const lightMaterial =
        new THREE.MeshStandardMaterial(
            {
                color: 0xffffdd,
                emissive: 0xffffaa,
                emissiveIntensity: 2
            }
        );

    for (
        let x = -220;
        x <= 220;
        x += 30
    ) {
        for (
            let z = -220;
            z <= 220;
            z += 30
        ) {
            if (
                Math.abs(
                    x
                ) <
                    8 ||
                Math.abs(
                    z
                ) <
                    8
            ) {
                continue;
            }

            const pole =
                cylinder(
                    0.08,
                    0.12,
                    6,
                    lampMaterial,
                    x + 7,
                    3,
                    z + 7,
                    8
                );

            lampGroup.add(
                pole
            );

            const arm =
                box(
                    2.1,
                    0.08,
                    0.08,
                    lampMaterial,
                    x + 8,
                    6,
                    z + 7
                );

            lampGroup.add(
                arm
            );

            const bulb =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.18,
                        8,
                        8
                    ),
                    lightMaterial
                );

            bulb.position.set(
                x + 9,
                5.85,
                z + 7
            );

            lampGroup.add(
                bulb
            );
        }
    }

    cityGroup.add(
        lampGroup
    );

    return lampGroup;
}

const streetLamps =
    createStreetLamps();

function updateStreetLamps() {
    const night =
        state.time >
            0.72 ||
        state.time <
            0.23;

    streetLamps.traverse(
        object => {
            if (
                object.isMesh &&
                object.material &&
                object.material.emissive
            ) {
                object.material.emissiveIntensity =
                    night
                        ? 2
                        : 0.2;
            }
        }
    );
}

function createAmbientBirds() {
    const birds =
        new THREE.Group();

    const birdMaterial =
        new THREE.MeshBasicMaterial(
            {
                color: 0x222222
            }
        );

    for (
        let i = 0;
        i < 18;
        i++
    ) {
        const bird =
            new THREE.Group();

        const wingL =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.4,
                    0.05,
                    0.25
                ),
                birdMaterial
            );

        const wingR =
            wingL.clone();

        wingL.position.x =
            -0.7;

        wingR.position.x =
            0.7;

        wingL.rotation.z =
            0.15;

        wingR.rotation.z =
            -0.15;

        bird.add(
            wingL
        );

        bird.add(
            wingR
        );

        bird.position.set(
            -250 +
                Math.random() *
                    500,
            50 +
                Math.random() *
                    50,
            -250 +
                Math.random() *
                    500
        );

        bird.userData = {
            speed:
                3 +
                Math.random() *
                    4,
            phase:
                Math.random() *
                Math.PI *
                2
        };

        birds.add(
            bird
        );
    }

    scene.add(
        birds
    );

    return birds;
}

const birds =
    createAmbientBirds();

function updateBirds(
    delta
) {
    birds.children.forEach(
        bird => {
            bird.position.x +=
                bird.userData
                    .speed *
                delta;

            bird.position.z +=
                Math.sin(
                    performance.now() *
                        0.001 +
                        bird.userData
                            .phase
                ) *
                delta;

            bird.rotation.y =
                0.25;

            if (
                bird.position.x >
                300
            ) {
                bird.position.x =
                    -300;
            }

            const flap =
                Math.sin(
                    performance.now() *
                        0.012 +
                        bird.userData
                            .phase
                ) *
                0.35;

            if (
                bird.children[0]
            ) {
                bird.children[0]
                    .rotation.y =
                    flap;
            }

            if (
                bird.children[1]
            ) {
                bird.children[1]
                    .rotation.y =
                    -flap;
            }
        }
    );
}

function createTreeCollisionCache() {
    const trees =
        [];

    const object =
        vegetationGroup.children.find(
            child =>
                child.isInstancedMesh
        );

    if (
        !object
    ) {
        return trees;
    }

    const dummy =
        new THREE.Object3D();

    for (
        let i = 0;
        i <
        object.count;
        i++
    ) {
        object.getMatrixAt(
            i,
            dummy.matrix
        );

        dummy.matrix.decompose(
            dummy.position,
            dummy.quaternion,
            dummy.scale
        );

        trees.push(
            dummy.position.clone()
        );
    }

    return trees;
}

const treeCollisionCache =
    createTreeCollisionCache();

function checkTreeCollision() {
    const car =
        activeCar;

    for (
        const treePosition of
            treeCollisionCache
    ) {
        if (
            Math.abs(
                treePosition.x -
                    car.position.x
            ) >
            8
        ) {
            continue;
        }

        if (
            Math.abs(
                treePosition.z -
                    car.position.z
            ) >
            8
        ) {
            continue;
        }

        const distance =
            distanceXZ(
                car.position,
                treePosition
            );

        if (
            distance <
            collision.treePadding
        ) {
            const direction =
                car.position.clone()
                    .sub(
                        treePosition
                    );

            direction.y = 0;

            if (
                direction.lengthSq() <
                0.001
            ) {
                direction.set(
                    1,
                    0,
                    0
                );
            }

            direction.normalize();

            car.position.addScaledVector(
                direction,
                0.12
            );

            car.userData.speed *=
                0.65;

            car.userData.damage =
                Math.min(
                    100,
                    car.userData
                        .damage +
                        1.5
                );
        }
    }
}

function updateVehiclePhysics(
    delta
) {
    const car =
        activeCar;

    const speed =
        Math.abs(
            car.userData.speed
        );

    const drag =
        physics.airResistance *
        speed *
        speed;

    if (
        car.userData.speed >
        0
    ) {
        car.userData.speed -=
            drag * delta;
    } else if (
        car.userData.speed <
        0
    ) {
        car.userData.speed +=
            drag * delta;
    }

    if (
        Math.abs(
            car.userData.speed
        ) <
        0.15
    ) {
        car.userData.speed =
            0;
    }

    car.position.y =
        Math.sin(
            performance.now() *
                0.004 +
                car.position.x *
                    0.02
        ) *
        0.025;

    const suspension =
        Math.sin(
            performance.now() *
                0.012
        ) *
        Math.min(
            speed /
                40,
            1
        ) *
        0.025;

    car.rotation.z =
        THREE.MathUtils.damp(
            car.rotation.z,
            -car.userData
                .steering *
                speed /
                80,
            4,
            delta
        );

    car.rotation.x =
        THREE.MathUtils.damp(
            car.rotation.x,
            suspension,
            4,
            delta
        );
}

function updateVehicleSystems(
    delta
) {
    updateVehiclePhysics(
        delta
    );

    checkBuildingCollision();
    checkTrafficCollision();
    checkTreeCollision();

    resolveWorldBounds();

    updateDamage();

    spawnTireSmoke();

    updateSmoke(
        delta
    );

    updateSpeedLines();

    updateHeadlightGlow();
}

function createSkidMark(
    position,
    rotation
) {
    const geometry =
        new THREE.PlaneGeometry(
            0.32,
            1.2
        );

    const material =
        new THREE.MeshBasicMaterial(
            {
                color: 0x151515,
                transparent: true,
                opacity: 0.3,
                depthWrite: false
            }
        );

    const mark =
        new THREE.Mesh(
            geometry,
            material
        );

    mark.rotation.x =
        -Math.PI / 2;

    mark.rotation.y =
        rotation;

    mark.position.copy(
        position
    );

    mark.position.y =
        0.055;

    roadGroup.add(
        mark
    );

    vehicleEffects.skidMarks.push(
        {
            mesh: mark,
            life: 8
        }
    );
}

function updateSkidMarks(
    delta
) {
    const car =
        activeCar;

    const speed =
        Math.abs(
            car.userData.speed
        );

    if (
        speed > 12 &&
        Math.abs(
            car.userData
                .steering
        ) > 0.45
    ) {
        for (
            const wheelData of
                car.userData.wheels
        ) {
            const position =
                new THREE.Vector3();

            wheelData.tire.getWorldPosition(
                position
            );

            createSkidMark(
                position,
                car.rotation.y
            );
        }
    }

    for (
        let i =
            vehicleEffects
                .skidMarks.length -
            1;
        i >= 0;
        i--
    ) {
        const mark =
            vehicleEffects
                .skidMarks[i];

        mark.life -=
            delta;

        mark.mesh.material.opacity =
            THREE.MathUtils.clamp(
                mark.life /
                    8 *
                    0.3,
                0,
                0.3
            );

        if (
            mark.life <= 0
        ) {
            roadGroup.remove(
                mark.mesh
            );

            mark.mesh.geometry.dispose();
            mark.mesh.material.dispose();

            vehicleEffects.skidMarks.splice(
                i,
                1
            );
        }
    }
}

function createDeliveryVan() {
    const van =
        createCar({
            name: "Zentro Delivery",
            color: 0xf0f0e8,
            maxSpeed: 46,
            acceleration: 18,
            braking: 34,
            turn: 1.4,
            value: 18000
        });

    van.scale.set(
        1.08,
        1.15,
        1.05
    );

    const logo =
        box(
            2.2,
            1,
            0.05,
            materials.red,
            0,
            1.8,
            -4.12
        );

    van.add(
        logo
    );

    return van;
}

const deliveryVan =
    createDeliveryVan();

deliveryVan.visible =
    false;

scene.add(
    deliveryVan
);

function createSportsCar() {
    const sports =
        createCar({
            name: "Zentro Hyper",
            color: 0xe6e6e6,
            maxSpeed: 92,
            acceleration: 44,
            braking: 56,
            turn: 2.35,
            value: 125000
        });

    sports.scale.set(
        0.94,
        0.86,
        1.03
    );

    return sports;
}

const sportsCar =
    createSportsCar();

sportsCar.visible =
    false;

scene.add(
    sportsCar
);

const vehicleCatalog = [
    {
        id: "zentro_gt",
        name: "Zentro GT",
        price: 25000,
        object: cars[0]
    },
    {
        id: "zentro_rs",
        name: "Zentro RS",
        price: 42000,
        object: cars[1]
    },
    {
        id: "zentro_sport",
        name: "Zentro Sport",
        price: 68000,
        object: cars[2]
    },
    {
        id: "zentro_delivery",
        name: "Zentro Delivery",
        price: 18000,
        object: deliveryVan
    },
    {
        id: "zentro_hyper",
        name: "Zentro Hyper",
        price: 125000,
        object: sportsCar
    }
];

const ownedVehicles = {
    zentro_gt: true,
    zentro_rs: false,
    zentro_sport: false,
    zentro_delivery: false,
    zentro_hyper: false
};

function purchaseVehicle(
    id
) {
    const vehicle =
        vehicleCatalog.find(
            item =>
                item.id ===
                id
        );

    if (
        !vehicle
    ) {
        return;
    }

    if (
        ownedVehicles[id]
    ) {
        notify(
            "Cette voiture est déjà dans ton garage."
        );
        return;
    }

    if (
        state.money <
        vehicle.price
    ) {
        notify(
            "Pas assez d'argent pour acheter cette voiture."
        );
        return;
    }

    state.money -=
        vehicle.price;

    ownedVehicles[id] =
        true;

    notify(
        `${vehicle.name} achetée !`
    );

    saveGame();
}

function selectVehicle(
    id
) {
    const vehicle =
        vehicleCatalog.find(
            item =>
                item.id ===
                id
        );

    if (
        !vehicle ||
        !ownedVehicles[id]
    ) {
        return;
    }

    cars.forEach(
        car => {
            car.visible =
                false;
        }
    );

    deliveryVan.visible =
        false;

    sportsCar.visible =
        false;

    vehicle.object.visible =
        true;

    const source =
        activeCar;

    vehicle.object.position.copy(
        source.position
    );

    vehicle.object.rotation.copy(
        source.rotation
    );

    state.currentCarIndex =
        cars.indexOf(
            vehicle.object
        );

    notify(
        `Voiture active : ${vehicle.name}`
    );
}

function buildVehicleMenu() {
    ui.garage.innerHTML =
        `
        <div style="
            font-size:28px;
            font-weight:800;
            margin-bottom:4px;
        ">
            GARAGE ZENTRO
        </div>

        <div style="
            opacity:.65;
            margin-bottom:18px;
        ">
            Véhicules disponibles
        </div>
        `;

    vehicleCatalog.forEach(
        vehicle => {
            const row =
                document.createElement(
                    "div"
                );

            row.style.display =
                "flex";

            row.style.justifyContent =
                "space-between";

            row.style.alignItems =
                "center";

            row.style.padding =
                "10px";

            row.style.margin =
                "5px 0";

            row.style.background =
                "rgba(255,255,255,.07)";

            row.style.borderRadius =
                "9px";

            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                `${vehicle.name} — €${vehicle.price.toLocaleString("fr-FR")}`;

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                ownedVehicles[
                    vehicle.id
                ]
                    ? "Choisir"
                    : "Acheter";

            button.style.padding =
                "8px 12px";

            button.style.border =
                "0";

            button.style.borderRadius =
                "7px";

            button.style.cursor =
                "pointer";

            button.onclick = () => {
                if (
                    ownedVehicles[
                        vehicle.id
                    ]
                ) {
                    selectVehicle(
                        vehicle.id
                    );
                } else {
                    purchaseVehicle(
                        vehicle.id
                    );
                }

                buildVehicleMenu();
            };

            row.appendChild(
                label
            );

            row.appendChild(
                button
            );

            ui.garage.appendChild(
                row
            );
        }
    );

    const separator =
        document.createElement(
            "div"
        );

    separator.style.marginTop =
        "18px";

    ui.garage.appendChild(
        separator
    );

    const upgradeTitle =
        document.createElement(
            "div"
        );

    upgradeTitle.textContent =
        "Améliorations";

    upgradeTitle.style.fontSize =
        "20px";

    upgradeTitle.style.fontWeight =
        "700";

    upgradeTitle.style.marginBottom =
        "10px";

    ui.garage.appendChild(
        upgradeTitle
    );

    [
        ["engine", "Moteur"],
        ["brakes", "Freins"],
        [
            "handling",
            "Tenue de route"
        ],
        ["gearbox", "Boîte"]
    ].forEach(
        ([type, label]) => {
            const button =
                document.createElement(
                    "button"
                );

            const price =
                getUpgradePrice(
                    type
                );

            button.textContent =
                price === null
                    ? `${label} — MAX`
                    : `${label} — Niveau ${
                          garageData
                              .upgrades[
                              type
                          ]
                      } — €${price}`;

            button.style.display =
                "block";

            button.style.width =
                "100%";

            button.style.padding =
                "10px";

            button.style.margin =
                "5px 0";

            button.style.border =
                "0";

            button.style.borderRadius =
                "8px";

            button.style.cursor =
                "pointer";

            button.onclick = () => {
                buyUpgrade(
                    type
                );

                buildVehicleMenu();
            };

            ui.garage.appendChild(
                button
            );
        }
    );

    const repair =
        document.createElement(
            "button"
        );

    repair.textContent =
        "Réparer la voiture";

    repair.style.display =
        "block";

    repair.style.width =
        "100%";

    repair.style.padding =
        "10px";

    repair.style.marginTop =
        "12px";

    repair.style.border =
        "0";

    repair.style.borderRadius =
        "8px";

    repair.onclick =
        () => {
            repairCar();
            buildVehicleMenu();
        };

    ui.garage.appendChild(
        repair
    );

    const close =
        document.createElement(
            "button"
        );

    close.textContent =
        "Fermer";

    close.style.display =
        "block";

    close.style.width =
        "100%";

    close.style.padding =
        "11px";

    close.style.marginTop =
        "10px";

    close.style.border =
        "0";

    close.style.borderRadius =
        "8px";

    close.onclick =
        () => {
            state.showGarage =
                false;

            ui.garage.style.display =
                "none";
        };

    ui.garage.appendChild(
        close
    );
}

function openFullGarage() {
    state.showGarage =
        true;

    ui.garage.style.display =
        "block";

    buildVehicleMenu();
}

function createGarageMarker() {
    garageLocations.forEach(
        position => {
            const marker =
                new THREE.Mesh(
                    new THREE.RingGeometry(
                        5,
                        5.4,
                        32
                    ),
                    new THREE.MeshBasicMaterial(
                        {
                            color: 0x00e5ff,
                            transparent: true,
                            opacity: 0.7,
                            side: THREE.DoubleSide
                        }
                    )
                );

            marker.rotation.x =
                -Math.PI / 2;

            marker.position.copy(
                position
            );

            marker.position.y =
                0.12;

            effectsGroup.add(
                marker
            );
        }
    );
}

createGarageMarker();

function updateGarageMarkers() {
    effectsGroup.children.forEach(
        object => {
            if (
                object.geometry &&
                object.geometry.type ===
                    "RingGeometry"
            ) {
                object.rotation.z +=
                    0.3 *
                    clock.getDelta();
            }
        }
    );
}

function createMissionCheckpoints() {
    const checkpoints =
        [];

    for (
        let i = 0;
        i < 6;
        i++
    ) {
        const marker =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    4,
                    0.35,
                    10,
                    24
                ),
                new THREE.MeshBasicMaterial(
                    {
                        color: 0x00e5ff,
                        transparent: true,
                        opacity: 0.5
                    }
                )
            );

        marker.rotation.x =
            Math.PI / 2;

        marker.visible =
            false;

        scene.add(
            marker
        );

        checkpoints.push(
            marker
        );
    }

    return checkpoints;
}

const missionCheckpoints =
    createMissionCheckpoints();

function generateRaceCourse() {
    const points = [];

    const center =
        activeCar.position.clone();

    for (
        let i = 0;
        i < 6;
        i++
    ) {
        const angle =
            (i / 6) *
                Math.PI *
                2 +
            Math.random() *
                0.3;

        const radius =
            80 +
            Math.random() *
                130;

        points.push(
            new THREE.Vector3(
                center.x +
                    Math.cos(
                        angle
                    ) *
                        radius,
                0.2,
                center.z +
                    Math.sin(
                        angle
                    ) *
                        radius
            )
        );
    }

    missionCheckpoints.forEach(
        (
            checkpoint,
            index
        ) => {
            if (
                points[index]
            ) {
                checkpoint.position.copy(
                    points[index]
                );

                checkpoint.visible =
                    true;
            }
        }
    );

    return points;
}

let raceCourse =
    [];

let raceActive =
    false;

let raceCheckpoint =
    0;

let raceStartTime =
    0;

function startRace() {
    if (
        state.mode !==
        "car"
    ) {
        notify(
            "Monte dans une voiture pour commencer une course."
        );

        return;
    }

    raceCourse =
        generateRaceCourse();

    raceCheckpoint =
        0;

    raceActive =
        true;

    raceStartTime =
        performance.now();

    notify(
        "Course lancée ! Passe tous les checkpoints."
    );
}

function updateRace() {
    if (
        !raceActive
    ) {
        return;
    }

    const target =
        raceCourse[
            raceCheckpoint
        ];

    if (
        !target
    ) {
        finishRace();
        return;
    }

    const distance =
        activeCar.position.distanceTo(
            target
        );

    if (
        distance <
        8
    ) {
        raceCheckpoint++;

        notify(
            `Checkpoint ${raceCheckpoint}/${
                raceCourse.length
            }`
        );

        if (
            raceCheckpoint >=
            raceCourse.length
        ) {
            finishRace();
        }
    }
}

function finishRace() {
    if (
        !raceActive
    ) {
        return;
    }

    raceActive =
        false;

    missionCheckpoints.forEach(
        checkpoint => {
            checkpoint.visible =
                false;
        }
    );

    const elapsed =
        (performance.now() -
            raceStartTime) /
        1000;

    const reward =
        Math.max(
            500,
            Math.round(
                3500 -
                    elapsed *
                        8
            )
        );

    state.money +=
        reward;

    notify(
        `Course terminée en ${elapsed.toFixed(
            1
        )} s — +€${reward}`
    );

    saveGame();
}

window.addEventListener(
    "keydown",
    event => {
        const key =
            event.key.toLowerCase();

        if (
            key === "k"
        ) {
            startRace();
        }
    }
);

function updateRaceUI() {
    if (
        raceActive
    ) {
        ui.mission.innerHTML =
            `<b>🏁 COURSE</b><br>Checkpoint ${
                raceCheckpoint
            } / ${
                raceCourse.length
            }`;
    }
}

function createWeatherLighting() {
    const stormLight =
        new THREE.DirectionalLight(
            0x8aa8c4,
            0
        );

    stormLight.position.set(
        -100,
        250,
        -100
    );

    scene.add(
        stormLight
    );

    return stormLight;
}

const stormLight =
    createWeatherLighting();

function updateWeatherLighting() {
    if (
        state.weather ===
        "rain"
    ) {
        stormLight.intensity =
            0.65;
    } else if (
        state.weather ===
        "cloudy"
    ) {
        stormLight.intensity =
            0.35;
    } else {
        stormLight.intensity =
            0;
    }
}

function createPuddles() {
    const puddleGroup =
        new THREE.Group();

    const puddleMaterial =
        new THREE.MeshStandardMaterial(
            {
                color: 0x233d4b,
                roughness: 0.05,
                metalness: 0.2,
                transparent: true,
                opacity: 0.55
            }
        );

    for (
        let i = 0;
        i < 50;
        i++
    ) {
        const puddle =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    1 +
                        Math.random() *
                            3,
                    20
                ),
                puddleMaterial
            );

        puddle.rotation.x =
            -Math.PI / 2;

        puddle.position.set(
            -350 +
                Math.random() *
                    700,
            0.07,
            -350 +
                Math.random() *
                    700
        );

        puddle.scale.z =
            0.5;

        puddleGroup.add(
            puddle
        );
    }

    scene.add(
        puddleGroup
    );

    return puddleGroup;
}

const puddles =
    createPuddles();

function updatePuddles() {
    puddles.visible =
        state.weather ===
        "rain";
}

function createEnvironmentSounds() {
    return {
        started: false,
        context: null,
        master: null,
        wind: null,
        windGain: null,

        start() {
            if (
                this.started
            ) {
                return;
            }

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (
                !AudioContext
            ) {
                return;
            }

            this.context =
                new AudioContext();

            this.master =
                this.context.createGain();

            this.master.gain.value =
                0.03;

            this.master.connect(
                this.context.destination
            );

            const buffer =
                this.context.createBuffer(
                    1,
                    this.context.sampleRate,
                    this.context.sampleRate
                );

            const data =
                buffer.getChannelData(
                    0
                );

            for (
                let i = 0;
                i <
                data.length;
                i++
            ) {
                data[i] =
                    Math.random() *
                        2 -
                    1;
            }

            this.wind =
                this.context.createBufferSource();

            this.wind.buffer =
                buffer;

            this.wind.loop =
                true;

            this.windGain =
                this.context.createGain();

            this.windGain.gain.value =
                0.008;

            this.wind.connect(
                this.windGain
            );

            this.windGain.connect(
                this.master
            );

            this.wind.start();

            this.started =
                true;
        },

        update() {
            if (
                !this.started
            ) {
                return;
            }

            const speed =
                Math.abs(
                    activeCar
                        .userData
                        .speed
                );

            this.windGain.gain.value =
                0.004 +
                speed *
                    0.00012;
        }
    };
}

const environmentAudio =
    createEnvironmentSounds();

window.addEventListener(
    "keydown",
    event => {
        if (
            state.mode ===
            "car"
        ) {
            environmentAudio.start();
        }
    },
    {
        once: false
    }
);

function createAchievementSystem() {
    const achievements = {
        firstDrive: false,
        tenKilometers: false,
        rich: false,
        racer: false,
        collector: false
    };

    function check() {
        if (
            !achievements
                .firstDrive &&
            state.kilometers >
                0.1
        ) {
            achievements.firstDrive =
                true;

            notify(
                "🏆 Succès : Première conduite !"
            );
        }

        if (
            !achievements
                .tenKilometers &&
            state.kilometers >=
                10
        ) {
            achievements.tenKilometers =
                true;

            notify(
                "🏆 Succès : 10 km parcourus !"
            );

            state.money +=
                1000;
        }

        if (
            !achievements
                .rich &&
            state.money >=
                100000
        ) {
            achievements.rich =
                true;

            notify(
                "🏆 Succès : 100 000 € !"
            );
        }

        const ownedCount =
            Object.values(
                ownedVehicles
            ).filter(
                Boolean
            ).length;

        if (
            !achievements
                .collector &&
            ownedCount >=
                3
        ) {
            achievements.collector =
                true;

            notify(
                "🏆 Succès : Collectionneur !"
            );
        }
    }

    return {
        achievements,
        check
    };
}

const achievementSystem =
    createAchievementSystem();

function createProgressionSystem() {
    const progression = {
        xp: 0,
        level: 1,
        nextLevel: 1000
    };

    function addXP(
        amount
    ) {
        progression.xp +=
            amount;

        while (
            progression.xp >=
            progression.nextLevel
        ) {
            progression.level++;

            progression.nextLevel =
                Math.round(
                    progression
                        .nextLevel *
                        1.35
                );

            state.money +=
                500;

            notify(
                `⭐ Niveau ${progression.level} atteint ! +€500`
            );
        }
    }

    function update() {
        if (
            Math.abs(
                activeCar
                    .userData
                    .speed
            ) >
            15
        ) {
            addXP(
                0.01
            );
        }
    }

    return {
        progression,
        addXP,
        update
    };
}

const progressionSystem =
    createProgressionSystem();

function saveExtendedData() {
    const save =
        {
            version:
                state.saveVersion,

            state: {
                money:
                    state.money,
                time:
                    state.time,
                weather:
                    state.weather,
                kilometers:
                    state.kilometers,
                currentCarIndex:
                    state.currentCarIndex
            },

            vehicles:
                ownedVehicles,

            upgrades:
                garageData.upgrades,

            progression:
                progressionSystem
                    .progression
        };

    localStorage.setItem(
        "zentro_xxl_extended",
        JSON.stringify(
            save
        )
    );
}

function loadExtendedData() {
    const raw =
        localStorage.getItem(
            "zentro_xxl_extended"
        );

    if (
        !raw
    ) {
        return;
    }

    try {
        const save =
            JSON.parse(
                raw
            );

        if (
            save.vehicles
        ) {
            Object.assign(
                ownedVehicles,
                save.vehicles
            );
        }

        if (
            save.upgrades
        ) {
            Object.assign(
                garageData.upgrades,
                save.upgrades
            );
        }

        if (
            save.progression
        ) {
            Object.assign(
                progressionSystem
                    .progression,
                save.progression
            );
        }
    } catch (
        error
    ) {
        console.warn(
            "Extended save invalid",
            error
        );
    }
}

loadExtendedData();

function createMiniMissionIcons() {
    const iconGroup =
        new THREE.Group();

    for (
        let i = 0;
        i < 8;
        i++
    ) {
        const icon =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    0.7,
                    12
                ),
                new THREE.MeshBasicMaterial(
                    {
                        color: 0xffd60a
                    }
                )
            );

        icon.rotation.x =
            -Math.PI / 2;

        icon.position.set(
            -200 +
                Math.random() *
                    400,
            0.12,
            -200 +
                Math.random() *
                    400
        );

        icon.userData.type =
            "activity";

        iconGroup.add(
            icon
        );
    }

    scene.add(
        iconGroup
    );

    return iconGroup;
}

const activityIcons =
    createMiniMissionIcons();

function updateActivityIcons() {
    activityIcons.children.forEach(
        icon => {
            icon.rotation.z +=
                0.5 *
                clock.getDelta();

            const distance =
                icon.position.distanceTo(
                    activeCar.position
                );

            icon.visible =
                distance <
                180;
        }
    );
}

function createMapOverlay() {
    const overlay =
        document.createElement(
            "div"
        );

    overlay.style.position =
        "fixed";

    overlay.style.left =
        "50%";

    overlay.style.top =
        "50%";

    overlay.style.transform =
        "translate(-50%,-50%)";

    overlay.style.width =
        "min(850px,90vw)";

    overlay.style.height =
        "min(650px,80vh)";

    overlay.style.background =
        "rgba(8,12,17,.97)";

    overlay.style.borderRadius =
        "20px";

    overlay.style.border =
        "2px solid rgba(255,255,255,.18)";

    overlay.style.display =
        "none";

    overlay.style.pointerEvents =
        "auto";

    overlay.style.zIndex =
        "50";

    document.body.appendChild(
        overlay
    );

    const title =
        document.createElement(
            "div"
        );

    title.textContent =
        "🗺️ CARTE ZENTRO";

    title.style.fontSize =
        "26px";

    title.style.fontWeight =
        "800";

    title.style.padding =
        "18px";

    overlay.appendChild(
        title
    );

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        900;

    canvas.height =
        620;

    canvas.style.width =
        "100%";

    canvas.style.height =
        "calc(100% - 80px)";

    overlay.appendChild(
        canvas
    );

    const close =
        document.createElement(
            "button"
        );

    close.textContent =
        "Fermer";

    close.style.position =
        "absolute";

    close.style.right =
        "18px";

    close.style.top =
        "17px";

    close.style.padding =
        "8px 14px";

    close.style.border =
        "0";

    close.style.borderRadius =
        "8px";

    close.onclick =
        () => {
            overlay.style.display =
                "none";

            state.showMap =
                false;
        };

    overlay.appendChild(
        close
    );

    return {
        overlay,
        canvas
    };
}

const mapOverlay =
    createMapOverlay();

function drawLargeMap() {
    const canvas =
        mapOverlay.canvas;

    const ctx =
        canvas.getContext(
            "2d"
        );

    const w =
        canvas.width;

    const h =
        canvas.height;

    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    ctx.fillStyle =
        "#203224";

    ctx.fillRect(
        0,
        0,
        w,
        h
    );

    const scale =
        Math.min(
            w,
            h
        ) /
        CONFIG.worldSize;

    ctx.strokeStyle =
        "#34383d";

    ctx.lineWidth =
        14;

    for (
        let i = -2;
        i <= 2;
        i++
    ) {
        const p =
            w / 2 +
            i *
                CONFIG.roadSpacing *
                scale;

        ctx.beginPath();
        ctx.moveTo(
            0,
            p
        );
        ctx.lineTo(
            w,
            p
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(
            p,
            0
        );
        ctx.lineTo(
            p,
            h
        );
        ctx.stroke();
    }

    ctx.strokeStyle =
        "#596168";

    ctx.lineWidth =
        22;

    ctx.beginPath();

    ctx.moveTo(
        0,
        h / 2 +
            330 * scale
    );

    ctx.lineTo(
        w,
        h / 2 +
            330 * scale
    );

    ctx.stroke();

    const playerX =
        w / 2 +
        activeCar.position.x *
            scale;

    const playerZ =
        h / 2 +
        activeCar.position.z *
            scale;

    ctx.fillStyle =
        "#ff3b30";

    ctx.beginPath();

    ctx.arc(
        playerX,
        playerZ,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#00e5ff";

    garageLocations.forEach(
        position => {
            ctx.beginPath();

            ctx.arc(
                w / 2 +
                    position.x *
                        scale,
                h / 2 +
                    position.z *
                        scale,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    );

    ctx.fillStyle =
        "#ffd60a";

    missionDefinitions.forEach(
        definition => {
            ctx.beginPath();

            ctx.arc(
                w / 2 +
                    definition
                        .target
                        .x *
                        scale,
                h / 2 +
                    definition
                        .target
                        .z *
                        scale,
                6,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    );
}

window.addEventListener(
    "keydown",
    event => {
        if (
            event.key
                .toLowerCase() ===
            "m"
        ) {
            state.showMap =
                !state.showMap;

            mapOverlay.overlay.style.display =
                state.showMap
                    ? "block"
                    : "none";

            if (
                state.showMap
            ) {
                drawLargeMap();
            }
        }
    }
);

function updateWorldSystems(
    delta
) {
    updateNavigation();

    updateRace();

    updateRaceUI();

    updateClouds(
        delta
    );

    updateWater(
        delta
    );

    updateStreetLamps();

    updateBirds(
        delta
    );

    updateWeatherLighting();

    updatePuddles();

    updateActivityIcons();

    updateGaragePrompt();

    updateVehicleSystems(
        delta
    );

    updateSkidMarks(
        delta
    );

    environmentAudio.update();

    achievementSystem.check();

    progressionSystem.update();

    if (
        state.showMap
    ) {
        drawLargeMap();
    }
}

/* ------------------------------------------------------------
   IMPORTANT:
   Cette fonction est appelée par la boucle principale.
   ------------------------------------------------------------ */

const previousUpdateGame =
    updateGame;

function finalGameUpdate(
    delta
) {
    previousUpdateGame(
        delta
    );

    if (
        state.paused
    ) {
        return;
    }

    updateWorldSystems(
        delta
    );
}

/*
   Remplace la fonction de mise à jour utilisée par la boucle.
   La boucle animate() existante appelle updateGame(), donc on
   redirige la référence globale.
*/
/* ============================================================
   ZENTRO XXL — PARTIE 3
   Monde vivant + missions + trafic + météo + garage
   ============================================================ */

console.log("ZENTRO XXL — PARTIE 3 chargée");

/* ============================================================
   1. CONFIGURATION GLOBALE
   ============================================================ */

const ZENTRO_PART3 = {

    version: "XXL-P3",

    world: {
        cityRadius: 420,
        countrysideRadius: 1050,
        highwayLength: 2600,
        maxTraffic: 22,
        maxPedestrians: 35
    },

    vehicle: {
        maxSpeed: 62,
        acceleration: 22,
        braking: 34,
        steering: 0.032,
        friction: 0.985,
        reverseSpeed: 18
    },

    weather: {
        rainIntensity: 0,
        cloudSpeed: 0.003,
        puddleStrength: 0
    },

    economy: {
        startingMoney: 2500,
        repairPrice: 250,
        fuelPrice: 2.05
    },

    performance: {
        trafficDistance: 280,
        pedestrianDistance: 180,
        vegetationDistance: 500,
        buildingDistance: 900
    }
};


/* ============================================================
   2. ÉTAT XXL
   ============================================================ */

const ZENTRO_P3_STATE = {

    timeOfDay: 12,

    weather:
        "clear",

    weatherIntensity:
        0,

    money:
        2500,

    fuel:
        100,

    health:
        100,

    reputation:
        0,

    level:
        1,

    xp:
        0,

    currentMission:
        null,

    missionProgress:
        0,

    race:
        null,

    garageOpen:
        false,

    mapOpen:
        false,

    settingsOpen:
        false,

    photoMode:
        false,

    currentDestination:
        null,

    destinationType:
        null,

    distanceDriven:
        0,

    totalDeliveries:
        0,

    totalRaces:
        0,

    carsOwned:
        [
            "zentro_sport"
        ],

    currentCar:
        "zentro_sport",

    upgrades:
        {
            engine: 0,
            brakes: 0,
            suspension: 0,
            tires: 0,
            gearbox: 0
        },

    settings:
        {
            quality: "high",
            shadows: true,
            effects: true,
            traffic: true,
            pedestrians: true
        }

};


/* ============================================================
   3. OUTILS
   ============================================================ */

function p3Clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


function p3Lerp(a, b, t) {

    return a + (
        b - a
    ) * t;

}


function p3Random(min, max) {

    return Math.random() * (
        max - min
    ) + min;

}


function p3Distance(a, b) {

    return Math.sqrt(
        (
            a.x - b.x
        ) ** 2 +

        (
            a.z - b.z
        ) ** 2
    );

}


function p3Notify(message) {

    console.log(
        "[ZENTRO]",
        message
    );

    const element =
        document.getElementById(
            "zentroNotification"
        );

    if (element) {

        element.textContent =
            message;

        element.classList.add(
            "show"
        );

        clearTimeout(
            element._timeout
        );

        element._timeout =
            setTimeout(
                () => {

                    element.classList.remove(
                        "show"
                    );

                },
                2600
            );

    }

}


/* ============================================================
   4. NOTIFICATION UI
   ============================================================ */

function createP3Notification() {

    if (
        document.getElementById(
            "zentroNotification"
        )
    ) {
        return;
    }

    const div =
        document.createElement(
            "div"
        );

    div.id =
        "zentroNotification";

    div.style.position =
        "fixed";

    div.style.left =
        "50%";

    div.style.top =
        "12%";

    div.style.transform =
        "translateX(-50%)";

    div.style.padding =
        "12px 22px";

    div.style.background =
        "rgba(5,8,14,.88)";

    div.style.border =
        "1px solid rgba(255,255,255,.18)";

    div.style.borderRadius =
        "12px";

    div.style.color =
        "white";

    div.style.fontFamily =
        "Arial";

    div.style.fontSize =
        "15px";

    div.style.fontWeight =
        "600";

    div.style.pointerEvents =
        "none";

    div.style.opacity =
        "0";

    div.style.transition =
        "opacity .2s";

    div.className =
        "zentroNotification";

    document.body.appendChild(
        div
    );

    const style =
        document.createElement(
            "style"
        );

    style.textContent = `

        #zentroNotification.show {
            opacity: 1;
        }

    `;

    document.head.appendChild(
        style
    );

}


/* ============================================================
   5. XP / PROGRESSION
   ============================================================ */

function p3RequiredXP(level) {

    return (
        500 +
        level * 300
    );

}


function p3AddXP(amount) {

    amount =
        Math.max(
            0,
            amount
        );

    ZENTRO_P3_STATE.xp +=
        amount;

    while (
        ZENTRO_P3_STATE.xp >=
        p3RequiredXP(
            ZENTRO_P3_STATE.level
        )
    ) {

        ZENTRO_P3_STATE.xp -=
            p3RequiredXP(
                ZENTRO_P3_STATE.level
            );

        ZENTRO_P3_STATE.level++;

        ZENTRO_P3_STATE.reputation +=
            5;

        p3Notify(
            "Niveau supérieur ! Niveau " +
            ZENTRO_P3_STATE.level
        );

    }

}


/* ============================================================
   6. ÉCONOMIE
   ============================================================ */

function p3AddMoney(amount) {

    ZENTRO_P3_STATE.money +=
        amount;

    ZENTRO_P3_STATE.money =
        Math.max(
            0,
            ZENTRO_P3_STATE.money
        );

    p3Notify(
        (
            amount >= 0
                ? "+"
                : ""
        ) +
        Math.round(amount) +
        " €"
    );

}


function p3CanBuy(price) {

    return (
        ZENTRO_P3_STATE.money >=
        price
    );

}


function p3Buy(price) {

    if (
        !p3CanBuy(
            price
        )
    ) {

        p3Notify(
            "Pas assez d'argent"
        );

        return false;

    }

    ZENTRO_P3_STATE.money -=
        price;

    return true;

}


/* ============================================================
   7. CARBURANT
   ============================================================ */

function p3ConsumeFuel(
    amount
) {

    ZENTRO_P3_STATE.fuel =
        p3Clamp(
            ZENTRO_P3_STATE.fuel -
            amount,
            0,
            100
        );

}


function p3Refuel() {

    const missing =
        100 -
        ZENTRO_P3_STATE.fuel;

    if (
        missing <= 0
    ) {

        p3Notify(
            "Réservoir déjà plein"
        );

        return;

    }

    const price =
        missing *
        ZENTRO_P3_STATE.fuelPrice;

    if (
        !p3Buy(
            price
        )
    ) {
        return;
    }

    ZENTRO_P3_STATE.fuel =
        100;

    p3Notify(
        "Plein effectué"
    );

}


/* ============================================================
   8. STATIONS-SERVICE
   ============================================================ */

const p3FuelStations = [];

function createP3FuelStation(
    x,
    z
) {

    const group =
        new THREE.Group();

    group.position.set(
        x,
        0,
        z
    );

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                22,
                5,
                16
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0xdddddd,
                roughness:
                    .8
            })
        );

    building.position.y =
        2.5;

    group.add(
        building
    );


    const roof =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                25,
                .5,
                19
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0x222222
            })
        );

    roof.position.y =
        5.2;

    group.add(
        roof
    );


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const pump =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.2,
                    2.2,
                    .8
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        0xff3333
                })
            );

        pump.position.set(
            -6 +
            i * 4,
            1.1,
            4
        );

        group.add(
            pump
        );

    }


    scene.add(
        group
    );

    p3FuelStations.push(
        group
    );

    return group;

}


/* ============================================================
   9. GARAGES
   ============================================================ */

const p3Garages = [];

function createP3Garage(
    x,
    z,
    name =
        "ZENTRO GARAGE"
) {

    const garage =
        new THREE.Group();

    garage.position.set(
        x,
        0,
        z
    );


    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                34,
                9,
                28
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0x252832,
                roughness:
                    .72,
                metalness:
                    .25
            })
        );

    building.position.y =
        4.5;

    garage.add(
        building
    );


    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                13,
                6,
                .35
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0x111318,
                metalness:
                    .65,
                roughness:
                    .3
            })
        );

    door.position.set(
        0,
        3,
        14.2
    );

    garage.add(
        door
    );


    const sign =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                18,
                2.5,
                .3
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0xeeeeee,
                emissive:
                    0x111111
            })
        );

    sign.position.set(
        0,
        9,
        14.2
    );

    garage.add(
        sign
    );


    scene.add(
        garage
    );

    p3Garages.push(
        garage
    );

    return garage;

}


/* ============================================================
   10. CAR CATALOGUE
   ============================================================ */

const ZENTRO_CARS = {

    zentro_sport: {

        name:
            "Zentro Sport",

        price:
            0,

        maxSpeed:
            68,

        acceleration:
            26,

        braking:
            36,

        handling:
            1.0,

        color:
            0x151a22

    },


    zentro_gt: {

        name:
            "Zentro GT",

        price:
            18000,

        maxSpeed:
            82,

        acceleration:
            31,

        braking:
            40,

        handling:
            1.08,

        color:
            0x6b0f17

    },


    zentro_r: {

        name:
            "Zentro R",

        price:
            32000,

        maxSpeed:
            96,

        acceleration:
            37,

        braking:
            46,

        handling:
            1.15,

        color:
            0x151515

    },


    zentro_touring: {

        name:
            "Zentro Touring",

        price:
            24000,

        maxSpeed:
            76,

        acceleration:
            25,

        braking:
            38,

        handling:
            1.04,

        color:
            0x183f5c

    }

};


/* ============================================================
   11. ACHAT DE VOITURE
   ============================================================ */

function p3BuyCar(
    id
) {

    const car =
        ZENTRO_CARS[id];

    if (
        !car
    ) {
        return;
    }

    if (
        ZENTRO_P3_STATE.carsOwned.includes(
            id
        )
    ) {

        p3Notify(
            "Vous possédez déjà cette voiture"
        );

        return;

    }

    if (
        !p3Buy(
            car.price
        )
    ) {
        return;
    }

    ZENTRO_P3_STATE.carsOwned.push(
        id
    );

    p3Notify(
        car.name +
        " achetée !"
    );

    p3AddXP(
        100
    );

}


/* ============================================================
   12. SÉLECTION DE VOITURE
   ============================================================ */

function p3SelectCar(
    id
) {

    if (
        !ZENTRO_P3_STATE.carsOwned.includes(
            id
        )
    ) {

        p3Notify(
            "Voiture non possédée"
        );

        return;

    }

    ZENTRO_P3_STATE.currentCar =
        id;

    p3Notify(
        ZENTRO_CARS[id].name +
        " sélectionnée"
    );

}


/* ============================================================
   13. AMÉLIORATIONS
   ============================================================ */

const P3_UPGRADES = {

    engine: {

        name:
            "Moteur",

        basePrice:
            3500,

        max:
            5

    },

    brakes: {

        name:
            "Freins",

        basePrice:
            2200,

        max:
            5

    },

    suspension: {

        name:
            "Suspension",

        basePrice:
            2800,

        max:
            5

    },

    tires: {

        name:
            "Pneus",

        basePrice:
            1900,

        max:
            5

    },

    gearbox: {

        name:
            "Boîte",

        basePrice:
            4200,

        max:
            5

    }

};


function p3UpgradePrice(
    type
) {

    const data =
        P3_UPGRADES[type];

    const level =
        ZENTRO_P3_STATE.upgrades[type];

    return Math.round(
        data.basePrice *
        (
            1 +
            level *
            .55
        )
    );

}


function p3BuyUpgrade(
    type
) {

    const data =
        P3_UPGRADES[type];

    if (
        !data
    ) {
        return;
    }

    const level =
        ZENTRO_P3_STATE.upgrades[type];

    if (
        level >= data.max
    ) {

        p3Notify(
            "Amélioration maximale"
        );

        return;

    }

    const price =
        p3UpgradePrice(
            type
        );

    if (
        !p3Buy(
            price
        )
    ) {
        return;
    }

    ZENTRO_P3_STATE.upgrades[type]++;

    p3Notify(
        data.name +
        " niveau " +
        ZENTRO_P3_STATE.upgrades[type]
    );

    p3AddXP(
        75
    );

}


/* ============================================================
   14. PHYSIQUE DE VOITURE — CALCUL DES BONUS
   ============================================================ */

function p3VehicleStats() {

    const base =
        ZENTRO_CARS[
            ZENTRO_P3_STATE.currentCar
        ] ||
        ZENTRO_CARS.zentro_sport;

    const up =
        ZENTRO_P3_STATE.upgrades;

    return {

        maxSpeed:
            base.maxSpeed *
            (
                1 +
                up.engine *
                .035
            ) *
            (
                1 +
                up.gearbox *
                .025
            ),

        acceleration:
            base.acceleration *
            (
                1 +
                up.engine *
                .06
            ) *
            (
                1 +
                up.gearbox *
                .03
            ),

        braking:
            base.braking *
            (
                1 +
                up.brakes *
                .08
            ),

        handling:
            base.handling *
            (
                1 +
                up.suspension *
                .045
            ) *
            (
                1 +
                up.tires *
                .04
            )

    };

}


/* ============================================================
   15. CYCLE JOUR / NUIT
   ============================================================ */

function p3UpdateDayNight(
    delta
) {

    ZENTRO_P3_STATE.timeOfDay +=
        delta *
        .015;

    if (
        ZENTRO_P3_STATE.timeOfDay >=
        24
    ) {

        ZENTRO_P3_STATE.timeOfDay -=
            24;

    }


    const hour =
        ZENTRO_P3_STATE.timeOfDay;

    const angle =
        (
            hour -
            6
        ) /
        24 *
        Math.PI *
        2;


    const sunX =
        Math.cos(
            angle
        ) *
        500;

    const sunY =
        Math.sin(
            angle
        ) *
        500;


    if (
        typeof sunLight !==
        "undefined"
    ) {

        sunLight.position.set(
            sunX,
            Math.max(
                20,
                sunY
            ),
            250
        );

        const daylight =
            p3Clamp(
                Math.sin(
                    angle
                ),
                0,
                1
            );

        sunLight.intensity =
            .18 +
            daylight *
            1.8;

    }


    const darkness =
        p3Clamp(
            1 -
            Math.sin(
                angle
            ),
            0,
            1
        );


    if (
        scene &&
        scene.fog &&
        scene.fog.color
    ) {

        const r =
            Math.round(
                p3Lerp(
                    150,
                    30,
                    darkness
                )
            );

        const g =
            Math.round(
                p3Lerp(
                    190,
                    38,
                    darkness
                )
            );

        const b =
            Math.round(
                p3Lerp(
                    225,
                    65,
                    darkness
                )
            );

        scene.fog.color.setRGB(
            r / 255,
            g / 255,
            b / 255
        );

    }

}


/* ============================================================
   16. PLUIE
   ============================================================ */

let p3Rain =
    null;

function createP3Rain() {

    if (
        p3Rain
    ) {
        return;
    }

    const count =
        3200;

    const positions =
        new Float32Array(
            count * 3
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        positions[
            i * 3
        ] =
            p3Random(
                -450,
                450
            );

        positions[
            i * 3 + 1
        ] =
            p3Random(
                2,
                100
            );

        positions[
            i * 3 + 2
        ] =
            p3Random(
                -450,
                450
            );

    }

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({

            color:
                0xb8d8ff,

            size:
                .09,

            transparent:
                true,

            opacity:
                0.55,

            depthWrite:
                false

        });


    p3Rain =
        new THREE.Points(
            geometry,
            material
        );

    p3Rain.visible =
        false;

    scene.add(
        p3Rain
    );

}


function p3UpdateRain(
    delta
) {

    if (
        !p3Rain
    ) {
        return;
    }

    const visible =
        ZENTRO_P3_STATE.weather ===
        "rain";

    p3Rain.visible =
        visible;

    if (
        !visible
    ) {
        return;
    }

    const position =
        p3Rain.geometry
            .attributes
            .position;

    for (
        let i = 0;
        i < position.count;
        i++
    ) {

        let y =
            position.getY(
                i
            );

        y -=
            delta *
            75;

        if (
            y < 1
        ) {

            y =
                p3Random(
                    55,
                    100
                );

        }

        position.setY(
            i,
            y
        );

    }

    position.needsUpdate =
        true;

}


/* ============================================================
   17. CHANGEMENT MÉTÉO
   ============================================================ */

function p3SetWeather(
    type
) {

    const allowed = [
        "clear",
        "cloudy",
        "rain"
    ];

    if (
        !allowed.includes(
            type
        )
    ) {
        type =
            "clear";
    }

    ZENTRO_P3_STATE.weather =
        type;

    if (
        type ===
        "rain"
    ) {

        ZENTRO_P3_STATE.weatherIntensity =
            1;

    } else if (
        type ===
        "cloudy"
    ) {

        ZENTRO_P3_STATE.weatherIntensity =
            .4;

    } else {

        ZENTRO_P3_STATE.weatherIntensity =
            0;

    }

    p3Notify(
        "Météo : " +
        type
    );

}


/* ============================================================
   18. TRAFIC PNJ
   ============================================================ */

const p3TrafficCars =
    [];


function p3CreateTrafficCar(
    x,
    z,
    direction =
        1
) {

    const car =
        new THREE.Group();

    car.position.set(
        x,
        .25,
        z
    );

    car.rotation.y =
        direction > 0
            ? 0
            : Math.PI;


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.1,
                .55,
                4.1
            ),
            new THREE.MeshStandardMaterial({

                color:
                    new THREE.Color()
                        .setHSL(
                            Math.random(),
                            .55,
                            .42
                        ),

                roughness:
                    .48,

                metalness:
                    .2

            })
        );

    body.position.y =
        .75;

    car.add(
        body
    );


    const cabin =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.65,
                .55,
                1.8
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0x202833,
                roughness:
                    .22,
                metalness:
                    .3
            })
        );

    cabin.position.set(
        0,
        1.15,
        -.1
    );

    car.add(
        cabin
    );


    const wheelGeometry =
        new THREE.CylinderGeometry(
            .38,
            .38,
            .24,
            16
        );

    const wheelMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0x101010
        });


    const wheels =
        [];

    [
        [-.95, .42, -1.35],
        [.95, .42, -1.35],
        [-.95, .42, 1.35],
        [.95, .42, 1.35]
    ].forEach(
        data => {

            const steering =
                new THREE.Group();

            steering.position.set(
                data[0],
                data[1],
                data[2]
            );

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    wheelMaterial
                );

            wheel.rotation.z =
                Math.PI / 2;

            steering.add(
                wheel
            );

            car.add(
                steering
            );

            wheels.push(
                wheel
            );

        }
    );


    scene.add(
        car
    );


    p3TrafficCars.push({

        object:
            car,

        speed:
            p3Random(
                7,
                14
            ),

        direction,

        wheels,

        laneOffset:
            z

    });


    return car;

}


/* ============================================================
   19. TRAFIC UPDATE
   ============================================================ */

function p3UpdateTraffic(
    delta
) {

    if (
        !ZENTRO_P3_STATE.settings.traffic
    ) {
        return;
    }

    if (
        !camera
    ) {
        return;
    }


    const playerPosition =
        camera.position;


    for (
        let i = 0;
        i < p3TrafficCars.length;
        i++
    ) {

        const traffic =
            p3TrafficCars[i];

        const car =
            traffic.object;


        car.position.z +=
            traffic.speed *
            traffic.direction *
            delta;


        traffic.wheels.forEach(
            wheel => {

                wheel.rotation.y -=
                    traffic.speed *
                    delta *
                    2;

            }
        );


        const distance =
            p3Distance(
                car.position,
                playerPosition
            );


        car.visible =
            distance <
            ZENTRO_P3_STATE
                .settings
                .traffic
                ? ZENTRO_P3_STATE
                    .settings
                    .traffic
                : true;


        if (
            car.position.z >
            650
        ) {

            car.position.z =
                -650;

        }

        if (
            car.position.z <
            -650
        ) {

            car.position.z =
                650;

        }

    }

}


/* ============================================================
   20. PIÉTONS
   ============================================================ */

const p3Pedestrians =
    [];


function p3CreatePedestrian(
    x,
    z
) {

    const person =
        new THREE.Group();

    person.position.set(
        x,
        0,
        z
    );


    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                .28,
                .75,
                4,
                8
            ),
            new THREE.MeshStandardMaterial({
                color:
                    new THREE.Color()
                        .setHSL(
                            Math.random(),
                            .45,
                            .55
                        )
            })
        );

    body.position.y =
        .9;

    person.add(
        body
    );


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .24,
                12,
                12
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0xd7a27c
            })
        );

    head.position.y =
        1.65;

    person.add(
        head
    );


    scene.add(
        person
    );


    p3Pedestrians.push({

        object:
            person,

        speed:
            p3Random(
                .6,
                1.4
            ),

        direction:
            Math.random() *
            Math.PI *
            2,

        phase:
            Math.random() *
            Math.PI *
            2

    });


    return person;

}


/* ============================================================
   21. PIÉTONS UPDATE
   ============================================================ */

function p3UpdatePedestrians(
    delta
) {

    if (
        !ZENTRO_P3_STATE
            .settings
            .pedestrians
    ) {
        return;
    }

    const target =
        camera.position;


    for (
        let i = 0;
        i < p3Pedestrians.length;
        i++
    ) {

        const p =
            p3Pedestrians[i];


        const distance =
            p3Distance(
                p.object.position,
                target
            );


        p.object.visible =
            distance <
            ZENTRO_P3_STATE
                .settings
                .pedestrians
            ? ZENTRO_P3_STATE
                .settings
                .pedestrians
            : true;


        p.object.position.x +=
            Math.cos(
                p.direction
            ) *
            p.speed *
            delta;


        p.object.position.z +=
            Math.sin(
                p.direction
            ) *
            p.speed *
            delta;


        p.object.rotation.y =
            p.direction;


        p.phase +=
            delta *
            6;


        p.object.position.y =
            Math.abs(
                Math.sin(
                    p.phase
                )
            ) *
            .025;


        if (
            Math.abs(
                p.object.position.x
            ) >
            500
        ) {

            p.direction =
                Math.PI -
                p.direction;

        }

        if (
            Math.abs(
                p.object.position.z
            ) >
            500
        ) {

            p.direction =
                -p.direction;

        }

    }

}


/* ============================================================
   22. MISSIONS
   ============================================================ */

const P3_MISSIONS = [

    {

        id:
            "delivery_01",

        title:
            "Première livraison",

        type:
            "delivery",

        reward:
            850,

        xp:
            300

    },

    {

        id:
            "delivery_02",

        title:
            "Livraison express",

        type:
            "delivery",

        reward:
            1250,

        xp:
            450

    },

    {

        id:
            "race_01",

        title:
            "Course urbaine",

        type:
            "race",

        reward:
            1500,

        xp:
            600

    },

    {

        id:
            "race_02",

        title:
            "Défi autoroute",

        type:
            "race",

        reward:
            2300,

        xp:
            850

    }

];


function p3StartMission(
    id
) {

    const mission =
        P3_MISSIONS.find(
            item =>
                item.id ===
                id
        );

    if (
        !mission
    ) {
        return;
    }

    if (
        ZENTRO_P3_STATE.currentMission
    ) {

        p3Notify(
            "Une mission est déjà active"
        );

        return;

    }

    ZENTRO_P3_STATE.currentMission =
        mission;

    ZENTRO_P3_STATE.missionProgress =
        0;

    p3Notify(
        mission.title +
        " commencée"
    );

}


/* ============================================================
   23. FIN DE MISSION
   ============================================================ */

function p3CompleteMission() {

    const mission =
        ZENTRO_P3_STATE.currentMission;

    if (
        !mission
    ) {
        return;
    }

    p3AddMoney(
        mission.reward
    );

    p3AddXP(
        mission.xp
    );

    ZENTRO_P3_STATE.totalDeliveries++;

    ZENTRO_P3_STATE.currentMission =
        null;

    ZENTRO_P3_STATE.missionProgress =
        0;

    p3Notify(
        "Mission terminée !"
    );

}


/* ============================================================
   24. DESTINATION
   ============================================================ */

const p3Destinations =
    [];


function p3CreateDestination(
    x,
    z,
    label,
    type =
        "mission"
) {

    const group =
        new THREE.Group();

    group.position.set(
        x,
        0,
        z
    );


    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                5,
                .35,
                10,
                32
            ),
            new THREE.MeshBasicMaterial({
                color:
                    type ===
                    "race"
                        ? 0xff5533
                        : 0x33ccff
            })
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y =
        .25;

    group.add(
        ring
    );


    const beacon =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                1,
                5,
                12
            ),
            new THREE.MeshBasicMaterial({
                color:
                    type ===
                    "race"
                        ? 0xff5533
                        : 0x33ccff,
                transparent:
                    true,
                opacity:
                    .45
            })
        );

    beacon.position.y =
        4;

    group.add(
        beacon
    );


    scene.add(
        group
    );


    p3Destinations.push({

        object:
            group,

        label,

        type,

        x,

        z

    });


    return group;

}


/* ============================================================
   25. ANIMATION DESTINATIONS
   ============================================================ */

function p3UpdateDestinations(
    delta
) {

    const t =
        performance.now() *
        .001;


    for (
        let i = 0;
        i < p3Destinations.length;
        i++
    ) {

        const d =
            p3Destinations[i];


        d.object.children[0]
            .rotation.z =
            t;


        d.object.children[1]
            .position.y =
            4 +
            Math.sin(
                t * 2
            ) *
            .7;

    }

}


/* ============================================================
   26. MINI-CARTE P3
   ============================================================ */

let p3MapCanvas =
    null;

let p3MapContext =
    null;


function createP3MiniMap() {

    if (
        document.getElementById(
            "zentroP3Map"
        )
    ) {
        return;
    }


    p3MapCanvas =
        document.createElement(
            "canvas"
        );

    p3MapCanvas.id =
        "zentroP3Map";

    p3MapCanvas.width =
        210;

    p3MapCanvas.height =
        210;


    p3MapCanvas.style.position =
        "fixed";

    p3MapCanvas.style.right =
        "20px";

    p3MapCanvas.style.bottom =
        "20px";

    p3MapCanvas.style.width =
        "210px";

    p3MapCanvas.style.height =
        "210px";

    p3MapCanvas.style.border =
        "2px solid rgba(255,255,255,.3)";

    p3MapCanvas.style.borderRadius =
        "50%";

    p3MapCanvas.style.background =
        "rgba(0,0,0,.55)";

    document.body.appendChild(
        p3MapCanvas
    );

    p3MapContext =
        p3MapCanvas.getContext(
            "2d"
        );

}


/* ============================================================
   27. DESSIN MINI-CARTE
   ============================================================ */

function p3DrawMap() {

    if (
        !p3MapContext ||
        !camera
    ) {
        return;
    }


    const ctx =
        p3MapContext;

    const w =
        p3MapCanvas.width;

    const h =
        p3MapCanvas.height;


    ctx.clearRect(
        0,
        0,
        w,
        h
    );


    ctx.fillStyle =
        "rgba(8,12,18,.85)";

    ctx.fillRect(
        0,
        0,
        w,
        h
    );


    const scale =
        .18;


    ctx.strokeStyle =
        "rgba(255,255,255,.12)";

    ctx.lineWidth =
        3;


    for (
        let x = -500;
        x <= 500;
        x += 100
    ) {

        const px =
            w / 2 +
            (
                x -
                camera.position.x
            ) *
            scale;

        ctx.beginPath();

        ctx.moveTo(
            px,
            0
        );

        ctx.lineTo(
            px,
            h
        );

        ctx.stroke();

    }


    for (
        let z = -500;
        z <= 500;
        z += 100
    ) {

        const py =
            h / 2 +
            (
                z -
                camera.position.z
            ) *
            scale;

        ctx.beginPath();

        ctx.moveTo(
            0,
            py
        );

        ctx.lineTo(
            w,
            py
        );

        ctx.stroke();

    }


    for (
        let i = 0;
        i < p3Destinations.length;
        i++
    ) {

        const d =
            p3Destinations[i];

        const px =
            w / 2 +
            (
                d.x -
                camera.position.x
            ) *
            scale;

        const py =
            h / 2 +
            (
                d.z -
                camera.position.z
            ) *
            scale;


        if (
            px < 0 ||
            px > w ||
            py < 0 ||
            py > h
        ) {
            continue;
        }


        ctx.fillStyle =
            d.type ===
            "race"
                ? "#ff5533"
                : "#33ccff";

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.fillStyle =
        "white";

    ctx.beginPath();

    ctx.arc(
        w / 2,
        h / 2,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* ============================================================
   28. COURSE DE COURSE
   ============================================================ */

const p3Race =
    {

        active:
            false,

        checkpoints:
            [],

        current:
            0,

        startTime:
            0,

        timeLimit:
            90

    };


function p3CreateRace() {

    p3Race.checkpoints =
        [];

    const points = [

        [40, 40],
        [160, 40],
        [220, 150],
        [100, 260],
        [-80, 220],
        [-170, 80],
        [-90, -40],
        [40, 40]

    ];


    for (
        let i = 0;
        i < points.length;
        i++
    ) {

        const marker =
            createP3Destination(
                points[i][0],
                points[i][1],
                "Checkpoint " +
                (i + 1),
                "race"
            );


        p3Race.checkpoints.push(
            marker
        );

    }

}


/* ============================================================
   29. DÉMARRAGE COURSE
   ============================================================ */

function p3StartRace() {

    if (
        p3Race.active
    ) {

        p3Notify(
            "Course déjà active"
        );

        return;

    }

    p3Race.active =
        true;

    p3Race.current =
        0;

    p3Race.startTime =
        performance.now();


    p3Notify(
        "Course démarrée !"
    );

}


/* ============================================================
   30. UPDATE COURSE
   ============================================================ */

function p3UpdateRace() {

    if (
        !p3Race.active
    ) {
        return;
    }


    const checkpoint =
        p3Race.checkpoints[
            p3Race.current
        ];


    if (
        !checkpoint ||
        !camera
    ) {
        return;
    }


    const distance =
        p3Distance(
            camera.position,
            checkpoint.object.position
        );


    if (
        distance <
        9
    ) {

        p3Race.current++;

        p3Notify(
            "Checkpoint " +
            p3Race.current
        );

    }


    if (
        p3Race.current >=
        p3Race.checkpoints.length
    ) {

        p3FinishRace();

    }


    const elapsed =
        (
            performance.now() -
            p3Race.startTime
        ) /
        1000;


    if (
        elapsed >
        p3Race.timeLimit
    ) {

        p3Race.active =
            false;

        p3Notify(
            "Course échouée"
        );

    }

}


/* ============================================================
   31. FIN COURSE
   ============================================================ */

function p3FinishRace() {

    const elapsed =
        (
            performance.now() -
            p3Race.startTime
        ) /
        1000;


    p3Race.active =
        false;

    const reward =
        Math.max(
            500,
            Math.round(
                3000 -
                elapsed *
                20
            )
        );


    p3AddMoney(
        reward
    );

    p3AddXP(
        750
    );

    ZENTRO_P3_STATE.totalRaces++;

    p3Notify(
        "Course terminée en " +
        elapsed.toFixed(
            1
        ) +
        " s"
    );

}


/* ============================================================
   32. SAUVEGARDE
   ============================================================ */

const P3_SAVE_KEY =
    "ZENTRO_XXL_SAVE_V3";


function p3SaveGame() {

    const data = {

        state:
            ZENTRO_P3_STATE,

        timestamp:
            Date.now()

    };


    try {

        localStorage.setItem(
            P3_SAVE_KEY,
            JSON.stringify(
                data
            )
        );

        p3Notify(
            "Sauvegarde effectuée"
        );

    } catch (
        error
    ) {

        console.error(
            error
        );

        p3Notify(
            "Erreur de sauvegarde"
        );

    }

}


/* ============================================================
   33. CHARGEMENT
   ============================================================ */

function p3LoadGame() {

    try {

        const raw =
            localStorage.getItem(
                P3_SAVE_KEY
            );

        if (
            !raw
        ) {

            p3Notify(
                "Aucune sauvegarde"
            );

            return;

        }


        const data =
            JSON.parse(
                raw
            );


        if (
            data &&
            data.state
        ) {

            Object.assign(
                ZENTRO_P3_STATE,
                data.state
            );

        }


        p3Notify(
            "Sauvegarde chargée"
        );


    } catch (
        error
    ) {

        console.error(
            error
        );

        p3Notify(
            "Sauvegarde invalide"
        );

    }

}


/* ============================================================
   34. TOUCHES DE SAUVEGARDE
   ============================================================ */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key.toLowerCase() ===
            "f5"
        ) {

            event.preventDefault();

            p3SaveGame();

        }


        if (
            event.key.toLowerCase() ===
            "f9"
        ) {

            event.preventDefault();

            p3LoadGame();

        }

    }
);


/* ============================================================
   35. MENU RAPIDE
   ============================================================ */

function p3CreateQuickMenu() {

    if (
        document.getElementById(
            "zentroP3Menu"
        )
    ) {
        return;
    }


    const menu =
        document.createElement(
            "div"
        );

    menu.id =
        "zentroP3Menu";

    menu.style.position =
        "fixed";

    menu.style.left =
        "20px";

    menu.style.top =
        "50%";

    menu.style.transform =
        "translateY(-50%)";

    menu.style.padding =
        "15px";

    menu.style.background =
        "rgba(5,8,14,.88)";

    menu.style.borderRadius =
        "14px";

    menu.style.fontFamily =
        "Arial";

    menu.style.color =
        "white";

    menu.style.display =
        "none";

    menu.style.zIndex =
        "1000";


    menu.innerHTML = `

        <div style="
            font-size:20px;
            font-weight:bold;
            margin-bottom:12px;
        ">
            ZENTRO
        </div>

        <button data-p3="save">
            💾 Sauvegarder
        </button>

        <button data-p3="load">
            📂 Charger
        </button>

        <button data-p3="clear">
            ☀️ Temps clair
        </button>

        <button data-p3="rain">
            🌧️ Pluie
        </button>

        <button data-p3="garage">
            🔧 Garage
        </button>

    `;


    document.body.appendChild(
        menu
    );


    menu
        .querySelectorAll(
            "button"
        )
        .forEach(
            button => {

                button.style.display =
                    "block";

                button.style.width =
                    "180px";

                button.style.margin =
                    "6px 0";

                button.style.padding =
                    "8px";

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.p3;

                        if (
                            action ===
                            "save"
                        ) {
                            p3SaveGame();
                        }

                        if (
                            action ===
                            "load"
                        ) {
                            p3LoadGame();
                        }

                        if (
                            action ===
                            "clear"
                        ) {
                            p3SetWeather(
                                "clear"
                            );
                        }

                        if (
                            action ===
                            "rain"
                        ) {
                            p3SetWeather(
                                "rain"
                            );
                        }

                        if (
                            action ===
                            "garage"
                        ) {
                            p3OpenGarage();
                        }

                    }

                );

            }
        );


    window.addEventListener(
        "keydown",
        event => {

            if (
                event.key.toLowerCase() ===
                "m"
            ) {

                menu.style.display =
                    menu.style.display ===
                    "none"
                        ? "block"
                        : "none";

            }

        }
    );

}


/* ============================================================
   36. GARAGE UI
   ============================================================ */

function p3OpenGarage() {

    if (
        document.getElementById(
            "zentroGarageUI"
        )
    ) {

        return;

    }


    const panel =
        document.createElement(
            "div"
        );

    panel.id =
        "zentroGarageUI";


    panel.style.position =
        "fixed";

    panel.style.inset =
        "0";

    panel.style.background =
        "rgba(3,5,8,.94)";

    panel.style.zIndex =
        "2000";

    panel.style.color =
        "white";

    panel.style.fontFamily =
        "Arial";

    panel.style.padding =
        "40px";

    panel.style.overflow =
        "auto";


    let carsHTML =
        "";


    Object.entries(
        ZENTRO_CARS
    ).forEach(
        (
            [
                id,
                car
            ]
        ) => {

            const owned =
                ZENTRO_P3_STATE
                    .carsOwned
                    .includes(
                        id
                    );


            carsHTML += `

                <div style="
                    padding:15px;
                    margin:10px;
                    background:
                        rgba(255,255,255,.07);
                    border-radius:12px;
                ">

                    <b>
                        ${car.name}
                    </b>

                    <br>

                    Vitesse :
                    ${car.maxSpeed}

                    <br>

                    Prix :
                    ${car.price} €

                    <br><br>

                    <button
                        data-car="${id}"
                        data-action="${
                            owned
                                ? "select"
                                : "buy"
                        }"
                    >

                        ${
                            owned
                                ? "Sélectionner"
                                : "Acheter"
                        }

                    </button>

                </div>

            `;

        }
    );


    panel.innerHTML = `

        <h1>
            🔧 ZENTRO GARAGE
        </h1>

        <p>
            Argent :
            ${Math.round(
                ZENTRO_P3_STATE.money
            )} €
        </p>

        <p>
            Voiture actuelle :
            ${
                ZENTRO_CARS[
                    ZENTRO_P3_STATE.currentCar
                ].name
            }
        </p>

        <div>
            ${carsHTML}
        </div>

        <hr>

        <h2>
            Améliorations
        </h2>

        <div id="p3UpgradeContainer"></div>

        <br>

        <button id="p3CloseGarage">
            Fermer
        </button>

    `;


    document.body.appendChild(
        panel
    );


    const upgrades =
        panel.querySelector(
            "#p3UpgradeContainer"
        );


    Object.keys(
        P3_UPGRADES
    ).forEach(
        type => {

            const level =
                ZENTRO_P3_STATE
                    .upgrades[type];

            const price =
                p3UpgradePrice(
                    type
                );


            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                P3_UPGRADES[type].name +
                " — niveau " +
                level +
                " — " +
                price +
                " €";


            button.style.display =
                "block";

            button.style.margin =
                "7px 0";

            button.onclick =
                () => {

                    p3BuyUpgrade(
                        type
                    );

                    panel.remove();

                    p3OpenGarage();

                };


            upgrades.appendChild(
                button
            );

        }
    );


    panel
        .querySelectorAll(
            "[data-car]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const id =
                            button.dataset.car;

                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "buy"
                        ) {

                            p3BuyCar(
                                id
                            );

                        } else {

                            p3SelectCar(
                                id
                            );

                        }


                        panel.remove();

                        p3OpenGarage();

                    };

            }
        );


    panel
        .querySelector(
            "#p3CloseGarage"
        )
        .onclick =
        () => {

            panel.remove();

        };

}


/* ============================================================
   37. HUD XXL
   ============================================================ */

let p3HUD =
    null;


function createP3HUD() {

    if (
        document.getElementById(
            "zentroP3HUD"
        )
    ) {

        return;

    }


    p3HUD =
        document.createElement(
            "div"
        );

    p3HUD.id =
        "zentroP3HUD";


    p3HUD.style.position =
        "fixed";

    p3HUD.style.left =
        "20px";

    p3HUD.style.bottom =
        "20px";

    p3HUD.style.color =
        "white";

    p3HUD.style.fontFamily =
        "Arial";

    p3HUD.style.fontSize =
        "14px";

    p3HUD.style.textShadow =
        "0 2px 4px black";

    p3HUD.style.pointerEvents =
        "none";


    document.body.appendChild(
        p3HUD
    );

}


/* ============================================================
   38. UPDATE HUD
   ============================================================ */

function p3UpdateHUD() {

    if (
        !p3HUD
    ) {
        return;
    }


    const car =
        ZENTRO_CARS[
            ZENTRO_P3_STATE.currentCar
        ];


    p3HUD.innerHTML = `

        <div>
            🚗 ${car.name}
        </div>

        <div>
            💰 ${Math.round(
                ZENTRO_P3_STATE.money
            )} €
        </div>

        <div>
            ⛽ ${Math.round(
                ZENTRO_P3_STATE.fuel
            )}%
        </div>

        <div>
            ⭐ Niveau ${
                ZENTRO_P3_STATE.level
            }
        </div>

        <div>
            🌤️ ${
                ZENTRO_P3_STATE.weather
            }
        </div>

        <div>
            🕒 ${
                ZENTRO_P3_STATE
                    .timeOfDay
                    .toFixed(
                        1
                    )
            } h
        </div>

    `;

}


/* ============================================================
   39. OPTIMISATION DISTANCE
   ============================================================ */

function p3DistanceOptimization() {

    if (
        !camera
    ) {
        return;
    }


    const cameraPosition =
        camera.position;


    for (
        let i = 0;
        i < p3TrafficCars.length;
        i++
    ) {

        const object =
            p3TrafficCars[i]
                .object;


        const distance =
            p3Distance(
                object.position,
                cameraPosition
            );


        object.visible =
            distance <
            ZENTRO_PART3
                .performance
                .trafficDistance;

    }


    for (
        let i = 0;
        i < p3Pedestrians.length;
        i++
    ) {

        const object =
            p3Pedestrians[i]
                .object;


        const distance =
            p3Distance(
                object.position,
                cameraPosition
            );


        object.visible =
            distance <
            ZENTRO_PART3
                .performance
                .pedestrianDistance;

    }

}


/* ============================================================
   40. INITIALISATION
   ============================================================ */

function initializeZentroPart3() {

    createP3Notification();

    createP3MiniMap();

    createP3QuickMenu();

    createP3HUD();

    createP3Rain();


    /*
     * Stations
     */

    createP3FuelStation(
        80,
        70
    );

    createP3FuelStation(
        -240,
        -110
    );


    /*
     * Garages
     */

    createP3Garage(
        -100,
        100
    );


    /*
     * Trafic
     */

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        p3CreateTrafficCar(
            p3Random(
                -300,
                300
            ),
            p3Random(
                -280,
                280
            ),
            i % 2 === 0
                ? 1
                : -1
        );

    }


    /*
     * Piétons
     */

    for (
        let i = 0;
        i < 22;
        i++
    ) {

        p3CreatePedestrian(
            p3Random(
                -250,
                250
            ),
            p3Random(
                -250,
                250
            )
        );

    }


    /*
     * Destinations
     */

    createP3Destination(
        180,
        80,
        "Mission livraison",
        "mission"
    );

    createP3Destination(
        -220,
        160,
        "Course",
        "race"
    );


    /*
     * Course
     */

    p3CreateRace();


    /*
     * Événements clavier
     */

    window.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();


            if (
                key ===
                "g"
            ) {

                p3OpenGarage();

            }


            if (
                key ===
                "r"
            ) {

                p3Refuel();

            }


            if (
                key ===
                "1"
            ) {

                p3SetWeather(
                    "clear"
                );

            }


            if (
                key ===
                "2"
            ) {

                p3SetWeather(
                    "cloudy"
                );

            }


            if (
                key ===
                "3"
            ) {

                p3SetWeather(
                    "rain"
                );

            }


            if (
                key ===
                "4"
            ) {

                p3StartRace();

            }

        }
    );


    p3Notify(
        "ZENTRO XXL — systèmes avancés chargés"
    );

}


/* ============================================================
   41. UPDATE GLOBAL P3
   ============================================================ */

let p3Initialized =
    false;


function updateZentroPart3(
    delta
) {

    if (
        !p3Initialized
    ) {

        initializeZentroPart3();

        p3Initialized =
            true;

    }


    p3UpdateDayNight(
        delta
    );

    p3UpdateRain(
        delta
    );

    p3UpdateTraffic(
        delta
    );

    p3UpdatePedestrians(
        delta
    );

    p3UpdateDestinations(
        delta
    );

    p3UpdateRace();

    p3DistanceOptimization();

    p3DrawMap();

    p3UpdateHUD();

}


/* ============================================================
   42. AUTO-SAVE
   ============================================================ */

let p3SaveTimer =
    0;


function p3AutoSave(
    delta
) {

    p3SaveTimer +=
        delta;

    if (
        p3SaveTimer >=
        30
    ) {

        p3SaveTimer =
            0;

        try {

            localStorage.setItem(
                P3_SAVE_KEY,
                JSON.stringify({
                    state:
                        ZENTRO_P3_STATE,
                    timestamp:
                        Date.now()
                })
            );

        } catch (
            error
        ) {

            console.warn(
                "Auto-save impossible",
                error
            );

        }

    }

}


/* ============================================================
   43. BRANCHEMENT SUR LA BOUCLE DE JEU
   ============================================================ */

const zentroPart3OriginalRAF =
    window.requestAnimationFrame;


let zentroPart3LastTime =
    performance.now();


function zentroPart3Frame(
    time
) {

    const delta =
        Math.min(
            .05,
            (
                time -
                zentroPart3LastTime
            ) /
            1000
        );


    zentroPart3LastTime =
        time;


    updateZentroPart3(
        delta
    );

    p3AutoSave(
        delta
    );


    zentroPart3OriginalRAF(
        zentroPart3Frame
    );

}


/* ============================================================
   44. DÉMARRAGE
   ============================================================ */

zentroPart3OriginalRAF(
    zentroPart3Frame
);


/* ============================================================
   45. API DEBUG
   ============================================================ */

window.ZENTRO_P3 =
    {

        state:
            ZENTRO_P3_STATE,

        cars:
            ZENTRO_CARS,

        missions:
            P3_MISSIONS,

        startMission:
            p3StartMission,

        completeMission:
            p3CompleteMission,

        startRace:
            p3StartRace,

        finishRace:
            p3FinishRace,

        openGarage:
            p3OpenGarage,

        buyCar:
            p3BuyCar,

        selectCar:
            p3SelectCar,

        upgrade:
            p3BuyUpgrade,

        refuel:
            p3Refuel,

        weather:
            p3SetWeather,

        save:
            p3SaveGame,

        load:
            p3LoadGame

    };


console.log(
    "ZENTRO XXL — PARTIE 3 prête"
);
