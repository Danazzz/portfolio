/*
 * Shader GLSL untuk partikel.
 *  - simulasi (GPU): kecepatan & posisi tiap partikel disimpan di tekstur float,
 *    diperbarui setiap frame dengan pegas ke bentuk target, redaman, noise curl, dan gaya kursor.
 *  - render: THREE.Points membaca posisi dari tekstur simulasi.
 */

/* Simplex noise 3D — Ian McEwan & Stefan Gustavson (Ashima Arts), lisensi MIT. */
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(x),
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)),
    snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4))
  );
}

/* Curl noise: medan aliran tanpa "sumber", jadi partikel mengalir berputar, tidak menggumpal. */
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 px0 = snoiseVec3(p - dx); vec3 px1 = snoiseVec3(p + dx);
  vec3 py0 = snoiseVec3(p - dy); vec3 py1 = snoiseVec3(p + dy);
  vec3 pz0 = snoiseVec3(p - dz); vec3 pz1 = snoiseVec3(p + dz);
  float x = (py1.z - py0.z) - (pz1.y - pz0.y);
  float y = (pz1.x - pz0.x) - (px1.z - px0.z);
  float z = (px1.y - px0.y) - (py1.x - py0.x);
  return vec3(x, y, z) / (2.0 * e);
}
`;

/**
 * Simulasi kecepatan. Satuan: unit objek per frame (60 fps); uDt = jumlah frame 60fps yang lewat.
 * rnd.x = benih, rnd.y = jeda morph (bertahap), rnd.z = ukuran, rnd.w = terang/aksen.
 */
export const velocityShader = /* glsl */ `
uniform float uTime;
uniform float uDt;
uniform float uStiffness;
uniform float uDamping;
uniform float uMaxForce;
uniform float uNoise;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uMorph;
uniform float uScatter;
uniform float uBreath;
uniform float uFlow;
uniform float uRadius;
uniform float uRepel;
uniform float uAttract;
uniform float uStir;
uniform float uMouse;
uniform vec3 uRayOrigin;
uniform vec3 uRayDir;
uniform vec3 uMouseVel;
uniform sampler2D uTargetA;
uniform sampler2D uTargetB;
uniform sampler2D uRandom;

${SIMPLEX}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vec4 rnd = texture2D(uRandom, uv);

  // Morph bertahap: tiap partikel mulai di waktu sedikit berbeda, lalu bergerak dengan kurva halus.
  float local = clamp((uMorph - rnd.y * 0.45) / 0.55, 0.0, 1.0);
  float eased = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);
  vec3 target = mix(texture2D(uTargetA, uv).xyz, texture2D(uTargetB, uv).xyz, eased);

  // Bernapas: membesar-mengecil sangat pelan, fase sedikit berbeda per partikel.
  target *= 1.0 + uBreath * sin(uTime * 0.75 + rnd.x * 1.8);
  // Gelombang (untuk bentuk "wave"): permukaan bergulung pelan.
  target.y += uFlow * sin(target.x * 2.3 + uTime * 0.9) * cos(target.z * 1.9 + uTime * 0.65);

  vec3 flow = curlNoise(pos * uNoiseScale + vec3(uTime * uNoiseSpeed, 0.0, rnd.x * 0.35));

  // Di tengah morph, target "meledak" pelan keluar & mengikuti aliran, lalu kembali merapat.
  float burst = sin(3.14159265 * local);
  vec3 outward = normalize(target + (vec3(rnd.x, rnd.z, rnd.w) - 0.5) * 0.8 + 1e-4);
  target += (outward * (0.2 + rnd.x * 0.85) + flow * 0.25) * uScatter * burst;

  // Pegas ke target (dibatasi supaya perjalanan jauh tetap meluncur, tidak melesat).
  vec3 spring = (target - pos) * uStiffness;
  float sl = length(spring);
  if (sl > uMaxForce) spring *= uMaxForce / sl;
  vec3 force = spring;

  // Gerak mikro organik yang selalu ada.
  force += flow * uNoise * (0.55 + rnd.z * 0.9);

  // Kursor: jarak tiap partikel ke garis pandang kursor (menembus objek).
  // Dekat → didorong menjauh; di cincin luar → sedikit ditarik; ikut terseret arah gerak kursor.
  vec3 rel = pos - uRayOrigin;
  vec3 radial = rel - dot(rel, uRayDir) * uRayDir;
  float d = length(radial);
  vec3 away = radial / max(d, 1e-4);
  float inner = 1.0 - smoothstep(0.0, uRadius, d);
  float ring = smoothstep(uRadius * 0.55, uRadius, d) * (1.0 - smoothstep(uRadius, uRadius * 2.0, d));
  force += away * (uRepel * inner * inner - uAttract * ring) * uMouse;
  force += uMouseVel * (uStir * inner * uMouse);

  vel += force * uDt;
  vel *= pow(uDamping, uDt);
  gl_FragColor = vec4(vel, 1.0);
}
`;

export const positionShader = /* glsl */ `
uniform float uDt;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  pos.xyz += vel * uDt;
  gl_FragColor = pos;
}
`;

export const pointsVertex = /* glsl */ `
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform sampler2D uRandom;
uniform float uSize;
uniform float uPixelRatio;
uniform float uCamDist;
uniform float uDepthRange;
uniform float uIntro;
attribute vec2 reference;
varying float vAlpha;
varying float vAccent;

void main() {
  vec3 pos = texture2D(uPosition, reference).xyz;
  vec3 vel = texture2D(uVelocity, reference).xyz;
  vec4 rnd = texture2D(uRandom, reference);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Kedalaman relatif terhadap pusat objek: depan terang, belakang redup.
  float centerZ = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
  float depth = clamp((mv.z - centerZ) / uDepthRange * 0.5 + 0.5, 0.0, 1.0);
  float speed = length(vel);
  float excite = min(speed * 22.0, 1.0); // partikel yang terganggu sedikit lebih terang/besar

  gl_PointSize = uSize * uPixelRatio * (0.65 + rnd.z * 0.7) * (uCamDist / -mv.z) * (1.0 + excite * 0.3);
  vAlpha = (0.6 + 0.4 * rnd.w) * mix(0.32, 1.0, depth) * (1.0 + excite * 0.5) * uIntro;
  vAccent = step(0.84, rnd.w);
}
`;

export const pointsFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
varying float vAlpha;
varying float vAccent;

void main() {
  // Titik bulat dengan tepi tajam + sedikit cahaya lembut di sekelilingnya.
  float r = length(gl_PointCoord - 0.5);
  float core = 1.0 - smoothstep(0.3, 0.42, r);
  float halo = (1.0 - smoothstep(0.0, 0.5, r)) * 0.22;
  float a = (core + halo) * vAlpha * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, vAccent), a);
  #include <colorspace_fragment>
}
`;
