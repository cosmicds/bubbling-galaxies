<template>
  <v-app
    id="app"
    :style="cssVars"
    :class="[smallSize ? 'app-is-small' : '', isLandscape ? 'app-is-landscape' : '']"
  >
    <v-card
      v-show="showImageCard"
      :class="['image-card', showImageCard ? 'd-flex' : '']"
    >
      <div
        class="position-absolute top-0 right-0 pa-2 ma-2"
        style=""
      >
        <v-btn
          style="z-index:9;"
          size="small"
          icon="mdi-close"
          @click="showImageCard = false"
        ></v-btn>
      </div>
      <image-flipbook
        v-model="imageCardIndex"
        :min="imageCardIndexMin"
        :max="imageCardIndexMax"
        :initial-scale:="2.5"
        :visible="showImageCard"
        :frames="(index: number) => `https://raw.githubusercontent.com/johnarban/data_repo/refs/heads/main/NGC628_interpolated/frames_256/frame_${index.toString().padStart(3, '0')}.png`"
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
        v-if="showCrawl"
        v-model="showCrawl"
        no-title
        :narrowscreen="!isLandscape"
        :landscape="isLandscape"
        :speed-title="35"
        audio-src="luis_humanoide-space-adventures-orchestral-music-star-wars-style-139660.mp3"
      >
        <template #logo>
          <h2 class="main-logo-text">
            the phantom galaxy
          </h2>
        </template>
        <p>
          ...32 million light years from Earth, exploding stars blew giant bubbles in the Phantom Galaxy.
        </p>
        <p class="mt-4">
          Today's earthbound astronomers are using all kinds of powerful telescopes in their quest to uncover and
          understand the origins of the explosions that sculpt the Phantom galaxy's life story.
        </p>
        <p class="mt-4">
          But only simulators, whose computers have the power to probe regions of space and time inaccessible to humans,
          have even a chance to reveal the Phantom's changes over hundreds of millions of years, in 3D...
        </p>
        <p class="mt-16">
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
          <!-- old left-buttons / right-buttons layout preserved below -->
          <!-- <div id="left-buttons">
            <icon-button
              v-model="showInfoSheet"
              icon="mdi-information-variant"
              :color="buttonColor"
              :tooltip-text="showInfoSheet ? 'Hide app info' : 'About this app'"
              tooltip-location="start"
            >
            </icon-button>
            <v-btn
              v-if="!showImageCard"
              class="blur-button"
              variant="outlined"
              density="compact"
              @click="showInfoSheet = !showInfoSheet"
            >
              About
            </v-btn>
            <icon-button
              v-if="!showImageCard"
              icon="mdi-home"
              :color="buttonColor"
              tooltip-text="Reset view"
              @activate="goToCoordinates('m74')"
            />
            <icon-button
              v-if="!showImageCard"
              :icon="isWWT3D ? 'mdi-video-2d' : 'mdi-video-3d'"
              :color="buttonColor"
              @activate="isWWT3D = !isWWT3D"
            />
          </div>
          <div id="right-buttons">
            <v-btn
              v-hide="!showSimulation"
              class="blur-button"
              density="compact"
              @click="showModel = !showModel"
            >
              View in 3D!
            </v-btn>
            <icon-button
              v-if="!showImageCard"
              :color="buttonColor"
              tooltip-text="Show Simulation in Split Screen"
              @activate="showImageCard = !showImageCard"
            >
              <template #button>
                <SplitScreenSvg :rotated="smallSize && !isLandscape" />
              </template>
            </icon-button>
          </div> -->

          <div class="top-buttons-row">
            <v-btn
              v-if="!showImageCard"
              class="blur-button"
              variant="outlined"
              density="compact"
              @click="aboutMode = true; showInfoSheet = true"
            >
              About
            </v-btn>
            <DetailSummary
              v-if="!(showSplashScreen || showCrawl) && (showSimulation || selectedGalleryItem) && isLandscape"
              v-model="labelOpen"
              :title="currentLabel.title"
              :use-internal-dialog="false"
              @open="() => { aboutMode = false; showInfoSheet = !showImageCard; }"
            >
              <ImageText
                v-if="showSimulation || selectedGalleryItem"
                show-image
                :which="(showSimulation ? 'simulation' : selectedGalleryItem!.get_name()) as PhantomImageNames"
              />
            </DetailSummary>
            <v-btn
              v-hide="!showSimulation"
              class="blur-button"
              variant="outlined"
              density="compact"
              @click="showModel = !showModel"
            >
              View in 3D!
            </v-btn>
          </div>

          <div class="second-buttons-row">
            <icon-button
              v-if="!showImageCard || true"
              icon="mdi-home"
              :color="buttonColor"
              size="20"
              tooltip-text="Reset view"
              @activate="() => resetView()"
            />
            <!-- <icon-button
              v-model="showInfoSheet"
              icon="mdi-information-variant"
              :color="buttonColor"
              :tooltip-text="showInfoSheet ? 'Hide app info' : 'About this app'"
              tooltip-location="start"
            >
            </icon-button> -->
            <!-- <icon-button
              v-if="!showImageCard"
              icon="mdi-home"
              :color="buttonColor"
              tooltip-text="Reset view"
              @activate="goToCoordinates('m74')"
            /> -->
            <!-- <icon-button
              v-if="!showImageCard"
              :icon="isWWT3D ? 'mdi-video-2d' : 'mdi-video-3d'"
              :color="buttonColor"
              @activate="isWWT3D = !isWWT3D"
            /> -->
            <DetailSummary
              v-if="!(showSplashScreen || showCrawl) && (showSimulation || selectedGalleryItem) && !isLandscape"
              v-model="labelOpen"
              :title="currentLabel.title"
              :use-internal-dialog="false"
              @open="() => { aboutMode = false; showInfoSheet = !showImageCard; }"
            >
              <ImageText
                v-if="showSimulation || selectedGalleryItem"
                show-image
                :which="(showSimulation ? 'simulation' : selectedGalleryItem!.get_name()) as PhantomImageNames"
              />
            </DetailSummary>
            <icon-button
              v-if="!showImageCard"
              :color="buttonColor"
              tooltip-text="Show Simulation in Split Screen"
              @activate="showImageCard = !showImageCard"
            >
              <template #button>
                <SplitScreenSvg :rotated="smallSize && !isLandscape" />
              </template>
            </icon-button>
          </div>
        </div>

        <!-- Display the 3D model -->
        <ModelViewerWindow
          v-model="showModel"
          :button-color="buttonColor"
        >
          <div class="merge-cube-shoutout ma-4">
            <h3>
              Have a 
              <img
                class="ml-1"
                src="./assets/MergeCube-Logo-Purple.svg"
                height="20px"
                style="background: #DDD; border-radius: 2px; padding: 4px 3px; vertical-align: middle;"
              >
              ?
            </h3>
            <p
              v-if="false"
              class="text-small"
            >
              View this simulated galaxy in AR with a MergeCube! Click the button below and follow the instructions.
            </p>
            <a
              class="align-self-center"
              href="https://edu.delightex.com/RSU-EJV"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-btn
                class="mt-2"
                variant="outlined"
                density="compact"
              >
                Show in App
              </v-btn>
            </a>
          </div>
        </ModelViewerWindow>

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
                :disabled="!layersLoaded"
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
                        :disabled="!layersLoaded"
                        @click="togglePlayPause"
                      >
                      </v-btn>
                    </template>
                    {{ isPlaying ? 'Pause simulation' : 'Play simulation' }}
                  </v-tooltip>
                </template>
              </v-slider>
              <span>{{ simulationTime.toFixed(1) }} million years</span>
            </div>

            <Gallery
              v-show="ready && !showSimulation"
              v-model:open="galleryOpen"
              v-model:selected-places="selectedGalleryItems"
              v-model:places="galleryPlaces"
              wtml-url="./ngc628_datasets.wtml"
              :single-select="true"
              selected-color="limegreen"
              show-opacity
              :columns="1"
              width="105px"
              persist="Optical (Kitt Peak)"
              :hide-persisted="true"
              collapse-on-select
              :hide-gallery-layers="showSimulation || showSplashScreen"
              :preview-index="4"
              :disabled="showImageCard"
              :closed-text="showImageCard ? '' : undefined"
            />

            <!-- <DetailSummary
              v-if="!(showSplashScreen || showCrawl) && (showSimulation || selectedGalleryItem)"
              v-model="labelOpen"
              :title="currentLabel.title"
              :use-internal-dialog="false"
              @open="() => showInfoSheet = !showImageCard"
            >
              <ImageText
                v-if="showSimulation || selectedGalleryItem"
                show-image
                :which="(showSimulation ? 'simulation' : selectedGalleryItem!.get_name()) as PhantomImageNames"
              />
            </DetailSummary> -->
          </div>

          <div
            v-if="!showImageCard"
            class="bottom-row-2"
          >
            <v-btn-toggle
              v-model="showSimulation"
              :class="`real-sim-toggle align-self-center mt-4 ${!layersLoaded ? 'disabled' : ''}`"
              density="compact"
              :color="accentColor"
              :disabled="!layersLoaded"
            >
              <v-btn
                class="blur-button"
                variant="outlined"
                density="comfortable"
                :value="false"
              >
                Real
              </v-btn>
              <v-btn
                class="blur-button"
                variant="outlined"
                density="comfortable"
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
            <credit-logos
              :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
              :logo-size="smallSize ? '1em' : '2.5em'"
              :extra-logos="[
                {
                  alt: 'Museum of Science Log',
                  src: './mos.png',
                  href:'https://www.mos.org',
                  name: 'Museum of Science, Boston'
                }
              ]"
            />
          </div>
        </div>
      </div>
    </div>
    <WebGlTest
      @webgl2-disabled="webglDisabled = true"
    />
    <component
      :is="isLandscape || !smallSize ? 'v-navigation-drawer' : 'v-bottom-sheet'"
      id="side-drawer"
      v-model="showInfoSheet"
      :class="[isLandscape || !smallSize ? 'info-side' : 'info-bottom', showInfoSheet ? 'side-drawer-open' : 'side-drawer-closed']"
    >
      <InformationSheet
        v-model="showInfoSheet"
        :tab-color="accentColor"
        heading-color="#f6e368"
        text-color="#e6e6e6"
        :tab-title="aboutMode ? 'Information' : currentLabel.title"
        :hide-user-guide="!aboutMode"
      >
        <div v-if="aboutMode">
          <p>
            On May 4, 2026, scientists Scott Lucchini and Alyssa Goodman visited the Museum of Science Charles Hayden
            <!-- eslint-disable-next-line vue/max-attributes-per-line -->
            Planetarium to present <a href="https://www.mos.org/events/beyond-telescope/how-stars-shape-galaxies" target="_blank" rel="noopener noreferrer">Beyond the Telescope: How Stars Shape Galaxies</a>. Using images from the James Webb Space
            Telescope and custom computer simulations, they revealed how the lives of stars can alter the architecture of
            entire galaxies.
          </p>
          <p class="mt-2 mb-2">
            This web app, created by the Cosmic Data Stories team at the Center for Astrophysics | Harvard & Smithsonian,
            brings that experience from the “dome to home.” Explore the same James Webb images and computer simulation
            featured in the planetarium show and see the Phantom Galaxy up close for yourself, including the option to
            view the 3D simulation in augmented reality!
          </p>
        </div>
        <ImageText
          v-else-if="showSimulation || selectedGalleryItem"
          show-heading
          show-image
          :which="(showSimulation ? 'simulation' : selectedGalleryItem!.get_name()) as PhantomImageNames"
        />
      </InformationSheet>
    </component>
  </v-app>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { GotoRADecZoomParams, engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, supportsTouchscreen, useWWTKeyboardControls, useFullscreen } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { D2R  } from "@wwtelescope/astro";
