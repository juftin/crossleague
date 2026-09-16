import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Client-Side Pagination Logic", () => {
  const computePagination = (totalCount, pageSize, requestedPage) => {
    const size = pageSize === Infinity ? totalCount : pageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    let curPage = requestedPage;
    if (curPage > totalPages) curPage = totalPages;
    if (curPage < 1) curPage = 1;
    const startIdx = (curPage - 1) * size;
    const endIdx = Math.min(startIdx + size, totalCount);
    return { totalPages, curPage, startIdx, endIdx };
  };

  it("should handle standard 25-item page slicing", () => {
    const result = computePagination(60, 25, 1);
    assert.equal(result.totalPages, 3);
    assert.equal(result.curPage, 1);
    assert.equal(result.startIdx, 0);
    assert.equal(result.endIdx, 25);
  });

  it("should calculate correct offsets for page 2", () => {
    const result = computePagination(60, 25, 2);
    assert.equal(result.totalPages, 3);
    assert.equal(result.curPage, 2);
    assert.equal(result.startIdx, 25);
    assert.equal(result.endIdx, 50);
  });

  it("should clamp endIdx for final partial page", () => {
    const result = computePagination(60, 25, 3);
    assert.equal(result.totalPages, 3);
    assert.equal(result.curPage, 3);
    assert.equal(result.startIdx, 50);
    assert.equal(result.endIdx, 60);
  });

  it("should clamp requested page that exceeds total pages", () => {
    const result = computePagination(60, 25, 10);
    assert.equal(result.curPage, 3);
    assert.equal(result.startIdx, 50);
    assert.equal(result.endIdx, 60);
  });

  it("should handle 0 items gracefully", () => {
    const result = computePagination(0, 25, 1);
    assert.equal(result.totalPages, 1);
    assert.equal(result.curPage, 1);
    assert.equal(result.startIdx, 0);
    assert.equal(result.endIdx, 0);
  });

  it("should handle 'All' (Infinity) page size option", () => {
    const result = computePagination(150, Infinity, 1);
    assert.equal(result.totalPages, 1);
    assert.equal(result.curPage, 1);
    assert.equal(result.startIdx, 0);
    assert.equal(result.endIdx, 150);
  });
});
