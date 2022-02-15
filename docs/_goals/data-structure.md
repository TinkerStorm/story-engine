---
title: Data Structure
layout: goal
description: A look into how the structure can change with feature development, and what is *currently* the best way to structure a story.
progress: 30
---

Current structure uses YAML as such:

```yaml
name: "My Story"
description: |
  This is a story about...
author: "John Doe"

starts_with: start

steps:
  start:
    payload: |
      This is the start of the story.
    routing:
      next: branch
  branch:
    payload:
      content: |
        This is the branch of the story.
      components:
        - type: 2
          style: 1
          label: Left
          custom_id: left
          emoji: 👈
        - type: 2
          style: 1
          label: Right
          custom_id: right
          emoji: 👉
    routing:
      left: left
      right: right
  left:
    routing: end
    payload: |
      This is the **left** branch of the story.
  right:
    routing: end
    payload: |
      This is the **right** branch of the story.
```

However there is a possibility to use alternative data exchange formats. For example, JSON; TOML; etc.

<div class="row">
<div class="col">
{% highlight json %}
{
  "name": "My Story",
  "description": "This is a story about...",
  "author": "John Doe",
  "starts_with": "start",
  "steps": {
    "start": {
      "payload": "This is the start of the story.",
      "routing": {
        "next": "branch"
      }
    },
    "branch": {
      "payload": {
        "content": "This is the branch of the story.",
        "components": [
          {
            "type": 2,
            "style": 1,
            "label": "Left",
            "custom_id": "left",
            "emoji": "👈"
          },
          {
            "type": 2,
            "style": 1,
            "label": "Right",
            "custom_id": "right",
            "emoji": "👉"
          }
        ]
      },
      "routing": {
        "left": "left",
        "right": "right"
      }
    },
    "left": {
      "routing": "end",
      "payload": "This is the **left** branch of the story."
    },
    "right": {
      "routing": "end",
      "payload": "This is the **right** branch of the story."
    }
  }
}
{% endhighlight %}
</div>
<div class="col">
{% highlight toml %}
name = "My Story"
description = "This is a story about..."
author = "John Doe"
starts_with = "start"

[steps.start]
payload = "This is the start of the story."
routing = { next = "branch" }

[steps.branch]
routing = { left = "left", right = "right" }

[steps.branch.payload]
content = "This is the branch of the story."

[[steps.branch.payload.components]]
type = 2
style = 1
label = "Left"
custom_id = "left"
emoji = "👈"

[[steps.branch.payload.components]]
type = 2
style = 1
label = "Right"
custom_id = "right"
emoji = "👉"

[steps.left]
routing = "end"
payload = "This is the **left** branch of the story."

[steps.right]
routing = "end"
payload = "This is the **right** branch of the story."
{% endhighlight %}
</div>
</div>

Use of a data schema would be a good way to ensure that the each story is valid and consistent, and that the data is in the right format.

For example, message payloads can either be a string or a JSON object (represented as a Discord Message). Verifying that each scene is a valid object before being sent off to Discord greatly reduces the risk of being ratelimited or otherwise banned by their safeguards.

**With regards to the existing data structure, it would look something like this:**
  > *`discord-message` and `discord-component` definitions have not been added as declarations yet, but the structure is the same as how the API defines it.*

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/example.json",
  "type": "object",
  "title": "A story structure",
  "description": "A story is composed of a series of scenes.",
  "properties": {
    "title": {
      "type": "string",
      "description": "The title of the story."
    },
    "author": {
      "type": "string",
      "description": "The author of the story."
    },
    "scenes": {
      "type": "array",
      "description": "The scenes of the story.",
      "items": {
        "$ref": "#/definitions/Scene"
      }
    }
  },
  "$defs": {
    "scene": {
      "type": "object",
      "title": "A scene",
      "description": "A scene is composed of a series of paragraphs.",
      "properties": {
        "payload": {
          "oneOf": [
            {
              "type": "string",
              "description": "The text of the scene."
            },
            { "$ref": "#/definitions/discord-message" }
          ]
        },
        "components": {
          "type": "array",
          "description": "The components of the scene.",
          "items": {
            "$ref": "#/definitions/discord-component"
          }
        },
        "routing": {
          "description": "The routing of the scene.",
          "oneOf": [
            {
              "type": "string",
              "description": "A distinct keyword that the program will respond to."
            },
            {
              "type": "object",
              "description": "A map of strings to scenes.",
              "patternProperties": {
                "^[a-zA-Z0-9_]+$": {
                  "type": "string"
                }
              }
            },
            {
              "type": "object",
              "description": "A map of an array of strings to scenes, one is chosen at random.",
              "patternProperties": {
                "^[a-zA-Z0-9_]+$": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            },
            {
              "type": "object",
              "description": "A map of an object of strings to scenes, one is chosen at random with given weights.",
              "patternProperties": {
                "^[a-zA-Z0-9_]+$": {
                  "type": "object",
                  "patternProperties": {
                    "^[a-zA-Z0-9_]+$": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}
```
