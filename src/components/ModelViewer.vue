<!-- eslint-disable vue/no-deprecated-slot-attribute -->

<template>
  <!--
    NB:
    The source and alt attributes MUST be marked with the .attr tag.
    Otherwise Vue will attempt to pass them as props and model-viewer won't recognize them
  -->
  <model-viewer
    ref="model-viewer"
    :src.attr="src"
    :alt.attr="alt"
    ar
    camera-orbit="0.9677rad 1.2427rad auto"
    :shadow-intensity="shadowIntensity"
    ar-modes="webxr quick-look"
    :camera-controls="cameraControls"
    :tone-mapping="toneMapping"
    :min-field-of-view="minFieldOfView"
    :max-field-of-view="maxFieldOfView"
  >
    <div slot="ar-button">
      <slot name="ar-button"></slot>
    </div>
    <slot name="controls"></slot>
  </model-viewer>
</template>

<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';
export interface ModelViewerProps {
  src: string;
  alt: string;
  shadowIntensity?: number;
  cameraControls?: boolean;
  toneMapping?: "neutral" | "aces" | "agx" | "reinhard" | "cineon" | "linear" | "none";
  minFieldOfView?: `${number}deg` | "auto";
  maxFieldOfView?: `${number}deg` | "auto";
}

withDefaults(defineProps<ModelViewerProps>(), {
  shadowIntensity: 0,
  cameraControls: true,
  toneMapping: "none",
  minFieldOfView: "25deg",
  maxFieldOfView: "auto",
});

const modelViewer = useTemplateRef('model-viewer');
onMounted(() => {
  if (modelViewer.value) {
    (modelViewer.value as unknown as HTMLElement).addEventListener('error', (event: Event) => {
      console.error('Error loading model:', event);
    });
  }
});
</script>
