<template>
  <figure
    class="lightbox__figure"
    @click="open = true"
  >
    <img
      :src="src"
      :alt="alt"
    />
    <figcaption>{{ alt }}</figcaption>
  </figure>

  <v-overlay
    v-model="open"
    class="lightbox__overlay"
    scrim="transparent"
    @click="open = false"
  >
    <img
      :src="src"
      :alt="alt"
      class="lightbox__full-img"
      @click.stop
    />
  </v-overlay>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  src: string;
  alt: string;
}>();

const open = ref(false);
</script>

<style lang="less">
.lightbox__figure {
  width: 90%;
  margin: 1.5em auto;
  background: black;
  cursor: pointer;

  img {
    width: 100%;
    display: block;
  }

  figcaption {
    padding: 0.4em 0.6em;
    font-size: 0.75em;
    color: rgb(170, 170, 170);
  }
}

.lightbox__overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__overlay > .v-overlay__scrim {
  backdrop-filter: blur(5px);
  opacity: 1;
}

.lightbox__full-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  display: block;
}
</style>
