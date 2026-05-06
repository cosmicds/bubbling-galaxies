<template>
  <div
    :class="['fg_picker', {'gallery-open': open, 'fg_picker--open': open}]"
    :style="cssVars"
  >
    <div
      v-if="!open"
      :class="['fg_closed', 'blurred', { 'fg_closed--row': closedRow }]"
      tabindex="0"
      @click="openPicker"
      @keyup.enter="openPicker"
    >
      <div
        class="fg_closed_header"
      >
        <span class="fg_closed_title noselect">Choose Views</span>
      </div>
      <div
        class="fg_closed_content"
      >
        <GalleryItem
          v-for="{ which, place } of selectedPlaces"
          :key="`${which}-${place.get_name()}`"
          :place="place"
          :show-opacity="true"
          :opacity="getOpacity(place)"
          borderless
          :hide-label="!showLabel"
          @update:opacity="(opacity) => setOpacity(place, opacity)"
        />
      </div>
    </div>
    <div
      v-else
      class="fg_select blurred"
    >
      <!-- <div
        v-if="activePick !== null"
        class="fg_gallery"
      >
        <div
          class="fg_gallery_header"
        >
          <span class="fg_gallery_title noselect">Choose Views</span>
          <button
            class="fg_gallery_close"
            type="button"
            @click="closeMiniGallery"
            @keyup.enter="closeMiniGallery"
          >
            <v-icon
              icon="mdi-close"
              tabindex="0"
            />
          </button>
        </div>
        <div
          class="fg_gallery_content"
        >
          <GalleryItem
            v-for="[index, place] of shownPlaces.entries()"
            :key="index"
            :class="{ 'fg_item--selected': isActivePickSelection(place) }"
            :place="place"
            @click="selectPlace(place)"
          />
        </div>
      </div> -->
      <div
        class="fg_controls pl-2 pr-2 pt-1 pb-2"
      >
        <div class="fg_controls_header">
          <span class="fg_controls_title noselect">Choose Views</span>
          <v-btn
            class="fg_close"
            icon="mdi-close"
            size="x-small"
            variant="text"
            @click="closePicker"
          />
        </div>
        <!-- <GalleryItemSelector
          v-model="foreground"
          label="Foreground"
          :active="activePick === 'foreground'"
          :selected="foreground !== null"
          :opacity="foreground === null ? null : getOpacity(foreground)"
          :disabled="disabled"
          @activate="activatePick('foreground')"
          @update:opacity="(opacity) => foreground && setOpacity(foreground, opacity)"
        />
        <GalleryItemSelector
          v-model="background"
          label="Background"
          :active="activePick === 'background'"
          :selected="background !== null"
          :opacity="background === null ? null : getOpacity(background)"
          :disabled="disabled"
          @activate="activatePick('background')"
          @update:opacity="(opacity) => background && setOpacity(background, opacity)"
        /> -->
        <AltGalleryItemSelector
          v-model="foreground"
          label="Foreground"
          :places="shownPlaces"
          :active="activePick === 'foreground'"
          :selected="foreground !== null"
          :opacity="foreground === null ? null : getOpacity(foreground)"
          :disabled="disabled"
          @activate="activatePick('foreground')"
          @update:opacity="(opacity) => foreground && setOpacity(foreground, opacity)"
        />
        <AltGalleryItemSelector
          v-model="background"
          label="Background"
          :places="shownPlaces"
          :active="activePick === 'background'"
          :selected="background !== null"
          :opacity="background === null ? null : getOpacity(background)"
          :disabled="disabled"
          @activate="activatePick('background')"
          @update:opacity="(opacity) => background && setOpacity(background, opacity)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { engineStore } from "@wwtelescope/engine-pinia";
import { Imageset, ImageSetLayer, Place } from "@wwtelescope/engine";
// import GalleryItemSelector from "./GalleryItemSelector.vue";
import AltGalleryItemSelector from "./AltGalleryItemSelector.vue";
import GalleryItem from "./GalleryItem.vue";

export interface ForegroundBackgroundPickerProps {
  columns?: number | string;
  width?: string;
  selectWidth?: string;
  maxHeight?: string;
  itemHeight?: string;
  selectedColor?: string;
  persist?: string | null;
  hidePersisted?: boolean;
  disabled?: boolean;
  closedRow?: boolean;
  showLabel?: boolean;
}


const props = withDefaults(defineProps<ForegroundBackgroundPickerProps>(), {
  columns: "auto-fit",
  width: "300px",
  selectWidth: "240px",
  maxHeight: "500px",
  itemHeight: "auto",
  selectedColor: "dodgerblue",
  persist: null,
  hidePersisted: false,
  disabled: false,
  closedRow: false,
  showLabel: false,
});

const open = defineModel<boolean>("open", { required: false, default: false });
const places = defineModel<Place[]>("places", { required: false, default: () => [] });
const foreground = defineModel<Place | null>("foreground", { required: false, default: null });
const background = defineModel<Place | null>("background", { required: false, default: null });
const activePick = ref<"foreground" | "background" | null>(null);
const placeOpacities = ref<Record<string, number>>({});
const store = engineStore();

const selectedPlaces = computed(() => {
  return [
    { which: "foreground", place: foreground.value },
    { which: "background", place: background.value },
  ].filter((item): item is { which: string, place: Place } => item.place !== null);
});

