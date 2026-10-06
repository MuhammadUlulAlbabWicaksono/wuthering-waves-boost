"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { sceneState } from "@/lib/scene-state";
import { SCENE_COLORS } from "@/lib/scene-config";

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aScatter;
  attribute vec3 aLattice;
  attribute float aSeed;
  varying float vSeed;
  varying float vMorph;

  void main() {
    // bola berputar pelan
    float a = uTime * 0.12;
    float cs = cos(a);
    float sn = sin(a);
    vec3 sphere = vec3(position.x * cs - position.z * sn, position.y, position.x * sn + position.z * cs);

    float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
    vec3 p = mix(mix(aScatter, aLattice, m1), sphere, m2);

    // melayang liar saat kacau, nyaris diam saat tertata
    float drift = mix(0.35, 0.03, m1);
    p += vec3(
      sin(uTime * 0.6 + aSeed * 40.0),
      cos(uTime * 0.5 + aSeed * 25.0),
      sin(uTime * 0.4 + aSeed * 60.0)
    ) * drift;

    // kisi bergelombang pelan, bola "bernapas"
    p.y += sin(aLattice.x * 0.6 + uTime * 0.8) * 0.12 * m1 * (1.0 - m2);
    p *= 1.0 + 0.025 * sin(uTime * 1.1) * m2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min((0.6 + aSeed) * uSize * uPixelRatio / -mv.z, 24.0 * uPixelRatio);

    vSeed = aSeed;
    vMorph = uMorph;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uRed;
  uniform vec3 uEmerald;
  uniform vec3 uCyan;
  uniform float uIntro;
  varying float vSeed;
  varying float vMorph;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 2.0); // titik lembut, bukan kotak

    vec3 col = mix(uRed, uEmerald, smoothstep(0.0, 1.0, vMorph));
    col = mix(col, mix(uEmerald, uCyan, vSeed), smoothstep(1.0, 2.0, vMorph));

    // di hero dibuat redup agar teks tetap terbaca
    float vis = mix(0.5, 0.75, clamp(vMorph / 2.0, 0.0, 1.0));
    gl_FragColor = vec4(col, glow * vis * uIntro);
    #include <colorspace_fragment>
  }
`;

function buildGeometry(count: number) {
  const sphere = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const lattice = new Float32Array(count * 3);
  const seed = new Float32Array(count);

  const golden = Math.PI * (3 - Math.sqrt(5));
  const side = Math.ceil(Math.sqrt(count));
  const step = 20 / side; // lebar kisi selalu ±20 unit berapa pun jumlah partikel
  const R = 2.1;

  for (let i = 0; i < count; i++) {
    // 1) bola: sebaran Fibonacci
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    sphere.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);

    // 2) kisi: lantai bergelombang yang menjauh dari kamera
    const col = (i % side) - side / 2;
    const row = Math.floor(i / side);
    lattice.set(
      [col * step, -1.7 + Math.sin(col * 0.25) * Math.cos(row * 0.25) * 0.35, 3 - row * step * 0.75],
      i * 3,
    );

    // 3) acak: kotak lebar
    scatter.set(
      [(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 9 - 1.5],
      i * 3,
    );

    seed[i] = Math.random();
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(sphere, 3));
  g.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  g.setAttribute("aLattice", new THREE.BufferAttribute(lattice, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  return g;
}

export function ParticleField({ count }: { count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => buildGeometry(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uIntro: { value: 0 },
      uSize: { value: 22 },
      uPixelRatio: { value: 1 },
      uRed: { value: new THREE.Color(SCENE_COLORS.red) },
      uEmerald: { value: new THREE.Color(SCENE_COLORS.emerald) },
      uCyan: { value: new THREE.Color(SCENE_COLORS.cyan) },
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const m = matRef.current;
    if (!m) return;
    const u = m.uniforms;

    u.uTime.value += delta;
    u.uPixelRatio.value = state.viewport.dpr;
    // fade-in awal (±1.5 dtk) lalu kejar nilai morph dari scroll dengan halus
    u.uIntro.value = THREE.MathUtils.damp(u.uIntro.value, 1, 2, delta);
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, sceneState.morph, 4, delta);

    // parallax kamera mengikuti pointer
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, sceneState.px * 0.6, 3, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 0.4 + sceneState.py * 0.4, 3, delta);
    cam.lookAt(0, 0, 0);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
