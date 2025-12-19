# Repository Guidelines

## Project Structure & Module Organization
The app lives in `src/`, with `main.tsx` bootstrapping React and `App.tsx` delegating to `components/MarginCalculator.tsx`. Shared styles stay in `src/index.css`, while Tailwind utilities are configured via `tailwind.config.js` and `postcss.config.js`. Static entry assets (`index.html`) sit at the root for Vite. Place new UI modules in `src/components/`, and keep pure helpers co-located when they are specific to a screen.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Use `npm run dev` during local work; it starts Vite with hot reload at http://localhost:5173. `npm run build` runs `tsc -b` for type checking and emits optimized assets to `dist/`. Validate production output with `npm run preview`, which serves the built bundle.

## Coding Style & Naming Conventions
Author features in TypeScript functional components. Prefer `PascalCase` component files (`components/NewWidget.tsx`) and `camelCase` helpers (see `num()` and `clamp01()` in the calculator). Keep hooks at the top of components, and pass state setters directly to child props. Use Tailwind utility classes for styling; extend tokens in `tailwind.config.js` instead of ad-hoc inline styles. Follow the existing two-space indentation and terminate statements with semicolons for consistency.

## Testing Guidelines
A formal test runner is not yet checked in. For logic-heavy additions, add unit tests with Vitest and React Testing Library under `src/__tests__/` using the `*.test.ts(x)` naming pattern, and document any new npm scripts in `package.json`. Until automated tests land, verify calculations manually by comparing known margin scenarios and ensure `npm run build` stays green.

## Commit & Pull Request Guidelines
Commit messages follow a lightweight Conventional Commits style (`chore:`, `feat:`, `fix:`). Keep the subject under 72 characters and describe the impact (for example, `chore: add @vitejs/plugin-react for Vite React support`). PRs should include a short summary, testing notes (commands run, manual scenarios), and screenshots or GIFs for UI changes. Request review before merging and wait for build success.

## Deployment Notes
No hosting-specific configuration is included; keep the project focused on local development and build output.
