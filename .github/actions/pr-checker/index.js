const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)

    console.log(JSON.stringify(github.context, null, '\t'))

    // core.setOutput('pull-request', JSON.stringify(resp.data))
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
