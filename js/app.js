// Konfigurasi Game
const config = {
    gameDuration: 30, // detik
    spawnInterval: 2, // detik
    objectCount: 5,
    models: [
        { path: 'assets/models/coin.glb', scale: '0.2 0.2 0.2', points: 10 },
        { path: 'assets/models/gem.glb', scale: '0.15 0.15 0.15', points: 20 },
        { path: 'assets/models/chest.glb', scale: '0.25 0.25 0.25', points: 30 }
    ]
};

// State Game
let score = 0;
let timeLeft = config.gameDuration;
let gameInterval;
let spawnInterval;
let activeObjects = [];

// Elemen UI
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const sceneContainer = document.getElementById('scene-container');
const exitButton = document.getElementById('exit-ar');
const scoreText = document.getElementById('score-text');
const timerText = document.getElementById('timer-text');
const scene = document.querySelector('a-scene');

// Inisialisasi
startButton.addEventListener('click', startARGame);
exitButton.addEventListener('click', exitARGame);

// Fungsi Utama
// Di app.js
async function startARGame() {
    console.log("Starting AR Game...");
    
    try {
        // 1. Check WebXR support
        if (!navigator.xr) {
            throw new Error("WebXR not supported");
        }

        // 2. Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        console.log("Camera access granted");

        // 3. Setup UI
        startScreen.style.display = 'none';
        sceneContainer.style.display = 'block';
        
        // 4. Initialize AR scene
        await scene.systems['arjs'].start();
        console.log("AR system started");

        // 5. Start game logic
        score = 0;
        timeLeft = config.gameDuration;
        activeObjects = [];
        updateScore();
        updateTimer();
        
        gameInterval = setInterval(updateGame, 1000);
        spawnInterval = setInterval(spawnObjects, config.spawnInterval * 1000);
        spawnObjects();
        
    } catch (error) {
        console.error("AR initialization failed:", error);
        alert(`Failed to start AR: ${error.message}`);
        
        // Fallback to non-AR mode for testing
        if (confirm("AR not available. Continue in test mode?")) {
            startScreen.style.display = 'none';
            sceneContainer.style.display = 'block';
            // ... start game without AR
        }
    }
}

function exitARGame() {
    // Hentikan interval
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    
    // Hapus semua objek
    removeAllObjects();
    
    // Kembali ke start screen
    sceneContainer.style.display = 'none';
    startScreen.style.display = 'block';
}

function updateGame() {
    timeLeft--;
    updateTimer();
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function updateScore() {
    scoreText.setAttribute('value', `Score: ${score}`);
}

function updateTimer() {
    timerText.setAttribute('value', `Time: ${timeLeft}`);
}

function spawnObjects() {
    // Hapus objek yang sudah lama
    cleanupObjects();
    
    // Spawn objek baru jika belum mencapai batas
    if (activeObjects.length < config.objectCount) {
        const objectsToSpawn = Math.min(2, config.objectCount - activeObjects.length);
        
        for (let i = 0; i < objectsToSpawn; i++) {
            spawnRandomObject();
        }
    }
}

function spawnRandomObject() {
    const model = config.models[Math.floor(Math.random() * config.models.length)];
    
    // Posisi acak di sekitar pengguna (dalam radius 1-3 meter)
    const angle = Math.random() * Math.PI * 2;
    const distance = 1 + Math.random() * 2;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    const entity = document.createElement('a-entity');
    entity.setAttribute('gltf-model', model.path);
    entity.setAttribute('scale', model.scale);
    entity.setAttribute('position', `${x} 0 ${z}`);
    entity.setAttribute('class', 'clickable-object');
    entity.setAttribute('animation', {
        property: 'rotation',
        to: `0 ${360 + (Math.random() * 180)} 0`,
        loop: true,
        dur: 5000 + Math.random() * 5000
    });
    
    // Tambahkan komponen untuk interaksi
    entity.setAttribute('cursor-listener', '');
    
    // Simpan data objek
    const objectData = {
        element: entity,
        points: model.points,
        spawnTime: Date.now()
    };
    
    activeObjects.push(objectData);
    scene.appendChild(entity);
}

function cleanupObjects() {
    const now = Date.now();
    const maxLifetime = 15000; // 15 detik
    
    activeObjects = activeObjects.filter(obj => {
        if (now - obj.spawnTime > maxLifetime) {
            scene.removeChild(obj.element);
            return false;
        }
        return true;
    });
}

function removeAllObjects() {
    activeObjects.forEach(obj => {
        scene.removeChild(obj.element);
    });
    activeObjects = [];
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    
    alert(`Game Over! Your score: ${score}`);
    exitARGame();
}

// Komponen A-Frame untuk menangani klik
AFRAME.registerComponent('cursor-listener', {
    init: function() {
        this.el.addEventListener('click', (evt) => {
            // Cari objek yang diklik
            const clickedObj = activeObjects.find(obj => obj.element === this.el);
            
            if (clickedObj) {
                // Animasi menghilang
                this.el.setAttribute('animation', {
                    property: 'scale',
                    to: '0 0 0',
                    dur: 200,
                    easing: 'easeInCubic'
                });
                
                // Hapus setelah animasi
                setTimeout(() => {
                    scene.removeChild(this.el);
                    activeObjects = activeObjects.filter(obj => obj.element !== this.el);
                    
                    // Tambah skor
                    score += clickedObj.points;
                    updateScore();
                    
                    // Mainkan sound effect
                    playSound('assets/sounds/collect.mp3');
                }, 200);
            }
        });
    }
});

// Fungsi untuk memainkan suara
function playSound(soundPath) {
    const sound = new Audio(soundPath);
    sound.play().catch(e => console.log("Audio play failed:", e));
}
