/* eslint-disable @typescript-eslint/naming-convention */
import { ref, toValue, watch, type Ref, MaybeRef } from "vue";
import { API_BASE_URL, type UserExperienceRating } from "@cosmicds/vue-toolkit";


export interface UseUserExperienceRatingOptions {
  responseOptOut?: Ref<boolean | null>;
  timeout?: number;
  questions?: string[];
  debug?: boolean;
  storagePrefix?: string;
}

export function useUserExperienceRating(storyPrefix: string, uuid: MaybeRef<string>, options?: UseUserExperienceRatingOptions) {
  
  const responseOptOut = options?.responseOptOut ?? ref(null);
  debugLog("Initialized useUserExperienceRating with responseOptOut:", toValue(responseOptOut));
  
  const RATING_OPT_OUT_KEY = `${storyPrefix}-rating-optout` as const;
  const storyRatingUrl = `${API_BASE_URL}/${storyPrefix}/user-experience`;

  const storedRatingOptOut = window.localStorage.getItem(RATING_OPT_OUT_KEY);
  const parsedRatingOptOut = typeof storedRatingOptOut === "string" ? storedRatingOptOut === "true" : null;
  const ratingOptOut = ref<boolean | null>(responseOptOut.value || parsedRatingOptOut);
  
  
  const showRating = ref(false);
  const showRatingPrivacyPolicy = ref(false);
  
  function debugLog(...args: unknown[]) {
    if (options?.debug) {
      console.debug("[useUserExperienceRating]", ...args);
    }
  }
  
  function randomQuestion() {
    const questions = options?.questions ?? [
      "Does this spark your curiosity?",
      "Are you learning something new?",
    ];
    const randIndex = Math.floor(Math.random() * questions.length);
    return questions[randIndex];
  };
  
  const question = ref(randomQuestion());

  const ratingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  function clearRatingTimeout() {
    if (ratingTimeout.value !== null) {
      clearTimeout(ratingTimeout.value);
      ratingTimeout.value = null;
    }
  }

  async function checkForExistingRating() {
    const response = await fetch(`${storyRatingUrl}/${toValue(uuid)}`, {
      method: "GET",
      headers: {
        Authorization: process.env.VUE_APP_CDS_API_KEY ?? "",
      },
    });

    const content = await response.json();
    const gaveRating = response.status === 200 && (content.ratings?.length > 0);
    console.log(`User has ${gaveRating ? "" : "not"} given a rating before.`);
    return gaveRating;
  }
  
  // need to check user exists before this
  async function setupRatingDialog() {
    if (ratingOptOut.value) {
      return;
    }

    let gaveRating = false;
    try {
      gaveRating = await checkForExistingRating();
    } catch (error) {
      console.error("Error checking if user has given a rating:", error);
    }

    if (!gaveRating) {
      clearRatingTimeout();
      ratingTimeout.value = setTimeout(() => {
        showRating.value = true;
      }, options?.timeout ?? 90_000); // default to 90 seconds
    }
  }

  function dismiss() {
    showRating.value = false;
    clearRatingTimeout();
  }

  function optOut() {
    ratingOptOut.value = true;
    dismiss();
  }


  async function updateUserExperienceInfo(rating: UserExperienceRating | null, comments: string | null) {
    const body: Record<string, unknown> = {
      uuid: toValue(uuid),
      question: toValue(question),
      story_name: storyPrefix,
    };
    if (rating) {
      body.rating = rating;
    }
    if (comments) {
      body.comments = comments;
    }
    debugLog("Submitting user experience rating with body:", body);
    fetch(storyRatingUrl, {
      method: "PUT",
      headers: {
        "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to submit rating: ${response.statusText}`);
        }
        debugLog("Successfully submitted user experience rating", response);
      })
      .catch((error) => {
        console.error("Error submitting user experience rating:", error);
      })
      .finally(() => {
        showRating.value = false;
        clearRatingTimeout();
      });
    
  }
  
  
  // if the user was opted out, but then opts in, we want to show them the rating prompts
  watch(responseOptOut, (optOutValue) => {
    // writing to localStorage is handled in usePrivacy, so just handle the rating dialog concerns
    if (optOutValue) {
      showRating.value = false;
      clearRatingTimeout();
    }
  });


  watch(ratingOptOut, (optingOut) => {
    if (optingOut === null) return;
    window.localStorage.setItem(RATING_OPT_OUT_KEY, String(optingOut));
    if (optingOut) {
      showRating.value = false;
      clearRatingTimeout();
    }
  });

  return {
    ratingOptOut,
    showRating,
    showRatingPrivacyPolicy,
    question,
    setupRatingDialog,
    dismiss,
    optOut,
    updateUserExperienceInfo,
  };
}
