import { Matrix3d, RenderContext, WWTControl } from "@wwtelescope/engine";
import { Camera, Matrix4, Object3D, Scene, WebGLRenderer } from "three";

export function createTHREERenderer(control: WWTControl): WebGLRenderer {
  const renderer = new WebGLRenderer({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error WWTControl does have a canvas
    canvas: control.canvas,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error WWTControl does have a canvas
    context: control.renderContext.gl,
    antialias: true,
  });
  renderer.autoClear = false;

  return renderer;
}

export function wwtMatrixToTHREE(mat: Matrix3d): Matrix4 {
  const matrix = new Matrix4();
  matrix.set(
    mat.get_m11(), mat.get_m21(), mat.get_m31(), mat.get_m41(),
    mat.get_m12(), mat.get_m22(), mat.get_m32(), mat.get_m42(),
    mat.get_m13(), mat.get_m23(), mat.get_m33(), mat.get_m43(),
    mat.get_m14(), mat.get_m24(), mat.get_m34(), mat.get_m44(),
  );
  return matrix;
}

export function updateTHREECamera(camera: Camera, renderContext: RenderContext) {
  camera.projectionMatrix.copy(wwtMatrixToTHREE(renderContext.get_projection()));
  camera.matrixWorldInverse.copy(wwtMatrixToTHREE(renderContext.get_view()));
  camera.matrixWorld.copy(camera.matrixWorldInverse).invert();
  camera.matrixWorldNeedsUpdate = false;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

export function updateTHREEObject(object: Object3D, renderContext: RenderContext) {
  object.matrix.copy(wwtMatrixToTHREE(renderContext.get_world()));
  object.matrixWorldNeedsUpdate = false;
}

export function renderTHREE(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.state.reset();
  renderer.render(scene, camera);
}
