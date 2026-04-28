/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { RenderContext, TileCache, Imageset } from "@wwtelescope/engine";


// export function getTileKey(imageset, level, x, y, parent) {
//   if (imageset.get_projection() === 7 && parent != null) {
//     const ipix = (parent).ipix * 4 + y * 2 + x;
//     return imageset.get_imageSetID().toString() + '\\' + level.toString() + '\\' + ipix.toString();
//   }

//   return imageset.get_imageSetID().toString() + '\\' + level.toString() + '\\' + y.toString() + '_' + x.toString();
// }

function _deleteTile(tile) {
  if (!tile) return;
  tile.cleanUp(true);
  delete TileCache._tiles[tile._key];
}

// Tile's all have a createGeometry function
// that short circuits if geometry is already created
// this forces it to re-derive and set the geometry
// without deleting the Texture which then needs 
// to be recreated which is slow
function deleteTileGeometry(tile) {
  if (!tile) return;
  //just say it has none
  tile.geometryCreated = false;
}

export function resetGeometryForImagesetTiles(imageset: Imageset) {
  const maxX = RenderContext.getTilesXForLevel(imageset, imageset.get_baseLevel());
  const maxY = RenderContext.getTilesYForLevel(imageset, imageset.get_baseLevel());
  for (let x = 0; x < maxX; x++) {
    for (let y = 0; y < maxY; y++) {
      const tile = TileCache.getTile(imageset.get_baseLevel(), x, y, imageset, null);
      // deleteTile(tile); // bad, slow
      deleteTileGeometry(tile); 
    }
  }
}