<template>
  <v-dialog
    v-model="open"
    location="bottom"
    max-height="35vh"
    content-class="expansion-dialog-content"
    :opacity="0"
    :scrim="false"
    scrollable
    transition="dialog-bottom-transition"
  >
    <template #activator="{ props: activatorProps }">
      <div
        class="expansion-panel"
        v-bind="activatorProps"
      >
        <slot name="title">
          <strong>{{ title }}</strong>
        </slot>
      </div>
    </template>
    <v-card>
      <v-card-title class="expansion-panel-title">
        <slot name="title">
          <strong>{{ title }}</strong>
        </slot>
        <v-btn
          class="xpansion-panel-close"
          icon="mdi-close"
          variant="text"
          density="compact"
          color="white"
          @click="open = false"
        ></v-btn>
      </v-card-title>
      <v-card-text>
        <slot>
          <div v-html="content"></div>
        </slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>


<script setup lang="ts">

const open = defineModel<boolean>({ default: false });

interface Props {
  title?: string;
  content?: string;
  normallyOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  normallyOpen: false,
  title: '',
  content: '',
});

</script>

<style lang="less">
.expansion-dialog-content {
  align-self: flex-end;
  margin: 1em;

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
}

.expansion-panel {
  background: rgba(0, 0, 0, 0.10);
  cursor: pointer;
  border: 1px solid rgba(255,255,255, 0.3);
  padding: 10px 15px;
  border-radius: 5px;
  backdrop-filter: blur(6px);
}

.v-card-title.expansion-panel-title {
  background-color: rgba(0, 0, 0, 0.30);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1em;
}

.expansion-panel-close {
}
</style>
