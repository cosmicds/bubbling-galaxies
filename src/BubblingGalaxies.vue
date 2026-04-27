<template>
  <v-app
    id="app"
    :style="cssVars"
    :class="[smallSize ? 'app-is-small' : '']"
  >
    <div
      id="main-content"
    >
      <WorldWideTelescope
        :wwt-namespace="wwtNamespace"
      ></WorldWideTelescope>
      <wwt-loader v-model="isLoading" />


      <!-- This contains the splash screen content -->
      <SplashScreen
        v-if="showSplashScreen"
        :color="accentColor"
        highlight-color="red"
        :loaded="!isLoading"
        @close="() => splashIsClosed = true"
      />

      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->
      <div id="wwt-overlay">
        <div id="top-content">
          <div id="left-buttons">
            <icon-button
              v-model="showInfoSheet"
              icon="book-open"
              :color="buttonColor"
              :tooltip-text="showInfoSheet ? 'Hide Info' : 'Learn More'"
              tooltip-location="start"
            >
            </icon-button>
            <v-checkbox
              v-model="offsetSim"
              label="Offset sim"
              color="white"
              density="compact"
              class="icon-wrapper"
              :aria-label="'Toggle simulation offset'"
              pointer-events="auto"
            />
          </div>
          <div id="center-buttons">
            <IconButton
              icon="mdi-cube-scan"
              :color="buttonColor"
              @activate="showModel = !showModel"
            />
          </div>
          <div id="right-buttons">
            <Gallery
              v-if="ready"
              v-model:selected-place="selectedGalleryItem"
              v-model:selected-places="selectedGalleryItems"
              v-model:places="galleryPlaces"
              start-open
              wtml-url="./public_datasets.wtml"
              :single-select="false"
              selected-color="limegreen"
              show-opacity
              :columns="1"
              width="125px"
            />
            <!-- <ImagesetOffset
              v-model:rotation="angle"
              v-model:offset="offset"
            />  -->
          </div>
        </div>

        <!-- Display the 3D model -->
        <v-dialog
          v-model="showModel"
          class="model-viewer-dialog"
          fullscreen
          eager
        >
          <v-card>
            <template #title>
              <v-toolbar>
                3D Model of the Simulated Galaxy
                <v-spacer />
                <IconButton
                  icon="mdi-window-close"
                  :color="buttonColor"
                  size="x-large"
                  @activate="showModel = false"
                >
                </IconButton>
              </v-toolbar>
            </template>
            <template #text>
              <ModelViewerComponent
                src="model.glb"
                alt="A 3D model of the simulated galaxy"
                tone-mapping="none"
                min-field-of-view="2deg"
              >
                <template #ar-button>
                  <v-btn
                    color="success"
                  >
                    Show in AR
                  </v-btn>
                </template>
              </ModelViewerComponent>
            </template>
          </v-card>
        </v-dialog>


        <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

        <div id="bottom-content">
          <!-- <GesturePreview /> -->
          <SplashGesture v-if="splashIsClosed && !isLoading" />
          <div id="image-index-control">
            <v-slider
              v-if="ready"
              v-model="imageIndex"
              class="image-index-control-slider"
              :min="0"
              :max="layers.length - 1"
              step="1"
            >
              <template #prepend>
                <v-tooltip
                  location="top"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      class="mr-3 play-pause-icon"
                      v-bind="tooltipProps"
                      size="large"
                      density="compact"
                      variant="outlined"
                      color="white"
                      :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
                      :aria-label="isPlaying ? 'Pause animation' : 'Play animation'"
                      @click="togglePlayPause"
                    >
                    </v-btn>
                  </template>
                  {{ isPlaying ? 'Pause simulation' : 'Play simulation' }}
                </v-tooltip>
              </template>
            </v-slider>
            <v-slider
              v-if="ready"
              v-model="simulationOpactiy"
              class="image-opacity-control-slider"
              :min="0"
              :max="1"
              step="0.01"
              label="Opacity"
            >
            </v-slider>
          </div>
          <div
            v-if="!smallSize"
            id="body-logos"
          >
            <CreditLogos
              :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
              logo-size="2.5em"
            />
            <p class="toolkit-credit">
              Interactive developed using the
              <a
                href="https://github.com/cosmicds/vue-toolkit"
                target="_blank"
                rel="noopener"
              >CosmicDS toolkit</a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="side-drawer"
      :class="[showInfoSheet ? 'side-drawer-open' : 'side-drawer-closed']"
    >
      <InformationSheet
        v-if="showInfoSheet"
        v-model="showInfoSheet"
        :tab-color="accentColor"
        text-color="#f6e368"
      />
    </div>
    <WebGlTest
      @webgl2-disabled="webglDisabled = true"
    />
  </v-app>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, supportsTouchscreen, useWWTKeyboardControls, CreditLogos, IconButton, useFullscreen } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { D2R  } from "@wwtelescope/astro";