const shownPlaces = computed(() => {
  if (!props.hidePersisted) return places.value;
  return places.value.filter(p => (p.get_backgroundImageset() ?? p.get_studyImageset())?.get_name() !== props.persist);
});

const cssVars = computed(() => {
  return {
    "--column-count": props.columns,
    "--selected-color": props.selectedColor,
    "--gallery-width": props.width,
    "--fg-picker-open-width": props.selectWidth,
    "--gallery-max-height": props.maxHeight,
    "--gallery-item-height": props.itemHeight,
  };
});

function _isActivePickSelection(place: Place) {
  if (activePick.value === "foreground") {
    return foreground.value === place;
  }

  if (activePick.value === "background") {
    return background.value === place;
  }

  return false;
}

function getImageset(place: Place): Imageset | null {
  return place.get_backgroundImageset() ?? place.get_studyImageset();
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
  const opacity = placeOpacities.value[getPlaceKey(place)];
  return opacity ?? 1;
}

function setOpacity(place: Place, opacity: number) {
  placeOpacities.value[getPlaceKey(place)] = opacity;
  imagesetLayerForPlace(place)?.set_opacity(opacity);
}

function activatePick(which: "foreground" | "background") {
  if (props.disabled) return;
  activePick.value = which;
  open.value = true;
}

function openPicker() {
  if (props.disabled) return;
  activePick.value = null;
  open.value = true;
}

function closePicker() {
  activePick.value = null;
  open.value = false;
}

function _closeMiniGallery() {
  activePick.value = null;
}

function _selectPlace(place: Place) {
  if (activePick.value === "foreground") {
    foreground.value = foreground.value === place ? null : place;
  } else if (activePick.value === "background") {
    background.value = background.value === place ? null : place;
  }
}
</script>

<style lang="less">
.fg_picker {
  transition-property: height, width;
  transition: 0.5s ease-out;
  pointer-events: auto;

  .blurred {
    background: transparent;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6px);
  }
  
  &.gallery-open {
    .blurred {
      background: rgba(0,0,0,0.5);
    }
  }

  .fg_closed {
    border-radius: 3px;
    border: solid 1px white;
    position: relative;
    height: fit-content;
    width: calc(var(--gallery-width) + 10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  .fg_closed_header {
    width: 100%;
    display: inline-grid;
    align-items: center;
    text-align: center;
    padding-block: 4px;
  }

  .fg_closed_title {
    margin: auto;
    font-weight: bold;
    font-size: 0.75rem;
  }

  .fg_closed--row {
    width: fit-content;

    .fg_closed_content {
      flex-direction: row;
    }
  }

  .fg_closed_content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 5px;

    .gallery-item {
      border: none;
      border-radius: 3px;
      cursor: pointer;
      width: var(--gallery-width);
      height: auto;
      overflow: visible;
      --image-width: 100%;

      img {
        display: block;
        margin: 0;
        border-radius: 3px;
        width: 100%;
        height: 45px;
        object-fit: cover;
      }

      .gallery-opacity {
        width: 100%;
        margin: 2px 0 0;
      }
    }
  }

  .fg_select {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: var(--fg-picker-open-width);
    align-items: center;
    border-radius: 5px;
    border: 1px solid white;
  }

  .fg_gallery {
    border-radius: 5px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: var(--gallery-max-height);
    width: fit-content;
    margin-bottom: 0;
    background: rgba(0,0,0,0.5);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6px);
  }

  .noselect {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .fg_gallery_header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
  }

  .fg_gallery_title {
    font-size: 0.82rem;
  }

  .fg_gallery_close {
    // float: right;
    appearance: none;
    border: none;
    color: white;
    background: transparent;
    cursor: pointer;
    padding: 2px;
  }
  
  .fg_gallery_close:hover {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
  }

  .fg_gallery_content {
    display: grid;
    grid-template-columns: repeat(2, var(--gallery-width));
    gap: 6px;
    padding: 6px;

    .gallery-item {
      border-radius: 3px;
      border: 1px solid white;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      width: var(--gallery-width);
      height: var(--gallery-item-height);
      position:relative;
      --image-width: 96px;
      
      &.fg_item--selected {
        border: 2px solid var(--selected-color);

        span {
          color: white;
          font-weight: bold;
        }
      }

      img {
        margin-left: auto;
        margin-right: auto;
        border-radius: 3px;
        width: var(--image-width);
        height: 45px;
        object-fit: cover;
      }

      span {
        flex-grow: 1;
        display: inline-grid;
        align-items: center;
        text-align: center;
        padding-block: 4px;
      }
    }
  }

  .place-name {
    font-size: 0.8em;
    margin-inline: 2px;
  }

  .fg_controls {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 5px;
    width: 100%;
    box-sizing: border-box;
    margin-inline: auto;
  }

  &.fg_picker--open {
    .gallery-item-selector {
      .gls__button {
        min-height: 38px;
        height: 38px;
        padding: 4px 7px;
        font-size: 0.72rem;
      }

      .gls__thumbnail {
        flex-basis: 40px;
        width: 40px;
      }

      .gls__opacity-label {
        font-size: 0.68rem;
      }
    }
  }

  .fg_controls_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 4px;
    padding-block: 2px;
    overflow: visible;

    .fg_close {
      margin-block: -100px;
    }
  }

  .fg_controls_title {
    font-size: 0.72rem;
    font-weight: bold;
  }
}
</style>
