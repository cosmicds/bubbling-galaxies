<template>
  <svg
    id="split-screen-icon-svg"
    :class="{'svg-rotate-90': rotated}"
    viewBox="-2 0 36 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      id="SVGRepo_bgCarrier"
      stroke-width="0"
    ></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke="#CCCCCC"
      stroke-width="0.256"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <title>split-screen</title>
      <rect
        x="15"
        y="0"
        width="2"
        height="32"
      ></rect>
      <path d="M8,7V25H2V7h6m0-2H2A2,2,0,0,0,0,7V25a2,2,0,0,0,2,2h6a2,2,0,0,0,2-2V7a2,2,0,0,0-2-2Z"></path>
      <path d="M30,7V25H24V7h6m0-2H24a2,2,0,0,0-2,2V25a2,2,0,0,0,2,2h6a2,2,0,0,0,2-2V7a2,2,0,0,0-2-2Z"></path>
      
    </g>
  </svg>
</template>
<script setup lang="ts">
const { rotated } = defineProps<{
  rotated?: boolean;
}>();
</script>

<style scoped>
svg {
  height: 1.25em;
  fill: currentColor;
}

svg.svg-rotate-90 {
  transform: rotate(90deg);
}
.cls-1 { fill: none; }
</style>