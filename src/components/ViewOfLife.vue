<script lang="ts" setup>

import {ref, onMounted, computed, watch, useTemplateRef} from 'vue';
import GameOfLife from '../GameOfLife';

const canvasWidth = ref(600);
const canvasHeight = ref(600);

const densityRange = ref(50);
const density = computed(() => densityRange.value / 100);

const cellSizeRange = ref(50);
const cellSize = computed(() => Math.floor(cellSizeRange.value / 3) );

const stepMode = ref(false);
const ticksPerSecond = ref(24);

const canvas = ref<HTMLCanvasElement | null>(null);

const width = computed(() => Math.floor(canvasWidth.value / cellSize.value));
const height = computed(() => Math.floor(canvasHeight.value / cellSize.value));

const restartEvent = ref();

let game = ref(new GameOfLife(width.value, height.value, density.value));

function drawCell(x: number, y: number, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x * cellSize.value, y * cellSize.value, cellSize.value, cellSize.value);
}

function draw(ctx: CanvasRenderingContext2D) {
  if (!ctx || !canvas.value) return;
  ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      if (game.value.cellState(x, y)) {
        drawCell(x, y, ctx);
      }
    }
  }
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
    const now = performance.now();
    game.value.randomGame(density.value);
    step(now);
  }

  function loop() {
    const tickInterval = 1000 / ticksPerSecond.value; // temps entre chaque tick en ms

    const now = performance.now();
    if (!stepMode.value && now - lastTick >= tickInterval) {
      step(now);
    }

    requestAnimationFrame(loop);
  }

  restartEvent.value = restartGame;

  document.addEventListener('keypress', (e) => {
    const now = performance.now();
    if (e.code === 'Space') {
      if (stepMode.value) {
        step(now);
      }
    }
  });

  watch(stepMode, () => {
    draw(ctx);
  });

  watch([cellSize, density], () => {
    game.value = new GameOfLife(width.value, height.value, density.value);
    draw(ctx);
  });


  loop();
});
</script>

<template>
  <div id="godOfLife">
    <div><label>Step mode: <input type="checkbox" v-model="stepMode"></label></div>
    <div><label>FPS: </label><input type="range" v-model="ticksPerSecond"/><p>{{ticksPerSecond}}</p></div>
    <div><label>Cell size: </label><input type="range" v-model="cellSizeRange" /></div>
    <div><label>Density: </label><input type="range" v-model="densityRange"/></div>
    <button @click="restartEvent" >Restart</button>

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
  flex-direction: column;
}
#godOfLife div {
  display: flex;
  flex-direction: row;
  justify-content: right;
}

#buttons button {
  flex: 1;
}

canvas {
  border: 1px solid white;
}

</style>