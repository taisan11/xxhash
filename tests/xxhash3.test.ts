import { describe, expect, test } from "vitest";
import { xxhash3 } from "../src";
import {XXH64} from "xxh3-ts";

function makeInput(length: number): Uint8Array {
  return Uint8Array.from(
    { length },
    (_, index) => (index * 131 + length * 17) & 0xff,
  );
}

describe("xxhash3", () => {
  const vectors: Array<[number, bigint]> = [
    [0, 0x0n],
    [1, 0x1n],
    [3, 0x9e3779b1n],
    [4, 0x0n],
    [8, 0x12345678n],
    [9, 0x0n],
    [16, 0xffffffffn],
    [17, 0x0n],
    [128, 0x9e3779b1n],
    [129, 0x0n],
    [240, 0x12345678n],
    [241, 0x0n],
    [1023, 0x9e3779b1n],
    [1024, 0x0n],
    [1025, 0x12345678n],
    [2048, 0xffffffffn],
  ];

  for (const [length, seed] of vectors) {
    test(`matches reference vector at length ${length}`, () => {
      expect(xxhash3(makeInput(length), seed)).toBe(XXH64(Buffer.from(makeInput(length)), seed));
    });
  }

  test("supports Uint8Array views with a non-zero byte offset", () => {
    const input = makeInput(241);
    const backing = new Uint8Array(input.length + 13);
    backing.set(input, 7);

    expect(xxhash3(backing.subarray(7, 7 + input.length))).toBe(
      xxhash3(input),
    );
  });

  test("normalizes seeds to an unsigned 64-bit integer", () => {
    const input = makeInput(1025);

    expect(xxhash3(input, -1n)).toBe(xxhash3(input, 0xffffffffffffffffn));
    expect(xxhash3(input, 0x10000000000000001n)).toBe(xxhash3(input, 1n));
  });
});
