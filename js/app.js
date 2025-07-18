// ====== KONFIGURASI ====== //
const CONFIG = {
    GAME_DURATION: 60,
    SPAWN_RATE: 2,
    MAX_OBJECTS: 5,
    OBJECTS: [
        { model: "assets/models/coin.glb", scale: "0.2 0.2 0.2", points: 10 },
        { model: "assets/models/gem.glb", scale: "0.3 0.3 0.3", points: 20 }
    ]
};

// ====== STATE GAME ====== //
let score = 0;
let activeObjects = [];
let isGameActive = false;

// ====== ELEMEN DOM ====== //
const startButton = document.getElementById('start-button');
const scene = document.querySelector('a-scene');
const scoreText = document.getElementById('score-text');

// ====== INISIALISASI ====== //
startButton.addEventListener('click', startGame);
scene.addEventListener('loaded', initAR);

function initAR() {
    console.log("AR Scene siap!");
    scene.addEventListener('click', handleClick);
    scene.addEventListener('touchstart', handleClick);
}

function startGame() {
    // Reset game
    score = 0;
    activeObjects = [];
    isGameActive = true;
    updateScore();
    
    // Mulai spawn objek
    setInterval(spawnObject, CONFIG.SPAWN_RATE * 1000);
}

function spawnObject() {
    if (!isGameActive || activeObjects.length >= CONFIG.MAX_OBJECTS) return;
    
    const objData = CONFIG.OBJECTS[Math.floor(Math.random() * CONFIG.OBJECTS.length)];
    const obj = document.createElement('a-entity');
    
    // Posisi acak di permukaan yang terdeteksi
    const x = (Math.random() - 0.5) * 2;
    const z = (Math.random() - 0.5) * 2;
    
    obj.setAttribute('gltf-model', objData.model);
    obj.setAttribute('scale', objData.scale);
    obj.setAttribute('position', `${x} 0 ${z}`);
    obj.setAttribute('class', 'collectable');
    obj.setAttribute('data-points', objData.points);
    obj.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 5000');
    
    scene.appendChild(obj);
    activeObjects.push(obj);
}

function handleClick(event) {
    if (!isGameActive) return;
    
    const clickedObj = event.target.closest('.collectable');
    if (clickedObj) {
        collectObject(clickedObj);
    }
}

function collectObject(obj) {
    const points = parseInt(obj.getAttribute('data-points'));
    score += points;
    updateScore();
    
    // Animasi hilang
    obj.setAttribute('animation', {
        property: 'scale',
        to: '0 0 0',
        dur: 200,
        easing: 'easeInCubic'
    });
    
    // Hapus dari scene
    setTimeout(() => {
        scene.removeChild(obj);
        activeObjects = activeObjects.filter(o => o !== obj);
    }, 200);
}

function updateScore() {
    scoreText.setAttribute('value', `Score: ${score}`);
}
