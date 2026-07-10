import { bench, describe } from "vitest";
import { Buffer } from "node:buffer";
import xxhashjs from "xxhashjs";
import { xxhash64 } from "../src";

const small = new Uint8Array(Array.from({ length: 64 }, (_, i) => (i * 11) & 0xff));
const smallBuffer = Buffer.from(small);
const medium = new Uint8Array(Array.from({ length: 4096 }, (_, i) => (i * 31) & 0xff));
const mediumBuffer = Buffer.from(medium);
const large = new Uint8Array(Array.from({ length: 65536 }, (_, i) => (i * 7) & 0xff));
const largeBuffer = Buffer.from(large);
const seed = 0x9747b28cn;

describe("xxhash64 benchmark vs xxhashjs (small 64B)", () => {
  bench("xxhash64", () => {
    xxhash64(small, seed);
  });
  bench("xxhashjs.h64", () => {
    xxhashjs.h64(smallBuffer, Number(seed));
  });
});

describe("xxhash64 benchmark vs xxhashjs (medium 4KB)", () => {
  bench("xxhash64", () => {
    xxhash64(medium, seed);
  });
  bench("xxhashjs.h64", () => {
    xxhashjs.h64(mediumBuffer, Number(seed));
  });
});

describe("xxhash64 benchmark vs xxhashjs (large 64KB)", () => {
  bench("xxhash64", () => {
    xxhash64(large, seed);
  });
  bench("xxhashjs.h64", () => {
    xxhashjs.h64(largeBuffer, Number(seed));
  });
});
