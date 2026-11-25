const PRIME32_1 = 0x9e3779b1n;
const PRIME32_2 = 0x85ebca77n;
const PRIME32_3 = 0xc2b2ae3dn;

const PRIME64_1 = 0x9e3779b185ebca87n;
const PRIME64_2 = 0xc2b2ae3d27d4eb4fn;
const PRIME64_3 = 0x165667b19e3779f9n;
const PRIME64_4 = 0x85ebca77c2b2ae63n;
const PRIME64_5 = 0x27d4eb2f165667c5n;

const PRIME_MX1 = 0x165667919e3779f9n;
const PRIME_MX2 = 0x9fb21c651e98df25n;

const DEFAULT_SECRET = new Uint8Array([
  0xb8, 0xfe, 0x6c, 0x39, 0x23, 0xa4, 0x4b, 0xbe, 0x7c, 0x01, 0x81, 0x2c, 0xf7, 0x21, 0xad, 0x1c,
  0xde, 0xd4, 0x6d, 0xe9, 0x83, 0x90, 0x97, 0xdb, 0x72, 0x40, 0xa4, 0xa4, 0xb7, 0xb3, 0x67, 0x1f,
  0xcb, 0x79, 0xe6, 0x4e, 0xcc, 0xc0, 0xe5, 0x78, 0x82, 0x5a, 0xd0, 0x7d, 0xcc, 0xff, 0x72, 0x21,
  0xb8, 0x08, 0x46, 0x74, 0xf7, 0x43, 0x24, 0x8e, 0xe0, 0x35, 0x90, 0xe6, 0x81, 0x3a, 0x26, 0x4c,
  0x3c, 0x28, 0x52, 0xbb, 0x91, 0xc3, 0x00, 0xcb, 0x88, 0xd0, 0x65, 0x8b, 0x1b, 0x53, 0x2e, 0xa3,
  0x71, 0x64, 0x48, 0x97, 0xa2, 0x0d, 0xf9, 0x4e, 0x38, 0x19, 0xef, 0x46, 0xa9, 0xde, 0xac, 0xd8,
  0xa8, 0xfa, 0x76, 0x3f, 0xe3, 0x9c, 0x34, 0x3f, 0xf9, 0xdc, 0xbb, 0xc7, 0xc7, 0x0b, 0x4f, 0x1d,
  0x8a, 0x51, 0xe0, 0x4b, 0xcd, 0xb4, 0x59, 0x31, 0xc8, 0x9f, 0x7e, 0xc9, 0xd9, 0x78, 0x73, 0x64,
  0xea, 0xc5, 0xac, 0x83, 0x34, 0xd3, 0xeb, 0xc3, 0xc5, 0x81, 0xa0, 0xff, 0xfa, 0x13, 0x63, 0xeb,
  0x17, 0x0d, 0xdd, 0x51, 0xb7, 0xf0, 0xda, 0x49, 0xd3, 0x16, 0x55, 0x26, 0x29, 0xd4, 0x68, 0x9e,
  0x2b, 0x16, 0xbe, 0x58, 0x7d, 0x47, 0xa1, 0xfc, 0x8f, 0xf8, 0xb8, 0xd1, 0x7a, 0xd0, 0x31, 0xce,
  0x45, 0xcb, 0x3a, 0x8f, 0x95, 0x16, 0x04, 0x28, 0xaf, 0xd7, 0xfb, 0xca, 0xbb, 0x4b, 0x40, 0x7e,
]);

const MASK32 = 0xffffffffn;
const MASK64 = 0xffffffffffffffffn;
const STRIPE_LENGTH = 64;

function uint64(value: bigint): bigint {
  return value & MASK64;
}

function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function read64(view: DataView, offset: number): bigint {
  return view.getBigUint64(offset, true);
}

function rotl64(value: bigint, shift: bigint): bigint {
  return uint64((value << shift) | (value >> (64n - shift)));
}

function byteSwap32(value: number): number {
  return (
    ((value & 0x000000ff) << 24) |
    ((value & 0x0000ff00) << 8) |
    ((value >>> 8) & 0x0000ff00) |
    ((value >>> 24) & 0x000000ff)
  ) >>> 0;
}

function byteSwap64(value: bigint): bigint {
  let result = 0n;
  for (let i = 0n; i < 8n; i++) {
    result = (result << 8n) | ((value >> (i * 8n)) & 0xffn);
  }
  return result;
}

function multiply128Fold64(left: bigint, right: bigint): bigint {
  const product = uint64(left) * uint64(right);
  return uint64(product) ^ uint64(product >> 64n);
}

