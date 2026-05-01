<template>
  <v-app
    id="app"
    :style="cssVars"
    :class="[smallSize ? 'app-is-small' : '']"
  >
    <v-card
      v-show="showImageCard"
      :class="['image-card', 'flex-column', {'d-flex': showImageCard}]"
      :height="smallSize ? '50%' : '100%'"
      :width="smallSize ? '100%' : '50%'"
    >
      <template #title>
        <div class="d-flex justify-end">
          <v-btn
            size="small"
            icon="mdi-close"
            @click="showImageCard = false"
          ></v-btn>
        </div>
      </template>
      <image-flipbook
        v-model="imageCardIndex"
        :min="imageCardIndexMin"
        :max="imageCardIndexMax"
        :frames="(index: number) => `simulation_a_pngs/frame_${index}.png`"
      />
    </v-card>

    <div
      id="main-content"
    >
      <WorldWideTelescope
        :wwt-namespace="wwtNamespace"
      ></WorldWideTelescope>
      <wwt-loader v-model="isLoading" />


      <!-- This contains the splash screen content -->
      <SplashScreen
        v-model="showSplashScreen"
        :color="accentColor"
        highlight-color="red"
        :loaded="!isLoading"
      />

      <!-- disabled for now. needs refinement -->
      <StarWarsCrawl
        v-model="showCrawl"
        no-title
        audio-src="star-wars-opening-theme-short.mp3"
      >
        <template #logo>
          <h2 class="main-logo-text">
            the phantom galaxy
          </h2>
        </template>
        <p>
          ...32 million light years from Earth, exploding stars blew giant bubbles in the Phantom galaxy.
        </p>
        <p>
          Today's earthbound astronomers are using all kinds of powerful telescopes in their quest to uncover and understand the origins of the explosions that sculpt the Phantom galaxy's life story.
        </p>
        <p>
          But only simulators, whose computers have the power to probe regions of space and time inaccessible to humans, have even a chance to reveal the Phantom's changes over hundreds millions of years, in 3D...
        </p>
        <p>
          Have they done it?
        </p>
      </StarWarsCrawl>
      <v-btn
        v-if="showCrawl"
        class="crawl-skip-button"
        @click="showCrawl = false"
        @keyup.enter="showCrawl = false"
      >
        Skip Intro
      </v-btn>

      <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->
      <div
        v-show="!(showSplashScreen || showCrawl)"
        id="wwt-overlay"
      >
        <div id="top-content">
          <div id="left-buttons">
            <!-- <icon-button
              v-model="showInfoSheet"
              icon="book-open"
              :color="buttonColor"
              :tooltip-text="showInfoSheet ? 'Hide Info' : 'Learn More'"
              tooltip-location="start"
            >
            </icon-button>
            -->
            <v-btn
              v-if="!showImageCard"
              class="blur-button"
              variant="outlined"
              @click="showInfoSheet = !showInfoSheet"
            >
              Learn More
            </v-btn>
            <v-btn
              v-if="!showImageCard"
              class="blur-button"
              variant="outlined"
              @click="showModel = !showModel"
            >
              View Simulation in 3D!
            </v-btn>
            <div class="d-flex flex-row ga-2">
              <IconButton
                :icon="`mdi-${showImageCard ? 'vector-combine' : (smallSize ? 'view-split-horizontal' : 'view-split-vertical')}`"
                :color="buttonColor"
                @activate="showImageCard = !showImageCard"
              />
              <IconButton
                v-if="!showImageCard"
                :icon="isWWT3D ? 'mdi-video-2d' : 'mdi-video-3d'"
                :color="buttonColor"
                @activate="isWWT3D = !isWWT3D"
              />

              
              <IconButton
                v-show="showImageCard"
                icon="mdi-home"
                :color="buttonColor"
                @activate="goToCoordinates('m74')"
              />
            </div>
          </div>
        </div>

        <!-- Display the 3D model -->
        <ModelViewerWindow
          v-model="showModel"
          :button-color="buttonColor"
        />

        <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

        <div id="bottom-content">
          <!-- <GesturePreview /> -->
          <div class="bottom-row-1">
            <div
              v-show="showSimulation"
              id="image-index-control"
            >
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
              <span>Time: {{ simulationTime.toFixed(2) }} million years</span>
            </div>

            <Gallery
              v-show="ready && !showSimulation && !showImageCard"
              v-model:selected-place="selectedGalleryItem"
              v-model:selected-places="selectedGalleryItems"
              v-model:places="galleryPlaces"
              wtml-url="./ngc628_datasets.wtml"
              :single-select="false"
              selected-color="limegreen"
              show-opacity
              :columns="1"
              width="125px"
              persist="Optical (NOAO)"
              :hide-persisted="true"
              :hide-gallery-layers="showSimulation || showSplashScreen"
              collapse-on-select
              :preview-index="3"
            />
            
            <DetailSummary
              v-if="!(showSplashScreen || showCrawl) && (showSimulation || selectedGalleryItem)"
              v-model="labelOpen"
              :title="currentLabel.title"
            >
              <div v-if="currentLabel.title == 'Colder Infrared (JWST)'">
                hi
              </div>
            </DetailSummary>
          </div>

          <div
            v-if="!showImageCard"
            class="bottom-row-2"
          >
            <v-btn-toggle
              v-model="showSimulation"
              class="align-self-center mt-4"
              density="compact"
            >
              <v-btn
                class="blur-button"
                variant="outlined"
                :value="false"
              >
                Real
              </v-btn>
              <v-btn
                class="blur-button"
                variant="outlined"
                :value="true"
              >
                Simulated
              </v-btn>
            </v-btn-toggle>
          </div>

          <div
            id="body-logos"
            :class="{'small-logos': smallSize}"
          >
            <CreditLogos
              :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
              :logo-size="smallSize ? '1em' : '2.5em'"
            />
            <p 
              v-if="!smallSize" 
              class="toolkit-credit"
            >
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
    <SplashGesture v-if="!showSplashScreen && !isLoading && !showCrawl" />
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
import { ImageSetType, ProjectionType } from "@wwtelescope/engine-types";
import SplashGesture from "./components/SplashGesture.vue";
import ModelViewerWindow from "./components/ModelViewerWindow.vue";
import StarWarsCrawl from "./components/StarWarsCrawl.vue";
import DetailSummary from "./components/DetailSummary.vue";

