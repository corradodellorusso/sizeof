import { describe, expect, it } from "vitest";
import { sizeOf } from "../index";
import { SizeOfError } from "../errors";

describe("sizeOf", () => {
  it("should handle null in object keys", () => {
    const badData = { 1: { depot_id: null, hierarchy_node_id: null } };
    const result = sizeOf(badData);
    expect(typeof result).toBe("number");
  });

  it("null is 0", () => {
    expect(sizeOf(null)).toBe(0);
  });

  it("number size shall be 8", () => {
    expect(sizeOf(5)).toBe(8);
  });

  it("undefined is 0", () => {
    expect(sizeOf(undefined)).toBe(0);
  });

  it("of 3 chars string is 16 in node.js", () => {
    expect(sizeOf("abc")).toBe(16);
  });

  it("sizeOf of empty string", () => {
    expect(sizeOf("")).toBe(12);
  });

  it("boolean size shall be 4", () => {
    expect(sizeOf(true)).toBe(4);
  });

  it("report an error for circular dependency objects", () => {
    try {
      const firstLevel = { a: 1, second: null as any };
      const secondLevel = { b: 2, c: firstLevel };
      firstLevel.second = secondLevel;
      sizeOf(firstLevel);
      expect.fail("should throw an error");
    } catch (e: any) {
      expect(e).toBeInstanceOf(SizeOfError);
      expect(e.cause.message).toMatch(/circular/);
    }
  });

  it("handle hasOwnProperty key", () => {
    expect(typeof sizeOf({ hasOwnProperty: undefined })).toBe("number");
    expect(typeof sizeOf({ hasOwnProperty: "Hello World" })).toBe("number");
    expect(typeof sizeOf({ hasOwnProperty: 1234 })).toBe("number");
  });

  it("supports symbol", () => {
    const descriptor = "abcd";
    expect(sizeOf(Symbol(descriptor))).toBe(2 * descriptor.length);
  });

  it("supports global symbols", () => {
    const globalSymbol = Symbol.for("a");
    const obj = { [globalSymbol]: "b" };
    expect(sizeOf(obj)).toBe(2);
  });

  it("array support for strings - longer array should have sizeOf above the shorter one", () => {
    expect(sizeOf(["a", "b", "c", "d"])).toBeGreaterThan(sizeOf(["a", "b"]));
  });

  it("array support for numbers - longer array should have sizeOf above the shorter one", () => {
    expect(sizeOf([1, 2, 3])).toBeGreaterThan(sizeOf([1, 2]));
  });

  it("array support for NaN - longer array should have sizeOf above the shorter one", () => {
    expect(sizeOf([NaN, NaN])).toBeGreaterThan(sizeOf([NaN]));
  });

  it("map support", () => {
    const mapSmaller = new Map();
    mapSmaller.set("a", 1);
    const mapBigger = new Map();
    mapBigger.set("a", 1);
    mapBigger.set("b", 2);
    expect(sizeOf(mapBigger)).toBeGreaterThan(sizeOf(mapSmaller));
  });

  it("set support", () => {
    const smallerSet = new Set();
    smallerSet.add(1);

    const biggerSet = new Set();
    biggerSet.add(1);
    biggerSet.add("some text");
    expect(sizeOf(biggerSet)).toBeGreaterThan(sizeOf(smallerSet));
  });

  it("typed array support", () => {
    expect(sizeOf(new Int8Array([1, 2, 3, 4, 5]))).toBe(5);
    expect(sizeOf(new Uint8Array([1, 2, 3, 4, 5]))).toBe(5);
    expect(sizeOf(new Uint16Array([1, 2, 3, 4, 5]))).toBe(10);
    expect(sizeOf(new Int16Array([1, 2, 3, 4, 5]))).toBe(10);
    expect(sizeOf(new Uint32Array([1, 2, 3, 4, 5]))).toBe(20);
    expect(sizeOf(new Int32Array([1, 2, 3, 4, 5]))).toBe(20);
    expect(sizeOf(new Float32Array([1, 2, 3, 4, 5]))).toBe(20);
    expect(sizeOf(new Float64Array([1, 2, 3, 4, 5]))).toBe(40);
  });

  it("BigInt support", () => {
    expect(sizeOf(BigInt(21474836480))).toBe(11);
  });

  it("BigInt support in objects", () => {
    const nestedBigInt = {
      num: BigInt(123123123123123123n),
    };
    expect(sizeOf(nestedBigInt)).toBe(28);
  });

  it("function support in objects", () => {
    const nestedFunction = {
      func: (x: number) => {
        return x + x;
      },
    };
    expect(sizeOf(nestedFunction)).toBe(51);
  });

  it("nested support in objects", () => {
    const nestedUndefined = {
      undef: undefined,
    };
    expect(sizeOf(nestedUndefined)).toBe(21);
  });

  it("should handle nested symbols", () => {
    expect(sizeOf({ symbol: Symbol("test") })).toBe(25);
  });

  it("should handle nested regex", () => {
    expect(sizeOf({ regex: /test/g })).toBe(19);
  });

  it("nested objects", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(sizeOf(obj)).toBe(19);
    const nested = { d: obj };
    expect(sizeOf(nested)).toBe(25);
  });

  it("Function support", () => {
    const func = (one: number, two: number) => {
      return one + two;
    };
    expect(sizeOf(func)).toBe(45);
  });

  it("should calculate size for global symbols", () => {
    expect(sizeOf(Symbol.for("testKey"))).toBe(14);
  });
});
