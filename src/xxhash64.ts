const PRIME64_1 = 0x9e3779b185ebca87n;
const PRIME64_2 = 0xc2b2ae3d27d4eb4fn;
const PRIME64_3 = 0x165667b19e3779f9n;
const PRIME64_4 = 0x85ebca77c2b2ae63n;
const PRIME64_5 = 0x27d4eb2f165667c5n;

const MASK64 = 0xffffffffffffffffn;

function rotl64(x: bigint, r: bigint): bigint {
  return ((x << r) | (x >> (64n - r))) & MASK64;
}

function round(acc: bigint, input: bigint): bigint {
  acc = (acc + input * PRIME64_2) & MASK64;
  acc = rotl64(acc, 31n);
  acc = (acc * PRIME64_1) & MASK64;
  return acc;
}

function mergeAccumulator(acc: bigint, accN: bigint): bigint {
  acc = (acc ^ round(0n, accN)) & MASK64;
  acc = (acc * PRIME64_1 + PRIME64_4) & MASK64;
  return acc;
}

export function xxhash64(input: Uint8Array, seed: bigint = 0n): bigint {
  let acc: bigint;
  let offset: number = 0;
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  if (input.length < 32) {
    acc = seed + PRIME64_5;
  } else {
    let acc1 = seed + PRIME64_1 + PRIME64_2;
    let acc2 = seed + PRIME64_2;
    let acc3 = seed + 0n;
    let acc4 = seed - PRIME64_1;
    for (; offset + 32 <= input.length; offset += 32) {
      const lane1 = view.getBigUint64(offset, true);
      const lane2 = view.getBigUint64(offset + 8, true);
      const lane3 = view.getBigUint64(offset + 16, true);
      const lane4 = view.getBigUint64(offset + 24, true);
      acc1 = round(acc1, lane1);
      acc2 = round(acc2, lane2);
      acc3 = round(acc3, lane3);
      acc4 = round(acc4, lane4);
    }
    acc = (rotl64(acc1, 1n) + rotl64(acc2, 7n) + rotl64(acc3, 12n) + rotl64(acc4, 18n)) & MASK64;
    acc = mergeAccumulator(acc, acc1);
    acc = mergeAccumulator(acc, acc2);
    acc = mergeAccumulator(acc, acc3);
    acc = mergeAccumulator(acc, acc4);
  }
  acc = (acc + BigInt(input.length)) & MASK64;
  while (input.length >= offset + 8) {
    const lane:bigint = view.getBigUint64(offset, true);
    acc = (acc ^ round(0n, lane)) & MASK64;
    acc = (rotl64(acc, 27n) * PRIME64_1 + PRIME64_4) & MASK64;
    offset += 8;
  }
  if (input.length >= offset + 4) {
    const lane = BigInt(view.getUint32(offset, true));
    acc = (acc ^ (lane * PRIME64_1)) & MASK64;
    acc = (rotl64(acc, 23n) * PRIME64_2 + PRIME64_3) & MASK64;
    offset += 4;
  }
  while (input.length >= offset + 1) {
    const lane = BigInt(input[offset]);
    acc = (acc ^ (lane * PRIME64_5)) & MASK64;
    acc = (rotl64(acc, 11n) * PRIME64_1) & MASK64;
    offset += 1;
  }
  acc ^= acc >> 33n;
  acc = (acc * PRIME64_2) & MASK64;
  acc ^= acc >> 29n;
  acc = (acc * PRIME64_3) & MASK64;
  acc ^= acc >> 32n;
  return acc;
}