import { WWTControl } from "@wwtelescope/engine";

import Gallery from "./components/Gallery.vue";


import SplashScreen from "./components/SplashScreen.vue";
import InformationSheet from "./components/InformationSheet.vue";

import WebGlTest from "./components/WebGlTest.vue";
const webglDisabled = ref(false);

import { useSetInterval } from "./composables/useSetInterval";
import { moveImageset, moveLayer } from "./imageset_manipulation";

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
const skipScrawl = searchParams.get("crawl")?.toLowerCase() === "false";
const skipSplash = searchParams.get("splash")?.toLowerCase() === "false";
console.log("kiosk mode?", kiosk);
console.log("skip crawl?", skipScrawl);
console.log("skip splash?", skipSplash);
const store = engineStore();

const { backgroundImageset } = storeToRefs(store);

const background3D = "Solar System";
const background2D = "Digitized Sky Survey";
const isWWT3D = ref(false);
watch(isWWT3D, (mode3D: boolean) => {
  const iset = mode3D ? background3D : background2D;
  store.setBackgroundImageByName(iset);
  store.applySetting(["showGrid", !isWWT3D.value]);
  store.applySetting(["showEquatorialGridText", !isWWT3D.value]);
  if (!mode3D) {
    renderer.clear();
  }
});

useWWTKeyboardControls(store);

const touchscreen = supportsTouchscreen();
const  { smAndDown, width: viewportWidth, height: viewportHeight } = useDisplay();
const isVertical = computed(() => viewportHeight.value > viewportWidth.value);

const coordinates = {
  'ic5332':  [15 * (23 + 34 / 60 + 27.49 / 3600), -(36 + 6 / 60 + 3.9 / 3600)],
  'm74': [24.174371502246, 15.780613507832]
};


