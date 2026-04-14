<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <v-card
    class="info-sheet"
    height="100%"
  >
    <v-tabs
      id="tabs"
      v-model="tab"
      height="32px"
      :color="textColor"
      :slider-color="textColor"
      dense
      align-tabs="end"
    >
      <v-tab
        class="info-tabs"
        tabindex="0"
      >
        <h3>Information</h3>
      </v-tab>
      <v-tab
        class="info-tabs"
        tabindex="0"
      >
        <h3>User Guide</h3>
      </v-tab>
    </v-tabs>
    <font-awesome-icon 
      id="close-text-icon" 
      class="control-icon" 
      icon="times" 
      size="lg" 
      tabindex="0"
      @click="showTextSheet = false" 
      @keyup.enter="showTextSheet = false"
    >
    </font-awesome-icon>
      
    <!-- Information Content -->
    <v-window
      id="tab-items"
      v-model="tab"
      class="pb-2"
    >
      <v-window-item>
        <v-card class="scrollable">
          <v-card-text class="info-text scrollable">
            <h4 class="user-guide-header">
              Tracking Artemis II
            </h4>
            <p class="mt-1">
              On April 1, 2026, the Artemis II crew began their 10-day journey to fly by the Moon and back to Earth. On the way, they have sent back <a href="https://www.nasa.gov/artemis-ii-multimedia/" target="_blank" rel="noopener noreferrer">breathtaking images</a> of both the Moon and the Earth that are inspiring a new generation.
            </p>
            <p class="mt-3">
              In this interactive view, you can:
            </p>
            <ul class="ml-5">
              <li>recreate Artemis's views of Earth and the Moon from space.</li>
              <li>follow along the Artemis II path, either from the point of view of Earth or the Moon.</li>
            </ul>
            <h4 class="mt-6">
              Why two paths?
            </h4>
            <p class="mt-1">
              If you're wondering why Artemis's path looks so different from Earth's perspective vs the Moon's, the answer is that Earth and the Moon are moving relative to each other. An object's motion looks different when viewed from <strong>reference frames</strong> that have relative motion. 
            </p>
            <h5> A ball on a train</h5>
            <p class="mt-3">
              Imagine, for example, that you are on a moving train with clear walls. <br /><br />
              If you throw a ball in the air, you see it go straight up and straight down. <br /><br />
              If your friend on the ground watches the ball as the train goes by, they see the ball traveling up and down in an arc. 
            </p>
            <h5> The Earth & Moon</h5>
            <p class="mt-3">
              From Earth's point of view, Artemis's path to the Moon and back is roughly like your point of view of the ball on the train. 
              Artemis's motion is directly away from Earth and back. 
              The Moon is orbiting around Earth, so Artemis's trajectory is directed to where the Moon will be at the point of fly by.
            </p>
            <p class="mt-3">
              The Moon's point of view is more like the view of your friend on the ground who watches the train coming from afar. 
              Both paths are correct, but they look different because the Earth and the Moon are moving relative to each other. 
            </p> 
          </v-card-text>
        </v-card>
      </v-window-item>
      
      <!-- User Guide Content -->
      <v-window-item>
        <v-card class="scrollable">
          <v-card-text class="info-text scrollable">
            <p>
              This <a
                href="https://www.worldwidetelescope.org/home"
                target="_blank"
                rel="noopener noreferrer"
              >WorldWide Telescope</a> (WWT) interactive provides a view of of the Artemis II 
              trajectory, from ICPS separation (3h24m18s after launch) to splash down. 
            </p>
            <h4 class="user-guide-header mt-5">
              Technical Note
            </h4>

            <ul class="ml-5">
              <li>Data is a JPL Horizons Vector Table for Artemis II, centered on the Earth (Geocentric [code: 500]). Sampled every 5 minutes</li>
              <li class="li">
                Data is current as of Apr 10, 2026 06:19 UTC 
                <details>
                  <summary>Horizons Query</summary>
                  <!-- do not intent inside pre tag  -->
                  <pre>!$$SOF
