import { ref, watch, Ref, nextTick }  from 'vue';
import { ImageSetLayer, Imageset, WWTControl } from '@wwtelescope/engine';
import { resetGeometryForImagesetTiles } from './edit_tile_cache';

export function useImageSetTranslation(layers: Ref<ImageSetLayer[] | null>, options?: { angleDeg?: number, offsetDeg?: number }) {
  const rotationDegrees = ref(options?.angleDeg ?? 0);
  const radialOffsetDegrees = ref(options?.offsetDeg ?? 0);
  console.log('Initial layers:', layers.value);
  console.log('Initial rotation:', rotationDegrees.value, 'Initial radial offset:', radialOffsetDegrees.value);
  
  
  interface LayerSettings {
    centerX: number;
    centerY: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  }
  const originalLayerSettings = ref<Map<string, LayerSettings>>(new Map());
  
  const getOriginalLayerSettings = () => (layers.value ?? []).map(layer => {
    const iset = layer.get_imageSet() as Imageset;
    if (originalLayerSettings.value.has(layer.id.toString())) return originalLayerSettings.value.get(layer.id.toString())!;
    originalLayerSettings.value.set(layer.id.toString(), {
      centerX: iset.get_centerX(),
      centerY: iset.get_centerY(),
      offsetX: iset.get_offsetX(),
      offsetY: iset.get_offsetY(),
      rotation: iset.get_rotation(),
    });
    return originalLayerSettings.value.get(layer.id.toString())!;
  });
  
  
  function updateImageset(layer: ImageSetLayer) {
    const iset = layer.get_imageSet() as Imageset;
    const originalSettings = originalLayerSettings.value.get(layer.id.toString());
    if (!originalSettings) return;
    
    const rotationRadians = rotationDegrees.value * Math.PI / 180;
    const newCenterX = originalSettings.centerX + radialOffsetDegrees.value * Math.cos(rotationRadians);
    const newCenterY = originalSettings.centerY - radialOffsetDegrees.value * Math.sin(rotationRadians);
    
    iset.set_centerX(newCenterX);
    iset.set_centerY(newCenterY);
    return iset;
  }
  

  
  function updateImageSets() {
    if (!layers.value) return;
    layers.value.forEach((layer) => {
      const iset = updateImageset(layer);
      if (!iset) return;
      resetGeometryForImagesetTiles(iset);
    });

    // i don't think we really need this
    WWTControl.singleton.renderOneFrame();
  }
   
  watch(() => layers.value?.length, () => {
    getOriginalLayerSettings();
    nextTick(updateImageSets);
  });
  
  



  watch([rotationDegrees, radialOffsetDegrees], updateImageSets);
  
  return {
    angle: rotationDegrees,
    offset: radialOffsetDegrees,
  };
};
