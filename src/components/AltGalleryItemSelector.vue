<template>
  <div class="alt-gallery-item-selector">
    <v-select
      v-model="selectedKey"
      :items="selectItems"
      :placeholder="`Select ${label}`"
      :disabled="disabled"
      density="compact"
      variant="outlined"
      hide-details
      single-line
      theme="dark"
      :class="['agls__select', { 'agls__select--active': active, 'agls__select--selected': selected }]"
      @update:menu="(val: boolean) => val && emit('activate')"
    >
      <!-- What shows inside the closed field when a value is selected -->
      <template #selection="{ item }">
        <div class="agls__selection">
          <span
            v-if="item.thumbnail"
            class="agls__thumb"
            :style="{ backgroundImage: `url('${item.thumbnail}')` }"
          />
          <span class="agls__name">{{ item.title }}</span>
        </div>
      </template>

      <!-- Each row in the open dropdown -->
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps">
          <template #title>
            <div class="agls__item">
              <span
                class="agls__item-thumb"
                :style="{ backgroundImage: `url('${item.thumbnail}')` }"
              />
              <span class="agls__item-name">{{ item.title }}</span>
            </div>
          </template>
        </v-list-item>
      </template>
    </v-select>

    <!-- Opacity slider — same structure as GalleryItemSelector -->
    <div
      v-if="place"
      class="agls__opacity"
    >
      <span class="agls__opacity-label">{{ label }} opacity</span>
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

interface SelectItem {
  title: string;
  value: string;
  thumbnail: string | null;
}

const props = withDefaults(defineProps<{
  active?: boolean;
  disabled?: boolean;
  label: string;
  opacity?: number | null;
  places: Place[];
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
const selectedKey = ref<string | null>(null);
const placeOpacities = ref<Record<string, number>>({});
const store = engineStore();

// ── Helpers ────────────────────────────────────────────────────────────────

function getImageset(p: Place): Imageset | null {
  return p.get_backgroundImageset() ?? p.get_studyImageset();
}

function getThumbnailUrl(p: Place): string | null {
  return getImageset(p)?.get_thumbnailUrl() || p.get_thumbnailUrl() || null;
}

function getPlaceKey(p: Place): string {
  const imageset = getImageset(p);
  if (!imageset) return p.get_name();
  return imageset.get_url() || imageset.get_name();
}

function imagesetLayerForPlace(p: Place): ImageSetLayer | null {
  const imageset = getImageset(p);
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

// ── Items for v-select ─────────────────────────────────────────────────────

const selectItems = computed<SelectItem[]>(() =>
  props.places.map(p => ({
    title: p.get_name(),
    value: getPlaceKey(p),
    thumbnail: getThumbnailUrl(p),
  }))
);

// ── Keep selectedKey ↔ place in sync ───────────────────────────────────────

// Outer Place model changes → update the string key v-select uses
watch(place, (p) => {
  selectedKey.value = p ? getPlaceKey(p) : null;
}, { immediate: true });

// User picks a key in the dropdown → resolve back to a Place
watch(selectedKey, (key) => {
  if (key === null) {
    place.value = null;
  } else {
    place.value = props.places.find(p => getPlaceKey(p) === key) ?? null;
  }
});

// ── Imageset layer (for opacity sync) ─────────────────────────────────────

const imagesetLayer = computed(() => {
  if (place.value === null) return null;
  return imagesetLayerForPlace(place.value);
});

function getOpacity(p: Place): number {
  if (props.opacity !== null) return props.opacity;
  return placeOpacities.value[getPlaceKey(p)] ?? 1;
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
.alt-gallery-item-selector {
  // ── Field (closed state) ───────────────────────────────────────
  .v-field {
    min-height: 34px;
    font-size: 0.72rem;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.08) !important;
  }

  .v-field__input {
    min-height: 34px;
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.72rem;
  }

  .v-field__append-inner {
    padding-top: 5px;
  }

  // Active: outline matching gls__button--active
  .agls__select--active .v-field {
    outline: 2px solid rgba(160, 160, 160, 0.9);
    outline-offset: 0;
  }

  // Selected: visible border matching gls__button--selected
  .agls__select--selected .v-field__outline {
    --v-field-border-opacity: 0.65;
  }

  // ── Selected value display inside the closed field ─────────────
  .agls__selection {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    width: 100%;
    overflow: hidden;
  }

  .agls__thumb {
    flex: 0 0 34px;
    width: 34px;
    height: 22px;
    border-radius: 3px;
    background-position: center;
    background-size: 200%;
    background-repeat: no-repeat;
  }

  .agls__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.68rem;
    font-weight: bold;
    line-height: 1.1;
  }

  // ── Dropdown list items ────────────────────────────────────────
  // (also defined at top-level below — menu is teleported out of this DOM subtree)

  // ── Opacity slider (identical to GalleryItemSelector) ──────────
  .agls__opacity {
    margin-top: 2px;
  }

  .agls__opacity-label {
    display: block;
    font-size: 0.66rem;
    opacity: 0.8;
    margin-bottom: 0;
  }

  .agls__opacity .gallery-item {
    width: 100%;
    height: auto;
    border: none;
    cursor: default;
    --image-width: 100%;
  }

  .agls__opacity .gallery-opacity {
    width: 100%;
    margin: -2px 0 0;
  }
}

// ── Dropdown item styles (top-level because v-select menu is teleported to body) ──
.agls__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agls__item-thumb {
  flex: 0 0 56px;
  width: 56px;
  height: 38px;
  border-radius: 3px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.agls__item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1.2;
}

// Open-mode size overrides (mirrors fg_picker--open .gallery-item-selector rules)
.fg_picker--open {
  .alt-gallery-item-selector {
    .v-field {
      min-height: 38px;
    }

    .v-field__input {
      min-height: 38px;
    }

    .agls__thumb {
      flex-basis: 40px;
      width: 40px;
    }

    .agls__opacity-label {
      font-size: 0.68rem;
    }
  }
}
</style>
