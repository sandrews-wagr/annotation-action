function parseJSON(getInput, property) {
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

function parseInputs(getInput) {
  const repo = getInput('repo');
  const sha = getInput('sha');
  const token = getInput('token', {required: true});

  const name = getInput('name');
  const checkIDStr = getInput('check_id');

  const status = getInput('status', {required: true});
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