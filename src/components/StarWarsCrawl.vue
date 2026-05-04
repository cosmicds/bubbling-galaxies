<template>
  <!-- Place in Body where you'd like intro to appear -->
  <div
    v-if="show"
    class="star-wars-intro"
    :class="{ 'fade-out': fadeOut, 'narrowscreen': narrowscreen, 'landscape': landscape }"
    :style="{ '--speed-title': `${speedTitle ?? 26}s` }"
  >
    <v-progress-linear
      v-if="audioSrc"
      :model-value="(progress / duration) * 100"
      class="audio-progress"
      color="var(--sw-yellow)"
      height="4px"
    />
    <AudioPlayer
      v-if="audioSrc"
      :src="audioSrc"
      :fade-out-duration="fadeOut ? 1 : 0"
      :fade="fadeOut"
      class="audio-player"
    />
    <!-- close v-btn crawl -->
    
    <!-- Blue Intro Text -->
    <p class="intro-text intro-animation">
      <slot name="intro">
        A long time ago in a galaxy far, far away....
      </slot>
    </p>

    <!-- Logo Image or Text goes in here -->
    <div
      v-if="!noLogo"
      class="main-logo-positioner"
    >
      <div class="main-logo main-logo-animation">
        <slot name="logo" />
      </div>
    </div>


    <!-- All Scrolling Content Goes in here -->
    <div class="main-content">
      <div class="content-body-overlay-gradient"></div>
      <div class="title-content title-content-animation">
        <p
          v-if="!noTitle"
          class="content-header"
        >
          <slot name="title">
            EPISODES I<br />A New Hope
          </slot>
        </p>

        <br>
        <div class="content-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs } from 'vue';
import AudioPlayer from './AudioPlayer.vue';

const show = defineModel({
  type: Boolean,
  default: true,
});

const props = defineProps<{
  noLogo?: boolean;
  noTitle?: boolean;
  audioSrc?: string;
  narrowscreen?: boolean;
  landscape?: boolean;
  speedTitle?: number;
  noEnd?: boolean;
}>();

const { speedTitle } = toRefs(props);


const fadeOut = ref(false);

function _addClass(selector: string, className: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.classList.add(className);
  }
}

function _removeClass(selector: string, className: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.classList.remove(className);
  }
}



const progress = ref(0);
const duration = ref(0);
setTimeout(() => {
  const interval = setInterval(() => {
    if (progress.value < duration.value) {
      progress.value += 100;
    } else {
      clearInterval(interval);
    }
  }, 100);
}, 0);

onMounted(() => {
  // 4500ms accounts for logo-in animation (4.5s)
  const totalDuration = (speedTitle.value ?? 26) * 1000 + 4500;
  duration.value = totalDuration;
  setTimeout(() => {
    fadeOut.value = true;
    setTimeout(() => {
      if (props.noEnd) {
        return;
      }
      show.value = false;
    }, 1500);
  }, totalDuration);
});
</script>

<style scoped>
.audio-player {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both;
}

@keyframes bounce-in {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}


/*
Name: StarWarsIntro.css
URI: polarnotion.github.io/starwarsintro
Author: Polar Notion
Author URI: http://polarnotion.com/
Description: A simple CSS library for creating a Star Wars Intro Crawl. May the Force be with you.
Version: 1.0
*/

.star-wars-intro.fade-out {
  opacity: 0;
  transition: opacity 1s ease-out;
}

.star-wars-intro {
  --speed-intro: 2s;
  --speed-logo-in: 5s;
  --speed-logo-out: 2.5s;
  --speed-title: 26s; /* overridden by :style binding when speedTitle prop is set */
  --title-delay: calc(0.9 * var(--speed-logo-in));
  
  --sw-yellow: #ffd233;
  --sw-blue: #14ddf3;
  
  --bottom-offset: 10rem;
  
  flex-grow: 1;
  font-family: "Droid Sans", arial, verdana, sans-serif;
  font-weight: 700;
  color: var(--sw-yellow);
  background-color: rgba(0, 0, 0, 0.65);
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  right: 0;
  
  contain: strict;
  z-index: 1;
  max-width: 720px;
}


.star-wars-intro p.intro-text {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  max-width: 16em;
  font-size: 200%;
  font-weight: 400;

  color: var(--sw-blue);
  opacity: 0;
  z-index: 10;
  text-align: center;
}

.star-wars-intro.narrowscreen p.intro-text {
  width: 90%;
  text-align: center;
  font-size: 2em;
}

.star-wars-intro p.intro-text.intro-animation {
  /* --speed-intro: 2s duration */
  -webkit-animation: intro var(--speed-intro) ease-out;
  -moz-animation: intro var(--speed-intro) ease-out;
  -ms-animation: intro var(--speed-intro) ease-out;
  -o-animation: intro var(--speed-intro) ease-out;
  animation: intro var(--speed-intro) ease-out;
  
}


