## size-of-object

[![Build](https://img.shields.io/npm/v/size-of-object)](https://img.shields.io/npm/v/size-of-object) ![GitHub contributors](https://img.shields.io/github/contributors/corradodellorusso/sizeof) [![NPM](https://img.shields.io/npm/dy/size-of-object)](https://img.shields.io/npm/dy/size-of-object)

### Get the size of a JavaScript object in bytes

Uses the Buffer.from(objectToString) method to convert the object's string representation to a buffer, and then it uses the byteLength property to obtain the buffer size in bytes.

### Supported Standard built-in and complex types

- Map
- Set
- BigInt
- Function
- Typed Arrays (Int8Array, Uint32Array, Float64Array, etc)

### Error handling

An instance of `SizeOfError` if is impossible to calculate the size of the object.

- JSON serialization error, e.g. circular references.
- Unrecognizable object.

It prevents potential exceptions or infinite loops, improving reliability.

### Installation

`npm install size-of`

### Examples

```typescript
import { sizeOf } from "size-of-object";
const size = sizeOf({ abc: "def" });
console.log(`Size of the object: ${sizeObj} bytes`);
```

## License

This project is licensed under the [MIT License](./LICENSE).

## Credits

This project is a fork of [object-sizeof](https://github.com/miktam/sizeof), originally created by **Andrei Karpushonak aka @miktam** and licensed under the MIT License.

The original code has been reworked to comply with the latest TypeScript standards and to improve performance and reliability.

Compared to the original, this version offers:

- No browser support, only work in node focusing on performance by simplifying the code and removing unnecessary checks
- Better types and support for both CommonJS and ESM
- Error are getting thrown instead of returning magic numbers
- Focus on performance by simplifying the code and removing unnecessary checks