import { Place, ImageSetLayer, Imageset } from "@wwtelescope/engine";
import SplashGesture from "./components/SplashGesture.vue";
import ImagesetOffset from "./components/ImagesetOffset.vue";

import { WWTControl } from "@wwtelescope/engine";

import Gallery from "./components/Gallery.vue";


import SplashScreen from "./components/SplashScreen.vue";
import InformationSheet from "./components/InformationSheet.vue";

import WebGlTest from "./components/WebGlTest.vue";
const webglDisabled = ref(false);

import { useSetInterval } from "./composables/useSetInterval";

type SheetType = "text" | "video";

type CameraParams = Omit<GotoRADecZoomParams, "instant">;
export interface WwtPlaygroundProps {
  wwtNamespace?: string;
  initialCameraParams?: CameraParams;
}

const fullscreen = useFullscreen();
const searchParams = new URLSearchParams(window.location.search);
const kiosk = searchParams.get("kiosk")?.toLowerCase() === "true";
if (kiosk) {
  document.body.classList.add("kiosk");
}

const store = engineStore();

useWWTKeyboardControls(store);

const touchscreen = supportsTouchscreen();
const  { smAndDown, width: viewportWidth, height: viewportHeight } = useDisplay();
const isVertical = computed(() => viewportHeight.value > viewportWidth.value);


const props = withDefaults(defineProps<WwtPlaygroundProps>(), {
  wwtNamespace: "wwt-playground",
  initialCameraParams: () => {
    return {
      raRad: 0,
      decRad: 0,
      zoomDeg: 360
    };
  }
});

const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const showInfoSheet = ref(false);
const showSplashScreen = ref(false);
const splashIsClosed = ref(false);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#d957db");
const buttonColor = ref("#ffffff");

const showModel = ref(false);

const layers = ref<ImageSetLayer[]>([]);
const backingLayer = ref<ImageSetLayer | null>(null);
const layersToMove = computed(() => {
  let _layers = layers.value.slice();
  if (backingLayer.value) {
    _layers.push(backingLayer.value);
  }
  return _layers;
});
const isets = ref<Imageset[]>([]);
const selectedGalleryItem = ref<Place | null>(null);
const selectedGalleryItems = ref<Place[]>([]);
watch(selectedGalleryItem, (newPlace, oldPlace) => {
  if (oldPlace) {
    console.log("Deselecting place", oldPlace.get_name());
  }
  if (newPlace) {
    console.log("Selected place", newPlace.get_name());
  }
});
watch(selectedGalleryItems, (newPlaces, oldPlaces) => {
  const oldNames = oldPlaces.map(p => p.get_name());
  const newNames = newPlaces.map(p => p.get_name());
  console.log("Selected places changed from", oldNames, "to", newNames);
});
const galleryPlaces = ref<Place[]>([]);
// Store a single original center (all layers share the same center)
const originalCenter = ref<{ x: number; y: number } | null>(null);
const simulationOpactiy = ref(1);

const offsetSim = ref(true);
const SIM_OFFSET = 10 / 60; // 10 arcminutes in degrees

import { useImageSetManipulation } from "./imageset_manipulation";
import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { createTHREERenderer, renderTHREE, updateTHREECamera, updateTHREEObject } from "./threeWWT";
const { angle, offset } = useImageSetManipulation(layersToMove, {offsetDeg: offsetSim.value ? SIM_OFFSET : 0}); // 90deg rot points one down


function rollView(angleDegrees: number) {
  const currentRA = store.raRad;
  const currentDec = store.decRad;
  const currentZoom = store.zoomDeg;
  const newRoll = store.rollRad + angleDegrees * D2R;
  return store.gotoRADecZoom({
    raRad: currentRA,
    decRad: currentDec,
    zoomDeg: currentZoom,
    rollRad: newRoll,
    instant: true,
  });
}

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, -1, 1);
camera.position.z = -2;
camera.lookAt(0, 0, 0);
let renderer: WebGLRenderer;

