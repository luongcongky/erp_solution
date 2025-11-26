# Coding Standards

## General
- **Indentation**: 4 spaces.
- **Line Endings**: LF.
- **File Encoding**: UTF-8.

## Naming Conventions
- **Components**: PascalCase (e.g., `Sidebar.js`, `UserProfile.js`).
- **Functions**: camelCase (e.g., `getUserData`, `calculateTotal`).
- **Variables**: camelCase (e.g., `isLoading`, `userList`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `API_URL`).
- **CSS Modules**: `[Component].module.css` (e.g., `Sidebar.module.css`).

## Imports
- Use absolute imports (`@/`) for internal project files whenever possible.
- Group imports:
    1. External libraries (e.g., `react`, `next`).
    2. Internal components/hooks/utils.
    3. Styles.

## React & Next.js
- Use Functional Components with Hooks.
- Avoid inline styles; use CSS Modules or global CSS variables.
- Use `next/link` for internal navigation.
- Use `next/image` for images.

## Logging
- Remove `console.log` in production code.
- Use `console.error` or a logging service for errors.

## Linting
- Follow the ESLint configuration provided in the project.
- Run `npm run lint` before committing.
