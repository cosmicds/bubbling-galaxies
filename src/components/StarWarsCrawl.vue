<template>
  <!-- Place in Body where you'd like intro to appear -->
  <div 
    v-if="show" 
    class="star-wars-intro"
  >
    <AudioPlayer
      v-if="audioSrc"
      :src="audioSrc"
      class="audio-player"
    />
    <!-- close v-btn crawl -->
    
    <!-- Blue Intro Text -->
    <p class="intro-text">
      <slot name="intro">
        A long time ago in a galaxy far, far away....
      </slot>
    </p>

    <!-- Logo Image or Text goes in here -->
    <div
      v-if="!noLogo"
      class="main-logo"
    >
      <slot name="logo" />
    </div>

    <!-- All Scrolling Content Goes in here -->
    <div class="main-content">
      <div class="content-body-overlay-gradient"></div>
      <div class="title-content">
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
import { onMounted, ref } from 'vue';
import AudioPlayer from './AudioPlayer.vue';

defineProps<{
  noLogo?: boolean;
  noTitle?: boolean;
  audioSrc?: string;
}>();

const show = ref(true);
const duration = 86 * 1000; // 1 minutes 26 seconds
onMounted(() => {
  setInterval(() => {
    // show.value = false;
  }, duration);
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

.star-wars-intro {
  --speed-intro: 2s;
  --speed-logo-in: 5s;
  --speed-logo-out: 2.5s;
  --speed-title: 120s;
  --title-delay: 4s;
  
  --sw-yellow: #EBD71C;
  --sw-blue: #4ee;
  
  --bottom-offset: 10rem;
  
  background: url("img/stars-bg.jpg") center center;
  /* width: 100%; */
  /* height: 50em; */
  /* bottom: var(--bottom-offset); */
  flex-grow: 1;
  font-family: "Droid Sans", arial, verdana, sans-serif;
  font-weight: 700;
  color: var(--sw-yellow);
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: absolute;
  top: 10%;
  bottom: var(--bottom-offset);
  left: 0;
  right: 0;
  
  contain: strict;
  z-index: 1;
}


.star-wars-intro p.intro-text {
  position: relative;
  max-width: 16em;
  font-size: 200%;
  font-weight: 400;
  margin: 30% auto;
  color: var(--sw-blue);
  opacity: 0;
  z-index: 10;
  text-align: center;
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
  width: 98%;
  height: 50em;
  bottom: 0;
  font-size: 64px;
  font-weight: bold;
  text-align: center;
  overflow: hidden;
  transform-origin: 50% 100%;
  transform: perspective(450px) rotateX(25deg);
  outline: 2px solid yellow;
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
  animation: scroll var(--speed-title) linear var(--title-delay) forwards; /* name duration easing delay directoin */
}

.star-wars-intro .title-content > .content-header {
  text-align: center;
}

.star-wars-intro .content-body {
  position: relative;
}

.star-wars-intro .content-body-overlay-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0) 0%, 
    rgba(0, 0, 0, 0) 30%, 
    rgba(0, 0, 0, 1) 50%, 
    rgba(0, 0, 0, 1) 100%);
    z-index: 9
}

/* Main Image Styles */

.star-wars-intro .main-logo {
  position: absolute;
  width: 2.6em;
  left: 50%;
  top: -0.5em;
  font-size: 8em;
  text-align: center;
  margin-left: -1.3em;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--sw-yellow);
  text-shadow: -2px -2px 0 var(--sw-yellow), 2px -2px 0 var(--sw-yellow), -2px 2px 0 var(--sw-yellow), 2px 2px 0 var(--sw-yellow);
  opacity: 0;
  z-index: 10;
  -webkit-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  -moz-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  -ms-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  -o-animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
  animation: logo var(--speed-logo-in) ease-out var(--speed-logo-out);
}

.star-wars-intro .main-logo > img {
  max-width: 100%;
}

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

@keyframes scroll {
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

@media screen and (max-width: 720px) {
  .star-wars-intro .main-content {
    font-size: 35px;
  }
  .star-wars-intro .title-content {
    position: absolute;
    top: 100%;
    animation: scroll 100s linear 4s forwards;
  }
}

</style>