import { LayerManager, Place, ImageSetLayer, Imageset, TileCache } from "@wwtelescope/engine";
import ModelViewerWindow from "./components/ModelViewerWindow.vue";
import StarWarsCrawl from "./components/StarWarsCrawl.vue";
import DetailSummary from "./components/DetailSummary.vue";
import ImageText from "./components/ImageText.vue";
import SplitScreenSvg from "./components/SplitScreenSvg.vue";

import { WWTControl } from "@wwtelescope/engine";

import Gallery from "./components/Gallery.vue";


import SplashScreen from "./components/SplashScreen.vue";
import InformationSheet from "./components/InformationSheet.vue";

import WebGlTest from "./components/WebGlTest.vue";
const webglDisabled = ref(false);

import { useSetInterval } from "./composables/useSetInterval";
import { moveImageset, moveLayer } from "./imageset_manipulation";
import type { PhantomImageNames } from "./types";

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
const aboutMode = ref(false);
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
const galleryOpen = ref(false);
const imageCardIndex = ref(100);
const imageCardIndexMin = 100;
const imageCardIndexMax = 300;

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
const selectedGalleryItems = ref<Place[]>([]);
const selectedGalleryItem = computed(() => selectedGalleryItems.value[selectedGalleryItems.value.length - 1] ?? null);
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

