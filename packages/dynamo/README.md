# dynamo

> Backend for Solaris, the open learn-to-code community. Written with Express.js

## Running Locally

Clone the solaris monorepo:

```sh
git clone git@github.com:NovaoTech/solaris.git
```

Install root dependencies with `pnpm`:

```sh
pnpm install
```

Install dynamo dependencies with `pnpm`:

```sh
cd packages/dynamo
pnpm install
```

Write configuration values to .env
| Key | Value |
| ------------ | -------------------------------------------------------------------------------------- |
| MONGODB_USER | (Your configured worker) |
| MONGODB_PASS | (The password for your worker) |
| MONGODB_URI | (The URI for your MongoDB Server. Ex: `@clustername.x.mongodb.net/database`) |
| DB | (Database to use. E.g. `testing`/`production`) |
| DYNAMO_PORT | (Optional - Port where you want Dynamo to run. Defaults to `3000`) |

If all is well, you should be able to run the backend with the following command (inside the `packages/dynamo` directory):
`pnpm run start`

Then, navigate to http://localhost:3000/ (Or other configured port- make sure to use `http` and not `https` :D). If it shows `status: 200`, congrats! You set it up successfully!
