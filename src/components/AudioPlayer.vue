<template>
  <div>
    <v-btn
      :icon="playing ? 'mdi-volume-high' : 'mdi-volume-off'"
      size="x-large"
      @click="() => playing ? _muteMusic() : _playMusic()"
    />
    <audio
      v-if="src"
      ref="audio-player"
      :src="src"
      :autoplay="false"
      volume="0.5"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount , useTemplateRef} from 'vue';

const _props = defineProps<{
  src: string;
}>();

// const audio = ref<HTMLAudioElement | null>(null);
const audio = useTemplateRef('audio-player');
const playing = ref(false);
// onMounted(() => {
//   if (audio.value) {
//     _playMusic();
//   }
// });

function _playMusic() {
  if (!audio.value) return;
  console.log('Playing music:', audio.value.src);
  audio.value.play();
  audio.value.onended = () => { playing.value = false; };
  playing.value = true;
}


function _stopMusic() {
  if (audio.value) {
    console.log('Stopping music:', audio.value.src);
    audio.value.pause();
    audio.value.currentTime = 0;
    playing.value = false;
  }
}

function _muteMusic() {
  if (audio.value) {
    audio.value.muted = true;
    playing.value = false;
  }
}

function _unmuteMusic() {
  if (audio.value) {
    audio.value.muted = false;
    playing.value = true;
  }
}

onBeforeUnmount(() => {
  _stopMusic();
});
</script>

<style scoped>
audio {
  display: none;
}
</style>