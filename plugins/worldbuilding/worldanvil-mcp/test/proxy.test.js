/**
 * Proxy Support Tests
 *
 * Tests for optional Cloudflare Worker proxy support.
 * When configured with WA_PROXY_URL, the client should:
 * - Route requests through the proxy instead of worldanvil.com
 * - Only require authToken (proxy injects appKey)
 * - Still work with direct mode (both keys, no proxy)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorldAnvilClient } from "../src/api-client.js";

describe("Proxy Support", () => {
  // Save and restore env vars to isolate tests
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear WA-related env vars before each test
    delete process.env.WA_APP_KEY;
    delete process.env.WA_AUTH_TOKEN;
    delete process.env.WA_PROXY_URL;
  });

  afterEach(() => {
    // Restore original env after each test
    process.env = { ...originalEnv };
  });

  describe("Constructor - Direct Mode (existing behavior)", () => {
    it("should use default proxy when no appKey or proxyUrl provided", () => {
      const client = new WorldAnvilClient({
        authToken: "test-auth-token",
        // missing appKey, no proxy - should use default proxy
      });

      expect(client.proxyUrl).toBe("https://worldanvil-proxy.onrender.com");
      expect(client.appKey).toBeUndefined();
    });

    it("should work with both appKey and authToken", () => {
      const client = new WorldAnvilClient({
        appKey: "test-app-key",
        authToken: "test-auth-token",
      });

      expect(client.appKey).toBe("test-app-key");
      expect(client.authToken).toBe("test-auth-token");
      expect(client.proxyUrl).toBeUndefined();
    });

    it("should still require authToken even with appKey", () => {
      expect(
        () =>
          new WorldAnvilClient({
            appKey: "test-app-key",
            // missing authToken
          }),
      ).toThrow(/WA_AUTH_TOKEN.*required/i);
    });
  });

  describe("Constructor - Proxy Mode", () => {
    it("should accept proxyUrl without appKey", () => {
      const client = new WorldAnvilClient({
        proxyUrl: "https://my-proxy.workers.dev",
        authToken: "test-auth-token",
      });

      expect(client.proxyUrl).toBe("https://my-proxy.workers.dev");
      expect(client.authToken).toBe("test-auth-token");
      expect(client.appKey).toBeUndefined();
    });

    it("should still require authToken with proxyUrl", () => {
      expect(
        () =>
          new WorldAnvilClient({
            proxyUrl: "https://my-proxy.workers.dev",
            // missing authToken
          }),
      ).toThrow(/WA_AUTH_TOKEN.*required/i);
    });

    it("should prefer direct mode when both appKey and proxyUrl provided", () => {
      // If user provides both, use direct mode (more efficient)
      const client = new WorldAnvilClient({
        appKey: "test-app-key",
        authToken: "test-auth-token",
        proxyUrl: "https://my-proxy.workers.dev",
      });

      expect(client.appKey).toBe("test-app-key");
      // proxyUrl should be ignored when appKey is present
      expect(client.proxyUrl).toBeUndefined();
    });

    it("should normalize proxy URL (strip trailing slash)", () => {
      const client = new WorldAnvilClient({
        proxyUrl: "https://my-proxy.workers.dev/",
        authToken: "test-auth-token",
      });

      expect(client.proxyUrl).toBe("https://my-proxy.workers.dev");
    });
  });

  describe("Request Routing", () => {
    // We'll mock the actual HTTP calls to test routing logic

    it("should use worldanvil.com hostname in direct mode", () => {
      const client = new WorldAnvilClient({
        appKey: "test-app-key",
        authToken: "test-auth-token",
      });

      expect(client.apiBase).toBe("www.worldanvil.com");
    });

    it("should use proxy hostname in proxy mode", () => {
      const client = new WorldAnvilClient({
        proxyUrl: "https://my-proxy.workers.dev",
        authToken: "test-auth-token",
      });

      // The client should parse the proxy URL and use its hostname
      expect(client.apiBase).toBe("my-proxy.workers.dev");
    });

    it("should use empty apiPath in proxy mode (proxy handles /api/external/boromir)", () => {
      const client = new WorldAnvilClient({
        proxyUrl: "https://my-proxy.workers.dev",
        authToken: "test-auth-token",
      });

      // Proxy URL already points to the right endpoint structure
      expect(client.apiPath).toBe("");
    });
  });

  describe("Header Handling", () => {
    it("should include both headers in direct mode", async () => {
      const client = new WorldAnvilClient({
        appKey: "test-app-key",
        authToken: "test-auth-token",
      });

      // Check that the client is configured for both headers
      expect(client.appKey).toBe("test-app-key");
      expect(client.authToken).toBe("test-auth-token");
    });

    it("should only use authToken header in proxy mode", () => {
      const client = new WorldAnvilClient({
        proxyUrl: "https://my-proxy.workers.dev",
        authToken: "test-auth-token",
      });

      // appKey should not be set - proxy injects it
      expect(client.appKey).toBeUndefined();
      expect(client.authToken).toBe("test-auth-token");
    });
  });

  describe("Environment Variable Support", () => {
    it("should read WA_PROXY_URL from environment", () => {
      process.env.WA_PROXY_URL = "https://env-proxy.workers.dev";
      process.env.WA_AUTH_TOKEN = "env-auth-token";

      const client = new WorldAnvilClient({});

      expect(client.proxyUrl).toBe("https://env-proxy.workers.dev");
      expect(client.authToken).toBe("env-auth-token");
    });

    it("should prefer config over environment", () => {
      process.env.WA_PROXY_URL = "https://env-proxy.workers.dev";
      process.env.WA_AUTH_TOKEN = "env-auth-token";

      const client = new WorldAnvilClient({
        proxyUrl: "https://config-proxy.workers.dev",
        authToken: "config-auth-token",
      });

      expect(client.proxyUrl).toBe("https://config-proxy.workers.dev");
      expect(client.authToken).toBe("config-auth-token");
    });
  });
});
