// ========== CONFIGURATION ========== //
const CONFIG = {
    GAME_DURATION: 60, // seconds
    SPAWN_RATE: 2.5, // seconds
    MAX_OBJECTS: 8,
    OBJECTS: [
        { model: "assets/models/coin.glb", scale: "0.2 0.2 0.2", points: 10 },
        { model: "assets/models/gem.glb", scale: "0.15 0.15 0.15", points: 20 },
        { model: "assets/models/treasure.glb", scale: "0.3 0.3 0.3", points: 50 }
    ]
};

// ========== GAME STATE ========== //
let score = 0;
let timeLeft = CONFIG.GAME_DURATION;
let isPlaying = false;
let activeObjects = [];
let spawnInterval;
let gameTimer;

// ========== DOM ELEMENTS ========== //
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const sceneContainer = document.getElementById("scene-container");
const exitButton = document.getElementById("exit-button");
const scoreText = document.getElementById("score-text");
const scene = document.querySelector("a-scene");

// ========== INITIALIZE GAME ========== //
document.addEventListener("DOMContentLoaded", () => {
    // Event Listeners
    startButton.addEventListener("click", startGame);
    exitButton.addEventListener("click", exitGame);

    // Enable Click/Touch on Objects
    scene.addEventListener("click", (e) => {
        if (e.target.classList.contains("collectable")) {
            collectObject(e.target);
        }
    });

    // Fallback for Mobile Touch
    scene.addEventListener("touchstart", (e) => {
        if (e.target.classList.contains("collectable")) {
            collectObject(e.target);
        }
    });
});

// ========== GAME FUNCTIONS ========== //
async function startGame() {
    try {
        // Request Camera Permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Switch UI
        startScreen.style.display = "none";
        sceneContainer.style.display = "block";
        
        // Reset Game
        score = 0;
        timeLeft = CONFIG.GAME_DURATION;
        updateScore();
        
        // Start Game Loop
        isPlaying = true;
        spawnInterval = setInterval(spawnObject, CONFIG.SPAWN_RATE * 1000);
        gameTimer = setInterval(updateTimer, 1000);
        
        // Initial Spawn
        spawnObject();
        
    } catch (error) {
        alert("Failed to access camera: " + error.message);
    }
}

function spawnObject() {
    if (!isPlaying || activeObjects.length >= CONFIG.MAX_OBJECTS) return;

    const objConfig = CONFIG.OBJECTS[Math.floor(Math.random() * CONFIG.OBJECTS.length)];
    
    // Random Position (1-3 meters away)
    const angle = Math.random() * Math.PI * 2;
    const distance = 1 + Math.random() * 2;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Create Object
    const obj = document.createElement("a-entity");
    obj.setAttribute("gltf-model", objConfig.model);
    obj.setAttribute("scale", objConfig.scale);
    obj.setAttribute("position", `${x} 0 ${z}`);
    obj.setAttribute("class", "collectable");
    obj.setAttribute("animation", `property: rotation; to: 0 360 0; loop: true; dur: 8000`);
    obj.setAttribute("data-points", objConfig.points);
    
    // Track Object
    scene.appendChild(obj);
    activeObjects.push(obj);
}

function collectObject(obj) {
    // Add Score
    score += parseInt(obj.getAttribute("data-points"));
    updateScore();
    
    // Play Sound
    playSound("assets/sounds/collect.mp3");
    
    // Animate & Remove
    obj.setAttribute("animation", `property: scale; to: 0 0 0; dur: 200`);
    setTimeout(() => {
        scene.removeChild(obj);
        activeObjects = activeObjects.filter(item => item !== obj);
    }, 200);
}

function updateTimer() {
    timeLeft--;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function updateScore() {
    scoreText.setAttribute("value", `Score: ${score}`);
}

function playSound(soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch(e => console.log("Audio error:", e));
}

function endGame() {
    isPlaying = false;
    clearInterval(spawnInterval);
    clearInterval(gameTimer);
    
    alert(`Game Over! Your Score: ${score}`);
    exitGame();
}

function exitGame() {
    // Cleanup
    activeObjects.forEach(obj => scene.removeChild(obj));
    activeObjects = [];
    
    // Stop Camera
    const video = document.querySelector("video");
    if (video) {
        video.srcObject?.getTracks()?.forEach(track => track.stop());
    }
    
    // Reset UI
    sceneContainer.style.display = "none";
    startScreen.style.display = "block";
}
