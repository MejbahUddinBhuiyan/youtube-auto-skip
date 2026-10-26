"use strict";

const toggle = document.getElementById("enabled");
const status = document.getElementById("status");
let savedEnabled = true;

function render(enabled) {
  toggle.checked = enabled;
  status.textContent = enabled ? "ON — Enabled" : "OFF — Disabled";
}

async function initialize() {
  try {
    const result = await chrome.storage.local.get({ enabled: true });
    savedEnabled = result.enabled !== false;
    render(savedEnabled);
    toggle.disabled = false;
  } catch (error) {
    status.textContent = "Could not load setting. Reopen the popup.";
    console.error("Could not load setting:", error);
  }
}

toggle.addEventListener("change", async () => {
  toggle.disabled = true;
  try {
    await chrome.storage.local.set({ enabled: toggle.checked });
    savedEnabled = toggle.checked;
    render(savedEnabled);
  } catch (error) {
    render(savedEnabled);
    status.textContent = "Could not save. Previous setting restored.";
    console.error("Could not save setting:", error);
  } finally {
    toggle.disabled = false;
  }
});

initialize();