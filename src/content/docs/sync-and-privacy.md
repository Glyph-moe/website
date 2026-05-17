---
title: Sync & Privacy
order: 7
section: 'Using Glyph'
description: How iCloud sync works, what data syncs across devices, incognito mode, and content-rating controls.
---

# Sync & Privacy

Glyph keeps your data on your device by default and uses your own iCloud account to sync it across devices. Nothing goes to Glyph servers because **there are no Glyph servers**.

For the full data-flow story see the [Privacy Policy](/privacy).

## iCloud Sync

In **Settings → iCloud Sync** you'll find a toggle and a connection status indicator.

When sync is on, Glyph uses Apple's CloudKit (private container) to sync:

- Library entries (which novels, which folders)
- Reading history (what you've read, when)
- Bookmarks (positions and notes)
- Reader settings (theme, font, pre-fetch, etc.)
- Installed extension repositories
- Per-source settings and preferences

It does **not** sync:

- Downloaded chapter content, too large; download per-device
- The extension bundles themselves, re-fetched per device from the repo URL
- Diagnostic logs, always local

### Conflicts

Last-write-wins on CloudKit, with per-field merge. If two devices are reading the same novel at the same time, the most recent device "wins" each field, there's nothing manual to resolve.

### Disabling sync

You can toggle iCloud Sync off at any time. Disabling **does not** delete your local data, turning it back on re-uploads everything from the device.

## Incognito mode

In Settings, toggle **Incognito Mode** to read without logging sessions.

While on:

- Chapters you read aren't added to your History
- Reading progress isn't updated
- Bookmarks still work (you can add and use them)

Turn it off and reading resumes logging from that point. There's no "delete just the incognito session" action because no session is recorded in the first place.

## Content rating

Glyph has a four-level filter for adult / mature content. Set it in **Settings → Filters & Ratings → Maximum Rating**:

| Level        | What you see                                           |
| ------------ | ------------------------------------------------------ |
| **Everyone** | Only novels with no mature/adult tags                  |
| **Teen**     | Adds teen / shounen / shoujo / violence / suggestive   |
| **Mature**   | Adds mature / gore / sexual content / ecchi / explicit |
| **Adult**    | No filtering, everything visible                       |

Glyph detects ratings automatically from novel tags. Sources don't have to mark each novel by hand. The full mapping of tags → rating level is documented for extension authors at [Helpers → Content Rating](/docs/sdk-helpers#content-rating).

### Cover blur

Two independent toggles blur cover images for **Mature** and **Adult** novels, useful if you want to see those novels in lists but not surface imagery in public spaces. Tap a blurred cover to reveal it temporarily.

## What your device stores

| Data                      | Where                | Synced?                         |
| ------------------------- | -------------------- | ------------------------------- |
| Library entries           | SwiftData on device  | Yes (via iCloud)                |
| Reading history           | SwiftData on device  | Yes                             |
| Bookmarks                 | SwiftData on device  | Yes                             |
| Reader / app settings     | SwiftData on device  | Yes                             |
| Source preferences        | SwiftData on device  | Yes                             |
| Downloaded chapters       | Files on device      | **No** (per-device)             |
| Extension bundles         | Cache on device      | **No** (per-device, re-fetched) |
| Network / diagnostic logs | Memory + recent disk | **No** (local only)             |

## Coming soon

- **Library export**: save your library, progress, and bookmarks to a portable file you can import on another device or account.
- **Auto-clean**: option to delete read chapters automatically to free space.

## See also

- [Privacy Policy](/privacy): full data-flow details
- [Customization](/docs/customization): Library badges and Reader defaults sync via iCloud
- [Troubleshooting](/docs/troubleshooting#icloud-sync-isnt-working): when sync misbehaves
