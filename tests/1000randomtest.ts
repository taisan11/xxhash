import { xxhash32 } from "../src/index";
import hasher from "xxhashjs";

const encoder = new TextEncoder();

for (let i = 0; i < 1000; i++) {
  const randomString =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const hash = xxhash32(encoder.encode(randomString));
  const trueHash = hasher.h32(0).update(randomString).digest().toNumber();
  if (hash !== trueHash) {
    console.error(`Hash mismatch for string: ${randomString}. Expected: ${trueHash}, Got: ${hash}`);
  } else {
  }
}

console.log("finish");
