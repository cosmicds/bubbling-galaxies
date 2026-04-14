<template>
  <div 
    v-if="showPreview"
    class="overlay-container"
  >
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
    >
      <!-- Guideline path - subtle black -->
      <path
        d="M0 100 H200 M100 0 V200"
        stroke="white"
        stroke-width="0.5"
        stroke-dasharray="4"
        opacity="0.2"
      />

      <g id="target">
        <!-- High contrast target -->
        <rect
          x="70"
          y="70"
          width="60"
          height="60"
          rx="4"
          fill="black"
          fill-opacity="0.1"
          stroke="white"
          stroke-width="3"
        />
        <rect
          x="72"
          y="72"
          width="56"
          height="56"
          rx="2"
          fill="none"
          stroke="black"
          stroke-width="1"
        />
        <circle
          cx="100"
          cy="100"
          r="3"
          fill="white"
        />
      </g>

      <circle
        id="f1"
        class="finger"
        cx="100"
        cy="100"
        r="14"
      />
      <circle
        id="f2"
        class="finger"
        cx="100"
        cy="100"
        r="14"
      />
    </svg>
    <div class="label">
      {{ labelText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const labelText = ref('Pinch to Zoom');

let intervalId: ReturnType<typeof setInterval>;
const showPreview = ref(true);

onMounted(() => {
  
  const startTime = Date.now();
  intervalId = setInterval(() => {
    const ms = (Date.now() - startTime) % 6000;
    if (ms < 2400) labelText.value = 'Pinch to Zoom';
    else if (ms < 5100) labelText.value = 'Drag to Move';
    else labelText.value = '';
  }, 100);
  console.log('mounted gesture preview');
  // hide after a few seconds or click anywhere on screen
  setTimeout(() => showPreview.value = false, 18000);
  setTimeout(() => {
    const hide = () => showPreview.value = false;
    window.addEventListener('pointerup', hide, { once: true });
  }, 0);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
<style>
body

.overlay-container
{
  width: 200px;
  height: 200px;
  pointer-events: auto;
  position: relative;
  align-self: flex-start;
}

/* Target animation */
#target
{
  transform-origin: 100px 100px;
  animation: move-target 6s infinite ease-in-out;
}

@keyframes move-target
{

  0%,
  5%,
  30%,
  40%,
  85%,
  100%
  {
    transform: scale(1) translate(0, 0);
  }

  15%
  {
    transform: scale(1.4) translate(0, 0);
  }

  55%
  {
    transform: scale(1) translate(40px, -30px);
  }

  70%
  {
    transform: scale(1) translate(-40px, 30px);
  }
}

/* Finger animations */
.finger
{
  fill: rgba(255, 255, 255, 0.50);
  stroke: white;
  stroke-width: 2;
  opacity: 0;
  animation: move-fingers 6s infinite ease-in-out;
}

#f1
{
  --dx: -35px;
  --dy: -35px;
}

#f2
{
  --dx: 35px;
  --dy: 35px;
}

@keyframes move-fingers
{

  0%,
  40%
  {
    opacity: 0;
    transform: translate(0, 0);
  }

  5%,
  35%,
  45%,
  80%
  {
    opacity: 0.9;
  }

  15%
  {
    transform: translate(var(--dx), var(--dy));
  }

  30%
  {
    transform: translate(0, 0);
  }

  55%
  {
    transform: translate(40px, -30px);
  }

  70%
  {
    transform: translate(-40px, 30px);
  }

  85%,
  100%
  {
    opacity: 0;
    transform: translate(0, 0);
  }
}

#f2
{
  animation-name: move-f2;
}

@keyframes move-f2
{

  0%,
  35%
  {
    opacity: 0;
    transform: translate(0, 0);
  }

  5%,
  25%
  {
    opacity: 0.9;
  }

  15%
  {
    transform: translate(var(--dx), var(--dy));
  }

  30%
  {
    transform: translate(0, 0);
  }

  40%,
  100%
  {
    opacity: 0;
  }
}

.label
{
  position: absolute;
  bottom: 15%;
  width: 100%;
  text-align: center;
  font-family: sans-serif;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: white;
  text-shadow: 0 0 4px white;
}
</style>