function deriveSecret(seed: bigint): Uint8Array {
  const derivedSecret = DEFAULT_SECRET.slice();
  const view = viewOf(derivedSecret);

  for (let i = 0; i < 12; i++) {
    const offset = i * 16;
    view.setBigUint64(offset, uint64(read64(view, offset) + seed), true);
    view.setBigUint64(offset + 8, uint64(read64(view, offset + 8) - seed), true);
  }

  return derivedSecret;
}

function avalanche(value: bigint): bigint {
  value = uint64(value);
  value ^= value >> 37n;
  value = uint64(value * PRIME_MX1);
  value ^= value >> 32n;
  return uint64(value);
}

function avalancheXXH64(value: bigint): bigint {
  value = uint64(value);
  value ^= value >> 33n;
  value = uint64(value * PRIME64_2);
  value ^= value >> 29n;
  value = uint64(value * PRIME64_3);
  value ^= value >> 32n;
  return uint64(value);
}

function hash0To16(input: Uint8Array, seed: bigint): bigint {
  const length = input.length;
  const inputView = viewOf(input);
  const secretView = viewOf(DEFAULT_SECRET);

  if (length === 0) {
    return avalancheXXH64(seed ^ read64(secretView, 56) ^ read64(secretView, 64));
  }

  if (length <= 3) {
    const combined =
      BigInt(input[length - 1]) |
      (BigInt(length) << 8n) |
      (BigInt(input[0]) << 16n) |
      (BigInt(input[length >> 1]) << 24n);
    const secretXor = BigInt(
      (secretView.getUint32(0, true) ^ secretView.getUint32(4, true)) >>> 0,
    );
    return avalancheXXH64(uint64(secretXor + seed) ^ combined);
  }

  if (length <= 8) {
    const inputFirst = BigInt(inputView.getUint32(0, true));
    const inputLast = BigInt(inputView.getUint32(length - 4, true));
    const swappedSeed = BigInt(byteSwap32(Number(seed & MASK32))) << 32n;
    const modifiedSeed = seed ^ swappedSeed;
    const combined = inputLast | (inputFirst << 32n);
    let value = uint64(
      (read64(secretView, 8) ^ read64(secretView, 16)) - modifiedSeed,
    ) ^ combined;
    value = uint64(value ^ rotl64(value, 49n) ^ rotl64(value, 24n));
    value = uint64(value * PRIME_MX2);
    value ^= (value >> 35n) + BigInt(length);
    value = uint64(value * PRIME_MX2);
    return uint64(value ^ (value >> 28n));
  }

  const inputFirst = read64(inputView, 0);
  const inputLast = read64(inputView, length - 8);
  const low = uint64(
    (uint64((read64(secretView, 24) ^ read64(secretView, 32)) + seed)) ^
      inputFirst,
  );
  const high = uint64(
    (uint64((read64(secretView, 40) ^ read64(secretView, 48)) - seed)) ^
      inputLast,
  );
  const value = uint64(
    BigInt(length) +
      byteSwap64(low) +
      high +
      multiply128Fold64(low, high),
  );
  return avalanche(value);
}

function mixStep(
  inputView: DataView,
  inputOffset: number,
  secretView: DataView,
  secretOffset: number,
  seed: bigint,
): bigint {
  const left = read64(inputView, inputOffset) ^
    uint64(read64(secretView, secretOffset) + seed);
  const right = read64(inputView, inputOffset + 8) ^
    uint64(read64(secretView, secretOffset + 8) - seed);
  return multiply128Fold64(left, right);
}

function hash17To240(input: Uint8Array, seed: bigint): bigint {
  const length = input.length;
  const inputView = viewOf(input);
  const secretView = viewOf(DEFAULT_SECRET);
  let accumulator = uint64(BigInt(length) * PRIME64_1);

  if (length <= 128) {
    const rounds = ((length - 1) >> 5) + 1;
    for (let i = rounds - 1; i >= 0; i--) {
      accumulator = uint64(
        accumulator + mixStep(inputView, i * 16, secretView, i * 32, seed),
      );
      accumulator = uint64(
        accumulator +
          mixStep(inputView, length - i * 16 - 16, secretView, i * 32 + 16, seed),
      );
    }
  } else {
    const chunks = length >> 4;
    for (let i = 0; i < 8; i++) {
      accumulator = uint64(
        accumulator + mixStep(inputView, i * 16, secretView, i * 16, seed),
      );
    }
    accumulator = avalanche(accumulator);
    for (let i = 8; i < chunks; i++) {
      accumulator = uint64(
        accumulator +
          mixStep(inputView, i * 16, secretView, (i - 8) * 16 + 3, seed),
      );
    }
    accumulator = uint64(
      accumulator + mixStep(inputView, length - 16, secretView, 119, seed),
    );
  }

  return avalanche(accumulator);
}

