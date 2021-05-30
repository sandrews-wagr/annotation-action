const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const prEvents = [
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
];

const getSHA = () => {
    let sha = github.context.sha;
    if (prEvents.includes(github.context.eventName)) {
        const pull = github.context.payload.pull_request;
        if (pull && pull.head.sha) {
          sha = pull.head.sha;
        }
    }
    return sha;
};

async function run() {
    try {
    const annotationsPath = core.getInput('annotations');
    const data = fs.readFileSync(annotationsPath, 'utf8')
    console.log(data)

    console.log('Getting inputs')
    const token = core.getInput('token');

    console.log('Setting up octokit');
    const octokit = github.getOctokit(token);

    const ownership = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    };

    console.log('Getting SHA')
    const sha = getSHA();

    if (inputs.repo) {
        const repo = inputs.repo.split('/');
        ownership.owner = repo[0];
        ownership.repo = repo[1];
    }

    console.log('Making Request...')
    const response = await octokit.request(`GET /repos/${ownership.owner}/${ownership.repo}/commits/${sha}/check-runs`, {
        owner: 'octocat',
        repo: 'hello-world',
        ref: 'ref'
    })
    console.log(response);

    } catch (error) {
    core.setFailed(error.message);
    }
}

run();
