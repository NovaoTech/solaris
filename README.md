# Solaris
> The open learn-to code community.

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fsolaris.novao.xyz)](https://solaris.novao.xyz/) ![GitHub](https://img.shields.io/github/license/novaotech/solaris) ![GitHub issues](https://img.shields.io/github/issues/novaotech/solaris) ![Made with sveltekit](https://img.shields.io/badge/made%20with-SvelteKit-orange) ![Made with Express](https://img.shields.io/badge/made%20with-Express.js-blue)

## What is Solaris
Solaris (formerly Polaris) is an open-source alternative to the mainstreme Scratch website that adds in more advance features such as Extentions and custom licensing. We hope to create this open platform to allow a more open approach to learning a programming language and to allow those who wish for a more advance Scratch platform to still have a great community to go with it.

## Contributing
### Commit Format
We use the Angular.js commit formatting system. A helpful gist for information can be found [here.](https://gist.github.com/brianclements/841ea7bffdb01346392c). Please make sure that all of your commits match this format, as it makes it easier to keep on the same page with what's happening.
### Code Format
We are using Prettier to keep code uniform. Before commiting, make sure to run `pnpm -w run format` to correct code formating issues.
### Package Manager
Instead of the traditional `npm` or `yarn` packages, the Solaris project uses the awesome `pnpm` package manager. There are a multitude of benefits and reasons why we use this package manager, but it all comes down to this: Solaris is being developed under a monorepo, and `pnpm` has the most compatibility with such repositories, in addition to added speed and workspace dependencies. You can learn more about the `pnpm` package manager [here.](https://pnpm.io/)

## Merge Schedule
Every week on Monday, each branch is merged forward (provided no blockers have been made). This means that:

next -> main

develop -> next

(feature branches) -> develop

Branches may be merged off of this schedule if deemed necessary by the team.

## Packages and Contents
| Package | Content |
|---------|---------|
| [dyson](packages/dyson) | Frontend for Solaris, written with SvelteKit |
| [dynamo](packages/dynamo) | Backend for Solaris, written with Express |
| [landing](packages/landing) | Current landing page for the [Solaris website](https://solaris.novao.xyz/), written with SvelteKit |
| [nebula](packages/nebula) | Project tools for Solaris, written with TypeScript |
| [solaris-types](packages/solaris-types) | Types for Solaris, written with TypeScript |
