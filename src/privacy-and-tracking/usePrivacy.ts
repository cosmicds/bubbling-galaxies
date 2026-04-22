import { ref, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { v4 } from "uuid";



export function usePrivacy(storyPrefix: string) {
  const UUID_KEY = `${storyPrefix}-uuid` as const;
  const OPT_OUT_KEY = `${storyPrefix}-optout` as const;

  const uuid = useStorage<string>(UUID_KEY, v4());

  const storedOptOut = window.localStorage.getItem(OPT_OUT_KEY);
  const parsedOptOut = typeof storedOptOut === "string" ? storedOptOut === "true" : null;

  const responseOptOut = ref<boolean | null>(parsedOptOut);
  const showPrivacyDialog = ref(false);

  function allow() {
    responseOptOut.value = false;
    showPrivacyDialog.value = false;
  }

  function optOut() {
    responseOptOut.value = true;
    showPrivacyDialog.value = false;
  }

  watch(responseOptOut, (optOutValue) => {
    if (optOutValue === null) {
      return;
    }
    window.localStorage.setItem(OPT_OUT_KEY, String(optOutValue));
  });

  return {
    uuid,
    responseOptOut,
    showPrivacyDialog,
    allow,
    optOut,
  };
}
