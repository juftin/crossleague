/** Tests React migration interaction contracts that do not require a browser renderer. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getActiveRecords, useCrossLeagueStore } from "../src/js/state/useCrossLeagueStore.js";

/** Restores a predictable store state for each interaction test. */
function resetStore() {
  useCrossLeagueStore.setState({
    activeTab: "awards",
    isSettingsOpen: false,
    isLuckModalOpen: false,
    leaguesMap: {
      alpha: { id: "alpha", name: "Alpha", totalRosters: 10 },
      beta: { id: "beta", name: "Beta", totalRosters: 12 }
    },
    rawRecords: [
      { id: "a", leagueId: "alpha", points: 100 },
      { id: "b", leagueId: "beta", points: 90 }
    ],
    selectedLeagueIds: ["alpha", "beta"]
  });
}

describe("React settings and league-filter interactions", () => {
  it("opens and closes the settings menu through the shared store", () => {
    resetStore();
    const store = useCrossLeagueStore.getState();

    store.openSettingsModal();
    assert.equal(useCrossLeagueStore.getState().isSettingsOpen, true);

    store.closeSettingsModal();
    assert.equal(useCrossLeagueStore.getState().isSettingsOpen, false);
  });

  it("keeps the legacy settings toggle aligned with the React menu state", () => {
    resetStore();
    const store = useCrossLeagueStore.getState();

    store.toggleSettingsDropdown();
    assert.equal(useCrossLeagueStore.getState().isSettingsOpen, true);

    store.toggleSettingsDropdown(false);
    assert.equal(useCrossLeagueStore.getState().isSettingsOpen, false);
  });

  it("filters records when a league is deselected and restores them when selected", () => {
    resetStore();
    const store = useCrossLeagueStore.getState();

    store.toggleSelectedLeagueId("beta");
    assert.deepEqual(
      getActiveRecords().map(record => record.id),
      ["a"]
    );

    store.toggleSelectedLeagueId("beta");
    assert.deepEqual(
      getActiveRecords().map(record => record.id),
      ["a", "b"]
    );
  });

  it("uses the shared active-tab state for desktop and mobile navigation", () => {
    resetStore();
    const store = useCrossLeagueStore.getState();

    store.setActiveTab("players", false);
    assert.equal(useCrossLeagueStore.getState().activeTab, "players");

    store.setActiveTab("luck", false);
    assert.equal(useCrossLeagueStore.getState().activeTab, "luck");
  });

  it("opens and closes the Luck Index methodology modal", () => {
    resetStore();
    const store = useCrossLeagueStore.getState();

    store.openLuckModal();
    assert.equal(useCrossLeagueStore.getState().isLuckModalOpen, true);

    store.closeLuckModal();
    assert.equal(useCrossLeagueStore.getState().isLuckModalOpen, false);
  });

  it("isolates and preserves platform-scoped league IDs and usernames when switching platforms", () => {
    resetStore();
    const store = useCrossLeagueStore.getState();

    // Set initial Sleeper state with custom leagues and username
    store.setPlatform("sleeper");
    store.setUserName("sleeper_user");
    store.setCustomLeagueIds(["11223344"]);
    assert.equal(useCrossLeagueStore.getState().platform, "sleeper");
    assert.equal(useCrossLeagueStore.getState().userName, "sleeper_user");
    assert.deepEqual(useCrossLeagueStore.getState().customLeagueIds, ["11223344"]);

    // Switch to ESPN: Sleeper league ID / user should not leak to ESPN
    store.setPlatform("espn");
    assert.equal(useCrossLeagueStore.getState().platform, "espn");
    assert.equal(useCrossLeagueStore.getState().syncType, "leagues");
    assert.deepEqual(useCrossLeagueStore.getState().customLeagueIds, []);
    assert.equal(useCrossLeagueStore.getState().userName, "");

    // Add ESPN league ID
    store.setCustomLeagueIds(["1664455"]);
    assert.deepEqual(useCrossLeagueStore.getState().customLeagueIds, ["1664455"]);

    // Switch back to Sleeper: Sleeper custom leagues and username should be restored, ESPN league ID should not leak
    store.setPlatform("sleeper");
    assert.equal(useCrossLeagueStore.getState().platform, "sleeper");
    assert.equal(useCrossLeagueStore.getState().userName, "sleeper_user");
    assert.deepEqual(useCrossLeagueStore.getState().customLeagueIds, ["11223344"]);

    // Switch back to ESPN: ESPN league ID should be restored, Sleeper league ID should not leak
    store.setPlatform("espn");
    assert.equal(useCrossLeagueStore.getState().platform, "espn");
    assert.equal(useCrossLeagueStore.getState().syncType, "leagues");
    assert.deepEqual(useCrossLeagueStore.getState().customLeagueIds, ["1664455"]);
    assert.equal(useCrossLeagueStore.getState().userName, "");
  });
});
