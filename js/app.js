// Ambil objek
const box = document.querySelector('#randomBox');

// Fungsi posisi acak dalam ruang AR
function getRandomPosition() {
  const x = (Math.random() - 0.5) * 4; // -2 sampai 2
  const y = Math.random() * 2 + 0.5;   // 0.5 sampai 2.5
  const z = -Math.random() * 4 - 1;    // -1 sampai -5
  return `${x} ${y} ${z}`;
}

// Fungsi untuk memindahkan objek
function repositionBox() {
  const pos = getRandomPosition();
  box.setAttribute('position', pos);
}

// Atur posisi awal saat load
window.addEventListener('load', () => {
  repositionBox();
});

// Deteksi klik
box.addEventListener('click', () => {
  alert("🎯 Objek disentuh!");
  repositionBox();
});
