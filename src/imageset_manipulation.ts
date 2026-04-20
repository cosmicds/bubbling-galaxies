import { ref, watch, Ref }  from 'vue';
import { ImageSetLayer, Imageset, WWTControl } from '@wwtelescope/engine';
import { removeTilesForImageset } from './edit_tile_cache';

export function useImageSetManipulation(layers: Ref<ImageSetLayer[] | null>, options?: { angleDeg?: number, offsetDeg?: number }) {
  const rotationDegrees = ref(options?.angleDeg ?? 0);
  const radialOffsetDegrees = ref(options?.offsetDeg ?? 0);
  console.log('Initial layers:', layers.value);
  console.log('Initial rotation:', rotationDegrees.value, 'Initial radial offset:', radialOffsetDegrees.value);
  
  
  const getOriginalLayerSettings = () => (layers.value ?? []).map(layer => {
    const iset = layer.get_imageSet() as Imageset;
    return {
      centerX: iset.get_centerX(),
      centerY: iset.get_centerY(),
      offsetX: iset.get_offsetX(),
      offsetY: iset.get_offsetY(),
      rotation: iset.get_rotation(),
    };
  });
  const originalLayerSettings = ref(getOriginalLayerSettings());
  
  function updateImageSets() {
    if (!layers.value) return;
    const rotationRadians = rotationDegrees.value * Math.PI / 180;

    layers.value.forEach((layer, index) => {
      const iset = layer.get_imageSet() as Imageset;
      layer.version = (layer.version ?? 0) + 1; // Force update
      layer.set_overrideDefaultLayer(true);
      const originalSettings = originalLayerSettings.value[index];
      const newCenterX = originalSettings.centerX + radialOffsetDegrees.value * Math.cos(rotationRadians);
      const newCenterY = originalSettings.centerY - radialOffsetDegrees.value * Math.sin(rotationRadians);
      
      iset.set_centerX(newCenterX);
      iset.set_centerY(newCenterY);
      iset.set_rotation(rotationRadians);
      removeTilesForImageset(iset);

    });
    
    // i don't think we really need this
    WWTControl.singleton.renderOneFrame();
  }
   
  watch(() => layers.value?.length, () => {
    originalLayerSettings.value = getOriginalLayerSettings();
    updateImageSets();
  });
  watch([rotationDegrees, radialOffsetDegrees], updateImageSets);
  
  return {
    angle: rotationDegrees,
    offset: radialOffsetDegrees,
  };
};