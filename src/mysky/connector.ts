/* istanbul ignore file: Much of this functionality is only testable from a browser */

import { Connection, ParentHandshake, WindowMessenger } from "post-me";
import { createIframe, defaultHandshakeAttemptsInterval, defaultHandshakeMaxAttempts } from "skynet-mysky-utils";

import { SkynetClient } from "../client.js";
import { addUrlQuery } from "../utils/url.js";

/**
 * Custom connector options.
 *
 * @property [dev] - Whether to use the dev build of mysky. It is functionally equivalent to the default production mysky, except that all permissions are granted automatically and data lives in a separate sandbox from production.
 * @property [debug] - Whether to tell mysky and DACs to print debug messages.
 * @property [alpha] - Whether to use the alpha build of mysky. This is the build where development occurs and it can be expected to break. This takes precedence over the 'dev' option if that is also set.
 * @property [handshakeMaxAttempts=150] - The amount of handshake attempts to make when starting a connection.
 * @property [handshakeAttemptsInterval=100] - The time interval to wait between handshake attempts.
 */
export type CustomConnectorOptions = {
  dev?: boolean;
  debug?: boolean;
  alpha?: boolean;
  handshakeMaxAttempts?: number;
  handshakeAttemptsInterval?: number;
};

export const DEFAULT_CONNECTOR_OPTIONS = {
  dev: false,
  debug: false,
  alpha: false,
  handshakeMaxAttempts: defaultHandshakeMaxAttempts,
  handshakeAttemptsInterval: defaultHandshakeAttemptsInterval,
};

/**
 * The object that connects to a child iframe and keeps track of information
 * about it.
 */
export class Connector {
  /**
   * Creates a `Connector`.
   *
   * @param url - The iframe URL.
   * @param client - The Skynet Client.
   * @param childFrame - The iframe handle.
   * @param connection - The postmessage handshake connection.
   * @param options - The custom options.
   */
  constructor(
    public url: string,
    public client: SkynetClient,
    public childFrame: HTMLIFrameElement,
    public connection: Connection,
    public options: CustomConnectorOptions
  ) {}

  // Static initializer

  /**
   * Initializes a `Connector` instance.
   *
   * @param client - The Skynet Client.
   * @param domain - The MySky domain to open.
   * @param [customOptions] - Additional settings that can optionally be set.
   * @returns - The `Connector`.
   */
  static async init(client: SkynetClient, domain: string, customOptions?: CustomConnectorOptions): Promise<Connector> {
    const opts = { ...DEFAULT_CONNECTOR_OPTIONS, ...customOptions };

    // Get the URL for the domain on the current portal.
    let domainUrl = await client.getFullDomainUrl(domain);
    if (opts.dev) {
      domainUrl = addUrlQuery(domainUrl, { dev: "true" });
    }
    if (opts.debug) {
      domainUrl = addUrlQuery(domainUrl, { debug: "true" });
    }
    if (opts.alpha) {
      domainUrl = addUrlQuery(domainUrl, { alpha: "true" });
    }

    // Create the iframe.

    const childFrame = createIframe(domainUrl, domainUrl);
    // The frame window should always exist. Sanity check + make TS happy.
    if (!childFrame.contentWindow) {
      throw new Error("'childFrame.contentWindow' was null");
    }
    const childWindow = childFrame.contentWindow;

    // Connect to the iframe.

    const messenger = new WindowMessenger({
      localWindow: window,
      remoteWindow: childWindow,
      remoteOrigin: "*",
    });
    const connection = await ParentHandshake(messenger, {}, opts.handshakeMaxAttempts, opts.handshakeAttemptsInterval);

    // Construct the component connector.

    return new Connector(domainUrl, client, childFrame, connection, opts);
  }

  /**
   * Calls the given method with the given arguments.
   *
   * @param method - The remote method to call over the connection.
   * @param args - The list of optional arguments.
   * @returns - The result of the call.
   */
  async call(method: string, ...args: unknown[]): Promise<unknown> {
    return this.connection.remoteHandle().call(method, ...args);
  }
}
