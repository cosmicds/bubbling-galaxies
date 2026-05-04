<template>
  <div class="image-flipbook">
    <div
      ref="viewport"
      class="image-flipbook__viewport"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="image-flipbook__title">
        Simulation
      </div>
      <div
        class="image-flipbook__transform"
        :style="transformStyle"
      >
        <img
          ref="flipbook-image"
          :src="src"
          class="image-flipbook__image"
          draggable="false"
        />
      </div>
      <v-btn
        v-if="isTransformed"
        class="image-flipbook__reset"
        icon="mdi-restart"
        @click="resetView"
      ></v-btn>
    </div>
    <div
      class="image-flipbook__controls"
    >
      <v-btn
        :icon="playing ? 'mdi-pause' : 'mdi-play'"
        variant="outlined"
        density="comfortable"
        :color="color"
        @click="playing = !playing"
      ></v-btn>
      <v-slider
        v-model="index"
        :min="min"
        :max="max"
        :step="2"
        :color="color"
        hide-details
      >
        <template #append>
          {{ index ? (index * 0.19).toFixed(1) : 0 }} Myr
        </template>
      </v-slider>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, useTemplateRef } from "vue";


const index = defineModel<number>();

const playing = ref(false);
let intervalHandle: ReturnType<typeof setInterval> | null = null;

watch(playing, (play: boolean) => {
  if (play) {
    intervalHandle = setInterval(() => {
      if (index.value !== undefined && index.value < props.max - 1) {
        index.value += 2; // frames are every other
      } else {
        index.value = props.min;
      }
    }, props.interval);
  } else if (intervalHandle != null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
});

interface Props {
  min?: number;
  max: number;
  frames: string[] | ((index: number) => string);
  interval?: number;  // in ms
  color?: string;
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  interval: 100,
  color: "white",
  visible: false,
});

watch(() => props.visible, (visible) => {
  if (!visible) {
    playing.value = false;
  }
});

const src = computed(() => {
  const idx = index.value ?? 0;
  if (Array.isArray(props.frames)) {
    return props.frames[idx];
  } else {
    return props.frames(idx);
  }
});

/**
 * Zoom Implementation via Claude Sonnet 4.6 to make sure it
 * will work with mouse, touch and trackpad inputs
 * 
 */
const viewport = useTemplateRef("viewport");

// --- Zoom / pan state ---
const scale = ref(1);
const tx = ref(0);
const ty = ref(0);

const MIN_SCALE = 1;
const MAX_SCALE = 16;
const WHEEL_ZOOM_SENSITIVITY = 0.05;

const transformStyle = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
  transformOrigin: "0 0",
}));

const isTransformed = computed(() => scale.value !== 1 || tx.value !== 0 || ty.value !== 0);

function resetView() {
  scale.value = 1;
  tx.value = 0;
  ty.value = 0;
}

function applyZoom(px: number, py: number, ds: number) {
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value * ds));
  const actualDs = newScale / scale.value;
  tx.value = px * (1 - actualDs) + tx.value * actualDs;
  ty.value = py * (1 - actualDs) + ty.value * actualDs;
  scale.value = newScale;
}

// --- Wheel: trackpad pinch (ctrlKey) + two-finger scroll ---
function onWheel(e: WheelEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  if (e.ctrlKey) {
    // Trackpad pinch or Ctrl+wheel zoom
    const delta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 30;
    const ds = Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY);
    applyZoom(px, py, ds);
  } else {
    // Two-finger scroll or mouse wheel pan
    const factor = e.deltaMode === 0 ? 1 : 30;
    tx.value -= e.deltaX * factor;
    ty.value -= e.deltaY * factor;
  }
}

// --- Pointer events: 1-finger pan, 2-finger pinch ---
const evCache: PointerEvent[] = [];
let prevPinchDist = -1;

function onPointerDown(e: PointerEvent) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  evCache.push(e);
}

