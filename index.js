const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
  const annotationsPath = core.getInput('annotations');
  const data = fs.readFileSync(annotationsPath, 'utf8')
  console.log(data)
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
