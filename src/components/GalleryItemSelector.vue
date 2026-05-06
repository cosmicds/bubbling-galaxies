<template>
  <div
    class="gallery-item-selector"
  >
    <button
      :class="['gls__button', { 'gls__button--active': active, 'gls__button--selected': selected }]"
      type="button"
      :disabled="disabled"
      @click="emit('activate')"
    >
      <span
        v-if="thumbnailUrl"
        class="gls__thumbnail"
        :style="{ backgroundImage: `url('${thumbnailUrl}')` }"
      ></span>
      <span class="gls__button-label">{{ place ? place.get_name() : `Select ${label}` }}</span>
    </button>
    <div
      v-if="place"
      class="gls__opacity"
    >
      <span class="gls__opacity-label">{{ label }} opacity</span>
      <GalleryItem
        :place="place"
        :show-opacity="true"
        :opacity="getOpacity(place)"
        borderless
        hide-image
        hide-label
        @update:opacity="setOpacity"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { engineStore } from "@wwtelescope/engine-pinia";
import { Imageset, ImageSetLayer, Place } from "@wwtelescope/engine";
import GalleryItem from "./GalleryItem.vue";

const props = withDefaults(defineProps<{
  active?: boolean;
  disabled?: boolean;
  label: string;
  opacity?: number | null;
  selected?: boolean;
}>(), {
  active: false,
  disabled: false,
  opacity: null,
  selected: false,
});

const emit = defineEmits<{
  "activate": [];
  "update:opacity": [value: number];
}>();

const place = defineModel<Place | null>({ required: false, default: null });
const placeOpacities = ref<Record<string, number>>({});
const store = engineStore();

const imagesetLayer = computed(() => {
  if (place.value === null) return null;
  return imagesetLayerForPlace(place.value);
});

const thumbnailUrl = computed(() => {
  if (place.value === null) return null;
  return getThumbnailUrl(place.value);
});

function getImageset(place: Place): Imageset | null {
  return place.get_backgroundImageset() ?? place.get_studyImageset();
}

function getThumbnailUrl(place: Place): string | null {
  return getImageset(place)?.get_thumbnailUrl() || place.get_thumbnailUrl() || null;
}

function imagesetLayerForPlace(place: Place): ImageSetLayer | null {
  const imageset = getImageset(place);
  if (!imageset) return null;

  const url = imageset.get_url();
  const name = imageset.get_name();
  for (const guid in store.imagesetLayers) {
    const layerImageset = store.imagesetForLayer(guid);
    if (layerImageset?.get_url() === url || layerImageset?.get_name() === name) {
      return store.imagesetLayerById(guid);
    }
  }

  return null;
}

function getPlaceKey(place: Place): string {
  const imageset = getImageset(place);
  if (!imageset) {
    return place.get_name();
  }

  return imageset.get_url() || imageset.get_name();
}

function getOpacity(place: Place): number {
  if (props.opacity !== null) {
    return props.opacity;
  }

  const opacity = placeOpacities.value[getPlaceKey(place)];
  return opacity ?? 1;
}

function setOpacity(opacity: number) {
  if (!place.value) return;
  placeOpacities.value[getPlaceKey(place.value)] = opacity;
  emit("update:opacity", opacity);
  imagesetLayer.value?.set_opacity(opacity);
}

watch(imagesetLayer, (layer) => {
  if (!place.value || !layer) return;
  layer.set_opacity(getOpacity(place.value));
});
</script>

<style lang="less">
.gallery-item-selector {
  .gls__button {
    appearance: none;
    border: 1px solid transparent;
    border-radius: 6px;
    min-height: 34px;
    height: 34px;
    padding: 4px 6px;
    width: 100%;
    color: white;
    background: rgba(0,0,0,0.5);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6px);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    font-weight: bold;
    line-height: 1.1;
    text-align: center;
    text-transform: none;
  }

  .gls__button-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gls__thumbnail {
    align-self: stretch;
    flex: 0 0 34px;
    width: 34px;
    height: auto;
    border-radius: 4px;
    background-position: center;
    background-size: 200%;
  }

  .gls__button--active {
    outline: 2px solid rgba(160, 160, 160, 0.9);
    outline-offset: 0;
  }

  .gls__button--selected {
    border-color: rgba(255, 255, 255, 0.65);
  }

  .gls__opacity {
    margin-top: 2px;
  }

  .gls__opacity-label {
    display: block;
    font-size: 0.66rem;
    opacity: 0.8;
    margin-bottom: 0;
  }

  .gls__opacity .gallery-item {
    width: 100%;
    height: auto;
    border: none;
    cursor: default;
    --image-width: 100%;
  }

  .gls__opacity .gallery-opacity {
    width: 100%;
    margin: -2px 0 0;
  }
}
</style>
