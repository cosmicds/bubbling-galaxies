<template>
  <div class="image-flipbook">
    <img
      :src="src"
      class="image-flipbook__image"
    />
    <div
      class="image-flipbook__controls"
    >
      <v-btn
        :icon="playing ? 'mdi-pause' : 'mdi-play'"
        variant="outlined"
        @click="playing = !playing"
        density="comfortable"
        :color="color"
      ></v-btn>
      <v-slider
        v-model="index"
        :min="min"
        :max="max"
        :step="1"
        :color="color"
        hide-details
      ></v-slider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const index = defineModel<number>();

const playing = ref(false);
let interval: ReturnType<typeof setInterval> | null = null;

watch(playing, (play: boolean) => {
  if (play) {
    interval = setInterval(() => {
      if (index.value !== undefined && index.value < props.max - 1) {
        index.value += 1;
      } else {
        index.value = props.min;
      }
    }, props.interval);
  } else if (interval != null) {
    clearInterval(interval);
    interval = null;
  }
});

interface Props {
  min?: number;
  max: number;
  frames: string[] | ((index: number) => string);
  interval?: number;  // in ms
  color?: string;
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  interval: 100,
  color: "white",
});

const src = computed(() => {
  const idx = index.value ?? 0;
  if (Array.isArray(props.frames)) {
    return props.frames[idx];
  } else {
    return props.frames(idx);
  }
});
</script>

<style scoped>
.image-flipbook__controls {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

img {
  object-fit: contain;
  width: 80%;
}
</style>
