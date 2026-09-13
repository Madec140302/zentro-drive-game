import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// ZENTRO V.1
// PERSONNAGE + VOITURE CONDUISIBLE
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
// LIGNES
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

createBuilding(-15, -15, 8, 12, 10, 0x777777);
createBuilding(-15, 10, 8, 8, 10, 0x888888);
createBuilding(15, -5, 8, 18, 10, 0x666666);
createBuilding(15, 25, 8, 14, 10, 0x777777);

// =====================================================
// PERSONNAGE
// =====================================================

const player = new THREE.Group();

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
        20,
        20
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

const car = new THREE.Group();

const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.2,
        0.75,
        5.5
    ),
    new THREE.MeshStandardMaterial({
        color: 0x1565ff,
        metalness: 0.35,
        roughness: 0.3
    })
);

carBody.position.y = 0.85;
car.add(carBody);

// =====================================================
// CABINE
// =====================================================

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.45,
        0.8,
        2.7
    ),
    new THREE.MeshStandardMaterial({
        color: 0x174a9c,
        metalness: 0.25,
        roughness: 0.25
    })
);

cabin.position.set(
    0,
    1.55,
    -0.15
);

car.add(cabin);

// =====================================================
// VITRES
// =====================================================

const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111a25,
        metalness: 0.1,
        roughness: 0.15
    });

const frontWindow = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.1,
        0.5,
        0.08
    ),
    glassMaterial
);

frontWindow.position.set(
    0,
    1.62,
    1.2
);

frontWindow.rotation.x = -0.15;
car.add(frontWindow);

const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.1,
        0.5,
        0.08
    ),
    glassMaterial
);

rearWindow.position.set(
    0,
    1.62,
    -1.5
);

rearWindow.rotation.x = 0.15;
car.add(rearWindow);

// =====================================================
// ROUES
// =====================================================

const wheelGeometry =
    new THREE.CylinderGeometry(
        0.48,
        0.48,
        0.32,
        24
    );

const tireMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.85
    });

const rimMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xbfc7d1,
        metalness: 0.8,
        roughness: 0.2
    });

function createWheel(x, z) {

    const wheel = new THREE.Group();

    const tire = new THREE.Mesh(
        wheelGeometry,
        tireMaterial
    );

    tire.rotation.z = Math.PI / 2;
    wheel.add(tire);

    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.24,
            0.24,
            0.34,
            20
        ),
        rimMaterial
    );

    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    wheel.position.set(
        x,
        0.55,
        z
    );

    car.add(wheel);

    return wheel;
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

const leftHeadlight = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.65,
        0.22,
        0.08
    ),
    headlightMaterial
);

leftHeadlight.position.set(
    -0.85,
    0.98,
    2.76
);

car.add(leftHeadlight);

const rightHeadlight = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.65,
        0.22,
        0.08
    ),
    headlightMaterial
);

rightHeadlight.position.set(
    0.85,
    0.98,
    2.76
);

car.add(rightHeadlight);

// =====================================================
// FEUX ARRIÈRE
// =====================================================

const rearLightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff1111,
        emissive: 0xff0000,
        emissiveIntensity: 1.5
    });

const leftRearLight = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.6,
        0.22,
        0.08
    ),
    rearLightMaterial
);

leftRearLight.position.set(
    -0.85,
    0.98,
    -2.76
);

car.add(leftRearLight);

const rightRearLight = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.6,
        0.22,
        0.08
    ),
    rearLightMaterial
);

rightRearLight.position.set(
    0.85,
    0.98,
    -2.76
);

car.add(rightRearLight);

// =====================================================
// PARE-CHOCS
// =====================================================

const bumperMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.5
    });

const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.05,
        0.22,
        0.25
    ),
    bumperMaterial
);

frontBumper.position.set(
    0,
    0.55,
    2.7
);

car.add(frontBumper);

const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(
        3.05,
        0.22,
        0.25
    ),
    bumperMaterial
);

rearBumper.position.set(
    0,
    0.55,
    -2.7
);

car.add(rearBumper);

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

window.addEventListener("keydown", (event) => {

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
});

window.addEventListener("keyup", (event) => {

    keys[
        event.key.toLowerCase()
    ] = false;
});

// =====================================================
// PARAMÈTRES
// =====================================================

const playerSpeed = 5;

const playerTurnSpeed = 2.8;

const carAcceleration = 10;

const carMaxSpeed = 18;

const carReverseSpeed = 7;

const carTurnSpeed = 1.8;

const carFriction = 6;

let carSpeed = 0;

let driving = false;

let walkTime = 0;

const clock = new THREE.Clock();

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

        walkTime += delta * 10;

        const swing =
            Math.sin(walkTime) * 0.65;

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
// ANIMATION ROUES
// =====================================================

function rotateWheels(
    amount
) {

    frontLeftWheel.rotation.x += amount;
    frontRightWheel.rotation.x += amount;
    rearLeftWheel.rotation.x += amount;
    rearRightWheel.rotation.x += amount;
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
// SORTIR DE LA VOITURE
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

function driveCar(delta) {

    // Accélération
    if (
        keys["z"] ||
        keys["w"] ||
        keys["arrowup"]
    ) {

        carSpeed +=
            carAcceleration * delta;
    }

    // Marche arrière / freinage
    else if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        if (carSpeed > 0) {

            carSpeed -=
                carAcceleration * 1.5 *
                delta;

        } else {

            carSpeed -=
                carAcceleration *
                0.7 *
                delta;
        }
    }

    // Friction
    else {

        if (carSpeed > 0) {

            carSpeed -=
                carFriction * delta;

        } else if (carSpeed < 0) {

            carSpeed +=
                carFriction * delta;
        }
    }

    // Limites
    carSpeed =
        THREE.MathUtils.clamp(
            carSpeed,
            -carReverseSpeed,
            carMaxSpeed
        );

    // Petit seuil
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

    // Direction
    if (
        Math.abs(carSpeed) > 0.2
    ) {

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

        car.rotation.y +=
            steering *
            carTurnSpeed *
            speedFactor *
            delta *
            (carSpeed >= 0 ? 1 : -1);
    }

    // Déplacement
    car.translateZ(
        carSpeed * delta
    );

    // Roues
    rotateWheels(
        carSpeed * delta * 1.8
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
    // ENTRER / SORTIR
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
    // MODE PERSONNAGE
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

        // Caméra personnage
        const playerOffset =
            new THREE.Vector3(
                0,
                3.5,
                -6
            );

        playerOffset.applyQuaternion(
            player.quaternion
        );

        cameraPosition
            .copy(player.position)
            .add(playerOffset);

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

    // =================================================
    // MODE VOITURE
    // =================================================

    else {

        driveCar(delta);

        // Caméra voiture
        const carOffset =
            new THREE.Vector3(
                0,
                3.2,
                -8
            );

        carOffset.applyQuaternion(
            car.quaternion
        );

        cameraPosition
            .copy(car.position)
            .add(carOffset);

        camera.position.lerp(
            cameraPosition,
            0.10
        );

        cameraTarget.set(
            car.position.x,
            car.position.y + 1,
            car.position.z
        );
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
