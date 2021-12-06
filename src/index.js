const core = require('@actions/core');
const github = require('@actions/github');

const run = () => {
  const token = core.getInput('GITHUB_TOKEN');

  // const oktokit = github.getOctokit(token);
  const { pull_request } = github.context.payload;

  console.log(pull_request);
};

run();