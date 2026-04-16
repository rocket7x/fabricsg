---
name: edit-homepage-layout-and-links
description: Workflow command scaffold for edit-homepage-layout-and-links in fabricsg.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /edit-homepage-layout-and-links

Use this workflow when working on **edit-homepage-layout-and-links** in `fabricsg`.

## Goal

Update the homepage layout and adjust homepage-related links or header configuration.

## Common Files

- `templates/index.json`
- `sections/header-group.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit templates/index.json to change homepage layout or content.
- Edit sections/header-group.json if header or navigation links are involved.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.