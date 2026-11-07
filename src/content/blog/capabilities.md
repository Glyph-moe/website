---
title: 'What an extension is allowed to do — capabilities, plainly'
description: 'Capabilities are the list of things a source declares it needs. This is what each one means, why the list is short, and what happens when a source asks for more.'
date: 2026-09-30
category: Guide
mood: dusk
cx: 0.58
---

A source is a small program. Running one means trusting it with a slice of the
app, and the slice is written down before it runs. That list is what the SDK
calls capabilities, and it is the part of the extension model worth
understanding even if you never write a source.

## The declared list

Every source declares what it needs, and the app sandboxes everything else.

| Capability | What it grants                         | What it does not           |
| ---------- | -------------------------------------- | -------------------------- |
| `network`  | Requests to the source's own host      | Other hosts, other sources |
| `storage`  | A small key-value store for the source | The reader's library       |
| `images`   | Fetching covers and chapter images     | Arbitrary file access      |

The list is short on purpose. Each addition has to earn its place, because a
capability you grant once is granted for every chapter afterwards.

## What a source can never do

It cannot read your library, your reading progress, or another source's data.
It cannot reach a host it did not declare. It cannot schedule work to run when
the app is closed.

```toml
[source]
id = "example"
hosts = ["example.com"]
capabilities = ["network", "images"]
```

That block is the whole negotiation. If a source asks for a host it does not
use, the review process says no, and if a shipped source starts asking for more
than it declared, the app refuses.

## When something asks for more

A source update that adds a capability is a new decision, not a quiet one. The
app tells you what changed and waits; declining leaves the old version
installed. Nothing is re-granted on your behalf.
