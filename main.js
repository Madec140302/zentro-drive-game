import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ======================================================
// ZENTRO V3
// MONDE OUVERT + PERSONNAGE + VOITURE
// ======================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x82b8e8);

scene.fog = new THREE.Fog(
    0x82b8e8,
    70,
    180
);

// ======================================================
// CAMERA
// ======================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 5, 10);

// ======================================================
// RENDERER
// ======================================================

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

// ======================================================
// LUMIÈRES
// ======================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
);

sun.position.set(
    50,
    100,
    30
);

scene.add(sun);

const hemi = new THREE.HemisphereLight(
    0xffffff,
    0x557755,
    1.4
);

scene.add(hemi);

// ======================================================
// SOL
// ======================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({
        color: 0x4f7f42,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;

scene.add(ground);

// ======================================================
// ROUTES
// ======================================================

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x292929,
    roughness: 1
});

const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const curbMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777
});

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
            0.12,
            length
        ),
        roadMaterial
    );

    road.position.set(
        x,
        0.02,
        z
    );

    road.rotation.y = rotation;

    scene.add(road);

    // lignes centrales
    for (
        let i = -length / 2 + 5;
        i < length / 2;
        i += 10
    ) {

        const line = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.02,
                4
            ),
            lineMaterial
        );

        line.position.set(
            x,
            0.09,
            z + i
        );

        line.rotation.y = rotation;

        scene.add(line);
    }

    // trottoirs
    const sidewalk1 = new THREE.Mesh(
        new THREE.BoxGeometry(
            1.5,
            0.18,
            length
        ),
        curbMaterial
    );

    const sidewalk2 = sidewalk1.clone();

    sidewalk1.position.set(
        x - width / 2 - 0.75,
        0.09,
        z
    );

    sidewalk2.position.set(
        x + width / 2 + 0.75,
        0.09,
        z
    );

    sidewalk1.rotation.y = rotation;
    sidewalk2.rotation.y = rotation;

    scene.add(sidewalk1);
    scene.add(sidewalk2);
}

// routes principales
createRoad(0, 0, 14, 180, 0);

createRoad(
    -55,
    0,
    12,
    180,
    0
);

createRoad(
    55,
    0,
    12,
    180,
    0
);

createRoad(
    0,
    -45,
    12,
    140,
    Math.PI / 2
);

createRoad(
    0,
    45,
    12,
    140,
    Math.PI / 2
);

createRoad(
    0,
    90,
    14,
    180,
    0
);

createRoad(
    0,
    -90,
    14,
    180,
    0
);

// ======================================================
// BÂTIMENTS
// ======================================================

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
}

createBuilding(
    -25,
    -25,
    15,
    18,
    15,
    0x777b82
);

createBuilding(
    25,
    -25,
    18,
    25,
    16,
    0x8b6f61
);

createBuilding(
    -25,
    25,
    17,
    14,
    17,
    0x65758a
);

createBuilding(
    25,
    25,
    16,
    20,
    16,
    0x9a8368
);

createBuilding(
    -75,
    25,
    20,
    25,
    20,
    0x737373
);

createBuilding(
    75,
    -25,
    20,
    22,
    20,
    0x858585
);

// ======================================================
// MAISONS
// ======================================================

function createHouse(x, z) {

    const group = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(
            9,
            5,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0xc7b59b
        })
    );

    body.position.y = 2.5;

    group.add(body);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(
            7,
            4,
            4
        ),
        new THREE.MeshStandardMaterial({
            color: 0x713b32
        })
    );

    roof.position.y = 7;

    roof.rotation.y =
        Math.PI / 4;

    group.add(roof);

    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);
}

createHouse(-45, 35);
createHouse(45, 35);
createHouse(-45, -35);
createHouse(45, -35);

// ======================================================
// CHAMPS
// ======================================================

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
            color: 0x6d963f,
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
    -100,
    0,
    60,
    150
);

createField(
    100,
    0,
    60,
    150
);

// ======================================================
// ARBRES
// ======================================================

const treeGeometry = new THREE.ConeGeometry(
    1.8,
    4,
    6
);

const treeMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x245c2a
    });

const trees = new THREE.InstancedMesh(
    treeGeometry,
    treeMaterial,
    250
);

