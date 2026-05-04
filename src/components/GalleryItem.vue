<template>
  <div
    :class="[
      'gallery-item',
      { 'gallery-selected': selected },
      { 'galaxy-persisted': persistent },
      { 'gallery-item__borderless': borderless },
    ]"
  >
    <img
      v-if="!hideImage"
      class="noselect"
      :src="thumbnailUrl"
    />
    <span
      v-if="!hideLabel"
      class="place-name noselect"
    >{{ place.get_name() }}</span>
    <input
      v-if="showOpacity"
      class="gallery-opacity"
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="opacity"
      @click.stop
      @input="emit('update:opacity', Number(($event.target as HTMLInputElement).value))"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Imageset, Place } from "@wwtelescope/engine";

interface Props {
  place: Place;
  selected?: boolean;
  persistent?: boolean;
  showOpacity?: boolean;
  opacity?: number;
  borderless?: boolean;
  hideLabel?: boolean;
  hideImage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  persistent: false,
  showOpacity: false,
  opacity: 1,
  borderless: false,
  hideLabel: false,
  hideImage: false,
});

const emit = defineEmits<{
  "update:opacity": [value: number];
}>();

const defaultThumbnailUrl = "https://cdn.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=test";

function getImageset(place: Place): Imageset | null {
  return place.get_backgroundImageset() ?? place.get_studyImageset();
}

const thumbnailUrl = computed(() => {
  const imagesetThumbnail = getImageset(props.place)?.get_thumbnailUrl();
  if (imagesetThumbnail) {
    return imagesetThumbnail;
  }
  
  
  const placeThumbnail = props.place.get_thumbnailUrl();
  if (placeThumbnail) {
    return placeThumbnail;
  }

  return defaultThumbnailUrl;
});
</script>