.star-wars-intro .main-content{
  margin-left: auto;
  margin-right: auto;
  position: absolute;
  z-index: 3;
  width: calc(0.9 * 95%);
  left: 50%;
  height: 80vh;
  bottom: 0;
  font-size: 35px;
  font-weight: bold;
  text-align: center;
  overflow: hidden;
  transform-origin: 50% 50%;
  transform: translateX(-50%) perspective(250px) rotateX(15deg) translateY(-20vh);
  /* outline: 2px solid var(--sw-yellow); */
}

.star-wars-intro .main-content:after {
  position: absolute;
  content: ' ';
  top: 0;
  bottom: 60%;
  pointer-events: none;
  
}

.star-wars-intro .title-content {
  position: absolute;
  top: 100%;

  z-index:10;
  isolation: isolate;
}

.star-wars-intro .title-content.title-content-animation {
  animation: scroll var(--speed-title) linear var(--title-delay) forwards;
}

.star-wars-intro .title-content > .content-header {
  text-align: center;
}

.star-wars-intro .content-body {
  position: relative;
  background: var(--sw-yellow);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.star-wars-intro.narrowscreen .content-body {
  font-size: 0.7em;
}

/* .star-wars-intro .content-body-overlay-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0) 0%, 
    rgba(0, 0, 0, 0) 70%, 
    rgba(0, 0, 0, 1) 90%, 
    rgba(0, 0, 0, 1) 100%);
    z-index: 9
} */

/* Main Image Styles */

.star-wars-intro .main-logo-positioner {
  position: fixed;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
  width: min-content;
  height: min-content;
}

.star-wars-intro.landscape .main-logo-positioner  {
  top: calc(-1*8em);
}


.star-wars-intro .main-logo {
  /* position: absolute; */
  width: 2.6em;
  /* left: 50%; */
  /* top: -0.5em; */
  font-size: min(20vw,8em);
  text-align: center;
  /* margin-left: -1.3em; */
  margin-left: 0;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--sw-yellow);
  --s: 2px; /* shadow size */
  --ns: calc(-1*var(--s)); /* negative shadow size */
  /* text-shadow: var(--ns) 0 var(--sw-yellow), var(--s) var(--ns) 0 var(--sw-yellow), var(--ns) var(--s) 0 var(--sw-yellow), var(--s) var(--s) 0 var(--sw-yellow); */
  font-family: "SF Distant Galaxy Outline";
  opacity: 0;
  /* z-index: 10; */
  width:fit-content;
}

.star-wars-intro .main-logo.main-logo-animation {
  -webkit-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  -moz-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  -ms-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  -o-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
}

.star-wars-intro .main-logo > img {
  max-width: 100%;
}

/* intro animation */
/* just a fade-out */
@-webkit-keyframes intro {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@-moz-keyframes intro {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@-ms-keyframes intro {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@-o-keyframes intro {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes intro {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

/** logo animation - scale and fade */
@-webkit-keyframes logo {
  0% { -webkit-transform: scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { -webkit-transform: scale(0.1); opacity: 0; }
}

@-moz-keyframes logo {
  0% { -moz-transform: scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { -moz-transform: scale(0.1); opacity: 0; }
}

@-ms-keyframes logo {
  0% { -ms-transform: scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { -ms-transform: scale(0.1); opacity: 0; }
}

@-o-keyframes logo {
  0% { -o-transform: scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { -o-transform: scale(0.1); opacity: 0; }
}

@keyframes logo {
  0% { transform: scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { transform: scale(0.1); opacity: 0; }
}

/** the scroll shifts the top position to slide it up past the top */
@keyframes scroll {
  0% { 
    top: 100%; 
    opacity: 0;
  }
  
  10% { 
    opacity: 1;
  }
  
  100% { 
    top: -145%; 
    
  }
}

@keyframes scrollquick {
  0% { 
    top: 100%; 
    opacity: 0;
  }
  
  10% { 
    opacity: 1;
  }
  
  100% { 
    top: -170%; 
    
  }
}


@keyframes scrollquicker {
  0% { 
    top: 90%; 
    opacity: 0;
  }
  
  10% { 
    opacity: 1;
  }
  
  100% { 
    top: -270%; 
    
  }
}


@media screen and (max-width: 720px) {
  .star-wars-intro .main-content {
    font-size: 35px;
  }
  .star-wars-intro .title-content {
    position: absolute;
    top: 100%;
  }
  
  .star-wars-intro.narrowscreen .title-content.title-content-animation {
    animation: scroll var(--speed-title) linear var(--title-delay) forwards;
  }
  .star-wars-intro .title-content.title-content-animation {
    animation: scrollquick var(--speed-title) linear var(--title-delay) forwards;
  }
}

@media screen and (max-height: 370px) {
  .star-wars-intro .title-content.title-content-animation {
    animation: scrollquicker var(--speed-title) linear var(--title-delay) forwards;
  }
}
</style>
