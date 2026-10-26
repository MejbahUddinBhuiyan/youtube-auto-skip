# YouTube Auto Skip — Milestone 1

Personal, local Chrome extension using Manifest V3 and plain JavaScript.
This milestone implements only the popup and saved ON/OFF setting.
It does not inspect YouTube or click any controls yet.

## Setup on Windows

1. Extract the ZIP to a permanent folder such as Desktop/youtube-auto-skip.
2. Open that folder in VS Code using File > Open Folder.
3. In Chrome, enter chrome://extensions in the address bar.
4. Enable Developer mode, then click Load unpacked.
5. Select the folder directly containing manifest.json.
6. Open Chrome's Extensions menu and pin YouTube Auto Skip.
7. Click the extension to open the popup.

## Verify this milestone

- First open: ON — Enabled. A missing setting defaults to enabled.
- Switch OFF, close the popup, reopen: OFF — Disabled.
- Switch ON, close the popup, reopen: ON — Enabled.
- Switch OFF, fully exit Chrome, reopen: still OFF.
- YouTube controls should behave normally; this version clicks nothing.

## Changes and errors

After editing files, save them, open chrome://extensions and click the
extension's Reload button. Close and reopen the popup. Once a content script
is added in milestone 2, also refresh every YouTube tab after extension reloads.

To inspect popup errors, open the popup, right-click inside it, choose Inspect,
and read Console. Check the extension card's Errors button if it appears.
For future content-script errors, open YouTube's DevTools with F12 and inspect
Console; select the extension's execution context when needed.

## Permissions and privacy

Only storage is requested to save the enabled preference locally.
This milestone has no access to websites, background worker, external scripts,
network requests, data collection, icons, dependencies, or build step.
Milestone 2 will restrict content-script matching to https://www.youtube.com/*.

## Pending

- YouTube-only content script with immediate storage change handling.
- MutationObserver and specific genuine Skip ad selectors.
- Connected, visible, enabled checks and duplicate-click protection.
- Manual skippable/unskippable ad checks, toggling during playback,
  navigation, multiple tabs, and ordinary control checks.

No live YouTube selector or Chrome UI testing was performed for this milestone.
Future YouTube interface compatibility and Chrome Web Store approval are not guaranteed.