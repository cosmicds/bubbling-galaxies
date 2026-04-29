<template>
  <v-btn
    :icon="playing ? 'mdi-volume-high' : 'mdi-volume-off'"
    size="x-large"
    @click="() => playing ? stopMusic() : playMusic()"
  />
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

const props = defineProps<{
  src: string;
}>();

const audio = ref<HTMLAudioElement | null>(null);
const playing = ref(true);

function playMusic() {
  audio.value = new Audio(props.src);
  audio.value.autoplay = true;
  audio.value.currentTime = 8;
  audio.value.play();
  audio.value.onended = () => { playing.value = false; };
  playing.value = true;
}

function stopMusic() {
  if (audio.value) {
    audio.value.pause();
    audio.value.currentTime = 0;
    playing.value = false;
  }
}

onBeforeUnmount(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.currentTime = 0;
  }
});
</script>

<style scoped>
</style>