MAKE_EPHEM=YES
COMMAND=-1024
EPHEM_TYPE=VECTORS
CENTER='500@399'
START_TIME='2026-04-02 01:59'
STOP_TIME='2026-04-10 23:54'
STEP_SIZE='5 MINUTES'
VEC_TABLE='1'
REF_SYSTEM='ICRF'
REF_PLANE='ECLIPTIC'
VEC_CORR='NONE'
CAL_TYPE='M'
OUT_UNITS='AU-D'
VEC_LABELS='YES'
VEC_DELTA_T='YES'
CSV_FORMAT='YES'
OBJ_DATA='YES'</pre>
                </details>
              </li>
                
              <li class="li">
                Postion with respect to Moon may have a systematic offset.
              </li>
              <li class="li">
                Known bug: for some viewing angles, the Artemis path renders behind the Moon or Earth when it should be in front. 
              </li>
            </ul>
                
            <h4 class="user-guide-header mt-5">
              Sky Navigation
            </h4>
            <p>
              To navigate the WWT view, use the following controls:
            </p>
            <v-row
              align="center"
              class="mt-2 mx-3"
            >
              <v-col cols="4">
                <v-chip
                  label
                  variant="outlined"
                >
                  Pan
                </v-chip>
              </v-col>
              <v-col
                cols="8"
                class="pt-1"
              >
                <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong> {{ touchscreen ? "" : "or" }}
                <strong>{{ touchscreen ? "" : "W-A-S-D" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
              </v-col>
            </v-row>
            <v-row
              align="center"
              class="mx-3"
            >
              <v-col cols="4">
                <v-chip
                  label
                  variant="outlined"
                >
                  Zoom
                </v-chip>
              </v-col>
              <v-col
                cols="8"
                class="pt-1"
              >
                <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? "" :
                  "or" }} <strong>{{ touchscreen ? "" : "I-O" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
              </v-col>
            </v-row>
            <v-row
              align="center"
              class="mx-3"
            >
              <v-col cols="4">
                <v-chip
                  label
                  variant="outlined"
                >
                  Rotate
                </v-chip>
              </v-col>
              <v-col
                cols="8"
                class="pt-1"
              >
                {{ touchscreen ? "" : "press" }} <strong>{{ touchscreen ? "pinch and twist" : "control + click + drag"
                }}</strong> {{ touchscreen ? "" : "" }} <strong>{{ touchscreen ? "" : "" }}</strong> {{ touchscreen
                  ? "" : "" }} (Keyboard option coming soon)<br>
              </v-col>
            </v-row>
              
            <!-- Credits -->
            <v-row>
              <v-col cols="12">
                <div class="credits">
                  <h4 class="user-guide-header mt-3">
                    Credits
                  </h4>
                  <h5>
                    <a
                      href="https://www.cosmicds.cfa.harvard.edu/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >CosmicDS</a>
                  </h5>
                  <p>John Lewis</p>
                  <p>Jon Carifio</p>
                  <p>Pat Udomprasert</p>
                  <p>Alyssa Goodman</p>

                  <h5>
                    <a
                      href="https://www.worldwidetelescope.org/home"
                      target="_blank"
                      rel="noopener noreferrer"
                    >WorldWide Telescope</a>
                  </h5>
                  <p>Jon Carifio</p>
                  <p>Peter Williams</p>
                  <p>David Weigel</p>
                </div>
                <v-spacer class="end-spacer"></v-spacer>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <funding-acknowledgement />
              </v-col>
            </v-row>
            <!-- </v-container> -->
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supportsTouchscreen, FundingAcknowledgement } from '@cosmicds/vue-toolkit';

const tab = ref(0);
const touchscreen = supportsTouchscreen();



const showTextSheet = defineModel<boolean>();

interface Props {
  textColor: string
}

defineProps<Props>();

</script>

<style lang="less">
.intro-card {
  padding: 1em;
  container-type: size;
}

.info-text {
  color: #8adcf9;
  
  a {
    // color: white;
  }

  h3 {
    font-size: 1.4em;
    color: #9ee1fa
  }

  h4 {
    font-size: 1.2em;
    color: #9ee1fa
  }

  h5 {
    font-size: 1em;
    font-weight: bold;
    margin-top: 1em;
    color: #9ee1fa
  }

  li {
    margin-block: 0.5em;
  }
  
  details {
    user-select: none;
    margin-block: 0.5em;
    outline: 1px solid rgba(255, 255, 255, 0.50);
    padding: 2px 1em;
    border-radius: 2px;
    cursor: pointer;
  }
  details:hover {
    outline: 2px solid #aeaeae;
  }
  
  pre {
    background-color: rgb(50, 50, 50);
    padding: 0.5em;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.8em;
  }
}

.bullet-icon {
  color: var(--border-color);
  width: 1.2em;
  padding-right: 0.5em;
}


.info-sheet {
  overflow-y: auto;

  .info-text {
    height: fit-content;
  }


  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }

  .scrollable {
    overflow-y: visible;
    height: 100%;
  }

  #tab-items {
    height: calc(100% - 32px);
    overflow-y: auto;

    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";
      

      .end-spacer {
        height: 25px;
      }
    }

  }

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;

    &:hover {
      cursor: pointer;
    }
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next,
  .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }
}
</style>