const { Application } = require('probot')
// Requiring our app implementation
const myProbotApp = require('../src').default

// const issuesOpenedPayload = require('./fixtures/issues.opened.json')
// const simplePullRequestOpened = require('./fixtures/simple.pullrequest.opened')

test('that we can run tests', () => {
  // your real tests go here
  expect(1 + 2 + 3).toBe(6)
})

describe('My Probot app', () => {
  let app, github

  beforeEach(() => {
    app = new Application()
    // Initialize the app based on the code from index.js
    app.load(myProbotApp)
    // This is an easy way to mock out the GitHub API
    github = {
      issues: {
        createComment: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    }
    // Passes the mocked out GitHub API into out app instance
    app.auth = () => Promise.resolve(github)
  })

  /*
  test('fetch files when an pull request is opened', async () => {
    await app.receive({
      name: 'pull_request.opened',
      payload: simplePullRequestOpened
    })

    expect(github.pullRequests.listFiles).toHaveBeenCalled()
  })
  */
})