const labelTitles: Record<PhantomImageNames | string, LabelInfo> = {
  'Infrared Stars & Dust (JWST)': {
    title: 'Infrared Stars & Dust (JWST)',
    content: ""
  },
  'Infrared Dust (JWST)': {
    title: 'Infrared Dust (JWST)',
    content: '',
  },
  'Visible Light (Hubble)': {
    title: 'Visible Light (Hubble)',
    content: '',
  },
  'Optical (Kitt Peak)': {
    title: 'Optical (Kitt Peak)',
    content: '',
  },
  'Simulation on Sky': {
    title: 'Simulation on the Sky',
    content: '',
  },
  "2011 Infrared Dust (WISE)": {
    title: "2011 Infrared Dust (WISE)",
    content: "",
  },
  "2023 Infrared (Spitzer)": {
    title: "2023 Infrared (Spitzer)",
    content: "",
  }
};

const currentLabel = computed(() => {
  if (showSimulation.value) return labelTitles['Simulation on Sky'];
  return labelTitles[selectedGalleryItem.value?.get_name() ?? ''] ?? { title: '', content: '' };
});

const showSimulation = ref(false);


import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Object3D, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from "three";
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
    zoomDeg: Math.max(xSize, ySize) * (isVertical.value ? 5 : 5),
    rollRad: options.roll ? rollRad + (options.extraRoll ?? 0) * D2R : store.rollRad,
    instant: !!options.instant
  });
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

    store.applySetting(["showGrid", true]);
    store.applySetting(["showEquatorialGridText", true]);
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

    const { ready: loadFrames, fetchingComplete } = useWtmlLoader("interpolated_simulation_every_5.wtml", {
      prefetch: true,
      onNewImageset: (imageset, index) => {
        // the imagesets are all at 0,0 [ they are simulations]
        // here would also be a good place to set its size, but we don't know it yet
        moveImageset(imageset, coordinates['m74'][0], coordinates['m74'][1]);
        isets.value.push(imageset);
      },
      onNewLayer: (newLayer, index) => {
        newLayer.set_enabled(showSimulation.value ? index == 0 : false);
        layers.value.push(newLayer);
        // if (index === 0) moveToImageset(newLayer.get_imageSet());
      },
      // goTo: false, goTo is false by default if undefined
    });


    const { ready: loadBacking } = useWtmlLoader("galaxyless_m74.wtml", {
      onNewLayer: (newLayer: ImageSetLayer, _index) => {
        newLayer.set_enabled(true);
        newLayer.set_opacity(+showSimulation.value);
        backingLayer.value = newLayer;
      },
    });

    watch(fetchingComplete, (done: boolean) => layersLoaded.value = done);
  });
});

