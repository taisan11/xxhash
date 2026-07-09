const PRIME32_1 = 0x9e3779b1;
const PRIME32_2 = 0x85ebca77;
const PRIME32_3 = 0xc2b2ae3d;
const PRIME32_4 = 0x27d4eb2f;
const PRIME32_5 = 0x165667b1;

// 32-bit circular left shift
function rotl(value: number, n: number) {
  return ((value << n) | (value >>> (32 - n))) >>> 0;
}

function round(acc: number, input: number) {
  acc = (acc + Math.imul(input, PRIME32_2)) >>> 0;
  acc = rotl(acc, 13);
  acc = Math.imul(acc, PRIME32_1) >>> 0;
  return acc;
}

// read a little-endian 32-bit value
function read32(buf: Uint8Array, offset: number) {
  const value =
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] << 24);
  return value >>> 0;
}

export function xxhash32(input: Uint8Array, seed: number = 0) {
  let acc: number;
  let remainingLength: number;
  let offset: number = 0;
  remainingLength = input.length;
  if (input.length < 16) {
    acc = (seed + PRIME32_5) >>> 0;
  } else {
    let acc1 = (seed + PRIME32_1 + PRIME32_2) >>> 0;
    let acc2 = (seed + PRIME32_2) >>> 0;
    let acc3 = (seed + 0) >>> 0;
    let acc4 = (seed - PRIME32_1) >>> 0;
    for (let i = 0; i + 16 <= input.length; i += 16) {
      remainingLength -= 16;
      offset += 16;
      const lane1 = read32(input, i);
      const lane2 = read32(input, i + 4);
      const lane3 = read32(input, i + 8);
      const lane4 = read32(input, i + 12);
      acc1 = round(acc1, lane1);
      acc2 = round(acc2, lane2);
      acc3 = round(acc3, lane3);
      acc4 = round(acc4, lane4);
    }
    acc =
      (rotl(acc1, 1) + rotl(acc2, 7) + rotl(acc3, 12) + rotl(acc4, 18)) >>> 0;
  }
  acc = (acc + input.length) >>> 0;
  while (remainingLength >= 4) {
    const lane = read32(input, offset);
    acc = (acc + Math.imul(lane, PRIME32_3)) >>> 0;
    acc = Math.imul(rotl(acc, 17), PRIME32_4) >>> 0;
    offset += 4;
    remainingLength -= 4;
  }
  while (remainingLength >= 1) {
    const lane = input[offset];
    acc = (acc + Math.imul(lane, PRIME32_5)) >>> 0;
    acc = Math.imul(rotl(acc, 11), PRIME32_1) >>> 0;
    offset += 1;
    remainingLength -= 1;
  }
  acc = (acc ^ (acc >>> 15)) >>> 0;
  acc = Math.imul(acc, PRIME32_2) >>> 0;
  acc = (acc ^ (acc >>> 13)) >>> 0;
  acc = Math.imul(acc, PRIME32_3) >>> 0;
  acc = (acc ^ (acc >>> 16)) >>> 0;
  return acc;
}
