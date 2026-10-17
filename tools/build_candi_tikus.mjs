/**
 * Membuat model 3D sederhana (low-poly) Candi Tikus → public/assets/models/candi-tikus.glb
 *
 * Jalankan: node tools/build_candi_tikus.mjs
 *
 * Proporsi mengikuti data situs (dalam meter, lalu diperkecil 1:30 agar pas untuk AR di meja):
 * - kolam petirtaan ±28,25 × 29,5 m, dalam ±5,2 m, dinding berundak (2 teras),
 * - tangga masuk di sisi utara, diapit 2 kolam kecil berpancuran (jaladwara),
 * - bangunan induk di bagian selatan: kaki berundak, menara tengah dikelilingi 8 menara kecil
 *   (lambang Gunung Mahameru), dikitari parit berair.
 * Sumbu: x = timur, y = atas, +z = utara (sisi tangga menghadap kamera bawaan model-viewer).
 * Tanpa tekstur: warna bata divariasikan per balok dengan beberapa material, supaya juga
 * tampil benar di AR iOS (USDZ yang dibuat otomatis oleh model-viewer).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/assets/models/candi-tikus.glb');
const SCALE = 1 / 30;

// GLTFExporter memakai FileReader (API browser) untuk keluaran biner.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onload?.({ target: this });
      this.onloadend?.({ target: this });
    });
  }
};

// Acak dengan seed agar hasil selalu sama setiap kali dibuat ulang.
let seed = 1914;
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const materials = {
  brick1: { color: '#8e3f27', roughness: 0.92 },
  brick2: { color: '#9d4c30', roughness: 0.92 },
  brick3: { color: '#7c3621', roughness: 0.92 },
  brick4: { color: '#a95c3b', roughness: 0.92 },
  cornice: { color: '#66301d', roughness: 0.95 },
  floor: { color: '#73513a', roughness: 1 },
  stone: { color: '#7d7a72', roughness: 0.85 },
  grass: { color: '#5d7d37', roughness: 1 },
  soil: { color: '#5a3d2a', roughness: 1 },
  leaf: { color: '#3f6b2f', roughness: 0.9 },
  trunk: { color: '#5b4030', roughness: 1 },
  water: { color: '#3b7c86', roughness: 0.15, opacity: 0.82 }
};
const BRICKS = ['brick1', 'brick2', 'brick3', 'brick4'];
const brick = () => BRICKS[Math.floor(random() * BRICKS.length)];

const parts = Object.fromEntries(Object.keys(materials).map((key) => [key, []]));
// Urutan semua geometri yang ditambahkan, dipakai moveLast() untuk menggeser kelompok balok.
const history = [];

/** Menambah geometri (flat shading, tanpa UV) ke kelompok material. */
function add(material, geometry, x, y, z, rotationY = 0) {
  geometry.rotateY(rotationY);
  geometry.translate(x, y, z);
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  flat.deleteAttribute('uv');
  flat.computeVertexNormals();
  parts[material].push(flat);
  history.push(flat);
}

