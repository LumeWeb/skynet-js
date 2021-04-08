import {
  deriveChildSeed,
  encodeBigintAsUint64,
  encodeNumber,
  encodeString,
  genKeyPairFromSeed,
  hashDataKey,
  hashRegistryEntry,
} from "./crypto";
import { deriveDiscoverableTweak } from "./mysky/tweak";
import { MAX_REVISION } from "./utils/number";
import { toHexString, uint8ArrayToString } from "./utils/string";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEqualUint8Array(argument: Uint8Array): R;
    }
  }
}

expect.extend({
  // source https://stackoverflow.com/a/60818105/6085242
  toEqualUint8Array(received: Uint8Array, argument: Uint8Array) {
    if (received.length !== argument.length) {
      return { pass: false, message: () => `expected ${received} to equal ${argument}` };
    }
    for (let i = 0; i < received.length; i++) {
      if (received[i] !== argument[i]) {
        return { pass: false, message: () => `expected ${received} to equal ${argument}` };
      }
    }
    return { pass: true, message: () => `expected ${received} not to equal ${argument}` };
  },
});

describe("areEqualUint8Arrays", () => {
  it("should correctly check whether uint8arrays are equal", () => {
    expect(new Uint8Array([0])).toEqualUint8Array(new Uint8Array([0]));
    expect(new Uint8Array([1, 1, 0])).toEqualUint8Array(new Uint8Array([1, 1, 0]));
    expect(new Uint8Array([1, 0, 0])).not.toEqualUint8Array(new Uint8Array([1, 1, 0]));
    expect(new Uint8Array([1, 1, 0])).not.toEqualUint8Array(new Uint8Array([1, 1, 0, 0]));
  });
});

describe("deriveChildSeed", () => {
  it("should correctly derive a child seed", () => {
    // Hard-code expected values to catch any breaking changes.

    const masterSeed = "c1197e1275fbf570d21dde01a00af83ed4a743d1884e4a09cebce0dd21ae254c";
    const seed = "seed";
    const expected = "6140d0d1d8f9e2b759ca7fc96ad3620cd382189f8d46339737e26a2764122b99";

    const childSeed = deriveChildSeed(masterSeed, seed);
    expect(childSeed).toEqual(expected);

    const seed1 = deriveChildSeed(masterSeed, "asd");
    const seed2 = deriveChildSeed(masterSeed, "aa");
    const seed3 = deriveChildSeed(masterSeed, "ds");
    expect(seed1).not.toEqual(seed2);
    expect(seed2).not.toEqual(seed3);
  });
});

describe("encodeBigint", () => {
  const bigints: Array<[bigint, number[]]> = [
    [BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
    [BigInt(255), [255, 0, 0, 0, 0, 0, 0, 0]],
    [BigInt(256), [0, 1, 0, 0, 0, 0, 0, 0]],
    [MAX_REVISION, [255, 255, 255, 255, 255, 255, 255, 255]],
  ];

  it.each(bigints)("should correctly encode bigint %s as %s", (input, encoding) => {
    expect(encodeBigintAsUint64(input)).toEqualUint8Array(new Uint8Array(encoding));
  });

  it("should throw if the bigint is beyond the max revision allowed", () => {
    expect(() => encodeBigintAsUint64(MAX_REVISION + BigInt(1))).toThrowError(
      "Argument 18446744073709551616 does not fit in a 64-bit unsigned integer; exceeds 2^64-1"
    );
  });
});

describe("encodeNumber", () => {
  const numbers: Array<[number, number[]]> = [
    [0, [0, 0, 0, 0, 0, 0, 0, 0]],
    [1, [1, 0, 0, 0, 0, 0, 0, 0]],
    [255, [255, 0, 0, 0, 0, 0, 0, 0]],
    [256, [0, 1, 0, 0, 0, 0, 0, 0]],
  ];

  it.each(numbers)("should correctly encode number %s as %s", (input, encoding) => {
    expect(encodeNumber(input)).toEqualUint8Array(new Uint8Array(encoding));
  });
});

describe("encodeString", () => {
  const strings: Array<[string, number[]]> = [
    ["", [0, 0, 0, 0, 0, 0, 0, 0]],
    ["skynet", [6, 0, 0, 0, 0, 0, 0, 0, 115, 107, 121, 110, 101, 116]],
  ];

  it.each(strings)("should correctly encode string %s as %s", (input, encoding) => {
    expect(encodeString(input)).toEqualUint8Array(new Uint8Array(encoding));
  });
});

describe("genKeyPairFromSeed", () => {
  it("should create an expected keypair from a given seed", () => {
    // Hard-code expected values to catch any breaking changes.
    const seed = "c1197e1275fbf570d21dde01a00af83ed4a743d1884e4a09cebce0dd21ae254c";
    const expectedPublicKey = "f8a7da8324fabb9d57bb32c59c48d4ba304d08ee5f1297a46836cf841da71c80";
    const expectedPrivateKey =
      "c404ff07fba961000dfb25ece7477f45b109b50a5169a45f3fb239343002c1cff8a7da8324fabb9d57bb32c59c48d4ba304d08ee5f1297a46836cf841da71c80";

    const { publicKey, privateKey } = genKeyPairFromSeed(seed);
    expect(publicKey).toEqual(expectedPublicKey);
    expect(privateKey).toEqual(expectedPrivateKey);
  });
});

describe("hashDataKey", () => {
  const keys = [
    ["", "81e47a19e6b29b0a65b9591762ce5143ed30d0261e5d24a3201752506b20f15c"],
    ["skynet", "31c7a4d53ef7bb4c7531181645a0037b9e75c8b1d1285b468ad58bad6262c777"],
  ];

  it.each(keys)("should correctly hash key %s as %s", (input: string, hash: string) => {
    expect(toHexString(hashDataKey(input))).toEqual(hash);
  });

  it("Should work for mySky.setJSON paths", () => {
    const path = "localhost/cert";
    const expected = "852b9478b480488fe2d18286d14c92e997f00e22f5d146627246e633897c314f";

    const dataKey = deriveDiscoverableTweak(path);
    const input = uint8ArrayToString(dataKey);
    const hash = toHexString(hashDataKey(input));
    expect(hash).toEqual(expected);
  });
});

describe("hashRegistryValue", () => {
  it("should match siad for equal input", () => {
    // Hard-code expected values to catch any breaking changes.

    // "h" is the hash generated by siad with the same input parameters
    const h = "788dddf5232807611557a3dc0fa5f34012c2650526ba91d55411a2b04ba56164";
    const hash = hashRegistryEntry({
      datakey: "HelloWorld",
      data: "abc",
      revision: BigInt(123456789),
    });

    expect(toHexString(hash)).toEqual(h);
  });

  it("should match siad for equal input when datakey and data include unicode", () => {
    // Hard-code expected values to catch any breaking changes.

    // "h" is the hash generated by siad with the same input parameters
    const h = "ff3b430675a0666e7461bc34aec9f66e21183d061f0b8232dd28ca90cc6ea5ca";
    const hash = hashRegistryEntry({
      datakey: "HelloWorld π",
      data: "abc π",
      revision: BigInt(123456789),
    });

    expect(toHexString(hash)).toEqual(h);
  });
});
