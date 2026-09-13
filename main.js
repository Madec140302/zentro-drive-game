import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// ZENTRO V.2
// PERSONNAGE + VOITURE SPORTIVE + CONDUITE
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b9e8);

scene.fog = new THREE.Fog(
    0x87b9e8,
    60,
    180
);

// =====================================================
// CAMÉRA
// =====================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 4, -8);

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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);

// =====================================================
// LUMIÈRES
// =====================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.5
);

sun.position.set(
    40,
    60,
    20
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;

scene.add(sun);

const ambient =
    new THREE.HemisphereLight(
        0xffffff,
        0x445544,
        1.6
    );

scene.add(ambient);

// =====================================================
// SOL
// =====================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
        300,
        300
    ),
    new THREE.MeshStandardMaterial({
        color: 0x3f7d45,
        roughness: 0.9
    })
);

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// =====================================================
// ROUTE
// =====================================================

const road = new THREE.Mesh(
    new THREE.BoxGeometry(
        14,
        0.18,
        180
    ),
    new THREE.MeshStandardMaterial({
        color: 0x242424,
        roughness: 0.8
    })
);

road.position.y = 0.08;

road.receiveShadow = true;

scene.add(road);

// =====================================================
// LIGNES ROUTE
// =====================================================

const lineMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x222222
    });

for (
    let z = -85;
    z < 90;
    z += 10
) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.22,
            0.035,
            4
        ),
        lineMaterial
    );

    line.position.set(
        0,
        0.19,
        z
    );

    scene.add(line);
}

// =====================================================
// BORDURES
// =====================================================

const curbMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xaaaaaa
    });

const leftCurb = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.35,
        0.25,
        180
    ),
    curbMaterial
);

leftCurb.position.set(
    -7.2,
    0.12,
    0
);

scene.add(leftCurb);

const rightCurb = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.35,
        0.25,
        180
    ),
    curbMaterial
);

rightCurb.position.set(
    7.2,
    0.12,
    0
);

scene.add(rightCurb);

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

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.75
            })
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    scene.add(building);
}

createBuilding(
    -17,
    -20,
    10,
    14,
    12,
    0x777777
);

createBuilding(
    -18,
    10,
    10,
    9,
    12,
    0x8b8b8b
);

createBuilding(
    18,
    -15,
    10,
    18,
    12,
    0x686868
);

createBuilding(
    18,
    18,
    10,
    13,
    12,
    0x777777
);

createBuilding(
    -20,
    42,
    12,
    16,
    12,
    0x707070
);

createBuilding(
    20,
    48,
    12,
    20,
    12,
    0x626262
);

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

body.castShadow = true;

player.add(body);

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

head.castShadow = true;

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

leftLeg.castShadow = true;

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

rightLeg.castShadow = true;

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

leftArm.castShadow = true;

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

rightArm.castShadow = true;

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

// =====================================================
// CARROSSERIE BASSE
// =====================================================

const carBodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x1565ff,
        metalness: 0.65,
        roughness: 0.22
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

carBody.castShadow = true;
carBody.receiveShadow = true;

car.add(carBody);

// =====================================================
// CAPOT
// =====================================================

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

hood.castShadow = true;

car.add(hood);

// =====================================================
// TOIT / CABINE
// =====================================================

const cabinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.4,
        roughness: 0.2
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
    1.65,
    -0.25
);

cabin.castShadow = true;

car.add(cabin);

// =====================================================
// VITRES
// =====================================================

const glassMaterial =
    new THREE.MeshPhysicalMaterial({
        color: 0x0b1726,
        metalness: 0.05,
        roughness: 0.05,
        transmission: 0.05,
        transparent: true,
        opacity: 0.82
    });

// Pare-brise
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

// Lunette arrière
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
        roughness: 0.1
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
        0.5,
        0.5,
        0.34,
        28
    );

const tireMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.9
    });

const rimMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xbfc7d1,
        metalness: 0.9,
        roughness: 0.15
    });

function createWheel(
    x,
    z,
    front
) {

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

    const tire =
        new THREE.Mesh(
            wheelGeometry,
            tireMaterial
        );

    tire.rotation.z =
        Math.PI / 2;

    tire.castShadow = true;

    wheel.add(tire);

    const rim =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.27,
                0.27,
                0.36,
                20
            ),
            rimMaterial
        );

    rim.rotation.z =
        Math.PI / 2;

    wheel.add(rim);

    return {
        steering,
        wheel,
        front
    };
}

const frontLeftWheel =
    createWheel(
        -1.72,
        1.75,
        true
    );

const frontRightWheel =
    createWheel(
        1.72,
        1.75,
        true
    );

const rearLeftWheel =
    createWheel(
        -1.72,
        -1.75,
        false
    );

