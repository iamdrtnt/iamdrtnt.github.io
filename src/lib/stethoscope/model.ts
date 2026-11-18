import {
  BufferGeometry, CatmullRomCurve3, CircleGeometry, Float32BufferAttribute, Group,
  LatheGeometry, Material, Mesh, Object3D, TubeGeometry, Vector2, Vector3,
} from "three";
import { createFinishes } from "./materials.ts";

type Profile = Array<[radius: number, axialPosition: number]>;
const up = new Vector3(0, 1, 0);

function part(parent: Object3D, name: string, geometry: BufferGeometry, material: Material) {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

// Machine a rounded profile about the local Y axis. The profile may turn
// back down the inner wall to form the bore of a genuinely hollow fitting.
function turned(parent: Object3D, name: string, profile: Profile, material: Material, sides = 40) {
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), sides);
  return part(parent, name, geometry, material);
}

function axialMount(parent: Object3D, origin: Vector3, direction: Vector3) {
  const group = new Group();
  group.position.copy(origin);
  group.quaternion.setFromUnitVectors(up, direction);
  parent.add(group);
  return group;
}

// Loft one round hose into two round hose sockets. Each ring traces the
// exterior of two overlapping ellipses. At their fork, each lobe closes
// around its own bore; below it, the two halves share a longitudinal seam.
function manifoldGeometry() {
  const vertices: number[] = [];
  const indices: number[] = [];
  const rows = 36, sides = 32;
  for (const side of [-1, 1]) {
    const base = vertices.length / 3;
    for (let j = 0; j <= rows; j++) {
      const t = j / rows;
      const y = -0.345 + 0.54 * t;
      const spread = 0.2 * t * t;
      const radius = 0.107 - 0.014 * t;
      const rx = radius * Math.hypot(1, 0.74 * t);
      const limit = Math.acos(Math.max(-1, -spread / rx));
      for (let i = 0; i <= sides; i++) {
        const angle = -limit + 2 * limit * i / sides;
        const x = side * (spread + rx * Math.cos(angle));
        vertices.push(x, y + x * 0.066, radius * Math.sin(angle) + x * 0.1);
        if (i < sides && j < rows) {
          const a = base + j * (sides + 1) + i;
          const b = a + sides + 1;
          if (side < 0) indices.push(a, a + 1, b, a + 1, b + 1, b);
          else indices.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Average duplicate normals along the shared front and rear seams.
  const normal = geometry.getAttribute("normal");
  const half = (rows + 1) * (sides + 1);
  for (let j = 0; j <= rows; j++) {
    for (const edge of [0, sides]) {
      const i = j * (sides + 1) + edge;
      if (Math.abs(vertices[i * 3]) > 1e-6) continue;
      const a = new Vector3().fromBufferAttribute(normal, i);
      const b = new Vector3().fromBufferAttribute(normal, i + half);
      a.add(b).normalize();
      normal.setXYZ(i, a.x, a.y, a.z);
      normal.setXYZ(i + half, a.x, a.y, a.z);
    }
  }
  return geometry;
}

export function createStethoscope() {
  const root = new Group();
  root.name = "Stethoscope";
  const finishes = createFinishes();
  const chest = new Group();
  chest.name = "Chestpiece";
  const chestRest = new Vector3(1.63, 0.32, 0.35);
  chest.position.copy(chestRest);
  chest.rotation.set(-0.10, -0.84, -0.36, "ZYX");
  const chestRotation = chest.rotation.clone();
  root.add(chest);

  // One spun body narrows behind the diaphragm into a recessed rear bell.
  const disk = new Group();
  disk.rotation.x = Math.PI / 2;
  chest.add(disk);
  turned(disk, "Bell cavity", [
    [0.001, -0.24], [0.15, -0.25], [0.216, -0.29], [0.271, -0.37],
    [0.29, -0.385], [0.312, -0.377], [0.32, -0.345], [0.295, -0.323],
    [0.245, -0.267], [0.234, -0.211], [0.244, -0.17], [0.31, -0.143],
    [0.381, -0.114], [0.476, -0.082], [0.562, -0.054], [0.588, -0.032],
    [0.604, -0.003], [0.604, 0.039], [0.586, 0.056],
  ], finishes.silver, 96);
  turned(disk, "Rear non-chill rim", [
    [0.267, -0.365], [0.267, -0.386], [0.278, -0.397], [0.316, -0.397],
    [0.329, -0.384], [0.329, -0.357], [0.323, -0.345], [0.312, -0.34],
  ], finishes.soft, 72);
  turned(disk, "Diaphragm retaining band", [
    [0.588, 0.009], [0.61, 0.014], [0.62, 0.027], [0.622, 0.052],
    [0.616, 0.059], [0.615, 0.067], [0.623, 0.075], [0.623, 0.107],
    [0.617, 0.118], [0.602, 0.121],
  ], finishes.darkMetal, 96);
  turned(disk, "Polished bezel", [
    [0.602, 0.092], [0.621, 0.10], [0.624, 0.112], [0.618, 0.129],
    [0.601, 0.14], [0.573, 0.142], [0.563, 0.135], [0.556, 0.124],
  ], finishes.silver, 96);
  turned(disk, "Diaphragm gasket", [
    [0.553, 0.116], [0.565, 0.122], [0.564, 0.132], [0.553, 0.136],
    [0.542, 0.135], [0.538, 0.127],
  ], finishes.groove, 96);
  const diaphragm = part(chest, "Acoustic diaphragm", new CircleGeometry(0.545, 96), finishes.face);
  diaphragm.position.z = 0.13;

  // The swivel stem is seated behind the diaphragm. A real plug and a bored
  // receptacle become visible in the gap as the chestpiece withdraws.
  const stem = axialMount(chest, new Vector3(0, 0, -0.163), up.clone().negate());
  turned(stem, "Acoustic swivel stem", [
    [0.118, 0.15], [0.135, 0.195], [0.131, 0.34], [0.116, 0.39],
    [0.106, 0.44], [0.109, 0.6], [0.119, 0.62], [0.12, 0.683],
    [0.108, 0.701], [0.079, 0.707], [0.077, 0.802], [0.074, 0.831],
    [0.059, 0.84], [0.037, 0.84], [0.037, 0.79],
  ], finishes.silver);
  turned(stem, "Selector index", [[0.108, 0.555], [0.112, 0.558], [0.112, 0.58], [0.108, 0.583]], finishes.azure);

  const plug = new Vector3(0, -0.72, -0.163).applyQuaternion(chest.quaternion).add(chestRest);
  const stemAxis = up.clone().applyQuaternion(chest.quaternion);
  const tubeCurve = new CatmullRomCurve3([
    new Vector3(-1, -0.396, -0.11),
    new Vector3(-1.04, -0.85, -0.14),
    new Vector3(-1.035, -1.43, -0.06),
    new Vector3(-0.825, -1.9, 0.13),
    new Vector3(-0.28, -2.098, 0.25),
    new Vector3(0.31, -2.035, 0.25),
    new Vector3(0.79, -1.72, 0.29),
    plug.clone().addScaledVector(stemAxis, -0.85),
    plug.clone().addScaledVector(stemAxis, -0.34),
    plug.clone(),
  ]);
  part(root, "Acoustic tubing", new TubeGeometry(tubeCurve, 144, 0.107, 22, false), finishes.rubber);
  const cuff = axialMount(root, plug, stemAxis);
  turned(cuff, "Moulded hose cuff", [
    [0.106, -0.29], [0.11, -0.271], [0.118, -0.181], [0.122, -0.133],
    [0.122, -0.057], [0.117, -0.035], [0.108, -0.029],
  ], finishes.soft);
  turned(cuff, "Inlet ferrule", [
    [0.11, -0.064], [0.123, -0.058], [0.125, -0.041], [0.125, -0.004],
    [0.119, 0.009], [0.084, 0.01], [0.079, 0.003], [0.079, -0.059],
  ], finishes.satin);

  // A single bevelled moulding seals all three hose ends. Tangents at each
  // socket are shared by the adjoining curves and strain-relief sleeves.
  const splitter = new Group();
  splitter.name = "Y connector";
  splitter.position.set(-1, -0.12, -0.11);
  root.add(splitter);
  part(splitter, "Moulded manifold", manifoldGeometry(), finishes.rubber);
  const lowerCollar = axialMount(splitter, new Vector3(0, -0.299, 0), up);
  turned(lowerCollar, "Lower strain relief", [
    [0.106, -0.081], [0.114, -0.06], [0.118, -0.005], [0.119, 0.073], [0.106, 0.089],
  ], finishes.soft);

  function headset(side: number) {
    const bend = (spread: number, y: number, depth: number) =>
      new Vector3(-1 + side * spread, y + side * 0.066 * spread, -0.11 + depth + side * 0.1 * spread);
    const socket = bend(0.796, 0.78, 0.001);
    const branch = new CatmullRomCurve3([
      bend(0.17, 0.025, 0), bend(0.28, 0.2, 0.012), bend(0.48, 0.418, 0.035),
      bend(0.677, 0.611, 0.019), socket,
    ]);
    part(root, "Binaural hose", new TubeGeometry(branch, 48, 0.087, 20, false), finishes.rubber);
    const direction = branch.getTangentAt(1);
    const receiver = axialMount(root, socket, direction);
    turned(receiver, "Binaural receiver", [
      [0.087, -0.145], [0.094, -0.125], [0.101, -0.065], [0.099, 0.025],
      [0.094, 0.05], [0.073, 0.056], [0.065, 0.051], [0.065, -0.028],
    ], finishes.soft);
    turned(receiver, "Socket binding", [
      [0.095, -0.027], [0.102, -0.022], [0.103, -0.003], [0.099, 0.004],
    ], finishes.satin);

    // Keep the arm and tip in one local frame so the travel starts exactly
    // at the detachable receiver, including when scrolling in reverse.
    const arm = new Group();
    arm.name = side < 0 ? "Left binaural" : "Right binaural";
    arm.position.copy(socket);
    root.add(arm);
    const steelCurve = new CatmullRomCurve3([
      socket.clone().addScaledVector(direction, -0.083),
      socket.clone().addScaledVector(direction, 0.10),
      bend(1.013, 1.25, 0.004), bend(1.052, 1.57, 0.06),
      bend(0.998, 1.777, 0.145), bend(0.845, 1.933, 0.243),
      bend(0.736, 1.967, 0.32),
    ].map(point => point.sub(socket)));
    part(arm, "Drawn stainless ear tube", new TubeGeometry(steelCurve, 80, 0.055, 18, false), finishes.silver);
    const tenon = axialMount(arm, new Vector3(), direction);
    turned(tenon, "Detachable arm tenon", [
      [0.037, -0.102], [0.055, -0.10], [0.061, -0.083], [0.061, -0.025],
      [0.07, -0.017], [0.073, -0.006], [0.073, 0.088], [0.066, 0.101], [0.054, 0.104],
    ], finishes.satin);
    turned(tenon, "Arm index ring", [[0.071, 0.058], [0.075, 0.06], [0.075, 0.073], [0.071, 0.075]], finishes.azure);

    const tip = axialMount(arm, steelCurve.getPointAt(1), steelCurve.getTangentAt(1));
    turned(tip, "Ear olive collet", [
      [0.055, -0.069], [0.064, -0.065], [0.068, -0.021], [0.077, -0.009],
      [0.08, 0.026], [0.069, 0.04],
    ], finishes.satin);
    turned(tip, "Soft ear olive", [
      [0.068, -0.003], [0.08, 0.003], [0.084, 0.018], [0.085, 0.068],
      [0.095, 0.096], [0.117, 0.14], [0.126, 0.18], [0.124, 0.215],
      [0.113, 0.244], [0.09, 0.263], [0.063, 0.27], [0.043, 0.267],
      [0.034, 0.257], [0.033, 0.231], [0.037, 0.199],
    ], finishes.soft);
    const earTip = new Object3D();
    earTip.name = "Acoustic outlet";
    earTip.position.y = 0.267;
    tip.add(earTip);
    return { arm, socket, direction, side, earTip };
  }

  const arms = [headset(-1), headset(1)] as const;
  const earTips = [arms[0].earTip, arms[1].earTip] as const;
  return {
    root, chest, tubeCurve, earTips,
    update(medicine: number, research: number, innovation: number) {
      chest.position.copy(chestRest).addScaledVector(stemAxis, medicine * 0.37);
      chest.rotation.copy(chestRotation);
      chest.rotation.y += medicine * 0.18 - research * 0.08;
      chest.rotation.z += medicine * 0.12;
      for (const { arm, socket, direction, side } of arms) {
        arm.position.copy(socket).addScaledVector(direction, innovation * 0.415);
        arm.position.z += innovation * 0.12;
        arm.rotation.z = -side * innovation * 0.112;
        arm.rotation.x = innovation * 0.085;
      }
    },
    dispose() {
      root.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      finishes.dispose();
    },
  };
}