function frameUpdateTHREE(control: WWTControl) {
  updateTHREECamera(camera, control.renderContext);
  scene.children.forEach(obj => updateTHREEObject(obj, control.renderContext));
  renderTHREE(renderer, scene, camera);
}


/**
 * Let's only set the rotation on the initial load.
 * It is od to have it swtiching when you rotate the screem
 * It looks ok when objects are centered, but when not centered
 * they end up in non-inuitive locations.
 */
// watch(isVertical, (v) => {
//   if (isVertical.value) {
//     rollView(90);
//   } else {
//     rollView(-90);
//   }
// });

function moveToEdge(imageset: Imageset, edge: 'top' | 'right' | 'bottom' | 'left' | 'center', roll = true) {
  const centerX = originalCenter.value?.x ?? imageset.get_centerX(); // degrees
  const centerY = originalCenter.value?.y ?? imageset.get_centerY(); // degrees
  const offsetX = imageset.get_offsetX(); // pixel
  const offsetY = imageset.get_offsetY(); // pixel
  const baseDegrees = imageset.get_baseTileDegrees(); // degrees per pixel
  const xOff = {
    left: offsetX * baseDegrees,
    right: -offsetX * baseDegrees,
    top: 0,
    bottom: 0,
    center: 0,
  };
  const yOff = {
    top: offsetY * baseDegrees,
    bottom: -offsetY * baseDegrees,
    left: 0,
    right: 0,
    center: 0,
  };

  const newCenterX = centerX + xOff[edge];
  const newCenterY = centerY + yOff[edge];
  console.log(`Moving to edge ${edge} with new center: (x, y) = (${xOff[edge]}, ${yOff[edge]})`);
  // const rotationRadians = rotationDegrees.value * D2R;
  return store.gotoRADecZoom({
    raRad: newCenterX * D2R,
    decRad: newCenterY * D2R,
    zoomDeg: 100 / 60,
    rollRad: (roll && isVertical.value) ? 90 * D2R : 0,
    instant: true
  });
}

onMounted(() => {

  const modelViewer = document.querySelector("model-viewer") as HTMLElement;
  modelViewer.addEventListener('error', (event: Event) => {
    console.error('Error loading model:', event);
  });

  if (webglDisabled.value) {
    showSplashScreen.value = false;
    // eslint-disable-next-lint @typescript-eslint/ban-ts-comment
    // @ts-expect-error `canvas` is defined
    WWTControl.singleton.canvas.setAttribute("hidden", "true");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    WWTControl.singleton.renderOneFrame = function() {};
    return;
  }

  store.waitForReady().then(async () => {

    store.applySetting(['showGrid', true]);
    store.applySetting(['showEquatorialGridText', true]);

    // eslint-disable-next-lint @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const renderOneFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
    WWTControl.singleton.renderOneFrame();
    renderer = createTHREERenderer(WWTControl.singleton);
    WWTControl.singleton.renderOneFrame = function() {
      renderOneFrame();
      frameUpdateTHREE(WWTControl.singleton);
    }.bind(WWTControl.singleton);


    const size = 5;
    const geometry = new BoxGeometry(size, size, size);
    const material = new MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7,
      side: DoubleSide,
    });
    const cube = new Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    // eslint-disable-next-lint @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.wwt = WWTControl.singleton; window.rc = window.wwt.renderContext; window.cube = cube; window.camera = camera; window.scene = scene;

    const iset = "Solar System";
    store.setBackgroundImageByName(iset);
    store.setForegroundImageByName(iset);

    const loadFrames = store.loadImageCollection({
      url: "i5_all.wtml",
      loadChildFolders: false,
    }).then(folder => {
      const children = folder.get_children();
      if (children == null) return;
      children.forEach((child: Place | unknown, index: number) => {
        if (!(child instanceof Place)) return;
        const imageset = child.get_studyImageset();
        if (imageset == null) return;
        isets.value.push(imageset);
        store.addImageSetLayer({
          url: imageset.get_url(),
          mode: "preloaded",
          name: imageset.get_name(),
          goto: false,
        }).then(newLayer => {
          newLayer.set_enabled(true);
          newLayer.set_opacity(index === 0 ? simulationOpactiy.value : 0); // show only the first layer initially
          layers.value.push(newLayer);
          if (index === 0) {
            console.log("setting position to first layer");
            const iset = newLayer.get_imageSet();
            originalCenter.value = {
              x: iset.get_centerX(),
              y: iset.get_centerY(),
            };
            moveToEdge(iset, offsetSim.value ? 'left' : 'center', offsetSim.value).then(() => positionSet.value = true);
          };
        });
      });
    });

    const loadBacking = store.loadImageCollection({
      url: isVertical.value ? "i5_backing_rot.wtml" :"i5_backing.wtml",
      loadChildFolders: false,
    }).then(folder => {
      (folder.get_children() ?? []).forEach((child: Place | unknown) => {
        if (!(child instanceof Place)) return;
        const imageset = child.get_studyImageset()!;
        store.addImageSetLayer({
          url: imageset.get_url(),
          mode: "preloaded",
          name: imageset.get_name(),
          goto: false,
        }).then(newLayer => {
          newLayer.set_enabled(true);
          newLayer.set_opacity(simulationOpactiy.value); // show only the first layer initially
          backingLayer.value = newLayer;
        });
      });
    });

    Promise.all([loadFrames, loadBacking])
      .then(() => {
        layersLoaded.value = true;
      });

  });
});



