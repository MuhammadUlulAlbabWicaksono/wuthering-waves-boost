# Panduan Implementasi: Scroll 3D Dinamis untuk Wuthering Boost (Next.js)

> Panduan ini menerapkan pola website 3D "Pyko" (dari video referensi) ke website **Wuthering Boost** yang sudah Anda punya.
> Dibuat berdasarkan 3 screenshot (Hero, Efisiensi, CTA). Saya **belum melihat kode Anda**, jadi nama file, komponen, dan class di bawah adalah usulan. Sesuaikan dengan struktur proyek Anda.

---

## 0. Ringkasan

**Hasil akhir:** satu kanvas 3D `fixed` di belakang seluruh halaman Home. Ribuan partikel di dalamnya **berubah bentuk mengikuti scroll**:

| Posisi scroll | Bentuk partikel | Warna | Makna cerita |
|---|---|---|---|
| Hero | Tersebar acak, melayang kacau | Merah → | "Tertinggal meta" = inefisiensi |
| Efisiensi | Tertata rapi menjadi kisi bergelombang | Emerald | "Efisiensi adalah keunggulan" |
| CTA | Menyatu jadi bola bercahaya yang berputar | Emerald → Cyan | "Waktu Anda terlalu berharga" |

Konten Anda (teks, kartu, tombol, navbar) **tetap DOM biasa**. Tidak ada yang dipindahkan ke canvas, jadi SEO, aksesibilitas, dan fungsi login/search/lacak pesanan tidak terganggu.

**Asumsi yang saya pakai** (cek `package.json` Anda):
- Next.js **App Router** + TypeScript, alias import `@/`
- **React 19** (default untuk Next 15 ke atas)
- **Tailwind CSS**. Warna di screenshot cocok dengan palet default Tailwind v4 (lihat bagian 4), jadi kemungkinan besar Anda memakai v4.

---

## 1. Keputusan Desain dan Alasannya

**1. Tema lumut Pyko tidak dipindahkan.**
Lumut dan tebing cocok untuk produk edukasi, bukan untuk jasa joki Wuthering Waves. Yang saya ambil dari Pyko adalah *polanya*: latar 3D yang bereaksi pada scroll, kartu kaca, dan teks yang muncul dengan blur. Visual 3D-nya saya ganti dengan partikel prosedural yang nyambung dengan cerita situs Anda (kacau → tertata).

**2. Tanpa aset 3D sama sekali.**
Semua partikel dibuat lewat kode (shader). Tidak perlu model, tekstur, atau gambar. Ini juga menghindari masalah hak cipta. Jangan memakai art, logo, atau model resmi Wuthering Waves tanpa izin pemegang haknya.

**3. Mode A: canvas di belakang, konten tetap mengalir normal.**
Ini cara paling aman untuk situs yang sudah berjalan. Alternatif "Mode B" (stage di-*pin* ala video, section bergantian) dibahas di bagian 11 dan sebaiknya jadi tahap kedua.

**4. Satu momen yang memorable.**
Morph partikel adalah satu-satunya animasi besar. Sisanya sengaja tenang: hanya judul section yang muncul dengan blur, dan angka di kartu menghitung naik sekali. Tidak ada animasi masuk di setiap elemen dan tidak ada efek hover berlebihan.

**5. Tanpa postprocessing (Bloom).**
Cahaya partikel dibuat di shader (titik lembut + additive blending). Hasilnya mirip bloom, lebih ringan, dan menghindari satu bug kompatibilitas (bagian 3).

---

## 2. Pemetaan Section Anda

| Section di situs Anda | Beri `id` | Peran di scene | Nilai `morph` |
|---|---|---|---|
| "Tertinggal Meta Karena Tidak Ada Waktu?" + kartu *Peringatan Akun* | `hero` | Partikel kacau (merah) | 0 |
| "Efisiensi adalah keunggulan kompetitif Anda." + 3 kartu (100%, Lv. 30, 30/30) | `efisiensi` | Kisi tertata (emerald) | 1 |
| "Waktu Anda Terlalu Berharga." + tombol *Mulai Transformasi Akun* | `cta` | Bola bercahaya (emerald → cyan) | 2 |

