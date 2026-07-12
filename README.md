# CurioHole

CurioHole is an expandable browser-game portal built with React, TypeScript,
Vite, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

```text
src/
├── components/            Shared interface components
├── games/
│   ├── GameRenderer.tsx   Finished-game registry and fallback
│   └── ball-sort/         One self-contained game directory
├── App.tsx                Portal shell and navigation
├── data.ts                Game catalogue metadata
├── translations.ts        Chinese and English interface text
└── types.ts               Shared data contracts
```

## Adding a game

1. Validate its keyword and Google search intent.
2. Add its metadata to `src/data.ts`.
3. Create `src/games/<game-slug>/<GameName>.tsx`.
4. Register the component in `src/games/GameRenderer.tsx`.
5. Test desktop and mobile layouts before deployment.

Backend services are intentionally excluded from the current MVP. Add a
Cloudflare Worker only when a game has a validated need for server-side logic.
