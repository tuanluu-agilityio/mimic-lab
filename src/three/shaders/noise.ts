/** Shared GLSL helpers: hash, value noise, fbm, cellular dots and a cheap caustic pattern. */
export const NOISE_GLSL = /* glsl */ `
float mlHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float mlNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(mlHash(i), mlHash(i + vec3(1,0,0)), f.x), mix(mlHash(i + vec3(0,1,0)), mlHash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(mlHash(i + vec3(0,0,1)), mlHash(i + vec3(1,0,1)), f.x), mix(mlHash(i + vec3(0,1,1)), mlHash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float mlFbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * mlNoise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return s;
}
// Distance to the nearest jittered cell centre (0 at a centre). Used for chromatophore speckle.
float mlCells(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float d = 1.0;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 o = vec3(mlHash(i + g), mlHash(i + g + 31.7), mlHash(i + g + 57.3));
    vec3 r = g + o - f;
    d = min(d, dot(r, r));
  }
  return sqrt(d);
}
float mlCaustic(vec2 p, float t) {
  vec2 q = p * 0.9 + 3.0;
  float c = 0.0;
  float a = 1.0;
  for (int i = 0; i < 3; i++) {
    q += vec2(sin(q.y * 1.7 + t * 0.6 + float(i)), cos(q.x * 1.9 - t * 0.5 + float(i) * 2.0)) * 0.55;
    c += a * (0.5 + 0.5 * sin(q.x * 2.3 + q.y * 1.9 + t * 0.4));
    a *= 0.6;
  }
  c /= 1.96;
  return pow(c, 5.0) * 3.0;
}
`;
