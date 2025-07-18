document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    const marker = document.querySelector('a-marker');
    const scoreText = document.querySelector('#score-text');
    
    // Daftar model 3D yang akan digunakan
    const models = [
        { path: 'assets/models/model1.glb', scale: '0.5 0.5 0.5' },
        { path: 'assets/models/model2.glb', scale: '0.3 0.3 0.3' },
        { path: 'assets/models/model3.glb', scale: '0.4 0.4 0.4' }
    ];
    
    // Fungsi untuk membuat objek 3D acak
    function spawnRandomObject() {
        // Hapus objek yang ada
        clearObjects();
        
        // Pilih model acak
        const randomModel = models[Math.floor(Math.random() * models.length)];
        
        // Posisi acak dalam area marker
        const x = (Math.random() * 0.8) - 0.4; // -0.4 sampai 0.4
        const y = (Math.random() * 0.4) + 0.2; // 0.2 sampai 0.6
        const z = (Math.random() * 0.4) - 0.2; // -0.2 sampai 0.2
        
        // Buat elemen 3D
        const entity = document.createElement('a-entity');
        entity.setAttribute('gltf-model', randomModel.path);
        entity.setAttribute('scale', randomModel.scale);
        entity.setAttribute('position', `${x} ${y} ${z}`);
        entity.setAttribute('class', 'clickable-object');
        entity.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 10000');
        
        // Tambahkan event listener untuk klik
        entity.addEventListener('click', () => {
            // Animasi menghilang
            entity.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 200; easing: easeInCubic');
            
            // Hapus elemen setelah animasi selesai
            setTimeout(() => {
                marker.removeChild(entity);
                increaseScore();
                spawnRandomObject();
            }, 200);
        });
        
        // Tambahkan ke marker
        marker.appendChild(entity);
    }
    
    // Fungsi untuk menghapus semua objek
    function clearObjects() {
        const objects = document.querySelectorAll('.clickable-object');
        objects.forEach(obj => marker.removeChild(obj));
    }
    
    // Fungsi untuk menambah skor
    function increaseScore() {
        score++;
        scoreText.setAttribute('value', `Score: ${score}`);
    }
    
    // Mulai game ketika marker terdeteksi
    marker.addEventListener('markerFound', () => {
        score = 0;
        scoreText.setAttribute('value', `Score: ${score}`);
        spawnRandomObject();
    });
    
    // Reset ketika marker hilang
    marker.addEventListener('markerLost', () => {
        clearObjects();
    });
});
