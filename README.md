# YouTube Auto Skip

A free, personal Chrome extension using Manifest V3 and plain JavaScript.

It attempts to click YouTube's genuine Skip ad control only when the
control is visible and enabled. It does not assume a fixed countdown.

## Features

- ON/OFF popup.
- Preference saved with chrome.storage.local.
- Enabled by default when no preference exists.
- Setting changes applied to already-open YouTube tabs.
- MutationObserver with grouped scans.
- Specific Skip ad selectors.
- Visibility, enabled-state, and duplicate-click checks.
- Support for YouTube navigation without a full page reload.

## Files

- manifest.json: extension configuration and YouTube match restriction.
- content.js: Skip ad detection and clicking.
- popup.html: popup structure.
- popup.css: popup appearance.
- popup.js: saved ON/OFF preference.

## Install on Windows

1. Keep all files together in the youtube-auto-skip folder.
2. Open the folder in VS Code.
3. Open chrome://extensions in Chrome.
4. Enable Developer mode.
5. Click Load unpacked.
6. Select the folder containing manifest.json.
7. Pin the extension from Chrome's Extensions menu.
8. Refresh all already-open YouTube tabs.

No npm packages, build tools, accounts, or API keys are required.

## After changing code

1. Save the files in VS Code.
2. Open chrome://extensions.
3. Click Reload on the extension.
4. Refresh every open YouTube tab.
5. Reopen the popup.

Refreshing tabs replaces old content scripts after an extension reload.
Changing ON/OFF normally does not require refreshing tabs.

## Manual validation

- Skippable ad: wait until Skip becomes available; it should be clicked.
- Unskippable ad: it should continue normally.
- OFF: an available Skip control should remain for manual use.
- ON during playback: an available Skip control should be clicked.
- Restart Chrome: the saved preference should remain.
- Navigate between videos without refreshing: detection should continue.
- Multiple YouTube tabs: the saved switch should affect all loaded tabs.
- Ordinary video controls: play, pause, settings, and fullscreen should
  work normally and receive no automatic clicks.

Ads may not appear every time. No ad appearing is not proof of success.

## Selector assumptions

The code checks these classes inside #movie_player:

- .ytp-ad-skip-button
- .ytp-ad-skip-button-modern
- .ytp-skip-ad-button

It also requires the player to have the ad-showing class.

These assumptions are not verified against the current live YouTube UI.
A matching element must be a button or contain a button, including an
element with role="button".

If YouTube changes its interface, detection may stop working.
Inspect the genuine available Skip control in DevTools and update
SKIP_SELECTORS only after confirming its structure. The player ID and
ad-showing guard may also require review.

Do not replace these selectors with broad text matching or selectors
that target arbitrary buttons.

A reused button becomes eligible again after a scan observes it as
unavailable, or after the player leaves its ad-showing state. If YouTube
reuses it without an observable availability transition, another ad may
require manual skipping.

## Troubleshooting

For popup errors:
Open the popup, right-click inside it, select Inspect, and read Console.

For content-script errors:
Open YouTube, press F12, and read Console. Use the Console context menu
to select the extension's content-script context when needed.

A successful click attempt logs:
[YouTube Auto Skip] Clicked an available Skip ad control.

This log confirms a click was attempted; verify visually that the ad
actually skipped.

Also check the Errors button on the extension card if one appears.

After reloading the extension, refresh YouTube before diagnosing
extension-context errors.

## Privacy and scope

The only named API permission is storage.
Content-script access is restricted to https://www.youtube.com/*.

The extension stores only the enabled preference. It does not collect or
transmit browsing history, video details, or personal data.

It does not extract media, intercept streams, block requests, change
timers, hide ads, or provide background audio playback.

## Validation status

Live Chrome and YouTube testing must be completed manually.
Future YouTube compatibility and Chrome Web Store approval are not
guaranteed.