const rearRightWheel =
    createWheel(
        1.72,
        -1.75,
        false
    );

// =====================================================
// PHARES
// =====================================================

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 3
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
        1.12,
        2.78
    );

    car.add(light);

    return light;
}

createHeadlight(-0.85);
createHeadlight(0.85);

// =====================================================
// LUMIÈRES RÉELLES
// =====================================================

const leftHeadLight =
    new THREE.SpotLight(
        0xffffff,
        4,
        30,
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

car.add(leftHeadLight);
car.add(leftHeadLight.target);

const rightHeadLight =
    new THREE.SpotLight(
        0xffffff,
        4,
        30,
        Math.PI / 7,
        0.5,
        1
    );

rightHeadLight.position.set(
    0.85,
    1.1,
    2.75
);

rightHeadLight.target.position.set(
    0.85,
    0,
    15
);

car.add(rightHeadLight);
car.add(rightHeadLight.target);

// =====================================================
// FEUX ARRIÈRE
// =====================================================

const rearLightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff1010,
        emissive: 0xff0000,
        emissiveIntensity: 2
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
        -2.78
    );

    car.add(light);
}

createRearLight(-0.85);
createRearLight(0.85);

// =====================================================
// RÉTROVISEURS
// =====================================================

const mirrorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.6,
        roughness: 0.2
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
        1.55,
        0.65
    );

    mirror.rotation.y =
        x > 0 ? -0.15 : 0.15;

    mirror.castShadow = true;

    car.add(mirror);
}

createMirror(-1.48);
createMirror(1.48);

// =====================================================
// PARE-CHOCS
// =====================================================

const bumperMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.55
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
    0.55,
    2.72
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
    0.55,
    -2.72
);

car.add(rearBumper);

// =====================================================
// ÉCHAPPEMENTS
// =====================================================

const exhaustMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.85,
        roughness: 0.25
    });

function createExhaust(x) {

    const exhaust =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12,
                0.12,
                0.35,
                16
            ),
            exhaustMaterial
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
// PETIT AILERON
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
    1.35,
    -2.45
);

car.add(spoiler);

const spoilerSupports =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.7,
            0.45,
            0.08
        ),
        bumperMaterial
    );

spoilerSupports.position.set(
    0,
    1.15,
    -2.45
);

car.add(spoilerSupports);

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
// OMBRES VOITURE
// =====================================================

car.traverse(
    function(object) {

        if (object.isMesh) {

            object.castShadow = true;
            object.receiveShadow = true;
        }
    }
);

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

        body.position.y =
            1 +
            Math.abs(
                Math.sin(
                    walkTime * 2
                )
            ) * 0.025;

        head.position.y =
            1.95 +
            Math.abs(
                Math.sin(
                    walkTime * 2
                )
            ) * 0.015;

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

        body.position.y =
            THREE.MathUtils.lerp(
                body.position.y,
                1,
                0.15
            );

        head.position.y =
            THREE.MathUtils.lerp(
                head.position.y,
                1.95,
                0.15
            );
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
// DIRECTION DES ROUES AVANT
// =====================================================

function steerWheels(
    steering
) {

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
// ENTRER DANS LA VOITURE
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

// =====================================================
// SORTIR
// =====================================================

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
    }

    // FRICTION
    else {

        if (carSpeed > 0) {

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

    // LIMITES
    carSpeed =
        THREE.MathUtils.clamp(
            carSpeed,
            -carReverseSpeed,
            carMaxSpeed
        );

    if (
        Math.abs(carSpeed) <
        0.05
    ) {

        if (
            !keys["z"] &&
            !keys["w"] &&
            !keys["s"] &&
            !keys["arrowup"] &&
            !keys["arrowdown"]
        ) {

            carSpeed = 0;
        }
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

    steerWheels(
        steering
    );

    // DÉPLACEMENT
    car.translateZ(
        carSpeed * delta
    );

    // ROUES
    rotateWheels(
        carSpeed *
        delta *
        1.8
    );
}

// =====================================================
// CAMÉRA PERSONNAGE
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

// =====================================================
// CAMÉRA VOITURE
// =====================================================

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

        let moving = false;

        if (
            keys["z"] ||
            keys["w"] ||
            keys["arrowup"]
        ) {

            player.translateZ(
                playerSpeed *
                delta
            );

            moving = true;
        }

        if (
            keys["s"] ||
            keys["arrowdown"]
        ) {

            player.translateZ(
                -playerSpeed *
                delta
            );

            moving = true;
        }

        animateCharacter(
            moving,
            delta
        );

        updatePlayerCamera();
    }

    // =================================================
    // VOITURE
    // =================================================

    else {

        driveCar(delta);

        updateCarCamera();
    }

    camera.lookAt(
        cameraTarget
    );

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
