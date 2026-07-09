import { bench, describe } from "vitest";
import { Buffer } from "node:buffer";
import xxhashjs from "xxhashjs";
import { xxhash32 } from "../src/xxhash32.js";

const small = new Uint8Array(Array.from({ length: 64 }, (_, i) => (i * 11) & 0xff));
const smallBuffer = Buffer.from(small);
const medium = new Uint8Array(Array.from({ length: 4096 }, (_, i) => (i * 31) & 0xff));
const mediumBuffer = Buffer.from(medium);
const large = new Uint8Array(Array.from({ length: 65536 }, (_, i) => (i * 7) & 0xff));
const largeBuffer = Buffer.from(large);
const seed = 0x9747b28c;

describe("xxhash32 benchmark vs xxhashjs (small 64B)", () => {
  bench("xxhash32", () => {
    xxhash32(small, seed);
  });
  bench("xxhashjs.h32", () => {
    xxhashjs.h32(smallBuffer, seed);
  });
});

describe("xxhash32 benchmark vs xxhashjs (medium 4KB)", () => {
  bench("xxhash32", () => {
    xxhash32(medium, seed);
  });
  bench("xxhashjs.h32", () => {
    xxhashjs.h32(mediumBuffer, seed).toNumber();
  });
})

describe("xxhash32 benchmark vs xxhashjs (large 64KB)", () => {
  bench("xxhash32", () => {
    xxhash32(large, seed);
  });
  bench("xxhashjs.h32", () => {
    xxhashjs.h32(largeBuffer, seed).toNumber();
  });
})
