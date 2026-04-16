```markdown
# fabricsg Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the key development patterns, coding conventions, and workflows for the `fabricsg` TypeScript codebase. It covers file naming, import/export styles, and provides step-by-step instructions for common repository workflows, including homepage layout editing. This guide is intended to help contributors quickly understand and follow established practices in the project.

## Coding Conventions

- **Language:** TypeScript
- **Framework:** None detected

### File Naming
- Use **camelCase** for file names.
  - Example: `headerGroup.ts`, `userProfile.ts`

### Import Style
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { HeaderGroup } from './headerGroup';
    ```

### Export Style
- Use **named exports**.
  - Example:
    ```typescript
    export const HeaderGroup = { ... };
    ```

### Commit Patterns
- Commit messages are **freeform** (no enforced prefix).
- Average length: ~49 characters.

## Workflows

### Edit Homepage Layout and Links
**Trigger:** When someone wants to redesign the homepage or fix/update homepage links and navigation.  
**Command:** `/edit-homepage`

1. Edit `templates/index.json` to change the homepage layout or content.
   - Example: Update the featured sections or rearrange layout blocks.
2. Edit `sections/header-group.json` if header or navigation links are involved.
   - Example: Add, remove, or reorder navigation links in the header.

**Files Involved:**
- `templates/index.json`
- `sections/header-group.json`

**Frequency:** ~2 times per month

#### Example
To add a new navigation link to the homepage header:
1. Open `sections/header-group.json`.
2. Add a new object to the links array:
    ```json
    {
      "label": "Blog",
      "url": "/blog"
    }
    ```
3. Save and commit your changes.

## Testing Patterns

- **Testing Framework:** Unknown (not detected)
- **Test File Pattern:** Files with `.test.` in their name.
  - Example: `userProfile.test.ts`
- To write a test, create a file alongside the module with `.test.` in the filename.

## Commands

| Command        | Purpose                                                    |
|----------------|------------------------------------------------------------|
| /edit-homepage | Update homepage layout, content, or navigation/header links |

```