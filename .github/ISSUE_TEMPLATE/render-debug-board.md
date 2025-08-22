name: Render Debug Board Item
description: Track a single hypothesis/fix for Render deployment
title: "render: <short scope> — <symptom>"
labels: ["render", "deployment"]
body:
  - type: markdown
    attributes:
      value: |
        Use this template to propose, implement, and verify a single fix.
  - type: input
    id: context
    attributes:
      label: Context
      description: Commit/PR and what changed
      placeholder: e.g., PR #123 — normalize NODE_ENV
  - type: textarea
    id: error
    attributes:
      label: Error excerpt
      description: Copy the exact lines from Render Build/Runtime logs
  - type: textarea
    id: hypothesis
    attributes:
      label: Hypothesis
      description: Why is this failing?
  - type: textarea
    id: action
    attributes:
      label: Next action
      description: List specific files/commands to change/run
  - type: textarea
    id: verify
    attributes:
      label: Verification
      description: Health path or log lines to confirm

