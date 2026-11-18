import * as THREE from "three";

type Point = THREE.Vector3;
type VertexPair = [Point, Point];
const point = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// Each vertex has two positions. The network grows from the very same
// centreline as the acoustic tube, without replacing the physical mesh.
class Diagram {
  private wires: VertexPair[] = [];
  private nodes: VertexPair[] = [];
  private weights: number[] = [];

  polyline(points: VertexPair[], weight = 1) {
    for (let i = 1; i < points.length; i++) {
      this.wires.push(points[i - 1], points[i]);
      this.weights.push(weight);
    }
  }

  node(vertex: VertexPair) {
    this.nodes.push(vertex);
  }

  build() {
    const group = new THREE.Group();
    const expansion = { value: 0 };
    const opacity = { value: 0 };
    const pixelHeight = { value: 600 };
    const geometry = (vertices: VertexPair[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(vertices.flatMap(([v]) => v.toArray()), 3));
      g.setAttribute("expanded", new THREE.Float32BufferAttribute(vertices.flatMap(([, v]) => v.toArray()), 3));
      return g;
    };
    const viewport = { value: new THREE.Vector2() };
    const density = { value: 1 };
    const uniforms = { expansion, opacity, pixelHeight, viewport, density };
    const transform = `
      attribute vec3 expanded;
      uniform float expansion;
      uniform float pixelHeight;
      void main() {
        vec4 eye = modelViewMatrix * vec4(mix(position, expanded, expansion), 1.);
        gl_Position = projectionMatrix * eye;
    `;
    // Native WebGL lines are fixed at one device pixel. Extrude a thin
    // screen-facing ribbon so the traces retain their weight on Retina screens.
    const segments = new THREE.InstancedBufferGeometry();
    segments.setAttribute("position", new THREE.Float32BufferAttribute([
      0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0,
    ], 3));
    segments.setIndex([0, 2, 1, 1, 2, 3]);
    const edgeAttribute = (name: string, endpoint: number, state: number) => {
      const data = this.weights.flatMap((_, i) => this.wires[i * 2 + endpoint][state].toArray());
      segments.setAttribute(name, new THREE.InstancedBufferAttribute(new Float32Array(data), 3));
    };
    edgeAttribute("a0", 0, 0);
    edgeAttribute("b0", 1, 0);
    edgeAttribute("a1", 0, 1);
    edgeAttribute("b1", 1, 1);
    segments.setAttribute("weight", new THREE.InstancedBufferAttribute(new Float32Array(this.weights), 1));
    segments.instanceCount = this.weights.length;
    const filaments = new THREE.Mesh(segments, new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
      forceSinglePass: true,
      vertexShader: `
        attribute vec3 a0, b0, a1, b1;
        attribute float weight;
        uniform float expansion, density;
        uniform vec2 viewport;
        varying float side, intensity;
        void main() {
          vec4 a = projectionMatrix * modelViewMatrix * vec4(mix(a0, a1, expansion), 1.);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(mix(b0, b1, expansion), 1.);
          vec2 delta = (b.xy / b.w - a.xy / a.w) * viewport;
          vec2 tangent = delta / max(.0001, length(delta));
          vec2 normal = vec2(-tangent.y, tangent.x);
          vec4 clip = mix(a, b, position.x);
          clip.xy += normal * position.y * (weight + .42) * density / viewport * clip.w;
          gl_Position = clip;
          side = position.y;
          intensity = weight;
        }`,
      fragmentShader: `uniform float opacity;
        varying float side, intensity;
        void main() {
          float edge = 1. - smoothstep(.5, 1., abs(side));
          vec3 color = mix(vec3(.23, .48, .83), vec3(.45, .71, 1.), intensity - .55);
          gl_FragColor = vec4(color, edge * opacity * mix(.48, .91, intensity - .40));
        }`,
    }));
    const beads = new THREE.Points(geometry(this.nodes), new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, toneMapped: false,
      vertexShader: transform + `
        gl_PointSize = clamp(.125 * pixelHeight * projectionMatrix[1][1] / -eye.z, 4., 32.);
      }`,
      fragmentShader: `uniform float opacity;
        void main() {
          float r = length(gl_PointCoord * 2. - 1.);
          float halo = exp(-4. * r) * (1. - smoothstep(.66, 1., r));
          float core = 1. - smoothstep(.17, .29, r);
          gl_FragColor = vec4(mix(vec3(.17,.48,1.), vec3(.80,.92,1.), core),
                              (halo * .68 + core * .88) * opacity);
        }`,
    }));
    // The shader expands geometry beyond its collapsed CPU-side bounds.
    filaments.frustumCulled = beads.frustumCulled = false;
    group.add(filaments, beads);
    return {
      group,
      update(amount: number, width: number, height: number, pixelRatio: number) {
        expansion.value = amount;
        opacity.value = THREE.MathUtils.smoothstep(amount, 0, .76);
        pixelHeight.value = height;
        viewport.value.set(width, height);
        density.value = pixelRatio;
      },
      dispose() {
        filaments.geometry.dispose();
        filaments.material.dispose();
        beads.geometry.dispose();
        beads.material.dispose();
      },
    };
  }
}

