import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { cachedApiFetch, clearApiCache } from "../src/js/state/cache.js";

describe("Upstream API Caching & Spam Prevention", () => {
  let originalFetch;
  let fetchCallCount = 0;

  beforeEach(() => {
    clearApiCache();
    fetchCallCount = 0;
    originalFetch = globalThis.fetch;
  });

  it("should cache successful GET requests and prevent redundant network calls", async () => {
    globalThis.fetch = async url => {
      fetchCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ endpoint: url, count: fetchCallCount })
      };
    };

    try {
      const url = "https://api.sleeper.app/v1/state/nfl";
      const res1 = await cachedApiFetch(url, { ttlMs: 60000 });
      assert.equal(fetchCallCount, 1);
      assert.equal(res1.endpoint, url);

      // Second request to same URL should hit cache
      const res2 = await cachedApiFetch(url, { ttlMs: 60000 });
      assert.equal(fetchCallCount, 1);
      assert.deepEqual(res2, res1);

      // Third request with forceRefresh should bypass cache
      const res3 = await cachedApiFetch(url, { forceRefresh: true, ttlMs: 60000 });
      assert.equal(fetchCallCount, 2);
      assert.equal(res3.count, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should respect TTL expiration for cached endpoints", async () => {
    globalThis.fetch = async () => {
      fetchCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ value: fetchCallCount })
      };
    };

    try {
      const url = "https://api.sleeper.app/v1/user/test_user";
      // 1ms TTL
      await cachedApiFetch(url, { ttlMs: 1 });
      assert.equal(fetchCallCount, 1);

      // Wait 10ms to ensure TTL expires
      await new Promise(r => setTimeout(r, 10));

      await cachedApiFetch(url, { ttlMs: 1 });
      assert.equal(fetchCallCount, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should isolate cache entries by URL", async () => {
    globalThis.fetch = async url => {
      fetchCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ url })
      };
    };

    try {
      const urlA = "https://api.sleeper.app/v1/league/100/rosters";
      const urlB = "https://api.sleeper.app/v1/league/200/rosters";

      await cachedApiFetch(urlA, { ttlMs: 60000 });
      assert.equal(fetchCallCount, 1);

      await cachedApiFetch(urlB, { ttlMs: 60000 });
      assert.equal(fetchCallCount, 2);

      await cachedApiFetch(urlA, { ttlMs: 60000 });
      assert.equal(fetchCallCount, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw on HTTP error responses without caching", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 404
    });

    try {
      await assert.rejects(
        () => cachedApiFetch("https://api.sleeper.app/v1/user/nonexistent", { ttlMs: 60000 }),
        /API error \(404\)/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
