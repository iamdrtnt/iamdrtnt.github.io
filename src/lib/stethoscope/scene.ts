import * as THREE from "three";
import { createStethoscope } from "./model";
import { createNetworks } from "./network";

const radians = THREE.MathUtils.degToRad;
const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// An original studio reflection map. Long cards reflected across a curved
// surface reveal its profile, with dark gaps between the bright strips.
function studioReflection(renderer: THREE.WebGLRenderer) {
  const cards = [
    { direction: vec(-.8, .32, .72), width: .26, height: 1.45, radiance: [4.1, 4.5, 5.3] },
    { direction: vec(.72, -.02, .75), width: .11, height: 1.35, radiance: [6.2, 6.6, 7.0] },
    { direction: vec(.05, .9, .42), width: 1.6, height: .21, radiance: [4.4, 4.1, 3.9] },
    { direction: vec(.02, .08, 1), width: .66, height: .36, radiance: [.82, .88, 1.05] },
    { direction: vec(-.52, -.12, -.78), width: .24, height: .86, radiance: [.55, 1.18, 2.4] },
    { direction: vec(.26, -.86, -.38), width: .78, height: .32, radiance: [.80, .87, 1.04] },
  ].map((card) => {
    const normal = card.direction.normalize();
    const across = vec(0, 1, 0).cross(normal).normalize();
    return { ...card, normal, across, up: normal.clone().cross(across) };
  });
  const width = 512, height = 256;
  const pixels = new Uint16Array(width * height * 4);
  const ray = new THREE.Vector3();
  for (let y = 0; y < height; y++) {
    const latitude = ((y + .5) / height - .5) * Math.PI;
    const cos = Math.cos(latitude), sin = Math.sin(latitude);
    for (let x = 0; x < width; x++) {
      const longitude = ((x + .5) / width - .5) * 2 * Math.PI;
      ray.set(cos * Math.cos(longitude), sin, cos * Math.sin(longitude));
      let r = .037, g = .044, b = .060;
      for (const card of cards) {
        const facing = ray.dot(card.normal);
        if (facing <= 0) continue;
        const u = Math.abs(ray.dot(card.across) / facing) / card.width;
        const v = Math.abs(ray.dot(card.up) / facing) / card.height;
        const d = Math.max(u, v);
        if (d >= 1.15) continue;
        const edge = 1 - THREE.MathUtils.smoothstep(d, .82, 1.15);
        r += edge * card.radiance[0];
        g += edge * card.radiance[1];
        b += edge * card.radiance[2];
      }
      const offset = (y * width + x) * 4;
      pixels[offset] = THREE.DataUtils.toHalfFloat(r);
      pixels[offset + 1] = THREE.DataUtils.toHalfFloat(g);
      pixels[offset + 2] = THREE.DataUtils.toHalfFloat(b);
      pixels[offset + 3] = 0x3c00;
    }
  }
  const latlong = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat, THREE.HalfFloatType);
  latlong.mapping = THREE.EquirectangularReflectionMapping;
  latlong.magFilter = latlong.minFilter = THREE.LinearFilter;
  latlong.needsUpdate = true;
  const generator = new THREE.PMREMGenerator(renderer);
  try {
    return generator.fromEquirectangular(latlong);
  } finally {
    latlong.dispose();
    generator.dispose();
  }
}

// Camera target, minimum vertical and horizontal span, yaw, elevation and roll.
// Intermediate views follow the main tube around the bottom of its loop.
// The same sampling function is used in both scroll directions.
const shots = [
  [0,      -.06, .00, .12,   4.82, 5.20,  12, 16, -19],
  [.125,    .59, .13, .28,   4.25, 4.48,  21, 14, -8],
  [.25,    1.66, .32, .45,   2.38, 2.75,  22, 12,  8],
  [.385,   1.05,-1.17,.23,   2.94, 3.70,  10, 17,  2],
  [.50,     .02,-1.22,.12,   3.22, 4.42,  -3, 13, -4],
  [.625,   -.84, .05, .10,   3.54, 4.33, -11,  7, -2],
  [.75,    -.18,1.50, .16,   2.99, 5.32,  -7, 18,  2],
  [.865,   -.17, .98, .12,   3.93, 5.05,  -1, 13,  1],
  [1,       .04, .02, .14,   5.23, 5.53,   8, 10, -5],
];
function sampleShot(t: number, out: Float64Array) {
  let i = 0;
  while (i < shots.length - 2 && t > shots[i + 1][0]) i++;
  const a = shots[i], b = shots[i + 1];
  const before = shots[Math.max(0, i - 1)], after = shots[Math.min(shots.length - 1, i + 2)];
  const span = b[0] - a[0], u = (t - a[0]) / span, u2 = u * u, u3 = u2 * u;
  for (let k = 1; k < a.length; k++) {
    const startSlope = (b[k] - before[k]) * span / (b[0] - before[0]);
    const endSlope = (after[k] - a[k]) * span / (after[0] - a[0]);
    out[k - 1] = (2 * u3 - 3 * u2 + 1) * a[k] + (u3 - 2 * u2 + u) * startSlope
      + (-2 * u3 + 3 * u2) * b[k] + (u3 - u2) * endSlope;
  }
}

