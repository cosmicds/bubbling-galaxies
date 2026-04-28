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
    show.value = false;
  }, duration);
});
</script>

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
      <div class="title-content">
        <p
          v-if="!noTitle"
          class="content-header"
        >
          <slot name="title">
            EPISODES IV-VI<br />A Movie Marathon
          </slot>
        </p>

        <br>

        <p class="content-body">
          <slot />
        </p>

        <!-- button or link or whatever -->
        <!-- <a
          href=""
          class="space-button"
        >Download The Code Now!</a> -->
      </div>
    </div>
  </div>
</template>

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
  
  background: url("img/stars-bg.jpg") center center;
  width: 100%;
  height: 100%;
  flex-grow: 1;
  font-family: "Droid Sans", arial, verdana, sans-serif;
  font-weight: 700;
  color: var(--sw-yellow);
  background-color: rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
}

.star-wars-intro p.intro-text {
  position: relative;
  max-width: 16em;
  font-size: 200%;
  font-weight: 400;
  margin: 20% auto;
  color: var(--sw-blue);
  opacity: 0;
  z-index: 1;
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
}

.star-wars-intro .main-content:after {
  position: absolute;
  content: ' ';
  top: 0;
  bottom: 60%;
  pointer-events: none;
  
}

.star-wars-intro .space-button {
  color: var(--sw-yellow);
  border: 12px solid var(--sw-yellow);
  padding: 20px;
  background: transparent;
  text-decoration: none;
  margin: 0 auto;
  display: block;
  text-align: center;
}

.star-wars-intro .space-button:hover {
  background-color: #D2BE03;
  border-color: #D2BE03;
  color: black;
}

.star-wars-intro .space-button:active,
.star-wars-intro .space-button:focus {
  background-color: #B8A40A;
  border-color: #B8A40A;
  color: black;
}

.star-wars-intro .title-content {
  position: absolute;
  top: 100%;
  animation: scroll var(--speed-title) linear var(--title-delay) forwards; /* name duration easing delay directoin */
}

.star-wars-intro .title-content > .content-header {
  text-align: center;
}

/* Main Image Styles */

.star-wars-intro .main-logo {
  position: absolute;
  width: 2.6em;
  left: 50%;
  top: 20vh;
  font-size: 10em;
  text-align: center;
  margin-left: -1.3em;
  line-height: 0.8em;
  letter-spacing: -0.05em;
  color: #000;
  text-shadow: -2px -2px 0 var(--sw-yellow), 2px -2px 0 var(--sw-yellow), -2px 2px 0 var(--sw-yellow), 2px 2px 0 var(--sw-yellow);
  opacity: 0;
  z-index: 1;
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
  0% { top: 100%; }
  100% { top: -170%; }
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