watch(layersLoaded, (_loaded: boolean) => {
  const backing = backingLayer.value;
  if (backing != null) {
    store.setImageSetLayerOrder({
      id: backing.id.toString(),
      order: 0,
    });
  }
});


const imageIndex = ref(0);
const simulationTime = computed(() => imageIndex.value * 0.19 * 2);

watch(store.imagesetLayers, (l) => {
  if (layers.value.length > imageIndex.value) {
    store.setImageSetLayerOrder({
      id: layers.value[imageIndex.value].id.toString(),
      order: Object.keys(store.imagesetLayers).length
    });
  }
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
watch(imageIndex, async (newIndex: number, oldIndex: number) => {
  const newLayer = layers.value[newIndex];
  newLayer.set_enabled(true);

  if (playing.value) {
    // Hackery!
    newLayer.set_opacity(0);
    WWTControl.singleton.renderOneFrame();
    while (TileCache.get_queueCount() > 0) {
      await sleep(10);
    }
  }
  newLayer.set_opacity(showSimulation.value ? 1 : 0);

  layers.value[oldIndex].set_enabled(false);
});

function advanceImageIndex() {
  imageIndex.value = (imageIndex.value + 1) % layers.value.length;
}
const { togglePlayPause, isPlaying, playing } = useSetInterval(advanceImageIndex, 66);

function updateCurrentLayersOpacity(opacity: number) {
  const currentLayer = layers.value[imageIndex.value];
  if (currentLayer) {
    currentLayer.set_opacity(opacity);
  }
  if (backingLayer.value) {
    backingLayer.value.set_opacity(opacity);
  }
}

watch(showSimulation, (showingSimulation) => {
  // if we are switching off the simulation while playing, pause it
  if (!showingSimulation && playing.value) {
    playing.value = false;
  }
  layers.value[imageIndex.value]?.set_enabled(true);
  updateCurrentLayersOpacity(showingSimulation ? 1 : 0);
});

const ready = computed(() => positionSet.value);

function goToGalleryItem(name: string, instant=false) {
  const place = galleryPlaces.value.find(p => p.get_name() === name) || null;
  if (place === null) {
    return;
  }
  selectedGalleryItems.value = [place];

  const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
  if (iset) {
    moveToImageset(iset, {instant, roll: true, extraRoll: isVertical.value ? 90 : 0});
  }
}

function resetView() {
  const name = "Infrared Stars & Dust (JWST)";
  const place = galleryPlaces.value.find(p => p.get_name() === name) || null;
  if (place === null) {
    goToCoordinates("m74");
    return;
  }
  goToGalleryItem(name, true);
}

watch([showSplashScreen, showCrawl, galleryPlaces, ready], ([splashShowing, crawlShowing, places, isReady]) => {
  console.log("Watching for splash/crawl to finish and gallery places to load...", {splashShowing, crawlShowing, placesLoaded: !!places.length, isReady});
  if (!splashShowing && !crawlShowing && places && isReady) {
    console.log("Splash and crawl finished, moving to gallery item");
    // moveToImageset(galleryPlaces.value)
    const item: PhantomImageNames = "Infrared Stars & Dust (JWST)";
    goToGalleryItem(item, true);
  }
});

watch(showImageCard, (showing) => {
  if (showing) {
    // pause the simulation when showing the image card
    if (playing.value) {
      togglePlayPause();
    }
    showSimulation.value = false;
    showInfoSheet.value = false;
    galleryOpen.value = false;
    goToGalleryItem("Infrared Stars & Dust (JWST)");
  }
});

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

/* Properties related to device/screen characteristics */
const smallSize = computed(() => smAndDown.value);
const isLandscape = computed(() => viewportWidth.value > viewportHeight.value * 1.25);


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
  position: absolute;
  bottom: 0;
  z-index: 10;
  height: 100%;
  width: 0;
  width: 34vw;
  transform: translateX(-34vw);
  transition: all 0.3s ease-in-out;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;

  &.side-drawer-open {
    transform: translateX(0);
  }
}



#side-drawer.info-bottom {
  left: 0;
  width: 100%;
  height: 0;
  transition: height 0.3s ease-in-out;
  transform: none;
  border-top-left-radius: 5px;
  border-bottom-right-radius: 0;

  &.side-drawer-open {
    height: 34vh;
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



#app.app-is-landscape {
  .v-application__wrap {
    flex-direction: row;
    height: 100svh;
    max-height: 100svh;
  }

  #main-content {
    flex: 1 1 0;
    min-width: 0;
  }
}

