declare module "xxhashjs" {
  export interface Hash32 {
    toString(radix?: number): string;
    toNumber(): number;
  }
  export interface Hash32Stream {
    init(seed: number): Hash32Stream;
    update(data: Uint8Array | ArrayBuffer | string): Hash32Stream;
    digest(): Hash32;
  }
  export function h32(data: Uint8Array | ArrayBuffer | string, seed: number): Hash32;
  export function h32(seed: number): Hash32Stream;
}
