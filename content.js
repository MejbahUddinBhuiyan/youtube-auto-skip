(() => {
  "use strict";

  // Prevent duplicate setup within this content-script environment.
  if (globalThis.__youtubeAutoSkipStarted) {
    return;
  }

  globalThis.__youtubeAutoSkipStarted = true;

  // Assumptions about YouTube's Skip ad controls.
  // These selectors have NOT been verified on the current live interface.
  const SKIP_SELECTORS = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button"
  ].join(", ");

  const SCAN_DELAY_MS = 150;

  let enabled = false;
  let scanTimer = null;
  let settingRevision = 0;

  // Track controls already clicked during their current availability.
  const clickedButtons = new Set();

  function getButton(candidate) {
    if (candidate.matches("button, [role='button']")) {
      return candidate;
    }

    // Some interfaces put the Skip class on a wrapper.
    return candidate.querySelector("button, [role='button']");
  }

  function isAvailable(button, player) {
    if (
      !(button instanceof HTMLElement) ||
      !button.isConnected ||
      !player.contains(button)
    ) {
      return false;
    }

    if (
      button.matches(":disabled") ||
      button.hasAttribute("disabled")
    ) {
      return false;
    }

    // Check the control and its ancestors for hidden/disabled states.
    for (
      let element = button;
      element;
      element = element.parentElement
    ) {
      if (
        element.hidden ||
        element.hasAttribute("inert") ||
        element.hasAttribute("disabled") ||
        element.getAttribute("aria-disabled") === "true" ||
        element.getAttribute("aria-hidden") === "true"
      ) {
        return false;
      }

      const style = getComputedStyle(element);

      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse" ||
        Number(style.opacity) === 0 ||
        style.pointerEvents === "none"
      ) {
        return false;
      }
    }

    const rectangle = button.getBoundingClientRect();

    if (
      button.getClientRects().length === 0 ||
      rectangle.width <= 0 ||
      rectangle.height <= 0
    ) {
      return false;
    }

    // Require the control to be within the viewport.
    if (
      rectangle.bottom <= 0 ||
      rectangle.right <= 0 ||
      rectangle.top >= window.innerHeight ||
      rectangle.left >= window.innerWidth
    ) {
      return false;
    }

    // Avoid clicking through another element covering the button.
    const x =
      (Math.max(0, rectangle.left) +
        Math.min(window.innerWidth, rectangle.right)) / 2;

    const y =
      (Math.max(0, rectangle.top) +
        Math.min(window.innerHeight, rectangle.bottom)) / 2;

    const elementAtPoint = document.elementFromPoint(x, y);

    return (
      elementAtPoint !== null &&
      (elementAtPoint === button || button.contains(elementAtPoint))
    );
  }

  function scan() {
    scanTimer = null;

    if (!enabled) {
      return;
    }

    const player = document.getElementById("movie_player");

    // An additional guard: only act while YouTube marks an ad as showing.
    if (!player || !player.classList.contains("ad-showing")) {
      clickedButtons.clear();
      return;
    }

    const availableButtons = new Set();

    for (const candidate of player.querySelectorAll(SKIP_SELECTORS)) {
      const button = getButton(candidate);

      if (button && isAvailable(button, player)) {
        availableButtons.add(button);
      }
    }

    // Allow a reused button to be clicked again after it has become
    // unavailable and is later made available for another ad.
    for (const button of clickedButtons) {
      if (!availableButtons.has(button)) {
        clickedButtons.delete(button);
      }
    }

    for (const button of availableButtons) {
      if (clickedButtons.has(button)) {
        continue;
      }

      // Check again immediately before clicking.
      if (
        !enabled ||
        !player.classList.contains("ad-showing") ||
        !isAvailable(button, player)
      ) {
        continue;
      }

      // Mark before clicking so resulting DOM changes cannot cause
      // another click on the same available control.
      clickedButtons.add(button);

      try {
        button.click();
        console.debug(
          "[YouTube Auto Skip] Clicked an available Skip ad control."
        );
      } catch (error) {
        console.error("[YouTube Auto Skip] Click failed:", error);
      }

      // At most one click per scan.
      break;
    }
  }

  function scheduleScan() {
    if (!enabled || scanTimer !== null) {
      return;
    }

    // A one-off delay groups rapid mutations together.
    // This is not a repeating polling loop.
    scanTimer = window.setTimeout(scan, SCAN_DELAY_MS);
  }

  function mutationTouchesPlayer(mutation) {
    const target = mutation.target;

    if (
      target instanceof Element &&
      target.closest("#movie_player")
    ) {
      return true;
    }

    // Detect the player being added, removed, or replaced during navigation.
    return [...mutation.addedNodes, ...mutation.removedNodes].some(
      (node) =>
        node instanceof Element &&
        (
          node.id === "movie_player" ||
          node.querySelector("#movie_player") !== null
        )
    );
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some(mutationTouchesPlayer)) {
      scheduleScan();
    }
  });

  function applySetting(value) {
    enabled = value !== false;

    observer.disconnect();

    if (scanTimer !== null) {
      window.clearTimeout(scanTimer);
      scanTimer = null;
    }

    if (!enabled) {
      return;
    }

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "hidden",
        "disabled",
        "aria-disabled",
        "aria-hidden",
        "inert"
      ]
    });

    scheduleScan();
  }

  // Every open YouTube tab receives changes to the saved setting.
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName !== "local" ||
      !Object.prototype.hasOwnProperty.call(changes, "enabled")
    ) {
      return;
    }

    settingRevision += 1;
    applySetting(changes.enabled.newValue);
  });

  // The observer remains attached across YouTube's in-page navigation.
  // This event also requests a fresh scan after navigation finishes.
  document.addEventListener("yt-navigate-finish", scheduleScan);

  document.addEventListener("visibilitychange", scheduleScan);
  document.addEventListener("fullscreenchange", scheduleScan);
  window.addEventListener("resize", scheduleScan);
  window.addEventListener("focus", scheduleScan);

  async function initialize() {
    const revisionBeforeRead = settingRevision;

    try {
      const result = await chrome.storage.local.get({ enabled: true });

      // Do not overwrite a newer setting change with an older read.
      if (settingRevision === revisionBeforeRead) {
        applySetting(result.enabled);
      }
    } catch (error) {
      // Leave automation disabled if the preference cannot be read.
      console.error(
        "[YouTube Auto Skip] Could not load setting:",
        error
      );
    }
  }

  initialize();
})();