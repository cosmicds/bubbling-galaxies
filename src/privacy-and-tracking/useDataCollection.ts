/* eslint-disable @typescript-eslint/naming-convention */
import { computed, ref, toValue, type MaybeRef, type Ref } from "vue";
import { API_BASE_URL } from "@cosmicds/vue-toolkit";

export interface UseDataCollectionOptions {
  responseOptOut?: Ref<boolean | null>;
}

export function useDataCollection(
  storyPrefix: string,
  uuid: MaybeRef<string>,
  options?: UseDataCollectionOptions,
) {
  const responseOptOut = options?.responseOptOut ?? ref(null);
  const storyTrackingUrl = `${API_BASE_URL}/${storyPrefix}/data`;
  const updateUrl = computed(() => `${storyTrackingUrl}/${toValue(uuid)}`);
  const apiKey = process.env.VUE_APP_CDS_API_KEY ?? "";
  const canTrackStory = ref(false);

  // Story component populates and mutates these values directly.
  // Plain JS object — values are read at send time, no reactivity needed.
  const trackingValues: Record<string, unknown> = {};

  async function createUser() {
    const response = await fetch(storyTrackingUrl, {
      method: "PUT",
      headers: {
        Authorization: process.env.VUE_APP_CDS_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_uuid: toValue(uuid),
        story_name: storyPrefix,
        ...trackingValues,
      }),
    });

    if (!response.ok) {
      console.error("Failed to create user entry for tracking");
    }
    return response;
  }

  async function checkExistingUser() {
    const response = await fetch(`${storyTrackingUrl}/${toValue(uuid)}`, {
      method: "GET",
      headers: {
        Authorization: process.env.VUE_APP_CDS_API_KEY ?? "",
      },
    });

    const content = await response.json();
    return response.status === 200 && content.response?.user_uuid !== undefined;
  }

  async function createUserEntry() {
    if (responseOptOut.value !== false) {
      return false;
    }

    try {
      const userExists = await checkExistingUser();
      canTrackStory.value = true;
      if (!userExists) {
        await createUser();
      }
      return userExists;
    } catch (error) {
      console.error("Error checking for user entry:", error);
      return false;
    }
  }

  return {
    canTrackStory,
    trackingValues,
    updateUrl,
    apiKey,
    createUserEntry,
  };
}