> Catatan kecil dari screenshot: footer bertuliskan **"Apiao Boost"**, sedangkan navbar **"Wuthering Boost"**. Kalau itu bukan disengaja, samakan.

---

## 3. Persiapan: Versi dan Instalasi

### 3.1 Cek versi dulu

```bash
npm ls next react react-dom
```

| Versi React Anda | Pakai |
|---|---|
| **19.x** (Next 15/16) | `@react-three/fiber` **v9** (perintah di bawah) |
| 18.x (Next 14) | `@react-three/fiber@8` dan `@react-three/drei@9`. Kode di panduan ini tetap berlaku |

R3F v8 tidak kompatibel dengan React 19, jadi proyek Next 15 ke atas wajib memakai R3F v9.
Sumber: https://github.com/pmndrs/react-three-fiber

### 3.2 Instal

```bash
npm i three @react-three/fiber gsap @gsap/react lenis
npm i -D @types/three
```

| Paket | Fungsi |
|---|---|
| `three`, `@react-three/fiber` | Mesin 3D dan jembatan ke React |
| `gsap`, `@gsap/react` | Animasi dan ScrollTrigger (`useGSAP` mengurus cleanup otomatis) |
| `lenis` | Smooth scroll |
| `@types/three` | Tipe TypeScript (samakan versinya dengan `three`) |

### 3.3 Peringatan: jangan tambah Bloom sebelum cek versi

Jika nanti ingin menambah `@react-three/postprocessing`: ada bug yang membuat seluruh canvas crash di React 19 dengan `reactStrictMode: true` (default Next 16). Sudah diperbaiki di paket `postprocessing` **v6.39.1**, jadi pastikan versi yang terpasang sama atau lebih baru:

```bash
npm ls postprocessing
```

Sumber: https://github.com/pmndrs/postprocessing/issues/742

---

## 4. Token Warna dari Website Anda

Saya ambil sampel piksel dari screenshot. Hasilnya sama persis dengan palet default Tailwind v4, jadi **tidak perlu token baru**. Cukup pakai class yang sudah ada.

| Elemen di situs | Hex hasil sampel | Padanan Tailwind v4 |
|---|---|---|
| Latar halaman | `#020618` | `slate-950` |
| Navbar | `#0D2745` | custom (sudah ada di kode Anda) |
| Latar kartu | `#0A0E1F` – `#0F1324` | ≈ `slate-900` transparan |
| Aksen hijau ("Ada", ikon Eksplorasi) | `#00D594` | `emerald-400` |
| Aksen cyan ("Waktu?", ikon Data Bank) | `#00D3F3` | `cyan-400` |
| Peringatan (bar, "4500+") | `#FB2C36` / `#FF6467` | `red-500` / `red-400` |
| Ikon Tower of Adversity | `#BC76FF` | `purple-400` |

Untuk shader, simpan warna yang sama di satu file:

```ts
// src/lib/scene-config.ts
export const SCENE_COLORS = {
  red: "#FB2C36",     // red-500: hero (inefisiensi)
  emerald: "#00D492", // emerald-400: efisiensi
  cyan: "#00D3F3",    // cyan-400: puncak (bola)
} as const;

export const PARTICLES = { desktop: 22000, mobile: 9000 } as const;
```

---

## 5. Struktur File Baru

```
src/
├─ lib/
│  ├─ scene-state.ts          # nilai bersama (morph, pointer), bukan React state
│  └─ scene-config.ts         # warna & jumlah partikel
├─ components/
│  ├─ motion/
│  │  ├─ SmoothScroll.tsx     # Lenis + sinkron ke GSAP
│  │  ├─ ScrollDirector.tsx   # scroll → sceneState.morph
│  │  ├─ BlurText.tsx         # judul muncul blur → tajam
│  │  └─ CountUp.tsx          # angka kartu menghitung naik
│  └─ three/
│     ├─ ParticleField.tsx    # partikel + shader
│     ├─ SceneCanvas.tsx      # <Canvas> fixed
│     └─ SceneMount.tsx       # gerbang: reduced-motion, WebGL, idle, dynamic import
└─ app/
   ├─ globals.css             # tambahan: .glass, Lenis, fallback
   └─ page.tsx                # rakit semuanya
```

