// There are some method names in here (from the WWT engine) that we have no control over
/* eslint-disable @typescript-eslint/naming-convention */

import "@wwtelescope/engine";

declare module "@wwtelescope/engine" {

  export namespace TileCache {
    let _tiles: Record<string, Tile>;
    export function getTile(level: number, x: number, y: number, dataset: Imageset, parent: null): Tile | undefined;
    export function clearCache(): void;
    export function decimateQueue(): void;
    export function processQueue(renderContext: RenderContext);
    export function removeFromQueue(key: string, complete: boolean): void;
  }

  export class Matrix3d {
    multiplyMatrix(a: Matrix3d, b: Matrix3d): Matrix3d;
    invertMatrix(m: Matrix3d): Matrix3d;
    get_identity(): Matrix3d;
    clone(): Matrix3d;
    invert(): void;
    floatArray(): number[];
    get_m11(): number;
    get_m12(): number;
    get_m13(): number;
    get_m14(): number;
    get_m21(): number;
    get_m22(): number;
    get_m23(): number;
    get_m24(): number;
    get_m31(): number;
    get_m32(): number;
    get_m33(): number;
    get_m34(): number;
    get_m41(): number;
    get_m42(): number;
    get_m43(): number;
    get_m44(): number;
  }

  export class RenderContext {
    getTilesXForLevel(imageset: Imageset, level: number): number;
    getTilesYForLevel(imageset: Imageset, level: number): number;
    get_projection(): Matrix3d;
    get_view(): Matrix3d;
    get_world(): Matrix3d;
  }

  interface Tile {
    dataset?: Imageset;
    _key: string;
    cleanUp(complete: boolean): void;
  }

}
