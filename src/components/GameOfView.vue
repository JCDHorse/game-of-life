<script lang="ts" setup>

import { ref, onMounted } from 'vue';
import GameOfLife from '../GameOfLife';

const canvas = ref<HTMLCanvasElement | null>(null);
const cellSize = 10; // taille d'une cellule en pixels
const width = 90;     // 40 cellules par ligne
const height = 90;    // 40 cellules par colonne

let game: GameOfLife;

onMounted(() => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  game = new GameOfLife(width, height);

  for (let i = 0; i < 1000; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    game.setCellState(x, y, true);
  }

  // ✅ Variables pour contrôler la vitesse du jeu
  const ticksPerSecond = 24; // nombre de ticks par seconde
  const tickInterval = 1000 / ticksPerSecond; // temps entre chaque tick en ms
  let lastTick = performance.now();

  // Boucle principale
  function draw() {
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (game.cellState(x, y)) {
          ctx.fillStyle = 'white';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  function loop() {
    const now = performance.now();

    if (now - lastTick >= tickInterval) {
      game.tick();
      lastTick = now;
    }

    draw();
    requestAnimationFrame(loop);
  }

  loop();
});
</script>

<template>

  <canvas ref="canvas" width="900" height="900"></canvas>

</template>

<style scoped>

</style>