const imageIndex = ref(0);

watch(store.imagesetLayers, (l) => {
  if (layers.value.length > imageIndex.value) {
    store.setImageSetLayerOrder({
      id: layers.value[imageIndex.value].id.toString(),
      order: Object.keys(store.imagesetLayers).length
    });
  }
});

function setOnlyLayerAtIndexVisible(index: number) {
  layers.value.forEach((layer, idx) => {
    layer.set_opacity(idx === index ? simulationOpactiy.value : 0);
    store.setImageSetLayerOrder({
      id: layer.id.toString(),
      order: Object.keys(store.imagesetLayers).length
    });
  });
}
watch(imageIndex, (newIndex) => {
  setOnlyLayerAtIndexVisible(newIndex);
});

function advanceImageIndex() {
  imageIndex.value = (imageIndex.value + 1) % layers.value.length;
}
const { togglePlayPause, isPlaying } = useSetInterval(advanceImageIndex, 250);

watch(simulationOpactiy, (newOpacity) => {
  const currentLayer = layers.value[imageIndex.value];
  if (currentLayer) {
    currentLayer.set_opacity(newOpacity);
  }
  if (backingLayer.value) {
    backingLayer.value.set_opacity(newOpacity);
  }
});

watch(offsetSim, async (enabled) => {
  offset.value = enabled ? SIM_OFFSET : 0;
  await nextTick();
  const currentLayer = layers.value[imageIndex.value];
  if (currentLayer) {
    moveToEdge(currentLayer.get_imageSet(), enabled ? 'left' : 'center', false);
  }
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

/* Properties related to device/screen characteristics */
const smallSize = computed(() => smAndDown.value);


/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
  };
});


</script>

<style lang="less">

// #app is a column flex container with two children:
// #main-content and #bottom-drawer.
// #main-content contains the WWT display and the overlay content.

#app {
  // Vuetify's root app element fills the viewport.
  overflow: hidden;
  // Vuetify's root app element is a column flex layout
  // lets #main-content take the remaining height
  // after `#bottom-drawer` takes its own height.
}

// while #app is a flex, the direct parent
// is .v-application__wrap
// this takes the size of it's children
// so we need to apply height definitions here
// for a display with a side-panel this is generally
// what we want
.v-application__wrap {
  flex-direction: row-reverse;  // add for the side panel
  max-height: 100svh;  // force the application to be 100%
}

#app.app-is-small {
  .v-application__wrap {
    flex-direction: column;  // add for the side panel
    max-height: 100svh;  // force the application to be 100%
  }
}

#main-content {
  // This is the containing block for the absolutely positioned WWT host and overlay.
  position: relative;
  display: block; // don't need to set width. block elements stretch to fill their container by default.
  // Its height is determined by the flex layout in `#app`.
  flex: 1 0 auto;
  overflow: hidden;

  transition: height 0.1s ease-in-out;
}

#side-drawer {
  flex: 0 0 auto;
  overflow: hidden;
  width: 0;
  // transition: width 0.3s ease-in-out;

  &.side-drawer-open {
    width: 34%;
  }
}

#app.app-is-small {
  #side-drawer {
  flex: 0 0 auto;
  overflow: hidden;
  height: 0;
  width: 100%;
  // transition: width 0.3s ease-in-out;

  &.side-drawer-open {
    height: 34%;
  }
}
}

