/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  // Your code here
  app.log('R Bot C has started')

  app.on(['pull_request.opened', 'pull_request.synchronize'], async context => {
    app.log('PR recieved')
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const number = context.payload.number
    let body;

    ({body} = context.payload.pull_request)

    if (body === undefined || body === null || body === "") {
      await context.github.issues.createComment(context.issue({body: "Please update the description of this PR with better documentations to help out other developers!"}))
    }

    const comments = []
    let page = 0

    const files = await context.github.pullRequests.listFiles({
      owner,
      repo,
      number,
      headers: {accept: 'application/vnd.github.v3.diff'},
      page,
      per_page: 100
    })

    for (const file of files.data) {
      let currentPosition = 0

      if (file.filename.endsWith('bootstrap.properties')) {
        const lines = file.patch.split('\n')
        for (const line of lines) {
          if (line.startsWith('+') && line.includes('spring.application.name')) {
            if (line.endsWith('quickstart-demo')) {
              comments.push({
                path: file.filename,
                position: currentPosition,
                body: 'Please update the application name'
              })
            }
          }
          currentPosition += 1
        }
      } else if (file.filename.endsWith('pom.xml')) {
        const lines = file.patch.split('\n')

        let parentFlag = false
        let eurekaFound = false
        let depedenciesLine = 0

        for (const line of lines) {

          if (line.startsWith('+') && line.includes('<parent>')) {
            parentFlag = true
            console.log('true')
          } else if (line.startsWith('+') && line.includes('</parent>')) {
            parentFlag = false
            console.log('false')
          } else if (line.startsWith('+') && line.includes('<version>') && parentFlag === true) {
            let currentVersion = line.split('<version>').pop().split('</version>')[0]
            console.log(':' + currentVersion)

            if (line.charAt(0) !== 4) {
              comments.push({
                path: file.filename,
                position: currentPosition,
                body: 'Please update to spring boot version 2.\n You can see a guide here: -insert tobias guide here-'
              })
            }
          } else {
            if (line.startsWith('+') && line.includes('spring-cloud-starter-netflix-eureka-client')) {
              eurekaFound = true
            } else if (line.startsWith('+') && line.includes('<dependencies>')) {
              depedenciesLine = currentPosition
            }
          }
          currentPosition += 1
        }

        if (!eurekaFound) {
          let message = `No eureka found. Please add the following dependency:\n
          \`<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
            </dependency>\`\n`
          comments.push({
            path: file.filename,
            position: depedenciesLine + 3,
            body: message
          })
        }
      }
    }

    if (comments.length) {
      await context.github.pullRequests.createReview({
        owner,
        repo,
        number,
        body: 'Please see the fixes pointed out below!',
        commit_id: context.payload.pull_request.head.sha,
        event: 'REQUEST_CHANGES',
        comments
      })
    }
  })
}
