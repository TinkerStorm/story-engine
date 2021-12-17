---
title: Weighted Routes
description: How can one route outweigh another? What is the advantage of using weighted routes over a regular array with multiple of the same destination?
layout: goal
progress: 100
links:
  - label: shuffle-theory
    href: https://github.com/TinkerStorm/shuffle-theory
---

Ultimately, the goal of this goal is to make it easier to write stories that have multiple routes, and to make it easier to calculate the weighted route. Using a weighted route allows the service to have bias towards the routes that are more likely to succeed, and to have a more accurate representation of the story.

```yaml
# weights do not need to be equal to the sum of 1, but they must be positive to be selected
routing:
  high-ground:
    advantage-win: 0.7
    advantage-lose: 0.3
  low-ground:
    disadvantage-win: 0.3
    disadvantage-lose: 0.4
    disadvantage-tie: 0.2
```