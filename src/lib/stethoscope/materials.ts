import {
  CanvasTexture,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from "three";

// Repeat a fine, directional finish around the turned metal fittings. Varying
// roughness preserves the colour of the studio lights in their reflection.
function steelGrain() {
  const width = 32;
  const height = 128;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const stripe = 223 + 13 * Math.sin(y * 1.87) + 8 * Math.cos(y * 0.59);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const value = stripe + 5 * Math.sin(x * 0.62 + y);
      data[i] = data[i + 1] = data[i + 2] = value;
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function diaphragmStamp() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const size = canvas.width;
  const centre = size / 2;
  const pixels = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centre;
      const dy = y - centre;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const machining = 3.8 * Math.sin(radius * 1.65) + 1.7 * Math.sin(radius * 0.56);
      const value = 50 + machining + 7 * (1 - radius / centre);
      const i = (y * size + x) * 4;
      pixels.data[i] = value;
      pixels.data[i + 1] = value + 4;
      pixels.data[i + 2] = value + 7;
      pixels.data[i + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  ctx.translate(centre, centre);

  for (const [r, width, colour] of [
    [233, 1.6, "#1c2226"], [230.5, 1.2, "#656c71"], [209, 1.2, "#242b30"],
  ] as const) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.lineWidth = width;
    ctx.strokeStyle = colour;
    ctx.stroke();
  }

  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return map;
}

// Orient the diaphragm's specular lobe tangentially to the brushed rings so
// the soft fan-shaped highlight follows the camera and the moving lights.
function radialBrush() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - size / 2;
      const dy = y + 0.5 - size / 2;
      const radius = Math.hypot(dx, dy);
      const i = 4 * (y * size + x);
      data[i] = 127.5 * (1 - dy / radius);
      data[i + 1] = 127.5 * (1 + dx / radius);
      data[i + 2] = Math.min(255, radius * 90);
      data[i + 3] = 255;
    }
  }
  const map = new DataTexture(data, size, size);
  map.magFilter = map.minFilter = LinearFilter;
  map.needsUpdate = true;
  return map;
}

export function createFinishes() {
  const grain = steelGrain();
  const stamp = diaphragmStamp();
  const brush = radialBrush();
  const materials = {
    rubber: new MeshPhysicalMaterial({ color: 0x25292d, roughness: 0.46, ior: 1.41 }),
    soft: new MeshStandardMaterial({ color: 0x1e252c, roughness: 0.54 }),
    silver: new MeshStandardMaterial({
      color: 0xc5ccce, metalness: 0.97, roughness: 0.21, roughnessMap: grain,
    }),
    satin: new MeshStandardMaterial({
      color: 0xa7b0b6, metalness: 0.91, roughness: 0.36, roughnessMap: grain,
    }),
    darkMetal: new MeshStandardMaterial({
      color: 0x505e68, metalness: 0.85, roughness: 0.32, roughnessMap: grain,
    }),
    face: new MeshPhysicalMaterial({
      color: stamp ? 0xffffff : 0x353b41,
      map: stamp,
      roughness: 0.4,
      metalness: 0.37,
      anisotropy: 0.62,
      anisotropyMap: brush,
    }),
    azure: new MeshStandardMaterial({
      color: 0x467ac1, roughness: 0.31, metalness: 0.65, emissive: 0x0a234d, emissiveIntensity: 0.32,
    }),
    groove: new MeshStandardMaterial({ color: 0x171d23, roughness: 0.56, metalness: 0.12 }),
  };
  return {
    ...materials,
    dispose() {
      Object.values(materials).forEach((material) => material.dispose());
      stamp?.dispose();
      brush.dispose();
      grain.dispose();
    },
  };
}