const treeMatrix =
    new THREE.Matrix4();

for (let i = 0; i < 250; i++) {

    const side =
        Math.random() < 0.5
            ? -1
            : 1;

    const x =
        side *
        (35 + Math.random() * 90);

    const z =
        -110 +
        Math.random() * 220;

    const scale =
        0.7 +
        Math.random() * 0.7;

    treeMatrix.makeScale(
        scale,
        scale,
        scale
    );

    treeMatrix.setPosition(
        x,
        2 * scale,
        z
    );

    trees.setMatrixAt(
        i,
        treeMatrix
    );
}

scene.add(trees);

// ======================================================
// FEUX
// ======================================================

function createTrafficLight(
    x,
    z
) {

    const pole = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.25,
            5,
            0.25
        ),
        new THREE.MeshStandardMaterial({
            color: 0x222222
        })
    );

    pole.position.set(
        x,
        2.5,
        z
    );

    scene.add(pole);

    const red = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.22,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
    );

    red.position.set(
        x,
        4.3,
        z
    );

    scene.add(red);

    const orange = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.22,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xffaa00
        })
    );

    orange.position.set(
        x,
        3.7,
        z
    );

    scene.add(orange);

    const green = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.22,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0x00ff44
        })
    );

    green.position.set(
        x,
        3.1,
        z
    );

    scene.add(green);
}

createTrafficLight(
    -8,
    -7
);

createTrafficLight(
    8,
    7
);

// ======================================================
// PERSONNAGE
// ======================================================

const player = new THREE.Group();

const playerBody = new THREE.Mesh(
    new THREE.BoxGeometry(
        1,
        1.6,
        0.6
    ),
    new THREE.MeshStandardMaterial({
        color: 0x1e5cff
    })
);

playerBody.position.y = 1.6;

player.add(playerBody);

const playerHead = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.42,
        12,
        10
    ),
    new THREE.MeshStandardMaterial({
        color: 0xffc49a
    })
);

playerHead.position.y = 2.75;

player.add(playerHead);

// bras

const armL = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.25,
        1.1,
        0.25
    ),
    new THREE.MeshStandardMaterial({
        color: 0x1e5cff
    })
);

armL.position.set(
    -0.7,
    1.65,
    0
);

player.add(armL);

const armR = armL.clone();

armR.position.x = 0.7;

player.add(armR);

// jambes

const legL = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.3,
        1.1,
        0.3
    ),
    new THREE.MeshStandardMaterial({
        color: 0x222222
    })
);

legL.position.set(
    -0.25,
    0.55,
    0
);

player.add(legL);

const legR = legL.clone();

legR.position.x = 0.25;

player.add(legR);

player.position.set(
    0,
    0,
    20
);

scene.add(player);

// ======================================================
// VOITURE DU JOUEUR
// ======================================================

