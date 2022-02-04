module.exports = {
  branches: ['master'],
  repositoryUrl: 'https://github.com/elviocb/ci-project',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github'
  ]
}
