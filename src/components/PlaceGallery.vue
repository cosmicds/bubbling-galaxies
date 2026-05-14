<template>
  <div
    :class="['this-place-gallery-root', {'gallery-open': open}]"
    :style="cssVars"
  >
    <div
      class="just-holding-events"
      tabindex="0"
      @click="openGallery"
      @keyup.enter="openGallery"
    >
      <slot
        v-if="!open"
        name="closed"
        @click="openGallery"
        @keyup.enter="openGallery"
      >
        <div
          class="default-activator blurred"
          @click="openGallery"
          @keyup.enter="openGallery"
        >
          <span
            class="default-activator-title noselect"
          >
            {{ closedText }}
          </span>
          <!-- <img
            v-if="selectedPlace === null"
            class="noselect"
            :src="selectedPlace ? getThumbnailUrl(selectedPlace) : (places[previewIndex] ? getThumbnailUrl(places[previewIndex]) : defaultThumbnailUrl)"
          /> -->
          <div
            v-if="selectedPlace === null"
            class="gallery-no-view"
          >
            <span>No view selected</span>
          </div>
          <GalleryItem
            v-else
            :place="selectedPlace"
            :show-opacity="false"
            borderless
            hide-label
          />
        </div>
      </slot>
    </div>
    <div
      v-if="open"
      class="gallery blurred"
    >
      <div
        class="gallery-header"
      >
        <span class="gallery-title">{{ title }}</span>
        <div class="gallery-close">
          <font-awesome-icon
            icon="times"
            size="lg"
            tabindex="0"
            @click="open = false"
            @keyup.enter="open = false"
          ></font-awesome-icon>
        </div>
      </div>
      <div
        class="gallery-content"
      >
        <GalleryItem
          v-for="[index, place] of shownPlaces.entries()"
          :key="index"
          :place="place"
          :selected="highlightLastOnly ? selectedPlace === place : selectedPlaces.includes(place)"
          :show-opacity="false"
          @click="selectPlace(place)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, nextTick, watch } from "vue";
import { engineStore } from "@wwtelescope/engine-pinia";
import { Imageset, Place } from "@wwtelescope/engine";
import GalleryItem from "./GalleryItem.vue";

/* Gallery */

/** Interface describing props for the gallery component */
export interface GalleryProps {
  /** The URL of a WTML file describing the desired gallery contents. Required */
  places: Place[];
  /** The number of columns of the gallery.
    * Accepts a number or a valid CSS value to be used in `repeat` for `grid-template-columns`
    * Defaults to 'auto-fit'
    */
  columns?: number | string;
  /** The width of the gallery. Should be a valid CSS value for `width`. Defaults to 300px */
  width?: string;
  /** Maximum height of the gallery. Should be a valid CSS value for `max-height`. Defaults to 500px */
  maxHeight?: string;
  itemHeight?: string;
  /** The title of the gallery. Default is 'Gallery' */
  title?: string;
  /** The accent color to use for selected images in the gallery. Should be a valid CSS color. Default is 'dodgerblue' */
  selectedColor?: string;
  /** Whether a user can select only one image at a time. Default true */
  singleSelect?: boolean;
  /** Whether only the last selected image is highlighted. Default false */ 
  highlightLastOnly?: boolean;
  /** The index of the preview image in the WTML file. Defaults to 0. */
  previewIndex?: number;
  /** The text to show when the gallery is closed. Default is 'Image Gallery' */
  closedText?: string;
  /** start open */
  startOpen?: boolean;
  /** if in single-select mode, collapse on selection. default: false */
  collapseOnSelect?: boolean
  /** should there be one selected at startup */
  defaultStarting?: string | null;
  /** prevent the gallery from being opened by user interaction */
  disabled?: boolean;
}


const props = withDefaults(defineProps<GalleryProps>(), {
  places: () => [],
  columns: "auto-fit",
  width: "300px",
  maxHeight: "500px",
  itemHeight: "auto",
  title: "Choose View",
  selectedColor: "dodgerblue",
  singleSelect: true,
  highlightLastOnly: false,
  previewIndex: 0,
  closedText: "Choose View",
  showOpacity: false,
  startOpen: false,
  persist: null,
  hidePersisted: false,
  hideGalleryLayers: false,
  collapseOnSelect: false,
  defaultStarting: null,
  disabled: false,
  useSelectedOrder: false,
  excludeItems: undefined,
});



const defaultThumbnailUrl = "https://cdn.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=test";


const store = engineStore();
const open = defineModel<boolean>("open", { required: false, default: false });
if (props.startOpen) open.value = true;

function openGallery() {
  if (props.disabled) return;
  open.value = true;
}


const selectedPlaces = defineModel<Place[]>("selectedPlaces", { required: false, default: () => [] });
const selectedPlace = computed(() => selectedPlaces.value[selectedPlaces.value.length - 1] ?? null);
watch(selectedPlaces, (newVal) => {
  console.log("selectedPlaces changed to", newVal.map(p => p.get_name()));
});

let _internallySelecting = false;


const shownPlaces = computed(() => {
  return props.places;
});

