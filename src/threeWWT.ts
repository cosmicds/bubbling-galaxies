import { Matrix3d, RenderContext, Vector3d, WWTControl } from "@wwtelescope/engine";
import { Camera, Matrix4, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";

function matchDimensions(source: HTMLCanvasElement, target: HTMLCanvasElement) {
  target.style.width = source.style.width;
  target.style.height = source.style.height;
  target.height = source.height;
  target.width = source.width;
}

function createDummyCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const dummy = document.createElement("canvas");
  const opacity = 0.0;
  matchDimensions(canvas, dummy);
  dummy.id = "three-js-canvas";
  dummy.style.position = "absolute";
  dummy.style.left = "0";
  dummy.style.top = "0";
  dummy.style.background = `rgba(0, 0, 0, ${opacity})`;
  dummy.style.pointerEvents = "none";

  const observer = new ResizeObserver(_entries => {
    matchDimensions(canvas, dummy);
  });
  observer.observe(canvas);

  return dummy;
}

export function createTHREECamera(renderContext: RenderContext): PerspectiveCamera {
  const camera = new PerspectiveCamera(75, renderContext.width / renderContext.height, renderContext.nearPlane, 1);
  camera.matrixAutoUpdate = false;
  return camera;
}

export function createTHREERenderer(window: Window, control: WWTControl): WebGLRenderer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error WWTControl does have a canvas
  const canvas: HTMLCanvasElement = control.canvas;
  const dummy = createDummyCanvas(canvas);
  document.body.appendChild(dummy);
  const renderer = new WebGLRenderer({
    canvas: dummy,
    context: dummy.getContext("webgl2")!,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(dummy.clientWidth, dummy.clientHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio)
  // renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);

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

export function updateTHREECamera(camera: PerspectiveCamera, renderContext: RenderContext) {
  camera.projectionMatrix.copy(wwtMatrixToTHREE(renderContext.get_projection()));
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

  camera.matrixWorldInverse.copy(wwtMatrixToTHREE(renderContext.get_view()));
  camera.matrixWorld.copy(camera.matrixWorldInverse).invert();
  camera.matrixWorldNeedsUpdate = false;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `cameraPosition` exists
  // const wwtCameraPosition: Vector3d = renderContext.cameraPosition;
  // camera.position.set(wwtCameraPosition.x, wwtCameraPosition.y, wwtCameraPosition.z);

  // camera.fov = renderContext.viewCamera.zoom / 6;
  // camera.near = renderContext.nearPlane;
}

export function updateTHREEObject(object: Object3D, renderContext: RenderContext) {
  // object.matrix.copy(wwtMatrixToTHREE(renderContext.get_world()));
  // object.matrixWorldNeedsUpdate = true;
}

export function renderTHREE(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.render(scene, camera);
}