function onPointerMove(e: PointerEvent) {
  const idx = evCache.findIndex((ev) => ev.pointerId === e.pointerId);
  if (idx === -1) return;

  if (evCache.length === 1) {
    tx.value += e.clientX - evCache[0].clientX;
    ty.value += e.clientY - evCache[0].clientY;
    evCache[0] = e;
  } else if (evCache.length === 2) {
    evCache[idx] = e;
    const [p1, p2] = evCache;
    const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
    if (prevPinchDist > 0) {
      const ds = dist / prevPinchDist;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midX = (p1.clientX + p2.clientX) / 2 - rect.left;
      const midY = (p1.clientY + p2.clientY) / 2 - rect.top;
      applyZoom(midX, midY, ds);
    }
    prevPinchDist = dist;
  }
}

function onPointerUp(e: PointerEvent) {
  const idx = evCache.findIndex((ev) => ev.pointerId === e.pointerId);
  if (idx !== -1) evCache.splice(idx, 1);
  if (evCache.length < 2) prevPinchDist = -1;
}

// --- Touch Events fallback for iOS < 13 (no Pointer Events) ---
interface TouchPoint { clientX: number; clientY: number }
let prevTouchPoints: TouchPoint[] = [];

function touchPoints(list: TouchList): TouchPoint[] {
  return Array.from(list).map((t) => ({ clientX: t.clientX, clientY: t.clientY }));
}

function onTouchStart(e: TouchEvent) {
  e.preventDefault();
  prevTouchPoints = touchPoints(e.touches);
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  const cur = touchPoints(e.touches);
  if (cur.length === 1 && prevTouchPoints.length === 1) {
    tx.value += cur[0].clientX - prevTouchPoints[0].clientX;
    ty.value += cur[0].clientY - prevTouchPoints[0].clientY;
  } else if (cur.length === 2 && prevTouchPoints.length === 2) {
    const prevDist = Math.hypot(
      prevTouchPoints[0].clientX - prevTouchPoints[1].clientX,
      prevTouchPoints[0].clientY - prevTouchPoints[1].clientY,
    );
    const curDist = Math.hypot(
      cur[0].clientX - cur[1].clientX,
      cur[0].clientY - cur[1].clientY,
    );
    const ds = curDist / prevDist;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midX = (cur[0].clientX + cur[1].clientX) / 2 - rect.left;
    const midY = (cur[0].clientY + cur[1].clientY) / 2 - rect.top;
    applyZoom(midX, midY, ds);
  }
  prevTouchPoints = cur;
}

function onTouchEnd(e: TouchEvent) {
  prevTouchPoints = touchPoints(e.touches);
}

onMounted(() => {
  if (typeof PointerEvent === "undefined") {
    const vp = viewport.value as HTMLElement;
    vp.addEventListener("touchstart", onTouchStart, { passive: false });
    vp.addEventListener("touchmove", onTouchMove, { passive: false });
    vp.addEventListener("touchend", onTouchEnd);
    vp.addEventListener("touchcancel", onTouchEnd);
  }
});

onUnmounted(() => {
  if (typeof PointerEvent === "undefined") {
    const vp = viewport.value as HTMLElement;
    vp.removeEventListener("touchstart", onTouchStart);
    vp.removeEventListener("touchmove", onTouchMove);
    vp.removeEventListener("touchend", onTouchEnd);
    vp.removeEventListener("touchcancel", onTouchEnd);
  }
});


</script>

<style scoped>
.image-flipbook {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  position: relative;
}
.image-flipbook__controls {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.image-flipbook__viewport {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
  touch-action: none;
  user-select: none;
  cursor: grab;
}

.image-flipbook__viewport:active {
  cursor: grabbing;
}

.image-flipbook__reset {
  position: absolute;
  top: 1em;
  left: 1em;
  z-index: 10;
}

.image-flipbook__transform {
  width: 100%;
  height: 100%;
}

.image-flipbook__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  /* orient image properly */
  /* https://stackoverflow.com/a/32875781/11594175 */
  -webkit-transform: scale(-1,1);
  -moz-transform: scale(-1, 1);
  -o-transform: scale(-1, 1);
  transform: scale(-1, 1);
}

.image-flipbook__title {
  position: absolute;
  font-size: 1.5em;
  top: 1em;
  left: 50%;
  transform: translateX(-50%);
  color: white;
}
</style>
