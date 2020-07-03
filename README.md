# netlify-plugin-redwoodjs-env-validator
Validates RedwoodJS environment variables when deploying to Netlify.

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
