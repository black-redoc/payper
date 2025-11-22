# Pre-commit Hooks with Husky

This project uses **Husky** and **lint-staged** to automatically run linters and formatters before each commit, similar to `pre-commit` in Python.

## What does it do?

Before each commit, it automatically:

1. **ESLint**: Checks and fixes JavaScript/TypeScript code issues
2. **Prettier**: Formats code to maintain consistent style

Only files in the staging area are processed.

## Configuration

### Husky

Git hooks are located in `.husky/`. The `pre-commit` hook runs `lint-staged`.

### Lint-staged

Configuration is in `package.json`:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

## Troubleshooting

### Hook doesn't run

```bash
# Reinstall husky
npm run prepare
```

### Skip the hook (NOT RECOMMENDED)

```bash
git commit --no-verify -m "message"
```

### Run lint-staged manually

```bash
npx lint-staged
```

## Ignored Files

The following files are ignored during linting:

- Prisma generated files (`src/generated/**`)
- Build outputs (`.next/`, `.open-next/`)
- Node modules
- `.js` files (only TypeScript is checked)
