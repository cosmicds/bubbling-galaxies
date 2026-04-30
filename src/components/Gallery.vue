<template>
  <div
    :class="['this-gallery-root', {'gallery-open': open}]"
    :style="cssVars"
  >
    <div
      class="just-holding-events"
      tabindex="0"
      @click="open = true"
      @keyup.enter="open = true"
    >
      <slot
        v-if="!open"
        name="closed"
        @click="open = true"
        @keyup.enter="open = true"
      >
        <div
          class="default-activator blurred"
          @click="open = true"
          @keyup.enter="open = true"
        >
          <span
            class="default-activator-title noselect"
          >
            {{ closedText }}
          </span>
          <img
            class="noselect"
            :src="selectedPlace ? getThumbnailUrl(selectedPlace) : (places[previewIndex] ? getThumbnailUrl(places[previewIndex]) : defaultThumbnailUrl)"
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
        <div
          v-for="[index, place] of shownPlaces.entries()"
          :key="index"
          :class="[
            'gallery-item', 
            {'gallery-selected': highlightLastOnly ? selectedPlace === place : selectedPlaces.includes(place)},
            {'galaxy-persisted': isPersistantLayer(place)}
          ]"
          @click="selectPlace(place)"
        >
          <img
            class="noselect"
            :src="getThumbnailUrl(place)"
          />
          <span class="place-name noselect">{{ place.get_name() }}</span>
          <input
            v-if="showOpacity && selectedPlaces.includes(place)"
            class="gallery-opacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="placeOpacities[getPlaceKey(place)] ?? getOpacity(place) ?? 1"
            @click.stop
            @input="setOpacity(place, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, nextTick, watch } from "vue";
import { engineStore } from "@wwtelescope/engine-pinia";
import { Folder, Imageset, Place, ImageSetLayer } from "@wwtelescope/engine";


/* Gallery */

/** Interface describing props for the gallery component */
export interface GalleryProps {
  /** The URL of a WTML file describing the desired gallery contents. Required */
  wtmlUrl: string;
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
  /** Whether to show an opacity slider for each gallery item. Default false */
  showOpacity?: boolean;
  /** start open */
  startOpen?: boolean;
  /** name if layer to always show */
  persist?: string | null;
  /** hide the layer that is persistantly shown */
  hidePersisted?: boolean;
  /** keep the gallery layers not visible */
  hideGalleryLayers?: boolean;
  /** if in single-select mode, collapse on selection. default: false */
  collapseOnSelect?: boolean
  /** should there be one selected at startup */
  defaultStarting?: string | null;
}


const props = withDefaults(defineProps<GalleryProps>(), {
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
  hidePersist: false,
  hideGalleryLayers: false,
  collapseOnSelect: false,
  defaultStarting: null,
  
});

const defaultThumbnailUrl = "https://cdn.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=test";

const emit = defineEmits<{
  "select": [place: Place],
  "deselect": [place: Place],
  "listAllSelected": [places: Place[]],
}>();

const store = engineStore();
const open = ref(props.startOpen);

const places = defineModel<Place[]>("places", { required: false, default: () => [] });
const selectedPlace = defineModel<Place | null>("selectedPlace", { required: false, default: null });
const selectedPlaces = defineModel<Place[]>("selectedPlaces", { required: false, default: () => [] });
const placeOpacities = ref<Record<string, number>>({});
const imagesetLayers = ref<Record<string, ImageSetLayer>>({});
let _internallySelecting = false;

const shownPlaces = computed(() => {
  if (!props.hidePersisted) return places.value;
  return places.value.filter(p => getImageset(p)?.get_name() !== props.persist);
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
    let _places = await placesFromWtml(props.wtmlUrl);
    places.value = _places;
    await Promise.all(_places.slice().reverse().map(loadImagesetLayerForPlace));
    showPersistantPlace(_places);
    if (props.defaultStarting) {
      const defaultPlace = _places.find(p => p.get_name() === props.defaultStarting);
      if (defaultPlace) {
        selectPlace(defaultPlace);
      }
    }
  });
});

