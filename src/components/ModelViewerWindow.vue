<template>
  <v-dialog
    v-model="showModel"
    class="model-viewer-dialog"
    eager
    transition="dialog-top-transition"
    fullscreen
    :scrim="false"
  >
    <v-card
      color="black"
      max-height="100vh"
    >
      <v-card-title class="model-view-dialog__card-title">
        <div
          class="model-view-dialog__title"
        >
          3D Model of the Simulated Galaxy
        </div>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          style="float: right;"
          variant="outlined"
          color="buttonColor"
          @click="showModel = false"
        />
      </v-card-title>
      <v-card-text class="model-view-dialog__card-text">
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
        <slot />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const showModel = defineModel<boolean>();
defineProps({
  "buttonColor": {
    type: String,
    required: false,
    default: 'white'
  }
});
</script>

<style lang="less">
model-viewer {
  margin-inline: auto;
  width: 70vw;
  // height: 70vh;
  flex: 1 1 0%;
  min-height: 0;
  height: auto;
}

.model-viewer-dialog {

  .model-view-dialog__card-title {
    display: flex;
    border-bottom: 1px solid white;
  }

  .v-card>.v-card-text.model-view-dialog__card-text {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .model-view-dialog__card-title > .model-view-dialog__title {
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: auto;
    white-space: break-spaces;
  }
}

</style>
