let score = 0;
let spawnContainer = document.querySelector('#spawn-container');
let scoreDisplay = document.getElementById('score-display');

function spawnObject() {
  const x = (Math.random() - 0.5) * 2; // -1 to 1
  const y = (Math.random() * 1.5) + 0.5; // 0.5 to 2
  const z = (Math.random() - 0.5) * 2;

  let obj = document.createElement('a-entity');
  obj.setAttribute('gltf-model', '#obj-model');
  obj.setAttribute('position', `${x} ${y} ${z}`);
  obj.setAttribute('scale', '0.5 0.5 0.5');
  obj.setAttribute('class', 'clickable');

  obj.addEventListener('click', () => {
    obj.parentNode.removeChild(obj);
    score += 1;
    scoreDisplay.innerText = `Score: ${score}`;
    setTimeout(spawnObject, 1000); // spawn baru 1 detik setelah klik
  });

  spawnContainer.appendChild(obj);
}

// Spawn pertama
setTimeout(spawnObject, 2000);