function getImageset(place: Place): Imageset | null {
  return place.get_backgroundImageset() ?? place.get_studyImageset();
}

function getPlaceKey(place: Place): string {
  const imageset = getImageset(place);
  if (!imageset) {
    return place.get_name();
  }

  return imageset.get_url() || imageset.get_name();
}

async function loadImagesetLayerForPlace(place: Place): Promise<ImageSetLayer | null> {
  const imageset = getImageset(place);
  if (!imageset) return null;
  console.log("Loading imageset layer for place", place.get_name(), "with imageset", imageset.get_name());
  return await store.addImageSetLayer({
    url: imageset.get_url(),
    mode: "preloaded",
    name: imageset.get_name(),
    goto: false,
  }).then((layer) => {
    imagesetLayers.value[getPlaceKey(place)] = layer;
    layer.set_enabled(false);
    return layer;
  });
}

function showPersistantPlace(places: Place[]) {
  if (props.persist === null || props.hideGalleryLayers) return;
  for (const place of places) {
    const iset = getImageset(place);
    if (!iset) continue;
    if (props.persist === iset.get_name()) {
      const layer = getImagesetLayerForPlace(place);
      if (layer) setLayerVisibility(layer, true);
    }
  }
}

function getImagesetLayerForPlace(place: Place): ImageSetLayer | null {
  const imageset = getImageset(place);
  if (!imageset) return null;
  return imagesetLayers.value[getPlaceKey(place)] ?? null;
}

