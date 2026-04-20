<template>
  <div id="imageset-offsetter">
    <v-slider 
      v-model="rot" 
      :min="0"
      :max="360"
      label="Rotation (deg)"
    />
    <v-slider 
      v-model="offsetArcmin" 
      :min="0"
      :max="60"
      label="Offset (arcmin)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';


const rot = defineModel<number>('rotation', {default: 0, required: true});
const offset = defineModel<number>('offset', {default: 0, required: true});

const offsetArcmin = computed({
  get: () => offset.value * 60,
  set: (value) => {
    offset.value = value / 60;
  }
  
});
</script>

<style>
#imageset-offsetter {
  width: 500px;
  pointer-events: auto;
}
</style>