# Contributing

## Setup

CrossLeague uses Node.js, npm, and [Task](https://taskfile.dev/) for local
development. Install dependencies and the Git hooks with:

```sh
task install
```

## Everyday commands

| Goal                       | Command      |
| -------------------------- | ------------ |
| Run the application        | `task dev`   |
| Run tests                  | `task test`  |
| Run all checks             | `task check` |
| Format and fix lint issues | `task fix`   |
| Build the production app   | `task build` |

## Change discipline

Keep changes focused, add regression tests when behavior changes, and update
the relevant guide in `docs/`. The project uses Gitmoji commit prefixes; use
`✨` for features, `🐛` for fixes, `📝` for documentation, and `👷` for CI.

Before opening a pull request, run `task check`.

## Releases

Releases are automated with semantic-release when changes land on `main`.
Gitmoji prefixes determine the release type: `✨` creates a minor release,
`🐛` and `🚑` create patch releases, and `💥` creates a major release. The
release workflow updates the Node package manifests and creates the GitHub
release; CrossLeague is not published to npm.