function createPlayerCar() {

    const car = new THREE.Group();

    const blue =
        new THREE.MeshStandardMaterial({
            color: 0x1265d8,
            metalness: 0.35,
            roughness: 0.3
        });

    const black =
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.4
        });

    const glass =
        new THREE.MeshStandardMaterial({
            color: 0x172536,
            metalness: 0.2,
            roughness: 0.15
        });

    const red =
        new THREE.MeshBasicMaterial({
            color: 0xff1111
        });

    const white =
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

    // carrosserie

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(
            4.4,
            0.9,
            8
        ),
        blue
    );

    body.position.y = 0.9;

    car.add(body);

    // capot

    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(
            4.2,
            0.3,
            2.2
        ),
        blue
    );

    hood.position.set(
        0,
        1.35,
        -2.5
    );

    car.add(hood);

    // cabine

    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            3.5,
            1.1,
            3.3
        ),
        glass
    );

    roof.position.set(
        0,
        1.65,
        0.5
    );

    car.add(roof);

    // fenêtres avant

    const frontWindow = new THREE.Mesh(
        new THREE.BoxGeometry(
            3.1,
            0.65,
            0.08
        ),
        glass
    );

    frontWindow.position.set(
        0,
        1.75,
        -1.25
    );

    car.add(frontWindow);

    // fenêtres arrière

    const rearWindow = frontWindow.clone();

    rearWindow.position.z = 2.2;

    car.add(rearWindow);

    // roues

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.65,
            0.65,
            0.45,
            12
        );

    function createWheel(
        x,
        z
    ) {

        const steering =
            new THREE.Group();

        const wheel =
            new THREE.Mesh(
                wheelGeometry,
                black
            );

        wheel.rotation.z =
            Math.PI / 2;

        steering.add(wheel);

        steering.position.set(
            x,
            0.65,
            z
        );

        car.add(steering);

        return steering;
    }

    const wheelFL =
        createWheel(-2.15, -2.5);

    const wheelFR =
        createWheel(2.15, -2.5);

    const wheelRL =
        createWheel(-2.15, 2.5);

    const wheelRR =
        createWheel(2.15, 2.5);

    // phares

    const lightL = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.8,
            0.25,
            0.15
        ),
        white
    );

    lightL.position.set(
        -1.35,
        1.05,
        -4.08
    );

    car.add(lightL);

    const lightR =
        lightL.clone();

    lightR.position.x = 1.35;

    car.add(lightR);

    // feux arrière

    const rearL = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.8,
            0.25,
            0.15
        ),
        red
    );

    rearL.position.set(
        -1.35,
        1.05,
        4.08
    );

    car.add(rearL);

    const rearR =
        rearL.clone();

    rearR.position.x = 1.35;

    car.add(rearR);

    // rétroviseurs

    const mirrorL = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.35,
            0.25,
            0.5
        ),
        black
    );

    mirrorL.position.set(
        -2.2,
        1.35,
        -0.6
    );

    car.add(mirrorL);

    const mirrorR =
        mirrorL.clone();

    mirrorR.position.x = 2.2;

    car.add(mirrorR);

    // pare-chocs

    const bumperFront =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                4.5,
                0.35,
                0.35
            ),
            black
        );

    bumperFront.position.set(
        0,
        0.55,
        -4.05
    );

    car.add(bumperFront);

    const bumperRear =
        bumperFront.clone();

    bumperRear.position.z =
        4.05;

    car.add(bumperRear);

    // échappements

    const exhaustL =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12,
                0.12,
                0.5,
                8
            ),
            black
        );

    exhaustL.rotation.x =
        Math.PI / 2;

    exhaustL.position.set(
        -0.8,
        0.55,
        4.15
    );

    car.add(exhaustL);

    const exhaustR =
        exhaustL.clone();

    exhaustR.position.x = 0.8;

    car.add(exhaustR);

    // spoiler

    const spoiler =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3.5,
                0.2,
                0.25
            ),
            black
        );

    spoiler.position.set(
        0,
        2.05,
        3.45
    );

    car.add(spoiler);

    car.userData.wheels = [
        wheelFL,
        wheelFR,
        wheelRL,
        wheelRR
    ];

    return car;
}

const playerCar =
    createPlayerCar();

playerCar.position.set(
    4,
    0,
    10
);

scene.add(playerCar);

