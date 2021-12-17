---
title: Terminology
layout: goal
description: What are the best terms to use for a story? What terms do writers and programmers mutually agree on?
---

While making the service, GitHub CoPilot suggested the use of 'Scene' as an alternative to 'Step' repeatedly and may be a good way to align with some terminology used in industry. However, the use of 'Step' was considered good enough when given the reason of *stepping forward in a story*.

Story loops are possible, but not recommended as they don't retain context from previous steps. If permitted to continue, the story can cause a stack call exception which would likely cause the service to crash if not handled correctly.