---

## 6. Kode

### 6.1 State bersama

Nilai yang berubah tiap frame **tidak boleh** disimpan di `useState` (akan memicu render ulang React 60 kali per detik). Pakai objek biasa:

```ts
// src/lib/scene-state.ts
export const sceneState = {
  morph: 0, // 0 = kacau, 1 = kisi, 2 = bola (diisi oleh scroll)
  px: 0,    // posisi pointer -1..1
  py: 0,
};
```

### 6.2 Smooth scroll

```tsx
// src/components/motion/SmoothScroll.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    // satu "jam" untuk Lenis dan GSAP supaya tidak saling tertinggal
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

### 6.3 Partikel dan shader

Satu `Points` memegang tiga "denah" posisi untuk setiap partikel (acak, kisi, bola). Shader memilih campuran ketiganya dari nilai `uMorph`.

```tsx
// src/components/three/ParticleField.tsx
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
```

> `frustumCulled={false}` wajib: posisi partikel digeser di shader, jadi bounding box bawaan three.js tidak akurat dan partikel bisa hilang tiba-tiba.

### 6.4 Canvas

```tsx
// src/components/three/SceneCanvas.tsx
"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "./ParticleField";
import { sceneState } from "@/lib/scene-state";

export default function SceneCanvas({ count }: { count: number }) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      sceneState.px = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 7], fov: 50, near: 0.1, far: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <ParticleField count={count} />
      </Canvas>
    </div>
  );
}
```

`default export` dipakai karena file ini dimuat lewat `next/dynamic`.

### 6.5 Gerbang pemasangan

Canvas hanya dipasang jika perangkat mendukung dan pengguna tidak meminta gerakan dikurangi, dan itu pun **setelah browser idle** supaya LCP dan interaksi awal tidak terganggu.

```tsx
// src/components/three/SceneMount.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ScrollDirector } from "@/components/motion/ScrollDirector";
import { PARTICLES } from "@/lib/scene-config";

// `ssr: false` hanya boleh dipakai di Client Component, makanya file ini "use client"
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneMount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !supportsWebGL()) return; // situs tetap normal, hanya tanpa 3D

    const weak = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const start = () => setCount(weak ? PARTICLES.mobile : PARTICLES.desktop);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 400); // Safari belum punya requestIdleCallback
    return () => window.clearTimeout(t);
  }, []);

  if (!count) return null;

  return (
    <>
      <SceneCanvas count={count} />
      <ScrollDirector />
    </>
  );
}
```

### 6.6 Scroll → morph

```tsx
// src/components/motion/ScrollDirector.tsx
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneState } from "@/lib/scene-state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollDirector() {
  useGSAP(() => {
    // hero → efisiensi : morph 0 → 1
    gsap.fromTo(
      sceneState,
      { morph: 0 },
      {
        morph: 1,
        ease: "none",
        scrollTrigger: { trigger: "#efisiensi", start: "top 90%", end: "top 25%", scrub: true },
      },
    );

    // efisiensi → cta : morph 1 → 2
    gsap.fromTo(
      sceneState,
      { morph: 1 },
      {
        morph: 2,
        ease: "none",
        immediateRender: false, // jangan menimpa tween pertama saat halaman dimuat
        scrollTrigger: { trigger: "#cta", start: "top 90%", end: "top 35%", scrub: true },
      },
    );

    // posisi section bisa bergeser setelah font selesai dimuat
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      sceneState.morph = 0;
    };
  });

  return null;
}
```

`useGSAP` otomatis membersihkan semua tween dan ScrollTrigger saat komponen di-unmount (pindah halaman, atau double-run React Strict Mode di dev).

### 6.7 Judul muncul blur → tajam

Dipakai **hanya untuk judul section di bawah hero** (bagian 7). Hero H1 sengaja tidak dianimasikan: teksnya harus langsung terlihat dari HTML server supaya LCP tetap cepat.

```tsx
// src/components/motion/BlurText.tsx
"use client";

