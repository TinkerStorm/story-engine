---
title: More Interactions
description: What else can a story use to interact with the user?
layout: goal
progress: 20
---

Right now, only Button components are supported for navigating a chosen story, but there are many other possibilities which can be explored with further development.

### Select Menus

Using a select menu requires a bit of work to ensure that the story recieves the correct context. In a similar sense, select menus can also be used to navigate a story much like their button counterparts. However, select menus are one component with many choices - which changes how stories should be handled on the backend.

```yaml
# from 'scenes.*' with 'components'
components:
  - type: 3
    custom_id: option
    options:
      - label: Path 1
        value: path1
        description: |
          This is the first path.
      - label: Path 2
        value: path2
        description: |
          This is the second path.
      - label: Path 3
        value: path3
        description: |
          This is the third path.
    placeholder: Select a path
    emoji: 🔍
    min_values: 1
    max_values: 1
```

This structure implies `option` as the custom id, is used as the branch itself instead of the buttons. This can also double back as a state management selector which can be used to change the direction of the story later on (Walking Dead with "{X} will remember this" ~~but they also won't~~).

### Modals

An additional enhancement to the select menu, but more directed towards custom content input. Modals are a way to present variables to the user, and adapt the story to the user's input. However this is still a beta feature and is not yet fully released.