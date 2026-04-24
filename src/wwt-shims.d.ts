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

  export namespace Matrix3d {
    function multiplyMatrix(a: Matrix3d, b: Matrix3d): Matrix3d;
    function invertMatrix(m: Matrix3d): Matrix3d;
    function get_identity(): Matrix3d;
    function clone(): Matrix3d;
    function invert(): void;
    function floatArray(): number[];
  }

  export namespace RenderContext {
    export function getTilesXForLevel(imageset: Imageset, level: number): number;
    export function getTilesYForLevel(imageset: Imageset, level: number): number;
    export function get_projection(): Matrix3d;
    export function get_view(): Matrix3d;
    export function get_world(): Matrix3d;
  }

  interface Tile {
    dataset?: Imageset;
    _key: string;
    cleanUp(complete: boolean): void;
  }

}