// function accumulateStripe(accumulators: bigint[],inputView: DataView,inputOffset: number,secretView: DataView,secretOffset: number): void {
//   for (let i = 0; i < 8; i++) {
//     const data = read64(inputView, inputOffset + i * 8);
//     const keyed = data ^ read64(secretView, secretOffset + i * 8);
//     accumulators[i ^ 1] = uint64(accumulators[i ^ 1] + data);
//     accumulators[i] = uint64(
//       accumulators[i] + (keyed & MASK32) * (keyed >> 32n),
//     );
//   }
// }

function scrambleAccumulators(accumulators: bigint[],secretView: DataView,): void {
  const secretOffset = secretView.byteLength - STRIPE_LENGTH;
  for (let i = 0; i < 8; i++) {
    let value = accumulators[i] ^ (accumulators[i] >> 47n);
    value ^= read64(secretView, secretOffset + i * 8);
    accumulators[i] = uint64(value * PRIME32_1);
  }
}

function finalMerge(accumulators: bigint[],secretView: DataView,initialValue: bigint,): bigint {
  let result = uint64(initialValue);
  for (let i = 0; i < 4; i++) {
    const secretOffset = 11 + i * 16;
    result = uint64(
      result +
        multiply128Fold64(
          accumulators[i * 2] ^ read64(secretView, secretOffset),
          accumulators[i * 2 + 1] ^ read64(secretView, secretOffset + 8),
        ),
    );
  }
  return avalanche(result);
}

function hashLarge(input: Uint8Array, seed: bigint): bigint {
  const secret = seed === 0n ? DEFAULT_SECRET : deriveSecret(seed);
  const inputView = viewOf(input);
  const secretView = viewOf(secret);
  const accumulators = [
    PRIME32_3,
    PRIME64_1,
    PRIME64_2,
    PRIME64_3,
    PRIME64_4,
    PRIME32_2,
    PRIME64_5,
    PRIME32_1,
  ];
  const stripesPerBlock = Math.floor((secret.length - STRIPE_LENGTH) / 8);
  const blockLength = STRIPE_LENGTH * stripesPerBlock;
  const blocks = Math.floor((input.length - 1) / blockLength);

  for (let block = 0; block < blocks; block++) {
    const blockOffset = block * blockLength;
    for (let stripe = 0; stripe < stripesPerBlock; stripe++) {
      for (let i = 0; i < 8; i++) {
        const data = read64(inputView, (blockOffset + stripe * STRIPE_LENGTH) + i * 8);
        const keyed = data ^ read64(secretView, stripe*8 + i * 8);
        accumulators[i ^ 1] = uint64(accumulators[i ^ 1] + data);
        accumulators[i] = uint64(
          accumulators[i] + (keyed & MASK32) * (keyed >> 32n),
        );
      }
    }
    scrambleAccumulators(accumulators, secretView);
  }

  const lastBlockOffset = blocks * blockLength;
  const lastBlockLength = input.length - lastBlockOffset;
  const fullStripes = Math.floor((lastBlockLength - 1) / STRIPE_LENGTH);
  for (let stripe = 0; stripe < fullStripes; stripe++) {
      for (let i = 0; i < 8; i++) {
        const data = read64(inputView, (lastBlockOffset + stripe * STRIPE_LENGTH) + i * 8);
        const keyed = data ^ read64(secretView, stripe*8 + i * 8);
        accumulators[i ^ 1] = uint64(accumulators[i ^ 1] + data);
        accumulators[i] = uint64(
          accumulators[i] + (keyed & MASK32) * (keyed >> 32n),
        );
      }
  }
  for (let i = 0; i < 8; i++) {
    const data = read64(inputView, (input.length - STRIPE_LENGTH) + i * 8);
    const keyed = data ^ read64(secretView, secret.length - 71 + i * 8);
    accumulators[i ^ 1] = uint64(accumulators[i ^ 1] + data);
    accumulators[i] = uint64(
      accumulators[i] + (keyed & MASK32) * (keyed >> 32n),
    );
  }

  return finalMerge(
    accumulators,
    secretView,
    uint64(BigInt(input.length) * PRIME64_1),
  );
}

/** Computes an XXH3 64-bit hash. */
export function xxhash3(input: Uint8Array, seed: bigint = 0n): bigint {
  seed = uint64(seed);
  if (input.length <= 16) return hash0To16(input, seed);
  if (input.length <= 240) return hash17To240(input, seed);
  return hashLarge(input, seed);
}