import { Fragment, useRef, type ElementType } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Part = { text: string; className?: string };
type Props = { parts: Part[]; as?: ElementType; className?: string };

export function BlurText({ parts, as: Tag = "h2", className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const label = parts.map((p) => p.text).join(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        el.querySelectorAll("[data-word]"),
        { opacity: 0, filter: "blur(12px)", y: 12 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} aria-label={label}>
      {parts.flatMap((part, pi) =>
        part.text.split(" ").map((word, wi) => (
          <Fragment key={`${pi}-${wi}`}>
            <span aria-hidden="true" data-word className={`inline-block ${part.className ?? ""}`}>
              {word}
            </span>{" "}
          </Fragment>
        )),
      )}
    </Tag>
  );
}
```

### 6.8 Angka menghitung naik

```tsx
// src/components/motion/CountUp.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = { to: number; prefix?: string; suffix?: string; className?: string };

export function CountUp({ to, prefix = "", suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const state = { v: 0 };
      el.textContent = `${prefix}0${suffix}`; // kartu ada di bawah fold, jadi tidak terlihat berkedip
      gsap.to(state, {
        v: to,
        duration: 1.4,
        ease: "power2.out",
        snap: { v: 1 },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${state.v}${suffix}`;
        },
      });
    },
    { scope: ref },
  );

  // HTML server berisi nilai akhir, jadi tanpa JS pun angkanya benar
  return (
    <span ref={ref} className={className}>
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
```

### 6.9 CSS tambahan

```css
/* src/app/globals.css (tambahkan di bagian bawah) */

/* Lenis */
html.lenis,
html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }

/* Kartu kaca: dipakai di kartu hero dan 3 kartu Efisiensi */
.glass {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.07), rgb(255 255 255 / 0.03));
  border: 1px solid rgb(255 255 255 / 0.1);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12), 0 30px 80px -30px rgb(0 0 0 / 0.6);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
}
@media (max-width: 767px) {
  .glass { -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
}
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: #0a0e1f; }
}

/* Cadangan: glow statis jika 3D tidak aktif (reduced-motion / tanpa WebGL / sebelum idle) */
.scene-fallback {
  background:
    radial-gradient(60% 50% at 72% 38%, rgb(0 212 146 / 0.1), transparent 70%),
    radial-gradient(40% 40% at 18% 82%, rgb(0 211 243 / 0.07), transparent 70%);
}

/* Fokus keyboard yang jelas */
:focus-visible { outline: 2px solid #00d3f3; outline-offset: 3px; }
```

---

## 7. Integrasi ke Halaman yang Sudah Ada

### 7.1 Rakit di `page.tsx`

Letakkan scene **hanya di halaman Home**, bukan di `layout.tsx`, supaya halaman lain (login, lacak pesanan, checkout) tidak ikut menanggung beban 3D dan smooth scroll.

```tsx
// src/app/page.tsx  (tetap Server Component)
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SceneMount } from "@/components/three/SceneMount";
// komponen section Anda yang sudah ada:
import Hero from "@/components/home/Hero";
import Efisiensi from "@/components/home/Efisiensi";
import FinalCta from "@/components/home/FinalCta";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <SmoothScroll>
      <div aria-hidden="true" className="scene-fallback pointer-events-none fixed inset-0 z-0" />
      <SceneMount />

      <main className="relative z-10">
        <Hero />        {/* <section id="hero"> */}
        <Efisiensi />   {/* <section id="efisiensi"> */}
        <FinalCta />    {/* <section id="cta"> */}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </SmoothScroll>
  );
}
```

### 7.2 Jebakan paling sering: background solid menutupi canvas

Canvas berada **di belakang** konten. Jika section Anda punya `bg-slate-950`, canvas tidak akan terlihat sama sekali.

1. Hapus `bg-slate-950` (atau yang sejenis) dari **semua section Home**.
2. Pindahkan warna dasar ke `body`: `body { background: #020618; }` atau `className="bg-slate-950"` di `<body>` pada `layout.tsx`.
3. Pastikan navbar tetap di atas semuanya: `z-50` (konten `z-10`, canvas `z-0`).

### 7.3 Hero

- Tambahkan `id="hero"` pada `<section>` dan hapus background solidnya.
- Ubah kartu **Peringatan Akun** menjadi kaca: tambahkan class `glass`, buang background solid. Kartu itu sekarang berada di atas partikel dan terlihat menembus.
- **Jangan** bungkus H1 dengan `BlurText` (alasan di 6.7).
- Jika teks paragraf terasa kurang terbaca di atas partikel, tambahkan scrim di belakangnya:

```tsx
<div className="absolute -inset-x-8 -inset-y-6 -z-10 bg-[radial-gradient(closest-side,rgb(2_6_24/0.65),transparent)]" />
```

### 7.4 Efisiensi

```tsx
import { BlurText } from "@/components/motion/BlurText";
import { CountUp } from "@/components/motion/CountUp";

<section id="efisiensi" className="relative py-32">
  <BlurText
    className="mx-auto max-w-4xl text-center font-serif text-5xl font-bold text-white"
    parts={[{ text: "Efisiensi adalah keunggulan kompetitif Anda." }]}
  />
  {/* paragraf pengantar tetap seperti sekarang */}

  <div className="mx-auto mt-24 grid max-w-6xl gap-6 md:grid-cols-3">
    <article className="glass rounded-3xl p-8">
      {/* ikon tetap */}
      <CountUp to={100} suffix="%" className="text-4xl font-extrabold text-white" />
      <h3>Eksplorasi Wilayah</h3>
      {/* deskripsi tetap */}
    </article>

    <article className="glass rounded-3xl p-8">
      <CountUp to={30} prefix="Lv. " className="text-4xl font-extrabold text-white" />
      <h3>Max Data Bank</h3>
    </article>

    <article className="glass rounded-3xl p-8">
      <CountUp to={30} suffix="/30" className="text-4xl font-extrabold text-white" />
      <h3>Tower of Adversity</h3>
    </article>
  </div>
</section>
```

Kartu **tidak** diberi animasi masuk atau efek hover khusus. Cukup perubahan warna border saat hover jika memang perlu.

### 7.5 CTA

```tsx
<section id="cta" className="relative grid min-h-screen place-items-center text-center">
  <div className="relative">
    {/* scrim agar teks terbaca di atas bola */}
    <div className="absolute -inset-x-16 -inset-y-10 -z-10 bg-[radial-gradient(closest-side,rgb(2_6_24/0.7),transparent)]" />
    <BlurText
      as="h2"
      className="font-serif text-6xl font-bold text-white"
      parts={[{ text: "Waktu Anda Terlalu Berharga." }]}
    />
    {/* paragraf dan tombol "Mulai Transformasi Akun" tetap */}
  </div>
</section>
```

### 7.6 Navbar (opsional)

Fungsi navbar (search, Lacak Pesanan, menu pengguna) **jangan diganti**. Jika ingin nuansa Pyko, cukup buat latarnya semi-transparan dengan blur:

```tsx
className="... bg-[#0D2745]/70 backdrop-blur-xl border-b border-white/10"
```

---

## 8. Urutan Kerja (dengan titik verifikasi)

| Fase | Kerjakan | Anda seharusnya melihat |
|---|---|---|
| 1 | Instal paket (bagian 3), buat `lib/*` dan struktur folder | `npm run dev` tetap berjalan tanpa error |
| 2 | Beri `id` pada 3 section, hapus background solid, atur `z-10` / `z-50` (7.2) | Tampilan situs **sama persis** seperti sekarang |
| 3 | Pasang `ParticleField`, `SceneCanvas`, `SceneMount`, panggil di `page.tsx` | Partikel merah melayang di belakang hero, fade-in ±1,5 detik |
| 4 | Tambah `ScrollDirector` dan `SmoothScroll` | Saat scroll, partikel merah berubah tertata jadi kisi hijau, lalu menyatu jadi bola cyan |
| 5 | Tambah `BlurText`, `CountUp`, class `glass` (7.3 sampai 7.5) | Judul muncul blur, angka menghitung naik, kartu tampak kaca |
| 6 | Uji performa, aksesibilitas, mobile (bagian 9, 10, 12) | Semua centang di checklist |

Commit setelah tiap fase. Kalau ada yang rusak, mudah ditelusuri.

---

## 9. Performa

| Hal | Aturan |
|---|---|
| Jumlah partikel | 22.000 desktop, 9.000 mobile/perangkat lemah (`scene-config.ts`). Turunkan jika FPS tidak stabil |
| Resolusi | `dpr={[1, 1.75]}`. Di perangkat lemah boleh `[1, 1.25]` |
| Pemuatan | Canvas dimuat setelah idle lewat `next/dynamic`, jadi tidak ikut di bundle awal dan tidak menahan LCP |
| LCP | Elemen LCP adalah H1 hero. Jangan sembunyikan lewat CSS/JS |
| `backdrop-filter` | Mahal di atas canvas yang bergerak. Pakai hanya di kartu hero dan 3 kartu Efisiensi, dan cek di HP |
| Tab tidak aktif | R3F otomatis berhenti saat tab tersembunyi |
| Ukuran bundle | `three` + R3F menambah ±150 sampai 200 KB (gzip) pada chunk yang dimuat terpisah |

Ukur dengan Chrome DevTools: tab *Performance* (target 60 fps di laptop menengah) dan Lighthouse (target LCP < 2,5 detik).

---

## 10. Aksesibilitas

- `prefers-reduced-motion: reduce`: smooth scroll, canvas 3D, blur, dan hitung naik **semuanya mati**. Situs tampil statis dengan glow cadangan.
- Wrapper canvas `aria-hidden="true"` dan `pointer-events-none`, jadi tidak mengganggu pembaca layar atau klik.
- Judul tetap teks DOM. `BlurText` memakai `aria-label` berisi kalimat utuh, sedangkan pecahan kata `aria-hidden`.
- Kontras: teks paragraf abu-biru di atas partikel bisa turun kontrasnya. Scrim (7.3, 7.5) dan opacity partikel redup (`vis` di shader) ada untuk itu. Cek ulang dengan DevTools *Accessibility → Contrast*.
- Fokus keyboard terlihat jelas (`:focus-visible` di 6.9).

---

## 11. Upgrade Nanti: Mode B (stage di-pin ala video)

Jika setelah Mode A berjalan Anda ingin pengalaman sinematik penuh seperti video Pyko:

- Bungkus 3 section dalam satu container tinggi (±500vh) dengan `Stage` `position: sticky; top: 0; height: 100vh`.
- Section tidak lagi mengalir, melainkan ditumpuk dan bergantian lewat satu master timeline.
- Pola, durasi, dan urutan transisinya sudah ada di **`design.md` bagian 5.3 dan bagian 7**. Skrip `buildMasterTimeline` di sana bisa dipakai sebagai kerangka.

Mode B mengubah layout dan SEO, jadi lakukan sebagai tahap terpisah dan uji ulang halaman yang bergantung pada section tersebut.

---

## 12. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `window is not defined` | Kode 3D ikut dirender di server | Pastikan 3D hanya masuk lewat `dynamic(..., { ssr: false })` di dalam Client Component (`SceneMount`) |
| `ssr: false is not allowed with next/dynamic in Server Components` | `dynamic` dipanggil di Server Component | Pastikan `SceneMount.tsx` diawali `"use client"` |
| Peer dependency error saat instal R3F | R3F v8 vs React 19 (atau sebaliknya) | Cek bagian 3.1, pilih versi R3F yang sesuai |
| Konten benar-benar tidak terlihat atau canvas tidak tampak | Section masih punya background solid, atau urutan z-index salah | Bagian 7.2 |
| Canvas crash saat memakai Bloom di dev | Bug `postprocessing` dengan React 19 + Strict Mode | Perbarui `postprocessing` ke ≥ 6.39.1 (bagian 3.3) |
| Partikel hilang saat kamera bergerak | Frustum culling | `frustumCulled={false}` pada `<points>` |
| Warna partikel pucat/gelap dibanding hex Anda | Konversi color space shader | Pastikan `#include <colorspace_fragment>` ada di akhir fragment shader |
| Morph terlambat/meleset dari section | Tinggi section berubah setelah font/gambar dimuat | `ScrollTrigger.refresh()` sudah dipanggil di `ScrollDirector`. Panggil lagi setelah konten dinamis (mis. data dari API) selesai dimuat |
| Dropdown/modal tidak bisa di-scroll di dalamnya | Lenis menangkap event wheel | Tambahkan atribut `data-lenis-prevent` pada elemen yang scroll sendiri |
| Animasi jalan dua kali di dev | React Strict Mode | Normal. `useGSAP` membersihkan sendiri. Tidak terjadi di production |
| Jank di HP | Terlalu banyak partikel, atau `backdrop-filter` | Kurangi `PARTICLES.mobile`, kecilkan blur, matikan `glass` blur di layar kecil |

---

## 13. Checklist QA

- [ ] Hero: partikel merah redup melayang, fade-in halus, teks tetap tajam sejak muncul pertama
- [ ] Scroll ke Efisiensi: partikel berubah hijau dan tertata menjadi kisi
- [ ] Scroll ke CTA: partikel menyatu jadi bola cyan yang berputar pelan
- [ ] Scroll balik ke atas: morph berbalik mulus, tanpa loncatan
- [ ] Muat ulang saat posisi scroll di tengah: scene langsung di state yang benar
- [ ] Judul section muncul blur → tajam sekali, angka kartu menghitung naik sekali
- [ ] Navbar, search, Lacak Pesanan, menu pengguna berfungsi seperti sebelumnya
- [ ] Halaman lain (login, pesanan) tidak terpengaruh dan tidak memuat bundle 3D
- [ ] `prefers-reduced-motion`: tidak ada canvas, smooth scroll, atau animasi
- [ ] Browser tanpa WebGL: situs tampil normal dengan glow cadangan
- [ ] Lighthouse: LCP < 2,5 detik, tidak ada layout shift
- [ ] Mobile 390px: tidak ada scroll horizontal, FPS wajar, teks terbaca
- [ ] Footer: nama brand konsisten ("Wuthering Boost" vs "Apiao Boost")

---

## 14. Prompt untuk AI Coding Agent (Claude Code, Cursor, dll.)

```text
Baca panduan-implementasi.md dan design.md di root proyek ini.

Tugas: terapkan "Mode A" dari panduan-implementasi.md pada halaman Home
(src/app/page.tsx) proyek Next.js ini. Sebelum mengubah apa pun:
1) baca package.json dan laporkan versi next, react, tailwindcss, serta apakah
   alias "@/" dipakai;
2) cari komponen Hero, section Efisiensi, dan CTA/Footer yang sudah ada dan
   laporkan path-nya.

Kerjakan per fase sesuai bagian 8. Setelah tiap fase, jalankan `npm run build`
dan berhenti untuk saya review sebelum lanjut. Aturan:
- Jangan ubah fungsi navbar, search, login, atau halaman selain Home.
- Jangan pernah menyimpan nilai per-frame di React state.
- Jangan tambah paket di luar daftar bagian 3.2 tanpa bertanya.
- Pertahankan semua teks Indonesia yang sudah ada apa adanya.
```
