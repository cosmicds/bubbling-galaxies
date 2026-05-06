# Foreground / Background Gallery Notes

This documents the current foreground/background gallery work and the style changes made while getting here.

## Component Shape

The gallery is still the component that loads WTML places, creates WWT imageset layers, syncs selected places to layer visibility, and optionally orders selected layers. The foreground/background picker does not load WTML and does not talk directly to `selectedPlaces`.

The current pieces are:

- `Gallery.vue`: hidden loader/controller for WTML places, imageset layers, selected layer visibility, opacity emitted from gallery items, and optional layer order.
- `ForegroundBackgroundPicker.vue`: visible foreground/background picker UI. It receives the list of places from the parent, owns the closed/open picker states, and sets only `foreground` or `background`.
- `GalleryItemSelector.vue`: larger open-mode control for one selected slot. It opens the picker for that slot, shows a small thumbnail swatch, and handles that slot's opacity slider.
- `GalleryItem.vue`: still the reusable thumbnail/label/opacity item. It emits `update:opacity` and does not set WWT opacity itself.
- `BubblingGalaxies.vue`: coordinates foreground/background selection with the hidden `Gallery` by converting `[background, foreground]` into `selectedGalleryItems`.

## Data Flow

`Gallery` loads `galleryPlaces` from `ngc628_datasets.wtml`.

`ForegroundBackgroundPicker` gets those places through `v-model:places`, then lets the user choose:

- `foregroundGalleryItem`
- `backgroundGalleryItem`

The parent watches those refs and updates the gallery selection:

```ts
selectedGalleryItems.value = [background, foreground].filter((place): place is Place => place !== null);
```

That order is intentional: background first, foreground second. The hidden gallery receives this array through `v-model:selected-places`.

The default foreground is `"Infrared Stars & Dust (JWST)"`. The background starts as `null`.

## Layer Ordering

`Gallery.vue` now has a `useLayerSelectionOrder` prop.

When enabled, the selected imageset layers are ordered by `selectedPlaces` order. The persistent layer is kept at order `0`, then selected items are pushed to the top of the current imageset layer stack in array order.

For this foreground/background flow, the parent passes:

```vue
use-layer-selection-order
```

Since the parent writes `selectedGalleryItems` as `[background, foreground]`, this pushes the background up first, then the foreground above it.

## Opacity

`GalleryItem.vue` emits opacity changes with `update:opacity`.

`Gallery.vue` listens for those events in the normal gallery path and applies opacity to its known layer map.

`ForegroundBackgroundPicker.vue` owns the foreground/background opacity values so the closed preview sliders and open selector sliders stay in sync.

`ForegroundBackgroundPicker.vue` and `GalleryItemSelector.vue` use the WWT engine store for the foreground/background controls. They find the matching imageset layer by comparing the selected place's imageset URL or name against active WWT imageset layers. Our imageset names and URLs are assumed unique, so this is intentionally simple.

Opacity is stored by imageset URL/name and applied with:

```ts
imagesetLayer.value?.set_opacity(opacity);
```

The closed view uses `GalleryItem` with `show-opacity`, while the open view passes the same opacity value into each `GalleryItemSelector`.

## Picker Behavior

`ForegroundBackgroundPicker` has two visual modes:

- closed mode: compact `Choose Views` display using `GalleryItem` thumbnails for only the currently selected places
- open mode: expanded selector surface with the two `GalleryItemSelector` controls along the bottom; the mini gallery opens above only after one selector is clicked

The picker has a simple active-slot model:

- clicking the foreground selector makes the mini gallery choose the foreground
- clicking the background selector makes the mini gallery choose the background
- selecting a `GalleryItem` writes to whichever slot is active

The picker does not pass Gallery's `selected` prop through as shared selection state. Instead, it highlights the active slot's current place itself.

The picker also hides the persistent layer when requested. It computes `shownPlaces` from `places`, `persist`, and `hidePersisted`, then renders only those places.

## Labels And Info

The selected place name is no longer shown inside the selector buttons.

The visible labels are stacked in the parent using `DetailSummary`:

- foreground label first
- background label second, only when a background is selected

Opening either label sets `infoGalleryItem` and shows the info sheet for that specific place. Simulation mode still uses the simulation label.

## Style Changes

The foreground/background picker CSS was intentionally shaped to look like it came from the existing Gallery CSS:

- same `--gallery-width`, `--gallery-max-height`, `--gallery-item-height`, `--column-count`, and `--selected-color` variables
- same nested LESS style as `Gallery.vue`
- same blurred glass treatment: transparent base, `rgba(0,0,0,0.5)` when visible, `box-shadow`, and `backdrop-filter: blur(6px)`
- same compact border radius language: mostly `3px` and `5px`
- copied gallery item sizing for the mini picker: `width: var(--gallery-width)`, `--image-width: 96px`, image height `45px`
- retained commented-out gallery CSS where it helped preserve the "copied from Gallery" feel

The closed foreground/background display is narrowed to the gallery width:

```css
width: calc(var(--gallery-width) + 10px);
```

The app currently passes `width="105px"`, so closed mode is small. Open mode uses `--fg-picker-open-width`, currently defaulting to `240px`, so the selector can expand without making the mini gallery thumbnails larger.

## Selector Button Styling

`GalleryItemSelector` uses `gallery-item-selector` as the wrapper class and `gls__*` for internals.

The button was simplified after the thumbnail-background version proved hard to read:

- thumbnail is a small swatch on the side
- text is just `Foreground`, `Background`, or `Select Foreground/Background`
- no selected place title inside the button
- selected state uses a subtle `1px` grey border
- active state uses a darker grey outline
- the button is larger in open select mode
- the thumbnail uses `background-size: 200%` so the preview appears zoomed without changing the swatch size

The opacity sliders are only shown when that slot has a selected place.

## Current Parent Wiring

The visible picker is:

```vue
<ForegroundBackgroundPicker
  v-show="ready && !showSimulation"
  v-model:open="galleryOpen"
  v-model:places="galleryPlaces"
  v-model:foreground="foregroundGalleryItem"
  v-model:background="backgroundGalleryItem"
  selected-color="limegreen"
  :columns="1"
  width="105px"
  persist="Optical (Kitt Peak)"
  :hide-persisted="true"
  :disabled="showImageCard"
/>
```

The hidden gallery is still present to load and manage layers:

```vue
<Gallery
  v-show="false"
  v-model:open="galleryLoaderOpen"
  v-model:selected-places="selectedGalleryItems"
  v-model:places="galleryPlaces"
  wtml-url="./ngc628_datasets.wtml"
  :single-select="false"
  selected-color="limegreen"
  show-opacity
  :columns="1"
  width="105px"
  persist="Optical (Kitt Peak)"
  :hide-persisted="true"
  :hide-gallery-layers="showSimulation || showSplashScreen"
  :disabled="true"
  use-layer-selection-order
/>
```

## Design Intent

The current result keeps the original gallery mostly intact and uses it as the layer system. The new picker is just a small foreground/background UI that borrows Gallery's visual language without inheriting all of Gallery's state logic.
