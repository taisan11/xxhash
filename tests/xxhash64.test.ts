import { describe, expect, test } from "vitest";
import { Buffer } from "node:buffer";
import xxhashjs from "xxhashjs";
import { xxhash64 } from "../src";

function refHash(input: Uint8Array, seed: bigint): bigint {
  return BigInt("0x" + xxhashjs.h64(Buffer.from(input), Number(seed)).toString(16));
}

describe("xxhash64 correctness vs xxhashjs", () => {
  const cases: Array<[string, Uint8Array, bigint]> = [
    ["empty", new Uint8Array(0), 0n],
    ["empty seed", new Uint8Array(0), 0x9747b28cn],
    ["single byte", new Uint8Array([0x61]), 0n],
    ["3 bytes", new Uint8Array([0x61, 0x62, 0x63]), 0n],
    ["4 bytes", new Uint8Array([0x31, 0x32, 0x33, 0x34]), 0n],
    ["15 bytes", new Uint8Array(Array.from({ length: 15 }, (_, i) => i + 1)), 0n],
    ["16 bytes", new Uint8Array(Array.from({ length: 16 }, (_, i) => i + 1)), 0n],
    ["17 bytes", new Uint8Array(Array.from({ length: 17 }, (_, i) => i + 1)), 12345n],
    ["100 bytes", new Uint8Array(Array.from({ length: 100 }, (_, i) => (i * 7) & 0xff)), 0n],
    [
      "1k bytes",
      new Uint8Array(Array.from({ length: 1024 }, (_, i) => (i * 31) & 0xff)),
      0xa5a5a5a5n,
    ],
    [
      "100k bytes",
      new Uint8Array(Array.from({ length: 1024 * 100 }, (_, i) => (i * 31) & 0xff)),
      0xa5a5a5a5n,
    ],
  ];

  for (const [name, input, seed] of cases) {
    test(`${name} (len=${input.length}, seed=${seed})`, () => {
      expect(xxhash64(input, seed)).toBe(refHash(input, seed));
    });
  }

  test("matches reference across many random inputs and seeds", () => {
    let seed = 0x12345678;
    // simple deterministic PRNG (mulberry32)
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let iter = 0; iter < 200; iter++) {
      const len = Math.floor(rand() * 2048);
      const data = new Uint8Array(len);
      for (let i = 0; i < len; i++) data[i] = Math.floor(rand() * 256);
      const s = Math.floor(rand() * 0xffffffff);
      expect(xxhash64(data, BigInt(s))).toBe(refHash(data, BigInt(s)));
    }
  });
});
