const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const token = core.getInput('token')
    const title = core.getInput('title')
    const body = core.getInput('body')
    const assignees = core.getInput('assignees')

    const octokit = new github.Github(token)

    const resp = await octokit.issues.create({
      // next 2 lines are same as ...github.context.repo
      // owner: github.context.repo.owner,
      // repo: github.context.repo.repo,
      ...github.context.repo,
      title,
      body,
      assignees: assignees ? assignees.split(',') : undefined
    })

    core.setOutput('issue', JSON.stringify(resp.data))
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
