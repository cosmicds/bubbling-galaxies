<template>
  <v-card>
    <v-card-text>
      <slot>
        To evaluate usage of this app, <strong>anonymized</strong> data may be collected. Personal Data is never collected
      </slot>
    </v-card-text>
    <v-card-actions class="pt-3">
      <v-spacer></v-spacer>
      <slot 
        name="actions" 
        v-bind="{responseOptOut, showPrivacyDialog}"
      >
        <v-btn
          color="#BDBDBD"
          href="https://www.cfa.harvard.edu/privacy-statement"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </v-btn>
        <v-btn
          color="#ff6666"
          @click="() => {
            responseOptOut = true;
            showPrivacyDialog = false;
          }"
        >
          Opt out
        </v-btn>
        <v-btn 
          color="green"
          @click="() => {
            responseOptOut = false;
            showPrivacyDialog = false;
          }"
        >
          Allow
        </v-btn>
      </slot>
    </v-card-actions>
  </v-card>
</template>


<script setup lang="ts">
import { ref } from 'vue';
const responseOptOut = ref<boolean | null>(null);
const showPrivacyDialog = ref<boolean>(false);

</script>