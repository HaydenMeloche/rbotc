/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on(['pull_request.opened', 'pull_request.synchronize', 'pull_request.edited'], async context => {

    app.log('PR recieved')
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const number = context.payload.number


    const comments = []
    let page = 0

    const files = await context.github.pullRequests.getFiles({
        owner,
        repo,
        number,
        headers: {accept: 'application/vnd.github.v3.diff'},
        page,
        per_page: 100
      })

    for (const file of files.data) {
      let currentPosition = 0

      console.log(file.filename)
    }
      
    
  })
}
