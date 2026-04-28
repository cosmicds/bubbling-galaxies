import { Matrix3d, RenderContext, Vector3d, WWTControl } from "@wwtelescope/engine";
import { ACESFilmicToneMapping, Camera, Matrix4, Object3D, PerspectiveCamera, Scene, SpotLight, Vector3, WebGLRenderer } from "three";
import * as THREE from "three";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Encapsulate the DRACO setup into this utility function
export function createLoader(): GLTFLoader {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./draco/");
  loader.setDRACOLoader(dracoLoader);
  return loader;
}

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
  const camera = new PerspectiveCamera(75, renderContext.width / renderContext.height, renderContext.nearPlane, 1000000000);
  camera.matrixAutoUpdate = false;
  return camera;
}

export function createTHREEScene(): Scene {
  const scene = new Scene();

  // const ambient = new SpotLight(0xFFD500, 2);
  // ambient.castShadow = true;
  // ambient.position.set(0, 0, 0);
  // scene.add(ambient);

  return scene;
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

  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;

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

export function renderTHREE(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.render(scene, camera);
}

export function loadModel(url: string) {
}
