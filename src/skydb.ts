import { pki } from "node-forge";
import { SkynetClient } from "./client";
import { CustomGetEntryOptions, RegistryEntry, SignedRegistryEntry } from "./registry";
import { trimUriPrefix, uriSkynetPrefix, toHexString, BaseCustomOptions } from "./utils";
import { Buffer } from "buffer";

/**
 * Custom get JSON options.
 */
export type CustomGetJSONOptions = BaseCustomOptions & CustomGetEntryOptions;

/**
 * Custom set JSON options.
 */
export type CustomSetJSONOptions = BaseCustomOptions;

/**
 * Gets the JSON object corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The returned JSON and revision number.
 * @throws - Will throw if the returned signature does not match the returned entry, or if the skylink in the entry is invalid.
 */
export async function getJSON(
  this: SkynetClient,
  publicKey: string,
  dataKey: string,
  customOptions?: CustomGetJSONOptions
): Promise<{ data: Record<string, unknown>; revision: number } | null> {
  const opts = {
    ...this.customOptions,
    ...customOptions,
  };

  // lookup the registry entry
  const { entry }: { entry: RegistryEntry } = await this.registry.getEntry(publicKey, dataKey, opts);
  if (entry === null) {
    return null;
  }

  // Download the data in that Skylink.
  // TODO: Replace with download request method.
  const skylink = entry.data;

  const response = await this.executeRequest({
    ...opts,
    method: "get",
    url: this.getSkylinkUrl(skylink),
  });

  return { data: response.data, revision: entry.revision };
}

/**
 * Sets a JSON object at the registry entry corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param json - The JSON data to set.
 * @param [revision] - The revision number for the data entry.
 * @param [customOptions] - Additional settings that can optionally be set.
 */
export async function setJSON(
  this: SkynetClient,
  privateKey: string,
  dataKey: string,
  json: Record<string, unknown>,
  revision?: number,
  customOptions?: CustomSetJSONOptions
): Promise<void> {
  const opts = {
    ...this.customOptions,
    ...customOptions,
  };

  const privateKeyBuffer = Buffer.from(privateKey, "hex");

  // Upload the data to acquire its skylink
  // TODO: Replace with upload request method.
  const file = new File([JSON.stringify(json)], dataKey, { type: "application/json" });
  const { skylink } = await this.uploadFileRequest(file, opts);

  if (revision === undefined) {
    // fetch the current value to find out the revision.
    let entry: SignedRegistryEntry;
    try {
      const publicKey = pki.ed25519.publicKeyFromPrivateKey({ privateKey: privateKeyBuffer });
      entry = await this.registry.getEntry(toHexString(publicKey), dataKey, opts);
      revision = entry.entry.revision + 1;
    } catch (err) {
      revision = 0;
    }
  }

  // build the registry value
  const entry: RegistryEntry = {
    datakey: dataKey,
    data: trimUriPrefix(skylink, uriSkynetPrefix),
    revision,
  };

  // update the registry
  await this.registry.setEntry(privateKey, entry);
}