/* The WWT host is out of flow so its measured size does not affect #main-content. */
// by using inset: 0, .wwttelescope-component fills #main-content and automatically resizes with it,
// without needing a height width set. this allows main-content to be more freely sizes.
/*
WWT can size itself from CSS alone here because #main-content has a real layout size (from the flex layout in #app)
and `.wwtelescope-component` is absolutely positioned to fill it.

This breaks if #main-content stops having a definite size from layout. Common failure modes:
  - `#main-content` loses `flex-grow`/flex sizing, so in a column layout it can collapse to zero height.
  - An ancestor no longer has a definite height, so percentage or flex-based heights stop resolving.
  - `#main-content` is changed to content-sized sizing (`auto`, `fit-content`, certain grid/flex min-content cases),
    so its size starts depending on descendants instead of the outer layout.
  - `.wwtelescope-component` is put back in normal flow, letting WWT's continuously resized canvas feed back into layout
    and recreate the growth loop.
  - Padding or other box-model changes are applied to the measured WWT host instead of an outer wrapper, which can
    reintroduce resize feedback.

If any of those happen, the ResizeObserver composable may be needed again to push the resolved size from
`#main-content` onto the WWT host explicitly.
*/
.wwtelescope-component {
  position: absolute; // putting this to relative will cause the growth loop, and will require the composable to prevent that
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  // The composable sets the host element's inline width/height from #main-content.
  transition: height 0.2s ease-in-out;
  opacity: 1;
}

/*
#wwt-overlay is positioned against #main-content, not the viewport.
`position: absolute` makes it fill #main-content.
`position: fixed` would anchor it to the viewport instead.
The overlay itself is out of flow, but its children can use normal flex layout inside it.
you can also do position: relative, height: 100%. (and remove the inset: 0)
- absolute + inset: 0 says “this is a layer pinned to the container”
- relative + height: 100% says “this is a normal child trying to be as tall as its parent”
we use the absolute variant to stay more independent of the which can interact weirdly with WWT's resizing.
and the relative still requires the parent to have a definite size.
and remember, position:absolute is still a positioned parent, so children can be absolute against it
*/
#wwt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 1rem;
  pointer-events: none;

  display: flex;
  flex-direction: column;
  justify-content: space-between; // pushes top and bottom content apart
}

// moved modal content to Loader.vue

#top-content {
  width: 100%; // 100% of the overlay less the padding
  pointer-events: none;
  display: flex;
  justify-content: space-between; // keeps left, center, and right buttons spread
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;

  .zoom-slider {
    writing-mode: vertical-lr;
    height: 120px;
    accent-color: #fff;
    pointer-events: auto;
    cursor: pointer;
    opacity: 0.75;
    &:hover { opacity: 1; }
  }

  .zoom-label {
    background: #000;
    border: 1px solid #fff;
    border-radius: 3px;
    color: #fff;
    width: 20px;
    height: 20px;
    font-size: 0.9rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
}

#center-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  pointer-events: auto;
  width: 300px;
}
#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;

  hr {
    margin-block: 0.25em;
    opacity: 0;
  }
}

.icon-wrapper {
    pointer-events: auto;
  }


#bottom-content {
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#bottom-content {
  #body-logos {
    align-self: flex-end;
  }

  #icons-container {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
  }

  .toolkit-credit {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.55);
    text-align: right;
    margin: 2px 0 0;
    a { color: inherit; text-decoration: underline; }
  }
}

#app.app-is-small #bottom-content {
  margin-bottom: 1rem;
  padding-inline: 1rem;
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible {
  /* Keep this override outside Vuetify's layers so it wins without !important. */
  outline: 4px double white;
  box-shadow: 0 0 0 2px black;
  border-radius: .025rem;
}

.layout-debug {
  #main-content {
    border: 2px solid red;
  }
  #main-content,
  #top-content,
  #left-buttons,
  #center-buttons,
  #right-buttons,
  #bottom-content {
    outline: 1px solid white;
    min-width: 1px;
    min-height: 1px;
  }
  #wwt-overlay {
    border: 3px solid aqua;
  }

}

#bottom-drawer {
  position: relative;
  // height: 200px;
  // flex: 0 0 200px;
  overflow: auto;
}


#image-index-control {
  width: 100%;
  max-width: 400px;
  pointer-events: auto;
}

model-viewer {
  margin: auto;
  width: 70vw;
  height: 70vh;
}

.model-viewer-dialog {

  .v-overlay__content > .v-card > .v-card-item {
    padding: 0;
  }

  .v-toolbar {
    padding: 0.3rem 1rem;
  }
}

</style>