/** Balok dari batas bawah-atas: x0..x1, y0..y1, z0..z1. */
function block(material, x0, x1, y0, y1, z0, z1) {
  if (x1 - x0 <= 0 || y1 - y0 <= 0 || z1 - z0 <= 0) return;
  add(material, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
}

/** Balok persegi berpusat (cx, cz) dengan lebar w, dari y0 setinggi h. */
function square(material, cx, cz, w, y0, h, d = w) {
  block(material, cx - w / 2, cx + w / 2, y0, y0 + h, cz - d / 2, cz + d / 2);
}

/**
 * Bingkai persegi panjang (dinding keliling) antara kotak luar dan kotak dalam.
 * gap: lebar celah di sisi utara (+z) untuk tangga.
 */
function frame(material, outer, inner, y0, y1, gap = 0, pickMaterial = false) {
  const m = () => (pickMaterial ? brick() : material);
  const [ox, oz] = outer;
  const [ix, iz] = inner;
  block(m(), -ox, ox, y0, y1, -oz, -iz); // selatan
  block(m(), -ox, -ix, y0, y1, -iz, iz); // barat
  block(m(), ix, ox, y0, y1, -iz, iz); // timur
  if (gap) {
    block(m(), -ox, -gap / 2, y0, y1, iz, oz); // utara, kiri tangga
    block(m(), gap / 2, ox, y0, y1, iz, oz); // utara, kanan tangga
  } else {
    block(m(), -ox, ox, y0, y1, iz, oz);
  }
}

// ---------------------------------------------------------------------------
// Ukuran utama (setengah lebar, karena model berpusat di titik 0)
const HOLE = [28.25 / 2, 29.5 / 2]; // tepi lubang kolam di permukaan tanah
const BAND = 0.8; // bibir bata di sekeliling lubang
const GROUND = [19, 19.5]; // batas tanah berumput
const FLOOR_Y = -5.2;
const BASE_Y = -6;
const STAIR_W = 3.6;
const STAIR_WALL = 0.5;
const GAP = STAIR_W + STAIR_WALL * 2;

// Teras berundak: [lebar teras, tinggi puncak teras]
const TERRACES = [
  [2.0, -1.75],
  [1.6, -3.45]
];

// 1. Tanah, bibir bata, dan dasar kolam
const band = [HOLE[0] + BAND, HOLE[1] + BAND];
frame('soil', GROUND, band, BASE_Y, -0.35);
frame('grass', GROUND, band, -0.35, 0);
frame('brick2', band, HOLE, BASE_Y, 0.25, GAP);
frame('cornice', [band[0] + 0.05, band[1] + 0.05], [HOLE[0] - 0.05, HOLE[1] - 0.05], 0.25, 0.4, GAP);

let edge = [...HOLE];
for (const [width, top] of TERRACES) {
  const inner = [edge[0] - width, edge[1] - width];
  // Dinding teras disusun dari beberapa lapis agar warna bata berselang-seling
  const layers = 6;
  for (let i = 0; i < layers; i++) {
    const y0 = FLOOR_Y + ((top - FLOOR_Y) * i) / layers;
    const y1 = FLOOR_Y + ((top - FLOOR_Y) * (i + 1)) / layers;
    frame(null, edge, inner, y0, y1, GAP, true);
  }
  frame('cornice', [inner[0] + 0.15, inner[1] + 0.15], [inner[0] - 0.1, inner[1] - 0.1], top, top + 0.15, GAP);
  edge = inner;
}
const POOL = edge; // dasar kolam bagian dalam
block('floor', -HOLE[0], HOLE[0], BASE_Y, FLOOR_Y, -HOLE[1], HOLE[1]);

// 2. Tangga masuk sisi utara (dari bibir kolam turun ke dasar)
const STEPS = 20;
const RISE = -FLOOR_Y / STEPS;
const RUN = 0.32;
const stairStart = band[1];
for (let i = 0; i < STEPS - 1; i++) {
  const z1 = stairStart - i * RUN;
  const z0 = z1 - RUN;
  const top = -(i + 1) * RISE;
  block(i % 2 ? 'brick1' : 'brick2', -STAIR_W / 2, STAIR_W / 2, FLOOR_Y, top, z0, z1);
  // Pipi tangga kiri & kanan, sedikit lebih tinggi dari anak tangga
  for (const side of [-1, 1]) {
    const xa = side * (STAIR_W / 2);
    const xb = side * (STAIR_W / 2 + STAIR_WALL);
    block('brick3', Math.min(xa, xb), Math.max(xa, xb), FLOOR_Y, top + 0.7, z0, z1);
  }
}
const stairEnd = stairStart - (STEPS - 1) * RUN;

// 3. Dua kolam kecil berpancuran di kiri-kanan ujung tangga
for (const side of [-1, 1]) {
  const cx = side * 5.6;
  const cz = POOL[1] - 1.4;
  const [w, d, h] = [3.5, 2.2, 0.75];
  frame(null, [w / 2, d / 2], [w / 2 - 0.3, d / 2 - 0.3], FLOOR_Y, FLOOR_Y + h, 0, true);
  square('water', 0, 0, w - 0.6, FLOOR_Y, h - 0.2, d - 0.6);
  // bingkai & air dibuat di titik 0, lalu 5 geometri terakhir (4 dinding + air) digeser ke posisi kolam
  moveLast(5, cx, 0, cz);
  // Pancuran batu dari dinding teras ke kolam
  for (const dx of [-0.8, 0.8]) square('stone', cx + dx, POOL[1] + 0.15, 0.35, FLOOR_Y + 1.6, 0.3, 0.6);
}

/** Memindahkan n geometri yang terakhir ditambahkan (lintas material, urut waktu). */
function moveLast(n, x, y, z) {
  for (const geometry of history.splice(history.length - n, n)) geometry.translate(x, y, z);
}

// 4. Bangunan induk (bagian selatan dasar kolam)
const BX = 0;
const BZ = -4.6;
// Parit berair di sekeliling bangunan induk
frame('water', [5.4, 5.4], [4.1, 4.1], FLOOR_Y, FLOOR_Y + 0.08);
moveLast(4, BX, 0, BZ);
frame('brick3', [5.7, 5.7], [5.4, 5.4], FLOOR_Y, FLOOR_Y + 0.35);
moveLast(4, BX, 0, BZ);

const tiers = [
  [8.2, 1.25],
  [7.0, 1.2],
  [5.9, 1.2]
];
let y = FLOOR_Y;
for (const [w, h] of tiers) {
  // tiap undakan: 3 lapis bata + pelipit (cornice) di atasnya
  for (let i = 0; i < 3; i++) square(brick(), BX, BZ, w, y + (h * i) / 3, h / 3);
  square('cornice', BX, BZ, w + 0.2, y + h - 0.12, 0.14);
  // pancuran batu di tengah tiap sisi
  for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    square('stone', BX + dx * (w / 2 + 0.15), BZ + dz * (w / 2 + 0.15), 0.3, y + h * 0.45, 0.25);
  }
  y += h;
}
// Tangga kecil di sisi utara bangunan induk
for (let i = 0; i < 6; i++) {
  const top = FLOOR_Y + (i + 1) * (tiers[0][1] / 6);
  const z1 = BZ + tiers[0][0] / 2 + 1.5 - i * 0.25;
  block('brick2', BX - 0.8, BX + 0.8, FLOOR_Y, top, z1 - 0.25, z1);
}

