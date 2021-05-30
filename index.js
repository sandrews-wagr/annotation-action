const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const prEvents = [
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
];

const parseJSON = (getInput, property) => {
    const value = getInput(property);
    if (!value) {
      return;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      const error = e;
      throw new Error(`invalid format for '${property}: ${error.toString()}`);
    }
  };

const parseInputs = (getInput) => {
    const repo = getInput('repo');
    const sha = getInput('sha');
    const token = getInput('token', {required: true});
  
    const name = getInput('name');
    const checkIDStr = getInput('check_id');
  
    let conclusion = getInput('conclusion');
  
    const actionURL = getInput('action_url');
    const detailsURL = getInput('details_url');
  
    if (repo && repo.split('/').length != 2) {
      throw new Error('repo needs to be in the {owner}/{repository} format');
    }
  
    if (name && checkIDStr) {
      throw new Error(`can only provide 'name' or 'check_id'`);
    }
  
    if (!name && !checkIDStr) {
      throw new Error(`must provide 'name' or 'check_id'`);
    }
  
    const checkID = checkIDStr ? parseInt(checkIDStr) : undefined;
  
    if (conclusion) {
      conclusion = conclusion.toLowerCase();
    }
  
    const output = parseJSON(getInput, 'output');
    const annotations = parseJSON(getInput, 'annotations');
    const images = parseJSON(getInput, 'images');
    const actions = parseJSON(getInput, 'actions');
  
    if ((!output || !output.summary) && (annotations || images)) {
      throw new Error(`missing value for 'output.summary'`);
    }
  
    return {
      repo,
      sha,
      name,
      token,
      status,
      conclusion,
  
      checkID,
  
      actionURL,
      detailsURL,
  
      output,
      annotations,
      images,
      actions,
    };
  };

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
async function run() {
    try {
    const annotationsPath = core.getInput('annotations');
    const data = fs.readFileSync(annotationsPath, 'utf8')
    console.log(data)

    console.log('Getting inputs')
    const inputs = parseInputs(core.getInput);

    console.log('Setting up octokit');
    const octokit = github.getOctokit(inputs.token);

    const ownership = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    };

    console.log('Getting SHA')
    const sha = getSHA(inputs.sha);

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