const props = withDefaults(defineProps<WwtPlaygroundProps>(), {
  wwtNamespace: "wwt-playground",
  initialCameraParams: () => {
    return {
      raRad: 24.174371502246 * D2R,
      decRad: 15.780613507832 * D2R,
      zoomDeg: 1.5,
      rollRad: (70.51999999999907 + 90) * D2R,
    };
  }
});

const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const showInfoSheet = ref(false);
const showSplashScreen = ref(!skipSplash);
const showCrawl = ref(false);
if (skipSplash && !skipScrawl) {
  showCrawl.value = true;
}
watch(showSplashScreen, (showing) => {
  if (!showing && !skipScrawl) {
    showCrawl.value = true;
  }
});
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#d957db");
const buttonColor = ref("#ffffff");

const showModel = ref(false);

const showImageCard = ref(false);
const imageCardIndex = ref(100);
const imageCardIndexMin = 100;
const imageCardIndexMax = 148;

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

const labelOpen = ref(false);

interface LabelInfo {
  title: string;
  content: string;
}

const labelTitles: Record<string, LabelInfo> = {
  'Infrared (JWST)': {
    title: 'JWST Infrared Image',
    content: ""
  },
  'Colder Infrared (JWST)': {
    title: 'JWST Colder Infrared Image',
    content: '',
  },
  'Visible (Hubble)': {
    title: 'Hubble Visible light Image',
    content: '',
  },
  'Optical (NOAO)': {
    title: 'NOAO Optical Image',
    content: '',
  },
  'Simulation on Sky': {
    title: 'Simulation on Sky',
    content: '',
  }
};

const currentLabel = computed(() => {
  if (showSimulation.value) return labelTitles['Simulation on Sky'];
  return labelTitles[selectedGalleryItem.value?.get_name() ?? ''] ?? { title: '', content: '' };
});

const showSimulation = ref(false);
const simulationOpactiy = ref(+showSimulation.value);
// const simulationOpactiy = computed(() => +showSimulation.value);
watch(showSimulation, (show) => {
  simulationOpactiy.value = +show;
});
watch(simulationOpactiy, (val) => {
  showSimulation.value = val === 1;
});


import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Object3D, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from "three";
import { createLoader, createTHREECamera, createTHREERenderer, createTHREEScene, renderTHREE, updateTHREECamera } from "./threeWWT";
import { storeToRefs } from "pinia";

function moveToImageset(imageset: Imageset, options: {instant?: boolean, roll?: boolean, extraRoll?: number} = {instant: true, roll: false,}) {
  const centerX = imageset.get_centerX(); // degrees
  const centerY = imageset.get_centerY(); // degrees
  const offsetX = imageset.get_offsetX();
  const offsetY = imageset.get_offsetY();
  const roll = imageset.get_rotation();
  // const isTan = imageset.get_projection() === ProjectionType.tan;
  const rollRad = options.roll ? roll * Math.PI / 180 : store.rollRad;
  
  // const diagonalSize = 2 * Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  // const zoom = isTan ? 2 * imageset.get_baseTileDegrees() * diagonalSize / offsetY : 1.7 * imageset.get_baseTileDegrees() * diagonalSize;
  const s = Math.sin(rollRad);
  const c = Math.cos(rollRad);
  

  const angularHeight = imageset.get_baseTileDegrees();
  const angularWidth = angularHeight * (imageset.get_widthFactor() === 1 ? 2 : 1);
  const diagonalSize = Math.sqrt(angularWidth * angularWidth + angularHeight * angularHeight);
  const xSize = Math.abs(c * angularHeight) + Math.abs(s * angularWidth);
  const ySize = Math.abs(s * angularHeight) + Math.abs(c * angularWidth);
  

  
  return store.gotoRADecZoom({
    raRad: centerX * D2R,
    decRad: centerY * D2R,
    zoomDeg: Math.max(xSize, ySize) * (isVertical.value ? 6 : 6),
    rollRad: options.roll ? rollRad + (options.extraRoll ?? 0) * D2R : store.rollRad,
    instant: !!options.instant
  });
}

