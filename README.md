# netlify-plugin-redwoodjs-env-validator

This [Netlify Builld Plugin](https://docs.netlify.com/configure-builds/build-plugins/) helps to validate [RedwoodJS](https://redwoodjs.com/) [environment variables](https://redwoodjs.com/docs/environment-variables) when [deploying](https://docs.netlify.com/site-deploys/overview/) to [Netlify](https://www.netlify.com/).

It aims to check that the environment variables needed for a healthy running RedwoodJS app have been properly setup; and it helps to keep them in sync betwen the `.env.defaults` to `redwood.toml` and the deployment environment configuration.

## Why?

When deploying a RedwoodJS app to Netlify, even though you have setup the Build environment variables as part of teh Netlify Build & deploy settings, there is still [one step needed](https://redwoodjs.com/docs/environment-variables#web) to make those envs available on the `web` side of your RewoodJS app, either:

1. Prefix your env vars with `REDWOOD_ENV_`
1. Whitelist them in your `redwood.toml`
1. Define them in your `.env` file.

See: [https://redwoodjs.com/docs/environment-variables#web](https://redwoodjs.com/docs/environment-variables#web)

Since prefixing with `REDWOOD_ENV_` could make for long envs and re0names them (in a way) and you definitely will and should not check your `.env` to with the settings to the Github repo, then best option is to "Whitelist them in your `redwood.toml`.

That requires that you need to keep everything in sync and up-to-date which means that you may have added a new env, but forgottent ot whitelist it; or you removed an env and it is still whitelisted, or you whitelisted and env and forgot to add it to Netlify, and so on.

This plug is here to help!

## Setup

RedwoodJS uses [dotenv-defaults](https://github.com/mrsteele/dotenv-defaults) which allows you to keep a safe to commit file of the environmetn variable, but with defauilt or non-sensitive (or mock/blank) settings.

```
# .env.defaults, safe to commit
HOST=website.com
EMAIL=
```

```
# .env, DO NOT COMMIT
HOST=omnionline.us
EMAIL=test@email.com
```

Those defaults will be overwritten with settings from the build environment when deploying.

In your RedwoodJS app, your `.env.defaults` might define your database and some secret authentication settings ...

```
# .env.defaults, safe to commit

DATABASE_URL=

AUTH0_DOMAIN=""
AUTH0_CLIENT_ID=""
AUTH0_AUDIENCE=""
AUTH0_REDIRECT_URI=""
```

.. that you'd devine in your `.env` but not commit.

```
# .env, DO NOT COMMIT
DATABASE_URL="postgres://user@localhost:5432/database?connection_limit=1"

AUTH0_DOMAIN="a-real.domain"
AUTH0_CLIENT_ID="a-real-client-id"
AUTH0_AUDIENCE="http://example.com"
AUTH0_REDIRECT_URI="http://example.com"
```

As a best practivce (and for this plugin to work properly), you need to define ***every** env neeeded for your app in `.env.defaults`.

This also helps developers know exactly which envs and settigns are needed to fully run and deploy the app.

Then you'll ensure that the envs gets included via your [`redwood.toml`](https://redwoodjs.com/docs/app-configuration-redwood-toml):

```
[web]
  port = 8910
  apiProxyPath = "/.netlify/functions"
  includeEnvironmentVariables = ['AUTH0_AUDIENCE','AUTH0_REDIRECT_URI','AUTH0_DOMAIN','AUTH0_CLIENT_ID']
[api]
  port = 8911
  includeEnvironmentVariables = ['DATABASE_URL','BINARY_TARGET']
[browser]
  open = true
```

Note: Defining the `api` side isn't needed to run the app, but helps to keep all in sync for the purposes of this plugin.

Now that the plugin knows the "expected env" as defined in `env.defaults` it can check that:

* Deploy env isn't missing any
* redwood.toml has included all of them
* redwood.toml hasn't included any ones no longer needed

See the Scenarios below.

## Usage

Add a [[plugins]] entry to your netlify.toml file.

Note since this package is not published, you'll have to use [File based installation](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation) and copy the contents of this repo to the root of your RedwoodJS app project.

```
[[plugins]]
package = './netlify-plugin-redwoodjs-env-validator'
```

## Local Use

You can [run builds in Netlify CLI](https://docs.netlify.com/cli/get-started/#run-builds-locally) to mimic the behavior of running a build on Netlify — including Build Plugins.

### Install Netlify CLI

```
# Install Netlify CLI globally
npm install netlify-cli -g

### OR use Yarn ### 
yarn global add netlify-cli
```

### Run Netlify builds locally

To execute a Netlify build locally, run the following command from the root of your project:

```
netlify build
```

If you'd like to get a summary of what a build will do without taking the time to do a full build, you can use the --dry flag:

```
netlify build --dry
```

## Scenarios

### No includeEnvironmentVariables set in redwood.toml

If the `includeEnvironmentVariables` in`redwood.toml` is empty,
that's strange because probably have at least set the
`DATABASE_URL` or `BINARY_TARGET` required by Prisma

#### Example

```
todo
```

### Missing includeEnvironmentVariables set in redwood.toml

There are expected envs, but some of them are not found in the `redwood.toml`

#### Example

```
todo
```

### Missing in Netlify's configured env

There are expected envs, but some of them are not found in Netlify's configured env

#### Example

```
todo
```

### Missing includeEnvironmentVariables in Netlify's configured env

There are envs defined in `redwood.toml`, but some of them are not found 
in Netlify's configured env.

#### Example

```
todo
```
