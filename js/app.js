document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector('#target');
  const scoreboard = document.getElementById('scoreboard');
  let score = 0;

  // Fungsi buat posisi acak di depan kamera (sekitar -3 sampai -5 meter ke depan)
  function getRandomPosition() {
    const x = (Math.random() - 0.5) * 4; // -2 sampai 2
    const y = Math.random() * 2 + 0.5;   // 0.5 sampai 2.5
    const z = -Math.random() * 2 - 3;    // -3 sampai -5
    return `${x} ${y} ${z}`;
  }

  function repositionTarget() {
    target.setAttribute('position', getRandomPosition());
    target.setAttribute('visible', true);
  }

  // Klik objek
  target.addEventListener('click', () => {
    score += 1;
    scoreboard.innerText = `Skor: ${score}`;
    target.setAttribute('visible', false);
    setTimeout(() => {
      repositionTarget();
    }, 1000);
  });

  // Posisi awal
  repositionTarget();
});
