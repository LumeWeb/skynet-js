import { BASE32_ENCODED_SKYLINK_SIZE, BASE64_ENCODED_SKYLINK_SIZE } from "./sia.js";
import { decodeSkylinkBase32, decodeSkylinkBase64, encodeSkylinkBase32, encodeSkylinkBase64 } from "../utils/encoding.js";
import { trimUriPrefix } from "../utils/string.js";
import { URI_SKYNET_PREFIX } from "../utils/url.js";
import { validateString, validateStringLen } from "../utils/validation.js";

/**
 * Converts the given base64 skylink to base32.
 *
 * @param skylink - The base64 skylink.
 * @returns - The converted base32 skylink.
 */
export function convertSkylinkToBase32(skylink: string): string {
  skylink = trimUriPrefix(skylink, URI_SKYNET_PREFIX);
  validateStringLen("skylink", skylink, "parameter", BASE64_ENCODED_SKYLINK_SIZE);

  const bytes = decodeSkylinkBase64(skylink);
  return encodeSkylinkBase32(bytes);
}

/**
 * Converts the given base32 skylink to base64.
 *
 * @param skylink - The base32 skylink.
 * @returns - The converted base64 skylink.
 */
export function convertSkylinkToBase64(skylink: string): string {
  skylink = trimUriPrefix(skylink, URI_SKYNET_PREFIX);
  validateStringLen("skylink", skylink, "parameter", BASE32_ENCODED_SKYLINK_SIZE);

  const bytes = decodeSkylinkBase32(skylink);
  return encodeSkylinkBase64(bytes);
}

/**
 * Formats the skylink by adding the sia: prefix.
 *
 * @param skylink - The skylink.
 * @returns - The formatted skylink.
 */
export function formatSkylink(skylink: string): string {
  validateString("skylink", skylink, "parameter");

  if (skylink === "") {
    return skylink;
  }
  if (!skylink.startsWith(URI_SKYNET_PREFIX)) {
    skylink = `${URI_SKYNET_PREFIX}${skylink}`;
  }
  return skylink;
}
