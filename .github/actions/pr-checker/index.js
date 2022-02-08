const core = require('@actions/core')
const github = require('@actions/github')

const TICKET_REGEX = /\[\w+-\d+\]/
const SQUARE_BRACKETS_REGEX = /[\[\]]/g
const CLICKUP_URL = 'https://app.clickup.com/t/'
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

const linkTicketToBody = body => {
  const bodyMatch = body.match(TICKET_REGEX)
  if (!bodyMatch) {
    core.warning('Could not link the ticket. The ticket was not found on body')
    return
  }

  const ticketNumber = bodyMatch[0].replace(SQUARE_BRACKETS_REGEX, '')

  return body.replace(
    TICKET_REGEX,
    `[${ticketNumber}](${CLICKUP_URL + ticketNumber})`
  )
}

async function run() {
  try {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    const { body, title, labels } = github.context.payload.pull_request

    const shouldBypass = labels.map(label => label.name).includes(BYPASS_LABEL)
    const titleMatches = title.match(TICKET_REGEX)
    const bodyMatches = body.match(TICKET_REGEX)

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

    const updatedBody = linkTicketToBody(body)

    console.log(JSON.stringify(updatedBody, null, '\t'))

    setSuccessMessage()
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
