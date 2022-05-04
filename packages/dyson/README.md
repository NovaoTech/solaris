# dyson

> frontend for Solaris, written with SvelteKit

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release) [![build status](https://github.com/novaotech/dyson/actions/workflows/node.js.yml/badge.svg)](https://github.com/NovaoTech/dyson/actions/)

## Running Locally

Clone the repository's code:

```sh
git clone git@github.com:NovaoTech/dyson.git
```

cd into the directory and install dependencies:

```sh
cd dyson
npm install
```

Build the project and start the server:

```sh
npm run build && npm run preview
```

Navigate to localhost:3000 in your browser and profit!

## Contributing

### Commiting

We use the AngularJS commit format system for our commit messages. If you aren't familiar with this system, we reccomend using [commitizen](https://github.com/commitizen-tools/commitizen), with which our repository is configured to use.

In addition to using that commit format, we ask that you sign your commits. This allows us to verify that the person making the commit is actually you.

### Cloning for Development

Clone the repository's code:

```sh
git clone git@github.com:NovaoTech/dyson.git
```

cd into the directory, switch branches, and install dependencies:

```sh
cd dyson
git switch develop
npm install
```

Finally, you can begin contributing.

### Adding a new feature

If you'd like to add a new feature, just fork a branch from the `develop` branch.
Then, Once you're finshed building your feature, go ahead and make a pull request to merge back into `develop`.
Your code will be reviewed by members of the community, and, with enough support, be merged into the `develop` branch. This might not happen right away, especially if changes are requested by code reviewers.

### Fixing Bugs

If you have a bug you'd like the fix, you must first check for an open issue. If one does not exist, go ahead and create one, and wait for a community member to triage it and create a branch for accepting contributions. If one does exist, check for a traige and branch. From there, fork the branch for the issue and begin fixing it up. Once the issue is fixed, a staff member will merge the issue branch back into the appropriate branch, depending on the environment and urgency of the issue.

## Branches

This project has three main branches:

| Branch    | Use                                                                                                |
| :-------- | :------------------------------------------------------------------------------------------------- |
| `main`    | The stable, production branch. Cloudflare Pages deploys from this one.                             |
| `next`    | The less-stable, testing branch. Cloudflare Pages deploys this branch to the beta url.             |
| `develop` | The unstable, development branch. Cloudflare Pages does not deploy this branch to any public URLS. |

The develop branch regularly merges into the `next` branch every two weeks, but merging may be triggered earlier. `next` merges into `main` at the same point as `develop` merges into `next`, but the merge of `next` into `main` occurs first.
