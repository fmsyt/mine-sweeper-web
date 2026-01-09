export default function* mulberry32Generator(
  seed?: number,
): Generator<number, never, unknown> {
  let t = seed ?? Math.floor(Math.random() * 0xffffffff);

  while (true) {
    t += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    yield ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
