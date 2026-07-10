# @taisan11/xxhash

## 日本語

勉強用に作ったシンプルかつ高速なxxhash実装です。
ブラウザAPIをベースに余計なものを挟まず作ったので高速かつ軽量に仕上がってます。

## English

This is a simple yet high-performance xxhash implementation designed for educational purposes.
Based on browser APIs without unnecessary overhead, it achieves both speed and lightweight performance.

## API Docs
```ts
import {xxhash32,xxhash64} from "@taisan11/xxhash"

const encoder = new TextEncoder()

console.log(xxhash32(encoder.encode("hello xxhash32")))

console.log(xxhash64(encoder.encode("hello xxhash64")))
```