const cssVars = computed(() => {
  return {
    "--column-count": props.columns,
    "--selected-color": props.selectedColor,
    "--gallery-width": props.width,
    "--gallery-max-height": props.maxHeight,
    "--gallery-item-height": props.itemHeight,
  };
});


 
onBeforeMount(() => {
  store.waitForReady().then(async () => {
    
    
    if (props.defaultStarting && selectedPlaces.value.length === 0) {
      const defaultPlace = props.places.find(p => p.get_name() === props.defaultStarting);
      if (defaultPlace) {
        selectPlace(defaultPlace);
      }
    } 
  });
});

function getImageset(place: Place): Imageset | null {
  return place.get_backgroundImageset() ?? place.get_studyImageset();
}



function _getThumbnailUrl(place: Place): string {
  
  const imagesetThumbnail = getImageset(place)?.get_thumbnailUrl();
  if (imagesetThumbnail) {
    return imagesetThumbnail;
  }
  
  
  const placeThumbnail = place.get_thumbnailUrl();
  if (placeThumbnail) {
    return placeThumbnail;
  }

  return defaultThumbnailUrl;
}




function closeOnSelect() {
  if (!props.collapseOnSelect) return;
  open.value = false;
}

async function selectPlace(place: Place, letDeselect = true) {
  console.log("Selecting place", place.get_name());
  _internallySelecting = true;
  let deselect = false;
  if (props.singleSelect) {
    if ((selectedPlace.value === place) && letDeselect) {
      selectedPlaces.value = [];
      deselect = true;
    } else {
      selectedPlaces.value = [place]; // note this is only available after nextTick
    }

  } else {
    // for multi-select
    // if we're already selected, deselect
    if (selectedPlaces.value.includes(place) && letDeselect) {
      selectedPlaces.value = selectedPlaces.value.filter((selected) => selected !== place);
      deselect = true;
    } else {
      selectedPlaces.value = selectedPlaces.value.includes(place)
        ? [...selectedPlaces.value.filter((selected) => selected !== place), place]
        : [...selectedPlaces.value, place];
    }
  }

  nextTick(() => { _internallySelecting = false; });
  if (!deselect && props.collapseOnSelect) {
    closeOnSelect();
  }
}


</script>

<style lang="less">

.this-place-gallery-root {
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

  .gallery {
    border-radius: 5px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: var(--gallery-max-height);
    // width: fit-content;

  }

  .noselect {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .gallery-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
  }

  .gallery-title {
    font-size: 1em;
  }

  .gallery-close {
    float: right;
    cursor: pointer;
  }
  
  .gallery-close:hover {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
  }

  .gallery-content {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items:center;
    flex-wrap: wrap;
    // display: grid;
    // grid-template-columns: repeat(auto-fill, minmax(var(--gallery-width), 1fr));
    column-gap: 0;
    row-gap: 5px;
    padding: 5px;
  }

  .default-activator {
    border-radius: 3px;
    border: solid 1px white;
    position: relative;
    height: fit-content;
    width: calc(var(--gallery-width) + 10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    img {
      padding: 5px;
      border-radius: 3px;
    }
  }

  .default-activator-title {
    margin: auto;
    font-weight: bold;
  }

  .gallery-item {
    border-radius: 3px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: var(--gallery-width);
    height: var(--gallery-item-height);
    justify-content: center;
    position:relative;
    --image-width: 96px;
    
    &.gallery-item__borderless {
      border: none;
    }

    img {
      margin-left: auto;
      margin-right: auto;
      border-radius: 3px;
      width: var(--image-width);
      height: calc((2*var(--gallery-item-height) + 45px) / 3);
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
  
  &.gallery-open {
    .gallery-item {
      height: auto;
      img {
        height: 45px;
      }
    }
  }

  .gallery-opacity {
    width: var(--image-width);
    margin: 0 6px 6px;
    cursor: pointer;
  }

  .gallery-selected {
    border: 2px solid var(--selected-color);

    span {
      color: white;
      font-weight: bold;
    }
  }
  
  .galaxy-persisted {
    pointer-events: none;
    border: 1px solid var(--selected-color);
    input {
      display: none;
    }
  }
  
  .gallery-item.galaxy-persisted::after {
    content: "Base Layer";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-100%);
    white-space: nowrap;
    background: hsla(120, 100%, 25%, 0.5);
    width: 100%;
    text-align: center;
  }

  .gallery-item.gallery-imageset-loading::after {
    content: "Loading...";
    position: absolute;
    inset: 0;
    white-space: nowrap;
    background: hsla(0, 0%, 0%, 0.5);
    width: 100%;
    text-align: center;
    pointer-events: all;
  }

  .place-name {
    font-size: 0.8em;
    margin-inline: 2px;
  }
  
  .gallery-no-view {
    background: rgba(0,0,0,0.5);
    border-radius: 3px;
    width: calc(var(--gallery-width) - 10px);
    height: 67px;
    text-align: center;
    line-height: 1;
    display:flex;
    align-items: center;
    padding-inline: 4px;
    margin-block: 4px;
    font-weight: bold;
    
    span {
      color: white;
      font-size: 0.9em;
    }
  }

}
</style>
