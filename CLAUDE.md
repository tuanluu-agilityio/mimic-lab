# MIMIC LAB

Read `AGENTS.md` in the repository root before making changes. It is the single source of instructions for AI coding agents working on this project.

Short version:

- Run `npm run typecheck` and `npm run test` after every change; `npm run verify` before finishing.
- Do not invent biology. Every content statement cites `src/data/references/`; keep evidence grades and caveats visible.
- The 3D engine (`src/three/`) and React (`src/features/`, `src/components/`) talk only through the Zustand store.
- The octopus always has eight arms; poses are data.
- No external assets, network calls or LLM/API dependencies at runtime.
