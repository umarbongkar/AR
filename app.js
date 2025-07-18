import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/webxr/ARButton.js';

let scene, camera, renderer, controller;
let model;
let score = 0;

const scoreText = document.getElementById("score");

init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, { optionalFeatures: ['hit-test'] }));

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load('model/object.glb', gltf => {
    model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
  });

  const hitTestSourcePromise = new Promise((resolve, reject) => {
    renderer.xr.addEventListener('sessionstart', async () => {
      const session = renderer.xr.getSession();
      const viewerRefSpace = await session.requestReferenceSpace('viewer');
      const hitTestSource = await session.requestHitTestSource({ space: viewerRefSpace });
      resolve(hitTestSource);
    });
  });

  renderer.setAnimationLoop(async (timestamp, frame) => {
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const hitTestSource = await hitTestSourcePromise;
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length && model && !scene.getObjectByName('spawned')) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);

        const clone = model.clone();
        clone.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
        clone.name = 'spawned';

        clone.userData.clicked = false;

        clone.traverse(child => {
          child.userData.clicked = false;
        });

        scene.add(clone);
      }
    }

    renderer.render(scene, camera);
  });

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const root = obj.parent;

      if (!obj.userData.clicked) {
        obj.userData.clicked = true;
        score++;
        scoreText.innerText = `Score: ${score}`;
        scene.remove(root);
      }
    }
  });
  scene.add(controller);
}
