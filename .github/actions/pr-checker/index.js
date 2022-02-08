const core = require('@actions/core')
const github = require('@actions/github')

const TICKET_REGEX = /\[\w+-\d+\]/
const TICKET_BASE_URL = 'https://app.clickup.com/t/'
const LINKED_TICKET_REGEX = new RegExp(TICKET_BASE_URL)
const NOT_LINKED_TICKET_REGEX = /\[\w+-\d+\]\r?\n/

const SQUARE_BRACKETS_REGEX = /[\[\]]/g
const BYPASS_LABEL = 'no-ticket'
const SUCCESS_MESSAGE = 'Thank you for connection the PR with a ticket.'
const BYPASS_MESSAGE =
  'The label to bypass this check was found, no checks will be performed.'

const setErrorMessage = pullRequestType =>
  core.setFailed(
    `Please connect the PR's ${pullRequestType} to a ticket or add the "${BYPASS_LABEL}" label to bypass this check.`
  )
const setSuccessMessage = () => core.info('pull-request', SUCCESS_MESSAGE)
const setBypassMessage = () => core.info('pull-request', BYPASS_MESSAGE)

const linkTicketToBody = body => {
  const isAlreadyLinked = body.match(LINKED_TICKET_REGEX)
  if (isAlreadyLinked) {
    core.info('Skip linking, ticket is already linked.')
    return
  }

  const bodyMatch = body.match(NOT_LINKED_TICKET_REGEX)
  if (!bodyMatch) {
    core.warning('Could not link the ticket.')
    return
  }

  const ticketNumber = bodyMatch[0].trim().replace(SQUARE_BRACKETS_REGEX, '')

  return body.replace(
    NOT_LINKED_TICKET_REGEX,
    `[${ticketNumber}](${CLICKUP_URL + ticketNumber})`
  )
}

async function run() {
  try {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    const { body, title, labels, number } = github.context.payload.pull_request

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

    if (updatedBody) {
      const request = {
        ...github.context.repo,
        title,
        body: updatedBody,
        pull_number: number
      }
      const response = await octokit.rest.pulls.update(request)

      core.info(`Response: ${response.status}`)
      if (response.status !== 200) {
        core.error('Updating the pull request has failed')
      }
    }

    setSuccessMessage()
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
