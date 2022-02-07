const core = require('@actions/core')
const github = require('@actions/github')

try {
  // This will only work when ACTIONS_STEP_DEBUG secret is true
  core.debug('Some debug message')
  core.warning('Some warning message')
  core.error('Some error message')

  const name = core.getInput('who-to-greet')
  // this will log the name as ***
  core.setSecret(name)
  console.log(`Hello ${name}`)

  const time = new Date()
  core.setOutput('time', time.toTimeString())

  // This will create a group
  core.startGroup('Some log')
  console.log(JSON.stringify(github, null, '\t'))
  core.endGroup()

  // This will create an ENV variable that the workflow can use
  core.exportVariable('HELLO', 'hello')
} catch (error) {
  core.setFailed(error.message)
}
