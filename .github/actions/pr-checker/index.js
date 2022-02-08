const core = require('@actions/core')
const github = require('@actions/github')

const TICKET_REGEX = /\[\w+-\d+\]/
const BYPASS_LABEL = 'no-ticket'
const SUCCESS_MESSAGE = 'Thank you for connection the PR with a ticket.'

const getErrorMessage = pullRequestType =>
  `Please connect the PR's ${pullRequestType} to a ticket or add the "${BYPASS_LABEL}" label to bypass this check.`

async function run() {
  try {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    const { body, title, labels } = github.context.payload.pull_request
    console.log(JSON.stringify(labels, null, '\t'))
    console.log(JSON.stringify(github, null, '\t'))
    const titleMatches = title.match(TICKET_REGEX)
    const bodyMatches = body.match(TICKET_REGEX)

    if (!titleMatches) {
      core.setFailed(getErrorMessage('title'))
      return
    }

    if (!bodyMatches) {
      core.setFailed(getErrorMessage('body'))
      return
    }

    core.setOutput('pull-request', SUCCESS_MESSAGE)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
