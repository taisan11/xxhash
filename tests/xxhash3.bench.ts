import { Buffer } from "node:buffer";
import { bench, describe } from "vitest";
import { XXH3_128,XXH64 } from "xxh3-ts";
import {hash} from "bun";
import { xxhash3 } from "../src";

const bun_hash = hash.xxHash3

const small = new Uint8Array(
  Array.from({ length: 64 }, (_, i) => (i * 11) & 0xff),
);
const smallBuffer = Buffer.from(small);
const medium = new Uint8Array(
  Array.from({ length: 4096 }, (_, i) => (i * 31) & 0xff),
);
const mediumBuffer = Buffer.from(medium);
const large = new Uint8Array(
  Array.from({ length: 65536 }, (_, i) => (i * 7) & 0xff),
);
const largeBuffer = Buffer.from(large);
const seed = 0n;

describe("XXH3-128 (small 64B)", () => {
  bench("xxhash3", () => {
    xxhash3(small, seed);
  });
  bench("xxh3-ts.XXH3_128", () => {
    XXH64(smallBuffer, seed);
  });
  // bench("bun.hash.xxHash3", () => {
  //   bun_hash(smallBuffer, seed);
  // });
});

describe("XXH3-128 (medium 4KB)", () => {
  bench("xxhash3", () => {
    xxhash3(medium, seed);
  });
  bench("xxh3-ts.XXH3_128", () => {
    XXH64(mediumBuffer, seed);
  });
  // bench("bun.hash.xxHash3", () => {
  //   bun_hash(mediumBuffer, seed);
  // });
});

describe("XXH3-128 (large 64KB)", () => {
  bench("xxhash3", () => {
    xxhash3(large, seed);
  });
  bench("xxh3-ts.XXH3_128", () => {
    XXH64(largeBuffer, seed);
  });
  // bench("bun.hash.xxHash3", () => {
  //   bun_hash(largeBuffer, seed);
  // })
});
