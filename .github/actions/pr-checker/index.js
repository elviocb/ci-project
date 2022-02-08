const core = require('@actions/core')
const github = require('@actions/github')

const TICKET_REGEX = /\[\w+-\d+\]/
const BYPASS_LABEL = 'no-ticket'
const SUCCESS_MESSAGE = 'Thank you for connection the PR with a ticket.'
const BYPASS_MESSAGE =
  'The label to bypass this check was found, no checks will be performed.'

const setErrorMessage = pullRequestType =>
  core.setFailed(
    `Please connect the PR's ${pullRequestType} to a ticket or add the "${BYPASS_LABEL}" label to bypass this check.`
  )
const setSuccessMessage = () => core.setOutput('pull-request', SUCCESS_MESSAGE)
const setBypassMessage = () => core.setOutput('pull-request', BYPASS_MESSAGE)

async function run() {
  try {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    const { body, title, labels } = github.context.payload.pull_request
    console.log(JSON.stringify(labels, null, '\t'))
    console.log(JSON.stringify(github, null, '\t'))
    const shouldBypass = labels.map(label => label.name).includes(BYPASS_LABEL)
    const titleMatches = title.match(TICKET_REGEX)
    const bodyMatches = body.match(TICKET_REGEX)

    core.info('Output to the actions build log')
    core.notice('This is a message that will also emit an annotation')

    if (shouldBypass) {
      setBypassMessage()
      return
    }

    if (!titleMatches) {
      setErrorMessage('title')
      return
    }

    if (!bodyMatches) {
      setErrorMessage('body')
      return
    }

    setSuccessMessage()
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
