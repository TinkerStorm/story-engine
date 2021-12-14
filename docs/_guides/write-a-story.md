---
title: Write a Story
layout: guide
---

This page will take you through the basics of writing your own story for [Story Engine](https://github.com/TinkerStorm/story-engine).

## Metadata

```yaml
name: My Story # the name of your story
description: |
  My Story Description
author: My Name or Screenname
starts_with: first-page
steps:
  # ...
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `title` | string | The title of your story |
| `description` | string | A short description of the story, shown on the first message when your story begins. |
| `author` | string | The author... oh that's you! :wave: |
| `starts_with` | string | Where do you want the reader to begin? *Use one of the key's from `steps`.* |
| `steps` | `object` | *This will be covered later.* |

## Steps

```yaml
steps:
  first-page:
    payload: |
      This is my first page.
    routing:
      next: second-page
  second-page:
    payload: |
      We'll include a branch here...
    components:
      - type: 1 # Action row
        components:
          - type: 2 # Button
            style: 3 # Green - Success
            label: Truth
            custom_id: truth
          - type: 2
            style: 4 # Red - Danger
            label: Dare
            custom_id: dare
    routing:
      truth: truth-page
      dare: dare-page

      # additionally - random chance
      truth: [truth-1, truth-2]
      # or - weighted chance
      truth:
        truth-1: 0.4
        truth-2: 0.6

  truth-page:
    payload:
      embeds:
        - title: You chose TRUTH
          color: 0x00FF00
          description: |
            What's the most embarrassing moment you can remember.
            (END)
    routing: end
  dare-page:
    payload:
      embeds:
        - title: You chose DARE
          color: 0xFF0000
          description: |
            Try not to blink for 30 seconds.
            (END)
    routing: end
```

> Editor note: I'm aware that this is a very bad 'narrative', I'm just trying to get the structure across.
> 
> This next section is also quite long, so feel free to take notes if you need to.

### Structure (Steps - `steps.*`)

| Field | Type | Description |
| ----- | ---- | ----------- |
| `{step_name}` | `object` | A step in the story |
| `{step_name}.payload` | `string` or `object` | A [discord message payload](https://discord.com/developers/docs/resources/channel#message-object) to be sent back to the user, *if a string it will be resolved as an embed*. |
| `{step_name}.components` | `array` | *If payload is `string`*, a list of components to be rendered in the message |
| `{step_name}.routing` | `"end"` or `object` | A map of routing options for the next step |

### Structure (Routing - `steps.*.{step_name}.routing`)

This property can accept a number of different values:

- `"end"`: The story is over, the user has reached the end of the story.
- `object`: A map of routing options for the next step.
- `object` *with array*: Randomly select one of the options, selected in order of the array.
- `object` *with an embedded key-value pair of `{ [route: string]: number }`*: Randomly select an option based on the weighting, selected in order of the array.
  > Weighted chances are **expected** as positive floating point numbers, giving them a chance to be selected in the first place. The sum of all the chances does not have to be `1`, but it helps *visually* when modifying the weights (`0.4` and `0.6` typically equate to 40% and 60% respectively).

### Structure (External)

- `payload.embeds.*.color` can be specified as a number `347349`; a hex code `0x00ff00` or as the literal of `RANDOM` which will tell the engine to select a random color for the embed.

#### Components (Buttons)

> Right now, only the `button` component is supported (`action_row` just groups it together).

- `components.*.label` - The label of the button
- `components.*.custom_id` - A custom ID for the button, **used to decide where you go next in your story**.
- `components.*.emoji` - [Partial Emoji](https://discord.com/developers/docs/resources/emoji#emoji-object), The emoji to use for the button.
  > `{ name, id, animated }`
  > - `name`: string *as a discord emoji name* or a unicode emoji (i.e. 😀, 🥽)
  > - `id?`: *force cast as a string* for identifying a custom emoji **REQUIRED IF CUSTOM**
  > - `animated?`: (yes/no, true/false) - if the custom emoji is animated

  ```yaml
  components:
      # unicode emote
    - type: 2
      style: 1
      label: Button
      custom_id: action
      emoji:
        name: 🎉
      # custom emote
    - type: 2
      style: 2
      label: Button
      custom_id: next
      emoji:
        name: goose
        id: "717399673140281464"
  ```
- `components.*.style` - [Button Styles](https://discord.dev/interactions/message-components#button-object-button-styles)
  - Primary: `1`
  - Secondary: `2`
  - Success: `3`
  - Danger: `4`
  - Link: `5` (uses `url` instead of `custom_id` like the rest of the styles)