// ======================================================
// TOUCHES
// ======================================================

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = true;

        if (
            event.key.toLowerCase()
            === "e"
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

// ======================================================
// VARIABLES
// ======================================================

let inCar = false;

let carSpeed = 0;

const carMaxSpeed = 20;

const carReverseSpeed = 8;

const carAcceleration = 10;

const carFriction = 6;

const carTurnSpeed = 1.9;

const playerSpeed = 7;

let walkTime = 0;

// ======================================================
// ENTRER / SORTIR
// ======================================================

function toggleVehicle() {

    const distance =
        player.position.distanceTo(
            playerCar.position
        );

    if (!inCar) {

        if (distance < 5) {

            inCar = true;

            player.visible = false;
        }

    } else {

        inCar = false;

        player.visible = true;

        player.position.set(
            playerCar.position.x + 4,
            0,
            playerCar.position.z
        );

        carSpeed = 0;
    }
}

// ======================================================
// PERSONNAGE
// ======================================================

function updatePlayer(delta) {

    if (inCar) return;

    let forward = 0;

    let sideways = 0;

    if (
        keys["z"] ||
        keys["w"] ||
        keys["arrowup"]
    ) {

        forward += 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        forward -= 1;
    }

    if (
        keys["q"] ||
        keys["a"] ||
        keys["arrowleft"]
    ) {

        sideways -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        sideways += 1;
    }

    const moving =
        forward !== 0 ||
        sideways !== 0;

    if (moving) {

        const length =
            Math.sqrt(
                forward * forward +
                sideways * sideways
            );

        forward /= length;

        sideways /= length;

        player.position.z -=
            forward *
            playerSpeed *
            delta;

        player.position.x +=
            sideways *
            playerSpeed *
            delta;

        player.rotation.y =
            Math.atan2(
                sideways,
                forward
            );

        // animation
        walkTime +=
            delta * 10;

        armL.rotation.x =
            Math.sin(walkTime) *
            0.7;

        armR.rotation.x =
            -Math.sin(walkTime) *
            0.7;

        legL.rotation.x =
            -Math.sin(walkTime) *
            0.7;

        legR.rotation.x =
            Math.sin(walkTime) *
            0.7;

    } else {

        armL.rotation.x *= 0.85;
        armR.rotation.x *= 0.85;

        legL.rotation.x *= 0.85;
        legR.rotation.x *= 0.85;
    }
}

// ======================================================
// VOITURE
// ======================================================

function updatePlayerCar(delta) {

    if (!inCar) return;

    let throttle = 0;

    if (
        keys["z"] ||
        keys["w"] ||
        keys["arrowup"]
    ) {

        throttle = 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        throttle = -1;
    }

    // accélération

    if (throttle > 0) {

        carSpeed +=
            carAcceleration *
            delta;

    } else if (throttle < 0) {

        carSpeed -=
            carAcceleration *
            delta;

    } else {

        if (carSpeed > 0) {

            carSpeed -=
                carFriction *
                delta;

            if (carSpeed < 0)
                carSpeed = 0;

        } else if (carSpeed < 0) {

            carSpeed +=
                carFriction *
                delta;

            if (carSpeed > 0)
                carSpeed = 0;
        }
    }

    carSpeed =
        THREE.MathUtils.clamp(
            carSpeed,
            -carReverseSpeed,
            carMaxSpeed
        );

    // direction

    let steering = 0;

    if (
        keys["q"] ||
        keys["a"] ||
        keys["arrowleft"]
    ) {

        steering -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        steering += 1;
    }

    if (
        Math.abs(carSpeed) > 0.1
    ) {

        playerCar.rotation.y -=
            steering *
            carTurnSpeed *
            delta *
            Math.min(
                Math.abs(carSpeed) / 8,
                1
            );
    }

    // déplacement

    playerCar.translateZ(
        -carSpeed * delta
    );

    // roues

    const wheels =
        playerCar.userData.wheels;

    if (wheels) {

        for (const wheel of wheels) {

            wheel.children[0].rotation.x +=
                carSpeed *
                delta *
                1.5;
        }

        wheels[0].rotation.y =
            steering * 0.35;

        wheels[1].rotation.y =
            steering * 0.35;
    }
}

// ======================================================
// CAMERA
// ======================================================

const cameraTarget =
    new THREE.Vector3();

function updateCamera() {

    if (inCar) {

        const offset =
            new THREE.Vector3(
                0,
                5,
                10
            );

        offset.applyQuaternion(
            playerCar.quaternion
        );

        const desiredPosition =
            playerCar.position
                .clone()
                .add(offset);

        camera.position.lerp(
            desiredPosition,
            0.08
        );

        cameraTarget.copy(
            playerCar.position
        );

        cameraTarget.y += 1;

    } else {

        const desiredPosition =
            player.position
                .clone()
                .add(
                    new THREE.Vector3(
                        0,
                        5,
                        8
                    )
                );

        camera.position.lerp(
            desiredPosition,
            0.08
        );

        cameraTarget.copy(
            player.position
        );

        cameraTarget.y += 1.5;
    }

    camera.lookAt(
        cameraTarget
    );
}

// ======================================================
// RESIZE
// ======================================================

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

// ======================================================
// BOUCLE
// ======================================================

function animate() {

    const delta =
        Math.min(
            renderer.info.render.frame
                ? 1 / 60
                : 1 / 60,
            0.05
        );

    updatePlayer(delta);

    updatePlayerCar(delta);

    updateCamera();

    renderer.render(
        scene,
        camera
    );
}

renderer.setAnimationLoop(
    animate
);
