---
title: Stateful Types
description: What can make editing a story easier? And how can it be made semi-non-destructive to the runtime when it resolves the payload?
layout: goal
progress: 5
links:
  - label: Discord Buttons
    href: https://discord.dev/interactions/message-components#buttons
  - label: slash-create Button
    href: https://slash-create.js.org/#/docs/main/latest/typedef/ComponentButton
---

Scene components are declared with numbers to indicate the type of component, there is a possibility to use an ENUM type to indicate the type of component (but also to allow better readability).

### Component Types

| Type | String | Description |
| ---- | ------ | ----------- |
| 1 | `ACTION_ROW` | An action row acting as a component container. |
| 2 | `BUTTON` | A button component. |
| 3 | `SELECT_MENU` | A select menu component. |

### Button Styles

| Style | String | Color |
| ---- | ------ | ----- |
| 1 | `PRIMARY` | Blue |
| 2 | `SECONDARY` | Grey |
| 3 | `SUCCESS` | Green |
| 4 | `DANGER` | Red |
| 5 | `LINK*` | Grey |

> `LINK*` - only used to link elsewhere, not to navigate.