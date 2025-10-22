<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import GameOfLife from '../GameOfLife';

const canvasWidth = ref(1300);
const canvasHeight = ref(800);

const densityRange = ref(50);
const density = computed(() => densityRange.value / 100);

const cellSizeRange = ref(50);
const cellSize = computed(() => Math.floor(cellSizeRange.value / 3));

const stepMode = ref(false);
const ticksPerSecond = ref(24);

const canvas = ref<HTMLCanvasElement | null>(null);

const width = computed(() => Math.floor(canvasWidth.value / cellSize.value));
const height = computed(() => Math.floor(canvasHeight.value / cellSize.value));

const restartEvent = ref(() => {})

let game = ref(new GameOfLife(width.value, height.value, density.value));

function draw(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.createImageData(canvasWidth.value, canvasHeight.value);
  const data = imageData.data;
  const cs = cellSize.value;
  const w = width.value;
  const h = height.value;
  const canvW = canvasWidth.value;

  const grid = game.value.getGrid();

  for (let i = 3; i < data.length; i += 4) {
    data[i] = 255;
  }

  for (let y = 0; y < h; y++) {
    const row = grid[y]!;
    for (let x = 0; x < w; x++) {
      if (row[x]) {
        const startX = x * cs;
        const startY = y * cs;

        for (let py = 0; py < cs; py++) {
          let idx = ((startY + py) * canvW + startX) * 4;
          for (let px = 0; px < cs; px++) {
            data[idx] = 255;
            data[idx + 1] = 255;
            data[idx + 2] = 255;
            data[idx + 3] = 255;
            idx += 4;
          }
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}


onMounted(() => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  let lastTick = performance.now();

  function step(now: number) {
    game.value.tick();
    draw(ctx!);
    lastTick = now;
  }

  function restartGame() {
    game.value = new GameOfLife(width.value, height.value, density.value);
    draw(ctx!);
  }

  function loop() {
    const tickInterval = 1000 / ticksPerSecond.value;
    const now = performance.now();

    if (!stepMode.value && now - lastTick >= tickInterval) {
      step(now);
    }

    requestAnimationFrame(loop);
  }

  restartEvent.value = restartGame;

  document.addEventListener('keypress', (e) => {
    if (e.code === 'Space' && stepMode.value) {
      step(performance.now());
    }
  });

  // Quand les paramètres changent
  watch([cellSize, density], () => {
    game.value = new GameOfLife(width.value, height.value, density.value);
    draw(ctx);
  });

  draw(ctx);
  loop();
});
</script>

<template>
  <div id="godOfLife">
    <div><label>Step mode: <input type="checkbox" v-model="stepMode"></label></div>
    <div><label>FPS:</label><input type="range" min="1" max="60" v-model="ticksPerSecond" /><p>{{ ticksPerSecond }}</p></div>
    <div><label>Cell size:</label><input type="range" min="1" max="100" v-model="cellSizeRange" /></div>
    <div><label>Density:</label><input type="range" min="0" max="100" v-model="densityRange" /></div>
    <button @click="restartEvent">Restart</button>
  </div>

  <div id="viewOfLife">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<style scoped>
#viewOfLife {
  display: flex;
  flex-direction: column;
}

#godOfLife {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

canvas {
  border: 1px solid white;
}
</style>