function researchDiagram(curve: THREE.Curve<Point>) {
  const diagram = new Diagram();
  const trace = (u: number, strand: number): VertexPair => {
    const centre = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u);
    const normal = point(-tangent.y, tangent.x, 0).normalize();
    const envelope = Math.sin(Math.PI * u) ** .82;
    const angle = 2 * Math.PI * (strand / 3 + .56 * u) + .28;
    const radius = .52 * envelope;
    const start = centre.clone().add(point(0, 0, .105));
    const end = start.clone().addScaledVector(normal, Math.cos(angle) * radius);
    end.z += envelope * .16 + Math.sin(angle) * radius * .55;
    return [start, end];
  };
  for (let strand = 0; strand < 3; strand++) {
    diagram.polyline(Array.from({ length: 65 }, (_, i) => trace(i / 64, strand)), strand === 1 ? 1.65 : 1.2);
    for (let i = 1; i < 10; i++) {
      const u = i / 10;
      diagram.node(trace(u, strand));
      if ((strand + i) % 2 === 0) {
        diagram.polyline([trace(u, strand), trace(u + .1, (strand + 1) % 3)], .82);
      }
    }
  }
  return diagram.build();
}

// A small layered response surface is registered to the right binaural tip.
// Three sparse slices and two signal paths keep the earpieces legible.
function innovationDiagram() {
  const diagram = new Diagram();
  function sample(x: number, depth: number, layer: number): VertexPair {
    const ridge = Math.exp(-((x - .60 + depth * .16) ** 2) * 18);
    const wave = (.26 + .08 * Math.cos(depth * 2.6)) * ridge
      + .055 * Math.sin(x * 8 - depth * 2);
    return [
      point(),
      point(.34 + x * 1.70 + depth * .32, -.98 + layer * .28 + depth * .27 + wave, .15 - depth * .47),
    ];
  }
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i <= 4; i++) {
      diagram.polyline(Array.from({ length: 23 }, (_, j) => sample(j / 22, i / 4, layer)), i === 0 ? 1.45 : .8);
    }
    for (let i = 0; i <= 5; i++) {
      diagram.polyline(Array.from({ length: 7 }, (_, j) => sample(i / 5, j / 6, layer)), .68);
    }
    for (const x of [0, .6, 1]) diagram.node(sample(x, 0, layer));
  }
  const inputs = [sample(0, 0, 0)[1], sample(0, 1, 2)[1]];
  return { ...diagram.build(), inputs };
}

export function createNetworks(
  root: THREE.Group,
  curve: THREE.Curve<Point>,
  earTips: readonly [THREE.Object3D, THREE.Object3D],
) {
  const research = researchDiagram(curve);
  const innovation = innovationDiagram();
  const linkGeometry = new THREE.BufferGeometry();
  const linkPositions = new THREE.Float32BufferAttribute(new Float32Array(2 * 3 * 3), 3);
  linkGeometry.setAttribute("position", linkPositions);
  linkGeometry.setIndex([0, 1, 1, 2, 3, 4, 4, 5]);
  const linkMaterial = new THREE.LineBasicMaterial({
    color: 0x649de9, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
  });
  const links = new THREE.LineSegments(linkGeometry, linkMaterial);
  links.frustumCulled = false;
  root.add(research.group, innovation.group, links);
  const earPositions = [point(), point()];
  const end = point();
  return {
    update(researchAmount: number, innovationAmount: number, width: number, height: number, pixelRatio: number) {
      research.update(researchAmount, width, height, pixelRatio);
      innovation.update(innovationAmount, width, height, pixelRatio);
      earTips.forEach((tip, index) => {
        root.worldToLocal(tip.getWorldPosition(earPositions[index]));
      });
      const origin = earPositions[1];
      innovation.group.position.copy(origin);
      for (let i = 0; i < 2; i++) {
        const ear = earPositions[i];
        end.copy(innovation.inputs[i]).multiplyScalar(innovationAmount).add(origin);
        linkPositions.setXYZ(i * 3, ear.x, ear.y, ear.z);
        linkPositions.setXYZ(i * 3 + 1, (ear.x + end.x) / 2, ear.y + .15 * innovationAmount, ear.z + .12 * innovationAmount);
        linkPositions.setXYZ(i * 3 + 2, end.x, end.y, end.z);
      }
      linkPositions.needsUpdate = true;
      linkMaterial.opacity = .65 * THREE.MathUtils.smoothstep(innovationAmount, 0, .8);
    },
    dispose() {
      research.dispose();
      innovation.dispose();
      linkGeometry.dispose();
      linkMaterial.dispose();
    },
  };
}
