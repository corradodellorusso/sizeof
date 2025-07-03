import { ECMA_SIZES } from "./constants";
import { SizeOfError } from "./errors";

const convertToPlainObject = (source: object) => {
  if (source instanceof Map) {
    return Object.fromEntries(source);
  }
  if (source instanceof Set) {
    return Array.from(source);
  }
  return source;
};

/**
 * Precisely calculate size of string in node
 * Based on https://stackoverflow.com/questions/68789144/how-much-memory-do-v8-take-to-store-a-string/68791382#68791382
 * @param {} source
 */
const preciseStringSizeNode = (source: string) =>
  12 + 4 * Math.ceil(source.length / 4);

/**
 * Size in bytes for typed arrays
 * @param typedArray
 */
const getSizeOfTypedArray = (typedArray: ArrayBufferView) => {
  if ("BYTES_PER_ELEMENT" in typedArray && "length" in typedArray) {
    return (
      (typedArray.length as number) * (typedArray.BYTES_PER_ELEMENT as number)
    );
  }
  throw new SizeOfError("Malformed typed array");
};

/**
 * Size in bytes for complex objects
 * @param {*} source
 * @returns size in bytes
 * @throws {SizeOfError} if the object is a typed array
 * @throws {SizeOfError} if the object cannot be serialized
 */
const objectSizeComplex = (source: object) => {
  if (ArrayBuffer.isView(source)) {
    return getSizeOfTypedArray(source);
  }

  try {
    const plain = convertToPlainObject(source);
    const serializedObj = JSON.stringify(plain, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      } else if (typeof value === "function") {
        return value.toString();
      } else if (typeof value === "undefined") {
        return "undefined";
      } else if (typeof value === "symbol") {
        return value.toString();
      } else if (value instanceof RegExp) {
        return value.toString();
      } else {
        return value;
      }
    });

    return Buffer.byteLength(serializedObj, "utf8");
  } catch (error) {
    throw new SizeOfError("Error while calculating object size", error);
  }
};

/**
 * Size in bytes for primitive types
 * @param {*} source
 * @returns size in bytes
 */
const objectSizeSimple = (source: unknown) => {
  if (source === null) {
    return 0;
  }
  if (source === undefined) {
    return 0;
  }
  if (typeof source === "boolean") {
    return ECMA_SIZES.BYTES;
  }
  if (typeof source === "string") {
    return preciseStringSizeNode(source);
  }
  if (typeof source === "number") {
    return ECMA_SIZES.NUMBER;
  }
  if (typeof source === "symbol") {
    const isGlobalSymbol = Symbol.keyFor(source);
    if (isGlobalSymbol) {
      return isGlobalSymbol.length * ECMA_SIZES.STRING;
    }
    return (source.toString().length - 8) * ECMA_SIZES.STRING;
  }
  if (typeof source === "bigint") {
    return Buffer.from(source.toString()).byteLength;
  }
  if (typeof source === "function") {
    return source.toString().length;
  }
  throw new SizeOfError(`Unknown type ${typeof source}.`);
};

export const sizeOf = (source: unknown): number => {
  if (source !== null && typeof source === "object") {
    return objectSizeComplex(source);
  }
  return objectSizeSimple(source);
};

export { SizeOfError } from "./errors";
