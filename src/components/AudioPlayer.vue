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
import { ref, onBeforeUnmount , useTemplateRef, watch} from 'vue';

// const _props = defineProps<{
//   src: string;
//   fadeOutDuration?: number; // in seconds
//   fade?: boolean;
// }>();
const _props = defineProps({
  src: {
    type: String,
    required: true,
  },
  fadeOutDuration: {
    type: Number,
    required: false,
    default: undefined,
  }, // in seconds
  fade: {
    type: Boolean,
    required: false,
    default: false,
  },
});

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
  _unmuteMusic();
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
    console.log('Unmuting music:', audio.value.src);
    audio.value.muted = false;
    playing.value = true;
  }
}

function fadeOutMusic() {
  if (!audio.value) return;
  if (_props.fadeOutDuration === undefined) {
    _stopMusic();
    return;
  }
  const fadeDuration = (_props.fadeOutDuration) * 1000; // default to 2 seconds
  const fadeStep = 50; // ms
  const fadeAmount = audio.value.volume / (fadeDuration / fadeStep);

  const fadeInterval = setInterval(() => {
    if (audio.value && audio.value.volume > 0) {
      audio.value.volume = Math.max(0, audio.value.volume - fadeAmount);
    } else {
      clearInterval(fadeInterval);
      _stopMusic();
    }
  }, fadeStep);
}

watch(() => _props.fade, (newVal) => {
  if (newVal) {
    fadeOutMusic();
  }
});

onBeforeUnmount(() => {
  _stopMusic();
});
</script>

<style scoped>
audio {
  display: none;
}
</style>