# story-engine
A discord interactions service that provides a platform for interactive stories written by the community.

## Writing your own story

Stories are written in [YAML](https://yaml.org/), a *relatively* simple structure notation.

This is likely to change in the future when support is added for more complex story components, but for now, the following is a good place to start.

```yaml
name: My Story
author: My Name
description: | 
  My Story Description
# ^ all shown on the initial message
starts_with: first # the first 'scene' / step to show

steps:
  first:
    payload: |
      Your story goes here.
    # ...
    components:
      - type: 1 # action_row
        components:
          - type: 2
            style: 1
            label: "Your label"
            custom_id: next
    routing:
      next: second
  second:
    payload:
      embeds:
        - title: "Your embed title"
          description: "Your embed description"
          color: 0x00FF00 # or 'RANDOM' for a random embed color
          fields:
            - name: "Your field name"
              value: "Your field value"
          # etc. etc.
    routing: end # end of this branch of the story
# extras...
routing:
  fight: [win, lose] # equal chance of being selected
  # or
  fight:
    # numbers don't have to be exactly 1
    # but they do have to be positive to have a chance of being picked to begin with
    win: 0.4
    lose: 0.6
```

### Structure (Front-matter - `*`)

| Field | Type | Description |
| ----- | ---- | ----------- |
| `title` | `string` | The title of the story |
| `description` | `string` | A short description of the story |
| `author` | `string` | The author of the story |
| `starts_with` | `string` | The starting 'step' of the story |
| `steps` | `object` | A map of steps to be used in the story |

### Structure (Steps - `steps.*`)

| `{step_name}` | `object` | A step in the story |
| `{step_name}.payload` | `string` or `object` | A [discord message payload](https://discord.com/developers/docs/resources/channel#message-object) to be sent back to the user, *if a string it will be resolved as an embed*. |
| `{step_name}.components` | `array` | *If payload is `string`*, a list of components to be rendered in the message |
| `{step_name}.routing` | `"end"` or `object` | A map of routing options for the next step |

### Structure (Routing - `steps.*.{step_name}.routing`)

This property can accept a number of different values:

- `"end"`: The story is over, the user has reached the end of the story.
- `object`: A map of routing options for the next step.
- `object with array`: Randomly select one of the options, selected in order of the array.
- `object with an array map of [string, number]`: Randomly select an option based on the weighting, selected in order of the array.

### Structure (External)

#### Components (Buttons)

> Right now, only the `button` component is supported (`action_row` just groups it together).

- `components.*.label` - The label of the button
- `components.*.custom_id` - A custom ID for the button, **used to decide where you go next in your story**.
- `components.*.emoji` - [Partial Emoji](https://discord.com/developers/docs/resources/emoji#emoji-object), The emoji to use for the button.
  > ```{ name: string or unicode char (i.e. 😎), id: Snowflake, animated: bool }`
  > If `name` is a string, it will be used as the emoji name.
- `components.*.style` - [Button Styles](https://discord.dev/interactions/message-components#button-object-button-styles)
  - Primary: `1`
  - Secondary: `2`
  - Success: `3`
  - Danger: `4`
  - Link: `5` (uses `url` instead of `custom_id` like the rest of the styles)

## Hosting your own bucket

We (TinkerStorm) are currently working on a way to host your own bucket, this would be git based and hosted on a provider of your choosing (so long as the host machine can access it). This is a work in progress and we will be adding more features as we go along.

## Future

- [ ] Bucket Support
- [ ] Story Editor by App Commands <sup>1</sup>
- [ ] Database support <sup>1</sup>

---

- <sup>1</sup>: This aspect requires a different approach to the story engine, while both require access to an external data source to begin with (a database requires structure and consistency from the get go).

### Story Editor (Commands Outline)

> What would someone expect from this?

- `/story ...`
- `/story search ...`
- `/story begin ref: My Story` - Starts a story (`ref` would autocomplete itself to an entry in the dataset)
- `/story continue` - Continues the current story (Unsure, but it would be nice to have - app doesn't track which story you're in *or where you are in the story*).
  > **Note**: Starting a new story, may overwrite the current save state of the previous story (although there is a possibility to allow multiple).
---

- `/story-manage create ...` - Creates a new story
- `/story-manage edit ...` - Edit a story
- `/story-manage delete ...` - Delete one of your stories
- `/story-manage list ...` - A list of your stories in the database

**Steps**

- `/story-manage add-step ...` - Add a step to a story
- `/story-manage remove-step ...` - Remove a step from a story

**Components**

- `/story-manage add-component ...` - Add a component to a step
- `/story-manage remove-component ...` - Remove a component from a step

**Routing**

> Unknown how to incorporate chance modifiers into this.

- `/story-manage add-route ...` - Add a routing option to a step
- `/story-manage remove-route ...` - Remove a routing option from a step
- `/story-manage set-routing ...` - Set the routing options for a step

---

- `/story-admin ...` - Admin commands, unknown what they would do (yet)

---
