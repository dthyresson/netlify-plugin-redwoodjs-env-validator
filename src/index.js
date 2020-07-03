const fs = require('fs')
const path = require('path')

const dotenv = require('dotenv')
const { getConfig, getPaths } = require('@redwoodjs/internal')

const ENV_DEFAULTS = '.env.defaults'
const RW_TOML = 'redwood.toml'
const INTRO_MESSAGE =
  'Validating the environment configuration for RedwoodJS deployment to Netlify ...\n\n'
const EXPECTED_ENV_MESSAGE = `Expecting Netlify Environment settings to set envs defined in your RedwoodJS '${ENV_DEFAULTS}'.`
const RW_TOML_EMPTY_ERROR_MESSAGE = `Your '${RW_TOML}' has not included any envs on either the web or api side. Did you include your Prisma settings?`
const RW_MISSING_ERROR_MESSAGE = `Your '${ENV_DEFAULTS}' has configured envs, but the following are missing from your ${RW_TOML} 'includeEnvironmentVariables'`
const MISSING_NETLIFY_ERROR_MESSAGE = `Your '${ENV_DEFAULTS}' has configured envs, but the following are missing from Netlify's Deploy environment variables`
const MISSING_RW_NETLIFY_ERROR_MESSAGE = `Your '${RW_TOML}' has included envs, but the following are missing from Netlify's Deploy environment variables`
const SUCCESS_MESSAGE = '... ok!'

const errorMessage = ({ message, list }) => {
  return `${message}:\n\n${list.join('\n')}\n`
}

module.exports = {
  onPreBuild: ({ utils }) => {
    console.log(INTRO_MESSAGE)

    try {
      // Parse the .env.defaults to fetch the expected envs to find setup in
      // both the redwood.toml and Netlify environment config
      const dotenvPath = path.join(getPaths().base, ENV_DEFAULTS)
      const defaultEnv = fs.readFileSync(dotenvPath, { encoding: 'utf-8' })
      const expected = Object.keys(dotenv.parse(defaultEnv))

      console.log(EXPECTED_ENV_MESSAGE)
      console.log(`\n${expected.join('\n')}\n`)

      // Parse the RedwoodJS config (aka: `redwood.toml`)
      const rwConfig = getConfig()

      // Extract those env's set to be included by the RedwoodJS config
      // we're ok with duplicate defined envs in web and api ;)
      const rwWeb = rwConfig.web.includeEnvironmentVariables || []
      const rwApi = rwConfig.api.includeEnvironmentVariables || []
      const rwEnv = rwWeb.concat(rwApi)

      // Get the Netlify build (aka process) environment variables ...
      const netlifyEnv = Object.keys(process.env) || []

      // Scenario: If the 'redwood.toml' includeEnvironmentVariables is empty,
      // that's strange because probably have at least set the
      // DATABASE_URL or BINARY_TARGET required by Prisma
      if (rwEnv && rwEnv.length === 0) {
        throw RW_TOML_EMPTY_ERROR_MESSAGE
      }

      // Scenario: There are expected envs,
      // but some of them are not found in the redwood.toml
      const missingExpectedInRedwoodEnv = expected.filter(
        (x) => !rwEnv.includes(x)
      )

      if (
        missingExpectedInRedwoodEnv &&
        missingExpectedInRedwoodEnv.length > 0
      ) {
        throw errorMessage({
          message: RW_MISSING_ERROR_MESSAGE,
          list: missingExpectedInRedwoodEnv,
        })
      }

      // Scenario: There are expected envs,
      // but some of them are not found in Netlify's configured env
      const missingExpectedInNetlifyEnv = expected.filter(
        (x) => !netlifyEnv.includes(x)
      )

      if (
        missingExpectedInNetlifyEnv &&
        missingExpectedInNetlifyEnv.length > 0
      ) {
        throw errorMessage({
          message: MISSING_NETLIFY_ERROR_MESSAGE,
          list: missingExpectedInNetlifyEnv,
        })
      }

      // Scenario: There are envs defined in 'redwood.toml`,
      // but some of them are not found in Netlify's configured env
      const missingInNetlifyEnv = rwEnv.filter((x) => !netlifyEnv.includes(x))

      if (missingInNetlifyEnv && missingInNetlifyEnv.length > 0) {
        throw errorMessage({
          message: MISSING_RW_NETLIFY_ERROR_MESSAGE,
          list: missingInNetlifyEnv,
        })
      }

      console.log(SUCCESS_MESSAGE)
    } catch (error) {
      return utils.build.failBuild(error)
    }
  },
}
