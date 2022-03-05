import { SkynetClient } from "../client.js";
import { trimForwardSlash, trimSuffix } from "../utils/string.js";
import { getFullDomainUrlForPortal, extractDomainForPortal, ensureUrlPrefix } from "../utils/url.js";

/**
 * Constructs the full URL for the given component domain.
 *
 * Examples:
 *
 * ("dac.hns") => "https://dac.hns.siasky.net"
 *
 * @param this - SkynetClient
 * @param domain - Component domain.
 * @returns - The full URL for the component.
 */
export async function getFullDomainUrl(this: SkynetClient, domain: string): Promise<string> {
  const portalUrl = await this.portalUrl();

  return getFullDomainUrlForPortal(portalUrl, domain);
}

/**
 * Gets the URL for the current skapp on the preferred portal, if we're not on
 * the preferred portal already.
 *
 * @param client - The Skynet client.
 * @param currentUrl - The current page URL.
 * @param preferredPortalUrl - The preferred portal URL.
 * @returns - The URL for the current skapp on the preferred portal.
 */
export async function getRedirectUrlOnPreferredPortal(
  client: SkynetClient,
  currentUrl: string,
  preferredPortalUrl: string
): Promise<string> {
  // Get the current skapp on the preferred portal.
  const skappDomain = await client.extractDomain(currentUrl);
  return getFullDomainUrlForPortal(preferredPortalUrl, skappDomain);
}

/**
 * Extracts the domain from the current portal URL. Will take into account the
 * server domain if it is found in the current portal URL.
 *
 * Examples:
 *
 * ("dac.hns.siasky.net") => "dac.hns"
 * ("dac.hns.us-va-1.siasky.net") => "dac.hns"
 *
 * @param this - SkynetClient
 * @param fullDomain - Full URL.
 * @returns - The extracted domain.
 */
export async function extractDomain(this: SkynetClient, fullDomain: string): Promise<string> {
  fullDomain = trimForwardSlash(fullDomain);

  // Check if the full domain contains a specific portal server. In that case,
  // the extracted subdomain should not include the server.
  // TODO: Could consolidate this and `resolvePortalUrl` into one network request.
  const portalServerUrl = trimForwardSlash(await this.resolvePortalServerUrl());
  // Get the portal server domain.
  let portalServerDomain;
  try {
    // Try to get the domain from a full URL.
    const portalServerUrlObj = new URL(portalServerUrl);
    portalServerDomain = portalServerUrlObj.hostname;
  } catch (_) {
    // If not a full URL, assume it is already a domain.
    portalServerDomain = portalServerUrl;
  }
  if (fullDomain.endsWith(portalServerDomain)) {
    return extractDomainForPortal(portalServerUrl, fullDomain);
  }

  // Use the regular portal domain to extract out the subdomain.
  const portalUrl = await this.resolvePortalUrl();
  return extractDomainForPortal(portalUrl, fullDomain);
}

/* istanbul ignore next */
/**
 * Create a new popup window. From SkyID.
 *
 * @param url - The URL to open.
 * @param winName - The name of the popup window.
 * @param w - The width of the popup window.
 * @param h - the height of the popup window.
 * @returns - The window.
 * @throws - Will throw if the window could not be opened.
 */
export function popupCenter(url: string, winName: string, w: number, h: number): Window {
  if (!window.top) {
    throw new Error("Current window is not valid");
  }

  url = ensureUrlPrefix(url);

  const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
  const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;

  const newWindow = window.open(
    url,
    winName,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
  );
  if (!newWindow) {
    throw new Error("Could not open window");
  }

  if (newWindow.focus) {
    newWindow.focus();
  }
  return newWindow;
}

// TODO: Handle edge cases with specific servers as preferred portal?
/**
 * Returns whether we should redirect from the current portal to the preferred
 * portal. The protocol prefixes are allowed to be different and there can be
 * other differences like a trailing slash.
 *
 * @param currentDomain - The current domain.
 * @param preferredPortalUrl - The preferred portal URL.
 * @returns - Whether the two URLs are equal for the purposes of redirecting.
 */
export function shouldRedirectToPreferredPortalUrl(currentDomain: string, preferredPortalUrl: string): boolean {
  // Strip protocol and trailing slash (case-insensitive).
  currentDomain = trimSuffix(currentDomain.replace(/https:\/\/|http:\/\//i, ""), "/");
  preferredPortalUrl = trimSuffix(preferredPortalUrl.replace(/https:\/\/|http:\/\//i, ""), "/");
  return !currentDomain.endsWith(preferredPortalUrl);
}
