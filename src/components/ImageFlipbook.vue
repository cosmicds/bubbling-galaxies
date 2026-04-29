<template>
  <div class="image-flipbook">
    <img
      :src="src"
      class="image-flipbook__image"
    />
    <div
      class="image-flipbook__controls">
    >
      <v-slider
        v-model="index"
        :min="min"
        :max="max"
        :step="1"
      ></v-slider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const index = defineModel<number>();

interface Props {
  min: number;
  max: number;
  frames?: string[] | (index: number) => string;
}
defineProps<Props>();

const src = computed(() => {
  if (Array.isArray(frames)) {
    return frames[index.value];
  } else {
    return frames(index.value);
  }
});
</script>

<style scoped>
.image-flipbook__controls {
  padding: 15px;
}

img {
  object-fit: contain;
  width: 80%;
}
</style>