function windowedPose(t: number, start: number, full: number, release: number, end: number) {
  return THREE.MathUtils.smoothstep(t, start, full) * (1 - THREE.MathUtils.smoothstep(t, release, end));
}

export function mountScene(canvas: HTMLCanvasElement, context?: WebGL2RenderingContext) {
  const renderer = new THREE.WebGLRenderer({
    canvas, context, alpha: true, antialias: true, powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.00;
  const scene = new THREE.Scene();
  const reflection = studioReflection(renderer);
  scene.environment = reflection.texture;

  const key = new THREE.DirectionalLight(0xf5f7ff, 1.65);
  const rim = new THREE.DirectionalLight(0x81a9fb, 1.7);
  const fill = new THREE.DirectionalLight(0xc9d9f5, .47);
  key.position.set(-3.5, 5.6, 5.2);
  rim.position.set(2.8, 2.5, -3.0);
  fill.position.set(3.4, -.75, 3.0);
  scene.add(key, rim, fill, new THREE.HemisphereLight(0xd2deec, 0x4a5461, .51));

  const model = createStethoscope();
  const networks = createNetworks(model.root, model.tubeCurve, model.earTips);
  scene.add(model.root);
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const target = new THREE.Vector3(), direction = new THREE.Vector3();
  const shot = new Float64Array(8);
  let width = 0, height = 0, progress = 0, densityLimit = 1.8;
  let lastRender = 0, slowFrames = 0;
  let disposed = false;

  function size() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const compact = matchMedia("(max-width: 760px)").matches;
    const budget = compact ? 700_000 : 1_900_000;
    const deviceRatio = window.devicePixelRatio || 1;
    const density = Math.min(deviceRatio, densityLimit, compact ? 1.55 : 1.8, Math.sqrt(budget / (width * height)));
    renderer.setDrawingBufferSize(width, height, density);
  }

  function render(value: number) {
    if (disposed) return;
    progress = THREE.MathUtils.clamp(value, 0, 1);
    const now = performance.now(), delta = now - lastRender;
    // Only consecutive renders under active input contribute to the budget.
    // Idle time between scroll gestures never lowers visual quality.
    if (delta > 95) slowFrames = 0;
    else if (delta > 30) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames >= 12 && renderer.getPixelRatio() > 1) {
      densityLimit = Math.max(1, renderer.getPixelRatio() * .8);
      slowFrames = 0;
      size();
    }
    lastRender = now;
    const medicine = windowedPose(progress, .045, .25, .29, .49);
    const research = windowedPose(progress, .27, .50, .56, .83);
    const innovation = windowedPose(progress, .53, .75, .82, 1);
    model.update(medicine, research, innovation);
    networks.update(research, innovation, canvas.width, canvas.height, renderer.getPixelRatio());

    sampleShot(progress, shot);
    const [x, y, z, spanY, spanX, yaw, elevation, roll] = shot;
    const distance = Math.max(spanY, spanX / camera.aspect) / (2 * Math.tan(radians(camera.fov / 2)));
    const azimuth = radians(yaw), pitch = radians(elevation);
    direction.set(Math.sin(azimuth) * Math.cos(pitch), Math.sin(pitch), Math.cos(azimuth) * Math.cos(pitch));
    target.set(x, y, z);
    camera.position.copy(target).addScaledVector(direction, distance);
    camera.up.set(-Math.sin(radians(roll)), Math.cos(radians(roll)), 0);
    camera.lookAt(target);
    key.position.x = -3.5 + 1.22 * medicine - .45 * research;
    rim.intensity = 1.70 + .55 * research + .29 * innovation;
    scene.environmentRotation.y = -.18 + .24 * medicine + .12 * innovation;
    renderer.render(scene, camera);
  }
  size();
  render(0);
  return {
    render,
    resize() {
      if (disposed) return;
      size();
      render(progress);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      networks.dispose();
      model.dispose();
      reflection.dispose();
      renderer.dispose();
    },
  };
}