const scene = createTHREEScene();
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let cube: Mesh;

const loader = createLoader();

function frameUpdateTHREE(control: WWTControl) {
  if (isWWT3D.value) {
    updateTHREECamera(camera, control.renderContext);
    renderTHREE(renderer, scene, camera);
  }
}


function goToCoordinates(item: keyof typeof coordinates, instant=true) {
  const coords = coordinates[item];
  store.gotoRADecZoom({
    raRad: coords[0] * D2R,
    decRad: coords[1] * D2R,
    zoomDeg: 100 / 60,
    instant,
  });
}


import { useWtmlLoader } from "./composables/useWtmlLoader";
import { label } from "three/tsl";

function threeJsModelLoader() {
  const size = 0.5;
  const geometry = new BoxGeometry(size, size, size);
  const material = new MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.7,
    side: DoubleSide,
  });
  cube = new Mesh(geometry, material);
  cube.matrixAutoUpdate = true;
  // Units are in AU
  cube.position.set(10, 2, 0);
  cube.matrixWorldNeedsUpdate = true;
  scene.add(cube);

  loader.load(
    "./model.glb",
    gltf => {
      const size = 1;
      const modelScene = gltf.scene;
      modelScene.matrixAutoUpdate = true;
      const distance = 100;
      modelScene.position.set(distance, distance, distance);
      modelScene.scale.set(size, size, size);
      modelScene.matrixWorldNeedsUpdate = true;

      modelScene.traverse((mesh: Object3D) => {
        if (mesh instanceof Mesh) {
          // mesh.geometry.computeVertexNormals();
          const oldMaterial = mesh.material as MeshPhysicalMaterial;
          const newMaterial = new MeshBasicMaterial({
            map: oldMaterial.map,
            color: oldMaterial.color,
            side: oldMaterial.side,
            opacity: oldMaterial.opacity,
          });
          mesh.material = newMaterial;
          oldMaterial.dispose();
        }
      });

      scene.add(modelScene);
    },
    xhr => {return;}, //console.log(`${(xhr.loaded / xhr.total * 100)} % loaded`),
    error => console.error(error),
  );
}

onMounted(() => {

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

    store.applySetting(["showGrid", !isWWT3D.value]);
    store.applySetting(["showEquatorialGridText", !isWWT3D.value]);
    store.gotoRADecZoom({
      ...props.initialCameraParams,
      instant: true,
    }).then(() => {
      positionSet.value = true;
    });
    // const rollAngle = -19.480565034447988; // degrees
    // rollView(
    //   rollAngle + (isVertical.value ? 0 : 90), 
    //   0.7,
    // );

    const renderOneFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
    WWTControl.singleton.renderOneFrame();
    renderer = createTHREERenderer(WWTControl.singleton);
    camera = createTHREECamera(WWTControl.singleton.renderContext);
    WWTControl.singleton.renderOneFrame = function() {
      renderOneFrame();
      frameUpdateTHREE(WWTControl.singleton);
    }.bind(WWTControl.singleton);


    

    store.setBackgroundImageByName(isWWT3D.value ? background3D : background2D);

    const { ready: loadFrames } = useWtmlLoader("interpolated_simulation_every_5.wtml", {
      onNewImageset: (imageset, index) => {
        // the imagesets are all at 0,0 [ they are simulations]
        // here would also be a good place to set its size, but we don't know it yet
        moveImageset(imageset, coordinates['m74'][0], coordinates['m74'][1]);
        isets.value.push(imageset);
      },
      onNewLayer: (newLayer, index) => {
        newLayer.set_enabled(true);
        newLayer.set_opacity(index === 0 ? simulationOpactiy.value : 0);
        layers.value.push(newLayer);
        // if (index === 0) moveToImageset(newLayer.get_imageSet());
      },
      // goTo: false, goTo is false by default if undefined
    });


    const {ready: loadBacking} = useWtmlLoader("galaxyless_m74.wtml", {
      onNewImageset: (imageset) => moveImageset(imageset, coordinates['m74'][0], coordinates['m74'][1]),
      onNewLayer: (newLayer: ImageSetLayer, _index) => {
        newLayer.set_enabled(true);
        newLayer.set_opacity(simulationOpactiy.value); // show only the first layer initially
        backingLayer.value = newLayer;
      },
    });

    Promise.all([loadFrames, loadBacking])
      .then(() => {
        layersLoaded.value = true;
        threeJsModelLoader();
      });
  });
});