function getThumbnailUrl(place: Place): string {
  
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


function getOpacity(place: Place): number {
  const opacity = placeOpacities.value[getPlaceKey(place)];
  return opacity ?? 1;
}

function applySelectedPlaceOpacity(place: Place) {
  const layer = getImagesetLayerForPlace(place);
  if (!layer) return;
  layer.set_opacity(0);
  layer.set_opacity(getOpacity(place));
}

function setOpacity(place: Place, event: Event) {
  const target = event.target as HTMLInputElement;
  const opacity = Number(target.value);
  placeOpacities.value[getPlaceKey(place)] = opacity;

  const layer = getImagesetLayerForPlace(place);
  if (layer) {
    setLayerVisibility(layer, true);
    layer.set_opacity(opacity);
  }
}

function extractPlaces(folder: Folder): Place[] {
  let places: Place[] = [];
  for (const child of folder.get_children() ?? []) {
    if (child instanceof Place) {
      const iset = getImageset(child);
      if (iset !== null) {
        places.push(child);
      }
    } else if (child instanceof Folder) {
      places = places.concat(extractPlaces(child));
    }
  }
  return places;
}

async function placesFromWtml(wtmlUrl: string): Promise<Place[]> {
  return store.loadImageCollection({
    url: wtmlUrl,
    loadChildFolders: true
  }).then((folder) => extractPlaces(folder));
}


async function selectPlace(place: Place, letDeselect = true) {
  _internallySelecting = true;
  const layer = getImagesetLayerForPlace(place);
  if (!layer) {
    await loadImagesetLayerForPlace(place);
  }
  if (props.singleSelect) {
    // if we're already selected, deselect
    if (selectedPlace.value === place && letDeselect) {
      emit("deselect", place);
      selectedPlaces.value = [];
      selectedPlace.value = null;
    } else {
      if (letDeselect) {
        selectedPlaces.value.forEach(p => emit("deselect", p));
      }
      selectedPlaces.value = [place]; // note this is only available after nextTick
      selectedPlace.value = place;
      emit("select", place);
    }

    emit("listAllSelected", [...selectedPlaces.value]);
    syncSelectedLayerVisibility();
    if (props.collapseOnSelect) {
      open.value = false;
    }
    nextTick(() => { _internallySelecting = false; });
    return;
  }

  // for multi-select
  // if we're already selected, deselect
  if (selectedPlaces.value.includes(place) && letDeselect) {
    emit("deselect", place);
    selectedPlaces.value = selectedPlaces.value.filter((selected) => selected !== place);
  } else {
    selectedPlaces.value = selectedPlaces.value.includes(place) ? selectedPlaces.value : [...selectedPlaces.value, place];
    selectedPlace.value = place;
    emit("select", place);
  }

  selectedPlace.value = selectedPlaces.value[selectedPlaces.value.length - 1] ?? null;
  emit("listAllSelected", [...selectedPlaces.value]);
  syncSelectedLayerVisibility();
  nextTick(() => { _internallySelecting = false; });
}

function setLayerVisibility(layer: ImageSetLayer, visible: boolean): void {
  if (!layer.get_enabled() && visible) {
    layer.set_enabled(true);
  }
  layer.set_opacity(visible ? 1 : 0);
}

function isPersistantLayer(place: Place) {
  if (!props.persist) return false;
  const iset = getImageset(place);
  if (!iset) return false;
  return iset.get_name() === props.persist;
}

function setSelectedImagesetVisibility(places: Place[], selectedPlaces: Place[]) {
  for (const place of places) {
    const layer = getImagesetLayerForPlace(place);
    if (!layer) continue;
    const visible = (selectedPlaces.includes(place) || isPersistantLayer(place)) ;
    setLayerVisibility(layer, visible);
  }
}

function syncSelectedLayerVisibility() {
  if (props.hideGalleryLayers) return;
  nextTick(async () => {
    await setSelectedImagesetVisibility(places.value, selectedPlaces.value);
    selectedPlaces.value.forEach(applySelectedPlaceOpacity);
  });
}

watch(() => props.persist, (newPersist, oldPersist) => {
  if (oldPersist !== null && oldPersist !== undefined) {
    const oldPlace = places.value.find(p => getImageset(p)?.get_name() === oldPersist);
    if (oldPlace) {
      const layer = getImagesetLayerForPlace(oldPlace);
      if (layer) setLayerVisibility(layer, false);
    }
  }
  if (newPersist !== null && newPersist !== undefined) {
    const newPlace = places.value.find(p => getImageset(p)?.get_name() === newPersist);
    if (newPlace) {
      const layer = getImagesetLayerForPlace(newPlace);
      if (layer) {
        setLayerVisibility(layer, true);
      } else {
        loadImagesetLayerForPlace(newPlace).then(layer => {
          if (layer) setLayerVisibility(layer, true);
        });
      }
    }
  }
});

watch(() => props.hideGalleryLayers, (hide) => {
  if (hide) {
    places.value.forEach(place => {
      const layer = getImagesetLayerForPlace(place);
      if (layer) setLayerVisibility(layer, false);
    });
  } else {
    syncSelectedLayerVisibility();
  }
});

// React to selectedPlace being set from outside the component.
watch(selectedPlace, async (newPlace) => {
  if (_internallySelecting) return;
  _internallySelecting = true;
  if (newPlace) {
    selectPlace(newPlace, false);
  } else {
    selectedPlaces.value = [];
  }
  syncSelectedLayerVisibility();
  nextTick(() => { _internallySelecting = false; });
});

// React to selectedPlaces being replaced from outside the component.
watch(selectedPlaces, (newPlaces) => {
  if (_internallySelecting) return;
  _internallySelecting = true;
  selectedPlace.value = newPlaces[newPlaces.length - 1] ?? null;
  syncSelectedLayerVisibility();
  nextTick(() => { _internallySelecting = false; });
});

</script>

<style lang="less">
.this-gallery-root {
  transition-property: height, width;
  transition: 0.5s ease-out;
  pointer-events: auto;

  .blurred {
    background: transparent;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6px);
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
    align-items:flex-start;
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
    cursor: pointer;
    width: var(--gallery-width);
    height: var(--gallery-item-height);
    padding-top: 5px;
    position:relative;

    img {
      margin-left: auto;
      margin-right: auto;
      border-radius: 3px;
      width: 96px;
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

  .gallery-opacity {
    width: calc(100% - 12px);
    margin: 0 6px 6px;
    cursor: pointer;
  }

  .gallery-selected {
    border: 1px solid var(--selected-color);

    span {
      color: var(--selected-color);
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

  .place-name {
    font-size: 0.8em;
  }

}
</style>