#top-content {
  width: 100%; // 100% of the overlay less the padding
  pointer-events: none;
  display: flex;
  flex-direction: column; // stack top-buttons-row and second-buttons-row vertically
  justify-content: space-between; // keeps left, center, and right buttons spread
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;

}

.top-buttons-row,
.second-buttons-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
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
    pointer-events: auto !important;
    background-color: transparent !important;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
  }


#bottom-content {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto auto;
  pointer-events: none;
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
  .top-buttons-row,
  .second-buttons-row,
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
  position: absolute !important;
  bottom: 1rem;
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
  flex-direction: column;
  flex: 0 0 40%;
  order: 1;
  overflow: hidden;

  .v-card-item {
    padding: 0;
  }

  .image-flipbook {
    flex: 1 1 0;
  }
}

#app.app-is-small .image-card {
  order: 0;
}

.real-sim-toggle {
  outline: 1px solid white;
  .v-btn.v-btn--active {
    --v-activated-opacity: 0.7;
    .v-btn--overlay {
      opacity: 0.7 !important;
      z-index: 0;
    }
    .v-btn__content {
      z-index: 1;
      position: relative;
    }
  }
  .v-btn__content {
    color: white;
    opacity: 1;
    font-weight: bold;
  }
}
.real-sim-toggle.disabled {
  outline: none;
}

.merge-cube-shoutout {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70vw;
  align-self:center;

  .mc-disclaimer {
    font-size: 0.8em;
    color: rgba(255,255,255,0.55);
    margin-top: 2px;
    text-align: center;
  }

}

.top-buttons-row > .expansion-panel {
  margin-block: -100px;
  margin-inline: auto;
}
</style>
