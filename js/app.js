import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.body,
  });

  const { renderer, scene, camera } = mindarThree;

  const anchor = mindarThree.addAnchor(168); // face anchor index (default)
  let score = 0;
  const scoreboard = document.getElementById('scoreboard');

  // Create the clickable object
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const object = new THREE.Mesh(geometry, material);
  object.name = "target";

  anchor.group.add(object);

  // Random position generator
  function randomPosition() {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5
    );
  }

  object.position.copy(randomPosition());

  // Lighting
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  // Raycaster for detecting clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([object], true);
    if (intersects.length > 0) {
      object.visible = false;
      score += 1;
      scoreboard.textContent = `Skor: ${score}`;
      setTimeout(() => {
        object.visible = true;
        object.position.copy(randomPosition());
      }, 1000);
    }
  }

  window.addEventListener('click', onClick);

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
