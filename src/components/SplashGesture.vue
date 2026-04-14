<template>
  <v-snackbar
    v-model="show"
    :content-class="['gesture-preview', smallScreen ? 'small' : '']"
    color="black"
    :timeout="6000000"
    location="top"
    close-on-content-click
    :min-width="0"
  >
    <template #text>
      <div :class="['gesture-preview-container', smallScreen ? 'my-1 small' : 'my-2']">
        <div class="gesture-icon">
          <div class="gesture-icon__icon">
            <v-icon
              size="small"
            >
              <!-- {{ touchscreen ? 'mdi-gesture-swipe-horizontal' : 'mdi-cursor-default-gesture' }} -->
              mdi-cursor-move
            </v-icon>
          </div>
          <div class="gesture-icon__label">
            PAN
          </div>
        </div>
        <span class="gesture-and">&</span>
        <div class="gesture-icon">
          <div class="gesture-icon__icon">
            <div class="two-icons">
              <v-icon
                size="small"
              >
                mdi-minus-box-outline
              </v-icon>
              <v-icon
                size="small"
              >
                mdi-plus-box-outline
              </v-icon>
            </div>
          </div>
          <div class="gesture-icon__label">
            ZOOM
          </div>
        </div>
        <span class="gesture-explore">to explore</span>
      </div>
    </template>
    <template
      v-if="!smallScreen"
      #actions
    >
      <v-btn
        class="mx-2"
        density="comfortable"
        rounded="lg"
        text="Close"
        variant="tonal"
        @click.stop="show = false"
        @keyup.enter.stop="show = false"
      ></v-btn>
    </template>
  </v-snackbar>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDisplay } from 'vuetify';
const show = ref(true);
const smallScreen = useDisplay().smAndDown;

const hide = () => show.value = false;

onMounted(() => {
  setTimeout(() => {
    window.addEventListener('pointerdown', hide, { once: true });
  }, 0);
});

onUnmounted(() => {
  window.removeEventListener('pointerdown', hide);
});
</script>


<style>

.gesture-preview {
  border: 1px solid white;
  margin-top: 1em;
  padding-left: 0.5em;
}
.gesture-preview.small {
  padding-inline: 1em;
  padding-top: 0.25em;
}
.gesture-preview .v-snackbar__content {
  display: flex;
  align-items: center;
  justify-content: center;
}


.gesture-preview-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: fit-content;
  gap: 2em;
  font-size: 1.25em;
}

.gesture-preview-container.small {
  gap: 1.5em;
  font-size: 1.2em;
}

.gesture-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  /* font-size: 1.5rem; */
}

.gesture-icon__label {
  font-size: 0.6em;
}

.gesture-and {
  font-size: 1em;
  margin-inline: -0.5em;
}

.gesture-explore {
  /* width: fit-content; */
  font-size: 0.8em;
  margin-left: -0.5em;
}

.two-icons {
  display: flex;
  flex-direction: row;
  gap: 4px;
}
</style>
