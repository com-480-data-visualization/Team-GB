import * as THREE            from 'three';
import { GLTFLoader }        from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls }     from 'three/examples/jsm/controls/OrbitControls.js';
"use strict";

!(function() {
    const container = document.getElementById('board-container');
    if (!container) {
      console.error("No #board-container found!");
      return;
    }

    // 2) Create renderer, size it to container
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 3) Scene + Camera (use container aspect)
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 16);
    camera.rotation.set(
      THREE.MathUtils.degToRad(-25), 0, 0
    );

    // — Scene / Camera / Renderer —
    // const scene    = new THREE.Scene();
    // const camera   = new THREE.PerspectiveCamera( 60, innerWidth/innerHeight, 0.1, 1000 );
    // camera.position.set(0, 10, 16);
    // camera.rotation.set(
    //     THREE.MathUtils.degToRad(-25), 0, 0
    // );
    // const renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize(innerWidth, innerHeight);
    // document.body.appendChild(renderer.domElement);

    /**
     * Load the model
     */
    const loader = new GLTFLoader();
    let mixer, board;
    loader.load('../models/chess_board.glb',
        gltf => {
        board = gltf.scene;
        scene.add(board);
        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(board);
            gltf.animations.forEach(clip => mixer.clipAction(clip).play());
        }
        },
        xhr => console.log(`Loaded ${(xhr.loaded/xhr.total*100).toFixed(1)}%`),
        err => console.error(err)
    );

    // const orbit = new OrbitControls(camera, renderer.domElement);
    // orbit.enableDamping = true;



    /**
     * Lighting
     */
    const light  = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 15);
    light.target.position.set(0,0,0);
    scene.add(light, light.target);

    const pLight = new THREE.PointLight(0x88ccff, 0.8, 100);
    pLight.position.set(0, 10, 0);
    scene.add(pLight);

  // 1) Base ambient light for overall fill
    const ambient = new THREE.AmbientLight(0x404040, 1.5);
    //               ↑ color      ↑ intensity
    scene.add(ambient);

    // 2) Hemisphere light for sky/ground gradient
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    //                        ↑ skyColor   ↑ groundColor  ↑ intensity
    hemi.position.set(0, 50, 0);
    scene.add(hemi);

    // 3) Corner point-lights around the board
    const cornerPositions = [
    [ 10,  5,  10],
    [-10,  5,  10],
    [ 10,  5, -10],
    [-10,  5, -10]
    ];
    cornerPositions.forEach(([x,y,z]) => {
    const pl = new THREE.PointLight(0xffeecc, 0.6, 50);
    pl.position.set(x, y, z);
    scene.add(pl);
    });

    // 4) A rim spotlight for dramatic edge-lighting
    const spot = new THREE.SpotLight(0xffffff, 1);
    //                   ↑ color   ↑ intensity
    spot.position.set(0, 15, -15);
    spot.angle = Math.PI / 8;      // narrow cone
    spot.penumbra = 0.3;           // soft edge
    spot.decay = 2;
    spot.distance = 50;
    spot.target.position.set(0, 0, 0);
    scene.add(spot, spot.target);

    // 5) (Optional) Tiny colored points for accent
    const accent = new THREE.PointLight(0x0066ff, 0.3, 30);
    accent.position.set(5, 3, 0);
    scene.add(accent);


    /**
     * Animation (Smooth Path)
     */
    const pathData = [
        { 
        position: new THREE.Vector3(0.6, -10, -40),
        rotation: new THREE.Euler(0.2, THREE.MathUtils.degToRad(180), 0) // add 90° around X
        },
        { 
        position: new THREE.Vector3(0.6, 9, 15),
        rotation: new THREE.Euler(-0.3, THREE.MathUtils.degToRad(180), 0) // add 90° around X
        },
        { 
        position: new THREE.Vector3(0, 9.9, 15.5),
        rotation: new THREE.Euler(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), 0) // add 90° around X
        },
        { 
        position: new THREE.Vector3(0, 0, -5),
        rotation: new THREE.Euler(0, 0, 0) // add 90° around X
        },
    ];

    const segmentDurations = [
        6.5,   // time from waypoint 0 → 1
        0.9,
        4.0
    ];
    let segmentIndex   = 0;
    let segmentElapsed = 0; 
    let isPathAnim = true;
    let headerShown = false;

    // function restartAnimation() {
    //     totalProgress = 0;
    //     isPathAnim = true;
    //     // const startTransform = getInterpolatedTransform(0);
    //     board.quaternion.copy(startTransform.rotation);
    //     console.log('Animation restarted');
    // }
    // document.getElementById('restartBtn').addEventListener('click', restartAnimation);

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (isPathAnim && board) {
            // 1) accumulate time in this segment
            segmentElapsed += delta;
            const segTime = segmentDurations[segmentIndex];
            let t = segmentElapsed / segTime;  // 0 → 1 progress in this leg

            // 2) if this leg is done, move to the next
            if (t >= 1) {
            segmentElapsed -= segTime;      // carry over extra time
            segmentIndex++;
            if (segmentIndex >= pathData.length - 1) {
                segmentIndex = pathData.length - 1;
                isPathAnim    = false;
                t = 1;
                console.log('Path animation complete!');
            } else {
                t = segmentElapsed / segmentDurations[segmentIndex];
                console.log(`Arrived at waypoint ${segmentIndex}`);
            }
            }

            // 3) interpolate position & rotation for this leg
            const A = pathData[segmentIndex];
            const B = pathData[segmentIndex + 1] || A;
            // position
            board.position.lerpVectors(A.position, B.position, t);

            // rotation via quaternion slerp
            const qa = new THREE.Quaternion().setFromEuler(A.rotation);
            const qb = new THREE.Quaternion().setFromEuler(B.rotation);
            board.quaternion.slerpQuaternions(qa, qb, t);
        }

        if (!isPathAnim && !headerShown) {
            headerShown = true;
            document.getElementById('home-header')
                    .classList.add('visible');
        }
        // update controls & render
        // orbit.update();
        renderer.render(scene, camera);
    }

    animate();

    // — Handle resize —
    window.addEventListener('resize', () => {
        camera.aspect = innerWidth/innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
    });
})();
