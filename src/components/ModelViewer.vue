<template>
  <!--
    NB:
    The source and alt attributes MUST be marked with the .attr tag.
    Otherwise Vue will attempt to pass them as props and model-viewer won't recognize them
  -->
  <model-viewer
    :src.attr="src"
    :alt.attr="alt"
    :ios-src="iosSrc"
    ar
    camera-orbit="0.9677rad 1.2427rad auto"
    :shadow-intensity="shadowIntensity"
    ar-modes="webxr quick-look"
    :camera-controls="cameraControls"
  >
    <div slot="ar-button">
      <slot name="ar-button"></slot>
    </div>
    <slot name="controls"></slot>
  </model-viewer>
</template>

<script setup lang="ts">
export interface ModelViewerProps {
  src: string;
  alt: string;
  iosSrc?: string;
  shadowIntensity?: number;
  cameraControls?: boolean;
}

const props = withDefaults(defineProps<ModelViewerProps>(), {
  shadowIntensity: 1,
  cameraControls: true,
});
</script>