// Badan bangunan + menara tengah (bertingkat mengecil)
const bodyTop = y + 1.4;
square('brick2', BX, BZ, 4.3, y, 1.4);
square('cornice', BX, BZ, 4.6, bodyTop - 0.15, 0.18);
// relung (relief sederhana) di tiap sisi badan
for (const [dx, dz, rot] of [[0, 1, 0], [0, -1, 0], [1, 0, Math.PI / 2], [-1, 0, Math.PI / 2]]) {
  add('cornice', new THREE.BoxGeometry(1.2, 0.8, 0.12), BX + dx * 2.17, y + 0.65, BZ + dz * 2.17, rot);
}
let towerY = bodyTop;
for (const [w, h] of [[3.3, 0.9], [2.7, 0.8], [2.1, 0.75], [1.55, 0.65], [1.05, 0.55]]) {
  square(brick(), BX, BZ, w, towerY, h);
  square('cornice', BX, BZ, w + 0.16, towerY + h - 0.1, 0.12);
  towerY += h;
}
add('brick1', new THREE.CylinderGeometry(0.42, 0.5, 0.55, 8), BX, towerY + 0.275, BZ);
add('brick4', new THREE.ConeGeometry(0.32, 1.1, 8), BX, towerY + 0.55 + 0.55, BZ);

// 8 menara kecil mengelilingi menara tengah (lambang puncak-puncak Mahameru)
const R = 2.55;
for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]]) {
  let ty = y;
  const cx = BX + dx * R;
  const cz = BZ + dz * R;
  for (const [w, h] of [[0.85, 0.8], [0.7, 0.5], [0.55, 0.42], [0.4, 0.36]]) {
    square(brick(), cx, cz, w, ty, h);
    ty += h;
  }
  add('brick4', new THREE.ConeGeometry(0.2, 0.5, 8), cx, ty + 0.25, cz);
}

// 5. Pepohonan low-poly di sekitar situs
const trees = [[-17.3, 15], [-17.3, 3], [-17.3, -10], [-10, -17.8], [4, -17.8], [15, -17.8], [17.3, -5], [17.3, 8], [15, 17.8], [-8, 17.8]];
for (const [tx, tz] of trees) {
  const s = 0.7 + random() * 0.4;
  add('trunk', new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 2.2 * s, 6), tx, 1.1 * s, tz);
  add('leaf', new THREE.IcosahedronGeometry(1.7 * s, 0), tx, 2.9 * s, tz, random() * Math.PI);
  add('leaf', new THREE.IcosahedronGeometry(1.2 * s, 0), tx + 0.6 * s, 3.9 * s, tz - 0.3 * s, random() * Math.PI);
}

// ---------------------------------------------------------------------------
const scene = new THREE.Scene();
const root = new THREE.Group();
root.name = 'CandiTikus';
root.scale.setScalar(SCALE);
scene.add(root);

for (const [key, geometries] of Object.entries(parts)) {
  if (!geometries.length) continue;
  const { color, roughness, opacity } = materials[key];
  const material = new THREE.MeshStandardMaterial({ name: key, color, roughness, metalness: 0 });
  if (opacity) Object.assign(material, { transparent: true, opacity });
  const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
  mesh.name = key;
  root.add(mesh);
}

const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, Buffer.from(glb));
const triangles = root.children.reduce((sum, mesh) => sum + mesh.geometry.attributes.position.count / 3, 0);
console.log(`Tersimpan: ${OUTPUT} (${(glb.byteLength / 1024).toFixed(0)} KB, ${triangles} segitiga, ${root.children.length} material)`);
console.log(`Ujung tangga di dasar kolam: z = ${stairEnd.toFixed(2)} m`);
