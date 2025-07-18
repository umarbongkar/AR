// ========== GAME CONFIG ========== //
const CONFIG = {
    GAME_DURATION: 60, // seconds
    SPAWN_INTERVAL: 2.5, // seconds
    MAX_OBJECTS: 6,
    OBJECTS: [
        { 
            model: "assets/models/coin.glb", 
            scale: "0.15 0.15 0.15", 
            points: 10,
            rotation: "0 360 0",
            animDuration: 8000 
        },
        { 
            model: "assets/models/gem.glb", 
            scale: "0.2 0.2 0.2", 
            points: 20,
            rotation: "0 720 0",
            animDuration: 5000 
        },
        { 
            model: "assets/models/treasure.glb", 
            scale: "0.25 0.25 0.25", 
            points: 50,
            rotation: "360 0 360",
            animDuration: 10000 
        }
    ]
};

// ========== GAME STATE ========== //
let score = 0;
let timeLeft = CONFIG.GAME_DURATION;
let isGameRunning = false;
let activeObjects = [];
let gameInterval;
let spawnInterval;
let cameraStream = null;

// ========== DOM ELEMENTS ========== //
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const arScene = document.getElementById("ar-scene");
const exitButton = document.getElementById("exit-button");
const scoreText = document.getElementById("score-text");
const timerText = document.getElementById("timer-text");
const scene = document.querySelector("a-scene");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeError = document.getElementById("close-error");

// ========== INITIALIZATION ========== //
document.addEventListener("DOMContentLoaded", () => {
    // Event Listeners
    startButton.addEventListener("click", startGame);
    exitButton.addEventListener("click", exitGame);
    closeError.addEventListener("click", () => errorModal.style.display = "none");

    // Click/Touch Events for Objects
    scene.addEventListener("click", handleObjectClick);
    scene.addEventListener("touchstart", handleObjectClick);
});

// ========== GAME FUNCTIONS ========== //
async function startGame() {
    try {
        // 1. Check WebXR Support
        if (!navigator.xr) {
            throw new Error("Browser Anda tidak mendukung AR. Gunakan Chrome atau Safari terbaru.");
        }

        // 2. Request Camera Permission
        cameraStream = await requestCameraAccess();
        
        // 3. Initialize AR Scene
        initARScene();
        
        // 4. Start Game Logic
        resetGame();
        startGameLoop();

    } catch (error) {
        showError(error.message);
        console.error("Game initialization failed:", error);
    }
}

async function requestCameraAccess() {
    try {
        const constraints = {
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Fallback to front camera if rear fails
        if (!stream) {
            constraints.video.facingMode = "user";
            return await navigator.mediaDevices.getUserMedia(constraints);
        }
        
        return stream;
    } catch (error) {
        if (error.name === "NotAllowedError") {
            throw new Error("Izin kamera ditolak. Harap izinkan akses kamera di pengaturan browser.");
        } else {
            throw new Error("Tidak dapat mengakses kamera: " + error.message);
        }
    }
}

function initARScene() {
    // Show AR Scene
    startScreen.style.display = "none";
    arScene.style.display = "block";
    
    // Wait for scene to load
    if (scene.hasLoaded) {
        onSceneReady();
    } else {
        scene.addEventListener("loaded", onSceneReady);
    }
}

function onSceneReady() {
    console.log("AR Scene ready!");
    // AR.js v3 doesn't need manual start()
}

function resetGame() {
    // Clear previous game
    clearAllObjects();
    clearIntervals();
    
    // Reset state
    score = 0;
    timeLeft = CONFIG.GAME_DURATION;
    isGameRunning = true;
    
    // Update UI
    updateScore();
    updateTimer();
}

function startGameLoop() {
    // Game timer
    gameInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Object spawner
    spawnInterval = setInterval(spawnRandomObject, CONFIG.SPAWN_INTERVAL * 1000);
    
    // Initial spawn
    for (let i = 0; i < 2; i++) {
        spawnRandomObject();
    }
}

function spawnRandomObject() {
    if (!isGameRunning || activeObjects.length >= CONFIG.MAX_OBJECTS) return;
    
    const objConfig = CONFIG.OBJECTS[Math.floor(Math.random() * CONFIG.OBJECTS.length)];
    
    // Random position (1-3 meters from camera)
    const angle = Math.random() * Math.PI * 2;
    const distance = 1 + Math.random() * 2;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = -0.5 + Math.random(); // Vary height slightly
    
    // Create object
    const obj = document.createElement("a-entity");
    obj.setAttribute("gltf-model", objConfig.model);
    obj.setAttribute("scale", objConfig.scale);
    obj.setAttribute("position", `${x} ${y} ${z}`);
    obj.setAttribute("class", "collectable");
    obj.setAttribute("data-points", objConfig.points);
    obj.setAttribute("animation", `
        property: rotation;
        to: ${objConfig.rotation};
        loop: true;
        dur: ${objConfig.animDuration};
        easing: linear
    `);
    
    // Add clickable component
    obj.setAttribute("clickable", "");
    
    // Track object
    scene.appendChild(obj);
    activeObjects.push(obj);
}

function handleObjectClick(event) {
    if (!isGameRunning) return;
    
    const clickedObj = event.target.closest(".collectable");
    if (clickedObj) {
        collectObject(clickedObj);
    }
}

function collectObject(obj) {
    // Get points value
    const points = parseInt(obj.getAttribute("data-points"));
    
    // Add score
    score += points;
    updateScore();
    
    // Play sound
    playSound("assets/sounds/collect.mp3");
    
    // Animate disappearance
    obj.setAttribute("animation", `
        property: scale;
        to: 0 0 0;
        dur: 200;
        easing: easeInCubic
    `);
    
    // Remove after animation
    setTimeout(() => {
        scene.removeChild(obj);
        activeObjects = activeObjects.filter(o => o !== obj);
        
        // Spawn new object to replace
        if (isGameRunning) {
            spawnRandomObject();
        }
    }, 200);
}

function updateScore() {
    scoreText.setAttribute("value", `Score: ${score}`);
}

function updateTimer() {
    timerText.setAttribute("value", `Time: ${timeLeft}`);
}

function endGame() {
    isGameRunning = false;
    clearIntervals();
    
    // Show final score
    setTimeout(() => {
        alert(`Game Over!\nYour Score: ${score}`);
        exitGame();
    }, 500);
}

function exitGame() {
    // Cleanup
    clearAllObjects();
    clearIntervals();
    
    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Reset UI
    arScene.style.display = "none";
    startScreen.style.display = "flex";
}

function clearAllObjects() {
    activeObjects.forEach(obj => {
        if (obj.parentNode) {
            scene.removeChild(obj);
        }
    });
    activeObjects = [];
}

function clearIntervals() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
}

function playSound(soundPath) {
    try {
        const audio = new Audio(soundPath);
        audio.play().catch(e => console.log("Audio error:", e));
    } catch (e) {
        console.log("Failed to play sound:", e);
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = "flex";
}

// Register A-Frame component
AFRAME.registerComponent("clickable", {
    init: function() {
        this.el.classList.add("clickable");
    }
});
