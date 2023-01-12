# Solaris

> The open learn-to code community.

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fsolaris.novao.xyz)](https://solaris.novao.xyz/) ![GitHub](https://img.shields.io/github/license/novaotech/solaris) ![GitHub issues](https://img.shields.io/github/issues/novaotech/solaris) ![Made with sveltekit](https://img.shields.io/badge/made%20with-SvelteKit-orange) ![Made with Express](https://img.shields.io/badge/made%20with-Express.js-blue)

## What is Solaris

Solaris (formerly Polaris) is an open-source alternative to the mainline Scratch website that incorporates more advance features such as Extensions and Custom Licensing. We aim to create a platform to allow a more open approach to learning programming, and to allow those who wish for a more advanced Scratch experience to have a community.

## Contributing

### Commit Format

We use the Angular.js commit formatting system. A helpful gist for information can be found [here.](https://gist.github.com/brianclements/841ea7bffdb01346392c). Please make sure that all of your commits match this format, as it makes it easier to keep on the same page with what's happening. Please remember to sign your commits with a GPG key as well :)

### Code Format

We are using Prettier to keep code uniform. Before commiting, make sure to run `pnpm -w run format` to correct code formating issues.

### Package Manager

Instead of the traditional `npm` or `yarn` packages, the Solaris project uses the awesome `pnpm` package manager. There are a multitude of benefits and reasons why we use this package manager, but it all comes down to this: Solaris is being developed under a monorepo, and `pnpm` has the most compatibility with such repositories, in addition to added speed and workspace dependencies. You can learn more about the `pnpm` package manager [here.](https://pnpm.io/)

### Adding a new feature

If you'd like to add a new feature, just fork a branch from the `develop` branch.
Then, Once you're finshed building your feature, go ahead and make a pull request to merge back into `develop`.
Your code will be reviewed by members of the community, and, with enough support, be merged into the `develop` branch. This might not happen right away, especially if changes are requested by code reviewers.

### Fixing Bugs

If you have a bug you'd like the fix, you must first check for an open issue. If one does not exist, go ahead and create one, and wait for a community member to triage it and create a branch for accepting contributions. If one does exist, check for a traige and branch. From there, fork the branch for the issue and begin fixing it up. Once the issue is fixed, a staff member will merge the issue branch back into the appropriate branch, depending on the environment and urgency of the issue.

## Merge Schedule and Branches

Every week on Monday, each branch is merged forward (provided no blockers have been made). This means that:

next -> main

develop -> next

(feature branches) -> develop

Branches may be merged off of this schedule if deemed necessary by the team.

Here's a little chart of what all the branches hold:

| Branch                    | Use                                                                                                |
| :------------------------ | :------------------------------------------------------------------------------------------------- |
| `main`                    | The stable, production branch. Cloudflare Pages deploys from this one.                             |
| `next`                    | The less-stable, testing branch. Cloudflare Pages deploys this branch to the beta url.             |
| `develop`                 | The unstable, development branch. Cloudflare Pages does not deploy this branch to any public URLS. |
| `feat(x)`, `bug(x)`, etc. | Working copy branches for working on specific features.                                            |

## Packages and Contents

| Package                                 | Content                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [dyson](packages/dyson)                 | Frontend for Solaris, written with SvelteKit                                                       |
| [dynamo](packages/dynamo)               | Backend for Solaris, written with Express                                                          |
| [landing](packages/landing)             | Current landing page for the [Solaris website](https://solaris.novao.xyz/), written with SvelteKit |
| [nebula](packages/nebula)               | Project tools for Solaris, written with TypeScript                                                 |
| [solaris-types](packages/solaris-types) | Types for Solaris, written with TypeScript                                                         |