const imageIndex = ref(0);
const simulationTime = computed(() => imageIndex.value * 0.19 * 2 + 0.19 * 100);

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
const { togglePlayPause, isPlaying, playing } = useSetInterval(advanceImageIndex, 50);

watch(simulationOpactiy, (newOpacity) => {
  const currentLayer = layers.value[imageIndex.value];
  if (currentLayer) {
    currentLayer.set_opacity(newOpacity);
  }
  if (backingLayer.value) {
    backingLayer.value.set_opacity(newOpacity);
  }
});

watch(showSimulation, (showingSimulation) => {
  // if we are switching off the simulation while playing, pause it
  if (!showingSimulation && playing.value) {
    playing.value = false;
  }
});

const ready = computed(() => layersLoaded.value && positionSet.value);

function goToGalleryItem(name: string) {
  const place = galleryPlaces.value.find(p => p.get_name() === name) || null;
  if (place === null) {
    return;
  }
  selectedGalleryItem.value = place;
  
  const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
  if (iset) {
    moveToImageset(iset, {instant: false, roll: true, extraRoll: isVertical.value ? 90 : 0});
  }
}

watch([showSplashScreen, showCrawl, galleryPlaces, ready], ([splashShowing, crawlShowing, places, isReady]) => {
  console.log("Watching for splash/crawl to finish and gallery places to load...", {splashShowing, crawlShowing, placesLoaded: !!places.length, isReady});
  if (!splashShowing && !crawlShowing && places && isReady) {
    console.log("Splash and crawl finished, moving to gallery item");
    // moveToImageset(galleryPlaces.value)
    const item = "Infrared (JWST)";
    goToGalleryItem(item);
  }
});

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

function rollView(angleDegrees: number, zoomDeg: number | null = null) {
  const currentRA = store.raRad;
  const currentDec = store.decRad;
  const currentZoom = store.zoomDeg;
  const newRoll = store.rollRad + angleDegrees * D2R;
  return store.gotoRADecZoom({
    raRad: currentRA,
    decRad: currentDec,
    zoomDeg: zoomDeg ?? currentZoom,
    rollRad: newRoll,
    instant: true,
  });
}
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
// this takes the size of its children
// so we need to apply height definitions here
// for a display with a side-panel this is generally
// what we want
.v-application__wrap {
  flex-direction: row;
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
  order: 2;
  transition: height 0.1s ease-in-out;
}

#app.app-is-small #main-content {
  order: 1;
}

#side-drawer {
  flex: 0 0 auto;
  order: 0;
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
  order: 2;
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
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto auto;
  pointer-events: auto;
  align-items: flex-end;
}

#bottom-content {
  .bottom-row-1 {
    grid-row: 1 / 2;
    display: flex;
    justify-content: space-between;
    align-items:flex-end;
    gap: 1em;
  }
  
  .bottom-row-2 {
    grid-row: 2 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #body-logos {
    align-self: flex-end;
    grid-row:  3 / 4;
  }
  
  #body-logos.small-logos {
    display: none;
    margin-top: 0.5em;
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
  padding: 0;
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


.crawl-skip-button {
  position: absolute;
  bottom: 5rem;
  right: 1rem;
  z-index: 9999;
}

.main-logo-text {
  text-align: center;
  width:fit-content;
}

.v-btn.blur-button.v-btn--variant-outlined {
  // background-color: black;
  backdrop-filter: blur(6px);
}

.image-card {
  order: 1;

  .v-card-item {
    padding: 0;
  }

  .image-flipbook {
    margin: auto;
  }
}

#app.app-is-small .image-card {
  order: 0;

  img {
    object-fit: contain;
    width: 100%;
  }
}
</style>
