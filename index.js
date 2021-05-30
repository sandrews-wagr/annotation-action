const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const prEvents = [
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
];

const getSHA = (inputSHA) => {
    let sha = github.context.sha;
    if (prEvents.includes(github.context.eventName)) {
        const pull = github.context.payload.pull_request;
        if (pull && pull.head.sha) {
          sha = pull.head.sha;
        }
    }
    if (inputSHA) {
        sha = inputSHA;
    }
    return sha;
};

try {
  const annotationsPath = core.getInput('annotations');
  const data = fs.readFileSync(annotationsPath, 'utf8')
  console.log(data)

  core.debug('Getting inputs');
  const inputs = parseInputs(core.getInput);

  core.debug('Setting up octokit');
  const octokit = github.getOctokit(inputs.token);

  const ownership = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  };

  const sha = getSHA(inputs.sha);

  if (inputs.repo) {
    const repo = inputs.repo.split('/');
    ownership.owner = repo[0];
    ownership.repo = repo[1];
  }

  const response = await octokit.request(`GET /repos/${ownership.owner}/${ownership.repo}/commits/${sha}/check-runs`, {
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'ref'
  })
  console.log(response);

} catch (error) {
  core.setFailed(error.message);
}
