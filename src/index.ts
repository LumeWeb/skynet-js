/* istanbul ignore file */

// Main exports.

export { SkynetClient } from "./client.js";
export {
  HASH_LENGTH,
  deriveChildSeed,
  genKeyPairAndSeed,
  genKeyPairFromSeed,
  PUBLIC_KEY_LENGTH,
  PRIVATE_KEY_LENGTH,
  SIGNATURE_LENGTH,
} from "./crypto.js";
export { getSkylinkUrlForPortal } from "./download.js";
export {
  DacLibrary,
  MAX_ENTRY_LENGTH,
  MySky,
  MYSKY_DOMAIN,
  MYSKY_DEV_DOMAIN,
  // Deprecated.
  mySkyDevDomain,
  mySkyDomain,
} from "./mysky/index.js";
export {
  decryptJSONFile,
  deriveEncryptedFileKeyEntropy,
  deriveEncryptedFileTweak,
  deriveEncryptedPathSeed,
  encryptJSONFile,
  ENCRYPTED_JSON_RESPONSE_VERSION,
  ENCRYPTION_PATH_SEED_DIRECTORY_LENGTH,
  ENCRYPTION_PATH_SEED_FILE_LENGTH,
  // Deprecated.
  deriveEncryptedFileSeed,
} from "./mysky/encrypted_files.js";
export { deriveDiscoverableFileTweak } from "./mysky/tweak.js";
export { getEntryLink, getEntryUrlForPortal, signEntry, validateRegistryProof } from "./registry.js";
// Have to export `ExecuteRequestError` as a value instead of as a type or the
// consumer cannot use `instanceof`.
export { ExecuteRequestError } from "./request.js";
export { DELETION_ENTRY_DATA, getOrCreateSkyDBRegistryEntry } from "./skydb_v2.js";
export { convertSkylinkToBase32, convertSkylinkToBase64 } from "./skylink/format.js";
export { parseSkylink } from "./skylink/parse.js";
export { isSkylinkV1, isSkylinkV2 } from "./skylink/sia.js";
export { getRelativeFilePath, getRootDirectory } from "./utils/file.js";
export { MAX_REVISION } from "./utils/number.js";
export { stringToUint8ArrayUtf8, uint8ArrayToStringUtf8 } from "./utils/string.js";
export {
  defaultPortalUrl,
  DEFAULT_SKYNET_PORTAL_URL,
  extractDomainForPortal,
  getFullDomainUrlForPortal,
  URI_HANDSHAKE_PREFIX,
  URI_SKYNET_PREFIX,
  // Deprecated.
  defaultSkynetPortalUrl,
  uriHandshakePrefix,
  uriSkynetPrefix,
} from "./utils/url.js";

// Re-export Permission API.

export {
  Permission,
  PermCategory,
  PermType,
  PermRead,
  PermWrite,
  PermHidden,
  PermDiscoverable,
  PermLegacySkyID,
} from "skynet-mysky-utils";

// Export types.

export type { CustomClientOptions, RequestConfig } from "./client.js";
export type { KeyPair, KeyPairAndSeed, Signature } from "./crypto.js";
export type { CustomDownloadOptions, ResolveHnsResponse } from "./download.js";
export type { CustomConnectorOptions, EntryData } from "./mysky/index.js";
export type { EncryptedJSONResponse } from "./mysky/encrypted_files.js";
export type { CustomPinOptions, PinResponse } from "./pin.js";
export type {
  CustomGetEntryOptions,
  CustomSetEntryOptions,
  CustomValidateRegistryProofOptions,
  SignedRegistryEntry,
  RegistryEntry,
  RegistryProofEntry,
} from "./registry.js";
export type {
  CustomGetJSONOptions,
  CustomSetJSONOptions,
  CustomSetEntryDataOptions,
  JSONResponse,
  RawBytesResponse,
} from "./skydb_v2.js";
export type { ParseSkylinkOptions } from "./skylink/parse.js";
export type { CustomUploadOptions, UploadRequestResponse } from "./upload.js";
export type { JsonData } from "./utils/types.js";
